package com.snapconnect.controller;

import com.snapconnect.dto.UserDto;
import com.snapconnect.model.Role;
import com.snapconnect.model.User;
import com.snapconnect.repository.UserRepository;
import com.snapconnect.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/creators")
@RequiredArgsConstructor
public class CreatorController {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final com.snapconnect.service.ContractLifecycleService lifecycleService;

    /**
     * GET /api/creators
     * Retourne tous les créateurs enregistrés.
     */
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllCreators() {
        List<User> creators = userRepository.findByRoleOrderByIdDesc(Role.CREATOR);
        return ResponseEntity.ok(creators.stream().map(authService::toDto).toList());
    }

    /**
     * GET /api/creators/{id}
     * Retourne un créateur par son ID ou son email.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getCreatorById(@PathVariable String id) {
        try {
            Long numId = Long.parseLong(id.replace("cr-", "").replace("u-", "").trim());
            return userRepository.findById(numId)
                    .map(u -> ResponseEntity.ok(authService.toDto(u)))
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (NumberFormatException e) {
            return userRepository.findByEmail(id)
                    .map(u -> ResponseEntity.ok(authService.toDto(u)))
                    .orElseGet(() -> ResponseEntity.notFound().build());
        }
    }

    /**
     * GET /api/creators/{id}/stats
     * Calcule et retourne les métriques réelles du créateur depuis MySQL.
     */
    @GetMapping("/{id}/stats")
    public ResponseEntity<?> getCreatorStats(@PathVariable String id) {
        try {
            Long numId = Long.parseLong(id.replace("cr-", "").replace("u-", "").trim());
            return ResponseEntity.ok(lifecycleService.calculateCreatorStats(numId));
        } catch (NumberFormatException e) {
            return userRepository.findByEmail(id)
                    .map(u -> ResponseEntity.ok(lifecycleService.calculateCreatorStats(u.getId())))
                    .orElseGet(() -> ResponseEntity.notFound().build());
        }
    }
}
