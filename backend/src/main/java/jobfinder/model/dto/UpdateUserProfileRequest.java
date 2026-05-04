package jobfinder.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating User Profile
 * Use this DTO when updating profile data.
 * All fields are optional to support partial updates.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserProfileRequest {

    @JsonProperty("current_job_title")
    @Size(max = 150, message = "Job title must not exceed 150 characters")
    private String currentJobTitle;

    @JsonProperty("years_of_experience")
    @Min(value = 0, message = "Years of experience cannot be negative")
    @Max(value = 70, message = "Years of experience seems invalid")
    private Integer yearsOfExperience;

    @JsonProperty("education_level")
    @Size(max = 100, message = "Education level must not exceed 100 characters")
    private String educationLevel;

    @JsonProperty("country")
    @Size(max = 100, message = "Country name must not exceed 100 characters")
    private String country;

    @JsonProperty("city")
    @Size(max = 100, message = "City name must not exceed 100 characters")
    private String city;

    @JsonProperty("resume_url")
    @Size(max = 500, message = "Resume URL is too long")
    private String resumeUrl;

    @JsonProperty("expected_salary")
    @Min(value = 0, message = "Expected salary cannot be negative")
    private Double expectedSalary;

    @JsonProperty("currency")
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency must be a 3-letter code (e.g., USD, EUR)")
    private String currency;

    @JsonProperty("is_open_to_work")
    private Boolean isOpenToWork;

    @JsonProperty("bio")
    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    private String bio;
}

