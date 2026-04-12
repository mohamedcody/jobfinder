package jobfinder.controller;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jobfinder.model.dto.*;
import jobfinder.servics.interfaces.AuthInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "التحكم في تسجيل الدخول وإنشاء الحسابات")
public class AuthController {

    private final AuthInterface authService;

    @Operation(summary = "إنشاء حساب جديد")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @Operation(summary = "تسجيل الدخول")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(summary = "طلب إعادة تعيين كلمة المرور")
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid  @RequestBody ForgotPasswordRequest request) {
        authService.forgetPassword(request);
        return ResponseEntity.ok("OTP sent to your email successfully.");
    }

    @Operation(summary = "إعادة تعيين كلمة المرور باستخدام OTP")
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword (@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Password has been reset successfully.");
    }
    @Operation(summary = "تفعيل الحساب باستخدام كود OTP")
    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyAccount(request.email(), request.otp());
        return ResponseEntity.ok("Email verified successfully.");
    }

    @Operation(summary = "إعادة إرسال كود تفعيل البريد الإلكتروني")
    @PostMapping("/resend-verification-otp")
    public ResponseEntity<String> resendVerificationOtp(@Valid @RequestBody ResendVerificationOtpRequest request) {
        authService.resendVerificationOtp(request);
        return ResponseEntity.ok("If the email is registered and not verified, a new OTP has been sent.");
    }

  





}