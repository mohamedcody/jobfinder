package jobfinder.services.implementation;

import jobfinder.exception.BaseException;
import jobfinder.exception.ErrorCode;
import jobfinder.model.dto.AuthResponseDto;
import jobfinder.model.entity.User;
import jobfinder.repository.UserRepository;
import jobfinder.util.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceRefreshTokenTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void refreshToken_AccessToken_ShouldBeRejectedWithoutGeneratingTokens() {
        String accessToken = "valid-access-token";
        User enabledUser = User.builder()
                .id(1L)
                .username("test-user")
                .email("test@example.com")
                .role("USER")
                .enabled(true)
                .build();

        when(jwtService.extractUsername(accessToken)).thenReturn(enabledUser.getEmail());
        when(userRepository.findByEmailOrUsername(enabledUser.getEmail()))
                .thenReturn(Optional.of(enabledUser));
        BaseException exception = assertThrows(
                BaseException.class,
                () -> authService.refreshToken(accessToken)
        );

        assertEquals(ErrorCode.INVALID_CREDENTIALS, exception.getErrorCode());
        verify(jwtService, never()).generateToken(any());
        verify(jwtService, never()).generateRefreshToken(any());
    }

    @Test
    void refreshToken_ValidRefreshToken_ShouldSucceed() {
        String refreshToken = "valid-refresh-token";
        User enabledUser = enabledUser();

        when(jwtService.extractUsername(refreshToken)).thenReturn(enabledUser.getEmail());
        when(userRepository.findByEmailOrUsername(enabledUser.getEmail()))
                .thenReturn(Optional.of(enabledUser));
        when(jwtService.isRefreshTokenValid(any(), any())).thenReturn(true);
        when(jwtService.generateToken(any())).thenReturn("new-access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("new-refresh-token");

        AuthResponseDto response = authService.refreshToken(refreshToken);

        assertEquals("new-access-token", response.token());
        assertEquals("new-refresh-token", response.refreshToken());
        verify(jwtService).isRefreshTokenValid(any(), any());
    }

    @Test
    void refreshToken_ExpiredRefreshToken_ShouldBeRejected() {
        assertInvalidRefreshToken("expired-refresh-token");
    }

    @Test
    void refreshToken_TamperedRefreshToken_ShouldBeRejected() {
        assertInvalidRefreshToken("tampered-refresh-token");
    }

    @Test
    void refreshToken_DisabledUser_ShouldBeRejected() {
        String refreshToken = "valid-refresh-token";
        User disabledUser = enabledUser();
        disabledUser.setEnabled(false);

        when(jwtService.extractUsername(refreshToken)).thenReturn(disabledUser.getEmail());
        when(userRepository.findByEmailOrUsername(disabledUser.getEmail()))
                .thenReturn(Optional.of(disabledUser));

        BaseException exception = assertThrows(
                BaseException.class,
                () -> authService.refreshToken(refreshToken)
        );

        assertEquals(ErrorCode.ACCOUNT_NOT_ACTIVATED, exception.getErrorCode());
        verify(jwtService, never()).isRefreshTokenValid(any(), any());
    }

    private void assertInvalidRefreshToken(String refreshToken) {
        User enabledUser = enabledUser();

        when(jwtService.extractUsername(refreshToken)).thenReturn(enabledUser.getEmail());
        when(userRepository.findByEmailOrUsername(enabledUser.getEmail()))
                .thenReturn(Optional.of(enabledUser));
        when(jwtService.isRefreshTokenValid(any(), any())).thenReturn(false);

        BaseException exception = assertThrows(
                BaseException.class,
                () -> authService.refreshToken(refreshToken)
        );

        assertEquals(ErrorCode.INVALID_CREDENTIALS, exception.getErrorCode());
        verify(jwtService, never()).generateToken(any());
        verify(jwtService, never()).generateRefreshToken(any());
    }

    private User enabledUser() {
        return User.builder()
                .id(1L)
                .username("test-user")
                .email("test@example.com")
                .role("USER")
                .enabled(true)
                .build();
    }
}
