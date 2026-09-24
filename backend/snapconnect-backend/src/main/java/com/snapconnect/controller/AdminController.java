package com.snapconnect.controller;

import com.snapconnect.dto.UserDto;
import com.snapconnect.model.Role;
import com.snapconnect.model.User;
import com.snapconnect.repository.ContractRepository;
import com.snapconnect.repository.JobPostRepository;
import com.snapconnect.repository.UserRepository;
import com.snapconnect.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final UserRepository userRepository;
    private final JobPostRepository jobPostRepository;
    private final ContractRepository contractRepository;
    private final com.snapconnect.repository.ContractActivityRepository contractActivityRepository;
    private final com.snapconnect.repository.DisputeRepository disputeRepository;
    private final com.snapconnect.repository.UserSanctionRepository userSanctionRepository;
    private final com.snapconnect.repository.WalletRepository walletRepository;
    private final com.snapconnect.repository.TransactionRepository transactionRepository;
    private final com.snapconnect.service.ContractLifecycleService lifecycleService;
    private final com.snapconnect.service.NotificationService notificationService;
    private final AuthService authService;

    /**
     * GET /api/admin/stats
     * Retourne les indicateurs clés de la plateforme en temps réel depuis MySQL.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long totalUsers = userRepository.count();
        long totalCreators = userRepository.countByRole(Role.CREATOR);
        long totalClients = userRepository.countByRole(Role.CLIENT);
        long totalJobs = jobPostRepository.count();
        long totalContracts = contractRepository.count();

        // Calculer les créateurs vérifiés
        List<User> creators = userRepository.findByRole(Role.CREATOR);
        long verifiedCreators = creators.stream().filter(User::isVerified).count();

        // Calculer le volume sous séquestre
        double totalEscrow = contractRepository.findAll().stream()
                .filter(c -> "ESCROW_LOCKED".equalsIgnoreCase(c.getStatus()) || "ACTIVE".equalsIgnoreCase(c.getStatus()) || "IN_PROGRESS".equalsIgnoreCase(c.getStatus()) || "IN_REVISION".equalsIgnoreCase(c.getStatus()) || "DELIVERED".equalsIgnoreCase(c.getStatus()))
                .mapToDouble(c -> c.getAmount() != null ? c.getAmount() : 0.0)
                .sum();

        // Missions actives : contrats actifs ou en cours/révision/livraison
        long activeContracts = contractRepository.findAll().stream()
                .filter(c -> "ACTIVE".equalsIgnoreCase(c.getStatus()) || "IN_PROGRESS".equalsIgnoreCase(c.getStatus()) || "IN_REVISION".equalsIgnoreCase(c.getStatus()) || "DELIVERED".equalsIgnoreCase(c.getStatus()))
                .count();

        long activeJobs = jobPostRepository.findByStatusOrderByCreatedAtDesc("OPEN").size();

        // Volume total traité (tous contrats)
        double totalPaymentsVolume = contractRepository.findAll().stream()
                .mapToDouble(c -> c.getAmount() != null ? c.getAmount() : 0.0)
                .sum();

        long activeDisputes = disputeRepository.countByStatus("OPEN") + disputeRepository.countByStatus("UNDER_REVIEW");

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalCreators", totalCreators);
        stats.put("totalClients", totalClients);
        stats.put("totalJobs", totalJobs);
        stats.put("totalContracts", totalContracts);
        stats.put("activeContracts", activeContracts);
        stats.put("activeJobs", activeJobs);
        stats.put("verifiedCreators", verifiedCreators);
        stats.put("escrowInTransit", totalEscrow > 0 ? totalEscrow : 0.0);
        stats.put("platformRevenue", (totalEscrow > 0 ? totalEscrow * 0.10 : 0.0));
        stats.put("totalPaymentsVolume", totalPaymentsVolume);
        stats.put("activeDisputes", activeDisputes);

        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/admin/recent-activities
     * Retourne les 10 à 15 activités réelles les plus récentes de la plateforme :
     * - Nouvelles inscriptions d'utilisateurs
     * - Nouveaux contrats & missions
     * - Mouvements sur contrats (dépôts de livrables, demandes de révision, approbations)
     * - Litiges / réclamations ouverts ou résolus
     * - Nouveaux briefs de missions publiés
     */
    @GetMapping("/recent-activities")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivities() {
        List<Map<String, Object>> activities = new java.util.ArrayList<>();

        // 1. Contract Activities (Livrables, révisions, validations, création)
        try {
            List<com.snapconnect.model.ContractActivityEntity> contractActs = contractActivityRepository.findTop15ByOrderByCreatedAtDesc();
            for (com.snapconnect.model.ContractActivityEntity act : contractActs) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", "ca-" + act.getId());
                item.put("timestamp", act.getCreatedAt() != null ? act.getCreatedAt().toString() : java.time.LocalDateTime.now().toString());
                item.put("actor", act.getActorName());
                item.put("role", act.getActorRole());

                String action = act.getAction();
                if ("CONTRACT_CREATED".equalsIgnoreCase(action)) {
                    item.put("type", "CONTRACT_CREATED");
                    item.put("title", "Nouveau contrat initié");
                    item.put("description", act.getDescription() != null ? act.getDescription() : "Contrat démarré sur la mission #" + act.getContractId());
                    item.put("badgeClass", "badge-accent");
                } else if ("DELIVERED".equalsIgnoreCase(action)) {
                    item.put("type", "DELIVERED");
                    item.put("title", "Livrables 4K déposés");
                    item.put("description", act.getDescription() != null ? act.getDescription() : "Livrables smartphone soumis pour examen");
                    item.put("badgeClass", "badge-info");
                } else if ("REVISION_REQUESTED".equalsIgnoreCase(action)) {
                    item.put("type", "REVISION_REQUESTED");
                    item.put("title", "Demande de révision");
                    item.put("description", act.getDescription() != null ? act.getDescription() : "Demande de retouche envoyée");
                    item.put("badgeClass", "badge-warning");
                } else if ("APPROVED".equalsIgnoreCase(action) || "AUTO_APPROVED_24H".equalsIgnoreCase(action)) {
                    item.put("type", "CONTRACT_COMPLETED");
                    item.put("title", "Contrat validé & Fonds libérés");
                    item.put("description", act.getDescription() != null ? act.getDescription() : "Prestation validée avec succès");
                    item.put("badgeClass", "badge-success");
                } else if ("DISPUTE_OPENED".equalsIgnoreCase(action)) {
                    item.put("type", "DISPUTE");
                    item.put("title", "Réclamation / Litige ouvert");
                    item.put("description", act.getDescription() != null ? act.getDescription() : "Litige signalé sur la mission #" + act.getContractId());
                    item.put("badgeClass", "badge-danger");
                } else if ("DISPUTE_RESOLVED".equalsIgnoreCase(action)) {
                    item.put("type", "DISPUTE_RESOLVED");
                    item.put("title", "Arbitrage rendu");
                    item.put("description", act.getDescription() != null ? act.getDescription() : "Litige résolu par l'administration");
                    item.put("badgeClass", "badge-purple");
                } else {
                    item.put("type", "CONTRACT_ACTIVITY");
                    item.put("title", "Mise à jour de contrat");
                    item.put("description", act.getDescription() != null ? act.getDescription() : "Activité sur le contrat #" + act.getContractId());
                    item.put("badgeClass", "badge-neutral");
                }
                activities.add(item);
            }
        } catch (Exception e) {
            log.warn("Erreur chargement contract activities: {}", e.getMessage());
        }

        // 2. Dernières inscriptions d'utilisateurs
        try {
            List<User> recentUsers = userRepository.findAllByOrderByIdDesc().stream().limit(5).toList();
            for (User u : recentUsers) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", "user-" + u.getId());
                item.put("type", "USER_REGISTRATION");
                item.put("title", "Nouvelle inscription");
                String roleLabel = u.getRole() == Role.CREATOR ? "Créateur Mobile" : (u.getRole() == Role.CLIENT ? "Entreprise / Client" : "Administrateur");
                item.put("description", u.getFullName() + " a rejoint SnapConnect en tant que " + roleLabel + (u.getSmartphoneModel() != null ? " (" + u.getSmartphoneModel() + ")" : ""));
                item.put("timestamp", u.getCreatedAt() != null ? u.getCreatedAt().toString() : java.time.LocalDateTime.now().minusHours(1).toString());
                item.put("badgeClass", "badge-primary");
                activities.add(item);
            }
        } catch (Exception e) {
            log.warn("Erreur chargement recent users: {}", e.getMessage());
        }

        // 3. Derniers litiges
        try {
            List<com.snapconnect.model.DisputeEntity> recentDisputes = disputeRepository.findAllByOrderByCreatedAtDesc().stream().limit(5).toList();
            for (com.snapconnect.model.DisputeEntity d : recentDisputes) {
                boolean alreadyPresent = activities.stream().anyMatch(a -> ("ca-" + d.getId()).equals(a.get("id")) || (a.get("description") != null && a.get("description").toString().contains("Litige #" + d.getId())));
                if (!alreadyPresent) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", "disp-" + d.getId());
                    item.put("type", "DISPUTE");
                    item.put("title", "Réclamation / Litige #" + d.getId());
                    item.put("description", (d.getReason() != null ? d.getReason() : "Litige signalé") + " (Mission #" + d.getContractId() + ", Montant : " + (d.getAmountDisputed() != null ? d.getAmountDisputed() : 0.0) + " DT)");
                    item.put("timestamp", d.getCreatedAt() != null ? d.getCreatedAt().toString() : java.time.LocalDateTime.now().toString());
                    item.put("badgeClass", "badge-danger");
                    activities.add(item);
                }
            }
        } catch (Exception e) {
            log.warn("Erreur chargement recent disputes: {}", e.getMessage());
        }

        // 4. Derniers briefs / jobs publiés
        try {
            List<com.snapconnect.model.JobPost> recentJobs = jobPostRepository.findAll().stream()
                    .sorted((a, b) -> (b.getId() != null && a.getId() != null) ? b.getId().compareTo(a.getId()) : 0)
                    .limit(5).toList();
            for (com.snapconnect.model.JobPost j : recentJobs) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", "job-" + j.getId());
                item.put("type", "NEW_JOB");
                item.put("title", "Nouveau brief publié");
                item.put("description", "« " + j.getTitle() + " » par " + (j.getClientName() != null ? j.getClientName() : "Client") + (j.getCategoryName() != null ? " • " + j.getCategoryName() : ""));
                item.put("timestamp", java.time.LocalDateTime.now().minusHours(2).toString());
                item.put("badgeClass", "badge-warning");
                activities.add(item);
            }
        } catch (Exception e) {
            log.warn("Erreur chargement recent jobs: {}", e.getMessage());
        }

        // Trier par date/timestamp décroissante et limiter aux 12 éléments les plus récents
        activities.sort((a, b) -> {
            String tA = (String) a.getOrDefault("timestamp", "");
            String tB = (String) b.getOrDefault("timestamp", "");
            return tB.compareTo(tA);
        });

        if (activities.size() > 12) {
            activities = activities.subList(0, 12);
        }

        return ResponseEntity.ok(activities);
    }

    /**
     * GET /api/admin/users
     * Retourne la liste complète de tous les utilisateurs enregistrés en base.
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<User> all = userRepository.findAllByOrderByIdDesc();
        List<UserDto> dtos = all.stream().map(authService::toDto).toList();
        return ResponseEntity.ok(dtos);
    }

    /**
     * PATCH /api/admin/users/{id}/toggle-status
     * Suspend ou réactive un compte utilisateur.
     */
    @PatchMapping("/users/{id}/toggle-status")
    public ResponseEntity<UserDto> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'id : " + id));

        boolean newStatus = !user.isActive();
        user.setActive(newStatus);
        User saved = userRepository.save(user);

        log.info("Compte utilisateur {} ({}) : active = {}", user.getFullName(), user.getEmail(), newStatus);
        return ResponseEntity.ok(authService.toDto(saved));
    }

    /**
     * PATCH /api/admin/users/{id}/verify-hardware
     * Valide le matériel smartphone d'un créateur (attribution du badge certifié).
     */
    @PatchMapping("/users/{id}/verify-hardware")
    public ResponseEntity<UserDto> verifyHardware(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'id : " + id));

        user.setVerified(true);
        if (body != null && body.containsKey("smartphoneModel") && !body.get("smartphoneModel").isBlank()) {
            user.setSmartphoneModel(body.get("smartphoneModel").trim());
        }

        User saved = userRepository.save(user);
        log.info("Badge smartphone validé pour le créateur {} ({})", user.getFullName(), user.getEmail());
        return ResponseEntity.ok(authService.toDto(saved));
    }

    // ─────────────────────────────────────────────────────────────────
    // Payout Requests (Gestion des Retraits Créateurs)
    // ─────────────────────────────────────────────────────────────────

    private static final java.util.List<Map<String, Object>> PAYOUTS_STORE = new java.util.concurrent.CopyOnWriteArrayList<>(java.util.List.of(
            new java.util.HashMap<>(Map.of(
                    "id", "pay-101",
                    "creatorId", "cr-1",
                    "creatorName", "Sarah Ben Salem",
                    "amount", 450.0,
                    "method", "Virement Bancaire (BIAT)",
                    "accountRef", "TN59 08 001 000115003456 89",
                    "requestDate", "2026-09-14 10:25",
                    "status", "PENDING"
            )),
            new java.util.HashMap<>(Map.of(
                    "id", "pay-102",
                    "creatorId", "cr-2",
                    "creatorName", "Mehdi Trabelsi",
                    "amount", 280.0,
                    "method", "Poste Tunisienne (D17)",
                    "accountRef", "+216 98 123 456",
                    "requestDate", "2026-09-15 08:40",
                    "status", "PENDING"
            ))
    ));

    @GetMapping("/payouts")
    public ResponseEntity<List<Map<String, Object>>> getPayouts() {
        return ResponseEntity.ok(PAYOUTS_STORE);
    }

    @PatchMapping("/payouts/{id}/approve")
    public ResponseEntity<Map<String, Object>> approvePayout(@PathVariable String id) {
        for (Map<String, Object> p : PAYOUTS_STORE) {
            if (id.equals(p.get("id"))) {
                p.put("status", "APPROVED");
                p.put("processedAt", java.time.LocalDateTime.now().toString());
                log.info("Demande de retrait {} approuvée pour {}", id, p.get("creatorName"));
                return ResponseEntity.ok(p);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/payouts/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectPayout(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        for (Map<String, Object> p : PAYOUTS_STORE) {
            if (id.equals(p.get("id"))) {
                p.put("status", "REJECTED");
                p.put("reason", body != null ? body.getOrDefault("reason", "Informations bancaires non concordantes") : "Rejeté");
                log.info("Demande de retrait {} rejetée : {}", id, p.get("reason"));
                return ResponseEntity.ok(p);
            }
        }
        return ResponseEntity.notFound().build();
    }

    // ─────────────────────────────────────────────────────────────────
    // Platform Governance Settings
    // ─────────────────────────────────────────────────────────────────

    private static final Map<String, Object> SETTINGS_STORE = new java.util.concurrent.ConcurrentHashMap<>(Map.of(
            "commissionRate", 10.0,
            "escrowHoldingDays", 3,
            "minCreatorDailyRate", 50.0,
            "maintenanceMode", false,
            "approvedSmartphones", "iPhone 16 Pro Max, iPhone 16 Pro, iPhone 15 Pro Max, Galaxy S24 Ultra, Galaxy S23 Ultra, Pixel 9 Pro"
    ));

    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getSettings() {
        return ResponseEntity.ok(SETTINGS_STORE);
    }

    @PutMapping("/settings")
    public ResponseEntity<Map<String, Object>> updateSettings(@RequestBody Map<String, Object> newSettings) {
        SETTINGS_STORE.putAll(newSettings);
        log.info("Paramètres de plateforme mis à jour : {}", SETTINGS_STORE);
        return ResponseEntity.ok(SETTINGS_STORE);
    }

    // ─────────────────────────────────────────────────────────────────
    // Reports & Trust Moderation
    // ─────────────────────────────────────────────────────────────────

    private static final java.util.List<Map<String, Object>> REPORTS_STORE = new java.util.concurrent.CopyOnWriteArrayList<>(java.util.List.of(
            new java.util.HashMap<>(Map.of(
                    "id", "rep-1",
                    "target", "Client #12 (TechSolutions TN)",
                    "targetId", "12",
                    "type", "PAYMENT_BYPASS",
                    "reason", "Tentative de paiement direct en espèces hors-plateforme",
                    "reporter", "Sarah Ben Salem",
                    "status", "PENDING",
                    "date", "2026-09-14"
            )),
            new java.util.HashMap<>(Map.of(
                    "id", "rep-2",
                    "target", "Créateur #45 (VideoPro99)",
                    "targetId", "45",
                    "type", "QUALITY_ISSUE",
                    "reason", "Fichiers livrés en 1080p au lieu du 4K ProRes 60fps exigé",
                    "reporter", "Maison Alyssa Cosmétiques Bio",
                    "status", "PENDING",
                    "date", "2026-09-15"
            ))
    ));

    @GetMapping("/reports")
    public ResponseEntity<List<Map<String, Object>>> getReports() {
        return ResponseEntity.ok(REPORTS_STORE);
    }

    @PatchMapping("/reports/{id}/resolve")
    public ResponseEntity<Map<String, Object>> resolveReport(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {

        for (Map<String, Object> rep : REPORTS_STORE) {
            if (id.equals(rep.get("id"))) {
                String action = body.getOrDefault("action", "DISMISS");
                rep.put("status", "RESOLVED_" + action);
                rep.put("resolutionNote", body.getOrDefault("note", "Action appliquée par l'admin"));
                log.info("Signalement {} résolu avec l'action {}", id, action);
                return ResponseEntity.ok(rep);
            }
        }
        return ResponseEntity.notFound().build();
    }

    // ─────────────────────────────────────────────────────────────────
    // Dispute Arbitration (Arbitrage des Litiges)
    // ─────────────────────────────────────────────────────────────────

    @GetMapping("/disputes")
    public ResponseEntity<List<com.snapconnect.model.DisputeEntity>> getAllDisputes() {
        return ResponseEntity.ok(disputeRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/disputes/{id}")
    public ResponseEntity<?> getDisputeById(@PathVariable Long id) {
        return disputeRepository.findById(id)
                .map(d -> {
                    var contract = contractRepository.findById(d.getContractId()).orElse(null);
                    Map<String, Object> res = new HashMap<>();
                    res.put("dispute", d);
                    res.put("contract", contract);
                    return ResponseEntity.ok(res);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/disputes/{id}/resolve")
    public ResponseEntity<?> resolveDispute(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        com.snapconnect.model.DisputeEntity d = disputeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Litige non trouvé"));

        if (d.getStatus() != null && d.getStatus().startsWith("RESOLVED")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ce litige a déjà été arbitré et résolu"));
        }

        String decision = (String) body.getOrDefault("decision", "FULL_REFUND_CLIENT");
        String adminNotes = (String) body.getOrDefault("adminNotes", "Arbitrage rendu par l'administration SnapConnect.");

        var contractOpt = contractRepository.findById(d.getContractId());
        if (contractOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Contrat lié introuvable"));
        }
        com.snapconnect.model.ContractEntity c = contractOpt.get();

        double disputedAmt = d.getAmountDisputed() != null ? d.getAmountDisputed() : (c.getAmount() != null ? c.getAmount() : 0.0);

        if ("FULL_REFUND_CLIENT".equalsIgnoreCase(decision)) {
            // Rembourser intégralement le client
            c.setStatus("CANCELLED");
            c.setEscrowStatus("REFUNDED");
            contractRepository.save(c);

            Long clientId = c.getClientId();
            if (clientId != null && disputedAmt > 0) {
                com.snapconnect.model.WalletEntity wallet = walletRepository.findByUserId(clientId)
                        .orElseGet(() -> walletRepository.save(com.snapconnect.model.WalletEntity.builder().userId(clientId).availableBalance(0.0).build()));
                wallet.setAvailableBalance((wallet.getAvailableBalance() == null ? 0.0 : wallet.getAvailableBalance()) + disputedAmt);
                walletRepository.save(wallet);

                com.snapconnect.model.TransactionEntity tx = com.snapconnect.model.TransactionEntity.builder()
                        .walletId(wallet.getId())
                        .userId(clientId)
                        .contractId(c.getId())
                        .type("ESCROW_REFUND")
                        .amount(disputedAmt)
                        .description("Remboursement intégral suite à décision d'arbitrage (Litige #" + d.getId() + ")")
                        .status("COMPLETED")
                        .build();
                transactionRepository.save(tx);
            }

            d.setStatus("RESOLVED_CLIENT");
            d.setDecision("FULL_REFUND_CLIENT");
            d.setClientRefundAmount(disputedAmt);
            d.setCreatorPayoutAmount(0.0);

            // Notifications sans émojis
            try {
                notificationService.notifyUser(
                        c.getClientId(),
                        "DISPUTE_RESOLVED",
                        "Litige résolu en votre faveur",
                        "L'administration a validé le remboursement intégral de " + disputedAmt + " DT pour la mission « " + c.getTitle() + " ».",
                        "/client/contracts/" + c.getId()
                );
                notificationService.notifyUser(
                        c.getCreatorId(),
                        "DISPUTE_RESOLVED",
                        "Décision d'arbitrage sur le litige #" + d.getId(),
                        "L'arbitrage de la mission « " + c.getTitle() + " » a conclu à un remboursement du client. Motif : " + adminNotes,
                        "/creator/contracts/" + c.getId()
                );
            } catch (Exception ignored) {}

            lifecycleService.logActivity(c.getId(), null, "Administration SnapConnect", "ADMIN", "DISPUTE_RESOLVED",
                    "Arbitrage rendu en faveur du client : remboursement de " + disputedAmt + " DT. Motif : " + adminNotes);

        } else if ("FULL_PAYMENT_CREATOR".equalsIgnoreCase(decision)) {
            // Libérer l'intégralité au créateur
            c.setStatus("COMPLETED");
            c.setEscrowStatus("RELEASED");
            c.setCompletedAt(java.time.LocalDateTime.now());
            contractRepository.save(c);

            double netEarnings = c.getCreatorEarnings() != null ? c.getCreatorEarnings() : (disputedAmt * 0.90);
            Long creatorId = c.getCreatorId();
            if (creatorId != null && netEarnings > 0) {
                com.snapconnect.model.WalletEntity wallet = walletRepository.findByUserId(creatorId)
                        .orElseGet(() -> walletRepository.save(com.snapconnect.model.WalletEntity.builder().userId(creatorId).availableBalance(0.0).build()));
                wallet.setAvailableBalance((wallet.getAvailableBalance() == null ? 0.0 : wallet.getAvailableBalance()) + netEarnings);
                walletRepository.save(wallet);

                com.snapconnect.model.TransactionEntity tx = com.snapconnect.model.TransactionEntity.builder()
                        .walletId(wallet.getId())
                        .userId(creatorId)
                        .contractId(c.getId())
                        .type("ESCROW_RELEASE")
                        .amount(netEarnings)
                        .description("Libération des fonds suite à décision d'arbitrage (Litige #" + d.getId() + ")")
                        .status("COMPLETED")
                        .build();
                transactionRepository.save(tx);
            }

            d.setStatus("RESOLVED_CREATOR");
            d.setDecision("FULL_PAYMENT_CREATOR");
            d.setClientRefundAmount(0.0);
            d.setCreatorPayoutAmount(netEarnings);

            // Notifications sans émojis
            try {
                notificationService.notifyUser(
                        c.getCreatorId(),
                        "DISPUTE_RESOLVED",
                        "Litige résolu en votre faveur",
                        "L'arbitrage pour la mission « " + c.getTitle() + " » a été validé. Vos gains de " + netEarnings + " DT ont été versés.",
                        "/creator/earnings"
                );
                notificationService.notifyUser(
                        c.getClientId(),
                        "DISPUTE_RESOLVED",
                        "Décision d'arbitrage sur le litige #" + d.getId(),
                        "L'administration a examiné les livrables 4K et validé la prestation. Les fonds ont été libérés au créateur.",
                        "/client/contracts/" + c.getId()
                );
            } catch (Exception ignored) {}

            lifecycleService.logActivity(c.getId(), null, "Administration SnapConnect", "ADMIN", "DISPUTE_RESOLVED",
                    "Arbitrage rendu en faveur du créateur : " + netEarnings + " DT libérés. Motif : " + adminNotes);

        } else {
            // PARTIAL_SPLIT
            c.setStatus("COMPLETED");
            c.setEscrowStatus("PARTIAL_RELEASE");
            c.setCompletedAt(java.time.LocalDateTime.now());
            contractRepository.save(c);

            double splitClient = body.containsKey("clientRefundAmount") ? Double.parseDouble(String.valueOf(body.get("clientRefundAmount"))) : disputedAmt * 0.5;
            double splitCreator = body.containsKey("creatorPayoutAmount") ? Double.parseDouble(String.valueOf(body.get("creatorPayoutAmount"))) : disputedAmt * 0.4;

            if (splitClient < 0 || splitCreator < 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Les montants répartis ne peuvent pas être négatifs"));
            }
            if (splitClient + splitCreator > disputedAmt) {
                return ResponseEntity.badRequest().body(Map.of("error", "La somme des montants (" + (splitClient + splitCreator) + ") ne peut pas dépasser le montant bloqué (" + disputedAmt + " DT)"));
            }

            if (c.getClientId() != null && splitClient > 0) {
                com.snapconnect.model.WalletEntity cw = walletRepository.findByUserId(c.getClientId())
                        .orElseGet(() -> walletRepository.save(com.snapconnect.model.WalletEntity.builder().userId(c.getClientId()).availableBalance(0.0).build()));
                cw.setAvailableBalance((cw.getAvailableBalance() == null ? 0.0 : cw.getAvailableBalance()) + splitClient);
                walletRepository.save(cw);

                transactionRepository.save(com.snapconnect.model.TransactionEntity.builder()
                        .walletId(cw.getId()).userId(c.getClientId()).contractId(c.getId())
                        .type("ESCROW_REFUND").amount(splitClient)
                        .description("Remboursement partiel (Arbitrage #" + d.getId() + ")")
                        .status("COMPLETED").build());
            }

            if (c.getCreatorId() != null && splitCreator > 0) {
                com.snapconnect.model.WalletEntity crw = walletRepository.findByUserId(c.getCreatorId())
                        .orElseGet(() -> walletRepository.save(com.snapconnect.model.WalletEntity.builder().userId(c.getCreatorId()).availableBalance(0.0).build()));
                crw.setAvailableBalance((crw.getAvailableBalance() == null ? 0.0 : crw.getAvailableBalance()) + splitCreator);
                walletRepository.save(crw);

                transactionRepository.save(com.snapconnect.model.TransactionEntity.builder()
                        .walletId(crw.getId()).userId(c.getCreatorId()).contractId(c.getId())
                        .type("ESCROW_RELEASE").amount(splitCreator)
                        .description("Paiement partiel (Arbitrage #" + d.getId() + ")")
                        .status("COMPLETED").build());
            }

            d.setStatus("PARTIAL_RESOLUTION");
            d.setDecision("PARTIAL_SPLIT");
            d.setClientRefundAmount(splitClient);
            d.setCreatorPayoutAmount(splitCreator);

            lifecycleService.logActivity(c.getId(), null, "Administration SnapConnect", "ADMIN", "DISPUTE_RESOLVED",
                    "Arbitrage résolu en partage : " + splitClient + " DT remboursés au client, " + splitCreator + " DT versés au créateur.");
        }

        d.setAdminNotes(adminNotes);
        d.setResolvedAt(java.time.LocalDateTime.now());
        d.setResolvedBy("Admin SnapConnect");
        com.snapconnect.model.DisputeEntity saved = disputeRepository.save(d);

        return ResponseEntity.ok(saved);
    }

    /**
     * POST /api/admin/disputes/{id}/sanction
     * Applique une sanction administrative (WARNING, BLOCK_3_DAYS, BLOCK_15_DAYS, BLOCK_30_DAYS, BLOCK_1_YEAR, PERMANENT_BLOCK)
     */
    @PostMapping("/disputes/{id}/sanction")
    public ResponseEntity<?> applySanction(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        com.snapconnect.model.DisputeEntity d = disputeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Litige non trouvé"));

        Long targetUserId = body.containsKey("userId") 
                ? Long.parseLong(String.valueOf(body.get("userId"))) 
                : (body.containsKey("targetUserId") ? Long.parseLong(String.valueOf(body.get("targetUserId"))) : d.getRespondentId());
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Utilisateur cible non trouvé"));

        String type = body.containsKey("sanctionType") 
                ? String.valueOf(body.get("sanctionType")) 
                : (String) body.getOrDefault("type", "WARNING");
        String reason = (String) body.getOrDefault("reason", "Infraction constatée lors de l'arbitrage du litige #" + id);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endDate = null;

        switch (type.toUpperCase()) {
            case "BLOCK_3_DAYS" -> endDate = now.plusDays(3);
            case "BLOCK_15_DAYS" -> endDate = now.plusDays(15);
            case "BLOCK_30_DAYS" -> endDate = now.plusDays(30);
            case "BLOCK_1_YEAR" -> endDate = now.plusYears(1);
            case "PERMANENT_BLOCK" -> endDate = now.plusYears(100);
            default -> type = "WARNING";
        }

        if (!"WARNING".equalsIgnoreCase(type) && endDate != null) {
            targetUser.setSuspended(true);
            targetUser.setStatus("SUSPENDED");
            targetUser.setSuspensionStart(now);
            targetUser.setSuspensionEnd(endDate);
            targetUser.setSuspensionReason(reason);
            userRepository.save(targetUser);

            lifecycleService.logActivity(d.getContractId(), targetUserId, targetUser.getFullName(), targetUser.getRole().name(), "ACCOUNT_SUSPENDED",
                    "Sanction appliquée : " + type + ". Fin : " + endDate + ". Motif : " + reason);
        } else {
            lifecycleService.logActivity(d.getContractId(), targetUserId, targetUser.getFullName(), targetUser.getRole().name(), "SANCTION_CREATED",
                    "Avertissement officiel adressé : " + reason);
        }

        com.snapconnect.model.UserSanctionEntity sanction = com.snapconnect.model.UserSanctionEntity.builder()
                .userId(targetUserId)
                .userName(targetUser.getFullName())
                .userEmail(targetUser.getEmail())
                .userRole(targetUser.getRole().name())
                .disputeId(id)
                .reason(reason)
                .type(type)
                .startDate(now)
                .endDate(endDate)
                .status("ACTIVE")
                .createdByAdmin("Admin SnapConnect")
                .build();
        com.snapconnect.model.UserSanctionEntity saved = userSanctionRepository.save(sanction);

        d.setSanctionApplied(type + " (" + targetUser.getFullName() + ")");
        disputeRepository.save(d);

        try {
            notificationService.notifyUser(
                    targetUserId,
                    "SANCTION",
                    "Notification administrative concernant votre compte",
                    "Une mesure administrative (" + type + ") a été prise. Motif : " + reason + (endDate != null ? ". Date de levée : " + endDate : "."),
                    "/help"
            );
        } catch (Exception ignored) {}

        return ResponseEntity.ok(saved);
    }

    /**
     * POST /api/admin/sanctions/{id}/revoke
     * Lève manuellement une sanction et réactive le compte.
     */
    @PostMapping("/sanctions/{id}/revoke")
    public ResponseEntity<?> revokeSanction(@PathVariable Long id) {
        var sanctionOpt = userSanctionRepository.findById(id);
        if (sanctionOpt.isEmpty()) return ResponseEntity.notFound().build();

        com.snapconnect.model.UserSanctionEntity sanction = sanctionOpt.get();
        sanction.setStatus("REVOKED");
        userSanctionRepository.save(sanction);

        userRepository.findById(sanction.getUserId()).ifPresent(user -> {
            user.setSuspended(false);
            user.setStatus("ACTIVE");
            user.setSuspensionEnd(LocalDateTime.now().minusSeconds(1));
            userRepository.save(user);

            try {
                notificationService.notifyUser(
                        user.getId(),
                        "SANCTION_REVOKED",
                        "Rétablissement de votre compte SnapConnect",
                        "La mesure de suspension a été levée par l'administration. Vos accès sont rétablis.",
                        "/help"
                );
            } catch (Exception ignored) {}
        });

        return ResponseEntity.ok(Map.of(
                "message", "Sanction levée avec succès",
                "active", false,
                "status", "REVOKED",
                "id", id
        ));
    }

    /**
     * GET /api/admin/sanctions
     * Retourne la liste complète de toutes les sanctions pour l'audit.
     */
    @GetMapping("/sanctions")
    public ResponseEntity<List<com.snapconnect.model.UserSanctionEntity>> getAllSanctions() {
        return ResponseEntity.ok(userSanctionRepository.findAllByOrderByCreatedAtDesc());
    }
}
