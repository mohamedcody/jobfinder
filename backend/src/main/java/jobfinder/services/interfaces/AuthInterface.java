package jobfinder.services.interfaces;

import jobfinder.model.dto.*;


public interface AuthInterface {

    AuthResponseDto login(LoginRequest request);
    AuthResponseDto refreshToken(String refreshToken);
    AuthResponseDto register(RegisterRequest request);
    void verifyAccount(String email, String otpCode);
    void resendVerificationOtp(ResendVerificationOtpRequest request);
    void forgetPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    

}
