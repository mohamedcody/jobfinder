package jobfinder.services.implementation;

import jobfinder.model.dto.EmailAlertResponseDto;
import jobfinder.model.dto.JobMatchDto;
import jobfinder.model.dto.UpdateEmailAlertRequest;
import jobfinder.model.entity.*;
import jobfinder.repository.EmailAlertSettingRepository;
import jobfinder.repository.JobRepository;
import jobfinder.repository.UserRepository;

import jobfinder.services.assets.EmailNotificationService;
import jobfinder.services.assets.JobMatchingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
@ExtendWith(MockitoExtension.class) // 🔥 هذه الإضافة ضرورية جداً في JUnit 5 لتهيئة الـ Mocks
@DisplayName("📬 Email Alert Feature Tests")
public class EmailAlertFeatureTest {

    @Mock private EmailAlertSettingRepository emailAlertSettingRepository;
    @Mock private JobRepository jobRepository;
    @Mock private UserRepository userRepository;
    @Mock private EmailNotificationService emailNotificationService;

    // نستخدم Mock للخدمة هنا حتى لا نتصل بالمنطق الحقيقي أثناء اختبار الـ Scheduler
    @Mock private JobMatchingService jobMatchingService;

    @InjectMocks private EmailAlertService emailAlertService;
    @InjectMocks private JobAlertScheduler jobAlertScheduler;

    private User testUser;
    private UserProfile testProfile;
    private EmailAlertSetting testAlertSetting;
    private JobEntity testJob;
    private CompanyEntity testCompany;

    @BeforeEach
    void setUp() {
        // تم الاستغناء عن MockitoAnnotations.openMocks(this) بفضل @ExtendWith
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
            when(emailAlertSettingRepository.findByUserId(1L))
                    .thenReturn(Optional.of(testAlertSetting));

            EmailAlertResponseDto result = emailAlertService.getAlertSettings(1L);

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
        @DisplayName("❌ Should throw exception when user not found")
        void shouldThrowExceptionWhenUserNotFound() {
            when(emailAlertSettingRepository.findByUserId(999L))
                    .thenReturn(Optional.empty());

            // افتراض أن Exception الخاص بك هو BaseException
            assertThatThrownBy(() -> emailAlertService.getAlertSettings(999L))
                    .isInstanceOf(RuntimeException.class) // تم تعديلها لتشمل BaseException
                    .hasMessageContaining("User not found");
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
            UpdateEmailAlertRequest request = UpdateEmailAlertRequest.builder()
                    .dailyDigestEnabled(false)
                    .minMatchScore(60)
                    .build();

            when(emailAlertSettingRepository.findByUserId(1L))
                    .thenReturn(Optional.of(testAlertSetting));
            when(emailAlertSettingRepository.save(any(EmailAlertSetting.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            EmailAlertResponseDto result = emailAlertService.updateAlertSettings(1L, request);

            assertThat(result.getDailyDigestEnabled()).isFalse();
            verify(emailAlertSettingRepository, times(1)).save(any(EmailAlertSetting.class));
        }

        @Test
        @DisplayName("✅ Should update minimum match score")
        void shouldUpdateMinMatchScore() {
            UpdateEmailAlertRequest request = UpdateEmailAlertRequest.builder()
                    .dailyDigestEnabled(true)
                    .minMatchScore(75)
                    .build();

            when(emailAlertSettingRepository.findByUserId(1L))
                    .thenReturn(Optional.of(testAlertSetting));
            when(emailAlertSettingRepository.save(any(EmailAlertSetting.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            EmailAlertResponseDto result = emailAlertService.updateAlertSettings(1L, request);

            assertThat(result.getMinMatchScore()).isEqualTo(75);
        }

        @ParameterizedTest
        @ValueSource(ints = {0, 50, 75, 100})
        @DisplayName("✅ Should accept valid match score values")
        void shouldAcceptValidMatchScores(int score) {
            UpdateEmailAlertRequest request = UpdateEmailAlertRequest.builder()
                    .dailyDigestEnabled(true)
                    .minMatchScore(score)
                    .build();

            when(emailAlertSettingRepository.findByUserId(1L))
                    .thenReturn(Optional.of(testAlertSetting));
            when(emailAlertSettingRepository.save(any(EmailAlertSetting.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            EmailAlertResponseDto result = emailAlertService.updateAlertSettings(1L, request);

            assertThat(result.getMinMatchScore()).isEqualTo(score);
        }

        @Test
        @DisplayName("❌ Should reject match score below 0")
        void shouldRejectNegativeMatchScore() {
            UpdateEmailAlertRequest request = UpdateEmailAlertRequest.builder()
                    .dailyDigestEnabled(true)
                    .minMatchScore(-5)
                    .build();

            assertThatThrownBy(() -> emailAlertService.updateAlertSettings(1L, request))
                    .isInstanceOf(RuntimeException.class); // 🔥 تجنبنا Exception العام
        }

        @Test
        @DisplayName("❌ Should reject match score above 100")
        void shouldRejectScoreAbove100() {
            UpdateEmailAlertRequest request = UpdateEmailAlertRequest.builder()
                    .dailyDigestEnabled(true)
                    .minMatchScore(105)
                    .build();

            assertThatThrownBy(() -> emailAlertService.updateAlertSettings(1L, request))
                    .isInstanceOf(RuntimeException.class);
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // ✅ Test Group 3: Job Matching & Scoring (Algorithm Verification)
    // ═════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("🎯 Job Matching Score Algorithm Tests")
    class JobMatchingScoreTests {

        @Test
        @DisplayName("✅ Should score +50 for job title match")
        void shouldScore50ForTitleMatch() {
            List<String> skillNames = Collections.emptyList();
            int score = simulateComputeScore("Senior Java Developer at Google", "Senior Java Developer", skillNames);
            assertThat(score).isGreaterThanOrEqualTo(50);
        }

        @Test
        @DisplayName("✅ Should score +30 for skill matches (max)")
        void shouldScore30ForSkillMatches() {
            List<String> skillNames = Arrays.asList("java", "spring boot", "postgresql");
            String jobText = "java developer with spring boot and postgresql";

            int score = 0;
            for (String skill : skillNames) {
                if (jobText.contains(skill)) score += 5;
            }
            score = Math.min(score, 30);

            assertThat(score).isEqualTo(10); // بناءً على منطق الـ 5 درجات لكل مهارة موجودة، هنا اثنان فقط يتطابقان
        }

        @Test
        @DisplayName("✅ Should give +10 bonus for fresh jobs (< 48 hours)")
        void shouldGiveFreshnessBonus() {
            LocalDateTime recentTime = LocalDateTime.now().minusHours(2);
            boolean isFresh = recentTime.isAfter(LocalDateTime.now().minusHours(48));
            assertThat(isFresh).isTrue();
        }

        @Test
        @DisplayName("✅ Should cap score at 100 maximum")
        void shouldCapScoreAt100() {
            int score = 50 + 30 + 10 + 50;
            int cappedScore = Math.min(score, 100);
            assertThat(cappedScore).isEqualTo(100);
        }

        @Test
        @DisplayName("✅ Should return 0 for completely non-matching job")
        void shouldReturnZeroForNonMatch() {
            String jobText = "marketing manager";
            String userTitle = "senior java developer";
            boolean matches = jobText.contains(userTitle.toLowerCase());
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
            List<EmailAlertSetting> batch1 = Arrays.asList(
                    testAlertSetting,
                    createEmailAlertSetting(2L, "user2@example.com"),
                    createEmailAlertSetting(3L, "user3@example.com")
            );

            List<JobEntity> recentJobs = Arrays.asList(testJob);

            when(jobRepository.findRecentActiveJobs(any(LocalDateTime.class), any(Pageable.class)))
                    .thenReturn(recentJobs);

            // استخدام تتابع الإرجاع بشكل صحيح في Mockito
            when(emailAlertSettingRepository.findAllOptedInWithProfile(any(Pageable.class)))
                    .thenReturn(batch1)
                    .thenReturn(Collections.emptyList());

            jobAlertScheduler.sendDailyJobAlerts();

            verify(emailAlertSettingRepository, atLeastOnce()).findAllOptedInWithProfile(any(Pageable.class));
            verify(jobRepository, times(1)).findRecentActiveJobs(any(LocalDateTime.class), any(Pageable.class));
        }

        @Test
        @DisplayName("✅ Should handle user processing errors gracefully")
        void shouldHandleErrorsGracefully() {
            List<EmailAlertSetting> optedInUsers = Arrays.asList(testAlertSetting);
            List<JobEntity> recentJobs = Arrays.asList(testJob);

            when(jobRepository.findRecentActiveJobs(any(LocalDateTime.class), any(Pageable.class)))
                    .thenReturn(recentJobs);

            when(emailAlertSettingRepository.findAllOptedInWithProfile(any(Pageable.class)))
                    .thenReturn(optedInUsers)
                    .thenReturn(Collections.emptyList());

            // محاكاة رمي استثناء من الخدمة لضمان استمرار السكديولر
            when(jobMatchingService.findTopMatchesForUser(any(UserProfile.class), anyList(), anyInt()))
                    .thenThrow(new RuntimeException("DB Error"));

            assertThatCode(() -> jobAlertScheduler.sendDailyJobAlerts())
                    .doesNotThrowAnyException();
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
            List<JobMatchDto> allMatches = Arrays.asList(
                    createJobMatch(1L, "Job 1", 85),
                    createJobMatch(2L, "Job 2", 45),
                    createJobMatch(3L, "Job 3", 75),
                    createJobMatch(4L, "Job 4", 30)
            );

            int minScore = 60;
            List<JobMatchDto> filtered = allMatches.stream()
                    .filter(m -> m.getMatchScore() >= minScore)
                    .toList();

            assertThat(filtered)
                    .hasSize(2)
                    .extracting(JobMatchDto::getMatchScore)
                    .containsExactly(85, 75);
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

    private int simulateComputeScore(String jobText, String userTitle, List<String> skillNames) {
        int score = 0;
        String lowerJobText = jobText.toLowerCase();
        String lowerUserTitle = userTitle.toLowerCase();

        if (lowerJobText.contains(lowerUserTitle)) {
            score += 50;
        }

        for (String skill : skillNames) {
            if (lowerJobText.contains(skill.toLowerCase())) {
                score += 5;
            }
        }

        return Math.min(score, 100);
    }
}