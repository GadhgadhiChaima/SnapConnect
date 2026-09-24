package com.snapconnect.dto;

public record ForgotPasswordResponse(
    String message,
    String resetToken
) {}
