package com.campusos.controller;

import com.campusos.config.UserPrincipal;
import com.campusos.dto.AppDtos.*;
import com.campusos.service.CommunityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/community")
@RequiredArgsConstructor
@Tag(name = "Community & Real-time Messaging", description = "Endpoints for student connections, group channels, and direct messages")
public class CommunityController {

    private final CommunityService communityService;

    @GetMapping("/friends")
    @Operation(summary = "Get friends and friend requests list")
    public ResponseEntity<List<FriendshipDto>> getFriends(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(communityService.getFriends(principal.getId()));
    }

    @PostMapping("/friends/request/{targetUserId}")
    @Operation(summary = "Send a friend request")
    public ResponseEntity<FriendshipDto> sendFriendRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID targetUserId) {
        return ResponseEntity.ok(communityService.sendFriendRequest(principal.getId(), targetUserId));
    }

    @PostMapping("/friends/respond/{friendshipId}")
    @Operation(summary = "Accept or decline a friend request")
    public ResponseEntity<Void> respondFriendRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID friendshipId,
            @RequestParam boolean accept) {
        communityService.respondFriendRequest(principal.getId(), friendshipId, accept);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/conversations")
    @Operation(summary = "Get user's direct and group conversations")
    public ResponseEntity<List<ConversationDto>> getConversations(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(communityService.getUserConversations(principal.getId()));
    }

    @PostMapping("/conversations")
    @Operation(summary = "Create a new conversation or group channel")
    public ResponseEntity<ConversationDto> createConversation(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateConversationRequest req) {
        return ResponseEntity.ok(communityService.createConversation(principal.getId(), req));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    @Operation(summary = "Get message history for a conversation")
    public ResponseEntity<List<MessageDto>> getMessages(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID conversationId) {
        return ResponseEntity.ok(communityService.getConversationMessages(principal.getId(), conversationId));
    }

    @PostMapping("/messages")
    @Operation(summary = "Send a message into a conversation")
    public ResponseEntity<MessageDto> sendMessage(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SendMessageRequest req) {
        return ResponseEntity.ok(communityService.sendMessage(principal.getId(), req));
    }
}
