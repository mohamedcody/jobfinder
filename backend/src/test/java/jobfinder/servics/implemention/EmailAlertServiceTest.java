package jobfinder.servics.implemention;

import jobfinder.exception.BaseException;
import jobfinder.model.dto.JobMatchDto;
import jobfinder.model.entity.EmailAlertSetting;
import jobfinder.model.entity.User;
import jobfinder.model.entity.UserProfile;
import jobfinder.repository.EmailAlertSettingRepository;
import jobfinder.repository.UserRepository;
import jobfinder.services.implementation.EmailAlertService;
import jobfinder.services.implementation.EmailNotificationService;
import jobfinder.services.implementation.JobMatchingService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailAlertServiceTest {

    // 1. تعريف الكومبارس (Mocks)
    @Mock
    private EmailAlertSettingRepository emailAlertSettingRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private JobMatchingService jobMatchingService;
    @Mock
    private EmailNotificationService emailNotificationService;

    // 2. تعريف البطل اللي هنختبره
    @InjectMocks
    private EmailAlertService emailAlertService;

    @Test
    void triggerTestEmail_ShouldSendEmail_WhenMatchesFoundAboveThreshold() {
        // ==========================================
        // 1. Arrange (جهّز المسرح والداتا)
        // ==========================================
        Long userId = 1L;
        String username = "Saad";
        String email = "saad@test.com";

        // تجهيز اليوزر والبروفايل
        User mockUser = new User();
        mockUser.setId(userId);
        mockUser.setEmail(email);

        UserProfile mockProfile = new UserProfile();
        mockProfile.setCurrentJobTitle("Java Developer");
        mockUser.setProfile(mockProfile);

        // تجهيز الوظايف اللي هترجع من دالة الـ Matching (وظيفة سكور 80 ووظيفة 50)
        JobMatchDto highMatchJob = JobMatchDto.builder().matchScore(80).build();
        JobMatchDto lowMatchJob = JobMatchDto.builder().matchScore(50).build();

        // برمجة الممثلين (Mocks)
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(emailAlertSettingRepository.findByUserId(userId)).thenReturn(Optional.empty()); // عشان نختبر الديفولت (60)
        when(jobMatchingService.findTopMatchesForUser(eq(mockProfile), anyInt()))
                .thenReturn(List.of(highMatchJob, lowMatchJob));

        // ==========================================
        // 2. Act (شغّل الأكشن)
        // ==========================================
        String result = emailAlertService.triggerTestEmail(userId, username);

        // ==========================================
        // 3. Assert (حاسب على النتيجة)
        // ==========================================
        // بنتأكد إن الرسالة اللي رجعت صح ومكتوب فيها إن في وظيفة واحدة (لأن التانية السكور بتاعها أقل من 60)
        assertTrue(result.contains("triggered for 1 jobs"));
        
        // الأهم: بنتأكد إن دالة الإرسال اتندهت مرة واحدة بس، وبتاخد لستة فيها وظيفة واحدة
        verify(emailNotificationService, times(1)).sendDailyDigest(eq(email), eq(username), argThat(list -> list.size() == 1));
    }
}