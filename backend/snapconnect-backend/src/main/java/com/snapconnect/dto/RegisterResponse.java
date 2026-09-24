package com.snapconnect.dto;

public record RegisterResponse(
        String message,
        String email,
        boolean requiresVerification,
        String testOtp
) {}
