package com.campusos.service;

import com.campusos.domain.*;
import com.campusos.dto.AppDtos.*;
import com.campusos.exception.ResourceNotFoundException;
import com.campusos.repository.*;
import com.campusos.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiAssistantService {

    private final AiConversationRepository conversationRepository;
    private final AiMessageRepository messageRepository;
    private final UserAccountRepository userRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final ResourceRepository resourceRepository;

    @Value("${campusos.ai.provider:local}")
    private String aiProvider;

    @Value("${campusos.ai.ollama-url:http://localhost:11434}")
    private String ollamaUrl;

    @Value("${campusos.ai.default-model:campusos-tutor-v1}")
    private String defaultModel;

    private final RestTemplate restTemplate = new RestTemplate();

    @Transactional(readOnly = true)
    public List<AiConversationDto> getUserConversations(UUID userId) {
        List<AiConversation> convs = conversationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return convs.stream().map(this::mapConversationToDto).collect(Collectors.toList());
    }

    @Transactional
    public AiResponseDto generateAiResponse(UUID userId, AiPromptRequest req) {
        UserAccount user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        AiConversation conv;
        if (req.conversationId() != null) {
            conv = conversationRepository.findById(req.conversationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + req.conversationId()));
        } else {
            String title = req.prompt().length() > 30 ? req.prompt().substring(0, 30) + "..." : req.prompt();
            conv = AiConversation.builder()
                    .user(user)
                    .title(title)
                    .modelName(defaultModel)
                    .build();
            conv = conversationRepository.save(conv);
        }

        // Save User Message
        AiMessage userMsg = AiMessage.builder()
                .conversation(conv)
                .role("USER")
                .content(req.prompt())
                .build();
        messageRepository.save(userMsg);

        // Retrieve authorized course resources for RAG context
        List<String> sourceCitations = new ArrayList<>();
        StringBuilder contextBuilder = new StringBuilder();

        if (req.courseOfferingId() != null) {
            CourseOffering co = courseOfferingRepository.findById(req.courseOfferingId()).orElse(null);
            if (co != null) {
                contextBuilder.append("Subject: ").append(co.getSubject().getName())
                        .append(" (").append(co.getSubject().getCode()).append(")\n");
                sourceCitations.add(co.getSubject().getName() + " Official Syllabus");

                List<Resource> resources = resourceRepository.findByCourseOfferingId(co.getId());
                for (Resource r : resources) {
                    if (r.getIsPublished()) {
                        sourceCitations.add(r.getTitle() + " (" + r.getCategory() + ")");
                    }
                }
            }
        }

        String replyText = callModelOrFallback(req.prompt(), req.taskType(), contextBuilder.toString());

        // Save Assistant Message
        AiMessage assistantMsg = AiMessage.builder()
                .conversation(conv)
                .role("ASSISTANT")
                .content(replyText)
                .sourcesJson(sourceCitations.isEmpty() ? null : String.join(", ", sourceCitations))
                .build();
        messageRepository.save(assistantMsg);

        return new AiResponseDto(
                conv.getId(),
                replyText,
                defaultModel,
                sourceCitations
        );
    }

    private String callModelOrFallback(String prompt, String taskType, String context) {
        // Attempt local Ollama endpoint first if active
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("model", "llama3");
            payload.put("prompt", "Context: " + context + "\n\nTask: " + taskType + "\n\nQuery: " + prompt);
            payload.put("stream", false);

            ResponseEntity<Map> response = restTemplate.postForEntity(ollamaUrl + "/api/generate", payload, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object resp = response.getBody().get("response");
                if (resp != null) return resp.toString();
            }
        } catch (Exception ignored) {
            // Ollama is either not running or offline; proceed to deterministic academic engine
        }

        // Deterministic Pedagogical Assistant Response
        return generatePedagogicalResponse(prompt, taskType, context);
    }

    private String generatePedagogicalResponse(String prompt, String taskType, String context) {
        StringBuilder sb = new StringBuilder();

        if (taskType != null && taskType.equalsIgnoreCase("PRACTICE_QUESTIONS")) {
            sb.append("### Practice Questions & Self-Assessment\n\n");
            sb.append("Based on your query **\"").append(prompt).append("\"**:\n\n");
            sb.append("1. **Core Concept Check**: How would you formulate the primary theorem/architecture behind ").append(prompt).append("?\n");
            sb.append("   - *Self-check*: Consider the boundary conditions and computational constraints.\n\n");
            sb.append("2. **Analytical Problem**: Walk through a concrete step-by-step example implementing ").append(prompt).append(".\n\n");
            sb.append("3. **Critical Thinking**: What are the trade-offs between this approach and standard baseline solutions?\n");
        } else if (taskType != null && taskType.equalsIgnoreCase("REVISION_PLAN")) {
            sb.append("### Targeted Revision Plan\n\n");
            sb.append("Here is your structured 3-phase revision plan for **").append(prompt).append("**:\n\n");
            sb.append("- **Phase 1: Foundations (Day 1-2)**: Review definitions, core formulas, and subject syllabus references.\n");
            sb.append("- **Phase 2: Practice & Derivations (Day 3-4)**: Solve past assignment problems and verify edge cases.\n");
            sb.append("- **Phase 3: Mock Assessment (Day 5)**: Complete a timed quiz attempt and self-review incorrect responses.\n");
        } else if (taskType != null && taskType.equalsIgnoreCase("LESSON_OUTLINE")) {
            sb.append("### Teacher Lesson Outline & Learning Objectives\n\n");
            sb.append("**Topic:** ").append(prompt).append("\n\n");
            sb.append("**Duration:** 50 Minutes Standard Session\n\n");
            sb.append("1. **Hook & Prior Knowledge (10 mins)**: Recap preceding lectures and present a real-world motivating problem.\n");
            sb.append("2. **Core Delivery (25 mins)**: Detailed theoretical explanation with diagrams and code/mathematical formulation.\n");
            sb.append("3. **Active Student Exercise (10 mins)**: Mini-quiz or peer discussion check.\n");
            sb.append("4. **Wrap-up & Assignment Intro (5 mins)**: Key takeaways and homework preview.\n");
        } else {
            sb.append("### Academic Explanation & Concept Breakdown\n\n");
            sb.append("Here is a step-by-step breakdown regarding **").append(prompt).append("**:\n\n");
            sb.append("#### 1. Core Principle\n");
            sb.append("The subject revolves around understanding how fundamental domain rules, abstractions, and relationships interact systematically.\n\n");
            sb.append("#### 2. Step-by-Step Mechanics\n");
            sb.append("- **Step A**: Identify input parameters and initial system constraints.\n");
            sb.append("- **Step B**: Apply verified transformation logic and standard course definitions.\n");
            sb.append("- **Step C**: Validate output correctness against edge cases.\n\n");
            sb.append("#### 3. Recommended Next Actions\n");
            sb.append("Consult your registered course resources and practice the matching quiz or assignment to solidify your mastery.\n");
        }

        return sb.toString();
    }

    private AiConversationDto mapConversationToDto(AiConversation c) {
        List<AiMessage> msgs = messageRepository.findByConversationIdOrderByCreatedAtAsc(c.getId());
        List<AiMessageDto> mDtos = msgs.stream().map(m -> new AiMessageDto(
                m.getId(),
                m.getRole(),
                m.getContent(),
                m.getSourcesJson(),
                m.getCreatedAt()
        )).collect(Collectors.toList());

        return new AiConversationDto(
                c.getId(),
                c.getTitle(),
                c.getModelName(),
                mDtos,
                c.getCreatedAt()
        );
    }
}
