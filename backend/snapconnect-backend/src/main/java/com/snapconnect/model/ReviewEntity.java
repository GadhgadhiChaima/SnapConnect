package com.snapconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "reviewer_id", nullable = false)
    private Long reviewerId;

    @Column(name = "reviewer_name")
    private String reviewerName;

    @Column(name = "reviewer_role")
    private String reviewerRole; // CLIENT, CREATOR

    @Column(name = "target_user_id", nullable = false)
    private Long targetUserId;

    @Column(nullable = false)
    private Double rating;

    @Column(name = "quality_rating")
    private Double qualityRating;

    @Column(name = "deadlines_rating")
    private Double deadlinesRating;

    @Column(name = "communication_rating")
    private Double communicationRating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
