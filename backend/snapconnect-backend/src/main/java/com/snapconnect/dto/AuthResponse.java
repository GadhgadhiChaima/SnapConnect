package com.snapconnect.dto;

public record AuthResponse(
        String token,
        UserDto user,
        boolean requiresVerification,
        String testOtp
) {
    public AuthResponse(String token, UserDto user) {
        this(token, user, false, null);
    }
}
