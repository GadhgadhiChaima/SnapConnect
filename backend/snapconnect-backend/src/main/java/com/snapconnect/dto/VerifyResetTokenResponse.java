package com.snapconnect.dto;

public record VerifyResetTokenResponse(
    boolean valid,
    String email,
    String message
) {}
