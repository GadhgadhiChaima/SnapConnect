package com.snapconnect.controller;

import com.snapconnect.model.JobPost;
import com.snapconnect.repository.JobPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class JobController {

    private final JobPostRepository jobPostRepository;
    private final com.snapconnect.repository.UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<JobPost>> getAllJobs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(jobPostRepository.findByCategoryNameAndStatusOrderByCreatedAtDesc(category, status != null ? status : "OPEN"));
        }
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(jobPostRepository.findByStatusOrderByCreatedAtDesc(status));
        }
        return ResponseEntity.ok(jobPostRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPost> getJobById(@PathVariable Long id) {
        return jobPostRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<JobPost>> getJobsByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(jobPostRepository.findByClientIdOrderByCreatedAtDesc(clientId));
    }

    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody JobPost jobPost) {
        if (jobPost.getClientId() != null) {
            var userOpt = userRepository.findById(jobPost.getClientId());
            if (userOpt.isPresent() && userOpt.get().isCurrentlySuspended()) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                        .body(java.util.Map.of("error", "Votre compte est actuellement suspendu. Action impossible."));
            }
        }
        JobPost saved = jobPostRepository.save(jobPost);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobPost> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        return jobPostRepository.findById(id).map(job -> {
            if (body.containsKey("status")) {
                job.setStatus(body.get("status"));
            }
            return ResponseEntity.ok(jobPostRepository.save(job));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        if (jobPostRepository.existsById(id)) {
            jobPostRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
