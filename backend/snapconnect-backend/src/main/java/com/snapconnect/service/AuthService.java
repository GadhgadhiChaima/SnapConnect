package com.snapconnect.service;

import com.snapconnect.dto.*;
import com.snapconnect.model.PasswordResetToken;
import com.snapconnect.model.Role;
import com.snapconnect.model.User;
import com.snapconnect.repository.PasswordResetTokenRepository;
import com.snapconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final com.snapconnect.repository.EmailVerificationOtpRepository emailVerificationOtpRepository;
    private final JwtService jwtService;
    private final GoogleTokenVerifierService googleTokenVerifier;
    private final PasswordEncoder passwordEncoder;

    // ─────────────────────────────────────────────────────────────────
    // Email / Password Login
    // ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        if (request.email() == null || request.email().isBlank()) {
            throw new RuntimeException("Adresse email requise.");
        }
        if (request.password() == null || request.password().isBlank()) {
            throw new RuntimeException("Mot de passe requis.");
        }

        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Aucun compte trouvé avec cet email."));

        if (user.getPassword() == null) {
            throw new RuntimeException("Ce compte utilise la connexion Google. Utilisez 'Connexion avec Google'.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect.");
        }

        return buildAuthResponse(user);
    }

    // ─────────────────────────────────────────────────────────────────
    // Email / Password Register & OTP Verification
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Un compte existe déjà avec cet email.");
        }

        Role role = parseRole(request.role());

        User user = User.builder()
                .email(request.email().trim().toLowerCase())
                .password(passwordEncoder.encode(request.password()))
                .fullName(request.fullName().trim())
                .role(role)
                .provider("LOCAL")
                .verified(false)
                .active(true)
                .avatarUrl(null)
                .build();

        user = userRepository.save(user);

        // Generate 6-digit OTP code
        String otpCode = generateNumericOtp();

        // Invalidate old OTPs if any
        emailVerificationOtpRepository.deleteByUser(user);

        com.snapconnect.model.EmailVerificationOtp otp = com.snapconnect.model.EmailVerificationOtp.builder()
                .code(otpCode)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .used(false)
                .build();

        emailVerificationOtpRepository.save(otp);

        System.out.println("==================================================");
        System.out.println("📧 EMAIL VERIFICATION OTP FOR: " + user.getEmail());
        System.out.println("🔑 CODE OTP: " + otpCode);
        System.out.println("⏳ VALIDITÉ: 15 minutes");
        System.out.println("==================================================");

        return new RegisterResponse(
                "Compte créé avec succès ! Veuillez vérifier votre adresse email.",
                user.getEmail(),
                true,
                otpCode
        );
    }

    // ─────────────────────────────────────────────────────────────────
    // Google OAuth 2.0 — idToken Flow
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        // 1. Verify the Google ID Token via Google API
        Map<String, Object> googleData = googleTokenVerifier.verifyIdToken(request.idToken());

        String googleId  = (String) googleData.get("sub");
        String email     = (String) googleData.get("email");
        String name      = (String) googleData.get("name");
        String picture = (request.avatarUrl() != null && !request.avatarUrl().isBlank())
                ? request.avatarUrl()
                : (String) googleData.get("picture");

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Impossible de récupérer l'email depuis le token Google.");
        }

        email = email.trim().toLowerCase();

        // 2. Determine role (CLIENT by default if existing user)
        Role role = parseRole(request.role());

        // 3. Find existing user by email or googleId
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isEmpty()) {
            existing = userRepository.findByGoogleId(googleId);
        }

        User user;
        boolean isNewUser = false;
        if (existing.isPresent()) {
            // 3a. Existing user — update Google info and avatar if available
            user = existing.get();
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                user.setProvider("GOOGLE");
            }
            if (picture != null && !picture.isBlank()) {
                user.setAvatarUrl(picture);
            }
            user = userRepository.save(user);
        } else {
            // 3b. New user — create from Google profile
            isNewUser = true;
            String displayName = (request.fullName() != null && !request.fullName().isBlank())
                    ? request.fullName()
                    : (name != null && !name.isBlank())
                    ? name
                    : email.split("@")[0].replace(".", " ");

            user = User.builder()
                    .email(email)
                    .fullName(displayName)
                    .role(role)
                    .googleId(googleId)
                    .provider("GOOGLE")
                    .avatarUrl(picture)
                    .verified(false)      // Must verify OTP before account is activated
                    .active(true)
                    .build();

            user = userRepository.save(user);
        }

        // 4. Require OTP verification for all registrations, unverified accounts, or when isRegistration=true
        boolean requireOtp = isNewUser || !user.isVerified() || Boolean.TRUE.equals(request.isRegistration());
        if (requireOtp) {
            user.setVerified(false);
            user = userRepository.save(user);

            // Generate 6-digit numeric OTP code
            String otpCode = generateNumericOtp();

            // Invalidate old OTPs if any
            emailVerificationOtpRepository.deleteByUser(user);

            com.snapconnect.model.EmailVerificationOtp otp = com.snapconnect.model.EmailVerificationOtp.builder()
                    .code(otpCode)
                    .user(user)
                    .expiryDate(LocalDateTime.now().plusMinutes(15))
                    .used(false)
                    .build();

            emailVerificationOtpRepository.save(otp);

            System.out.println("==================================================");
            System.out.println("📧 GOOGLE SIGNUP/LOGIN OTP FOR: " + user.getEmail());
            System.out.println("🔑 CODE OTP: " + otpCode);
            System.out.println("⏳ VALIDITÉ: 15 minutes");
            System.out.println("==================================================");

            return new AuthResponse(
                    null,
                    toDto(user),
                    true,
                    otpCode
            );
        }

        return buildAuthResponse(user);
    }

    // ─────────────────────────────────────────────────────────────────
    // Forgot / Reset Password
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.email() != null ? request.email().trim().toLowerCase() : "";
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Aucun compte trouvé avec cet email."));

        if (user.getPassword() == null) {
            throw new RuntimeException("Ce compte utilise la connexion Google. Vous n'avez pas de mot de passe à réinitialiser.");
        }

        // Clean up previous tokens for this user
        passwordResetTokenRepository.deleteByUser(user);

        // Generate a secure reset token (UUID format)
        String token = UUID.randomUUID().toString().replace("-", "");

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(1))
                .used(false)
                .build();

        passwordResetTokenRepository.save(resetToken);

        System.out.println("==================================================");
        System.out.println("PASSWORD RESET TOKEN FOR: " + user.getEmail());
        System.out.println("RESET LINK: http://localhost:4200/auth/reset-password?token=" + token);
        System.out.println("==================================================");

        return new ForgotPasswordResponse(
                "Un lien de réinitialisation a été généré avec succès.",
                token
        );
    }

    @Transactional(readOnly = true)
    public VerifyResetTokenResponse verifyResetToken(String token) {
        if (token == null || token.isBlank()) {
            return new VerifyResetTokenResponse(false, null, "Token manquant ou vide.");
        }

        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByToken(token);
        if (tokenOpt.isEmpty()) {
            return new VerifyResetTokenResponse(false, null, "Token de réinitialisation invalide ou inexistant.");
        }

        PasswordResetToken resetToken = tokenOpt.get();
        if (resetToken.isUsed()) {
            return new VerifyResetTokenResponse(false, null, "Ce lien de réinitialisation a déjà été utilisé.");
        }

        if (resetToken.isExpired()) {
            return new VerifyResetTokenResponse(false, null, "Ce lien de réinitialisation a expiré (durée de validité : 1 heure).");
        }

        return new VerifyResetTokenResponse(true, resetToken.getUser().getEmail(), "Token valide.");
    }

    @Transactional
    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        if (request.newPassword() == null || request.newPassword().trim().length() < 6) {
            throw new RuntimeException("Le mot de passe doit contenir au moins 6 caractères.");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new RuntimeException("Token de réinitialisation invalide ou inexistant."));

        if (resetToken.isUsed()) {
            throw new RuntimeException("Ce lien de réinitialisation a déjà été utilisé.");
        }

        if (resetToken.isExpired()) {
            throw new RuntimeException("Ce lien de réinitialisation a expiré.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword().trim()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return Map.of("message", "Votre mot de passe a été réinitialisé avec succès !");
    }

    // ─────────────────────────────────────────────────────────────────
    // OTP Email Verification
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        if (request.email() == null || request.email().isBlank()) {
            throw new RuntimeException("Adresse email requise.");
        }
        if (request.code() == null || request.code().trim().length() != 6) {
            throw new RuntimeException("Le code de vérification doit comporter 6 chiffres.");
        }

        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Aucun compte trouvé avec cet email."));

        String inputCode = request.code().trim();

        // 1. Check exact match in database
        Optional<com.snapconnect.model.EmailVerificationOtp> otpOpt = emailVerificationOtpRepository
                .findTopByUserAndCodeAndUsedFalse(user, inputCode);

        // 2. Master dev code bypass (123456): find latest unused OTP if available
        if (otpOpt.isEmpty() && "123456".equals(inputCode)) {
            otpOpt = emailVerificationOtpRepository.findTopByUserAndUsedFalseOrderByCreatedAtDesc(user);
        }

        if (otpOpt.isPresent()) {
            com.snapconnect.model.EmailVerificationOtp otp = otpOpt.get();
            if (otp.isExpired()) {
                throw new RuntimeException("Le code de vérification a expiré (durée : 15 min). Veuillez demander un nouveau code.");
            }
            otp.setUsed(true);
            emailVerificationOtpRepository.save(otp);
        } else if (!"123456".equals(inputCode)) {
            throw new RuntimeException("Code de vérification incorrect ou expiré.");
        }

        // Activate user email verification
        user.setVerified(true);
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    @Transactional
    public Map<String, String> resendOtp(ResendOtpRequest request) {
        if (request.email() == null || request.email().isBlank()) {
            throw new RuntimeException("Adresse email requise.");
        }

        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Aucun compte trouvé avec cet email."));

        if (user.isVerified()) {
            return Map.of("message", "Ce compte est déjà vérifié.");
        }

        // Invalidate older OTPs
        emailVerificationOtpRepository.deleteByUser(user);

        // Generate and persist new OTP
        String otpCode = generateNumericOtp();
        com.snapconnect.model.EmailVerificationOtp otp = com.snapconnect.model.EmailVerificationOtp.builder()
                .code(otpCode)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .used(false)
                .build();

        emailVerificationOtpRepository.save(otp);

        System.out.println("==================================================");
        System.out.println("🔄 RESENT EMAIL VERIFICATION OTP FOR: " + user.getEmail());
        System.out.println("🔑 NOUVEAU CODE OTP: " + otpCode);
        System.out.println("⏳ VALIDITÉ: 15 minutes");
        System.out.println("==================================================");

        return Map.of(
                "message", "Un nouveau code de vérification a été envoyé à votre adresse email.",
                "testOtp", otpCode
        );
    }

    // ─────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────

    private String generateNumericOtp() {
        int number = new java.security.SecureRandom().nextInt(900000) + 100000;
        return String.valueOf(number);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getId()
        );
        return new AuthResponse(token, toDto(user));
    }

    public UserDto toDto(User user) {
        boolean suspended = user.isCurrentlySuspended();
        String endStr = user.getSuspensionEnd() != null ? user.getSuspensionEnd().toString() : null;
        return new UserDto(
                String.valueOf(user.getId()),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getAvatarUrl(),
                user.isVerified(),
                user.isActive(),
                user.getTitle(),
                user.getBio(),
                user.getLocation(),
                user.getSmartphoneModel(),
                user.getDailyRate(),
                user.getHourlyRate(),
                user.isOnboarded(),
                user.getContentFormat(),
                suspended,
                endStr,
                user.getSuspensionReason()
        );
    }

    private Role parseRole(String roleStr) {
        if (roleStr == null || roleStr.isBlank()) return Role.CLIENT;
        try {
            return Role.valueOf(roleStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return Role.CLIENT;
        }
    }
}
