package com.snapconnect.controller;

import com.snapconnect.dto.ChatMessagePayload;
import com.snapconnect.service.ChatService;
import com.snapconnect.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * WebSocket STOMP controller for real-time chat.
 *
 * Clients connect to ws://localhost:8080/ws via SockJS.
 * They authenticate by passing the JWT token as a STOMP header on CONNECT.
 *
 * Message flows:
 *   SEND /app/chat.send   → persist → broadcast to /topic/conv/{convId}
 *                                   → notify recipient at /user/{email}/queue/unread
 *   SEND /app/chat.typing → broadcast typing indicator to other participant
 *   SEND /app/chat.read   → mark messages read in DB
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService            chatService;
    private final SimpMessagingTemplate  messagingTemplate;
    private final JwtService             jwtService;

    /**
     * Handle incoming chat message.
     * Payload: { conversationId, senderId, content }
     * Broadcasts persisted message to /topic/conv/{conversationId}
     */
    @MessageMapping("/chat.send")
    public void handleMessage(@Payload Map<String, Object> payload,
                              SimpMessageHeaderAccessor headerAccessor) {
        try {
            Long   conversationId = toLong(payload.get("conversationId"));
            Long   senderId       = toLong(payload.get("senderId"));
            String content        = (String) payload.get("content");

            if (conversationId == null || senderId == null || content == null || content.isBlank()) {
                return;
            }

            // Persist message and get full payload back
            ChatMessagePayload saved = chatService.persistMessage(conversationId, senderId, content);

            // Broadcast to all subscribers of this conversation topic
            messagingTemplate.convertAndSend(
                    "/topic/conv/" + conversationId,
                    saved
            );

            log.debug("[Chat] Message {} persisted and broadcast to /topic/conv/{}",
                    saved.id(), conversationId);

        } catch (Exception e) {
            log.error("[Chat] Error handling message: {}", e.getMessage());
        }
    }

    /**
     * Handle typing indicator (not persisted — ephemeral broadcast only).
     * Payload: { conversationId, senderId, senderName, isTyping }
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload Map<String, Object> payload) {
        try {
            Long   conversationId = toLong(payload.get("conversationId"));
            Long   senderId       = toLong(payload.get("senderId"));
            String senderName     = (String) payload.getOrDefault("senderName", "");
            boolean isTyping      = Boolean.TRUE.equals(payload.get("isTyping"));

            if (conversationId == null || senderId == null) return;

            if ((senderName == null || senderName.isBlank()) && senderId != null) {
                senderName = chatService.getUserFullName(senderId);
            }

            // Create a lightweight typing event payload
            ChatMessagePayload typingEvent = new ChatMessagePayload(
                    null, conversationId, senderId, senderName, null,
                    isTyping ? "typing" : "stopped",
                    "TYPING", false, LocalDateTime.now()
            );

            messagingTemplate.convertAndSend("/topic/conv/" + conversationId, typingEvent);

        } catch (Exception e) {
            log.error("[Chat] Error handling typing event: {}", e.getMessage());
        }
    }

    /**
     * Handle read receipt (mark messages as read in DB).
     * Payload: { conversationId, readerId }
     */
    @MessageMapping("/chat.read")
    public void handleRead(@Payload Map<String, Object> payload) {
        try {
            Long conversationId = toLong(payload.get("conversationId"));
            Long readerId       = toLong(payload.get("readerId"));

            if (conversationId == null || readerId == null) return;

            chatService.markRead(conversationId, readerId);

            // Broadcast read receipt so sender sees "✓✓"
            ChatMessagePayload readEvent = new ChatMessagePayload(
                    null, conversationId, readerId, null, null,
                    null, "READ", true, LocalDateTime.now()
            );
            messagingTemplate.convertAndSend("/topic/conv/" + conversationId, readEvent);

        } catch (Exception e) {
            log.error("[Chat] Error handling read receipt: {}", e.getMessage());
        }
    }

    // ── Utility ──────────────────────────────────────────────────────

    private Long toLong(Object val) {
        if (val == null) return null;
        if (val instanceof Number n) return n.longValue();
        try { return Long.parseLong(val.toString()); }
        catch (NumberFormatException e) { return null; }
    }
}
