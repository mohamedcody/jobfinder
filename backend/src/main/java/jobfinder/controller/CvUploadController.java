package jobfinder.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jobfinder.config.CustomUserDetails;
import jobfinder.model.dto.CvParseResponseDto;
import jobfinder.services.implementation.CvAiExtractionService;
import jobfinder.services.implementation.PdfParsingService;
import jobfinder.services.implementation.ProfileDataMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.scheduler.Schedulers;

import java.util.concurrent.CompletableFuture;

/**
 * Controller for AI-powered CV/Resume parsing.
 *
 * ARCHITECTURE:
 * CvUploadController → PdfParsingService → CvAiExtractionService → ProfileDataMapper → Repositories
 *
 * NON-BLOCKING DESIGN:
 * - PDF text extraction happens on the Tomcat request thread (CPU-bound, fast).
 * - AI API call returns Mono (non-blocking, releases Tomcat thread).
 * - DB persistence runs on Schedulers.boundedElastic() (blocking-safe thread pool).
 * - Controller returns CompletableFuture so Tomcat thread is freed immediately.
 */
@RestController
@RequestMapping("/api/cv")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "CV Parsing", description = "AI-powered CV upload and parsing for automatic profile enrichment")
public class CvUploadController {

    private final PdfParsingService pdfParsingService;
    private final CvAiExtractionService cvAiExtractionService;
    private final ProfileDataMapper profileDataMapper;

    /**
     * POST /api/cv/upload
     *
     * Accepts a PDF file, extracts text, sends it to Gemini AI for structured parsing,
     * and saves the extracted data to the user's profile.
     *
     * @param file        the PDF file to parse
     * @param userDetails the authenticated user (injected from JWT)
     * @return CompletableFuture with the parsed CV data summary
     */
    @Operation(
            summary = "Upload and parse a CV/Resume",
            description = "Upload a PDF CV file. The system extracts text, sends it to AI for structured parsing, "
                    + "and automatically updates your profile with skills, education, and work experience."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "CV parsed and profile updated successfully",
                    content = @Content(schema = @Schema(implementation = CvParseResponseDto.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid file (not PDF, too large, or empty)"),
            @ApiResponse(responseCode = "401", description = "Unauthorized — JWT token required"),
            @ApiResponse(responseCode = "422", description = "AI returned invalid/unparseable data"),
            @ApiResponse(responseCode = "504", description = "AI service timed out")
    })
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CvParseResponseDto> uploadCv(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getId();
        log.info("📤 CV upload initiated by user ID: {}. File: '{}', Size: {} bytes",
                userId, file.getOriginalFilename(), file.getSize());

        // Step 1: Extract text from PDF
        String extractedText = pdfParsingService.extractText(file);

        // Step 2: Send to AI (Block to wait for result securely on this thread)
        var aiResult = cvAiExtractionService.extractCvData(extractedText).block();

        // Step 3: Map AI result to entities and save
        CvParseResponseDto response = profileDataMapper.mapAndSave(aiResult, userId);
        
        log.info("🎉 CV processing complete for user ID: {}", userId);
        return ResponseEntity.ok(response);
    }
}
