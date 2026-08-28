package jobfinder.services.ServiceAi;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AiService {

    
    // class responsepelety the ai Service
    private final GeminiApiClient geminiClient;
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(20);

    public AiService(GeminiApiClient geminiClient) {
        this.geminiClient = geminiClient;
    }

    public String summarizeJob(String description) {
        if (description == null || description.trim().isEmpty()) {
            return "No description available to summarize.";
        }
        try {
            String prompt = "Summarize the following job description in one brief paragraph:\n" + description;
            Map response = geminiClient.generateContent(prompt, REQUEST_TIMEOUT).block();

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
}
