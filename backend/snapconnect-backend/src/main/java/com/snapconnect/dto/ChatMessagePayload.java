package com.snapconnect.dto;

import java.time.LocalDateTime;

/**
 * DTO used for both:
 * - STOMP WebSocket messages (real-time delivery)
 * - REST API responses (conversation history)
 *
 * type field:
 *   "CHAT"    — normal text message
 *   "TYPING"  — typing indicator (not persisted)
 *   "READ"    — read receipt
 */
public record ChatMessagePayload(
        Long id,
        Long conversationId,
        Long senderId,
        String senderName,
        String senderAvatar,
        String content,
        String type,        // "CHAT" | "TYPING" | "READ"
        boolean isRead,
        LocalDateTime sentAt
) {}
