package jobfinder.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jobfinder.model.dto.SavedJobResponse;
import jobfinder.model.dto.SaveJobRequest;
import jobfinder.services.interfaces.jobSaveInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-jobs")
@RequiredArgsConstructor
@Tag(name = "Saved Jobs", description = "Save and manage your favourite job listings")
public class SavedJobController {

    private final jobSaveInterface savedJobService;

    @Operation(summary = "Save a job")
    @PostMapping("/{jobId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SavedJobResponse> saveJob(
            @PathVariable Long jobId,
            // ✅ @Valid جديدة: بتفعّل الـ @Size(max = 500) على notes في SaveJobRequest
            // فبقى الرد 400 برسالة واضحة بدل ما يطلع DB error غامض لو الـ notes طويلة
            @Valid @RequestBody(required = false) SaveJobRequest request) {
        return ResponseEntity.ok(savedJobService.saveJob(jobId, request));
    }

    @Operation(summary = "Unsave a job")
    @DeleteMapping("/{jobId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> unSaveJob(@PathVariable Long jobId) {
        savedJobService.unSaveJob(jobId);
        return ResponseEntity.noContent().build();
    }


    @Operation(summary = "Get all my saved jobs")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SavedJobResponse>> getMySavedJobs() {
        return ResponseEntity.ok(savedJobService.getMySavedJobs());
    }

    @Operation(summary = "Check if a job is saved")
    @GetMapping("/{jobId}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Boolean> isJobSaved(@PathVariable Long jobId) {
        return ResponseEntity.ok(savedJobService.isJobSaved(jobId));
    }



    @Operation(summary = "Check saved status for multiple jobs at once (for list/grid pages)")
    @PostMapping("/status/batch")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Long>> getSavedJobIds(@RequestBody List<Long> jobIds) {
        return ResponseEntity.ok(savedJobService.getSavedJobIds(jobIds));
    }
}