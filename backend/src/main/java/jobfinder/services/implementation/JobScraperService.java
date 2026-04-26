package jobfinder.services.implementation;

import jobfinder.exception.BaseException;
import jobfinder.exception.ErrorCode;
import jobfinder.model.dto.CursorPageResponse;
import jobfinder.model.dto.JobFilterRequest;
import jobfinder.model.dto.JobResponseDTO;
import jobfinder.model.entity.CompanyEntity;
import jobfinder.model.entity.JobEntity;
import jobfinder.repository.CompanyRepository;
import jobfinder.repository.JobRepository;
import jobfinder.services.interfaces.JobInterface;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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
public class JobScraperService implements JobInterface {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final AiService aiService;
    private final WebClient webClient;
    private final CacheManager cacheManager;

    @Value("${apify.token}")
    private String apifyToken;

    @Transactional
    public String scrapeAndSaveAllInOne(String keyword) {

        log.info("🚀 Starting comprehensive scraping process for keyword: {}", keyword);

        if (keyword == null || keyword.trim().isEmpty()) {
            throw new BaseException(ErrorCode.INVALID_INPUT, "Keyword cannot be empty.");
        }

        try {
            String runUrl = "https://api.apify.com/v2/acts/curious_coder~linkedin-jobs-scraper/runs?token="
                    + apifyToken.trim();

            String encodedKeyword = URLEncoder.encode(keyword.trim(), StandardCharsets.UTF_8);
            String searchUrl = "https://www.linkedin.com/jobs/search/?keywords=" + encodedKeyword;

            Map<String, Object> input = Map.of(
                    "urls", List.of(searchUrl),
                    "limitPerQuery", 10,
                    "proxyConfiguration", Map.of("useApifyProxy", true));

            Map runResponse = webClient.post()
                    .uri(runUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(input)
                    .retrieve()
                    .onStatus(status -> status.isError(), response -> response.bodyToMono(String.class)
                            .flatMap(errorBody -> Mono.error(
                                    new BaseException(ErrorCode.EXTERNAL_API_ERROR, "Apify error: " + errorBody))))
                    .bodyToMono(Map.class)
                    .block();

            if (runResponse == null || !runResponse.containsKey("data")) {
                throw new BaseException(ErrorCode.EXTERNAL_API_ERROR, "Failed to receive valid response from Apify.");
            }

            Map dataPart = (Map) runResponse.get("data");
            String datasetId = (String) dataPart.get("defaultDatasetId");
            log.info("✅ Scraper started! Dataset ID: {}", datasetId);

            // Wait for items to be available
            Thread.sleep(15000);

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
            throw new BaseException(ErrorCode.INTERNAL_ERROR, "Process interrupted.");
        } catch (Exception e) {
            log.error("❌ Unexpected error during scraping: ", e);
            throw new BaseException(ErrorCode.INTERNAL_ERROR, "Scraping failed: " + e.getMessage());
        }
    }

    @Transactional
    public void saveScrapedData(List<JobResponseDTO> jobList) {

        try {
            log.info("💾 Attempting to save {} jobs to the database...", jobList.size());

            List<JobEntity> entities = jobList.stream()
                    .filter(dto -> dto.getLink() != null && !jobRepository.existsByJobUrl(dto.getLink()))
                    .map((JobResponseDTO dto) -> {
                        CompanyEntity company = companyRepository.findByName(dto.getCompanyName())
                                .orElseGet(() -> companyRepository.save(
                                        CompanyEntity.builder()
                                                .name(dto.getCompanyName())
                                                .logoUrl(dto.getCompanyLogo())
                                                .build()));

                        return JobEntity.builder()
                                .title(dto.getTitle())
                                .location(dto.getLocation())
                                .employmentType(dto.getEmploymentType())
                                .description(dto.getDescriptionText())
                                .salaryRange(dto.getSalaryRange())
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
                throw new BaseException(ErrorCode.DUPLICATE_JOB,
                        "All scraped jobs are already present in the database.");
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

    @Override
    @Cacheable(value = "jobs", key = "{'all', #lastId, #size}")
    public CursorPageResponse<JobResponseDTO> getJobsAdvanced(Long lastId, int size) {
        // getAllJobs is just searchJobsByFilter with an empty filter
        JobFilterRequest emptyFilter = new JobFilterRequest(null, null, null, null, null);
        return searchJobsByFilter(emptyFilter, lastId, size);
    }

    @Override
    public CursorPageResponse<JobResponseDTO> searchJobs(String title, String location, Long lastId, int size) {
        // searchJobs is just searchJobsByFilter with specific params
        JobFilterRequest filter = new JobFilterRequest(title, location, null, null, null);
        return searchJobsByFilter(filter, lastId, size);
    }

    @Override
    @Cacheable(value = "jobs", key = "{#filter.title(), #filter.location(), #filter.employmentType(), #filter.postedAfter(), #lastId, #size}")
    public CursorPageResponse<JobResponseDTO> searchJobsByFilter(JobFilterRequest filter, Long lastId, int size) {
        log.info("🚀 Sovereign Search applied: {}", filter);

        try {
            int limit = (size <= 0 || size > 100) ? 10 : size;
            
            // Use the Specification we refined to handle ordering and filtering consistently
            Specification<JobEntity> spec = JobSpecification.filterJobs(filter, lastId);
            
            List<JobEntity> jobList = jobRepository.findAll(
                spec, 
                PageRequest.of(0, limit + 1)
            ).getContent();

            if (jobList.isEmpty()) {
                return new CursorPageResponse<>(List.of(), limit, null, false);
            }

            boolean hasNext = jobList.size() > limit;
            List<JobEntity> finalContent = hasNext ? jobList.subList(0, limit) : jobList;
            Long nextCursor = finalContent.get(finalContent.size() - 1).getId();

            return new CursorPageResponse<>(
                    finalContent.stream().map(this::convertToDTO).toList(),
                    limit,
                    nextCursor,
                    hasNext);

        } catch (Exception e) {
            log.error("❌ Critical logic failure in search: ", e);
            throw new BaseException(ErrorCode.DATABASE_ERROR, "Search engine experienced a synchronization failure.");
        }
    }

    @Override
    @Transactional
    public String generateAiSummary(Long jobId) {
        JobEntity job = jobRepository.findById(jobId)
                .orElseThrow(() -> new BaseException(ErrorCode.JOB_NOT_FOUND, "Job not found with id: " + jobId));

        if (job.getAiSummary() != null && !job.getAiSummary().isEmpty()) {
            return job.getAiSummary();
        }

        String summary = aiService.summarizeJob(job.getDescription());
        job.setAiSummary(summary);
        jobRepository.save(job);

        return summary;
    }

    public void evictJobsCache() {
        var cache = cacheManager.getCache("jobs");
        if (cache != null) {
            cache.clear();
            log.info("🧹 Jobs cache evicted successfully.");
        }
    }

    private JobResponseDTO convertToDTO(JobEntity entity) {
        return JobResponseDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .location(entity.getLocation())
                .employmentType(entity.getEmploymentType())
                .salaryRange(entity.getSalaryRange())
                .descriptionText(entity.getDescription())
                .aiSummary(entity.getAiSummary())
                .link(entity.getJobUrl())
                .scrapedAt(entity.getScrapedAt())
                .companyName(entity.getCompany() != null ? entity.getCompany().getName() : "N/A")
                .companyLogo(entity.getCompany() != null ? entity.getCompany().getLogoUrl() : null)
                .build();
    }

}

    