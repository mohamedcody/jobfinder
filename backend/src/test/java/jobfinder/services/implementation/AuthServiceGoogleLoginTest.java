package jobfinder.services.implementation;

import jobfinder.config.CustomUserDetails;
import jobfinder.exception.BaseException;
import jobfinder.exception.ErrorCode;
import jobfinder.model.dto.AuthResponseDto;
import jobfinder.model.dto.GoogleIdentity;
import jobfinder.model.dto.GoogleLoginRequest;
import jobfinder.model.entity.User;
import jobfinder.repository.UserRepository;
import jobfinder.services.assets.GoogleTokenVerifier;
import jobfinder.util.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceGoogleLoginTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private GoogleTokenVerifier googleTokenVerifier;

    @InjectMocks
    private AuthService authService;

    private GoogleLoginRequest validRequest;
    private GoogleIdentity validIdentity;

    @BeforeEach
    void setUp() {
        validRequest = new GoogleLoginRequest("valid.google.token");
        validIdentity = new GoogleIdentity("sub123", "test@gmail.com", "Test User");
    }

    // 1. Valid Google Token & 7. New Google User
    @Test
    void testGoogleLogin_ValidToken_NewUser_ShouldCreateUserAndGenerateTokens() {
        when(googleTokenVerifier.verify("valid.google.token")).thenReturn(validIdentity);
        when(userRepository.findByEmail("test@gmail.com")).thenReturn(Optional.empty());
        
        User savedUser = User.builder()
                .id(1L)
                .email("test@gmail.com")
                .role("USER")
                .enabled(true)
                .build();
                
        when(passwordEncoder.encode(anyString())).thenReturn("hashedRandomPass");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken(any())).thenReturn("access_token");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh_token");

        AuthResponseDto response = authService.googleLogin(validRequest);

        assertNotNull(response);
        assertEquals("access_token", response.token());
        assertEquals("refresh_token", response.refreshToken());
        assertEquals("test@gmail.com", response.email());
        
        verify(userRepository).save(argThat(user -> 
            user.getEmail().equals("test@gmail.com") && 
            user.isEnabled() && 
            user.isEmailVerified()
        ));
    }

    // 6. Existing User
    @Test
    void testGoogleLogin_ExistingUser_ShouldNotCreateDuplicateUser() {
        when(googleTokenVerifier.verify("valid.google.token")).thenReturn(validIdentity);
        
        User existingUser = User.builder()
                .id(1L)
                .email("test@gmail.com")
                .role("USER")
                .enabled(true)
                .build();
                
        when(userRepository.findByEmail("test@gmail.com")).thenReturn(Optional.of(existingUser));
        when(jwtService.generateToken(any())).thenReturn("access_token");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh_token");

        AuthResponseDto response = authService.googleLogin(validRequest);

        assertNotNull(response);
        assertEquals("access_token", response.token());
        
        // Ensure save is NOT called for a new user creation, and NOT called to update if already enabled
        verify(userRepository, never()).save(any(User.class));
    }

    // 2. Invalid Token, 3. Expired Token, 4. Wrong Client ID
    @Test
    void testGoogleLogin_InvalidToken_ShouldThrowException() {
        when(googleTokenVerifier.verify("invalid.token"))
                .thenThrow(new BaseException(ErrorCode.INVALID_CREDENTIALS, "Invalid Google ID token."));

        GoogleLoginRequest invalidReq = new GoogleLoginRequest("invalid.token");
        
        BaseException ex = assertThrows(BaseException.class, () -> authService.googleLogin(invalidReq));
        assertEquals(ErrorCode.INVALID_CREDENTIALS, ex.getErrorCode());
        
        verify(userRepository, never()).findByEmail(anyString());
        verify(jwtService, never()).generateToken(any());
    }

    // 5. Missing Token
    @Test
    void testGoogleLogin_MissingToken_ShouldBeRejected() {
        // Technically controller handles @NotBlank, but let's test verifier handling null or service rejecting
        when(googleTokenVerifier.verify(null))
                .thenThrow(new BaseException(ErrorCode.INVALID_CREDENTIALS, "Missing token"));

        GoogleLoginRequest nullReq = new GoogleLoginRequest(null);
        
        assertThrows(BaseException.class, () -> authService.googleLogin(nullReq));
        verify(userRepository, never()).findByEmail(anyString());
    }

    // 8. Missing Google Email
    @Test
    void testGoogleLogin_DisabledExistingUser_ShouldRejectLogin() {
        when(googleTokenVerifier.verify("valid.google.token"))
                .thenReturn(validIdentity);

        User disabledUser = User.builder()
                .id(1L)
                .email("test@gmail.com")
                .role("USER")
                .enabled(false)
                .emailVerified(false)
                .build();

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(disabledUser));

        BaseException ex = assertThrows(
                BaseException.class,
                () -> authService.googleLogin(validRequest)
        );

        assertEquals(ErrorCode.ACCOUNT_NOT_ACTIVATED, ex.getErrorCode());

        // Must not enable or save the disabled account
        assertFalse(disabledUser.isEnabled());

        verify(userRepository, never()).save(any(User.class));
        verify(jwtService, never()).generateToken(any());
        verify(jwtService, never()).generateRefreshToken(any());
    }
}
