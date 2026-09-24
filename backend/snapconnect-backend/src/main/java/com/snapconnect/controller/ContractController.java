package com.snapconnect.controller;

import com.snapconnect.model.ContractActivityEntity;
import com.snapconnect.model.ContractEntity;
import com.snapconnect.model.TransactionEntity;
import com.snapconnect.model.WalletEntity;
import com.snapconnect.repository.ContractRepository;
import com.snapconnect.repository.TransactionRepository;
import com.snapconnect.repository.WalletRepository;
import com.snapconnect.repository.UserRepository;
import com.snapconnect.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.snapconnect.model.User;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ContractController {

    private final ContractRepository contractRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final com.snapconnect.service.NotificationService notificationService;
    private final com.snapconnect.service.ContractLifecycleService lifecycleService;
    private final com.snapconnect.repository.DisputeRepository disputeRepository;
    private final com.snapconnect.repository.DisputeMessageRepository disputeMessageRepository;
    private final com.snapconnect.repository.ContractActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    private Long extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        try {
            String token = authHeader.substring(7);
            var claims = jwtService.extractClaims(token);
            Object userIdObj = claims.get("userId");
            if (userIdObj instanceof Number num) {
                return num.longValue();
            }
            return Long.parseLong(String.valueOf(userIdObj));
        } catch (Exception e) {
            return null;
        }
    }

    private String extractRole(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        try {
            String token = authHeader.substring(7);
            return (String) jwtService.extractClaims(token).get("role");
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping
    public ResponseEntity<List<ContractEntity>> getAllContracts() {
        lifecycleService.processAllPendingDeadlines();
        return ResponseEntity.ok(contractRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContractEntity> getContractById(@PathVariable Long id) {
        return contractRepository.findById(id)
                .map(lifecycleService::checkContractDeadlines)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<ContractEntity>> getContractsByClient(@PathVariable Long clientId) {
        lifecycleService.processAllPendingDeadlines();
        return ResponseEntity.ok(contractRepository.findByClientIdOrderByCreatedAtDesc(clientId));
    }

    @GetMapping("/creator/{creatorId}")
    public ResponseEntity<List<ContractEntity>> getContractsByCreator(@PathVariable Long creatorId) {
        lifecycleService.processAllPendingDeadlines();
        return ResponseEntity.ok(contractRepository.findByCreatorIdOrderByCreatedAtDesc(creatorId));
    }

    @PostMapping
    public ResponseEntity<?> createContract(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody ContractEntity contract) {
        
        Long userId = extractUserId(authHeader);
        String role = extractRole(authHeader);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentification requise"));
        }

        var userOpt = userRepository.findById(userId);
        if (userOpt.isPresent() && userOpt.get().isCurrentlySuspended()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Votre compte est actuellement suspendu. Action impossible."));
        }

        // Idempotence : Ne jamais créer un deuxième contrat pour la même proposition
        if (contract.getProposalId() != null) {
            var existing = contractRepository.findByProposalId(contract.getProposalId());
            if (existing.isPresent()) {
                return ResponseEntity.ok(existing.get());
            }
        }

        if ("CLIENT".equals(role)) {
            contract.setClientId(userId);
        }

        if (contract.getStartDate() == null) {
            contract.setStartDate(LocalDateTime.now());
        }
        if (contract.getDeadline() == null) {
            contract.setDeadline(contract.getStartDate().plusDays(7));
        }

        if (contract.getRevisionsAllowed() != null) {
            if (contract.getRevisionsAllowed() < 0 || contract.getRevisionsAllowed() > 2) {
                return ResponseEntity.badRequest().body(Map.of("error", "Le nombre de révisions doit être compris entre 0 et 2"));
            }
        } else {
            contract.setRevisionsAllowed(2);
        }
        contract.setRevisionsUsed(0);
        contract.setStatus("ACTIVE");
        contract.setEscrowStatus("SECURED");

        ContractEntity saved = contractRepository.save(contract);

        lifecycleService.logActivity(saved.getId(), userId, saved.getClientName(), "CLIENT", "CONTRACT_CREATED",
                "Mission démarrée. Date limite fixée au " + saved.getDeadline() + ". Fonds de " + saved.getAmount() + " DT sous séquestre.");

        // Notify Creator (aucun émoji)
        try {
            notificationService.notifyUser(
                    saved.getCreatorId(),
                    "ESCROW",
                    "Nouveau contrat actif avec séquestre garanti",
                    "Le contrat #" + saved.getId() + " (« " + saved.getTitle() + " ») est validé. Date limite : " + saved.getDeadline() + ". Fonds de " + saved.getAmount() + " DT sous séquestre.",
                    "/creator/contracts/" + saved.getId()
            );
        } catch (Exception ignored) {}

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/deliver")
    public ResponseEntity<?> submitDeliverables(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        
        Long userId = extractUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentification requise"));
        }

        var userOpt = userRepository.findById(userId);
        if (userOpt.isPresent() && userOpt.get().isCurrentlySuspended()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Votre compte est actuellement suspendu. Action impossible."));
        }

        ContractEntity c = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé"));

        c = lifecycleService.checkContractDeadlines(c);

        if (!userId.equals(c.getCreatorId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Seul le créateur assigné peut livrer ce contrat"));
        }

        if ("EXPIRED".equalsIgnoreCase(c.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "La date limite pour cette mission a expiré. Livraison impossible."));
        }

        if (!"ACTIVE".equals(c.getStatus()) && !"REVISION".equals(c.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le contrat n'est pas dans un état permettant la livraison (doit être ACTIVE ou REVISION)"));
        }

        String deliverableUrl = body.get("deliverableUrl");
        if (deliverableUrl == null || deliverableUrl.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le lien ou fichier livrable est obligatoire"));
        }

        LocalDateTime now = LocalDateTime.now();
        c.setDeliverableUrl(deliverableUrl.trim());
        c.setDeliverableNotes(body.get("notes"));
        c.setStatus("DELIVERED");
        c.setDeliverySubmittedAt(now);
        c.setReviewDeadline(now.plusHours(24)); // Période d'examen de 24h stricte
        ContractEntity saved = contractRepository.save(c);

        lifecycleService.logActivity(saved.getId(), userId, saved.getCreatorName(), "CREATOR", "DELIVERED",
                "Livrables 4K déposés. Période d'examen client de 24h déclenchée (fin le " + saved.getReviewDeadline() + ").");

        // Notify Client (aucun émoji)
        try {
            Long clientId = c.getClientId();
            notificationService.notifyUser(
                    clientId,
                    "DELIVERY",
                    "Le créateur a envoyé les livrables de votre mission",
                    "Le créateur a déposé les fichiers 4K pour le contrat #" + c.getId() + " (« " + c.getTitle() + " »). Vous disposez de 24h pour examiner et valider ou demander une révision.",
                    "/client/contracts/" + c.getId()
            );
        } catch (Exception ignored) {}

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/revise")
    public ResponseEntity<?> requestRevision(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        
        Long userId = extractUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentification requise"));
        }

        var revUserOpt = userRepository.findById(userId);
        if (revUserOpt.isPresent() && revUserOpt.get().isCurrentlySuspended()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Votre compte est actuellement suspendu. Action impossible."));
        }

        ContractEntity c = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé"));
        
        c = lifecycleService.checkContractDeadlines(c);

        if (!userId.equals(c.getClientId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Seul le client peut demander une révision"));
        }

        if (!"DELIVERED".equals(c.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le contrat n'est pas en attente de révision (statut attendu: DELIVERED)"));
        }

        int allowed = c.getRevisionsAllowed() != null ? c.getRevisionsAllowed() : 2;
        int used = c.getRevisionsUsed() != null ? c.getRevisionsUsed() : 0;
        int remaining = allowed - used;

        // RÈGLE ABSOLUE : 0 <= revisionsRemaining <= maxRevisions (Interdiction de descendre sous 0)
        if (remaining <= 0 || used >= allowed) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nombre maximum de révisions atteint (" + allowed + "/" + allowed + "). Aucune autre révision autorisée."));
        }

        c.setRevisionsUsed(used + 1);
        c.setStatus("REVISION");
        ContractEntity updated = contractRepository.save(c);

        String note = body.getOrDefault("notes", body.getOrDefault("note", "Ajustements demandés"));
        lifecycleService.logActivity(updated.getId(), userId, updated.getClientName(), "CLIENT", "REVISION_REQUESTED",
                "Demande de révision #" + updated.getRevisionsUsed() + "/" + allowed + ". Remarques : " + note);

        try {
            notificationService.notifyUser(
                    c.getCreatorId(),
                    "REVISION",
                    "Le client a demandé une révision",
                    "Des retouches ont été demandées pour le contrat #" + c.getId() + " (« " + c.getTitle() + " »). Révision " + updated.getRevisionsUsed() + "/" + allowed + ".",
                    "/creator/contracts/" + c.getId()
            );
        } catch (Exception ignored) {}

        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveAndRelease(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {
        
        Long userId = extractUserId(authHeader);
        String role = extractRole(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentification requise"));
        }

        var appUserOpt = userRepository.findById(userId);
        if (appUserOpt.isPresent() && appUserOpt.get().isCurrentlySuspended()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Votre compte est actuellement suspendu. Action impossible."));
        }

        ContractEntity c = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé"));

        c = lifecycleService.checkContractDeadlines(c);

        if (!userId.equals(c.getClientId()) && !"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Seul le client ou un administrateur peut approuver le contrat"));
        }

        // Idempotence stricte : Interdiction de double libération
        if ("COMPLETED".equals(c.getStatus()) || !"SECURED".equalsIgnoreCase(c.getEscrowStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Contrat déjà complété ou paiement déjà libéré"));
        }

        c.setStatus("COMPLETED");
        c.setEscrowStatus("RELEASED");
        c.setCompletedAt(LocalDateTime.now());
        ContractEntity updated = contractRepository.save(c);

        // Créditer le wallet du créateur
        Long creatorId = c.getCreatorId();
        WalletEntity wallet = walletRepository.findByUserId(creatorId)
                .orElseGet(() -> walletRepository.save(WalletEntity.builder().userId(creatorId).availableBalance(0.0).build()));

        double netEarnings = c.getCreatorEarnings() != null ? c.getCreatorEarnings() : (c.getAmount() * 0.90);
        wallet.setAvailableBalance((wallet.getAvailableBalance() == null ? 0.0 : wallet.getAvailableBalance()) + netEarnings);
        walletRepository.save(wallet);

        // Enregistrer la transaction
        TransactionEntity tx = TransactionEntity.builder()
                .walletId(wallet.getId())
                .userId(creatorId)
                .contractId(c.getId())
                .type("ESCROW_RELEASE")
                .amount(netEarnings)
                .description("Fonds sous séquestre libérés suite à approbation pour le contrat #" + c.getId())
                .status("COMPLETED")
                .build();
        transactionRepository.save(tx);

        lifecycleService.logActivity(updated.getId(), userId, updated.getClientName(), role != null ? role : "CLIENT", "APPROVED",
                "Prestation approuvée par le client. " + netEarnings + " DT libérés au créateur.");

        // Notification Créateur (aucun émoji)
        try {
            notificationService.notifyUser(
                    creatorId,
                    "ESCROW",
                    "Le client a approuvé votre travail",
                    "Le client a validé vos livrables pour le contrat #" + c.getId() + ". Le montant net de " + netEarnings + " DT a été versé sur votre portefeuille.",
                    "/creator/earnings"
            );
        } catch (Exception ignored) {}

        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/dispute")
    public ResponseEntity<?> openDispute(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        
        Long userId = extractUserId(authHeader);
        String role = extractRole(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentification requise"));
        }

        User openerUser = userRepository.findById(userId).orElse(null);
        if (openerUser != null && openerUser.isCurrentlySuspended()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Votre compte est actuellement suspendu. Action interdite."));
        }

        ContractEntity c = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé"));

        if (!userId.equals(c.getClientId()) && !userId.equals(c.getCreatorId()) && !"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Seules les parties prenantes peuvent ouvrir un litige"));
        }

        if ("COMPLETED".equals(c.getStatus()) || "CANCELLED".equals(c.getStatus()) || "EXPIRED".equals(c.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Impossible d'ouvrir un litige sur un contrat clôturé ou expiré"));
        }

        // Idempotence : Ne jamais ouvrir deux litiges simultanés sur le même contrat
        Optional<com.snapconnect.model.DisputeEntity> existingDispute = disputeRepository.findFirstByContractIdOrderByIdDesc(id);
        if (existingDispute.isPresent()) {
            String exStatus = existingDispute.get().getStatus();
            if ("OPEN".equals(exStatus) || "UNDER_REVIEW".equals(exStatus)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Une réclamation est déjà en cours de traitement pour ce contrat (Dossier #" + existingDispute.get().getId() + ")"));
            }
        }

        String reason = body.getOrDefault("reason", "WORK_DIFFERS_FROM_BRIEF");
        String description = body.getOrDefault("description", "Litige ouvert sur la conformité de la prestation");

        c.setStatus("DISPUTED");
        c.setEscrowStatus("FROZEN");
        c.setDisputeReason(reason);
        c.setDisputeDescription(description);
        c.setDisputeOpenedBy(userId);
        c.setDisputeOpenedAt(LocalDateTime.now());
        ContractEntity saved = contractRepository.save(c);

        boolean isClient = userId.equals(c.getClientId());
        Long respondentId = isClient ? c.getCreatorId() : c.getClientId();
        String respondentName = isClient ? c.getCreatorName() : c.getClientName();
        String openerName = isClient ? c.getClientName() : c.getCreatorName();

        LocalDateTime deadline24h = LocalDateTime.now().plusHours(24);

        com.snapconnect.model.DisputeEntity dispute = com.snapconnect.model.DisputeEntity.builder()
                .contractId(c.getId())
                .contractTitle(c.getTitle())
                .openedByUserId(userId)
                .openedByName(openerName != null ? openerName : "Utilisateur #" + userId)
                .openedByRole(isClient ? "CLIENT" : "CREATOR")
                .respondentId(respondentId)
                .respondentName(respondentName != null ? respondentName : "Utilisateur #" + respondentId)
                .amountDisputed(c.getAmount())
                .currency("DT")
                .reason(reason)
                .description(description)
                .evidenceUrl(body.get("evidenceUrl"))
                .evidenceName(body.get("evidenceName"))
                .evidenceNote(body.get("evidenceNote"))
                .status("OPEN")
                .responseDeadline(deadline24h)
                .build();
        com.snapconnect.model.DisputeEntity savedDispute = disputeRepository.save(dispute);

        // Créer le message initial dans le chat tripartite dédié
        try {
            com.snapconnect.model.DisputeMessageEntity initialMsg = com.snapconnect.model.DisputeMessageEntity.builder()
                    .disputeId(savedDispute.getId())
                    .senderId(userId)
                    .senderName(openerName != null ? openerName : "Demandeur")
                    .senderRole(isClient ? "CLIENT" : "CREATOR")
                    .senderAvatar(openerUser != null ? openerUser.getAvatarUrl() : null)
                    .content("Réclamation ouverte. Motif : " + reason + ".\n" + description)
                    .attachmentUrl(body.get("evidenceUrl"))
                    .attachmentName(body.get("evidenceName"))
                    .attachmentType(body.getOrDefault("attachmentType", "IMAGE"))
                    .build();
            disputeMessageRepository.save(initialMsg);
        } catch (Exception e) {
            // non-blocking
        }

        lifecycleService.logActivity(c.getId(), userId, openerName, isClient ? "CLIENT" : "CREATOR", "DISPUTE_OPENED",
                "Litige ouvert (#" + savedDispute.getId() + "). Motif : " + reason + ". Délai de réponse : 24h.");

        // Notifications aux 3 parties (sans émojis)
        try {
            // 1. Notifier le répondant
            notificationService.notifyUser(
                    respondentId,
                    "DISPUTE",
                    "Une réclamation concerne la mission « " + c.getTitle() + " »",
                    openerName + " a ouvert la réclamation #" + savedDispute.getId() + ". Vous disposez de 24h pour consulter le dossier et fournir votre réponse.",
                    (isClient ? "/creator/contracts/" : "/client/contracts/") + c.getId()
            );

            // 2. Notifier le demandeur
            notificationService.notifyUser(
                    userId,
                    "DISPUTE",
                    "Votre réclamation pour la mission « " + c.getTitle() + " » est ouverte",
                    "Le dossier #" + savedDispute.getId() + " a été transmis. Le délai de réponse adverse est de 24h.",
                    (isClient ? "/client/contracts/" : "/creator/contracts/") + c.getId()
            );

            // 3. Notifier les administrateurs
            List<User> admins = userRepository.findByRole(com.snapconnect.model.Role.ADMIN);
            for (User admin : admins) {
                notificationService.notifyUser(
                        admin.getId(),
                        "DISPUTE",
                        "Nouvelle réclamation à traiter : Mission « " + c.getTitle() + " »",
                        "Dossier #" + savedDispute.getId() + " ouvert par " + openerName + " (Montant contesté : " + c.getAmount() + " DT).",
                        "/admin/contracts"
                );
            }
        } catch (Exception ignored) {}

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}/activity")
    public ResponseEntity<List<ContractActivityEntity>> getContractActivity(@PathVariable Long id) {
        return ResponseEntity.ok(activityRepository.findByContractIdOrderByCreatedAtDesc(id));
    }
}
