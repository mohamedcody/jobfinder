package jobfinder.model.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO returned to the frontend after CV parsing via POST /api/cv/upload.
 *
 * IMPORTANT: This DTO is returned BEFORE any database write.
 * The user reviews and edits this data on the frontend, then submits it to
 * POST /api/cv/confirm to trigger the actual profile save.
 *
 * Carries the complete AI-extracted CV data so the Review screen has
 * everything it needs: flat profile fields + full structured arrays.
 */
public record CvParseResponseDto(

        // --- Status ---
        String message,

        // --- Identity (read-only on review screen) ---
        String fullName,
        String phoneNumber,

        // --- Editable flat profile fields ---
        String currentJobTitle,
        String educationLevel,
        Integer yearsOfExperience,
        String bio,
        String city,
        String country,

        // --- Full structured data for review ---
        List<CvSkillEntry> skills,
        List<CvEducationEntry> education,
        List<CvWorkExperienceEntry> workExperience,

        // --- Convenience counts (derivable from list sizes, kept for compatibility) ---
        int educationCount,
        int workExperienceCount,

        // --- Metadata ---
        LocalDateTime parsedAt

) {

    // ─── Nested record types ───────────────────────────────────────────────────
    // These mirror AiCvExtractionResult's inner records but live in the DTO
    // layer to decouple the API contract from the internal AI parsing model.

    /**
     * A single extracted skill with proficiency metadata.
     */
    public record CvSkillEntry(
            String name,
            Integer proficiencyScore,
            Integer yearsOfExperience
    ) {}

    /**
     * A single extracted education entry.
     */
    public record CvEducationEntry(
            String institution,
            String degree,
            String fieldOfStudy,
            Integer startYear,
            Integer endYear,
            String grade
    ) {}

    /**
     * A single extracted work experience entry.
     */
    public record CvWorkExperienceEntry(
            String companyName,
            String jobTitle,
            String description,
            String startDate,
            String endDate,
            Boolean isCurrent
    ) {}
}

