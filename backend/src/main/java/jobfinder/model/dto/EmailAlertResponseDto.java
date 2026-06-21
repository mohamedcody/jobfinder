package jobfinder.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailAlertResponseDto {
    private Boolean dailyDigestEnabled;
    private Integer minMatchScore;
}
