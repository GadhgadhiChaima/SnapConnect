package com.snapconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contracts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "proposal_id")
    private Long proposalId;

    @Column(name = "job_id")
    private Long jobId;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "service_id")
    private Long serviceId;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "client_name")
    private String clientName;

    @Column(name = "client_avatar")
    private String clientAvatar;

    @Column(name = "creator_id", nullable = false)
    private Long creatorId;

    @Column(name = "creator_name")
    private String creatorName;

    @Column(name = "creator_avatar")
    private String creatorAvatar;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "platform_fee")
    private Double platformFee;

    @Column(name = "creator_earnings")
    private Double creatorEarnings;

    @Column(name = "status")
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, IN_REVISION, COMPLETED, CANCELLED, DISPUTED

    @Column(name = "escrow_status")
    @Builder.Default
    private String escrowStatus = "SECURED"; // SECURED, RELEASED, REFUNDED

    @Column(name = "deliverable_url")
    private String deliverableUrl;

    @Column(name = "deliverable_notes", columnDefinition = "TEXT")
    private String deliverableNotes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(name = "delivery_submitted_at")
    private LocalDateTime deliverySubmittedAt;

    @Column(name = "review_deadline")
    private LocalDateTime reviewDeadline;

    @Column(name = "dispute_reason")
    private String disputeReason;

    @Column(name = "dispute_description", columnDefinition = "TEXT")
    private String disputeDescription;

    @Column(name = "dispute_opened_by")
    private Long disputeOpenedBy;

    @Column(name = "dispute_opened_at")
    private LocalDateTime disputeOpenedAt;

    @Column(name = "revisions_allowed")
    @Builder.Default
    private Integer revisionsAllowed = 2;

    @Column(name = "revisions_used")
    @Builder.Default
    private Integer revisionsUsed = 0;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (startDate == null) startDate = LocalDateTime.now();
        if (deadline == null) deadline = startDate.plusDays(7);
        if (status == null) status = "ACTIVE";
        if (escrowStatus == null) escrowStatus = "SECURED";
        if (revisionsAllowed == null) revisionsAllowed = 2;
        if (revisionsUsed == null) revisionsUsed = 0;
        if (amount != null) {
            platformFee = amount * 0.10;
            creatorEarnings = amount * 0.90;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
