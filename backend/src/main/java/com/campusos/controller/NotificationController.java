package com.campusos.controller;

import com.campusos.config.UserPrincipal;
import com.campusos.dto.AppDtos.NotificationDto;
import com.campusos.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Endpoints for in-app notifications and preferences")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get in-app notifications for authenticated user")
    public ResponseEntity<List<NotificationDto>> getNotifications(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(notificationService.getUserNotifications(principal.getId()));
    }

    @PostMapping("/{notificationId}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<Void> markAsRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID notificationId) {
        notificationService.markAsRead(notificationId, principal.getId());
        return ResponseEntity.ok().build();
    }
}
