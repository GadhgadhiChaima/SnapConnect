package com.snapconnect.controller;

import com.snapconnect.model.ReviewEntity;
import com.snapconnect.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final com.snapconnect.service.NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewEntity>> getReviewsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewRepository.findByTargetUserIdOrderByCreatedAtDesc(userId));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<ReviewEntity>> getReviewsByContract(@PathVariable Long contractId) {
        return ResponseEntity.ok(reviewRepository.findByContractId(contractId));
    }

    @PostMapping
    public ResponseEntity<ReviewEntity> submitReview(@RequestBody ReviewEntity review) {
        ReviewEntity saved = reviewRepository.save(review);

        // Notify reviewed user
        notificationService.notifyUser(
                saved.getTargetUserId(),
                "NEW_REVIEW",
                "⭐️ Nouvel avis reçu (" + saved.getRating() + "/5) !",
                saved.getComment() != null && !saved.getComment().isBlank() ? saved.getComment() : "Un client a laissé une évaluation 5 étoiles sur votre prestation.",
                "/creator/reviews"
        );

        return ResponseEntity.ok(saved);
    }
}
