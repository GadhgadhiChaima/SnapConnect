package com.snapconnect.repository;

import com.snapconnect.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /** Messages in a conversation ordered oldest→newest */
    List<ChatMessage> findByConversationIdOrderBySentAtAsc(Long conversationId);

    /** Count unread messages for a user (messages not from them, unread) */
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.conversationId IN " +
           "(SELECT c.id FROM Conversation c WHERE c.participantOneId = :userId OR c.participantTwoId = :userId) " +
           "AND m.senderId <> :userId AND m.isRead = false")
    long countUnreadForUser(Long userId);

    /** Mark all messages in a conversation as read (except those sent by the reader) */
    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.conversationId = :conversationId AND m.senderId <> :readerId")
    void markAllReadInConversation(Long conversationId, Long readerId);
}
