package jobfinder.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jobfinder.config.CustomUserDetails;
import jobfinder.model.dto.EmailAlertResponseDto;
import jobfinder.model.dto.UpdateEmailAlertRequest;
import jobfinder.services.implementation.EmailAlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/users/profile/alerts")
@RequiredArgsConstructor
@Tag(name = "Email Alerts", description = "Manage daily job-matching email preferences")
public class EmailAlertController {

    private final EmailAlertService emailAlertService;

    @Operation(summary = "Get email alert settings", description = "Fetch daily digest preference and minimum matching score threshold")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EmailAlertResponseDto> getAlertSettings(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(emailAlertService.getAlertSettings(principal.getId()));
    }


    @Operation(summary = "Update email alert settings", description = "Toggle daily digest and change minimum matching score threshold")
    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EmailAlertResponseDto> updateAlertSettings(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody UpdateEmailAlertRequest request) {
        return ResponseEntity.ok(emailAlertService.updateAlertSettings(principal.getId(), request));
    }


    @Operation(summary = "Trigger test email alert", description = "Generates and sends a daily digest matching email to the logged-in user immediately for testing")
    @PostMapping("/test")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> triggerTestEmail(@AuthenticationPrincipal CustomUserDetails principal) {
        String resultMessage = emailAlertService.triggerTestEmail(principal.getId(), principal.getUsername());
        // Simple heuristic: if the message starts with "Please", it's an instruction/warning (treated as bad request equivalent earlier, though now handled by exceptions partially. We'll return 200 OK with the message or let exceptions handle 400).
        return ResponseEntity.ok(resultMessage);
    }


}
