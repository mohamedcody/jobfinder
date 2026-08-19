package jobfinder.services.ServiceAi;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jobfinder.exception.MalformedAiResponseException;
import jobfinder.model.dto.AiCvExtractionResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Dedicated AI service for CV/Resume data extraction using Google Gemini.
 *
 * Architecture upgraded: 
 * Now delegates all raw HTTP requests, timeouts, retries, and URI building 
 * to the centralized GeminiApiClient.
 */
@Service
@Slf4j
public class CvAiExtractionService {

    private final GeminiApiClient geminiClient;
    private final ObjectMapper objectMapper;

    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(30);

    public CvAiExtractionService(GeminiApiClient geminiClient, ObjectMapper objectMapper) {
        this.geminiClient = geminiClient;
        this.objectMapper = objectMapper;
    }

    /**
     * Sends extracted CV text to Gemini AI for structured data extraction.
     * Returns a Mono that resolves asynchronously — does NOT block.
     *
     * @param cvText the raw text extracted from the PDF
     * @return Mono<AiCvExtractionResult> with the parsed CV data
     */
    public Mono<AiCvExtractionResult> extractCvData(String cvText) {
        log.info("🤖 Sending CV text ({} chars) to Gemini AI for structured extraction...", cvText.length());

        log.info("📤 Sending request to Gemini AI...");
        String prompt = buildExtractionPrompt(cvText);

        return geminiClient.generateContent(prompt, REQUEST_TIMEOUT)
                .flatMap(map -> this.parseGeminiResponse((Map<String, Object>) map))
                .doOnSuccess(result -> log.info("✅ AI CV extraction succeeded. Extracted {} skills, {} education, {} experience entries.",
                        result.skills() != null ? result.skills().size() : 0,
                        result.education() != null ? result.education().size() : 0,
                        result.workExperience() != null ? result.workExperience().size() : 0));
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

            String cleanedJson = cleanJsonResponse(rawJsonText);
            AiCvExtractionResult result = objectMapper.readValue(cleanedJson, AiCvExtractionResult.class);
            return Mono.just(result);

        } catch (JsonProcessingException e) {
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
}
