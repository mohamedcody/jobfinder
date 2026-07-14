package jobfinder.model.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO returned to the frontend after successful CV parsing.
 * Contains the extracted and saved profile data summary.
 */
public record CvParseResponseDto(
        String message,
        String fullName,
        String phoneNumber,
        String currentJobTitle,
        String educationLevel,
        Integer yearsOfExperience,
        String bio,
        String city,
        String country,
        List<String> extractedSkills,
        int educationCount,
        int workExperienceCount,
        LocalDateTime parsedAt
) {}
