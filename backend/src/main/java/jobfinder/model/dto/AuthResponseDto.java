package jobfinder.model.dto;

public record AuthResponseDto(
        String token, String email ,String role , String message
) {
}
