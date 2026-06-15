package jobfinder.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedJobResponse {


    private Long id;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private LocalDateTime savedAt;
    private String notes;


}
