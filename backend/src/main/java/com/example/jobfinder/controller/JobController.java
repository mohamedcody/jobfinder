package jobfinder.controller;
import jobfinder.model.dto.CursorPageResponse;
import jobfinder.model.dto.JobResponseDTO;
import jobfinder.servics.implemention.JobScraperService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
        // Note: This is a blocking call currently.
        // In a real production app, this should be @Async.
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
    ){
        return ResponseEntity.ok(jobScraperService.getJobsAdvanced(lastId, size));
    }

    @GetMapping("/search")
    public ResponseEntity<CursorPageResponse<JobResponseDTO>> searchJobs(
            @RequestParam String title,
            @RequestParam(required = false) Long lastId,
            @RequestParam(defaultValue = "10") int size) {
        return ok(jobScraperService.searchJobs(title, lastId, size));
    }


}
