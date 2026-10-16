package jobfinder.model.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleLoginRequest(
    @NotBlank(message = "Google ID token must not be empty")
    String idToken
) {}
