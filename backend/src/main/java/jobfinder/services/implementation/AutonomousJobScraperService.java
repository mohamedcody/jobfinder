package jobfinder.services.implementation;

import jakarta.transaction.Transactional;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
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
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
@Service
@RequiredArgsConstructor
public class AutonomousJobScraperService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final UserProfileRepository userProfileRepository;
    private final WebClient webClient;
    private final SemanticMatchingService semanticMatchingService;

    private final AtomicBoolean isApifyBlocked = new AtomicBoolean(false);
    private final AtomicBoolean isScrapingInProgress = new AtomicBoolean(false);

    @Value("${apify.token}")
    private String apifyToken;

    @Value("${apify.api.actor-url}")
    private String apifyActorUrl;

    @Value("${apify.api.status-url}")
    private String apifyStatusUrl;

    @Value("${apify.api.dataset-url}")
    private String apifyDatasetUrl;

    /**
     * This method runs automatically every 24 hours.
     * It looks at what jobs our users want, and starts scraping them one by one.
     * If our Apify account quota is finished (blocked), it stops.
     */
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

    /**
     * This is the main method that does everything for a single keyword.
     * 1. It locks the system so no one else can scrape at the same time.
     * 2. It starts the Apify scraper.
     * 3. It waits for it to finish.
     * 4. It gets the jobs and saves them to the database.
     * 5. Finally, it unlocks the system so it can be used again.
     */
    @CircuitBreaker(name = "apifyApi", fallbackMethod = "fallbackScrapeAndSaveAllInOne")
    public String scrapeAndSaveAllInOne(String keyword) {
        log.info("🚀 Starting comprehensive scraping process for keyword: {}", keyword);

        if (keyword == null || keyword.trim().isEmpty()) {
            throw new BaseException(ErrorCode.INVALID_INPUT, "Keyword cannot be empty.");
        }

        // 🔒 1. بنحاول نقفل السكرابر لو فاضي، لو لقیناه مشغول بنرفض الطلب فوراً
        if (!isScrapingInProgress.compareAndSet(false, true)) {
            log.warn("⚠️ A scraping process is already running. Request for keyword [{}] rejected.", keyword);
            throw new BaseException(ErrorCode.ALREADY_EXISTS, "The scraper is currently busy processing another request. Please try again later.");
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
        } finally {
            // 🔓 2. أول ما السكرابر يخلص (سواء نجح أو ضرب إيرور)، بنفتح القفل تاني عشان يستقبل كلمات جديدة
            isScrapingInProgress.set(false);
        }
    }
    /**
     * This sends a request to Apify to start searching for the given keyword on LinkedIn.
     */
    private Map<?, ?> startApifyScraper(String keyword) {
        String runUrl = apifyActorUrl + "?maxItems=10";
        String encodedKeyword = URLEncoder.encode(keyword.trim(), StandardCharsets.UTF_8);
        String searchUrl = "https://www.linkedin.com/jobs/search/?keywords=" + encodedKeyword + "&position=1&pageNum=0";

        Map<String, Object> input = new HashMap<>();
        input.put("urls", List.of(searchUrl));
        input.put("count", 10);
        input.put("scrapeCompany", true);

        log.info("🔍 Sending to Apify: URL={}, Input={}", runUrl, input);

        return webClient.post()
                .uri(runUrl)
                .header("Authorization", "Bearer " + apifyToken.trim())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(input)
                .retrieve()
                .onStatus(status -> status.isError(), response -> response.bodyToMono(String.class)
                        .flatMap(errorBody -> Mono.error(new BaseException(ErrorCode.EXTERNAL_API_ERROR, "Apify error: " + errorBody))))
                .bodyToMono(Map.class)
                .block();
    }
    /**
     * Since scraping takes time, this method waits and checks Apify every 5 seconds
     * until the job search is completely finished.
     */
    private void waitForRunToComplete(String runId) throws InterruptedException {
        String statusUrl = apifyStatusUrl + runId;
        int maxAttempts = 24;
        int attempts = 0;

        while (attempts < maxAttempts) {
            Map<?, ?> statusResponse = webClient.get()
                    .uri(statusUrl)
                    .header("Authorization", "Bearer " + apifyToken.trim())
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
    /**
     * After Apify is done, this method downloads the list of jobs it found.
     */
    private List<JobResponseDTO> fetchScrapedData(String datasetId) {
        String datasetUrl = apifyDatasetUrl + datasetId + "/items";
        return webClient.get()
                .uri(datasetUrl)
                .header("Authorization", "Bearer " + apifyToken.trim())
                .retrieve()
                .bodyToFlux(JobResponseDTO.class)
                .collectList()
                .block();
    }
    /**
     * This saves the new jobs to our database safely.
     * It checks if the job link or the company already exists so we don't save duplicates.
     */
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

            // Filter out only the new jobs that don't exist in our system yet
            List<JobResponseDTO> newJobsDto = jobList.stream()
                    .filter(dto -> dto.getLink() != null && !dto.getLink().isBlank() && !existingSet.contains(dto.getLink()))
                    .toList();

            if (newJobsDto.isEmpty()) {
                log.info("ℹ️ No new jobs found. All items already exist in the database.");
                return;
            }

            // =========================================================================
            // ✅ BUG FIX: Prevent duplicate company creation and DataIntegrity crashes
            // =========================================================================

            // Step 1: Collect all unique company names from the new incoming jobs
            Set<String> uniqueCompanyNames = new HashSet<>();
            for (JobResponseDTO dto : newJobsDto) {
                if (dto.getCompanyName() != null && !dto.getCompanyName().isBlank()) {
                    uniqueCompanyNames.add(dto.getCompanyName().trim());
                }
            }

            // Step 2: Fetch existing companies from DB and put them into a Map for fast lookup
            Map<String, CompanyEntity> companyMap = new HashMap<>();
            for (String name : uniqueCompanyNames) {
                companyRepository.findByName(name).ifPresent(c -> companyMap.put(name, c));
            }

            // Step 3: Identify missing companies, create them, and save them using Batch Save (saveAll)
            List<CompanyEntity> companiesToSave = new ArrayList<>();
            for (JobResponseDTO dto : newJobsDto) {
                String name = dto.getCompanyName();
                if (name != null && !name.isBlank()) {
                    String trimmedName = name.trim();
                    // If the company is not in our Map, create it now
                    if (!companyMap.containsKey(trimmedName)) {
                        CompanyEntity newCompany = CompanyEntity.builder()
                                .name(trimmedName)
                                .logoUrl(dto.getCompanyLogo())
                                .build();
                        companiesToSave.add(newCompany);
                        // Add a temporary reference to the map to avoid duplicate rows inside this loop
                        companyMap.put(trimmedName, newCompany);
                    }
                }
            }

            // Perform a safe batch save for all new companies and update our lookup map
            if (!companiesToSave.isEmpty()) {
                List<CompanyEntity> savedCompanies = companyRepository.saveAll(companiesToSave);
                for (CompanyEntity c : savedCompanies) {
                    companyMap.put(c.getName(), c);
                }
            }

            // Step 4: Map the new job DTOs to entities safely using our ready-to-use local map
            List<JobEntity> entities = newJobsDto.stream()
                    .map((JobResponseDTO dto) -> {
                        CompanyEntity company = null;
                        if (dto.getCompanyName() != null && !dto.getCompanyName().isBlank()) {
                            company = companyMap.get(dto.getCompanyName().trim());
                        }

                        String combinedText = (dto.getTitle() != null ? dto.getTitle() : "") + " " + 
                                              (dto.getDescriptionText() != null ? dto.getDescriptionText() : "");
                        float[] vector = semanticMatchingService.generateEmbedding(combinedText.trim());
                        
                        LocalDateTime generatedAt = null;
                        if (vector != null && vector.length > 0) {
                            generatedAt = LocalDateTime.now();
                        }

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
                                .embedding(vector)
                                .embeddingGeneratedAt(generatedAt)
                                .build();
                    }).toList();

            // Save all the processed jobs safely in bulk
            jobRepository.saveAll(entities);
            log.info("✅ Successfully saved {} new jobs.", entities.size());

        } catch (Exception e) {
            log.error("❌ Database persistence failed", e);
            throw new BaseException(ErrorCode.INTERNAL_ERROR, "Database persistence failed: " + e.getMessage());
        }
    }
    /**
     * This is our "Plan B" (Fallback).
     * If the Apify server is down or broken, this method runs to return a nice message
     * to the user instead of crashing our application.
     */
    public String fallbackScrapeAndSaveAllInOne(String keyword, Throwable t) {
        log.error("🛑 Apify API Circuit Breaker activated for keyword [{}]! Error: {}", keyword, t.getMessage());
        // إرجاع رسالة واضحة للمستخدم أن الخدمة غير متاحة حالياً
        return "The scraping service is temporarily unavailable due to high load or external API issues. Please try again later.";
    }

}

