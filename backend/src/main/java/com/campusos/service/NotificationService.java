package com.campusos.service;

import com.campusos.domain.Notification;
import com.campusos.domain.OutboxEvent;
import com.campusos.domain.UserAccount;
import com.campusos.dto.AppDtos.NotificationDto;
import com.campusos.exception.ResourceNotFoundException;
import com.campusos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final UserAccountRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationDto createNotification(UUID targetUserId, String title, String message, String type, String referenceId) {
        UserAccount targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + targetUserId));

        Notification notification = Notification.builder()
                .user(targetUser)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);

        // Record in transactional outbox
        OutboxEvent outbox = OutboxEvent.builder()
                .aggregateType("NOTIFICATION")
                .aggregateId(notification.getId().toString())
                .eventType("NOTIFICATION_CREATED")
                .payload(String.format("{\"userId\":\"%s\",\"title\":\"%s\",\"type\":\"%s\"}", targetUserId, title, type))
                .status("PENDING")
                .build();
        outboxEventRepository.save(outbox);

        NotificationDto dto = mapToDto(notification);

        // Send via WebSocket STOMP
        try {
            messagingTemplate.convertAndSend("/topic/notifications/" + targetUserId, dto);
        } catch (Exception ignored) {}

        return dto;
    }

    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        if (n.getUser().getId().equals(userId)) {
            n.setIsRead(true);
            notificationRepository.save(n);
        }
    }

    private NotificationDto mapToDto(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.getReferenceId(),
                n.getIsRead(),
                n.getCreatedAt()
        );
    }
}
