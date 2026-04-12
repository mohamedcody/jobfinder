package jobfinder.model.dto;

import jakarta.validation.constraints.NotBlank;

public record ResetPasswordRequest(

        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "OTP code is required")
        String otpCode,

        @NotBlank(message = "New password is required")
        String newPassword,

        @NotBlank(message = "Confirm password is required")
        String
        confirmPassword
){}

