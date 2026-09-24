package com.snapconnect.controller;

import com.snapconnect.dto.ChatMessagePayload;
import com.snapconnect.dto.ConversationDto;
import com.snapconnect.dto.StartConversationRequest;
import com.snapconnect.model.User;
import com.snapconnect.repository.UserRepository;
import com.snapconnect.service.ChatService;
import com.snapconnect.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST API controller for conversations and message history.
 *
 * All endpoints require a valid JWT Bearer token.
 * The JWT subject (email) is used to resolve the user's ID.
 *
 * Endpoints:
 *   GET  /api/conversations               — List all conversations for current user
 *   POST /api/conversations               — Start or get conversation with another user
 *   GET  /api/conversations/{id}/messages — Get message history
 *   POST /api/conversations/{id}/messages — Send and persist message via REST
 *   POST /api/conversations/{id}/read    — Mark all messages as read
 *   GET  /api/messages/unread-count      — Get total unread count for current user
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ConversationController {

    private final ChatService           chatService;
    private final JwtService            jwtService;
    private final UserRepository        userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /** GET /api/conversations — List conversations for the authenticated user */
    @GetMapping("/conversations")
    public ResponseEntity<Map<String, Object>> getConversations(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = extractUserId(authHeader);
        List<ConversationDto> convs = chatService.getConversationsForUser(userId);

        return ResponseEntity.ok(Map.of(
                "conversations", convs,
                "total", convs.size()
        ));
    }

    /** POST /api/conversations — Start or retrieve existing conversation */
    @PostMapping("/conversations")
    public ResponseEntity<ConversationDto> startConversation(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody StartConversationRequest request) {

        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(chatService.startOrGetConversation(userId, request));
    }

    /** GET /api/conversations/{id}/messages — Get message history */
    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<Map<String, Object>> getMessages(@PathVariable Long id) {
        List<ChatMessagePayload> msgs = chatService.getMessages(id);
        return ResponseEntity.ok(Map.of(
                "messages", msgs,
                "total", msgs.size()
        ));
    }

    /** POST /api/conversations/{id}/messages — Send and persist message via REST */
    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<ChatMessagePayload> sendMessage(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body) {

        Long userId = extractUserId(authHeader);
        String content = body.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        ChatMessagePayload payload = chatService.persistMessage(id, userId, content.trim());

        // Broadcast to WebSocket topic as well
        try {
            messagingTemplate.convertAndSend("/topic/conv/" + id, payload);
        } catch (Exception e) {
            log.warn("[ConversationController] WebSocket broadcast failed: {}", e.getMessage());
        }

        return ResponseEntity.ok(payload);
    }

    /** POST /api/conversations/{id}/read — Mark messages as read */
    @PostMapping("/conversations/{id}/read")
    public ResponseEntity<Void> markRead(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        Long userId = extractUserId(authHeader);
        chatService.markRead(id, userId);
        return ResponseEntity.ok().build();
    }

    /** GET /api/messages/unread-count — Total unread messages count */
    @GetMapping("/messages/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = extractUserId(authHeader);
        long count  = chatService.countUnread(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // ── Private helpers ───────────────────────────────────────────────

    private Long extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authentification requise : token JWT manquant.");
        }
        String token = authHeader.replace("Bearer ", "").trim();
        var claims = jwtService.extractClaims(token);
        Object userIdObj = claims.get("userId");
        if (userIdObj instanceof Number num) {
            return num.longValue();
        }
        if (userIdObj != null) {
            try {
                return Long.parseLong(String.valueOf(userIdObj));
            } catch (NumberFormatException ignored) {}
        }
        // Fallback to subject (email) lookup
        String email = claims.getSubject();
        if (email != null) {
            return userRepository.findByEmail(email).map(User::getId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'email: " + email));
        }
        throw new RuntimeException("Identifiant utilisateur introuvable dans le token JWT.");
    }
}
