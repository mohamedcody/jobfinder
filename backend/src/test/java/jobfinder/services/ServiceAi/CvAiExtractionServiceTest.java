package jobfinder.services.ServiceAi;

import com.fasterxml.jackson.databind.ObjectMapper;
import jobfinder.exception.MalformedAiResponseException;
import jobfinder.model.dto.AiCvExtractionResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CvAiExtractionServiceTest {

    @Mock
    private GeminiApiClient geminiClient;

    private ObjectMapper objectMapper;

    private CvAiExtractionService service;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper(); // Real ObjectMapper
        service = new CvAiExtractionService(geminiClient, objectMapper);
    }

    /**
     * Helper to construct a valid base Gemini response map.
     */
    private Map<String, Object> createGeminiResponse(String textContent) {
        Map<String, Object> part = new HashMap<>();
        part.put("text", textContent);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", Collections.singletonList(part));

        Map<String, Object> candidate = new HashMap<>();
        candidate.put("content", content);

        Map<String, Object> response = new HashMap<>();
        response.put("candidates", Collections.singletonList(candidate));

        return response;
    }

    @Nested
    class HappyPaths {

        @Test
        void extractCvData_validResponse_parsesSuccessfully() {
            // Arrange
            String json = "{\"fullName\": \"John Doe\", \"email\": \"john@example.com\", \"yearsOfExperience\": 5}";
            Map<String, Object> response = createGeminiResponse(json);

            when(geminiClient.generateContent(any(String.class), any(Duration.class)))
                    .thenReturn(Mono.just(response));

            // Act
            Mono<AiCvExtractionResult> resultMono = service.extractCvData("CV text");

            // Assert
            StepVerifier.create(resultMono)
                    .assertNext(result -> {
                        assertThat(result.fullName()).isEqualTo("John Doe");
                        assertThat(result.email()).isEqualTo("john@example.com");
                        assertThat(result.yearsOfExperience()).isEqualTo(5);
                    })
                    .verifyComplete();
        }

        @Test
        void extractCvData_jsonWrappedInMarkdownJson_cleanedAndParsedSuccessfully() {
            // Arrange
            String json = "```json\n{\"fullName\": \"Jane Doe\", \"email\": \"jane@example.com\"}\n```";
            Map<String, Object> response = createGeminiResponse(json);

            when(geminiClient.generateContent(any(String.class), any(Duration.class)))
                    .thenReturn(Mono.just(response));

            // Act
            Mono<AiCvExtractionResult> resultMono = service.extractCvData("CV text");

            // Assert
            StepVerifier.create(resultMono)
                    .assertNext(result -> {
                        assertThat(result.fullName()).isEqualTo("Jane Doe");
                        assertThat(result.email()).isEqualTo("jane@example.com");
                    })
                    .verifyComplete();
        }

        @Test
        void extractCvData_jsonWrappedInGenericMarkdown_cleanedAndParsedSuccessfully() {
            // Arrange
            String json = "```\n{\"fullName\": \"Jack Doe\", \"email\": \"jack@example.com\"}\n```";
            Map<String, Object> response = createGeminiResponse(json);

            when(geminiClient.generateContent(any(String.class), any(Duration.class)))
                    .thenReturn(Mono.just(response));

            // Act
            Mono<AiCvExtractionResult> resultMono = service.extractCvData("CV text");

            // Assert
            StepVerifier.create(resultMono)
                    .assertNext(result -> {
                        assertThat(result.fullName()).isEqualTo("Jack Doe");
                        assertThat(result.email()).isEqualTo("jack@example.com");
                    })
                    .verifyComplete();
        }

        @Test
        void extractCvData_extraUnknownFieldsInJson_ignoredSuccessfully() {
            // Arrange
            String json = "{\"fullName\": \"Bob\", \"email\": \"bob@example.com\", \"unknownField\": \"some value\"}";
            Map<String, Object> response = createGeminiResponse(json);

            when(geminiClient.generateContent(any(String.class), any(Duration.class)))
                    .thenReturn(Mono.just(response));

            // Act
            Mono<AiCvExtractionResult> resultMono = service.extractCvData("CV text");

            // Assert
            StepVerifier.create(resultMono)
                    .assertNext(result -> {
                        assertThat(result.fullName()).isEqualTo("Bob");
                        assertThat(result.email()).isEqualTo("bob@example.com");
                    })
                    .verifyComplete();
        }
    }

    @Nested
    class ErrorPaths {

        @Test
        void extractCvData_nullResponseFromGemini_throwsException() {
            // Arrange
            // Note: Reactor Mono does not allow emitting null. The only way the `response == null` check
            // could be hit in practice is if somehow the map is null, which we can simulate by throwing
            // or by checking the identical logic branch (missing 'candidates' key).
            // We simulate a response lacking the expected structure.
            when(geminiClient.generateContent(any(String.class), any(Duration.class)))
                    .thenReturn(Mono.just(new HashMap<>()));

            // Act
            Mono<AiCvExtractionResult> resultMono = service.extractCvData("CV text");

            // Assert
            StepVerifier.create(resultMono)
                    .expectErrorMatches(throwable -> throwable instanceof MalformedAiResponseException &&
                            throwable.getMessage().contains("Gemini response missing 'candidates' field."))
                    .verify();
        }

        @Test
        void extractCvData_missingCandidatesKey_throwsException() {
            // Arrange
            Map<String, Object> response = new HashMap<>(); // missing 'candidates'
            when(geminiClient.generateContent(any(String.class), any(Duration.class)))
                    .thenReturn(Mono.just(response));

            // Act
            Mono<AiCvExtractionResult> resultMono = service.extractCvData("CV text");

            // Assert
            StepVerifier.create(resultMono)
                    .expectErrorMatches(throwable -> throwable instanceof MalformedAiResponseException &&
                            throwable.getMessage().contains("Gemini response missing 'candidates' field."))
                    .verify();
        }

        @Test
        void extractCvData_emptyCandidatesList_throwsException() {
            // Arrange
            Map<String, Object> response = new HashMap<>();
            response.put("candidates", new ArrayList<>()); // empty list

            when(geminiClient.generateContent(any(String.class), any(Duration.class)))
                    .thenReturn(Mono.just(response));

            // Act
            Mono<AiCvExtractionResult> resultMono = service.extractCvData("CV text");

            // Assert
            StepVerifier.create(resultMono)
                    .expectErrorMatches(throwable -> throwable instanceof MalformedAiResponseException &&
                            throwable.getMessage().contains("Gemini response has empty candidates list."))
                    .verify();
        }

        @Test
        void extractCvData_nullContent_throwsException() {
            // Arrange
            Map<String, Object> candidate = new HashMap<>();
            candidate.put("content", null); // safety filter block simulation

            Map<String, Object> response = new HashMap<>();
            response.put("candidates", Collections.singletonList(candidate));

            when(geminiClient.generateContent(any(String.class), any(Duration.class)))
                    .thenReturn(Mono.just(response));

            // Act
            Mono<AiCvExtractionResult> resultMono = service.extractCvData("CV text");

            // Assert
            StepVerifier.create(resultMono)
                    .expectErrorMatches(throwable -> throwable instanceof MalformedAiResponseException &&
                            throwable.getMessage().contains("AI blocked the content due to safety filters."))
                    .verify();
        }

        @Test
        void extractCvData_emptyPartsList_throwsException() {
            // Arrange
            Map<String, Object> content = new HashMap<>();
            content.put("parts", new ArrayList<>()); // empty parts list

            Map<String, Object> candidate = new HashMap<>();
            candidate.put("content", content);

            Map<String, Object> response = new HashMap<>();
            response.put("candidates", Collections.singletonList(candidate));

            when(geminiClient.generateContent(any(String.class), any(Duration.class)))
                    .thenReturn(Mono.just(response));

            // Act
            Mono<AiCvExtractionResult> resultMono = service.extractCvData("CV text");

            // Assert
            StepVerifier.create(resultMono)
                    .expectErrorMatches(throwable -> throwable instanceof MalformedAiResponseException &&
                            throwable.getMessage().contains("Gemini response has no content parts."))
                    .verify();
        }

        @Test
        void extractCvData_invalidJsonInText_throwsException() {
            // Arrange
            String invalidJson = "{ invalid json formatting ]";
            Map<String, Object> response = createGeminiResponse(invalidJson);

            when(geminiClient.generateContent(any(String.class), any(Duration.class)))
                    .thenReturn(Mono.just(response));

            // Act
            Mono<AiCvExtractionResult> resultMono = service.extractCvData("CV text");

            // Assert
            StepVerifier.create(resultMono)
                    .expectErrorMatches(throwable -> throwable instanceof MalformedAiResponseException &&
                            throwable.getMessage().contains("AI returned invalid JSON"))
                    .verify();
        }

        @Test
        void extractCvData_geminiClientReturnsErrorMono_errorPropagated() {
            // Arrange
            RuntimeException clientError = new RuntimeException("API limit exceeded");
            when(geminiClient.generateContent(any(String.class), any(Duration.class)))
                    .thenReturn(Mono.error(clientError));

            // Act
            Mono<AiCvExtractionResult> resultMono = service.extractCvData("CV text");

            // Assert
            StepVerifier.create(resultMono)
                    .expectErrorMatches(throwable -> throwable == clientError)
                    .verify();
        }
    }
}
