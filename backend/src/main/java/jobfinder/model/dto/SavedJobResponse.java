package jobfinder.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor(force = true)
public class SavedJobResponse {

    @JsonProperty("savedJobId")
    private Long savedJobId;

    @JsonProperty("jobId")
    private Long jobId;

    @JsonProperty("jobTitle")
    private String jobTitle;

    @JsonProperty("companyName")
    private String companyName;

    @JsonProperty("companyLogo")
    private String companyLogo;

    @JsonProperty("location")
    private String location;

    @JsonProperty("jobUrl")
    private String jobUrl;

    @JsonProperty("employmentType")
    private String employmentType;

    @JsonProperty("savedAt")
    private LocalDateTime savedAt;

    @JsonProperty("notes")
    private String notes;

    /**
     * ✅ Constructor صريح للـ JPQL Projection
     * الترتيب MUST match الـ query بالضبط:
     * 1. s.id (savedJobId)
     * 2. j.id (jobId)
     * 3. j.title (jobTitle)
     * 4. c.name (companyName)
     * 5. c.logoUrl (companyLogo)
     * 6. j.location (location)
     * 7. j.jobUrl (jobUrl)
     * 8. j.employmentType (employmentType)
     * 9. s.savedAt (savedAt)
     * 10. s.notes (notes)
     */
    public SavedJobResponse(
            Long savedJobId,
            Long jobId,
            String jobTitle,
            String companyName,
            String companyLogo,
            String location,
            String jobUrl,
            String employmentType,
            LocalDateTime savedAt,
            String notes) {
        this.savedJobId = savedJobId;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.companyName = companyName;
        this.companyLogo = companyLogo;
        this.location = location;
        this.jobUrl = jobUrl;
        this.employmentType = employmentType;
        this.savedAt = savedAt;
        this.notes = notes;
    }
}