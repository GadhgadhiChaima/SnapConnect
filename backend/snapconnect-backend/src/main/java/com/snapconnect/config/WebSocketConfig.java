package com.snapconnect.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket + STOMP Configuration for SnapConnect Real-Time Messaging.
 *
 * Endpoints:
 *   ws://localhost:8080/ws          — WebSocket connection (Angular SockJS)
 *   ws://localhost:8080/ws/info     — SockJS fallback info endpoint
 *
 * Client subscribes to:
 *   /topic/conv/{conversationId}    — Broadcast: all participants receive new messages
 *   /user/queue/messages            — Private queue: personal unread count updates
 *   /user/queue/typing              — Private queue: typing indicator events
 *
 * Client sends to:
 *   /app/chat.send                  — Send a new message
 *   /app/chat.typing                — Send typing indicator
 *   /app/chat.read                  — Mark conversation as read
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // In-memory broker for topic (broadcast) and user-specific queues
        registry.enableSimpleBroker("/topic", "/queue");

        // Prefix for @MessageMapping methods in controllers
        registry.setApplicationDestinationPrefixes("/app");

        // Prefix for user-specific destinations (Spring adds /user/{name}/...)
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                // Allow Angular dev server origin
                .setAllowedOriginPatterns("http://localhost:4200", "http://localhost:*")
                // SockJS fallback for browsers without WebSocket support
                .withSockJS();
    }
}
