package com.snapconnect.dto;

public record UpdateProfileRequest(
        String title,
        String bio,
        String location,
        String avatarUrl,
        String smartphoneModel,
        Double dailyRate,
        Double hourlyRate,
        Boolean onboarded,
        String contentFormat
) {}
