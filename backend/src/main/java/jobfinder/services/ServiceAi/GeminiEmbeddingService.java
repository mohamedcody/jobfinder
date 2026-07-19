package jobfinder.services.ServiceAi;

import com.fasterxml.jackson.databind.JsonNode;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;


import java.util.List;
import java.util.Map;

@Service
public class GeminiEmbeddingService {
    @Value("${GEMINI_API_KEY}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public float[] generateEmbedding(String text) {

        // 1. Google Gemini Text Embedding API Endpoint
        String url = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=" + geminiApiKey;

        // 2. Prepare the JSON request body per Google's specifications
        Map<String, Object> requestBody = Map.of(
                "model", "models/text-embedding-004",
                "content", Map.of(
                        "parts", List.of(
                                Map.of("text", text)
                        )
                )
        );

        // 3. Set headers for JSON payload
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            // 4. Execute POST request and parse response
            JsonNode response = restTemplate.postForObject(url, request, JsonNode.class);

            // 5. Extract the embedding values array from the JSON response
            JsonNode valuesNode = response.path("embedding").path("values");

            // 6. Map the extracted values to a float array for the database
            float[] embedding = new float[valuesNode.size()];
            for (int i = 0; i < valuesNode.size(); i++) {
                embedding[i] = (float) valuesNode.get(i).asDouble();
            }

            return embedding;

        } catch (Exception e) {
            System.out.println("Error calling Gemini API: " + e.getMessage());
            return null;
        }
    }


}


