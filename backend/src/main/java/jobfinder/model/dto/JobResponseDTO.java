package jobfinder.model.dto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;

/**
 * JobResponseDTO is used for both receiving data from the scraper 
 * and sending data to the frontend.
 * 
 * Some fields are mapped using @JsonProperty to match the LinkedIn Scraper (Apify) output.
 */
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobResponseDTO {

    private Long id;
    @JsonProperty("title")
    private String title;

    @JsonProperty("companyName")
    private String companyName;

    @JsonProperty("location")
    private String location;

    @JsonProperty("link")
    private String link;

    @JsonProperty("descriptionText")
    private String descriptionText;

    @JsonProperty("companyLogo")
    private String companyLogo;

    @JsonProperty("companyWebsite")
    private String companyWebsite;

    @JsonProperty("companyDescription")
    private String companyDescription;

    @JsonProperty("seniorityLevel")
    private String seniorityLevel;

    // التعديل الأهم هنا: الـ JSON يحتوي على employmentType
    @JsonProperty("employmentType")
    private String employmentType;

    @JsonProperty("salary")
    private String salaryRange;

    @JsonProperty("aiSummary")
    private String aiSummary;

    @Builder.Default
    private LocalDateTime scrapedAt = LocalDateTime.now();

    public String getUrl() {
        return this.link;
    }

}
