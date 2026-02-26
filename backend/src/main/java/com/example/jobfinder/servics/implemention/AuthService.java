package jobfinder.servics.implemention;
import jakarta.transaction.Transactional;
import jobfinder.config.CustomUserDetails;
import jobfinder.exceptoin.BaseException;
import jobfinder.exceptoin.ErrorCode;
import jobfinder.model.dto.AuthResponse;
import jobfinder.model.dto.LoginRequest;
import jobfinder.model.dto.RegisterRequest;
import jobfinder.model.entity.User;
import jobfinder.repository.UserRepository;
import jobfinder.servics.interfaces.AuthInterface;
import jobfinder.util.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService implements AuthInterface {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;



    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 1. فحص الدومين (لازم ينتهي بـ @jobfinder.com)
        if (request.email() == null || !request.email().toLowerCase().endsWith("@jobfinder.com")) {
            throw new BaseException(ErrorCode.EMAIL_DOMAIN_NOT_ALLOWED);
        }

        // 2. فحص هل الإيميل موجود قبل كده؟
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new BaseException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // 3. فحص هل اسم المستخدم موجود قبل كده؟
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

        // 2. هل الحساب مقفول دلوقتي؟
        if (user.getLockoutTime() != null) {
            if (user.getLockoutTime().isAfter(LocalDateTime.now())) {
                // لسه وقت الحظر مخلصش
                throw new BaseException(ErrorCode.ACCOUNT_LOCKED);
            } else {
                // وقت الحظر خلص، هنصفر العداد ونفتح الحساب تاني
                user.setFailedAttempts(0);
                user.setLockoutTime(null);
                userRepository.save(user);
            }
        }

        if (!user.isEnabled()) {
            throw new BaseException(ErrorCode.ACCOUNT_NOT_ACTIVATED);
        }

        // 3. نجرب نعمل Login
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(identifier, password)
            );

            // لو الباسورد صح ووصلنا هنا: نصفر العداد (عشان لو كان غلط مرة أو اتنين قبل كده)
            if (user.getFailedAttempts() > 0) {
                user.setFailedAttempts(0);
                userRepository.save(user);
            }

        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            // لو الباسورد غلط: نزود العداد
            int attempts = user.getFailedAttempts() + 1;
            user.setFailedAttempts(attempts);

            // لو وصل لـ 5 مرات غلط، نقفل الحساب لمدة 15 دقيقة
            if (attempts >= 5) {
                user.setLockoutTime(LocalDateTime.now().plusMinutes(1));
                log.warn("Account locked for user: {}", identifier);
            }
            userRepository.save(user); // نحفظ التعديلات في الداتا بيز

            throw new BaseException(ErrorCode.INVALID_CREDENTIALS);
        }

        // 4. إصدار التوكن بعد النجاح
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

}

