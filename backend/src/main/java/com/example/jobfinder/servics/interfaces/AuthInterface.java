package jobfinder.servics.interfaces;

import jakarta.validation.constraints.NotBlank;
import jobfinder.model.dto.*;

public interface AuthInterface {


    AuthResponse login (LoginRequest request);

    AuthResponse register (RegisterRequest request);


    void forgetPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);


}
