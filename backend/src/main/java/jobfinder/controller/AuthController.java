package jobfinder.controller;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jobfinder.model.dto.*;
import jobfinder.services.interfaces.AuthInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Handle login and account creation")
public class AuthController {

    private final AuthInterface authService;

    @Operation(summary = "Create a new account")
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @Operation(summary = "Login")
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequest request) {
        AuthResponseDto response = authService.login(request);
        ResponseCookie cookie = ResponseCookie.from("refresh_token", response.refreshToken())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @Operation(summary = "Refresh Access Token")
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDto> refresh(@CookieValue(name = "refresh_token", required = false) String refreshToken) {
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        AuthResponseDto response = authService.refreshToken(refreshToken);
        ResponseCookie cookie = ResponseCookie.from("refresh_token", response.refreshToken())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @Operation(summary = "Request a password reset")
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid  @RequestBody ForgotPasswordRequest request) {
        authService.forgetPassword(request);
        return ResponseEntity.ok("OTP sent to your email successfully.");
    }

    @Operation(summary = "Reset password using OTP")
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword (@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Password has been reset successfully.");
    }
    @Operation(summary = "Verify account using OTP")
    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyAccount(request.email(), request.otp());
        return ResponseEntity.ok("Email verified successfully.");
    }

    @Operation(summary = "Resend verification OTP")
    @PostMapping("/resend-verification-otp")
    public ResponseEntity<String> resendVerificationOtp(@Valid @RequestBody ResendVerificationOtpRequest request) {
        authService.resendVerificationOtp(request);
        return ResponseEntity.ok("If the email is registered and not verified, a new OTP has been sent.");
    }

  





}