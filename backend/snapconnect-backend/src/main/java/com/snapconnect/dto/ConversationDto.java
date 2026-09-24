package com.snapconnect.dto;

import java.time.LocalDateTime;

public record ConversationDto(
        Long id,
        Long otherUserId,
        String otherUserName,
        String otherUserAvatar,
        String contextType,
        String contextTitle,
        String lastMessage,
        LocalDateTime lastMessageAt,
        long unreadCount,
        LocalDateTime createdAt
) {}
