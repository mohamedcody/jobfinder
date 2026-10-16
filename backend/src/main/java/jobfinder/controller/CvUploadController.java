package jobfinder.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jobfinder.config.CustomUserDetails;
import jobfinder.model.dto.AiCvExtractionResult;
import jobfinder.model.dto.CvConfirmRequest;
import jobfinder.model.dto.CvParseResponseDto;
import jobfinder.services.ServiceAi.CvAiExtractionService;
import jobfinder.services.implementation.PdfParsingService;
import jobfinder.services.implementation.ProfileDataMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;


import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for AI-powered CV/Resume parsing.
 *
 * UPDATED ARCHITECTURE (C2 — Deferred Save):
 *
 * Step 1 — POST /api/cv/upload
 *   PdfParsingService → CvAiExtractionService → CvParseResponseDto (NO DB WRITE)
 *   Returns the complete extracted data for the user to review on the frontend.
 *
 * Step 2 — POST /api/cv/confirm
 *   Receives user-reviewed data → validates → calls ProfileDataMapper.mapAndSave()
 *   Single @Transactional write that saves everything atomically.
 *
 * USER DATA IS NEVER MODIFIED WITHOUT EXPLICIT CONFIRMATION.
 */
@RestController
@RequestMapping("/api/cv")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "CV Parsing", description = "AI-powered CV upload, parsing, and confirmed profile save")
public class CvUploadController {

    private final PdfParsingService pdfParsingService;
    private final CvAiExtractionService cvAiExtractionService;
    private final ProfileDataMapper profileDataMapper;

    // ─── POST /api/cv/upload ──────────────────────────────────────────────────

    /**
     * Step 1: Parse the CV and return extracted data for user review.
     *
     * IMPORTANT: This endpoint performs ZERO database writes.
     * It only extracts text from the PDF and calls Gemini AI.
     * The user reviews the returned data and explicitly saves via /api/cv/confirm.
     *
     * @param file        the PDF file to parse
     * @param userDetails the authenticated user (injected from JWT — not used for DB write here)
     * @return Mono with complete extracted CV data for the Review screen
     */
    @Operation(
            summary = "Upload and parse a CV/Resume",
            description = "Upload a PDF CV file. The system extracts text and sends it to AI for structured parsing. "
                    + "The extracted data is returned for user review. "
                    + "No profile data is saved until the user explicitly confirms via POST /api/cv/confirm."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "CV parsed successfully — data returned for review, nothing saved yet",
                    content = @Content(schema = @Schema(implementation = CvParseResponseDto.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid file (not PDF, too large, or empty)"),
            @ApiResponse(responseCode = "401", description = "Unauthorized — JWT token required"),
            @ApiResponse(responseCode = "422", description = "AI returned invalid/unparseable data"),
            @ApiResponse(responseCode = "503", description = "AI service unavailable or timed out")
    })
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public Mono<ResponseEntity<CvParseResponseDto>> uploadCv(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getId();
        log.info("📤 CV upload initiated by user ID: {}. File: '{}', Size: {} bytes",
                userId, file.getOriginalFilename(), file.getSize());

        // Step 1: Extract text from PDF (synchronous, CPU-bound, fast)
        String extractedText;
        try {
            extractedText = pdfParsingService.extractText(file);
        } catch (Exception e) {
            log.error("❌ PDF text extraction failed for user ID: {}. Error: {}", userId, e.getMessage());
            throw e;
        }

        // Step 2: Send to Gemini AI (async, non-blocking) → map to response DTO (NO DB write)
        return cvAiExtractionService.extractCvData(extractedText)
                .map(aiResult -> {
                    log.info("✅ CV parsed for user ID: {}. Skills: {}, Education: {}, Experience: {}",
                            userId,
                            aiResult.skills() != null ? aiResult.skills().size() : 0,
                            aiResult.education() != null ? aiResult.education().size() : 0,
                            aiResult.workExperience() != null ? aiResult.workExperience().size() : 0);

                    CvParseResponseDto response = buildParseResponse(aiResult);
                    return ResponseEntity.ok(response);
                })
                .onErrorResume(e -> {
                    log.error("❌ CV parsing pipeline error for user ID: {}. Error: {}", userId, e.getMessage());
                    return Mono.just(ResponseEntity.status(503).<CvParseResponseDto>build());
                });
    }

    // ─── POST /api/cv/confirm ─────────────────────────────────────────────────

    /**
     * Step 2: Save the user-reviewed CV data to the database.
     *
     * Receives the data the user reviewed and edited on the frontend.
     * Validates all fields server-side, then calls the existing
     * ProfileDataMapper.mapAndSave() within its unchanged @Transactional boundary.
     *
     * SECURITY: userId is always derived from the authenticated JWT.
     * It is never accepted from the request body.
     *
     * @param request     the user-reviewed CV data
     * @param userDetails the authenticated user (JWT — used for ownership enforcement)
     * @return CvParseResponseDto with the final saved state
     */
    @Operation(
            summary = "Confirm and save the reviewed CV data",
            description = "Receives the user-reviewed CV data from the frontend Review screen. "
                    + "Validates all fields, then atomically saves the profile, skills, education, "
                    + "and work experience to the database. "
                    + "The authenticated user's ID is always taken from the JWT — never from the request body."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Profile saved successfully",
                    content = @Content(schema = @Schema(implementation = CvParseResponseDto.class))
            ),
            @ApiResponse(responseCode = "400", description = "Validation error — check field constraints"),
            @ApiResponse(responseCode = "401", description = "Unauthorized — JWT token required"),
            @ApiResponse(responseCode = "404", description = "User not found"),
            @ApiResponse(responseCode = "500", description = "Unexpected server error during save")
    })
    @PostMapping(value = "/confirm", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CvParseResponseDto> confirmCvSave(
            @Valid @RequestBody CvConfirmRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        // SECURITY: userId always comes from JWT — never from request body
        Long userId = userDetails.getId();
        log.info("💾 CV confirm save initiated by user ID: {}", userId);

        // Convert the user-reviewed request into the AiCvExtractionResult
        // that ProfileDataMapper.mapAndSave() expects — keeping that method unchanged.
        AiCvExtractionResult aiResult = buildAiResultFromRequest(request);

        // Call the existing @Transactional save method — unchanged
        CvParseResponseDto response = profileDataMapper.mapAndSave(aiResult, userId);

        log.info("🎉 CV confirm save complete for user ID: {}", userId);
        return ResponseEntity.ok(response);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    /**
     * Maps AiCvExtractionResult → CvParseResponseDto WITHOUT touching the database.
     * Used exclusively by the /upload endpoint.
     */
    private CvParseResponseDto buildParseResponse(AiCvExtractionResult aiResult) {
        List<CvParseResponseDto.CvSkillEntry> skills = aiResult.skills() != null
                ? aiResult.skills().stream()
                        .filter(s -> s.name() != null && !s.name().isBlank())
                        .map(s -> new CvParseResponseDto.CvSkillEntry(
                                s.name().trim(), s.proficiencyScore(), s.yearsOfExperience()))
                        .collect(Collectors.toList())
                : Collections.emptyList();

        List<CvParseResponseDto.CvEducationEntry> education = aiResult.education() != null
                ? aiResult.education().stream()
                        .map(e -> new CvParseResponseDto.CvEducationEntry(
                                e.institution(), e.degree(), e.fieldOfStudy(),
                                e.startYear(), e.endYear(), e.grade()))
                        .collect(Collectors.toList())
                : Collections.emptyList();

        List<CvParseResponseDto.CvWorkExperienceEntry> workExperience = aiResult.workExperience() != null
                ? aiResult.workExperience().stream()
                        .map(e -> new CvParseResponseDto.CvWorkExperienceEntry(
                                e.companyName(), e.jobTitle(), e.description(),
                                e.startDate(), e.endDate(), e.isCurrent()))
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return new CvParseResponseDto(
                "CV parsed successfully — please review and confirm to save.",
                aiResult.fullName(),
                aiResult.phone(),
                aiResult.currentJobTitle(),
                aiResult.educationLevel(),
                aiResult.yearsOfExperience(),
                aiResult.bio(),
                aiResult.city(),
                aiResult.country(),
                skills,
                education,
                workExperience,
                education.size(),
                workExperience.size(),
                LocalDateTime.now()
        );
    }

    /**
     * Converts CvConfirmRequest (user-reviewed data) into AiCvExtractionResult
     * so the existing ProfileDataMapper.mapAndSave() can consume it unchanged.
     *
     * This is the adapter between the public API contract and the internal processing model.
     */
    private AiCvExtractionResult buildAiResultFromRequest(CvConfirmRequest request) {
        List<AiCvExtractionResult.SkillEntry> skills = request.skills() != null
                ? request.skills().stream()
                        .map(s -> new AiCvExtractionResult.SkillEntry(
                                s.name(), s.proficiencyScore(), s.yearsOfExperience()))
                        .collect(Collectors.toList())
                : Collections.emptyList();

        List<AiCvExtractionResult.EducationEntry> education = request.education() != null
                ? request.education().stream()
                        .map(e -> new AiCvExtractionResult.EducationEntry(
                                e.institution(), e.degree(), e.fieldOfStudy(),
                                e.startYear(), e.endYear(), e.grade()))
                        .collect(Collectors.toList())
                : Collections.emptyList();

        List<AiCvExtractionResult.WorkExperienceEntry> workExperience = request.workExperience() != null
                ? request.workExperience().stream()
                        .map(e -> new AiCvExtractionResult.WorkExperienceEntry(
                                e.companyName(), e.jobTitle(), e.description(),
                                e.startDate(), e.endDate(),
                                e.isCurrent() != null ? e.isCurrent() : false))
                        .collect(Collectors.toList())
                : Collections.emptyList();

        // fullName, email, phone, preferredJobTitles, preferredLocations are not part
        // of the confirmation payload (they are read-only on the Review screen).
        return new AiCvExtractionResult(
                null,           // fullName  — not editable on Review screen
                null,           // email     — managed separately by auth
                null,           // phone     — not in CvConfirmRequest
                request.currentJobTitle(),
                request.bio(),
                request.yearsOfExperience(),
                request.educationLevel(),
                request.city(),
                request.country(),
                skills,
                education,
                workExperience,
                Collections.emptyList(),  // preferredJobTitles — not on Review screen
                Collections.emptyList()   // preferredLocations — not on Review screen
        );
    }
}

