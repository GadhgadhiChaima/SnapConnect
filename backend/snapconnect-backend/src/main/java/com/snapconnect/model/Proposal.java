package com.snapconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "proposals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Proposal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "creator_id", nullable = false)
    private Long creatorId;

    @Column(name = "creator_name")
    private String creatorName;

    @Column(name = "creator_avatar")
    private String creatorAvatar;

    @Column(name = "bid_amount", nullable = false)
    private Double bidAmount;

    @Column(name = "delivery_days", nullable = false)
    private Integer deliveryDays;

    @Column(name = "revisions_offered")
    @Builder.Default
    private Integer revisionsOffered = 2;

    @Column(name = "cover_letter", columnDefinition = "TEXT", nullable = false)
    private String coverLetter;

    @Column(name = "gear_details")
    private String gearDetails;

    @Column(name = "status")
    @Builder.Default
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED, SHORTLISTED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
