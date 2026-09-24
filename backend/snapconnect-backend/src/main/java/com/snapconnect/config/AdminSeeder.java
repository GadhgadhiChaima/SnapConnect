package com.snapconnect.config;

import com.snapconnect.model.Role;
import com.snapconnect.model.User;
import com.snapconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * AdminSeeder — s'exécute automatiquement au démarrage de Spring Boot.
 * Crée le compte admin par défaut (défini dans application.properties)
 * uniquement s'il n'existe pas encore en base MySQL.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.default.email}")
    private String adminEmail;

    @Value("${admin.default.password}")
    private String adminPassword;

    @Value("${admin.default.fullname}")
    private String adminFullName;

    @Override
    public void run(ApplicationArguments args) {
        String email = adminEmail.trim().toLowerCase();

        if (userRepository.findByEmail(email).isPresent()) {
            log.info("✅ [AdminSeeder] Compte admin déjà existant : {}", email);
            return;
        }

        User admin = User.builder()
                .email(email)
                .password(passwordEncoder.encode(adminPassword))
                .fullName(adminFullName)
                .role(Role.ADMIN)
                .active(true)
                .verified(true)
                .onboarded(true)
                .provider("LOCAL")
                .build();

        userRepository.save(admin);
        log.info("🔑 [AdminSeeder] Compte admin créé avec succès → email: {} | mot de passe: {}", email, adminPassword);
    }
}
