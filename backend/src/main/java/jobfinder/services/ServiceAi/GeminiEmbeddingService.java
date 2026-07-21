package jobfinder.services.ServiceAi;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;


import java.util.List;
import java.util.Map;

/**
 * ملحوظة مهمة (21-07-2026):
 * Google قفلت موديل "text-embedding-004" نهائيًا بتاريخ 14 يناير 2026،
 * وده اللي كان بيسبب الـ 404 المتكرر في اللوج. البديل الرسمي هو
 * "gemini-embedding-001".
 *
 * الموديل الجديد بيرجع افتراضيًا vector بحجم 3072، بينما القديم كان بيرجع 768.
 * عشان منضطرش نغيّر حجم عمود الـ pgvector في الداتابيز (ونعيد توليد كل
 * الـ embeddings القديمة)، بنحدد "outputDimensionality: 768" في الـ request
 * عشان الموديل الجديد يرجّع نفس الحجم القديم.
 *
 * لو الـ pgvector column عندك متعرّف بحجم مختلف عن 768، غيّر قيمة
 * OUTPUT_DIMENSIONALITY تحت عشان تتطابق مع العمود، أو شيل السطر ده
 * خالص لو عايز الحجم الكامل (3072) وتعمل migration للعمود.
 */
@Service
@Slf4j
public class GeminiEmbeddingService {
    @Value("${GEMINI_API_KEY}")
    private String geminiApiKey;

    private static final String MODEL_NAME = "gemini-embedding-001";
    private static final int OUTPUT_DIMENSIONALITY = 768;

    private final RestTemplate restTemplate = new RestTemplate();

    public float[] generateEmbedding(String text) {

        // 1. Google Gemini Text Embedding API Endpoint (الموديل الجديد)
        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                + MODEL_NAME + ":embedContent?key=" + geminiApiKey;

        // 2. Prepare the JSON request body per Google's specifications
        Map<String, Object> requestBody = Map.of(
                "model", "models/" + MODEL_NAME,
                "content", Map.of(
                        "parts", List.of(
                                Map.of("text", text)
                        )
                ),
                "outputDimensionality", OUTPUT_DIMENSIONALITY
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

        } catch (RestClientException e) {
            log.error("❌ Error calling Gemini Embedding API (model={}): {}", MODEL_NAME, e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("❌ Unexpected error while parsing Gemini embedding response: {}", e.getMessage(), e);
            return null;
        }
    }


}