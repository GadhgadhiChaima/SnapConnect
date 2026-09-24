package com.snapconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contract_activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractActivityEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "actor_id")
    private Long actorId;

    @Column(name = "actor_name")
    private String actorName;

    @Column(name = "actor_role")
    private String actorRole; // CLIENT, CREATOR, ADMIN, SYSTEM

    @Column(name = "action", nullable = false)
    private String action; // CONTRACT_CREATED, DELIVERED, REVISION_REQUESTED, APPROVED, AUTO_APPROVED_24H, EXPIRED_REFUNDED, DISPUTE_OPENED, DISPUTE_RESOLVED

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
