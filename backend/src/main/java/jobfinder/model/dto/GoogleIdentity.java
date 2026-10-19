package jobfinder.model.dto;

public record GoogleIdentity(
    String subject,
    String email,
    String name
) {}
