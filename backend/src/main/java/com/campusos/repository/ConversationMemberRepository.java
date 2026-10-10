package com.campusos.repository;

import com.campusos.domain.ConversationMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationMemberRepository extends JpaRepository<ConversationMember, UUID> {
    Optional<ConversationMember> findByConversationIdAndUserId(UUID conversationId, UUID userId);
}
