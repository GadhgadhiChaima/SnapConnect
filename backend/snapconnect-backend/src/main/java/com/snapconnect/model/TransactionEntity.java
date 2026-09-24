package com.snapconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "wallet_id", nullable = false)
    private Long walletId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "type", nullable = false)
    private String type; // ESCROW_HOLD, ESCROW_RELEASE, PAYOUT, WITHDRAWAL, PLATFORM_FEE

    @Column(nullable = false)
    private Double amount;

    @Column(name = "contract_id")
    private Long contractId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "status")
    @Builder.Default
    private String status = "COMPLETED"; // COMPLETED, PENDING, FAILED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "COMPLETED";
    }
}
