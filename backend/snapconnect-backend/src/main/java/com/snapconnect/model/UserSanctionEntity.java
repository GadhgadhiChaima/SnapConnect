package com.snapconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_sanctions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSanctionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "user_role")
    private String userRole; // CLIENT, CREATOR

    @Column(name = "dispute_id")
    private Long disputeId;

    @Column(name = "reason", nullable = false)
    private String reason;

    @Column(name = "type", nullable = false)
    private String type; // WARNING, BLOCK_3_DAYS, BLOCK_15_DAYS, BLOCK_30_DAYS, BLOCK_1_YEAR, PERMANENT_BLOCK

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "status")
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, EXPIRED, REVOKED

    @Column(name = "created_by_admin")
    private String createdByAdmin;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (startDate == null) {
            startDate = LocalDateTime.now();
        }
        if (status == null) {
            status = "ACTIVE";
        }
    }

    public String getSanctionType() {
        return type;
    }

    public boolean isActive() {
        return "ACTIVE".equalsIgnoreCase(status);
    }
}
