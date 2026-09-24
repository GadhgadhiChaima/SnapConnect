package com.snapconnect.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "gig_packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GigPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    @JsonIgnore
    private GigService gigService;

    @Column(nullable = false)
    private String tier; // BASIC, STANDARD, PREMIUM

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(name = "delivery_days", nullable = false)
    private Integer deliveryDays;

    @Column(name = "revisions_included")
    @Builder.Default
    private Integer revisionsIncluded = 2;

    @Column(name = "deliverables")
    private String deliverables;
}
