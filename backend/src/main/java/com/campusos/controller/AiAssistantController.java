package com.campusos.controller;

import com.campusos.config.UserPrincipal;
import com.campusos.dto.AppDtos.*;
import com.campusos.service.AiAssistantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Assistant & RAG", description = "Endpoints for AI tutoring, step-by-step solutions, revision plans, and syllabus Q&A")
public class AiAssistantController {

    private final AiAssistantService aiService;

    @GetMapping("/conversations")
    @Operation(summary = "Get user's AI conversation history")
    public ResponseEntity<List<AiConversationDto>> getConversations(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(aiService.getUserConversations(principal.getId()));
    }

    @PostMapping("/prompt")
    @Operation(summary = "Send a prompt to the AI Assistant with course context")
    public ResponseEntity<AiResponseDto> generateResponse(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AiPromptRequest req) {
        return ResponseEntity.ok(aiService.generateAiResponse(principal.getId(), req));
    }
}
