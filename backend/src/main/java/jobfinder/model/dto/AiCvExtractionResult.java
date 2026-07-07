package jobfinder.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Java Record representing the structured JSON output from the Gemini AI
 * after parsing a CV/Resume. This is the deserialization target for the AI response.
 *
 * Using @JsonIgnoreProperties to gracefully handle extra/unexpected fields from the AI.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AiCvExtractionResult(
        @JsonProperty("fullName") String fullName,
        @JsonProperty("email") String email,
        @JsonProperty("phone") String phone,
        @JsonProperty("currentJobTitle") String currentJobTitle,
        @JsonProperty("bio") String bio,
        @JsonProperty("yearsOfExperience") Integer yearsOfExperience,
        @JsonProperty("educationLevel") String educationLevel,
        @JsonProperty("city") String city,
        @JsonProperty("country") String country,
        @JsonProperty("skills") List<SkillEntry> skills,
        @JsonProperty("education") List<EducationEntry> education,
        @JsonProperty("workExperience") List<WorkExperienceEntry> workExperience,
        @JsonProperty("preferredJobTitles") List<String> preferredJobTitles,
        @JsonProperty("preferredLocations") List<String> preferredLocations
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record SkillEntry(
            @JsonProperty("name") String name,
            @JsonProperty("proficiencyScore") Integer proficiencyScore,
            @JsonProperty("yearsOfExperience") Integer yearsOfExperience
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record EducationEntry(
            @JsonProperty("institution") String institution,
            @JsonProperty("degree") String degree,
            @JsonProperty("fieldOfStudy") String fieldOfStudy,
            @JsonProperty("startYear") Integer startYear,
            @JsonProperty("endYear") Integer endYear,
            @JsonProperty("grade") String grade
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record WorkExperienceEntry(
            @JsonProperty("companyName") String companyName,
            @JsonProperty("jobTitle") String jobTitle,
            @JsonProperty("description") String description,
            @JsonProperty("startDate") String startDate,
            @JsonProperty("endDate") String endDate,
            @JsonProperty("isCurrent") Boolean isCurrent
    ) {}
}
