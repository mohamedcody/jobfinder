package jobfinder.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

/**
 * Request DTO for POST /api/cv/confirm
 *
 * Carries the user-reviewed CV data from the frontend Review screen.
 * All fields are optional to support partial saves — the user may leave some
 * fields blank if the AI could not extract them.
 *
 * SECURITY:
 * - userId is NEVER accepted from the request body.
 * - The authenticated user's ID is always read from the JWT via @AuthenticationPrincipal.
 * - All fields are validated server-side regardless of client-side validation.
 */
public record CvConfirmRequest(

        // ── Flat profile fields (user-reviewed) ─────────────────────────────────

        @JsonProperty("currentJobTitle")
        @Size(max = 150, message = "Job title must not exceed 150 characters")
        String currentJobTitle,

        @JsonProperty("bio")
        @Size(max = 1000, message = "Bio must not exceed 1000 characters")
        String bio,

        @JsonProperty("educationLevel")
        @Size(max = 100, message = "Education level must not exceed 100 characters")
        String educationLevel,

        @JsonProperty("yearsOfExperience")
        @Min(value = 0, message = "Years of experience cannot be negative")
        @Max(value = 70, message = "Years of experience seems unrealistically high")
        Integer yearsOfExperience,

        @JsonProperty("city")
        @Size(max = 100, message = "City must not exceed 100 characters")
        String city,

        @JsonProperty("country")
        @Size(max = 100, message = "Country must not exceed 100 characters")
        String country,

        // ── Structured CV data (user-reviewed) ──────────────────────────────────

        @JsonProperty("skills")
        @Valid
        List<SkillEntry> skills,

        @JsonProperty("education")
        @Valid
        List<EducationEntry> education,

        @JsonProperty("workExperience")
        @Valid
        List<WorkExperienceEntry> workExperience

) {

    // ─── Nested request record types ─────────────────────────────────────────
    // Mirror CvParseResponseDto's structure so the frontend can echo back
    // exactly what was shown on the Review screen.

    /**
     * A single reviewed/edited skill entry.
     */
    public record SkillEntry(

            @JsonProperty("name")
            @NotBlank(message = "Skill name must not be blank")
            @Size(max = 100, message = "Skill name must not exceed 100 characters")
            String name,

            @JsonProperty("proficiencyScore")
            @Min(value = 1, message = "Proficiency score must be between 1 and 5")
            @Max(value = 5, message = "Proficiency score must be between 1 and 5")
            Integer proficiencyScore,

            @JsonProperty("yearsOfExperience")
            @Min(value = 0, message = "Skill years of experience cannot be negative")
            @Max(value = 70, message = "Skill years of experience seems unrealistically high")
            Integer yearsOfExperience

    ) {}

    /**
     * A single reviewed/edited education entry.
     */
    public record EducationEntry(

            @JsonProperty("institution")
            @Size(max = 500, message = "Institution name must not exceed 500 characters")
            String institution,

            @JsonProperty("degree")
            @Size(max = 255, message = "Degree must not exceed 255 characters")
            String degree,

            @JsonProperty("fieldOfStudy")
            @Size(max = 255, message = "Field of study must not exceed 255 characters")
            String fieldOfStudy,

            @JsonProperty("startYear")
            @Min(value = 1900, message = "Start year seems invalid")
            @Max(value = 2100, message = "Start year seems invalid")
            Integer startYear,

            @JsonProperty("endYear")
            @Min(value = 1900, message = "End year seems invalid")
            @Max(value = 2100, message = "End year seems invalid")
            Integer endYear,

            @JsonProperty("grade")
            @Size(max = 100, message = "Grade must not exceed 100 characters")
            String grade

    ) {}

    /**
     * A single reviewed/edited work experience entry.
     */
    public record WorkExperienceEntry(

            @JsonProperty("companyName")
            @Size(max = 500, message = "Company name must not exceed 500 characters")
            String companyName,

            @JsonProperty("jobTitle")
            @Size(max = 255, message = "Job title must not exceed 255 characters")
            String jobTitle,

            @JsonProperty("description")
            @Size(max = 5000, message = "Description must not exceed 5000 characters")
            String description,

            @JsonProperty("startDate")
            @Pattern(regexp = "^\\d{4}-\\d{2}$|^$", message = "Start date must be in YYYY-MM format")
            String startDate,

            @JsonProperty("endDate")
            @Pattern(regexp = "^\\d{4}-\\d{2}$|^$", message = "End date must be in YYYY-MM format")
            String endDate,

            @JsonProperty("isCurrent")
            Boolean isCurrent

    ) {}
}
