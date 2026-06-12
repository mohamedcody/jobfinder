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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.MediaType;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class JobScraperService implements JobInterface {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final AiService aiService;
    private final WebClient webClient;
    private final CacheManager cacheManager;

    @Override
    @Cacheable(value = "jobs", key = "{'all', #lastId, #size}")
    public CursorPageResponseDto<JobResponseDTO> getJobsAdvanced(Long lastId, int size) {
        JobFilterRequest emptyFilter = new JobFilterRequest(null, null, null, null, null);
        return searchJobsByFilter(emptyFilter, lastId, size);
    }

    @Override
    public CursorPageResponseDto<JobResponseDTO> searchJobs(String title, String location, Long lastId, int size) {
        String sanitizedTitle = (title == null || title.isBlank()) ? null : title.trim().replaceAll("[!&|():*]", " ");

        if (sanitizedTitle == null) {
            return new CursorPageResponseDto<>(List.of(), 0, null, false);
        }

        List<JobEntity> results = jobRepository.searchJobsFullText(sanitizedTitle, location, lastId, size + 1);
        boolean hasNext = results.size() > size;
        List<JobEntity> pageData = hasNext ? results.subList(0, size) : results;
        List<JobResponseDTO> dtos = pageData.stream().map(this::convertToDTO).toList();
        Long nextCursor = (hasNext && !pageData.isEmpty()) ? pageData.get(pageData.size() - 1).getId() : null;

        return new CursorPageResponseDto<>(dtos, dtos.size(), nextCursor, hasNext);
    }

    @Override
    @Cacheable(value = "jobs", key = "{#filter.title(), #filter.location(), #filter.employmentType(), #filter.postedAfter(), #lastId, #size}")
    public CursorPageResponseDto<JobResponseDTO> searchJobsByFilter(JobFilterRequest filter, Long lastId, int size) {
        log.info("🚀 Sovereign Search applied: {}", filter);
        try {
            int limit = (size <= 0 || size > 100) ? 10 : size;

            Specification<JobEntity> spec = JobSpecification.filterJobs(filter, lastId);

            List<JobEntity> jobList = jobRepository.findAll(spec, PageRequest.of(0, limit + 1)).getContent();

            if (jobList.isEmpty()) {
                return new CursorPageResponseDto<>(List.of(), limit, null, false);
            }

            boolean hasNext = jobList.size() > limit;
            List<JobEntity> finalContent = hasNext ? jobList.subList(0, limit) : jobList;
            Long nextCursor = finalContent.get(finalContent.size() - 1).getId();

            return new CursorPageResponseDto<>(finalContent.stream().map(this::convertToDTO).toList(), limit, nextCursor, hasNext);

        } catch (Exception e) {
            log.error("❌ Critical logic failure in search: ", e);
            throw new BaseException(ErrorCode.DATABASE_ERROR, "Search engine experienced a synchronization failure.");
        }
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "jobs", allEntries = true)
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

    