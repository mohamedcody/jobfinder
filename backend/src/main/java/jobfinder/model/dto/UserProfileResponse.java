package jobfinder.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for User Profile
 * Use this DTO when sending profile data to the frontend.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("username")
    private String username;

    @JsonProperty("email")
    private String email;

    @JsonProperty("current_job_title")
    private String currentJobTitle;

    @JsonProperty("years_of_experience")
    private Integer yearsOfExperience;

    @JsonProperty("education_level")
    private String educationLevel;

    @JsonProperty("country")
    private String country;

    @JsonProperty("city")
    private String city;

    @JsonProperty("resume_url")
    private String resumeUrl;

    @JsonProperty("expected_salary")
    private Double expectedSalary;

    @JsonProperty("currency")
    private String currency;

    @JsonProperty("is_open_to_work")
    private Boolean isOpenToWork;

    @JsonProperty("bio")
    private String bio;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}

