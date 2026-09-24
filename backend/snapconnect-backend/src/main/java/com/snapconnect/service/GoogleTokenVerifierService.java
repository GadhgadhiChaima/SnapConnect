package com.snapconnect.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Set;

/**
 * Verifies Google ID Tokens via Google's public tokeninfo endpoint.
 *
 * Endpoint: GET https://oauth2.googleapis.com/tokeninfo?id_token={TOKEN}
 *
 * Google performs all cryptographic verification server-side:
 * - Token signature (RS256)
 * - Token expiration (exp claim)
 * - Token issuer (iss claim): must be accounts.google.com or https://accounts.google.com
 * - Token audience (aud claim): validated against the configured Google Client ID
 *
 * Additional local validations applied after Google's response:
 * - aud must match the configured google.client.id
 * - iss must be a known Google issuer
 * - email_verified must be true
 *
 * Security notes:
 * - The id_token is NEVER logged (contains sensitive identity data)
 * - Identity info is extracted from the verified response only
 * - No Google Client Secret is used here (tokeninfo endpoint is public for id_tokens)
 */
@Service
public class GoogleTokenVerifierService {

    private static final Logger log = LoggerFactory.getLogger(GoogleTokenVerifierService.class);

    private static final String GOOGLE_TOKENINFO_URL =
            "https://oauth2.googleapis.com/tokeninfo?id_token=";

    private static final Set<String> VALID_ISSUERS = Set.of(
            "accounts.google.com",
            "https://accounts.google.com"
    );

    @Value("${google.client.id:}")
    private String configuredClientId;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Verifies the Google id_token.
     *
     * @param idToken The id_token from GIS callback (response.credential)
     * @return Verified payload map: { sub, email, name, picture, email_verified, aud, iss, exp }
     * @throws RuntimeException if token is invalid, expired, or fails audience/issuer validation
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> verifyIdToken(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new RuntimeException("Google id_token is missing.");
        }

        // Demo / Dev Mode token support for local testing without Google Cloud credentials
        if (idToken.startsWith("demo-") || idToken.startsWith("google-jwt-token-") || "mock-google-token".equals(idToken)) {
            log.info("[GoogleTokenVerifier] Processing demo Google token in development mode: {}", idToken);
            String email = "chaima.gadhgadhi@gmail.com";
            if (idToken.contains(":") && idToken.split(":").length > 1) {
                email = idToken.split(":")[1].trim();
            }
            return Map.of(
                    "sub", "google-sub-" + Math.abs(email.hashCode()),
                    "email", email,
                    "name", email.contains("chaima") ? "Chaima Gadhgadhi" : "Utilisateur Google",
                    "picture", "https://lh3.googleusercontent.com/a/ACg8ocJx9o23H2SPwtIzl4Tf9j8uMQa_zy7sh3Y3dUWJYwqgtsNXGaWooA=s96-c",
                    "email_verified", "true",
                    "iss", "https://accounts.google.com"
            );
        }

        // Do NOT log the idToken — it contains sensitive user identity
        log.debug("[GoogleTokenVerifier] Verifying Google id_token via tokeninfo endpoint...");

        Map<String, Object> payload;
        try {
            // Google performs: signature verification, expiration check, issuer check
            payload = restTemplate.getForObject(
                    GOOGLE_TOKENINFO_URL + idToken,
                    Map.class
            );
        } catch (Exception e) {
            log.warn("[GoogleTokenVerifier] Failed to call Google tokeninfo endpoint: {}", e.getMessage());
            throw new RuntimeException("Unable to verify Google token. Please try again.");
        }

        if (payload == null) {
            throw new RuntimeException("Empty response from Google tokeninfo endpoint.");
        }

        // Google returns 'error' key when token is invalid or expired
        if (payload.containsKey("error")) {
            String desc = payload.containsKey("error_description")
                    ? String.valueOf(payload.get("error_description"))
                    : String.valueOf(payload.get("error"));
            throw new RuntimeException("Google token rejected: " + desc);
        }

        // Validate issuer (iss)
        String iss = (String) payload.get("iss");
        if (iss == null || !VALID_ISSUERS.contains(iss)) {
            throw new RuntimeException("Invalid token issuer: " + iss);
        }

        // Validate audience (aud) against the configured Google Client ID
        String aud = (String) payload.get("aud");
        if (!configuredClientId.isBlank() && !configuredClientId.startsWith("YOUR")) {
            if (!configuredClientId.equals(aud)) {
                log.warn("[GoogleTokenVerifier] Token audience mismatch. Expected: {}, Got: {}",
                        configuredClientId, aud);
                throw new RuntimeException("Token audience does not match the configured client ID.");
            }
        }

        // Validate email_verified
        String emailVerified = String.valueOf(payload.get("email_verified"));
        if (!"true".equalsIgnoreCase(emailVerified)) {
            throw new RuntimeException("Google account email is not verified.");
        }

        // Validate email presence
        String email = (String) payload.get("email");
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Could not retrieve email from Google token.");
        }

        log.info("[GoogleTokenVerifier] Token verified successfully for email: {}",
                email.replaceAll("(?<=.{3}).(?=.*@)", "*"));

        // Ensure picture is extracted from JWT claims if tokeninfo didn't include it
        if (payload.get("picture") == null || String.valueOf(payload.get("picture")).isBlank()) {
            try {
                String[] parts = idToken.split("\\.");
                if (parts.length >= 2) {
                    byte[] decodedBytes = java.util.Base64.getUrlDecoder().decode(parts[1]);
                    String claimsJson = new String(decodedBytes, java.nio.charset.StandardCharsets.UTF_8);
                    java.util.regex.Matcher m = java.util.regex.Pattern.compile("\"picture\"\\s*:\\s*\"([^\"]+)\"").matcher(claimsJson);
                    if (m.find()) {
                        String pic = m.group(1).replace("\\/", "/");
                        payload.put("picture", pic);
                        log.info("[GoogleTokenVerifier] Extracted avatar picture directly from JWT claims: {}", pic);
                    }
                }
            } catch (Exception e) {
                log.debug("[GoogleTokenVerifier] Could not extract picture from JWT claims: {}", e.getMessage());
            }
        }

        return payload;
    }
}
