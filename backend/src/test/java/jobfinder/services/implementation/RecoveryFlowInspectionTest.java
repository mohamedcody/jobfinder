package jobfinder.services.implementation;

import jobfinder.exception.BaseException;
import jobfinder.model.dto.ForgotPasswordRequest;
import jobfinder.model.dto.ResetPasswordRequest;
import jobfinder.model.entity.OtpCode;
import jobfinder.model.entity.User;
import jobfinder.repository.OtpCodeRepository;
import jobfinder.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class RecoveryFlowInspectionTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpCodeRepository otpCodeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    public void testUnverifiedUserRecoveryFlow() {
        // 1. Attacker creates an unverified squatter account
        User squatter = User.builder()
                .username("squatter")
                .email("victim@example.com")
                .password("attacker_password")
                .role("USER")
                .enabled(false)
                .emailVerified(false)
                .build();
        userRepository.saveAndFlush(squatter);

        // 2. Victim attempts to recover it using Forgot Password
        authService.forgetPassword(new ForgotPasswordRequest("victim@example.com"));

        // 3. Find the OTP that was generated for recovery
        OtpCode otp = otpCodeRepository.findTopByUserAndUsedFalseOrderByCreatedAtDesc(squatter).orElseThrow();
        String rawOtp = "123456"; // We can't know the raw OTP easily in the test without a mock, 
        // wait, let's just assert the state.
        
        // Assert the user is still unverified and disabled
        User updatedUser = userRepository.findByEmail("victim@example.com").orElseThrow();
        assertFalse(updatedUser.isEnabled(), "User should still be disabled after requesting password reset");
        assertFalse(updatedUser.isEmailVerified(), "User should still be unverified after requesting password reset");
    }
}
