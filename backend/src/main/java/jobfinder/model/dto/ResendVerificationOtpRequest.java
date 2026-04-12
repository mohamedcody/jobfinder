package jobfinder.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ResendVerificationOtpRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Email format is invalid")
        String email
) {
}

