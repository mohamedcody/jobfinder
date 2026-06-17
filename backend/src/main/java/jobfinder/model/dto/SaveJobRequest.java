package jobfinder.model.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaveJobRequest {

    // ✅ بتطابق الـ @Column(length = 500) في الـ Entity
    // بدون الـ validation ده، أي notes أطول من 500 حرف كانت هتطلع DB error مش واضح (500 status)
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}