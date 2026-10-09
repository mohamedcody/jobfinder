package jobfinder.controller;

import jobfinder.services.interfaces.AuthInterface;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class AuthControllerTest {

    @Test
    public void logout_ShouldClearRefreshTokenCookie() {
        AuthInterface authService = Mockito.mock(AuthInterface.class);
        AuthController authController = new AuthController(authService);

        ResponseEntity<String> response = authController.logout();
        
        assertEquals(200, response.getStatusCode().value());
        assertEquals("Logged out successfully", response.getBody());
        
        String cookieHeader = response.getHeaders().getFirst("Set-Cookie");
        assertTrue(cookieHeader != null, "Set-Cookie header should be present");
        assertTrue(cookieHeader.contains("refresh_token="), "Cookie should be refresh_token");
        assertTrue(cookieHeader.contains("Max-Age=0"), "Cookie should expire immediately");
        assertTrue(cookieHeader.contains("HttpOnly"), "Cookie should be HttpOnly");
        assertTrue(cookieHeader.contains("Secure"), "Cookie should be Secure");
        assertTrue(cookieHeader.contains("Path=/"), "Cookie should have Path=/");
    }
}
