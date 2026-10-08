package jobfinder.filter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import jakarta.servlet.ServletException;
import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitFilterTest {

    private RateLimitFilter rateLimitFilter;

    @BeforeEach
    void setUp() {
        // Instantiate the filter directly for isolated testing
        rateLimitFilter = new RateLimitFilter();
    }

    @Test
    void testNormalRequestAllowed() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr("10.0.0.5");
        
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        rateLimitFilter.doFilter(request, response, filterChain);

        // Verify the request passed through the filter (not blocked)
        assertThat(response.getStatus()).isNotEqualTo(HttpStatus.TOO_MANY_REQUESTS.value());
        
        // Ensure filter chain was called (since it's not a 429, it must have proceeded)
        assertThat(filterChain.getRequest()).isNotNull();
    }

    @Test
    void testXForwardedForSpoofingBlocked() throws ServletException, IOException {
        String attackerRealIp = "10.0.0.5";

        // Send 20 requests with different spoofed X-Forwarded-For headers
        for (int i = 1; i <= 20; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
            request.setRemoteAddr(attackerRealIp);
            request.addHeader("X-Forwarded-For", "1.1.1." + i);
            
            MockHttpServletResponse response = new MockHttpServletResponse();
            MockFilterChain filterChain = new MockFilterChain();

            rateLimitFilter.doFilter(request, response, filterChain);

            // The first 20 requests should be allowed
            assertThat(response.getStatus()).isNotEqualTo(HttpStatus.TOO_MANY_REQUESTS.value());
        }

        // Request 21: Should be blocked despite a new X-Forwarded-For IP
        MockHttpServletRequest request21 = new MockHttpServletRequest("POST", "/api/auth/login");
        request21.setRemoteAddr(attackerRealIp);
        request21.addHeader("X-Forwarded-For", "8.8.8.8");
        
        MockHttpServletResponse response21 = new MockHttpServletResponse();
        MockFilterChain filterChain21 = new MockFilterChain();

        rateLimitFilter.doFilter(request21, response21, filterChain21);

        // Verify the 21st request is blocked
        assertThat(response21.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS.value());
        
        // Verify the filter chain was NOT called
        assertThat(filterChain21.getRequest()).isNull();
    }
}
