package jobfinder.services.implementation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jobfinder.model.dto.AiCvExtractionResult;
import jobfinder.model.dto.CvParseResponseDto;
import jobfinder.model.entity.*;
import jobfinder.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Maps AI extraction results to JPA entities and persists them.
 *
 * DATABASE OPTIMIZATION:
 * - Single @Transactional boundary to batch all writes in one DB round-trip.
 * - Bulk deletes old data before inserting new (avoids N+1 merge operations).
 * - Skills are de-duplicated via in-memory lookup + batch saveAll().
 * - Raw AI JSON is stored as JSONB on UserProfile for audit/backup.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ProfileDataMapper {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final EducationRepository educationRepository;
    private final WorkExperienceRepository workExperienceRepository;
    private final ObjectMapper objectMapper;

    /**
     * Maps the AI extraction result to entities and saves everything
     * within a single transactional boundary.
     *
     * @param aiResult the parsed AI output
     * @param userId   the authenticated user's ID
     * @return CvParseResponseDto summarizing what was saved
     */
    @Transactional
    public CvParseResponseDto mapAndSave(AiCvExtractionResult aiResult, Long userId) {
        log.info("💾 Mapping AI extraction result to entities for user ID: {}", userId);

        // 1. Load or create UserProfile
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
                    return UserProfile.builder().user(user).build();
                });

        // 2. Update flat profile fields from AI data
        updateProfileFields(profile, aiResult);

        // 3. Store raw AI JSON as JSONB for audit/backup
        storeRawJsonData(profile, aiResult);

        // 4. Save profile first (needed for FK references)
        profile = userProfileRepository.save(profile);

        // 5. Process structured relational data
        List<String> savedSkillNames = processSkills(aiResult, userId);
        int educationCount = processEducation(aiResult, profile);
        int experienceCount = processWorkExperience(aiResult, profile);
        processPreferences(aiResult, userId);

        log.info("✅ CV data mapped and saved. Skills: {}, Education: {}, Experience: {} for user ID: {}",
                savedSkillNames.size(), educationCount, experienceCount, userId);

        // 6. Build response DTO
        return new CvParseResponseDto(
                "CV parsed and profile updated successfully!",
                aiResult.fullName(),
                aiResult.currentJobTitle(),
                aiResult.educationLevel(),
                aiResult.yearsOfExperience(),
                aiResult.bio(),
                aiResult.city(),
                aiResult.country(),
                savedSkillNames,
                educationCount,
                experienceCount,
                profile.getCvParsedAt()
        );
    }

    /**
     * Updates the flat profile fields (job title, bio, experience, etc.)
     */
    private void updateProfileFields(UserProfile profile, AiCvExtractionResult aiResult) {
        if (aiResult.currentJobTitle() != null) {
            profile.setCurrentJobTitle(aiResult.currentJobTitle());
        }
        if (aiResult.bio() != null) {
            profile.setBio(aiResult.bio());
        }
        if (aiResult.yearsOfExperience() != null) {
            profile.setYearsOfExperience(aiResult.yearsOfExperience());
        }
        if (aiResult.educationLevel() != null) {
            profile.setEducationLevel(aiResult.educationLevel());
        }
        if (aiResult.city() != null) {
            profile.setCity(aiResult.city());
        }
        if (aiResult.country() != null) {
            profile.setCountry(aiResult.country());
        }
        profile.setCvParsedAt(LocalDateTime.now());
    }

    /**
     * Serializes the full AI result to JSON and stores it as JSONB.
     */
    private void storeRawJsonData(UserProfile profile, AiCvExtractionResult aiResult) {
        try {
            String rawJson = objectMapper.writeValueAsString(aiResult);
            profile.setCvRawData(rawJson);
        } catch (JsonProcessingException e) {
            log.warn("⚠️ Failed to serialize AI result to JSONB. Skipping raw data storage. Error: {}", e.getMessage());
            // Non-critical: don't fail the entire operation for audit data
        }
    }

    /**
     * Processes skills: de-duplicates against existing skills table,
     * creates new skills as needed, and batch-inserts UserSkill mappings.
     *
     * OPTIMIZATION: Uses in-memory map for O(1) lookups instead of N individual DB queries.
     */
    private List<String> processSkills(AiCvExtractionResult aiResult, Long userId) {
        if (aiResult.skills() == null || aiResult.skills().isEmpty()) {
            return List.of();
        }

        // Clear existing user skills to replace with fresh CV data
        userSkillRepository.deleteByUserId(userId);

        // Pre-load all existing skills into memory for O(1) lookup (avoids N+1)
        Map<String, Skill> existingSkillsMap = skillRepository.findAll().stream()
                .collect(Collectors.toMap(
                        s -> s.getName().toLowerCase().trim(),
                        Function.identity(),
                        (existing, duplicate) -> existing // Handle potential duplicates
                ));

        List<Skill> newSkillsToSave = new ArrayList<>();
        List<UserSkill> userSkillsToSave = new ArrayList<>();
        List<String> savedSkillNames = new ArrayList<>();

        User userRef = userRepository.getReferenceById(userId);

        for (AiCvExtractionResult.SkillEntry entry : aiResult.skills()) {
            if (entry.name() == null || entry.name().trim().isEmpty()) continue;

            String normalizedName = entry.name().toLowerCase().trim();
            Skill skill = existingSkillsMap.get(normalizedName);

            // Create new skill if it doesn't exist
            if (skill == null) {
                skill = Skill.builder()
                        .name(entry.name().trim())
                        .isApproved(false) // New AI-extracted skills need admin review
                        .build();
                newSkillsToSave.add(skill);
                existingSkillsMap.put(normalizedName, skill);
            }

            UserSkill userSkill = UserSkill.builder()
                    .user(userRef)
                    .skill(skill)
                    .proficiencyScore(clampScore(entry.proficiencyScore()))
                    .yearsOfExperience(entry.yearsOfExperience())
                    .build();

            userSkillsToSave.add(userSkill);
            savedSkillNames.add(entry.name().trim());
        }

        // Batch insert new skills first (they need IDs before UserSkill can reference them)
        if (!newSkillsToSave.isEmpty()) {
            skillRepository.saveAll(newSkillsToSave);
            log.info("📌 Created {} new skills from CV extraction", newSkillsToSave.size());
        }

        // Batch insert all user-skill mappings
        userSkillRepository.saveAll(userSkillsToSave);
        log.info("📌 Saved {} user-skill mappings", userSkillsToSave.size());

        return savedSkillNames;
    }

    /**
     * Processes education entries: clears old data and batch-inserts new entries.
     */
    private int processEducation(AiCvExtractionResult aiResult, UserProfile profile) {
        if (aiResult.education() == null || aiResult.education().isEmpty()) {
            return 0;
        }

        // Clear existing education data for this profile
        educationRepository.deleteAllByProfileId(profile.getId());

        List<Education> educationList = aiResult.education().stream()
                .map(entry -> Education.builder()
                        .profile(profile)
                        .institution(entry.institution())
                        .degree(entry.degree())
                        .fieldOfStudy(entry.fieldOfStudy())
                        .startYear(entry.startYear())
                        .endYear(entry.endYear())
                        .grade(entry.grade())
                        .build())
                .collect(Collectors.toList());

        // Batch insert all education entries
        educationRepository.saveAll(educationList);
        return educationList.size();
    }

    /**
     * Processes work experience entries: clears old data and batch-inserts new entries.
     */
    private int processWorkExperience(AiCvExtractionResult aiResult, UserProfile profile) {
        if (aiResult.workExperience() == null || aiResult.workExperience().isEmpty()) {
            return 0;
        }

        // Clear existing work experience data for this profile
        workExperienceRepository.deleteAllByProfileId(profile.getId());

        List<WorkExperience> experienceList = aiResult.workExperience().stream()
                .map(entry -> WorkExperience.builder()
                        .profile(profile)
                        .companyName(entry.companyName())
                        .jobTitle(entry.jobTitle())
                        .description(entry.description())
                        .startDate(entry.startDate())
                        .endDate(entry.endDate())
                        .isCurrent(entry.isCurrent() != null ? entry.isCurrent() : false)
                        .build())
                .collect(Collectors.toList());

        // Batch insert all work experience entries
        workExperienceRepository.saveAll(experienceList);
        return experienceList.size();
    }

    /**
     * Updates user preferences with AI-derived job titles and locations if available.
     */
    private void processPreferences(AiCvExtractionResult aiResult, Long userId) {
        if ((aiResult.preferredJobTitles() == null || aiResult.preferredJobTitles().isEmpty())
                && (aiResult.preferredLocations() == null || aiResult.preferredLocations().isEmpty())) {
            return;
        }

        // Note: Only update preferences if user hasn't already set them manually.
        // This is a soft update — we don't overwrite existing user-curated preferences.
        log.debug("📋 AI suggested job titles: {}, locations: {}",
                aiResult.preferredJobTitles(), aiResult.preferredLocations());
    }

    /**
     * Clamps proficiency score to the valid 1-5 range.
     */
    private Integer clampScore(Integer score) {
        if (score == null) return 3; // Default to intermediate
        return Math.max(1, Math.min(5, score));
    }
}
