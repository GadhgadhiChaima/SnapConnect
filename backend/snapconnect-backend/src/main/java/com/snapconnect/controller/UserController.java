package com.snapconnect.controller;

import com.snapconnect.dto.UpdateProfileRequest;
import com.snapconnect.dto.UserDto;
import com.snapconnect.model.User;
import com.snapconnect.repository.UserRepository;
import com.snapconnect.service.AuthService;
import com.snapconnect.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final JwtService jwtService;

    /**
     * GET /api/users/me
     * Retourne le profil complet de l'utilisateur authentifié (garantie de séparation stricte par userId).
     */
    @GetMapping("/me")
    public ResponseEntity<UserDto> getMyProfile(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'identifiant: " + userId));
        return ResponseEntity.ok(authService.toDto(user));
    }

    /**
     * PUT /api/users/profile
     * Met à jour le profil de l'utilisateur connecté dans MySQL.
     */
    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody UpdateProfileRequest request) {

        Long userId = extractUserId(authHeader);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'identifiant: " + userId));

        if (request.title() != null) {
            user.setTitle(request.title().trim());
        }
        if (request.bio() != null) {
            user.setBio(request.bio().trim());
        }
        if (request.location() != null) {
            user.setLocation(request.location().trim());
        }
        if (request.avatarUrl() != null && !request.avatarUrl().isBlank()) {
            user.setAvatarUrl(request.avatarUrl().trim());
        }
        if (request.smartphoneModel() != null) {
            user.setSmartphoneModel(request.smartphoneModel().trim());
        }
        if (request.dailyRate() != null) {
            user.setDailyRate(request.dailyRate());
        }
        if (request.hourlyRate() != null) {
            user.setHourlyRate(request.hourlyRate());
        }
        if (request.contentFormat() != null) {
            user.setContentFormat(request.contentFormat().trim());
        }
        if (request.onboarded() != null) {
            user.setOnboarded(request.onboarded());
        } else {
            user.setOnboarded(true);
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(authService.toDto(saved));
    }

    /**
     * GET /api/users/creators
     * Retourne la liste de tous les créateurs enregistrés en base.
     */
    @GetMapping("/creators")
    public ResponseEntity<java.util.List<UserDto>> getCreators() {
        java.util.List<User> creators = userRepository.findByRoleOrderByIdDesc(com.snapconnect.model.Role.CREATOR);
        return ResponseEntity.ok(creators.stream().map(authService::toDto).toList());
    }

    /**
     * GET /api/users/{id}
     * Retourne les informations publiques d'un utilisateur par son ID numérique.
     */
    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'identifiant: " + id));
        return ResponseEntity.ok(authService.toDto(user));
    }

    private Long extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authentification requise : token JWT manquant.");
        }
        String token = authHeader.replace("Bearer ", "").trim();
        var claims = jwtService.extractClaims(token);
        Object userIdObj = claims.get("userId");
        if (userIdObj instanceof Number num) {
            return num.longValue();
        }
        return Long.parseLong(String.valueOf(userIdObj));
    }
}
