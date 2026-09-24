package com.snapconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private Long userId;

    @Column(name = "available_balance")
    @Builder.Default
    private Double availableBalance = 0.0;

    @Column(name = "pending_balance")
    @Builder.Default
    private Double pendingBalance = 0.0;

    @Column(name = "in_escrow_balance")
    @Builder.Default
    private Double inEscrowBalance = 0.0;

    @Column(name = "currency")
    @Builder.Default
    private String currency = "USD";

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (availableBalance == null) availableBalance = 0.0;
        if (pendingBalance == null) pendingBalance = 0.0;
        if (inEscrowBalance == null) inEscrowBalance = 0.0;
    }
}
