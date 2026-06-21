package jobfinder.model.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEmailAlertRequest {

    @NotNull(message = "Daily digest enabled flag is required")
    private Boolean dailyDigestEnabled;

    @NotNull(message = "Minimum match score is required")
    @Min(value = 0, message = "Match score must be at least 0")
    @Max(value = 100, message = "Match score cannot exceed 100")
    private Integer minMatchScore;
}
