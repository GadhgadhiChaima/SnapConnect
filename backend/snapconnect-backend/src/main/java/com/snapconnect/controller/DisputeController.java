package com.snapconnect.controller;

import com.snapconnect.model.ContractEntity;
import com.snapconnect.model.DisputeEntity;
import com.snapconnect.model.DisputeMessageEntity;
import com.snapconnect.model.User;
import com.snapconnect.repository.*;
import com.snapconnect.service.ContractLifecycleService;
import com.snapconnect.service.JwtService;
import com.snapconnect.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
@Slf4j
public class DisputeController {

    private final DisputeRepository disputeRepository;
    private final DisputeMessageRepository disputeMessageRepository;
    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final ContractLifecycleService lifecycleService;
    private final NotificationService notificationService;
    private final JwtService jwtService;

    private Long extractUserId(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                if (jwtService.isTokenValid(token)) {
                    var claims = jwtService.extractClaims(token);
                    Object uid = claims.get("userId");
                    if (uid != null) {
                        return Long.valueOf(uid.toString());
                    }
                    String email = claims.getSubject();
                    return userRepository.findByEmail(email).map(User::getId).orElse(null);
                }
            } catch (Exception ignored) {}
        }
        return null;
    }

    private String extractRole(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                if (jwtService.isTokenValid(token)) {
                    var claims = jwtService.extractClaims(token);
                    return (String) claims.get("role");
                }
            } catch (Exception ignored) {}
        }
        return null;
    }

    /**
     * GET /api/disputes/{id}
     * Retourne les détails complets d'une réclamation avec calcul du temps restant (24h).
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDisputeById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {

        Long userId = extractUserId(authHeader);
        String role = extractRole(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentification requise"));
        }

        DisputeEntity d = disputeRepository.findById(id).orElse(null);
        if (d == null) {
            return ResponseEntity.notFound().build();
        }

        ContractEntity contract = contractRepository.findById(d.getContractId()).orElse(null);

        // Sécurité : Seuls le Client du contrat, le Créateur du contrat ou un ADMIN peuvent accéder
        boolean isParty = userId.equals(d.getOpenedByUserId()) || userId.equals(d.getRespondentId());
        if (contract != null) {
            isParty = isParty || userId.equals(contract.getClientId()) || userId.equals(contract.getCreatorId());
        }
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);

        if (!isParty && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Accès non autorisé à cette réclamation"));
        }

        Map<String, Object> res = buildDisputeResponse(d, contract);
        return ResponseEntity.ok(res);
    }

    /**
     * GET /api/disputes/contract/{contractId}
     * Récupère la réclamation active ou la plus récente liée à un contrat.
     */
    @GetMapping("/contract/{contractId}")
    public ResponseEntity<?> getDisputeByContract(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long contractId) {

        Long userId = extractUserId(authHeader);
        String role = extractRole(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentification requise"));
        }

        ContractEntity contract = contractRepository.findById(contractId).orElse(null);
        if (contract == null) {
            return ResponseEntity.notFound().build();
        }

        boolean isParty = userId.equals(contract.getClientId()) || userId.equals(contract.getCreatorId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);
        if (!isParty && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Accès non autorisé"));
        }

        Optional<DisputeEntity> disputeOpt = disputeRepository.findFirstByContractIdOrderByIdDesc(contractId);
        if (disputeOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("hasDispute", false));
        }

        Map<String, Object> res = buildDisputeResponse(disputeOpt.get(), contract);
        res.put("hasDispute", true);
        return ResponseEntity.ok(res);
    }

    /**
     * GET /api/disputes/my
     * Retourne toutes les réclamations ouvertes ou reçues par l'utilisateur connecté.
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyDisputes(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentification requise"));
        }

        List<DisputeEntity> list = disputeRepository.findByOpenedByUserIdOrRespondentIdOrderByCreatedAtDesc(userId, userId);
        List<Map<String, Object>> response = new ArrayList<>();
        for (DisputeEntity d : list) {
            ContractEntity contract = contractRepository.findById(d.getContractId()).orElse(null);
            response.add(buildDisputeResponse(d, contract));
        }
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/disputes/{id}/messages
     * Retourne l'historique chronologique des messages de discussion de la réclamation.
     */
    @GetMapping("/{id}/messages")
    public ResponseEntity<?> getDisputeMessages(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {

        Long userId = extractUserId(authHeader);
        String role = extractRole(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentification requise"));
        }

        DisputeEntity d = disputeRepository.findById(id).orElse(null);
        if (d == null) return ResponseEntity.notFound().build();

        boolean isParty = userId.equals(d.getOpenedByUserId()) || userId.equals(d.getRespondentId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);
        if (!isParty && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Accès interdit aux messages de ce dossier"));
        }

        List<DisputeMessageEntity> messages = disputeMessageRepository.findByDisputeIdOrderByCreatedAtAsc(id);
        return ResponseEntity.ok(messages);
    }

    /**
     * POST /api/disputes/{id}/messages
     * Envoie un message et/ou une pièce justificative dans l'espace de réclamation tripartite.
     */
    @PostMapping("/{id}/messages")
    public ResponseEntity<?> sendDisputeMessage(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Long userId = extractUserId(authHeader);
        String role = extractRole(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentification requise"));
        }

        User sender = userRepository.findById(userId).orElse(null);
        if (sender == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Utilisateur introuvable"));
        }

        // Vérifier si le compte est suspendu
        if (sender.isCurrentlySuspended()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Compte temporairement suspendu : action impossible"));
        }

        DisputeEntity d = disputeRepository.findById(id).orElse(null);
        if (d == null) return ResponseEntity.notFound().build();

        boolean isParty = userId.equals(d.getOpenedByUserId()) || userId.equals(d.getRespondentId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);
        if (!isParty && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Vous ne faites pas partie de ce litige"));
        }

        String content = body.getOrDefault("content", "").trim();
        String attachmentUrl = body.get("attachmentUrl");
        String attachmentName = body.get("attachmentName");
        String attachmentType = body.getOrDefault("attachmentType", "IMAGE");

        if (content.isEmpty() && (attachmentUrl == null || attachmentUrl.isBlank())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le message ou une pièce justificative est obligatoire"));
        }

        String senderRole = isAdmin ? "ADMIN" : (userId.equals(d.getOpenedByUserId()) ? d.getOpenedByRole() : (d.getOpenedByRole().equals("CLIENT") ? "CREATOR" : "CLIENT"));

        DisputeMessageEntity msg = DisputeMessageEntity.builder()
                .disputeId(id)
                .senderId(userId)
                .senderName(sender.getFullName())
                .senderRole(senderRole)
                .senderAvatar(sender.getAvatarUrl())
                .content(content.isEmpty() ? "Pièce justificative jointe : " + (attachmentName != null ? attachmentName : "Fichier") : content)
                .attachmentUrl(attachmentUrl)
                .attachmentName(attachmentName)
                .attachmentType(attachmentType)
                .build();
        DisputeMessageEntity savedMsg = disputeMessageRepository.save(msg);

        // Mettre à jour le suivi de réponse sur le dossier
        d.setLastResponseAt(LocalDateTime.now());
        d.setLastResponseByRole(senderRole);

        // Si le répondant répond et que le statut était OPEN, passer à UNDER_REVIEW
        if ("OPEN".equals(d.getStatus()) && !userId.equals(d.getOpenedByUserId())) {
            d.setStatus("UNDER_REVIEW");
        }
        disputeRepository.save(d);

        // Audit
        lifecycleService.logActivity(d.getContractId(), userId, sender.getFullName(), senderRole, "DISPUTE_RESPONSE",
                "Nouveau message dans la réclamation #" + d.getId() + " (" + senderRole + ")");

        // Notifications aux autres parties
        try {
            Long recipientId = userId.equals(d.getOpenedByUserId()) ? d.getRespondentId() : d.getOpenedByUserId();
            String contractPath = (senderRole.equals("CLIENT") ? "/creator/contracts/" : "/client/contracts/") + d.getContractId();

            if (!isAdmin) {
                notificationService.notifyUser(
                        recipientId,
                        "DISPUTE_MESSAGE",
                        "Nouveau message sur la réclamation #" + d.getId(),
                        sender.getFullName() + " a répondu sur le litige lié à « " + d.getContractTitle() + " ».",
                        contractPath
                );
            } else {
                // Si l'admin écrit, notifier les deux
                notificationService.notifyUser(
                        d.getOpenedByUserId(),
                        "DISPUTE_MESSAGE",
                        "Message de l'administration sur le litige #" + d.getId(),
                        "L'administration SnapConnect a envoyé un message concernant votre réclamation.",
                        (d.getOpenedByRole().equals("CLIENT") ? "/client/contracts/" : "/creator/contracts/") + d.getContractId()
                );
                notificationService.notifyUser(
                        d.getRespondentId(),
                        "DISPUTE_MESSAGE",
                        "Message de l'administration sur le litige #" + d.getId(),
                        "L'administration SnapConnect a envoyé un message concernant le litige.",
                        (d.getOpenedByRole().equals("CLIENT") ? "/creator/contracts/" : "/client/contracts/") + d.getContractId()
                );
            }
        } catch (Exception ignored) {}

        return ResponseEntity.ok(savedMsg);
    }

    private Map<String, Object> buildDisputeResponse(DisputeEntity d, ContractEntity contract) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", d.getId());
        map.put("contractId", d.getContractId());
        map.put("contractTitle", d.getContractTitle());
        map.put("openedByUserId", d.getOpenedByUserId());
        map.put("openedByName", d.getOpenedByName());
        map.put("openedByRole", d.getOpenedByRole());
        map.put("respondentId", d.getRespondentId());
        map.put("respondentName", d.getRespondentName());
        map.put("amountDisputed", d.getAmountDisputed());
        map.put("currency", d.getCurrency());
        map.put("reason", d.getReason());
        map.put("description", d.getDescription());
        map.put("evidenceUrl", d.getEvidenceUrl());
        map.put("evidenceName", d.getEvidenceName());
        map.put("evidenceNote", d.getEvidenceNote());
        map.put("status", d.getStatus());
        map.put("decision", d.getDecision());
        map.put("clientRefundAmount", d.getClientRefundAmount());
        map.put("creatorPayoutAmount", d.getCreatorPayoutAmount());
        map.put("adminNotes", d.getAdminNotes());
        map.put("createdAt", d.getCreatedAt());
        map.put("responseDeadline", d.getResponseDeadline());
        map.put("lastResponseAt", d.getLastResponseAt());
        map.put("lastResponseByRole", d.getLastResponseByRole());
        map.put("sanctionApplied", d.getSanctionApplied());
        map.put("resolvedAt", d.getResolvedAt());
        map.put("resolvedBy", d.getResolvedBy());

        // Calcul dynamique du compte à rebours 24h côté backend
        long remainingSeconds = 0;
        boolean isExpired = false;
        if (d.getResponseDeadline() != null) {
            LocalDateTime now = LocalDateTime.now();
            if (now.isBefore(d.getResponseDeadline())) {
                remainingSeconds = Duration.between(now, d.getResponseDeadline()).getSeconds();
            } else {
                isExpired = true;
                remainingSeconds = 0;
            }
        }
        map.put("remainingSeconds", remainingSeconds);
        map.put("isExpired", isExpired);

        // Alert Level: NORMAL (>= 6h), WARNING (< 6h), CRITICAL (< 1h), EXPIRED (0)
        String alertLevel = "NORMAL";
        if (isExpired) {
            alertLevel = "EXPIRED";
        } else if (remainingSeconds < 3600) {
            alertLevel = "CRITICAL";
        } else if (remainingSeconds < 21600) {
            alertLevel = "WARNING";
        }
        map.put("alertLevel", alertLevel);

        if (contract != null) {
            map.put("contractStatus", contract.getStatus());
            map.put("contractAmount", contract.getAmount());
            map.put("clientId", contract.getClientId());
            map.put("clientName", contract.getClientName());
            map.put("creatorId", contract.getCreatorId());
            map.put("creatorName", contract.getCreatorName());
        }

        return map;
    }
}
