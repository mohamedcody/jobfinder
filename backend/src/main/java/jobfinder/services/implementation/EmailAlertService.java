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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
                .orElse(60);

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

    private EmailAlertSetting getOrCreateDefaultSettings(Long userId) {
        return emailAlertSettingRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND, "User not found"));

                    EmailAlertSetting newSetting = EmailAlertSetting.builder()
                            .user(user)
                            .dailyDigestEnabled(true)
                            .minMatchScore(60)
                            .build();

                    return emailAlertSettingRepository.save(newSetting);
                });
    }

    private EmailAlertResponseDto toDto(EmailAlertSetting setting) {
        return EmailAlertResponseDto.builder()
                .dailyDigestEnabled(setting.getDailyDigestEnabled())
                .minMatchScore(setting.getMinMatchScore())
                .build();
    }
}
