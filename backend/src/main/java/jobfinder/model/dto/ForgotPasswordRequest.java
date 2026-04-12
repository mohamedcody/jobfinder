package jobfinder.model.dto;

import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(

        @NotBlank(message = "Identifier is required")
        String email
) {}