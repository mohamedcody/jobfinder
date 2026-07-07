package jobfinder.services.implementation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import jobfinder.exception.AiServiceTimeoutException;
import jobfinder.exception.MalformedAiResponseException;
import jobfinder.model.dto.AiCvExtractionResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeoutException;

/**
 * Dedicated AI service for CV/Resume data extraction using Google Gemini.
 *
 * NON-BLOCKING: Returns Mono<AiCvExtractionResult> — never calls .block().
 * The Tomcat worker thread is released immediately while waiting for the AI response.
 *
 * RESILIENCY:
 * - @Retry: Retries up to 3 times on 5xx errors / timeouts with exponential backoff.
 * - @CircuitBreaker: Opens circuit after sustained failures to prevent cascade.
 * - MalformedAiResponseException: Thrown when AI returns non-JSON content.
 */
@Service
@Slf4j
public class CvAiExtractionService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(30);

    public CvAiExtractionService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024)) // 2MB buffer
                .build();
    }

    /**
     * Sends extracted CV text to Gemini AI for structured data extraction.
     * Returns a Mono that resolves asynchronously — does NOT block.
     *
     * @param cvText the raw text extracted from the PDF
     * @return Mono<AiCvExtractionResult> with the parsed CV data
     */
    @Retry(name = "cvAiExtraction", fallbackMethod = "retryFallback")
    @CircuitBreaker(name = "geminiCvApi", fallbackMethod = "circuitBreakerFallback")
    public Mono<AiCvExtractionResult> extractCvData(String cvText) {
        log.info("🤖 Sending CV text ({} chars) to Gemini AI for structured extraction...", cvText.length());

        String prompt = buildExtractionPrompt(cvText);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                ),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json",
                        "temperature", 0.1 // Low temperature for deterministic structured output
                )
        );

        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1beta/models/gemini-1.5-flash:generateContent")
                        .queryParam("key", geminiApiKey)
                        .build())
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(REQUEST_TIMEOUT)
                .flatMap(map -> this.parseGeminiResponse((Map<String, Object>) map))
                .doOnSuccess(result -> log.info("✅ AI CV extraction succeeded. Extracted {} skills, {} education, {} experience entries.",
                        result.skills() != null ? result.skills().size() : 0,
                        result.education() != null ? result.education().size() : 0,
                        result.workExperience() != null ? result.workExperience().size() : 0))
                .onErrorMap(TimeoutException.class, e ->
                        new AiServiceTimeoutException("Gemini AI did not respond within " + REQUEST_TIMEOUT.getSeconds() + " seconds.", e))
                .onErrorMap(WebClientResponseException.class, e -> {
                    WebClientResponseException wcre = (WebClientResponseException) e;
                    log.error("❌ Gemini API HTTP error: {} - {}", wcre.getStatusCode(), wcre.getResponseBodyAsString());
                    return new AiServiceTimeoutException("Gemini API returned HTTP " + wcre.getStatusCode(), wcre);
                });
    }

    /**
     * Parses the raw Gemini API response, extracts the text content,
     * and deserializes it into AiCvExtractionResult.
     */
    @SuppressWarnings("unchecked")
    private Mono<AiCvExtractionResult> parseGeminiResponse(Map<String, Object> response) {
        try {
            if (response == null || !response.containsKey("candidates")) {
                return Mono.error(new MalformedAiResponseException(
                        "Gemini response missing 'candidates' field.",
                        response != null ? response.toString() : "null"
                ));
            }

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                return Mono.error(new MalformedAiResponseException(
                        "Gemini response has empty candidates list.",
                        response.toString()
                ));
            }

            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");

            if (parts == null || parts.isEmpty()) {
                return Mono.error(new MalformedAiResponseException(
                        "Gemini response has no content parts.",
                        response.toString()
                ));
            }

            String rawJsonText = (String) parts.get(0).get("text");
            log.debug("🔍 Raw AI JSON output (first 500 chars): {}",
                    rawJsonText.substring(0, Math.min(rawJsonText.length(), 500)));

            // Clean up markdown code fences if the AI wraps the JSON
            String cleanedJson = cleanJsonResponse(rawJsonText);

            // Deserialize into the structured record
            AiCvExtractionResult result = objectMapper.readValue(cleanedJson, AiCvExtractionResult.class);
            return Mono.just(result);

        } catch (JsonProcessingException e) {
            // Log the raw AI output for debugging before throwing a clean exception
            String rawOutput = response != null ? response.toString() : "null";
            log.error("❌ Failed to deserialize AI JSON response. JsonProcessingException: {}. Raw output (truncated): {}",
                    e.getMessage(), rawOutput.substring(0, Math.min(rawOutput.length(), 2000)));

            return Mono.error(new MalformedAiResponseException(
                    "AI returned invalid JSON that could not be parsed: " + e.getOriginalMessage(),
                    rawOutput, e
            ));
        } catch (Exception e) {
            return Mono.error(new MalformedAiResponseException(
                    "Unexpected error while parsing AI response: " + e.getMessage(),
                    response != null ? response.toString() : "null", e
            ));
        }
    }

    /**
     * Strips markdown code fences (```json ... ```) that AI models sometimes add.
     */
    private String cleanJsonResponse(String rawJson) {
        String cleaned = rawJson.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }

    /**
     * Builds the extraction prompt with a strict JSON schema contract.
     */
    private String buildExtractionPrompt(String cvText) {
        return """
                You are an expert CV/Resume parser. Extract structured data from the following resume text \
                and return it as a valid JSON object.
                
                The JSON MUST follow this exact schema (use null for missing fields):
                {
                  "fullName": "string",
                  "email": "string or null",
                  "phone": "string or null",
                  "currentJobTitle": "string or null",
                  "bio": "A 2-3 sentence professional summary based on the CV content",
                  "yearsOfExperience": "number or null (estimate from work history)",
                  "educationLevel": "string (e.g. Bachelor's, Master's, PhD, High School) or null",
                  "city": "string or null",
                  "country": "string or null",
                  "skills": [
                    { "name": "string", "proficiencyScore": "1-5 integer (estimate from context)", "yearsOfExperience": "number or null" }
                  ],
                  "education": [
                    { "institution": "string", "degree": "string", "fieldOfStudy": "string", "startYear": "number", "endYear": "number or null", "grade": "string or null" }
                  ],
                  "workExperience": [
                    { "companyName": "string", "jobTitle": "string", "description": "brief summary string", "startDate": "YYYY-MM", "endDate": "YYYY-MM or null", "isCurrent": "boolean" }
                  ],
                  "preferredJobTitles": ["derive from most recent job titles"],
                  "preferredLocations": ["derive from address/location if available"]
                }
                
                IMPORTANT RULES:
                - Return ONLY the JSON object. No markdown, no explanation, no extra text.
                - All arrays must be present (use empty array [] if no data found).
                - Estimate proficiencyScore (1=beginner to 5=expert) based on context clues.
                - For yearsOfExperience, calculate from the earliest work start date to now.
                
                Resume text:
                \"\"\"
                """ + cvText + """
                \"\"\"
                """;
    }

    // --- Resilience4j Fallback Methods ---

    /**
     * Retry fallback: called after all retry attempts are exhausted.
     */
    public Mono<AiCvExtractionResult> retryFallback(String cvText, Throwable t) {
        log.error("🔄 All retry attempts exhausted for CV AI extraction. Last error: {}", t.getMessage());
        return Mono.error(new AiServiceTimeoutException(
                "AI service is currently unavailable after multiple retries. Please try again later.", t
        ));
    }

    /**
     * Circuit breaker fallback: called when the circuit is open.
     */
    public Mono<AiCvExtractionResult> circuitBreakerFallback(String cvText, Throwable t) {
        log.error("🛑 Circuit breaker OPEN for CV AI extraction. Rejecting request. Cause: {}", t.getMessage());
        return Mono.error(new AiServiceTimeoutException(
                "AI service is temporarily unavailable due to high error rate. Please try again in a few minutes.", t
        ));
    }
}
