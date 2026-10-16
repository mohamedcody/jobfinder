package jobfinder.services.implementation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jobfinder.model.dto.AiCvExtractionResult;
import jobfinder.model.entity.*;
import jobfinder.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProfileDataMapperTest {

    @Mock private UserProfileRepository userProfileRepository;
    @Mock private UserRepository userRepository;
    @Mock private SkillRepository skillRepository;
    @Mock private UserSkillRepository userSkillRepository;
    @Mock private EducationRepository educationRepository;
    @Mock private WorkExperienceRepository workExperienceRepository;
    @Mock private ObjectMapper objectMapper;

    @InjectMocks
    private ProfileDataMapper profileDataMapper;

    private User defaultUser;
    private UserProfile defaultProfile;

    @BeforeEach
    void setUp() {
        defaultUser = User.builder().id(1L).username("testuser").build();
        defaultProfile = UserProfile.builder().id(100L).user(defaultUser).build();
    }

    // ─── Helper: build real record instances (records are final, cannot mock) ──

    private AiCvExtractionResult buildAiResult(String fullName, String email, String phone,
                                                String jobTitle, String bio, Integer years,
                                                String eduLevel, String city, String country,
                                                List<AiCvExtractionResult.SkillEntry> skills,
                                                List<AiCvExtractionResult.EducationEntry> education,
                                                List<AiCvExtractionResult.WorkExperienceEntry> workExp) {
        return new AiCvExtractionResult(fullName, email, phone, jobTitle, bio, years, eduLevel,
                city, country, skills, education, workExp,
                Collections.emptyList(), Collections.emptyList());
    }

    private AiCvExtractionResult emptyAiResult() {
        return buildAiResult(null, null, null, null, null, null, null, null, null,
                null, null, null);
    }

    private void mockUserFoundWithProfile() {
        when(userProfileRepository.findByUserId(1L)).thenReturn(Optional.of(defaultProfile));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepository.getReferenceById(1L)).thenReturn(defaultUser);
    }

    private void mockUserFoundWithoutProfile() {
        when(userProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(defaultUser));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepository.getReferenceById(1L)).thenReturn(defaultUser);
    }

    @Nested
    class HappyPathTests {

        @Test
        void mapAndSave_withCompleteData_savesAllEntitiesCorrectly() {
            mockUserFoundWithProfile();

            AiCvExtractionResult result = buildAiResult(
                    "Ahmed", "a@ex.com", "+20100", "Developer", "Bio", 5, "BSc",
                    "Cairo", "Egypt",
                    List.of(new AiCvExtractionResult.SkillEntry("Java", 4, 3)),
                    List.of(new AiCvExtractionResult.EducationEntry("MIT", "BSc", "CS", 2016, 2020, "A")),
                    List.of(new AiCvExtractionResult.WorkExperienceEntry("Google", "Dev", "Built APIs", "2020-01", null, true))
            );

            profileDataMapper.mapAndSave(result, 1L);

            verify(userProfileRepository).save(any(UserProfile.class));
            verify(skillRepository).saveAll(anyList());
            verify(userSkillRepository).saveAll(anyList());
            verify(educationRepository).saveAll(anyList());
            verify(workExperienceRepository).saveAll(anyList());
        }

        @Test
        void mapAndSave_existingProfile_updatesInsteadOfCreating() {
            mockUserFoundWithProfile();
            AiCvExtractionResult result = buildAiResult(null, null, null, null, "Updated Bio",
                    null, null, null, null, null, null, null);

            profileDataMapper.mapAndSave(result, 1L);

            ArgumentCaptor<UserProfile> captor = ArgumentCaptor.forClass(UserProfile.class);
            verify(userProfileRepository).save(captor.capture());

            UserProfile savedProfile = captor.getValue();
            assertThat(savedProfile.getId()).isEqualTo(100L);
            assertThat(savedProfile.getBio()).isEqualTo("Updated Bio");
            verify(userRepository, never()).findById(anyLong());
        }

        @Test
        void mapAndSave_newUser_createsProfileFromScratch() {
            mockUserFoundWithoutProfile();
            AiCvExtractionResult result = buildAiResult(null, null, null, null, "New Bio",
                    null, null, null, null, null, null, null);

            profileDataMapper.mapAndSave(result, 1L);

            ArgumentCaptor<UserProfile> captor = ArgumentCaptor.forClass(UserProfile.class);
            verify(userProfileRepository).save(captor.capture());

            UserProfile savedProfile = captor.getValue();
            assertThat(savedProfile.getUser()).isEqualTo(defaultUser);
            assertThat(savedProfile.getBio()).isEqualTo("New Bio");
        }
    }

    @Nested
    class BugDiscoveryTests {

        @Test
        void mapAndSave_withFullName_shouldSaveFullNameOnProfile() {
            // BUG: fullName from AI extraction is never saved to UserProfile
            // updateProfileFields() does NOT call profile.setFullName()
            // THIS TEST WILL FAIL — revealing the bug
            mockUserFoundWithProfile();
            AiCvExtractionResult result = buildAiResult("John Doe", null, null,
                    null, null, null, null, null, null, null, null, null);

            profileDataMapper.mapAndSave(result, 1L);

            ArgumentCaptor<UserProfile> captor = ArgumentCaptor.forClass(UserProfile.class);
            verify(userProfileRepository).save(captor.capture());

            assertThat(captor.getValue().getFullName())
                    .as("BUG: fullName should be saved but updateProfileFields() never sets it")
                    .isEqualTo("John Doe");
        }

        @Test
        void mapAndSave_withPhoneNumber_shouldSavePhoneOnProfile() {
            // BUG: phone from AI extraction is never saved to UserProfile
            // updateProfileFields() does NOT call profile.setPhoneNumber()
            // THIS TEST WILL FAIL — revealing the bug
            mockUserFoundWithProfile();
            AiCvExtractionResult result = buildAiResult(null, null, "+1234567890",
                    null, null, null, null, null, null, null, null, null);

            profileDataMapper.mapAndSave(result, 1L);

            ArgumentCaptor<UserProfile> captor = ArgumentCaptor.forClass(UserProfile.class);
            verify(userProfileRepository).save(captor.capture());

            assertThat(captor.getValue().getPhoneNumber())
                    .as("BUG: phoneNumber should be saved but updateProfileFields() never sets it")
                    .isEqualTo("+1234567890");
        }
    }

    @Nested
    class EdgeCaseTests {

        @Test
        void mapAndSave_nullSkills_skipsSkillProcessing() {
            mockUserFoundWithProfile();
            AiCvExtractionResult result = emptyAiResult();

            assertDoesNotThrow(() -> profileDataMapper.mapAndSave(result, 1L));
            verify(userSkillRepository, never()).deleteAllByUserId(anyLong());
        }

        @Test
        void mapAndSave_emptySkills_skipsSkillProcessing() {
            mockUserFoundWithProfile();
            AiCvExtractionResult result = buildAiResult(null, null, null, null, null, null,
                    null, null, null, Collections.emptyList(), null, null);

            assertDoesNotThrow(() -> profileDataMapper.mapAndSave(result, 1L));
            verify(userSkillRepository, never()).deleteAllByUserId(anyLong());
        }

        @Test
        void mapAndSave_skillsWithBlankNames_filteredOut() {
            mockUserFoundWithProfile();
            AiCvExtractionResult result = buildAiResult(null, null, null, null, null, null,
                    null, null, null,
                    List.of(
                            new AiCvExtractionResult.SkillEntry(null, 5, 2),
                            new AiCvExtractionResult.SkillEntry("   ", 5, 2),
                            new AiCvExtractionResult.SkillEntry("Java", 5, 2)
                    ), null, null);

            profileDataMapper.mapAndSave(result, 1L);

            @SuppressWarnings("unchecked")
            ArgumentCaptor<List<UserSkill>> captor = ArgumentCaptor.forClass(List.class);
            verify(userSkillRepository).saveAll(captor.capture());

            List<UserSkill> savedSkills = captor.getValue();
            assertThat(savedSkills).hasSize(1);
            assertThat(savedSkills.get(0).getSkill().getName()).isEqualTo("Java");
        }

        @Test
        void mapAndSave_nullEducation_returnsZeroCount() {
            mockUserFoundWithProfile();
            AiCvExtractionResult result = emptyAiResult();

            var response = profileDataMapper.mapAndSave(result, 1L);
            assertThat(response.educationCount()).isZero();
            verify(educationRepository, never()).deleteAllByProfileId(anyLong());
        }

        @Test
        void mapAndSave_nullWorkExperience_returnsZeroCount() {
            mockUserFoundWithProfile();
            AiCvExtractionResult result = emptyAiResult();

            var response = profileDataMapper.mapAndSave(result, 1L);
            assertThat(response.workExperienceCount()).isZero();
            verify(workExperienceRepository, never()).deleteAllByProfileId(anyLong());
        }

        @Test
        void mapAndSave_duplicateSkillNames_handledGracefully() {
            mockUserFoundWithProfile();
            AiCvExtractionResult result = buildAiResult(null, null, null, null, null, null,
                    null, null, null,
                    List.of(
                            new AiCvExtractionResult.SkillEntry("Java", 3, 2),
                            new AiCvExtractionResult.SkillEntry("java ", 5, 4)
                    ), null, null);

            profileDataMapper.mapAndSave(result, 1L);

            @SuppressWarnings("unchecked")
            ArgumentCaptor<List<Skill>> skillCaptor = ArgumentCaptor.forClass(List.class);
            verify(skillRepository).saveAll(skillCaptor.capture());

            // Should only create 1 new skill, not 2
            assertThat(skillCaptor.getValue()).hasSize(1);
        }

        @Test
        void clampScore_nullScore_defaultsTo3() {
            mockUserFoundWithProfile();
            AiCvExtractionResult result = buildAiResult(null, null, null, null, null, null,
                    null, null, null,
                    List.of(new AiCvExtractionResult.SkillEntry("Java", null, 2)),
                    null, null);

            profileDataMapper.mapAndSave(result, 1L);

            @SuppressWarnings("unchecked")
            ArgumentCaptor<List<UserSkill>> captor = ArgumentCaptor.forClass(List.class);
            verify(userSkillRepository).saveAll(captor.capture());

            assertThat(captor.getValue().get(0).getProficiencyScore()).isEqualTo(3);
        }

        @Test
        void clampScore_scoreBelow1_clampedTo1() {
            mockUserFoundWithProfile();
            AiCvExtractionResult result = buildAiResult(null, null, null, null, null, null,
                    null, null, null,
                    List.of(new AiCvExtractionResult.SkillEntry("Java", -5, 2)),
                    null, null);

            profileDataMapper.mapAndSave(result, 1L);

            @SuppressWarnings("unchecked")
            ArgumentCaptor<List<UserSkill>> captor = ArgumentCaptor.forClass(List.class);
            verify(userSkillRepository).saveAll(captor.capture());

            assertThat(captor.getValue().get(0).getProficiencyScore()).isEqualTo(1);
        }

        @Test
        void clampScore_scoreAbove5_clampedTo5() {
            mockUserFoundWithProfile();
            AiCvExtractionResult result = buildAiResult(null, null, null, null, null, null,
                    null, null, null,
                    List.of(new AiCvExtractionResult.SkillEntry("Java", 10, 2)),
                    null, null);

            profileDataMapper.mapAndSave(result, 1L);

            @SuppressWarnings("unchecked")
            ArgumentCaptor<List<UserSkill>> captor = ArgumentCaptor.forClass(List.class);
            verify(userSkillRepository).saveAll(captor.capture());

            assertThat(captor.getValue().get(0).getProficiencyScore()).isEqualTo(5);
        }

        @Test
        void mapAndSave_existingSkillInDb_reusesSkillEntity() {
            mockUserFoundWithProfile();
            AiCvExtractionResult result = buildAiResult(null, null, null, null, null, null,
                    null, null, null,
                    List.of(new AiCvExtractionResult.SkillEntry("Java", 4, 3)),
                    null, null);

            Skill existingSkill = Skill.builder().id(99L).name("Java").build();
            when(skillRepository.findByNameIgnoreCaseIn(anyList())).thenReturn(List.of(existingSkill));

            profileDataMapper.mapAndSave(result, 1L);

            // No new skills should be saved because "Java" already exists
            verify(skillRepository, never()).saveAll(anyList());

            @SuppressWarnings("unchecked")
            ArgumentCaptor<List<UserSkill>> captor = ArgumentCaptor.forClass(List.class);
            verify(userSkillRepository).saveAll(captor.capture());
            assertThat(captor.getValue().get(0).getSkill().getId()).isEqualTo(99L);
        }
    }

    @Nested
    class ErrorTests {

        @Test
        void mapAndSave_userNotFound_throwsRuntimeException() {
            when(userProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());
            when(userRepository.findById(1L)).thenReturn(Optional.empty());

            AiCvExtractionResult result = emptyAiResult();

            assertThatThrownBy(() -> profileDataMapper.mapAndSave(result, 1L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("User not found with ID: 1");
        }

        @Test
        void mapAndSave_jsonSerializationFails_continuesWithoutCrash() throws JsonProcessingException {
            mockUserFoundWithProfile();
            AiCvExtractionResult result = emptyAiResult();

            when(objectMapper.writeValueAsString(any())).thenThrow(new JsonProcessingException("Test failure") {});

            assertDoesNotThrow(() -> profileDataMapper.mapAndSave(result, 1L));
            verify(userProfileRepository).save(any(UserProfile.class));
        }
    }

    @Nested
    class DataIntegrityTests {

        @Test
        void mapAndSave_deletesOldSkillsBeforeInserting() {
            mockUserFoundWithProfile();
            AiCvExtractionResult result = buildAiResult(null, null, null, null, null, null,
                    null, null, null,
                    List.of(new AiCvExtractionResult.SkillEntry("Java", 4, 3)),
                    null, null);

            profileDataMapper.mapAndSave(result, 1L);

            var inOrder = inOrder(userSkillRepository);
            inOrder.verify(userSkillRepository).deleteAllByUserId(1L);
            inOrder.verify(userSkillRepository).saveAll(anyList());
        }

        @Test
        void mapAndSave_deletesOldEducationBeforeInserting() {
            mockUserFoundWithProfile();
            AiCvExtractionResult result = buildAiResult(null, null, null, null, null, null,
                    null, null, null, null,
                    List.of(new AiCvExtractionResult.EducationEntry("MIT", "BSc", "CS", 2016, 2020, "A")),
                    null);

            profileDataMapper.mapAndSave(result, 1L);

            var inOrder = inOrder(educationRepository);
            inOrder.verify(educationRepository).deleteAllByProfileId(100L);
            inOrder.verify(educationRepository).saveAll(anyList());
        }

        @Test
        void mapAndSave_deletesOldWorkExperienceBeforeInserting() {
            mockUserFoundWithProfile();
            AiCvExtractionResult result = buildAiResult(null, null, null, null, null, null,
                    null, null, null, null, null,
                    List.of(new AiCvExtractionResult.WorkExperienceEntry("Google", "Dev", "APIs", "2020-01", null, false)));

            profileDataMapper.mapAndSave(result, 1L);

            var inOrder = inOrder(workExperienceRepository);
            inOrder.verify(workExperienceRepository).deleteAllByProfileId(100L);
            inOrder.verify(workExperienceRepository).saveAll(anyList());
        }

        @Test
        void mapAndSave_isCurrent_nullDefaultsToFalse() {
            mockUserFoundWithProfile();
            AiCvExtractionResult result = buildAiResult(null, null, null, null, null, null,
                    null, null, null, null, null,
                    List.of(new AiCvExtractionResult.WorkExperienceEntry("Google", "Dev", "APIs", "2020-01", null, null)));

            profileDataMapper.mapAndSave(result, 1L);

            @SuppressWarnings("unchecked")
            ArgumentCaptor<List<WorkExperience>> captor = ArgumentCaptor.forClass(List.class);
            verify(workExperienceRepository).saveAll(captor.capture());

            assertThat(captor.getValue().get(0).getIsCurrent()).isFalse();
        }
    }
}
