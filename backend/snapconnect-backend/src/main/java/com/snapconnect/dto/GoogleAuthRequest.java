package com.snapconnect.dto;

public record GoogleAuthRequest(
        String idToken,
        String role,
        String avatarUrl,
        String fullName,
        Boolean isRegistration
) {
    public GoogleAuthRequest(String idToken, String role) {
        this(idToken, role, null, null, false);
    }
}
