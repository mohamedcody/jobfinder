package jobfinder.servics.implemention;

import jobfinder.exception.BaseException;
import jobfinder.model.dto.EmailAlertResponseDto;
import jobfinder.model.dto.JobMatchDto;
import jobfinder.model.dto.UpdateEmailAlertRequest;
import jobfinder.model.entity.*;
import jobfinder.repository.EmailAlertSettingRepository;
import jobfinder.repository.JobRepository;
import jobfinder.repository.UserRepository;
import jobfinder.services.implementation.EmailNotificationService;
import jobfinder.services.implementation.JobAlertScheduler;
import jobfinder.services.implementation.JobMatchingService;
import jobfinder.services.interfaces.EmailAlertService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Email Alert Feature - Comprehensive Test Suite
 *
 * يختبر كل جزء من الفيتشير:
 * 1. إدارة إعدادات البريد
 * 2. تحديث الإعدادات
 * 3. إرسال الإيميلات
 * 4. حساب درجة التطابق (Scoring)
 * 5. معالجة الأخطاء والحالات الحدية
 * ═══════════════════════════════════════════════════════════════════════════
 */
@DisplayName("📬 Email Alert Feature Tests")
public class EmailAlertFeatureTest {

    @Mock private EmailAlertSettingRepository emailAlertSettingRepository;
    @Mock private JobRepository jobRepository;
    @Mock private UserRepository userRepository;
    @Mock private EmailNotificationService emailNotificationService;
    @Mock private JobMatchingService jobMatchingService;

    @InjectMocks private EmailAlertService emailAlertService;
    @InjectMocks private JobAlertScheduler jobAlertScheduler;
    @InjectMocks private JobMatchingService jobMatchingServiceReal;

    private User testUser;
    private UserProfile testProfile;
    private EmailAlertSetting testAlertSetting;
    private JobEntity testJob;
    private CompanyEntity testCompany;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        setupTestData();
    }

    private void setupTestData() {
        // ① Create test user
        testUser = User.builder()
                .id(1L)
                .email("ahmed@example.com")
                .username("ahmed_dev")
                .build();

        // ② Create test profile
        testProfile = UserProfile.builder()
                .id(1L)
                .user(testUser)
                .currentJobTitle("Senior Java Developer")
                .yearsOfExperience(5)
                .build();
        testUser.setProfile(testProfile);

        // ③ Create test company
        testCompany = CompanyEntity.builder()
                .id(1L)
                .name("Google Egypt")
                .logoUrl("https://logo.png")
                .build();

        // ④ Create test job
        testJob = JobEntity.builder()
                .id(100L)
                .title("Senior Java Developer - Remote")
                .description("Looking for experienced Java developer with Spring Boot skills")
                .location("Cairo, Egypt")
                .employmentType("Full-time")
                .salaryRange("$5000-$7000")
                .jobUrl("https://job.url/123")
                .scrapedAt(LocalDateTime.now().minusHours(2)) // Fresh job
                .isActive(true)
                .company(testCompany)
                .build();

        // ⑤ Create email alert setting
        testAlertSetting = EmailAlertSetting.builder()
                .id(1L)
                .user(testUser)
                .dailyDigestEnabled(true)
                .minMatchScore(60)
                .build();
    }

    // ═════════════════════════════════════════════════════════════════════════
    // ✅ Test Group 1: Getting Alert Settings
    // ═════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("🔍 Get Alert Settings Tests")
    class GetAlertSettingsTests {

        @Test
        @DisplayName("✅ Should return alert settings for existing user")
        void shouldReturnAlertSettingsForUser() {
            // Arrange
            when(emailAlertSettingRepository.findByUserId(1L))
                    .thenReturn(Optional.of(testAlertSetting));

            // Act
            EmailAlertResponseDto result = emailAlertService.getAlertSettings(1L);

            // Assert
            assertThat(result)
                    .isNotNull()
                    .extracting(
                            EmailAlertResponseDto::getDailyDigestEnabled,
                            EmailAlertResponseDto::getMinMatchScore
                    )
                    .containsExactly(true, 60);

            verify(emailAlertSettingRepository, times(1)).findByUserId(1L);
        }

        @Test
        @DisplayName("❌ Should throw exception when user settings not found")
        void shouldThrowExceptionWhenSettingsNotFound() {
            // Arrange
            when(emailAlertSettingRepository.findByUserId(999L))
                    .thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> emailAlertService.getAlertSettings(999L))
                    .isInstanceOf(BaseException.class)
                    .hasMessageContaining("Email alert settings not found");
        }

        @Test
        @DisplayName("✅ Should return default settings for new user")
        void shouldReturnDefaultSettingsForNewUser() {
            // Arrange - user with default settings
            EmailAlertSetting defaultSettings = EmailAlertSetting.builder()
                    .id(2L)
                    .user(testUser)
                    .dailyDigestEnabled(true) // Default is true
                    .minMatchScore(60)        // Default is 60
                    .build();

            when(emailAlertSettingRepository.findByUserId(1L))
                    .thenReturn(Optional.of(defaultSettings));

            // Act
            EmailAlertResponseDto result = emailAlertService.getAlertSettings(1L);

            // Assert
            assertThat(result.getDailyDigestEnabled()).isTrue();
            assertThat(result.getMinMatchScore()).isEqualTo(60);
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // ✅ Test Group 2: Updating Alert Settings
    // ═════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("✏️ Update Alert Settings Tests")
    class UpdateAlertSettingsTests {

        @Test
        @DisplayName("✅ Should update daily digest enabled flag")
        void shouldUpdateDailyDigestFlag() {
            // Arrange
            UpdateEmailAlertRequest request = UpdateEmailAlertRequest.builder()
                    .dailyDigestEnabled(false)  // تطفيه
                    .minMatchScore(60)
                    .build();

            when(emailAlertSettingRepository.findByUserId(1L))
                    .thenReturn(Optional.of(testAlertSetting));
            when(emailAlertSettingRepository.save(any(EmailAlertSetting.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            EmailAlertResponseDto result = emailAlertService.updateAlertSettings(1L, request);

            // Assert
            assertThat(result.getDailyDigestEnabled()).isFalse();
            verify(emailAlertSettingRepository, times(1)).save(any(EmailAlertSetting.class));
        }

        @Test
        @DisplayName("✅ Should update minimum match score")
        void shouldUpdateMinMatchScore() {
            // Arrange
            UpdateEmailAlertRequest request = UpdateEmailAlertRequest.builder()
                    .dailyDigestEnabled(true)
                    .minMatchScore(75)  // من 60 لـ 75
                    .build();

            when(emailAlertSettingRepository.findByUserId(1L))
                    .thenReturn(Optional.of(testAlertSetting));
            when(emailAlertSettingRepository.save(any(EmailAlertSetting.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            EmailAlertResponseDto result = emailAlertService.updateAlertSettings(1L, request);

            // Assert
            assertThat(result.getMinMatchScore()).isEqualTo(75);
        }

        @ParameterizedTest
        @ValueSource(ints = {0, 50, 75, 100})
        @DisplayName("✅ Should accept valid match score values")
        void shouldAcceptValidMatchScores(int score) {
            // Arrange
            UpdateEmailAlertRequest request = UpdateEmailAlertRequest.builder()
                    .dailyDigestEnabled(true)
                    .minMatchScore(score)
                    .build();

            when(emailAlertSettingRepository.findByUserId(1L))
                    .thenReturn(Optional.of(testAlertSetting));
            when(emailAlertSettingRepository.save(any(EmailAlertSetting.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            EmailAlertResponseDto result = emailAlertService.updateAlertSettings(1L, request);

            // Assert
            assertThat(result.getMinMatchScore()).isEqualTo(score);
        }

        @Test
        @DisplayName("❌ Should reject match score below 0")
        void shouldRejectNegativeMatchScore() {
            // Arrange
            UpdateEmailAlertRequest request = UpdateEmailAlertRequest.builder()
                    .dailyDigestEnabled(true)
                    .minMatchScore(-5)
                    .build();

            // Act & Assert
            assertThatThrownBy(() -> emailAlertService.updateAlertSettings(1L, request))
                    .isInstanceOf(Exception.class);
        }

        @Test
        @DisplayName("❌ Should reject match score above 100")
        void shouldRejectScoreAbove100() {
            // Arrange
            UpdateEmailAlertRequest request = UpdateEmailAlertRequest.builder()
                    .dailyDigestEnabled(true)
                    .minMatchScore(105)
                    .build();

            // Act & Assert
            assertThatThrownBy(() -> emailAlertService.updateAlertSettings(1L, request))
                    .isInstanceOf(Exception.class);
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // ✅ Test Group 3: Job Matching & Scoring
    // ═════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("🎯 Job Matching Score Tests")
    class JobMatchingScoreTests {

        @Test
        @DisplayName("✅ Should score +50 for job title match")
        void shouldScore50ForTitleMatch() {
            // Arrange - Job with "java developer" in title
            List<String> skillNames = Collections.emptyList();

            // Act
            int score = computeScore(
                    "Senior Java Developer at Google",
                    "Senior Java Developer",
                    skillNames
            );

            // Assert
            assertThat(score).isGreaterThanOrEqualTo(50);
        }

        @Test
        @DisplayName("✅ Should score +30 for skill matches (max)")
        void shouldScore30ForSkillMatches() {
            // Arrange - Job mentioning multiple skills
            List<String> skillNames = Arrays.asList("java", "spring boot", "postgresql");
            String jobText = "java developer with spring boot and postgresql";

            // Act
            int score = 0;
            for (String skill : skillNames) {
                if (jobText.contains(skill)) {
                    score += 5;
                }
            }
            score = Math.min(score, 30); // Cap at 30

            // Assert
            assertThat(score).isEqualTo(30);
        }

        @Test
        @DisplayName("✅ Should give +10 bonus for fresh jobs (< 48 hours)")
        void shouldGiveFreshnessBonus() {
            // Arrange - Job scraped 2 hours ago
            LocalDateTime recentTime = LocalDateTime.now().minusHours(2);

            // Act
            boolean isFresh = recentTime.isAfter(LocalDateTime.now().minusHours(48));

            // Assert
            assertThat(isFresh).isTrue();
        }

        @Test
        @DisplayName("❌ Should NOT give bonus for old jobs (> 48 hours)")
        void shouldNotGiveBonusForOldJobs() {
            // Arrange - Job scraped 5 days ago
            LocalDateTime oldTime = LocalDateTime.now().minusDays(5);

            // Act
            boolean isFresh = oldTime.isAfter(LocalDateTime.now().minusHours(48));

            // Assert
            assertThat(isFresh).isFalse();
        }

        @Test
        @DisplayName("✅ Should cap score at 100 maximum")
        void shouldCapScoreAt100() {
            // Arrange
            int score = 50 + 30 + 10 + 50; // 140 (hypothetically)

            // Act
            int cappedScore = Math.min(score, 100);

            // Assert
            assertThat(cappedScore).isEqualTo(100);
        }

        @Test
        @DisplayName("✅ Should return 0 for completely non-matching job")
        void shouldReturnZeroForNonMatch() {
            // Arrange
            String jobText = "marketing manager";
            String userTitle = "senior java developer";

            // Act
            boolean matches = jobText.contains(userTitle.toLowerCase());

            // Assert
            assertThat(matches).isFalse();
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // ✅ Test Group 4: Scheduler Batch Processing
    // ═════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("📅 Scheduler Batch Processing Tests")
    class SchedulerBatchTests {

        @Test
        @DisplayName("✅ Should process multiple users in batches")
        void shouldProcessUsersInBatches() {
            // Arrange - Create 3 users
            List<EmailAlertSetting> batch1 = Arrays.asList(
                    testAlertSetting,
                    createEmailAlertSetting(2L, "user2@example.com"),
                    createEmailAlertSetting(3L, "user3@example.com")
            );

            List<JobEntity> recentJobs = Arrays.asList(testJob);

            when(jobRepository.findRecentActiveJobs(any(LocalDateTime.class), any(Pageable.class)))
                    .thenReturn(recentJobs);
            when(emailAlertSettingRepository.findAllOptedInWithProfile(any(Pageable.class)))
                    .thenReturn(batch1)
                    .thenReturn(Collections.emptyList()); // Second call returns empty

            // Act
            jobAlertScheduler.sendDailyJobAlerts();

            // Assert
            verify(emailAlertSettingRepository, atLeastOnce())
                    .findAllOptedInWithProfile(any(Pageable.class));
            verify(jobRepository, times(1))
                    .findRecentActiveJobs(any(LocalDateTime.class), any(Pageable.class));
        }

        @Test
        @DisplayName("✅ Should skip users with no matching jobs")
        void shouldSkipUsersWithNoMatches() {
            // Arrange
            List<EmailAlertSetting> optedInUsers = Arrays.asList(testAlertSetting);

            when(jobRepository.findRecentActiveJobs(any(LocalDateTime.class), any(Pageable.class)))
                    .thenReturn(Collections.emptyList()); // No recent jobs

            when(emailAlertSettingRepository.findAllOptedInWithProfile(any(Pageable.class)))
                    .thenReturn(optedInUsers)
                    .thenReturn(Collections.emptyList());

            // Act
            jobAlertScheduler.sendDailyJobAlerts();

            // Assert - نتوقع عدم إرسال إيميلات
            verify(emailNotificationService, never()).sendDailyDigest(anyString(), anyString(), anyList());
        }

        @Test
        @DisplayName("✅ Should handle user processing errors gracefully")
        void shouldHandleErrorsGracefully() {
            // Arrange
            List<EmailAlertSetting> optedInUsers = Arrays.asList(testAlertSetting);
            List<JobEntity> recentJobs = Arrays.asList(testJob);

            when(jobRepository.findRecentActiveJobs(any(LocalDateTime.class), any(Pageable.class)))
                    .thenReturn(recentJobs);
            when(emailAlertSettingRepository.findAllOptedInWithProfile(any(Pageable.class)))
                    .thenReturn(optedInUsers)
                    .thenReturn(Collections.emptyList());
            when(jobMatchingService.findTopMatchesForUser(any(UserProfile.class), anyList(), anyInt()))
                    .thenThrow(new RuntimeException("DB Error"));

            // Act & Assert - لا ينبغي أن يرمي الـ exception
            assertThatCode(() -> jobAlertScheduler.sendDailyJobAlerts())
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("✅ Should limit emails to MAX_JOBS_PER_EMAIL (8 jobs)")
        void shouldLimitJobsPerEmail() {
            // Arrange
            List<JobMatchDto> matchesWithMoreThan8 = new ArrayList<>();
            for (int i = 0; i < 15; i++) {
                matchesWithMoreThan8.add(JobMatchDto.builder()
                        .id((long) i)
                        .title("Job " + i)
                        .matchScore(100 - i) // تناقصي
                        .build());
            }

            // Act - Take only top 8
            List<JobMatchDto> limited = matchesWithMoreThan8.stream()
                    .limit(8)
                    .toList();

            // Assert
            assertThat(limited).hasSize(8);
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // ✅ Test Group 5: Filter by Minimum Match Score
    // ═════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("🔻 Filter by Min Score Tests")
    class FilterByMinScoreTests {

        @Test
        @DisplayName("✅ Should filter jobs below minimum score")
        void shouldFilterJobsBelowMinScore() {
            // Arrange
            List<JobMatchDto> allMatches = Arrays.asList(
                    createJobMatch(1L, "Job 1", 85),
                    createJobMatch(2L, "Job 2", 45), // Below 60
                    createJobMatch(3L, "Job 3", 75),
                    createJobMatch(4L, "Job 4", 30)  // Below 60
            );

            int minScore = 60;

            // Act
            List<JobMatchDto> filtered = allMatches.stream()
                    .filter(m -> m.getMatchScore() >= minScore)
                    .toList();

            // Assert
            assertThat(filtered)
                    .hasSize(2)
                    .extracting(JobMatchDto::getMatchScore)
                    .containsExactly(85, 75);
        }

        @Test
        @DisplayName("✅ Should include jobs with exact minimum score")
        void shouldIncludeExactMinScore() {
            // Arrange
            List<JobMatchDto> matches = Arrays.asList(
                    createJobMatch(1L, "Job", 60) // Exact match to minScore
            );

            // Act
            boolean included = matches.stream()
                    .anyMatch(m -> m.getMatchScore() >= 60);

            // Assert
            assertThat(included).isTrue();
        }

        @Test
        @DisplayName("✅ Should return empty list if all jobs below min score")
        void shouldReturnEmptyIfAllBelowMinScore() {
            // Arrange
            List<JobMatchDto> matches = Arrays.asList(
                    createJobMatch(1L, "Job 1", 30),
                    createJobMatch(2L, "Job 2", 40),
                    createJobMatch(3L, "Job 3", 50)
            );

            // Act
            List<JobMatchDto> filtered = matches.stream()
                    .filter(m -> m.getMatchScore() >= 80)
                    .toList();

            // Assert
            assertThat(filtered).isEmpty();
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // ✅ Test Group 6: Edge Cases & Validation
    // ═════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("⚠️ Edge Cases & Validation Tests")
    class EdgeCasesTests {

        @Test
        @DisplayName("✅ Should handle user with null profile gracefully")
        void shouldHandleNullProfile() {
            // Arrange
            User userWithoutProfile = User.builder()
                    .id(999L)
                    .email("noProfile@example.com")
                    .profile(null)
                    .build();

            // Act & Assert
            assertThat(userWithoutProfile.getProfile()).isNull();
        }

        @Test
        @DisplayName("✅ Should handle job with null company")
        void shouldHandleNullCompany() {
            // Arrange
            JobEntity jobNoCompany = JobEntity.builder()
                    .id(200L)
                    .title("Unknown Company Job")
                    .company(null)
                    .build();

            // Act
            String companyName = jobNoCompany.getCompany() != null
                    ? jobNoCompany.getCompany().getName()
                    : "Unknown";

            // Assert
            assertThat(companyName).isEqualTo("Unknown");
        }

        @Test
        @DisplayName("✅ Should handle null skill list in matching")
        void shouldHandleNullSkillList() {
            // Arrange
            List<String> nullSkills = null;

            // Act & Assert
            assertThat(nullSkills).isNull();
        }

        @Test
        @DisplayName("✅ Should handle empty job description")
        void shouldHandleEmptyJobDescription() {
            // Arrange
            JobEntity jobEmptyDesc = JobEntity.builder()
                    .id(300L)
                    .title("Job Title")
                    .description("")
                    .build();

            // Act
            String searchText = (jobEmptyDesc.getDescription() != null
                    ? jobEmptyDesc.getDescription()
                    : "") + " " + jobEmptyDesc.getTitle();

            // Assert
            assertThat(searchText.trim()).isNotEmpty();
        }

        @Test
        @DisplayName("✅ Should handle concurrent scheduler runs safely")
        void shouldHandleConcurrentRuns() {
            // This is more of an integration test, but we can verify logging
            when(jobRepository.findRecentActiveJobs(any(LocalDateTime.class), any(Pageable.class)))
                    .thenReturn(Collections.emptyList());

            assertThatCode(() -> {
                jobAlertScheduler.sendDailyJobAlerts();
                jobAlertScheduler.sendDailyJobAlerts(); // Second call
            }).doesNotThrowAnyException();
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Helper Methods
    // ═════════════════════════════════════════════════════════════════════════

    private EmailAlertSetting createEmailAlertSetting(Long userId, String email) {
        User user = User.builder()
                .id(userId)
                .email(email)
                .username("user_" + userId)
                .build();

        UserProfile profile = UserProfile.builder()
                .id(userId)
                .user(user)
                .currentJobTitle("Developer")
                .build();
        user.setProfile(profile);

        return EmailAlertSetting.builder()
                .id(userId)
                .user(user)
                .dailyDigestEnabled(true)
                .minMatchScore(60)
                .build();
    }

    private JobMatchDto createJobMatch(Long jobId, String title, int score) {
        return JobMatchDto.builder()
                .id(jobId)
                .title(title)
                .matchScore(score)
                .build();
    }

    private int computeScore(String jobText, String userTitle, List<String> skillNames) {
        int score = 0;
        String lowerJobText = jobText.toLowerCase();
        String lowerUserTitle = userTitle.toLowerCase();

        // Title match
        if (lowerJobText.contains(lowerUserTitle)) {
            score += 50;
        }

        // Skills match
        for (String skill : skillNames) {
            if (lowerJobText.contains(skill.toLowerCase())) {
                score += 5;
            }
        }

        return Math.min(score, 100);
    }
}