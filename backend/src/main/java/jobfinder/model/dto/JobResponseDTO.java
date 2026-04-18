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

    private String title;
    private String companyName;
    private String location;
    private String link;
    
    @JsonProperty("description")
    private String descriptionText;
    
    @JsonProperty("companyLogo")
    private String companyLogo;
    
    private String companyWebsite;
    private String companyDescription;
    private String seniorityLevel;
    
    @JsonProperty("jobType") // Apify common field for employment type
    private String employmentType;
    
    @JsonProperty("salary") // Apify common field for salary
    private String salaryRange;

    @Builder.Default
    private LocalDateTime scrapedAt = LocalDateTime.now();

    public String getUrl() {
        return this.link;
    }

}
