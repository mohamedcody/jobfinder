package jobfinder.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * IP-based rate limiter for authentication endpoints.
 *
 * Design decisions:
 * - Only applies to /api/auth/** — all other endpoints pass through untouched.
 * - Uses ConcurrentHashMap for thread-safe, lock-free counting.
 * - Window resets every 60 seconds per IP via lazy expiration (no background thread needed).
 * - Limit: 20 requests per minute per IP — generous enough for legitimate users,
 *   strict enough to block brute-force attacks.
 * - Returns HTTP 429 with a JSON body matching the project's error format.
 *
 * Limitations (acceptable for current scale):
 * - In-memory only — does not share state across multiple instances.
 *   For multi-instance deployments, replace with Redis-backed Bucket4j.
 * - IP-based — users behind the same NAT/VPN share a counter.
 *   The 20/min limit mitigates false positives.
 */
@Component
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 20;
    private static final long WINDOW_MS = 60_000L; // 1 minute

    /**
     * Each entry holds the request count and the window start timestamp.
     * Lazy expiration: the window resets when the first request arrives after WINDOW_MS.
     */
    private final ConcurrentHashMap<String, RateLimitEntry> requestCounts = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Only rate-limit auth endpoints
        String path = request.getRequestURI();
        if (!path.startsWith("/api/auth")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Skip preflight CORS requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = extractClientIp(request);
        long now = System.currentTimeMillis();

        RateLimitEntry entry = requestCounts.compute(clientIp, (key, existing) -> {
            if (existing == null || (now - existing.windowStart) > WINDOW_MS) {
                // New window — reset counter
                return new RateLimitEntry(now, new AtomicInteger(1));
            }
            // Same window — increment counter
            existing.count.incrementAndGet();
            return existing;
        });

        if (entry.count.get() > MAX_REQUESTS_PER_MINUTE) {
            log.warn("🛑 Rate limit exceeded for IP: {} on path: {} ({} requests in window)",
                    clientIp, path, entry.count.get());

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

            Map<String, Object> errorBody = Map.of(
                    "status", 429,
                    "error", "Too Many Requests",
                    "message", "You have exceeded the rate limit. Please try again in a moment.",
                    "path", path
            );

            new ObjectMapper().writeValue(response.getOutputStream(), errorBody);
            return; // Do NOT continue the filter chain
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extracts the real client IP, respecting reverse proxy headers.
     * Checks X-Forwarded-For first (set by NGINX), falls back to remoteAddr.
     */
    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
            // The first one is the original client IP
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * Simple holder for the window start time and request count.
     */
    private static class RateLimitEntry {
        final long windowStart;
        final AtomicInteger count;

        RateLimitEntry(long windowStart, AtomicInteger count) {
            this.windowStart = windowStart;
            this.count = count;
        }
    }
}
