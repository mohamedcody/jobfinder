package jobfinder.services.ServiceAi;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import jobfinder.exception.AiServiceTimeoutException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeoutException;

/**
 * Centralized, Production-Ready Client for Google Gemini API.
 * 
 * Architecture Benefits:
 * - Single source of truth for Gemini API integration.
 * - Prevents Spring WebClient URI encoding bugs (using java.net.URI).
 * - Centralized Resilience4j (Retry & Circuit Breaker) configuration.
 * - Standardized Error Handling & Structured Logging.
 */
@Component
@Slf4j
public class GeminiApiClient {

    private final WebClient webClient;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com";
    private static final String DEFAULT_MODEL = "gemini-flash-latest";

    public GeminiApiClient(WebClient.Builder webClientBuilder) {
        // We do NOT set the baseUrl here because we will pass absolute URIs
        // to bypass Spring's UriBuilder encoding of the ':' character.
        this.webClient = webClientBuilder
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(5 * 1024 * 1024)) // 5MB buffer for large CVs
                .build();
    }

    /**
     * Sends a prompt to the Gemini API with structured JSON output configuration.
     * 
     * @param prompt The prompt string to send.
     * @param timeout The duration to wait before timing out.
     * @return Mono<Map> representing the parsed JSON response.
     */
    @Retry(name = "geminiApi", fallbackMethod = "retryFallback")
    @CircuitBreaker(name = "geminiApi", fallbackMethod = "circuitBreakerFallback")
    public Mono<Map> generateContent(String prompt, Duration timeout) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.contains("${")) {
            log.error("❌ CRITICAL: Gemini API Key is missing or unresolved. Cannot process AI request.");
            return Mono.error(new IllegalStateException("Gemini API Key is missing."));
        }

        // 1. Construct exact URI using java.net.URI to bypass Spring WebFlux's UriBuilder 
        // which incorrectly encodes the ':' character in 'gemini-1.5-flash:generateContent' to '%3A'.
        String uriString = String.format("%s/v1beta/models/%s:generateContent?key=%s", 
                GEMINI_BASE_URL, DEFAULT_MODEL, geminiApiKey);
        URI exactUri = URI.create(uriString);

        // 2. Build the exact Request Payload Google expects
        // REMOVED generationConfig (responseMimeType) because gemini-pro (1.0) does NOT support it.
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        log.debug("🚀 Sending request to Gemini API. Model: {}", DEFAULT_MODEL);

        return webClient.post()
                .uri(exactUri)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(timeout)
                .onErrorMap(TimeoutException.class, e -> {
                    log.error("⏳ Gemini API Timeout after {} ms.", timeout.toMillis());
                    return new AiServiceTimeoutException("Gemini API did not respond within the time limit.", e);
                })
                .onErrorMap(WebClientResponseException.class, e -> {
                    log.error("❌ Gemini API HTTP Error [{}]: {}", e.getStatusCode(), e.getResponseBodyAsString());
                    return new AiServiceTimeoutException("Gemini API rejected the request: " + e.getStatusCode(), e);
                });
    }

    // --- Resilience Fallbacks ---
    
    public Mono<Map> retryFallback(String prompt, Duration timeout, Throwable t) {
        log.error("🔄 Gemini API Retry Exhausted. Last Error: {}", t.getMessage());
        return Mono.error(new AiServiceTimeoutException("AI service is currently unavailable after multiple retries.", t));
    }

    public Mono<Map> circuitBreakerFallback(String prompt, Duration timeout, Throwable t) {
        log.error("🛑 Gemini API Circuit Breaker OPEN. Rejecting request to protect system. Cause: {}", t.getMessage());
        return Mono.error(new AiServiceTimeoutException("AI service is temporarily unavailable due to high error rate.", t));
    }

}
