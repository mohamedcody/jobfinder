package jobfinder.services.implementation;

import jakarta.transaction.Transactional;
import jobfinder.exception.BaseException;
import jobfinder.exception.ErrorCode;
import jobfinder.model.dto.JobResponseDTO;
import jobfinder.model.entity.CompanyEntity;
import jobfinder.model.entity.JobEntity;
import jobfinder.repository.CompanyRepository;
import jobfinder.repository.JobRepository;
import jobfinder.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
@Service
@RequiredArgsConstructor
public class AutonomousJobScraperService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final UserProfileRepository userProfileRepository;
    private final WebClient webClient;

    private final AtomicBoolean isApifyBlocked = new AtomicBoolean(false);

    @Value("${apify.token}")
    private String apifyToken;

    private static final String APIFY_ACTOR_URL = "https://api.apify.com/v2/acts/curious_coder~linkedin-jobs-scraper/runs";
    private static final String APIFY_RUN_STATUS_URL = "https://api.apify.com/v2/actor-runs/";
    private static final String APIFY_DATASET_URL = "https://api.apify.com/v2/datasets/";

    // Executes every 24 hours
    @Scheduled(fixedDelay = 86400000)
    public void scheduledScrapeTask() {
        if (isApifyBlocked.get()) {
            log.warn("⚠️ Scraping is currently paused due to Apify quota exhaustion. Please top up your account.");
            return;
        }

        log.info("⏰ Starting scheduled autonomous scraping...");

        List<String> keywords = userProfileRepository.findDistinctCurrentJobTitles();

        if (keywords.isEmpty()) {
            log.info("ℹ️ No keywords found in database to scrape.");
            return;
        }

        for (String keyword : keywords) {
            if (isApifyBlocked.get()) {
                log.warn("⚠️ Stopping scheduled task early because Apify quota is exhausted.");
                break;
            }
            try {
                scrapeAndSaveAllInOne(keyword);
            } catch (Exception e) {
                if (e.getMessage() != null && e.getMessage().contains("Monthly usage hard limit exceeded")) {
                    isApifyBlocked.set(true);
                    log.error("🛑 Hard limit exceeded! Scraping service has been disabled.");
                    break;
                } else {
                    log.error("❌ Failed to scrape for keyword: {}. Error: {}", keyword, e.getMessage());
                }
            }
        }
        log.info("✅ Scheduled scraping task completed.");
    }

    public String scrapeAndSaveAllInOne(String keyword) {
        log.info("🚀 Starting comprehensive scraping process for keyword: {}", keyword);

        if (keyword == null || keyword.trim().isEmpty()) {
            throw new BaseException(ErrorCode.INVALID_INPUT, "Keyword cannot be empty.");
        }

        try {
            Map<?, ?> runResponse = startApifyScraper(keyword);
            
            if (runResponse == null || !runResponse.containsKey("data")) {
                throw new BaseException(ErrorCode.EXTERNAL_API_ERROR, "Failed to receive valid response from Apify.");
            }

            Map<?, ?> dataPart = (Map<?, ?>) runResponse.get("data");
            String runId = (String) dataPart.get("id");
            String datasetId = (String) dataPart.get("defaultDatasetId");
            log.info("✅ Scraper started! Run ID: {}, Dataset ID: {}", runId, datasetId);

            waitForRunToComplete(runId);

            List<JobResponseDTO> items = fetchScrapedData(datasetId);

            if (items == null || items.isEmpty()) {
                log.info("ℹ️ No jobs found on LinkedIn for keyword: {}", keyword);
                return "No jobs found for keyword: " + keyword;
            }

            saveScrapedData(items);
            return "Successfully saved " + items.size() + " jobs.";

        } catch (BaseException e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BaseException(ErrorCode.INTERNAL_ERROR, "Scraping process was interrupted.");
        } catch (Exception e) {
            log.error("❌ Unexpected error during scraping for keyword [{}]: ", keyword, e);
            throw new BaseException(ErrorCode.INTERNAL_ERROR, "Scraping failed: " + e.getMessage());
        }
    }

    private Map<?, ?> startApifyScraper(String keyword) {
        String runUrl = APIFY_ACTOR_URL + "?token=" + apifyToken.trim();
        String encodedKeyword = URLEncoder.encode(keyword.trim(), StandardCharsets.UTF_8);
        String searchUrl = "https://www.linkedin.com/jobs/search/?keywords=" + encodedKeyword;

        Map<String, Object> input = Map.of(
                "urls", List.of(searchUrl),
                "limitPerQuery", 10,
                "proxyConfiguration", Map.of("useApifyProxy", true)
        );

        return webClient.post()
                .uri(runUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(input)
                .retrieve()
                .onStatus(status -> status.isError(), response -> response.bodyToMono(String.class)
                        .flatMap(errorBody -> Mono.error(new BaseException(ErrorCode.EXTERNAL_API_ERROR, "Apify error: " + errorBody))))
                .bodyToMono(Map.class)
                .block();
    }

    private void waitForRunToComplete(String runId) throws InterruptedException {
        String statusUrl = APIFY_RUN_STATUS_URL + runId + "?token=" + apifyToken.trim();
        int maxAttempts = 24; // 2 minutes max (24 * 5 seconds)
        int attempts = 0;

        while (attempts < maxAttempts) {
            Map<?, ?> statusResponse = webClient.get()
                    .uri(statusUrl)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (statusResponse != null && statusResponse.containsKey("data")) {
                Map<?, ?> data = (Map<?, ?>) statusResponse.get("data");
                String status = (String) data.get("status");
                
                log.info("⏳ Run {} status: {}", runId, status);

                if ("SUCCEEDED".equalsIgnoreCase(status)) {
                    return;
                } else if ("FAILED".equalsIgnoreCase(status) || "ABORTED".equalsIgnoreCase(status) || "TIMED-OUT".equalsIgnoreCase(status)) {
                    throw new BaseException(ErrorCode.EXTERNAL_API_ERROR, "Apify run did not succeed. Final status: " + status);
                }
            }

            attempts++;
            Thread.sleep(5000); // Wait 5 seconds before polling again
        }

        log.warn("⚠️ Polling timed out for run {}", runId);
    }

    private List<JobResponseDTO> fetchScrapedData(String datasetId) {
        String datasetUrl = APIFY_DATASET_URL + datasetId + "/items?token=" + apifyToken.trim();
        return webClient.get()
                .uri(datasetUrl)
                .retrieve()
                .bodyToFlux(JobResponseDTO.class)
                .collectList()
                .block();
    }

    @Transactional
    public void saveScrapedData(List<JobResponseDTO> jobList) {
        try {
            log.info("💾 Attempting to save {} jobs to the database...", jobList.size());

            List<String> links = jobList.stream()
                    .map(JobResponseDTO::getLink)
                    .filter(link -> link != null && !link.isBlank())
                    .toList();
                    
            if (links.isEmpty()) {
                log.warn("⚠️ No valid job links found in the scraped data.");
                return;
            }

            List<String> existingLinks = jobRepository.findExistingLinks(links);
            Set<String> existingSet = new HashSet<>(existingLinks);

            List<JobEntity> entities = jobList.stream()
                    .filter(dto -> dto.getLink() != null && !dto.getLink().isBlank() && !existingSet.contains(dto.getLink()))
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
                    }).toList();

            if (entities.isEmpty()) {
                log.info("ℹ️ No new jobs found. All items already exist in the database.");
                return;
            }

            jobRepository.saveAll(entities);
            log.info("✅ Successfully saved {} new jobs.", entities.size());

        } catch (Exception e) {
            log.error("❌ Database persistence failed", e);
            throw new BaseException(ErrorCode.INTERNAL_ERROR, "Database persistence failed: " + e.getMessage());
        }
    }
}

