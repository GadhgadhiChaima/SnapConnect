package com.snapconnect.controller;

import com.snapconnect.model.GigService;
import com.snapconnect.repository.GigServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class GigServiceController {

    private final GigServiceRepository gigServiceRepository;

    @GetMapping
    public ResponseEntity<List<GigService>> getAllServices(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String creatorId) {
        if (creatorId != null && !creatorId.isBlank()) {
            return ResponseEntity.ok(gigServiceRepository.findByCreatorIdOrderByCreatedAtDesc(Long.parseLong(creatorId)));
        }
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(gigServiceRepository.findByCategoryNameAndStatusOrderByRatingDesc(category, "ACTIVE"));
        }
        return ResponseEntity.ok(gigServiceRepository.findByStatusOrderByRatingDesc("ACTIVE"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GigService> getServiceById(@PathVariable Long id) {
        return gigServiceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createService(@RequestBody GigService gigService) {
        if (gigService.getPackages() != null) {
            for (var pkg : gigService.getPackages()) {
                if (pkg.getRevisionsIncluded() != null && (pkg.getRevisionsIncluded() < 0 || pkg.getRevisionsIncluded() > 2)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Le nombre de révisions incluses doit être 0, 1 ou 2"));
                }
                pkg.setGigService(gigService);
            }
        }
        GigService saved = gigServiceRepository.save(gigService);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<GigService> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return gigServiceRepository.findById(id).map(s -> {
            if (body.containsKey("status")) {
                s.setStatus(body.get("status"));
            }
            return ResponseEntity.ok(gigServiceRepository.save(s));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        if (gigServiceRepository.existsById(id)) {
            gigServiceRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
