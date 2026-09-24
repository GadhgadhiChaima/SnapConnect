package com.snapconnect.dto;

public record UserDto(
        String id,
        String email,
        String fullName,
        String role,
        String avatarUrl,
        boolean isVerified,
        boolean isActive,
        String title,
        String bio,
        String location,
        String smartphoneModel,
        Double dailyRate,
        Double hourlyRate,
        boolean onboarded,
        String contentFormat,
        boolean isSuspended,
        String suspensionEnd,
        String suspensionReason
) {}
