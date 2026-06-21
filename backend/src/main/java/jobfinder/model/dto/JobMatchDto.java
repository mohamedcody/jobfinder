package jobfinder.model.dto;

import lombok.Builder;
import lombok.Data;

/**
 * A lightweight projection used by the matching engine.
 * Avoids loading full JobEntity fields we don't need in the email.
 */
@Data
@Builder
public class JobMatchDto {

    private Long   id;
    private String title;
    private String location;
    private String employmentType;
    private String salaryRange;
    private String jobUrl;
    private String companyName;
    private String companyLogo;
    private String aiSummary;

    /** 0–100 score computed by the matching engine */
    private int matchScore;
}
