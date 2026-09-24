package com.snapconnect.controller;

import com.snapconnect.dto.*;
import com.snapconnect.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/login
     * Body: { "email": "...", "password": "..." }
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * POST /api/auth/register
     * Body: { "fullName": "...", "email": "...", "password": "...", "role": "CLIENT|CREATOR" }
     */
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    /**
     * POST /api/auth/verify-otp
     * Body: { "email": "...", "code": "123456" }
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    /**
     * POST /api/auth/resend-otp
     * Body: { "email": "..." }
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<java.util.Map<String, String>> resendOtp(@RequestBody ResendOtpRequest request) {
        return ResponseEntity.ok(authService.resendOtp(request));
    }

    /**
     * POST /api/auth/google
     * Body: { "idToken": "Google_ID_Token_JWT", "role": "CLIENT|CREATOR" }
     * <p>
     * The frontend sends the Google id_token obtained from GIS (google.accounts.id callback).
     * The backend verifies it via Google tokeninfo API, creates/finds the user, returns a SnapConnect JWT.
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(authService.loginWithGoogle(request));
    }

    /**
     * POST /api/auth/forgot-password
     * Body: { "email": "..." }
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    /**
     * GET /api/auth/verify-reset-token?token=...
     */
    @GetMapping("/verify-reset-token")
    public ResponseEntity<VerifyResetTokenResponse> verifyResetToken(@RequestParam("token") String token) {
        return ResponseEntity.ok(authService.verifyResetToken(token));
    }

    /**
     * POST /api/auth/reset-password
     * Body: { "token": "...", "newPassword": "..." }
     */
    @PostMapping("/reset-password")
    public ResponseEntity<java.util.Map<String, String>> resetPassword(@RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    /**
     * GET /api/auth/health
     * Health check endpoint.
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("SnapConnect API is running");
    }
}
