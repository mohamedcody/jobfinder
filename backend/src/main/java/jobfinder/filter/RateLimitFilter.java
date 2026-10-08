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

        String path = request.getRequestURI();
        
        // Determine bucket and limit based on path
        String bucketType = null;
        int limit = MAX_REQUESTS_PER_MINUTE;

        if (path.startsWith("/api/auth")) {
            bucketType = "AUTH";
            limit = 20;
        } else if (path.startsWith("/api/cv/upload") || 
                   path.contains("/summarize") || 
                   path.startsWith("/api/ai/chat") ||
                   path.startsWith("/api/users/profile/alerts/test")) {
            bucketType = "AI_EXPENSIVE";
            limit = 5; // Stricter limit for AI operations
        }

        // If not a rate-limited path, pass through
        if (bucketType == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // Skip preflight CORS requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = extractClientIp(request);
        String bucketKey = clientIp + ":" + bucketType;
        long now = System.currentTimeMillis();

        RateLimitEntry entry = requestCounts.compute(bucketKey, (key, existing) -> {
            if (existing == null || (now - existing.windowStart) > WINDOW_MS) {
                // New window — reset counter
                return new RateLimitEntry(now, new AtomicInteger(1));
            }
            // Same window — increment counter
            existing.count.incrementAndGet();
            return existing;
        });

        if (entry.count.get() > limit) {
            log.warn("🛑 Rate limit exceeded for IP: {} (Bucket: {}) on path: {} ({} requests in window, limit {})",
                    clientIp, bucketType, path, entry.count.get(), limit);

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

            Map<String, Object> errorBody = Map.of(
                    "status", 429,
                    "error", "Too Many Requests",
                    "message", "You have exceeded the rate limit for this action. Please try again in a minute.",
                    "path", path
            );

            new ObjectMapper().writeValue(response.getOutputStream(), errorBody);
            return; // Do NOT continue the filter chain
        }

        filterChain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
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
