package jobfinder.servics.implemention;
import jakarta.transaction.Transactional;
import jobfinder.config.CustomUserDetails;
import jobfinder.exception.BaseException;
import jobfinder.exception.ErrorCode;
import jobfinder.model.dto.*;
import jobfinder.model.entity.OtpCode;
import jobfinder.model.entity.User;
import jobfinder.repository.OtpCodeRepository;
import jobfinder.repository.UserRepository;
import jobfinder.servics.interfaces.AuthInterface;
import jobfinder.util.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService implements AuthInterface {

    private final UserRepository userRepository;
    private final OtpCodeRepository otpCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emilService;
    private final LoginAttemptService loginAttemptService;
    private final EmailValidatorService emailValidatorService;
    private final OtpService otpService ;
    private static final SecureRandom secureRandom = new SecureRandom();
    private static final long OTP_RESEND_COOLDOWN_MINUTES = 2;


    @Override
    public AuthResponse register(RegisterRequest request) {


        if (!emailValidatorService.isEmailDomainValid(request.email())) {
            throw new BaseException(ErrorCode.INVALID_INPUT, "Email domain does not exist!");
        }

        // 2. Check for existence (Or let DB handle it via Unique Constraints)
        if (userRepository.existsByEmail(request.email())) {
            throw new BaseException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new BaseException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }




        if (userRepository.existsByUsername(request.username())) {
            throw new BaseException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }


        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role("USER")
                .enabled(false)
                .emailVerified(false)
                .build();
        userRepository.save(user);

        saveAndSendOtpInterna(user);

        return new AuthResponse(null, user.getEmail(), user.getRole(), "Please verify your email");
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        if (request.identifier() == null || request.password() == null) {
            throw new BaseException(ErrorCode.INVALID_INPUT);
        }

        User user = userRepository.findByEmailOrUsername(request.identifier())
                .orElseThrow(() -> new BaseException(ErrorCode.INVALID_CREDENTIALS));

        // التأكد من حالة الحساب والـ Lockout
        if (!user.isEnabled()) {
            throw new BaseException(ErrorCode.ACCOUNT_NOT_ACTIVATED);
        }

        if (user.getLockoutTime() != null && user.getLockoutTime().isAfter(LocalDateTime.now())) {
            throw new BaseException(ErrorCode.ACCOUNT_LOCKED);
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.identifier(), request.password())
            );

            // لو نجح: نصفر المحاولات باستخدام السيرفس الخارجي لضمان الحفظ
            loginAttemptService.resetAttempts(user.getEmail());
            user.setLastLoginAt(LocalDateTime.now());

        } catch (BadCredentialsException e) {
            // هنا المشكلة اتحلت: بننادي الترانزاكشن المنفصلة
            loginAttemptService.updateFailedAttempts(user.getEmail());

            // الترانزاكشن الكبيرة هيحصلها Rollback هنا، بس الصغيرة (المحاولات) خلاص اتسيفت!
            throw new BaseException(ErrorCode.INVALID_CREDENTIALS);
        }

        String token = jwtService.generateToken(createDetails(user));
        return new AuthResponse(token, user.getEmail(), user.getRole(), "Welcome back!");
    }
    @Override
    @Transactional // Main transaction for account verification
    public void verifyAccount(String email, String otpCode) {
        // Find user by email or throw error if not found
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // Check if user is already verified to avoid redundant work
        if (user.isEnabled()) {
            throw new BaseException(ErrorCode.INVALID_INPUT, "User is already enabled");
        }

        // Always verify against the latest unused OTP to avoid stale-code conflicts.
        OtpCode otp = otpCodeRepository.findTopByUserAndUsedFalseOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new BaseException(ErrorCode.INVALID_OTP));

        // Check if the OTP has expired based on current server time
        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            // Invalidate expired OTP so repeated attempts don't keep hitting the same stale code.
            otp.setUsed(true);
            otpCodeRepository.saveAndFlush(otp);
            throw new BaseException(ErrorCode.OTP_EXPIRED, "OTP expired. Please request a new OTP code.");
        }

        // If the OTP is wrong, delegate to the independent failure handler and stop here.
        if (!otp.getCode().equals(otpCode)) {
            otpService.handleFailedAttempt(otp.getId());
            return;
        }

        // If the code is correct, enable the user and mark OTP as used
        user.setEnabled(true);
        user.setEmailVerified(true);
        otp.setUsed(true);

        // Save changes to the database
        userRepository.save(user);
        otpCodeRepository.save(otp);

        log.info("User {} verified successfully", email);
    }

    @Override
    public void resendVerificationOtp(ResendVerificationOtpRequest request) {
        userRepository.findByEmail(request.email())
                .ifPresentOrElse(
                        user -> {
                            if (user.isEnabled()) {
                                log.info("Resend verification requested for already verified email: {}", request.email());
                                return;
                            }

                            // Reuses cooldown + old OTP invalidation logic.
                            saveAndSendOtpInterna(user);
                            log.info("Verification OTP re-sent to: {}", request.email());
                        },
                        () -> log.warn("Resend verification requested for non-existent email: {}", request.email())
                );
    }

    @Override
    public void forgetPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.email())
                .ifPresentOrElse(
                        user -> {
                            // 2. لو موجود: بننادي الميثود اللي بتعمل الشغل التقيل (Transactional)
                            saveAndSendOtpInterna(user);
                            log.info("OTP sent for password reset: {}", request.email());
                        },
                        () -> {
                            // 3. لو مش موجود: بنسجل لوج وبس (سرعة الضوء)
                            log.warn("Forget password attempt for non-existent email: {}", request.email());
                        }
                );
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BaseException(ErrorCode.PASSWORDS_DO_NOT_MATCH);
        }


        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        OtpCode otp = otpCodeRepository.findByUserAndCodeAndUsedFalse(user, request.otpCode())
                .orElseThrow(() -> new BaseException(ErrorCode.INVALID_OTP));

        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BaseException(ErrorCode.OTP_EXPIRED);
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        otp.setUsed(true);
    }



    /**
     * Generates and sends a new OTP while enforcing anti-spam controls.
     *
     * <p>Security controls:</p>
     * <ul>
     *   <li>Blocks resend requests made within 2 minutes of the last OTP generation.</li>
     *   <li>Invalidates any previously unused OTPs before creating a fresh OTP.</li>
     * </ul>
     */
    private void saveAndSendOtpInterna(User user) {
        LocalDateTime cooldownThreshold = LocalDateTime.now().minusMinutes(OTP_RESEND_COOLDOWN_MINUTES);
        otpCodeRepository.findTopByUserOrderByCreatedAtDesc(user)
                .filter(latestOtp -> latestOtp.getCreatedAt() != null && latestOtp.getCreatedAt().isAfter(cooldownThreshold))
                .ifPresent(latestOtp -> {
                    throw new BaseException(
                            ErrorCode.MAX_OTP_ATTEMPTS_REACHED,
                            "Please wait 2 minutes before requesting a new OTP code."
                    );
                });

        List<OtpCode> oldOtps = otpCodeRepository.findByUserAndUsedFalse(user);
        oldOtps.forEach(otp -> otp.setUsed(true));
        otpCodeRepository.saveAllAndFlush(oldOtps);

        String otpCode = String.format("%06d", secureRandom.nextInt(1000000));
        OtpCode otp = OtpCode.builder()
                .user(user)
                .code(otpCode)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .used(false)
                .build();

        otpCodeRepository.saveAndFlush(otp);
        emilService.sendVerificationEmail(user.getEmail(), otpCode);
    }

    private UserDetails createDetails(User user) {
        boolean accountNonLocked = user.getLockoutTime() == null
                || user.getLockoutTime().isBefore(LocalDateTime.now());

        return new CustomUserDetails(
                user.getEmail(),
                user.getPassword(),
                user.isEnabled(),
                accountNonLocked,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );
    }






}