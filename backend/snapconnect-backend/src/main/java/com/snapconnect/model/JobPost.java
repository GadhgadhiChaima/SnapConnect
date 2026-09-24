package com.snapconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "client_name")
    private String clientName;

    @Column(name = "client_company")
    private String clientCompany;

    @Column(name = "client_avatar")
    private String clientAvatar;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "budget_type")
    @Builder.Default
    private String budgetType = "FIXED";

    @Column(name = "budget_min")
    private Double budgetMin;

    @Column(name = "budget_max")
    private Double budgetMax;

    @Column(name = "device_required")
    private String deviceRequired;

    @Column(name = "resolution_required")
    private String resolutionRequired;

    @Column(name = "deliverables_summary")
    private String deliverablesSummary;

    @Column(name = "turnaround_days")
    private Integer turnaroundDays;

    @Column(name = "status")
    @Builder.Default
    private String status = "OPEN";

    @Column(name = "proposals_count")
    @Builder.Default
    private Integer proposalsCount = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (proposalsCount == null) proposalsCount = 0;
        if (status == null) status = "OPEN";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
