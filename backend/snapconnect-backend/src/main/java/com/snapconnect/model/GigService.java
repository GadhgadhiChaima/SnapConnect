package com.snapconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "gig_services")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GigService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "creator_id", nullable = false)
    private Long creatorId;

    @Column(name = "creator_name")
    private String creatorName;

    @Column(name = "creator_avatar")
    private String creatorAvatar;

    @Column(name = "category_name")
    private String categoryName;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "device_used")
    private String deviceUsed;

    @Column(name = "rating")
    @Builder.Default
    private Double rating = 5.0;

    @Column(name = "reviews_count")
    @Builder.Default
    private Integer reviewsCount = 0;

    @Column(name = "status")
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, PAUSED, DRAFT

    @OneToMany(mappedBy = "gigService", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GigPackage> packages = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "ACTIVE";
        if (rating == null) rating = 5.0;
        if (reviewsCount == null) reviewsCount = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
