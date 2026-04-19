package jobfinder.servics.implemention;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    private final WebClient webClient;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public AiService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent")
                .build();
    }

    public String summarizeJob(String description) {
        if (description == null || description.trim().isEmpty()) {
            return "No description available to summarize.";
        }

        String prompt = "Summarize this job description in 3-5 concise bullet points focusing on key responsibilities and requirements. Use a professional tone. \n\nJob Description: " + description;

        try {
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    )
            );

            Map response = webClient.post()
                    .uri(uriBuilder -> uriBuilder.queryParam("key", geminiApiKey).build())
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(20)) // Timeout added here
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
            return "Could not generate summary at this time.";
        } catch (Exception e) {
            e.printStackTrace();
            return "AI Summary is currently unavailable. Please try again later.";
        }
    }
}
