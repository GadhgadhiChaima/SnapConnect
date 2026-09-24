package com.snapconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column
    private String password;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.CLIENT;

    @Column(name = "avatar_url", columnDefinition = "LONGTEXT")
    private String avatarUrl;

    @Column(name = "google_id")
    private String googleId;

    @Column(name = "provider")
    @Builder.Default
    private String provider = "LOCAL";

    @Column(name = "active")
    @Builder.Default
    private Boolean active = true;

    @Column(name = "verified")
    @Builder.Default
    private Boolean verified = false;

    @Column(name = "title")
    private String title;

    @Column(name = "bio", length = 2000)
    private String bio;

    @Column(name = "location")
    private String location;

    @Column(name = "smartphone_model")
    private String smartphoneModel;

    @Column(name = "daily_rate")
    private Double dailyRate;

    @Column(name = "hourly_rate")
    private Double hourlyRate;

    @Column(name = "onboarded")
    @Builder.Default
    private Boolean onboarded = false;

    @Column(name = "content_format")
    private String contentFormat;

    @Column(name = "status")
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, SUSPENDED, BANNED

    @Column(name = "suspended")
    @Builder.Default
    private Boolean suspended = false;

    @Column(name = "suspension_start")
    private LocalDateTime suspensionStart;

    @Column(name = "suspension_end")
    private LocalDateTime suspensionEnd;

    @Column(name = "suspension_reason")
    private String suspensionReason;

    public boolean isActive() {
        return active != null && active;
    }

    public boolean isVerified() {
        return verified != null && verified;
    }

    public boolean isOnboarded() {
        return onboarded != null && onboarded;
    }

    public boolean isCurrentlySuspended() {
        if (suspensionEnd != null && LocalDateTime.now().isAfter(suspensionEnd)) {
            return false;
        }
        return (suspended != null && suspended) || "SUSPENDED".equalsIgnoreCase(status);
    }

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
