package com.campusos.repository;

import com.campusos.domain.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    @Query("SELECT c FROM Conversation c JOIN c.members m WHERE m.user.id = :userId")
    List<Conversation> findByUserId(@Param("userId") UUID userId);
}
