package jobfinder.servics.implemention;
import jakarta.transaction.Transactional;
import jobfinder.config.CustomUserDetails;
import jobfinder.exceptoin.BaseException;
import jobfinder.exceptoin.ErrorCode;
import jobfinder.model.dto.*;
import jobfinder.model.entity.OtpCode;
import jobfinder.model.entity.User;
import jobfinder.repository.OtpCodeRepository;
import jobfinder.repository.UserRepository;
import jobfinder.servics.interfaces.AuthInterface;
import jobfinder.util.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService implements AuthInterface {

    private final UserRepository userRepository;
    private final OtpCodeRepository otpCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender mailSender;
    private static final SecureRandom secureRandom = new java.security.SecureRandom();


    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (request.email() == null || !request.email().toLowerCase().endsWith("@jobfinder.com")) {
            throw new BaseException(ErrorCode.EMAIL_DOMAIN_NOT_ALLOWED);
        }


        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new BaseException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new BaseException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }

        // 4. بناء وتخزين المستخدم
        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role("USER")
                .failedAttempts(0)
                .enabled(true)
                .build();

        userRepository.save(user);

        // 5. توليد التوكن
        UserDetails userDetails = createDetails(user);
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, user.getEmail(), user.getRole(), "Registration successful");
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        String identifier = request.identifier() != null ? request.identifier().trim() : null;
        String password = request.password() != null ? request.password().trim() : null;

        if (identifier == null || identifier.isBlank() || password == null || password.isBlank()) {
            throw new BaseException(ErrorCode.INVALID_INPUT, "Identifier and Password are required");
        }


        User user = identifier.contains("@")
                ? userRepository.findByEmail(identifier).orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND))
                : userRepository.findByUsername(identifier).orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));


        if (user.getLockoutTime() != null) {
            if (user.getLockoutTime().isAfter(LocalDateTime.now())) {

                throw new BaseException(ErrorCode.ACCOUNT_LOCKED);
            } else {

                user.setFailedAttempts(0);
                user.setLockoutTime(null);
                userRepository.save(user);
            }
        }

        if (!user.isEnabled()) {
            throw new BaseException(ErrorCode.ACCOUNT_NOT_ACTIVATED);
        }


        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(identifier, password)
            );


            if (user.getFailedAttempts() > 0) {
                user.setFailedAttempts(0);
                userRepository.save(user);
            }

        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            int attempts = user.getFailedAttempts() + 1;
            user.setFailedAttempts(attempts);


            if (attempts >= 5) {
                user.setLockoutTime(LocalDateTime.now().plusMinutes(1));
                log.warn("Account locked for user: {}", identifier);
            }
            userRepository.save(user);

            throw new BaseException(ErrorCode.INVALID_CREDENTIALS);
        }


        UserDetails userDetails = createDetails(user);
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, user.getEmail(), user.getRole(), "Login successful");
    }
    private UserDetails createDetails(User user) {
        return new CustomUserDetails(
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );
    }



    @Override
    @Transactional
    public void forgetPassword(ForgotPasswordRequest request) {

        if (request.email() == null || !request.email().toLowerCase().endsWith("@jobfinder.com")) {
            throw new BaseException(ErrorCode.EMAIL_DOMAIN_NOT_ALLOWED);
        }


        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));


        String resetToken = UUID.randomUUID().toString();


        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(15);


        OtpCode otp = OtpCode.builder()
                .user(user)
                .code(resetToken)
                .expiryTime(expiryTime)
                .used(false)
                .build();
        otpCodeRepository.save(otp);


        sendEmail(user.getEmail(), resetToken);
    }

    private void sendEmail(String email, String token) {
        String resetLink = "http://localhost:3000/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("JobFinder - Password Reset Request");
        message.setText("To reset your password, click the link below:\n" + resetLink);

        mailSender.send(message);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {

        OtpCode otp = otpCodeRepository.findByCodeAndUsedFalse(request.otpCode())
                .orElseThrow(() -> new BaseException(ErrorCode.INVALID_OTP));


        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BaseException(ErrorCode.OTP_EXPIRED);
        }
        if(!request.newPassword().equals(request.confirmPassword())){
            throw new BaseException(ErrorCode.PASSWORDS_DO_NOT_MATCH);
        }


        User user = otp.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        otp.setUsed(true);
        otpCodeRepository.save(otp);
    }




}

