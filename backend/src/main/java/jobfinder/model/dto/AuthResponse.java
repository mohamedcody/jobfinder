package jobfinder.model.dto;

public record AuthResponse(
        String token, String email ,String role , String message
) {
}
