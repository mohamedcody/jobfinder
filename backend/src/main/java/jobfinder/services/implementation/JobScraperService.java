package jobfinder.services.implementation;

import jobfinder.exception.BaseException;
import jobfinder.exception.ErrorCode;
import jobfinder.model.dto.CursorPageResponseDto;
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
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobScraperService implements JobInterface {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final AiService aiService;
    private final CacheManager cacheManager;


    @Override
    @Cacheable(
            value = "jobs",
            key = "'all_' + #lastId + '_' + #size",
            cacheManager = "cacheManager"
    )
    public CursorPageResponseDto<JobResponseDTO> getJobsAdvanced(Long lastId, int size) {
        JobFilterRequest emptyFilter = new JobFilterRequest(null, null, null, null, null);
        return searchJobsByFilter(emptyFilter, lastId, size);
    }


    @Override
    public CursorPageResponseDto<JobResponseDTO> searchJobs(String title, String location, Long lastId, int size) {
        // تنظيف البحث
        String sanitizedTitle = sanitizeSearchTerm(title);

        if (sanitizedTitle == null || sanitizedTitle.isBlank()) {
            return new CursorPageResponseDto<>(List.of(), 0, null, false);
        }

        try {

            List<JobEntity> results = jobRepository.searchJobsFullText(
                    sanitizedTitle,
                    location,
                    lastId,
                    size + 1
            );

            boolean hasNext = results.size() > size;
            List<JobEntity> pageData = hasNext ? results.subList(0, size) : results;


            List<JobResponseDTO> dtos = pageData.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            Long nextCursor = (hasNext && !pageData.isEmpty())
                    ? pageData.get(pageData.size() - 1).getId()
                    : null;

            log.info("🔍 Search completed: {} results, hasNext: {}", dtos.size(), hasNext);
            return new CursorPageResponseDto<>(dtos, dtos.size(), nextCursor, hasNext);

        } catch (Exception e) {
            log.error("❌ Search failed: ", e);
            throw new BaseException(ErrorCode.DATABASE_ERROR, "Search failed: " + e.getMessage());
        }
    }


    @Override
    @Cacheable(
            value = "jobs",
            key = "#filter.title() + '_' + #filter.location() + '_' + #filter.employmentType() + '_' + #lastId + '_' + #size",
            cacheManager = "cacheManager"
    )
    public CursorPageResponseDto<JobResponseDTO> searchJobsByFilter(JobFilterRequest filter, Long lastId, int size) {
        log.info("🚀 Filtered search: {}", filter);

        try {
            int limit = Math.min(Math.max(size, 1), 100); // 1-100 max


            Specification<JobEntity> spec = JobSpecification.filterJobs(filter, lastId);

            List<JobEntity> jobList = jobRepository.findAll(
                    spec,
                    PageRequest.of(0, limit + 1)
            ).getContent();

            if (jobList.isEmpty()) {
                return new CursorPageResponseDto<>(List.of(), 0, null, false);
            }

            boolean hasNext = jobList.size() > limit;
            List<JobEntity> finalContent = hasNext
                    ? jobList.subList(0, limit)
                    : jobList;

            List<JobResponseDTO> dtos = finalContent.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            Long nextCursor = !finalContent.isEmpty()
                    ? finalContent.get(finalContent.size() - 1).getId()
                    : null;

            return new CursorPageResponseDto<>(dtos, limit, nextCursor, hasNext);

        } catch (Exception e) {
            log.error("❌ Filter search failed: ", e);
            throw new BaseException(ErrorCode.DATABASE_ERROR, "Filter search failed: " + e.getMessage());
        }
    }

    public CursorPageResponseDto<JobResponseDTO> getRecentJobs(LocalDateTime since, Long lastId, int size) {
        int limit = Math.min(Math.max(size, 1), 100);

        List<JobEntity> jobs = jobRepository.findRecentActiveJobs(
                since,
                PageRequest.of(0, limit + 1)
        );

        boolean hasNext = jobs.size() > limit;
        List<JobEntity> pageData = hasNext ? jobs.subList(0, limit) : jobs;

        List<JobResponseDTO> dtos = pageData.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        Long nextCursor = !pageData.isEmpty()
                ? pageData.get(pageData.size() - 1).getId()
                : null;

        return new CursorPageResponseDto<>(dtos, limit, nextCursor, hasNext);
    }


    @Override
    @Transactional
    @CacheEvict(value = "jobs", allEntries = true)
    public String generateAiSummary(Long jobId) {
        JobEntity job = jobRepository.findById(jobId)
                .orElseThrow(() -> new BaseException(
                        ErrorCode.JOB_NOT_FOUND,
                        "Job not found: " + jobId
                ));

        // لو كان في summary بالفعل
        if (job.getAiSummary() != null && !job.getAiSummary().isBlank()) {
            return job.getAiSummary();
        }

        // توليد Summary باستخدام AI
        String summary = aiService.summarizeJob(job.getDescription());
        job.setAiSummary(summary);
        jobRepository.save(job);

        log.info("✅ AI Summary generated for job: {}", jobId);
        return summary;
    }

    public void evictJobsCache() {
        var cache = cacheManager.getCache("jobs");
        if (cache != null) {
            cache.clear();
            log.info("🧹 Jobs cache cleared");
        }
    }


    private JobResponseDTO convertToDTO(JobEntity entity) {
        String companyName = "Unknown";
        String companyLogo = null;

        if (entity.getCompany() != null) {
            companyName = entity.getCompany().getName();
            companyLogo = entity.getCompany().getLogoUrl();
        }

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
                .companyName(companyName)
                .companyLogo(companyLogo)
                .build();
    }


    private String sanitizeSearchTerm(String term) {
        if (term == null || term.isBlank()) {
            return null;
        }

        String sanitized = term.trim();


        sanitized = sanitized.replaceAll("[!&|():*\"\\\\]", " ");


        if (sanitized.length() > 100) {
            sanitized = sanitized.substring(0, 100);
        }

        return sanitized.isBlank() ? null : sanitized;
    }
}