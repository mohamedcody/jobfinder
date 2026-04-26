package jobfinder.controller;

import jobfinder.model.dto.*;
import jobfinder.services.interfaces.AuthInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class AuthGraphQLController {

    private final AuthInterface authService;

    @MutationMapping
    public AuthResponse register(@Argument RegisterRequest input) {
        return authService.register(input);
    }

    @MutationMapping
    public AuthResponse login(@Argument LoginRequest input) {
        return authService.login(input);
    }

    @MutationMapping
    public String forgotPassword(@Argument String email) {
        authService.forgetPassword(new ForgotPasswordRequest(email));
        return "OTP sent successfully";
    }

    @MutationMapping
    public String resetPassword(@Argument ResetPasswordRequest input) {
        authService.resetPassword(input);
        return "Password reset successfully";
    }

    @QueryMapping
    public String ping() {
        return "GraphQL is working perfectly, Saad!";
    }
}