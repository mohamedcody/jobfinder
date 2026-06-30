package jobfinder.services.implementation;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AiService {

    private final WebClient webClient;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public AiService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    @CircuitBreaker(name = "geminiApi", fallbackMethod = "fallbackSummarizeJob")
    public String summarizeJob(String description) {

        // check the description is not null or empty
        if (description == null || description.trim().isEmpty()) {
            return "No description available to summarize.";
        }


        // check the API key is present and does not contain unresolved placeholders
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.contains("${")) {
            log.error("❌ Gemini API Key is missing or not resolved! Current value: {}", geminiApiKey);
            return "AI Summary is unavailable: Missing API Key.";
        }

        String prompt = "Summarize this job description in 2-3 concise bullet points focusing on key responsibilities and requirements. Use a professional tone. \n\nJob Description: " + description;



        try {
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                             ))
                    )
            );

            Map response = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1beta/models/gemini-1.5-flash:generateContent")
                            .queryParam("key", geminiApiKey)
                            .build())
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(20))
                    .block();


            if (response != null && response.containsKey("candidates")) {

                List candidates = (List) response.get("candidates");

                if (!candidates.isEmpty()) {

                    Map candidate = (Map) candidates.get(0);
                    Map content = (Map) candidate.get("content");
                    List parts = (List) content.get("parts");
                    if (!parts.isEmpty()) {
                        Map part = (Map) parts.get(0);
                        return (String) part.get("text");
                    }

                }

            }

            log.warn("⚠️ AI Response received but candidates list is empty.");
            return "Could not generate summary at this time.";
        } catch (Exception e) {
            log.error("❌ Error during AI summarization: {}", e.getMessage(), e);
            return "AI Summary is currently unavailable. Please try again later.";
        }
    }

    public String fallbackSummarizeJob(String description, Throwable t) {
        log.error("🛑 Gemini API Circuit Breaker activated! Fallback executing due to: {}", t.getMessage());
        return "AI Summary is temporarily unavailable due to high load. Please try again later.";
    }
}
