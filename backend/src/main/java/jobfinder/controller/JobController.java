package jobfinder.controller;
import jobfinder.model.dto.CursorPageResponse;
import jobfinder.model.dto.JobFilterRequest;
import jobfinder.model.dto.JobResponseDTO;
import jobfinder.servics.implemention.JobScraperService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

import static org.springframework.http.ResponseEntity.ok;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobScraperService jobScraperService;


    @PostMapping("/sync")
    public ResponseEntity<?> triggerSync(@RequestParam String keyword) {
        jobScraperService.scrapeAndSaveAllInOne(keyword);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "status", "Success",
                "message", "Scraping completed and data saved successfully.",
                "timestamp", LocalDateTime.now()
        ));
    }

    @GetMapping
    public ResponseEntity<CursorPageResponse<JobResponseDTO>> getAllJobs(
            @RequestParam(required = false) Long lastId,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(jobScraperService.getJobsAdvanced(lastId, size));
    }

    @GetMapping("/search")
    public ResponseEntity<CursorPageResponse<JobResponseDTO>> searchJobs(
            @RequestParam String title,
            @RequestParam String location,
            @RequestParam(required = false) Long lastId,
            @RequestParam(defaultValue = "10") int size) {
        return ok(jobScraperService.searchJobs(title, location, lastId, size));
    }

    /**
     * Advanced filtering endpoint using JPA Specifications.
     * All parameters are optional — only active filters are applied.
     *
     * GET /api/jobs/filter?title=engineer&location=cairo&postedAfter=2025-01-01&size=10&lastId=0
     */
    @GetMapping("/filter")
    public ResponseEntity<CursorPageResponse<JobResponseDTO>> filterJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate postedAfter,
            @RequestParam(required = false) String minSalary,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) Long lastId,
            @RequestParam(defaultValue = "10") int size
    ) {
        JobFilterRequest filter = new JobFilterRequest(title, location, minSalary, postedAfter, employmentType);
        return ok(jobScraperService.searchJobsByFilter(filter, lastId, size));
    }

    @PostMapping("/{id}/summarize")
    public ResponseEntity<Map<String, String>> summarizeJob(@PathVariable Long id) {
        String summary = jobScraperService.generateAiSummary(id);
        return ResponseEntity.ok(Map.of("summary", summary));
    }

}
