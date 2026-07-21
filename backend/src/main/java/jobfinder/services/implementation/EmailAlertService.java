package jobfinder.services.implementation;

import jobfinder.exception.BaseException;
import jobfinder.exception.ErrorCode;
import jobfinder.model.dto.EmailAlertResponseDto;
import jobfinder.model.dto.JobMatchDto;
import jobfinder.model.dto.UpdateEmailAlertRequest;
import jobfinder.model.entity.EmailAlertSetting;
import jobfinder.model.entity.User;
import jobfinder.model.entity.UserProfile;
import jobfinder.repository.EmailAlertSettingRepository;
import jobfinder.repository.UserRepository;
import jobfinder.services.assets.EmailNotificationService;
import jobfinder.services.assets.JobMatchingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailAlertService {

    private final EmailAlertSettingRepository emailAlertSettingRepository;
    private final UserRepository userRepository;
    private final JobMatchingService jobMatchingService;
    private final EmailNotificationService emailNotificationService;

    /** القيمة الافتراضية للحد الأدنى لنسبة الماتش لأي يوزر جديد (كانت مكررة كرقم 60 في مكانين). */
    private static final int DEFAULT_MIN_MATCH_SCORE = 60;

    @Transactional
    public EmailAlertResponseDto getAlertSettings(Long userId) {
        EmailAlertSetting setting = getOrCreateDefaultSettings(userId);
        return toDto(setting);
    }

    @Transactional
    public EmailAlertResponseDto updateAlertSettings(Long userId, UpdateEmailAlertRequest request) {
        EmailAlertSetting setting = getOrCreateDefaultSettings(userId);
        setting.setDailyDigestEnabled(request.getDailyDigestEnabled());
        setting.setMinMatchScore(request.getMinMatchScore());

        EmailAlertSetting saved = emailAlertSettingRepository.save(setting);
        log.info("Updated email alert settings for user ID {}", userId);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public String triggerTestEmail(Long userId, String username) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND, "User not found"));

        UserProfile profile = user.getProfile();
        if (profile == null || profile.getCurrentJobTitle() == null || profile.getCurrentJobTitle().isBlank()) {
            throw new BaseException(ErrorCode.INVALID_INPUT,
                    "Please update your profile with a current job title first.");
        }

        // Use findByUserId to avoid creating defaults during a read-only test operation
        // if they don't exist,
        // though typically they will exist. If not, fallback to default threshold.
        int minScore = emailAlertSettingRepository.findByUserId(userId)
                .map(EmailAlertSetting::getMinMatchScore)
                .orElse(DEFAULT_MIN_MATCH_SCORE);

        List<JobMatchDto> matches = jobMatchingService.findTopMatchesForUser(profile, 5)
                .stream()
                .filter(m -> m.getMatchScore() >= minScore)
                .toList();

        if (matches.isEmpty()) {
            return "No matches found above your minimum score (" + minScore + "%). " +
                    "Try updating your profile job title or skills to match recently scraped jobs.";
        }

        emailNotificationService.sendDailyDigest(user.getEmail(), username, matches);
        return "Test matching email triggered for " + matches.size() + " jobs. Sent to: " + user.getEmail();
    }

    /**
     * ✅ تصليح الـ Race Condition اللي كانت بتسبب Duplicate Key violation:
     *
     * السيناريو القديم: لو ريكوستين جم في نفس اللحظة بالظبط لنفس اليوزر (مثلاً
     * فتح صفحة الإعدادات مرتين، أو Retry من الـ Frontend)، الاتنين بيعملوا
     * findByUserId ويلاقوها فاضية (لسه محدش عمل insert)، فالاتنين بيحاولوا
     * يعملوا save() لنفس الـ user_id → الداتابيز بترفض التاني بـ
     * DataIntegrityViolationException لأن فيه unique constraint على user_id.
     *
     * الحل: نلف الـ insert في try/catch، ولو حصل تعارض (يعني حد تاني كسبنا
     * بالسبق) نرجع نقرا القيمة اللي اتعملها بالفعل بدل ما نرمي error للمستخدم.
     * ده معروف باسم "optimistic insert with fallback read".
     */
    private EmailAlertSetting getOrCreateDefaultSettings(Long userId) {
        return emailAlertSettingRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettingsSafely(userId));
    }

    private EmailAlertSetting createDefaultSettingsSafely(Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND, "User not found"));

            EmailAlertSetting newSetting = EmailAlertSetting.builder()
                    .user(user)
                    .dailyDigestEnabled(true)
                    .minMatchScore(DEFAULT_MIN_MATCH_SCORE)
                    .build();

            return emailAlertSettingRepository.save(newSetting);

        } catch (DataIntegrityViolationException e) {
            // حد تاني (Request موازي) كسبنا بالسبق وعمل الـ insert قبلنا بجزء من الثانية.
            // مفيش داعي نرمي error؛ ببساطة نرجع نقرا الصف اللي هو عمله.
            log.warn("Concurrent insert detected for user ID {}. Falling back to existing row.", userId);
            return emailAlertSettingRepository.findByUserId(userId)
                    .orElseThrow(() -> new BaseException(ErrorCode.INTERNAL_ERROR,
                            "Failed to create or retrieve email alert settings for user " + userId));
        }
    }

    private EmailAlertResponseDto toDto(EmailAlertSetting setting) {
        return EmailAlertResponseDto.builder()
                .dailyDigestEnabled(setting.getDailyDigestEnabled())
                .minMatchScore(setting.getMinMatchScore())
                .build();
    }
}