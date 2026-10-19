package jobfinder.controller;

import jobfinder.services.ServiceAi.AiService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiChatControllerTest {

    @Mock
    private AiService aiService;

    @InjectMocks
    private AiChatController aiChatController;

    @Test
    @DisplayName("chat returns reply from AiService")
    void chat_happyPath_returnsReply() {
        List<Map<String, Object>> contents = List.of(Map.of("role", "user", "text", "Hello AI"));
        Map<String, List<Map<String, Object>>> request = Map.of("contents", contents);

        when(aiService.chat(contents)).thenReturn("Hello! How can I assist you with your job search today?");

        ResponseEntity<Map<String, String>> response = aiChatController.chat(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).containsEntry("reply", "Hello! How can I assist you with your job search today?");
        verify(aiService).chat(contents);
    }

    @Test
    @DisplayName("chat returns fallback message when AiService returns null")
    void chat_nullReply_returnsFallback() {
        List<Map<String, Object>> contents = List.of(Map.of("role", "user", "text", "test"));
        Map<String, List<Map<String, Object>>> request = Map.of("contents", contents);

        when(aiService.chat(contents)).thenReturn(null);

        ResponseEntity<Map<String, String>> response = aiChatController.chat(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).containsEntry("reply", "Could not generate response.");
    }
}
