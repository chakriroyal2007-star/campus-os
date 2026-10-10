package com.campusos.service;

import com.campusos.domain.*;
import com.campusos.dto.AppDtos.*;
import com.campusos.exception.BadRequestException;
import com.campusos.exception.ResourceNotFoundException;
import com.campusos.repository.*;
import com.campusos.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository memberRepository;
    private final MessageRepository messageRepository;
    private final FriendshipRepository friendshipRepository;
    private final UserAccountRepository userRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<FriendshipDto> getFriends(UUID userId) {
        List<Friendship> friendships = friendshipRepository.findByUser(userId);
        return friendships.stream().map(f -> {
            boolean isRequester = f.getRequester().getId().equals(userId);
            UserAccount friend = isRequester ? f.getAddressee() : f.getRequester();
            String role = friend.getRoles().isEmpty() ? "MEMBER" : friend.getRoles().iterator().next().getRole();

            return new FriendshipDto(
                    f.getId(),
                    friend.getId(),
                    friend.getFullName(),
                    friend.getEmail(),
                    role,
                    f.getStatus(),
                    f.getCreatedAt()
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public FriendshipDto sendFriendRequest(UUID requesterUserId, UUID addresseeUserId) {
        if (requesterUserId.equals(addresseeUserId)) {
            throw new BadRequestException("You cannot send a friend request to yourself.");
        }

        UserAccount requester = userRepository.findById(requesterUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + requesterUserId));
        UserAccount addressee = userRepository.findById(addresseeUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + addresseeUserId));

        Optional<Friendship> existing = friendshipRepository.findBetweenUsers(requesterUserId, addresseeUserId);
        if (existing.isPresent()) {
            Friendship f = existing.get();
            return new FriendshipDto(f.getId(), addressee.getId(), addressee.getFullName(), addressee.getEmail(), "MEMBER", f.getStatus(), f.getCreatedAt());
        }

        Friendship friendship = Friendship.builder()
                .requester(requester)
                .addressee(addressee)
                .status("PENDING")
                .build();

        friendship = friendshipRepository.save(friendship);
        return new FriendshipDto(friendship.getId(), addressee.getId(), addressee.getFullName(), addressee.getEmail(), "MEMBER", friendship.getStatus(), friendship.getCreatedAt());
    }

    @Transactional
    public void respondFriendRequest(UUID userId, UUID friendshipId, boolean accept) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Friendship not found: " + friendshipId));

        if (!friendship.getAddressee().getId().equals(userId)) {
            throw new BadRequestException("You can only respond to friend requests addressed to you.");
        }

        friendship.setStatus(accept ? "ACCEPTED" : "DECLINED");
        friendshipRepository.save(friendship);
    }

    @Transactional(readOnly = true)
    public List<ConversationDto> getUserConversations(UUID userId) {
        List<Conversation> convs = conversationRepository.findByUserId(userId);
        return convs.stream().map(c -> {
            List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(c.getId());
            MessageDto lastMsg = messages.isEmpty() ? null : mapMessageToDto(messages.get(messages.size() - 1));

            List<String> memberNames = c.getMembers().stream()
                    .map(m -> m.getUser().getFullName())
                    .collect(Collectors.toList());

            String courseName = c.getCourseOffering() != null ? c.getCourseOffering().getSubject().getName() : null;

            return new ConversationDto(
                    c.getId(),
                    c.getTitle() != null ? c.getTitle() : "Direct Message",
                    c.getIsGroup(),
                    c.getCourseOffering() != null ? c.getCourseOffering().getId() : null,
                    courseName,
                    memberNames,
                    lastMsg,
                    c.getCreatedAt()
            );
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MessageDto> getConversationMessages(UUID userId, UUID conversationId) {
        memberRepository.findByConversationIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("You are not a member of this conversation."));

        List<Message> msgs = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        return msgs.stream().map(this::mapMessageToDto).collect(Collectors.toList());
    }

    @Transactional
    public MessageDto sendMessage(UUID senderUserId, SendMessageRequest req) {
        UserAccount sender = userRepository.findById(senderUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + senderUserId));

        Conversation conversation = conversationRepository.findById(req.conversationId())
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + req.conversationId()));

        memberRepository.findByConversationIdAndUserId(conversation.getId(), senderUserId)
                .orElseThrow(() -> new BadRequestException("You must be a member of the conversation to send a message."));

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(req.content())
                .build();

        message = messageRepository.save(message);
        MessageDto dto = mapMessageToDto(message);

        // STOMP WebSocket broadcast
        try {
            messagingTemplate.convertAndSend("/topic/conversations/" + conversation.getId(), dto);
        } catch (Exception ignored) {}

        return dto;
    }

    @Transactional
    public ConversationDto createConversation(UUID creatorUserId, CreateConversationRequest req) {
        UserAccount creator = userRepository.findById(creatorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + creatorUserId));

        CourseOffering co = req.courseOfferingId() != null
                ? courseOfferingRepository.findById(req.courseOfferingId()).orElse(null)
                : null;

        Conversation conv = Conversation.builder()
                .institution(creator.getInstitution())
                .title(req.title())
                .isGroup(req.isGroup())
                .courseOffering(co)
                .createdBy(creator)
                .build();

        conv = conversationRepository.save(conv);

        // Add creator
        ConversationMember creatorMember = ConversationMember.builder()
                .conversation(conv)
                .user(creator)
                .build();
        memberRepository.save(creatorMember);
        conv.getMembers().add(creatorMember);

        // Add other members
        if (req.memberUserIds() != null) {
            for (UUID targetId : req.memberUserIds()) {
                if (!targetId.equals(creatorUserId)) {
                    UserAccount target = userRepository.findById(targetId).orElse(null);
                    if (target != null) {
                        ConversationMember mem = ConversationMember.builder()
                                .conversation(conv)
                                .user(target)
                                .build();
                        memberRepository.save(mem);
                        conv.getMembers().add(mem);
                    }
                }
            }
        }

        MessageDto initialMsgDto = null;
        if (req.initialMessage() != null && !req.initialMessage().isBlank()) {
            Message msg = Message.builder()
                    .conversation(conv)
                    .sender(creator)
                    .content(req.initialMessage())
                    .build();
            msg = messageRepository.save(msg);
            initialMsgDto = mapMessageToDto(msg);
        }

        List<String> memberNames = conv.getMembers().stream()
                .map(m -> m.getUser().getFullName())
                .collect(Collectors.toList());

        return new ConversationDto(
                conv.getId(),
                conv.getTitle(),
                conv.getIsGroup(),
                co != null ? co.getId() : null,
                co != null ? co.getSubject().getName() : null,
                memberNames,
                initialMsgDto,
                conv.getCreatedAt()
        );
    }

    private MessageDto mapMessageToDto(Message m) {
        return new MessageDto(
                m.getId(),
                m.getConversation().getId(),
                m.getSender().getId(),
                m.getSender().getFullName(),
                m.getContent(),
                m.getCreatedAt()
        );
    }
}
