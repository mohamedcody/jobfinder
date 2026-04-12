package jobfinder.servics.implemention;

import jobfinder.exception.BaseException;
import jobfinder.exception.ErrorCode;
import jobfinder.model.entity.OtpCode;
import jobfinder.repository.OtpCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;


@Service // Marks this class as a Spring Service bean
@RequiredArgsConstructor // Generates a constructor for final fields (Dependency Injection)
public class OtpService {

    private final OtpCodeRepository otpCodeRepository;

    /**
     * Updates the failed attempts for a specific OTP.
     * Uses a NEW transaction to ensure the count is saved even if the main process fails.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, noRollbackFor = BaseException.class)
    public void handleFailedAttempt(Long otpId) {
        // Fetch OTP or throw an exception if not found
        OtpCode otp = otpCodeRepository.findById(otpId)
                .orElseThrow(() -> new BaseException(ErrorCode.INVALID_OTP));

        // Increment the attempt counter
        int currentAttempts = (otp.getAttempts() == null ? 0 : otp.getAttempts()) + 1;
        otp.setAttempts(currentAttempts);

        // Check if user exceeded the maximum allowed attempts (3)
        if (currentAttempts >= 3) {
            otp.setUsed(true); // Invalidate the OTP
            otpCodeRepository.saveAndFlush(otp); // Force immediate database update
            throw new BaseException(
                    ErrorCode.MAX_OTP_ATTEMPTS_REACHED,
                    "Maximum attempts reached. Please request a new OTP code after 2 minutes."
            );
        }

        otpCodeRepository.saveAndFlush(otp);
        throw new BaseException(ErrorCode.INVALID_OTP, "Invalid OTP. Attempt: " + currentAttempts);
    }

    /**
     * Scheduled task to remove OTP records older than 10 days.
     * Runs daily at 3:00 AM.
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupOldOtps() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(10);
        otpCodeRepository.deleteAllByCreatedAtBefore(cutoff);
    }
}
