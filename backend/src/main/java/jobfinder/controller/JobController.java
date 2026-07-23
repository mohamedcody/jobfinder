package jobfinder.controller;
import io.swagger.v3.oas.annotations.tags.Tag;
import jobfinder.model.dto.CursorPageResponseDto;
import jobfinder.model.dto.JobFilterRequest;
import jobfinder.model.dto.JobResponseDTO;
import jobfinder.services.implementation.JobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;
import org.springframework.security.core.Authentication;

import static org.springframework.http.ResponseEntity.ok;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Validated
@Slf4j
@Tag(name = "Jobs", description = "Job search, filtering, and AI summarization endpoints")
public class JobController {

    private final JobService jobScraperService;

    @GetMapping
    public ResponseEntity<CursorPageResponseDto<JobResponseDTO>> getAllJobs(
            @RequestParam(required = false) Long lastId,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size
    ) {
        log.debug("GET /api/jobs lastId={} size={}", lastId, size);
        return ResponseEntity.ok(jobScraperService.getJobsAdvanced(lastId, size));
    }

    /**
     * @deprecated Prefer {@code /api/jobs/filter} which supports all filter parameters.
     * This endpoint is kept for backward compatibility and may be removed in a future release.
     */
    @Deprecated
    @GetMapping("/search")
    public ResponseEntity<CursorPageResponseDto<JobResponseDTO>> searchJobs(
            @RequestParam String title,
            @RequestParam String location,
            @RequestParam(required = false) Long lastId,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {
        log.debug("GET /api/jobs/search (deprecated) title='{}' location='{}' lastId={} size={}", title, location, lastId, size);
        return ok(jobScraperService.searchJobs(title, location, lastId, size));
    }


    /**
     * Advanced filtering endpoint using JPA Specifications.
     * All parameters are optional — only active filters are applied.
     *
     * GET /api/jobs/filter?title=engineer&location=cairo&postedAfter=2025-01-01&size=10&lastId=0
     */

    @GetMapping("/filter")
    public ResponseEntity<CursorPageResponseDto<JobResponseDTO>> filterJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate postedAfter,
            @RequestParam(required = false) String minSalary,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) Long lastId,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "false") boolean refresh,
            Authentication authentication
    ) {
        log.debug("GET /api/jobs/filter title='{}' location='{}' employmentType='{}' lastId={} size={} refresh={}",
                title, location, employmentType, lastId, size, refresh);
        if (refresh) {
            if (authentication == null || authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                log.warn("Cache eviction attempted by non-admin user.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            log.info("Admin triggered cache eviction for jobs.");
            jobScraperService.evictJobsCache();
        }
        JobFilterRequest filter = new JobFilterRequest(title, location, minSalary, postedAfter, employmentType);
        return ok(jobScraperService.searchJobsByFilter(filter, lastId, size));
    }


    @PostMapping("/{id}/summarize")
    public ResponseEntity<Map<String, String>> summarizeJob(@PathVariable Long id) {
        log.info("POST /api/jobs/{}/summarize", id);
        String summary = jobScraperService.generateAiSummary(id);
        return ResponseEntity.ok(Map.of("summary", summary));
    }


}

