package jobfinder.controller;


import jobfinder.model.dto.CursorPageResponse;
import jobfinder.model.dto.JobFilterRequest;
import jobfinder.model.dto.JobResponseDTO;
import jobfinder.services.implementation.JobScraperService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth/test")
public class testApi {

    private final JobScraperService jobScraperService ;

    @PostMapping("/search/advanced")
    public ResponseEntity<CursorPageResponse<JobResponseDTO>> searchJobsAdvanced(
            @RequestBody JobFilterRequest filter,
            @RequestParam(required = false) Long lastId,
            @RequestParam(defaultValue = "10") int size) {

        // الميثود دي اللي إحنا لسه مصلحينها في السيرفس
        return ResponseEntity.ok(jobScraperService.searchJobsByFilter(filter, lastId, size));
    }

}
