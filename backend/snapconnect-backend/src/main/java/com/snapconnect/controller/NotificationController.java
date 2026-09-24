package com.snapconnect.controller;

import com.snapconnect.model.NotificationEntity;
import com.snapconnect.service.JwtService;
import com.snapconnect.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getMyNotifications(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "userId", required = false) Long paramUserId) {

        Long userId = resolveUserId(authHeader, paramUserId);
        if (userId == null) {
            return ResponseEntity.ok(Map.of("notifications", List.of(), "total", 0, "unreadCount", 0));
        }

        List<NotificationEntity> notifs = notificationService.getNotificationsForUser(userId);
        long unreadCount = notificationService.getUnreadCount(userId);

        return ResponseEntity.ok(Map.of(
                "notifications", notifs,
                "total", notifs.size(),
                "unreadCount", unreadCount
        ));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "userId", required = false) Long paramUserId) {

        Long userId = resolveUserId(authHeader, paramUserId);
        long count = userId != null ? notificationService.getUnreadCount(userId) : 0;
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "userId", required = false) Long paramUserId) {

        Long userId = resolveUserId(authHeader, paramUserId);
        if (userId != null) {
            notificationService.markAsRead(id, userId);
        }
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "userId", required = false) Long paramUserId) {

        Long userId = resolveUserId(authHeader, paramUserId);
        if (userId != null) {
            notificationService.markAllAsRead(userId);
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<?> createNotification(@RequestBody Map<String, Object> body) {
        if (body == null) {
            return ResponseEntity.ok(Map.of("status", "empty"));
        }

        Object uId = body.get("userId");
        Long userId = null;
        if (uId instanceof Number n) {
            userId = n.longValue();
        } else if (uId != null) {
            String s = String.valueOf(uId).trim();
            String digits = s.replaceAll("\\D+", "");
            if (!digits.isEmpty()) {
                try {
                    userId = Long.parseLong(digits);
                } catch (Exception ignored) {}
            }
        }

        String type = body.get("type") != null ? String.valueOf(body.get("type")) : "SYSTEM";
        String title = body.get("title") != null ? String.valueOf(body.get("title")) : "Nouvelle notification";
        String text = body.get("body") != null ? String.valueOf(body.get("body")) : title;
        if (text == null || text.trim().isEmpty()) {
            text = title;
        }
        String link = body.get("link") != null ? String.valueOf(body.get("link")) : "";

        if (userId != null) {
            try {
                NotificationEntity created = notificationService.notifyUser(userId, type, title, text, link);
                return ResponseEntity.ok(created);
            } catch (Exception e) {
                return ResponseEntity.ok(Map.of("status", "fallback", "message", e.getMessage()));
            }
        }

        return ResponseEntity.ok(Map.of("status", "mock_skipped", "message", "Skipped for non-numeric mock user ID"));
    }

    private Long resolveUserId(String authHeader, Long paramUserId) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.replace("Bearer ", "").trim();
                var claims = jwtService.extractClaims(token);
                Object uId = claims.get("userId");
                if (uId instanceof Number n) return n.longValue();
                if (uId != null) return Long.parseLong(String.valueOf(uId));
            } catch (Exception ignored) {}
        }
        return paramUserId;
    }
}
