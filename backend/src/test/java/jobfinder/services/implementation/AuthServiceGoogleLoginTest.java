package jobfinder.services.implementation;

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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.security.SecureRandom;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceGoogleLoginTest {

    @Mock private GoogleTokenVerifier googleTokenVerifier;
    @Mock private UserRepository userRepository;
    @Mock private JwtService jwtService;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private GoogleIdentity validIdentity;
    private GoogleLoginRequest request;

    @BeforeEach
    void setUp() {
        validIdentity = new GoogleIdentity("sub-123", "test@example.com", "Test User");
        request = new GoogleLoginRequest("valid-id-token");
    }

    @Test
    void shouldCreateNewAccountForNewGoogleIdentity() {
        when(googleTokenVerifier.verify("valid-id-token")).thenReturn(validIdentity);
        when(userRepository.findByAuthProviderAndProviderId("GOOGLE", "sub-123")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        
        User savedUser = User.builder().email("test@example.com").authProvider("GOOGLE").providerId("sub-123").role("USER").enabled(true).emailVerified(true).build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken(any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh-token");

        AuthResponseDto response = authService.googleLogin(request);

        assertNotNull(response);
        assertEquals("access-token", response.token());
        
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User created = userCaptor.getValue();
        assertEquals("GOOGLE", created.getAuthProvider());
        assertEquals("sub-123", created.getProviderId());
        assertTrue(created.isEnabled());
        assertTrue(created.isEmailVerified());
    }

    @Test
    void shouldLoginExistingGoogleAccount() {
        when(googleTokenVerifier.verify("valid-id-token")).thenReturn(validIdentity);
        
        User existingUser = User.builder().email("test@example.com").authProvider("GOOGLE").providerId("sub-123").enabled(true).role("USER").build();
        when(userRepository.findByAuthProviderAndProviderId("GOOGLE", "sub-123")).thenReturn(Optional.of(existingUser));
        
        when(jwtService.generateToken(any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh-token");

        AuthResponseDto response = authService.googleLogin(request);

        assertNotNull(response);
        assertEquals("access-token", response.token());
        verify(userRepository, never()).save(any(User.class)); // Shouldn't save
    }

    @Test
    void shouldRejectBannedGoogleAccount() {
        when(googleTokenVerifier.verify("valid-id-token")).thenReturn(validIdentity);
        
        User bannedUser = User.builder().email("test@example.com").authProvider("GOOGLE").providerId("sub-123").enabled(false).role("USER").build();
        when(userRepository.findByAuthProviderAndProviderId("GOOGLE", "sub-123")).thenReturn(Optional.of(bannedUser));
        
        BaseException ex = assertThrows(BaseException.class, () -> authService.googleLogin(request));
        assertEquals(ErrorCode.ACCOUNT_NOT_ACTIVATED, ex.getErrorCode());
        
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void shouldRejectGoogleLoginIfVerifiedLocalAccountExists() {
        when(googleTokenVerifier.verify("valid-id-token")).thenReturn(validIdentity);
        when(userRepository.findByAuthProviderAndProviderId("GOOGLE", "sub-123")).thenReturn(Optional.empty());
        
        User localUser = User.builder().email("test@example.com").authProvider("LOCAL").emailVerified(true).enabled(true).build();
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(localUser));
        
        BaseException ex = assertThrows(BaseException.class, () -> authService.googleLogin(request));
        assertEquals(ErrorCode.EMAIL_ALREADY_EXISTS, ex.getErrorCode());
        
        verify(userRepository, never()).delete(any());
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void shouldUsurpUnverifiedLocalAccount() {
        when(googleTokenVerifier.verify("valid-id-token")).thenReturn(validIdentity);
        when(userRepository.findByAuthProviderAndProviderId("GOOGLE", "sub-123")).thenReturn(Optional.empty());
        
        User unverifiedLocalUser = User.builder().email("test@example.com").authProvider("LOCAL").emailVerified(false).enabled(false).build();
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(unverifiedLocalUser));
        
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        
        User newGoogleUser = User.builder().email("test@example.com").authProvider("GOOGLE").providerId("sub-123").role("USER").enabled(true).emailVerified(true).build();
        when(userRepository.save(any(User.class))).thenReturn(newGoogleUser);
        
        when(jwtService.generateToken(any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh-token");

        AuthResponseDto response = authService.googleLogin(request);

        assertNotNull(response);
        verify(userRepository).delete(unverifiedLocalUser); // Squatter evicted
        verify(userRepository).flush();
        
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User created = userCaptor.getValue();
        assertEquals("GOOGLE", created.getAuthProvider());
        assertEquals("sub-123", created.getProviderId());
    }
}
