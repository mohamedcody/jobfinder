package com.example.jobfinder.model.dto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
@Builder
@NoArgsConstructor  // 👈 إجباري عشان الـ JSON Mapping
@AllArgsConstructor
public class JobResponseDTO {

    private String title;
    private String companyName;
    private String location;
    private String link;
    private String descriptionText;
    private String companyLogo;
    private String companyWebsite;
    private String companyDescription;
    private String seniorityLevel;
    private String employmentType;

    @Builder.Default
    private LocalDateTime scrapedAt = LocalDateTime.now();

    public String getUrl() {
        return this.link;
    }

}
