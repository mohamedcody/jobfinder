package jobfinder.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

public record AuthResponseDto(
        String token,
        @JsonIgnore String refreshToken,
        String email,
        String role,
        String message
) {
}
