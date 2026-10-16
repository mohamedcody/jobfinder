package jobfinder.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jobfinder.services.ServiceAi.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI Chat", description = "AI Chatbot Endpoints")
public class AiChatController {

    private final AiService aiService;

    @PostMapping("/chat")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, List<Map<String, Object>>> request) {
        log.info("POST /api/ai/chat");
        List<Map<String, Object>> contents = request.get("contents");
        String responseText = aiService.chat(contents);
        return ResponseEntity.ok(Map.of("reply", responseText != null ? responseText : "Could not generate response."));
    }
}
