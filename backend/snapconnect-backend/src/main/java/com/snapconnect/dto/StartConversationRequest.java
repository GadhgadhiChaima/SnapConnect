package com.snapconnect.dto;

/** Request body for starting a new conversation */
public record StartConversationRequest(
        Long otherUserId,
        String otherUserEmail,
        String otherUserName,
        String otherUserAvatar,
        String contextType,  // "GENERAL", "JOB", "SERVICE", "CONTRACT", "CREATOR_PROFILE"
        String contextId,
        String contextTitle
) {}

