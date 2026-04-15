package jobfinder.servics.interfaces;

import jakarta.validation.constraints.NotBlank;
import jobfinder.model.dto.*;

public interface AuthInterface {

    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    void verifyAccount(String email, String otpCode);
    void resendVerificationOtp(ResendVerificationOtpRequest request);
    void forgetPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);

}
