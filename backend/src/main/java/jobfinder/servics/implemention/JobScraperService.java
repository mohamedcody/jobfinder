package jobfinder.servics.implemention;
import jobfinder.exception.BaseException;
import jobfinder.exception.ErrorCode;
import jobfinder.model.dto.CursorPageResponse;
import jobfinder.model.dto.JobResponseDTO;
import jobfinder.model.entity.CompanyEntity;
import jobfinder.model.entity.JobEntity;
import jobfinder.repository.CompanyRepository;
import jobfinder.repository.JobRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;




@Slf4j
@Service
@RequiredArgsConstructor
public class JobScraperService {


    private final JobRepository jobRepository;// call the repo jobs in database
    private final CompanyRepository companyRepository; // call the repo company in database
    private final WebClient webClient = WebClient.create();  // call by apify

    @Value("${apify.token}")
    private String apifyToken;


    @Transactional
    public String scrapeAndSaveAllInOne(String keyword) {

        log.info("🚀 Starting comprehensive scraping process for keyword: {}", keyword);

        // ✅ الـ ErrorCode الصح INVALID_INPUT مش JOB_NOT_FOUND
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new BaseException(ErrorCode.INVALID_INPUT, "Keyword cannot be empty.");
        }

        try {
            String runUrl = "https://api.apify.com/v2/acts/curious_coder~linkedin-jobs-scraper/runs?token=" + apifyToken.trim();

            // ✅ keyword اتعمله URL encode
            String encodedKeyword = URLEncoder.encode(keyword.trim(), StandardCharsets.UTF_8);
            String searchUrl = "https://www.linkedin.com/jobs/search/?keywords=" + encodedKeyword;

            Map<String, Object> input = Map.of(
                    "urls", List.of(searchUrl),
                    "limitPerQuery", 10,
                    "proxyConfiguration", Map.of("useApifyProxy", true)
            );

            // ✅ flatMap + Mono.error عشان الـ exception تترمي صح
            Map runResponse = webClient.post()
                    .uri(runUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(input)
                    .retrieve()
                    .onStatus(status -> status.isError(), response ->
                            response.bodyToMono(String.class).flatMap(errorBody ->
                                    Mono.error(new BaseException(ErrorCode.EXTERNAL_API_ERROR, "Apify error: " + errorBody)))
                    )
                    .bodyToMono(Map.class)
                    .block();

            if (runResponse == null || !runResponse.containsKey("data")) {
                throw new BaseException(ErrorCode.EXTERNAL_API_ERROR, "Failed to receive valid response from Apify.");
            }

            Map dataPart = (Map) runResponse.get("data");
            String datasetId = (String) dataPart.get("defaultDatasetId");
            log.info("✅ الأكتور بدأ! الـ Dataset ID: {}", datasetId);

            Thread.sleep(30000);

            String datasetUrl = "https://api.apify.com/v2/datasets/" + datasetId + "/items?token=" + apifyToken.trim();
            List<JobResponseDTO> items = webClient.get()
                    .uri(datasetUrl)
                    .retrieve()
                    .bodyToFlux(JobResponseDTO.class)
                    .collectList()
                    .block();

            if (items == null || items.isEmpty()) {
                throw new BaseException(ErrorCode.JOB_NOT_FOUND, "No jobs found for keyword: " + keyword);
            }

            saveScrapedData(items);
            return "Successfully saved " + items.size() + " jobs.";

        } catch (BaseException e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BaseException(ErrorCode.INTERNAL_ERROR, "Thread interrupted while waiting for data.");
        } catch (Exception e) {
            log.error("❌ Unexpected error during scraping: ", e);
            throw new BaseException(ErrorCode.INTERNAL_ERROR, "A technical error occurred: " + e.getMessage());
        }
    }

    @Transactional
    public void saveScrapedData(List<JobResponseDTO> jobList) {

        try {
            log.info("💾 Attempting to save {} jobs to the database...", jobList.size());

            List<JobEntity> entities = jobList.stream()
                    .filter(dto -> dto.getLink() != null && !jobRepository.existsByJobUrl(dto.getLink()))
                    .map(dto -> {
                        CompanyEntity company = companyRepository.findByName(dto.getCompanyName())
                                .orElseGet(() -> companyRepository.save(
                                        CompanyEntity.builder()
                                                .name(dto.getCompanyName())
                                                .logoUrl(dto.getCompanyLogo())
                                                .build()
                                ));

                        return JobEntity.builder()
                                .title(dto.getTitle())
                                .location(dto.getLocation())
                                .description(dto.getDescriptionText())
                                .jobUrl(dto.getLink())
                                .company(company)
                                .isActive(true)
                                .source("LinkedIn")
                                .scrapedAt(LocalDateTime.now())
                                .build();
                    })
                    .toList();

            if (entities.isEmpty()) {
                log.warn("⚠️ No new jobs found. All items already exist in the database.");
                throw new BaseException(ErrorCode.DUPLICATE_JOB, "All scraped jobs are already present in the database.");
            }

            jobRepository.saveAll(entities);
            log.info("✅ Successfully saved {} new jobs.", entities.size());

        } catch (BaseException ex) {
            throw ex;
        } catch (Exception e) {
            log.error("❌ Database persistence failed", e);
            throw new BaseException(ErrorCode.DATABASE_ERROR, "Internal database error during saving.");
        }
    }

    public CursorPageResponse<JobResponseDTO> getJobsAdvanced(Long lastId, int size) {

        log.info("🔍 Fetching jobs - Start ID: {}, Page size: {}", lastId, size);

        try {
            // ✅ null check قبل < 0
            if (lastId != null && lastId < 0) {
                throw new BaseException(ErrorCode.INVALID_INPUT, "lastId cannot be negative: " + lastId);
            }

            if (size <= 0 || size > 100) {
                log.warn("⚠️ Warning: Invalid page size ({}), defaulting to 10", size);
                size = 10;
            }

            Long startId = (lastId != null) ? lastId : 0L;

            List<JobEntity> jobEntities = jobRepository.findFirst11ByIdGreaterThanOrderByIdAsc(startId);

            if (jobEntities.isEmpty()) {
                log.info("📭 No jobs available for the current request.");
                if (startId == 0) {
                    throw new BaseException(ErrorCode.JOB_NOT_FOUND, "The database is currently empty.");
                }
                return new CursorPageResponse<>(List.of(), size, null, false);
            }

            boolean hasNext = jobEntities.size() > size;
            List<JobEntity> finalContent = hasNext ? jobEntities.subList(0, size) : jobEntities;
            Long nextCursor = finalContent.get(finalContent.size() - 1).getId();

            log.info("✅ Successfully retrieved {} jobs. Next cursor: {}", finalContent.size(), nextCursor);

            return new CursorPageResponse<>(
                    finalContent.stream().map(this::convertToDTO).toList(),
                    size,
                    nextCursor,
                    hasNext
            );

        } catch (BaseException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Technical error during pagination: ", e);
            throw new BaseException(ErrorCode.DATABASE_ERROR, "Error loading jobs. Please try again later.");
        }
    }

    public CursorPageResponse<JobResponseDTO> searchJobs(String title, Long lastId, int size) {

        log.info("🔍 Searching for jobs with title: '{}' - Start ID: {}, Size: {}", title, lastId, size);

        try {
            if (title == null || title.trim().isEmpty()) {
                throw new BaseException(ErrorCode.INVALID_INPUT, "Search keyword is missing.");
            }

            if (lastId != null && lastId < 0) {
                throw new BaseException(ErrorCode.INVALID_INPUT, "lastId cannot be negative: " + lastId);
            }

            if (size <= 0 || size > 100) {
                log.warn("⚠️ Warning: Invalid page size ({}), defaulting to 10", size);
                size = 10;
            }

            Long startId = (lastId == null) ? 0L : lastId;

            List<JobEntity> jobList = jobRepository.findByTitleContainingIgnoreCaseAndIdGreaterThanOrderByIdAsc(
                    title, startId, PageRequest.of(0, size + 1));

            if (jobList.isEmpty()) {
                log.info("📭 No jobs found matching title: {}", title);
                if (startId == 0) {
                    throw new BaseException(ErrorCode.JOB_NOT_FOUND, "No jobs found matching your search: " + title);
                }
                return new CursorPageResponse<>(List.of(), size, null, false);
            }

            boolean hasNext = jobList.size() > size;
            List<JobEntity> finalContent = hasNext ? jobList.subList(0, size) : jobList;
            Long nextCursor = finalContent.get(finalContent.size() - 1).getId();

            log.info("✅ Found {} jobs. Next cursor: {}", finalContent.size(), nextCursor);

            return new CursorPageResponse<>(
                    finalContent.stream().map(this::convertToDTO).toList(),
                    size,
                    nextCursor,
                    hasNext
            );

        } catch (BaseException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Unexpected error during search: ", e);
            throw new BaseException(ErrorCode.DATABASE_ERROR, "An unexpected error occurred during search.");
        }
    }

    private JobResponseDTO convertToDTO(JobEntity entity) {
        return JobResponseDTO.builder()
                .title(entity.getTitle())
                .location(entity.getLocation())
                .descriptionText(entity.getDescription())
                .link(entity.getJobUrl())
                .scrapedAt(entity.getScrapedAt())
                .companyName(entity.getCompany() != null ? entity.getCompany().getName() : "N/A")
                .companyLogo(entity.getCompany() != null ? entity.getCompany().getLogoUrl() : null)
                .build();
    }
}





