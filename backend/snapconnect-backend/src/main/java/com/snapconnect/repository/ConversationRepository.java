package com.snapconnect.repository;

import com.snapconnect.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /** Find all conversations where this user is a participant (newest first) */
    @Query("SELECT c FROM Conversation c WHERE c.participantOneId = :userId OR c.participantTwoId = :userId ORDER BY COALESCE(c.lastMessageAt, c.createdAt) DESC")
    List<Conversation> findAllByUserId(Long userId);

    /** Find existing conversation between two users */
    @Query("SELECT c FROM Conversation c WHERE (c.participantOneId = :uid1 AND c.participantTwoId = :uid2) OR (c.participantOneId = :uid2 AND c.participantTwoId = :uid1)")
    Optional<Conversation> findByParticipants(Long uid1, Long uid2);
}
