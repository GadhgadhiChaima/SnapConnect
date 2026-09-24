package com.snapconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "disputes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisputeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "contract_title")
    private String contractTitle;

    @Column(name = "opened_by_user_id", nullable = false)
    private Long openedByUserId;

    @Column(name = "opened_by_name")
    private String openedByName;

    @Column(name = "opened_by_role")
    private String openedByRole; // CLIENT, CREATOR

    @Column(name = "respondent_id")
    private Long respondentId;

    @Column(name = "respondent_name")
    private String respondentName;

    @Column(name = "amount_disputed")
    private Double amountDisputed;

    @Column(name = "currency")
    @Builder.Default
    private String currency = "DT";

    @Column(name = "reason")
    private String reason;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "status")
    @Builder.Default
    private String status = "OPEN"; // OPEN, UNDER_REVIEW, RESOLVED_CLIENT, RESOLVED_CREATOR, PARTIAL_RESOLUTION, CLOSED

    @Column(name = "evidence_url")
    private String evidenceUrl;

    @Column(name = "evidence_name")
    private String evidenceName;

    @Column(name = "evidence_note")
    private String evidenceNote;

    @Column(name = "decision")
    private String decision; // FULL_REFUND_CLIENT, FULL_PAYMENT_CREATOR, PARTIAL_SPLIT

    @Column(name = "client_refund_amount")
    private Double clientRefundAmount;

    @Column(name = "creator_payout_amount")
    private Double creatorPayoutAmount;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "response_deadline")
    private LocalDateTime responseDeadline;

    @Column(name = "last_response_at")
    private LocalDateTime lastResponseAt;

    @Column(name = "last_response_by_role")
    private String lastResponseByRole; // CLIENT, CREATOR, ADMIN

    @Column(name = "sanction_applied")
    private String sanctionApplied;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolved_by")
    private String resolvedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (responseDeadline == null) {
            responseDeadline = createdAt.plusHours(24);
        }
        if (status == null) status = "OPEN";
        if (currency == null) currency = "DT";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
