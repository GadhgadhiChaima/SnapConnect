package com.snapconnect.service;

import com.snapconnect.model.ContractActivityEntity;
import com.snapconnect.model.ContractEntity;
import com.snapconnect.model.TransactionEntity;
import com.snapconnect.model.WalletEntity;
import com.snapconnect.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContractLifecycleService {

    private final ContractRepository contractRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final ContractActivityRepository activityRepository;
    private final ReviewRepository reviewRepository;

    /**
     * Enregistre un événement dans la traçabilité / audit log du contrat.
     */
    public void logActivity(Long contractId, Long actorId, String actorName, String actorRole, String action, String description) {
        try {
            ContractActivityEntity act = ContractActivityEntity.builder()
                    .contractId(contractId)
                    .actorId(actorId)
                    .actorName(actorName != null ? actorName : "Système")
                    .actorRole(actorRole != null ? actorRole : "SYSTEM")
                    .action(action)
                    .description(description)
                    .createdAt(LocalDateTime.now())
                    .build();
            activityRepository.save(act);
        } catch (Exception e) {
            log.error("Erreur lors de l'enregistrement de l'activité du contrat #{}: {}", contractId, e.getMessage());
        }
    }

    /**
     * Vérifie et applique de façon STRICTEMENT IDEMPOTENTE les échéances d'un contrat:
     * 1. Expiration de mission (deadline dépassée sans livraison) -> Remboursement Client.
     * 2. Expiration des 24h d'examen client (reviewDeadline dépassée) -> Auto-approbation et paiement Créateur.
     */
    @Transactional
    public ContractEntity checkContractDeadlines(ContractEntity c) {
        if (c == null) return null;
        LocalDateTime now = LocalDateTime.now();

        // ─────────────────────────────────────────────────────────────────
        // 1. Expiration de la mission : Deadline dépassée sans livraison
        // ─────────────────────────────────────────────────────────────────
        if (("ACTIVE".equalsIgnoreCase(c.getStatus()) || "REVISION".equalsIgnoreCase(c.getStatus()))
                && c.getDeadline() != null && now.isAfter(c.getDeadline())) {

            c.setStatus("EXPIRED");

            // Idempotence : Ne rembourser qu'une seule fois si le séquestre est encore SECURED
            if ("SECURED".equalsIgnoreCase(c.getEscrowStatus())) {
                c.setEscrowStatus("REFUNDED");
                double refundAmt = c.getAmount() != null ? c.getAmount() : 0.0;

                // Créditer le wallet du client
                if (c.getClientId() != null && refundAmt > 0) {
                    WalletEntity clientWallet = walletRepository.findByUserId(c.getClientId())
                            .orElseGet(() -> WalletEntity.builder().userId(c.getClientId()).availableBalance(0.0).build());
                    clientWallet.setAvailableBalance((clientWallet.getAvailableBalance() == null ? 0.0 : clientWallet.getAvailableBalance()) + refundAmt);
                    walletRepository.save(clientWallet);

                    TransactionEntity tx = TransactionEntity.builder()
                            .walletId(clientWallet.getId())
                            .userId(c.getClientId())
                            .contractId(c.getId())
                            .type("ESCROW_REFUND")
                            .amount(refundAmt)
                            .description("Remboursement intégral suite à expiration de délai pour le contrat #" + c.getId())
                            .status("COMPLETED")
                            .build();
                    transactionRepository.save(tx);
                }

                // Notifications sans émojis
                try {
                    notificationService.notifyUser(
                            c.getClientId(),
                            "ESCROW_REFUND",
                            "Mission expirée et remboursement effectué",
                            "Le délai de réalisation de la mission #" + c.getId() + " (« " + c.getTitle() + " ») a expiré sans livraison. Les fonds de " + refundAmt + " DT vous ont été remboursés.",
                            "/client/contracts/" + c.getId()
                    );
                    notificationService.notifyUser(
                            c.getCreatorId(),
                            "MISSION_EXPIRED",
                            "Mission clôturée pour expiration de délai",
                            "La date limite impartie pour la mission #" + c.getId() + " (« " + c.getTitle() + " ») a été dépassée sans livraison. La mission est clôturée.",
                            "/creator/contracts/" + c.getId()
                    );
                } catch (Exception ignored) {}

                logActivity(c.getId(), null, "Système SnapConnect", "SYSTEM", "EXPIRED_REFUNDED",
                        "Mission expirée après dépassement de la deadline (" + c.getDeadline() + "). Remboursement de " + refundAmt + " DT au client.");
            }

            return contractRepository.save(c);
        }

        // ─────────────────────────────────────────────────────────────────
        // 2. Expiration des 24 heures d'examen client : Auto-approbation
        // ─────────────────────────────────────────────────────────────────
        if ("DELIVERED".equalsIgnoreCase(c.getStatus()) && c.getReviewDeadline() != null && now.isAfter(c.getReviewDeadline())) {
            c.setStatus("COMPLETED");
            c.setCompletedAt(now);

            // Idempotence : Ne libérer les fonds qu'une seule fois si le séquestre est encore SECURED
            if ("SECURED".equalsIgnoreCase(c.getEscrowStatus())) {
                c.setEscrowStatus("RELEASED");
                double netEarnings = c.getCreatorEarnings() != null ? c.getCreatorEarnings() : ((c.getAmount() != null ? c.getAmount() : 0.0) * 0.90);

                if (c.getCreatorId() != null && netEarnings > 0) {
                    WalletEntity creatorWallet = walletRepository.findByUserId(c.getCreatorId())
                            .orElseGet(() -> WalletEntity.builder().userId(c.getCreatorId()).availableBalance(0.0).build());
                    creatorWallet.setAvailableBalance((creatorWallet.getAvailableBalance() == null ? 0.0 : creatorWallet.getAvailableBalance()) + netEarnings);
                    walletRepository.save(creatorWallet);

                    TransactionEntity tx = TransactionEntity.builder()
                            .walletId(creatorWallet.getId())
                            .userId(c.getCreatorId())
                            .contractId(c.getId())
                            .type("ESCROW_AUTO_RELEASE")
                            .amount(netEarnings)
                            .description("Libération automatique des fonds sous séquestre (24h inactivité client) pour le contrat #" + c.getId())
                            .status("COMPLETED")
                            .build();
                    transactionRepository.save(tx);
                }

                // Notifications sans émojis
                try {
                    notificationService.notifyUser(
                            c.getCreatorId(),
                            "ESCROW",
                            "Paiement libéré automatiquement (délai d'examen 24h écoulé)",
                            "La période d'examen de 24h est arrivée à son terme. Vos livrables pour le contrat #" + c.getId() + " ont été validés automatiquement. " + netEarnings + " DT crédités.",
                            "/creator/earnings"
                    );
                    notificationService.notifyUser(
                            c.getClientId(),
                            "AUTO_APPROVED",
                            "Mission validée automatiquement (délai 24h écoulé)",
                            "La période d'examen de 24h pour le contrat #" + c.getId() + " (« " + c.getTitle() + " ») a expiré. La prestation a été validée automatiquement.",
                            "/client/contracts/" + c.getId()
                    );
                } catch (Exception ignored) {}

                logActivity(c.getId(), null, "Système SnapConnect", "SYSTEM", "AUTO_APPROVED_24H",
                        "Validation automatique après 24h d'examen sans retour client. " + netEarnings + " DT libérés au créateur.");
            }

            return contractRepository.save(c);
        }

        return c;
    }

    /**
     * Balayage global de tous les contrats actifs ou en attente d'examen.
     */
    @Transactional
    public void processAllPendingDeadlines() {
        List<ContractEntity> all = contractRepository.findAll();
        for (ContractEntity c : all) {
            checkContractDeadlines(c);
        }
    }

    /**
     * Calcule les vraies statistiques d'un créateur à partir de ses contrats MySQL réels.
     */
    public Map<String, Object> calculateCreatorStats(Long creatorId) {
        List<ContractEntity> contracts = contractRepository.findByCreatorIdOrderByCreatedAtDesc(creatorId);

        int totalMissions = contracts.size();
        long completedMissions = contracts.stream()
                .filter(c -> "COMPLETED".equalsIgnoreCase(c.getStatus()))
                .count();

        long onTimeMissions = contracts.stream()
                .filter(c -> "COMPLETED".equalsIgnoreCase(c.getStatus()))
                .filter(c -> {
                    if (c.getCompletedAt() == null || c.getDeadline() == null) return true;
                    return !c.getCompletedAt().isAfter(c.getDeadline());
                })
                .count();

        long lateMissions = contracts.stream()
                .filter(c -> {
                    if ("COMPLETED".equalsIgnoreCase(c.getStatus()) && c.getCompletedAt() != null && c.getDeadline() != null) {
                        return c.getCompletedAt().isAfter(c.getDeadline());
                    }
                    if ("ACTIVE".equalsIgnoreCase(c.getStatus()) && c.getDeadline() != null) {
                        return LocalDateTime.now().isAfter(c.getDeadline());
                    }
                    return false;
                })
                .count();

        long expiredMissions = contracts.stream()
                .filter(c -> "EXPIRED".equalsIgnoreCase(c.getStatus()) || ("CANCELLED".equalsIgnoreCase(c.getStatus()) && "REFUNDED".equalsIgnoreCase(c.getEscrowStatus())))
                .count();

        double completionRate = totalMissions > 0 ? Math.round((completedMissions * 100.0 / totalMissions) * 10.0) / 10.0 : 100.0;
        double onTimeRate = completedMissions > 0 ? Math.round((onTimeMissions * 100.0 / completedMissions) * 10.0) / 10.0 : 100.0;

        // Durée moyenne de réalisation en jours
        double avgCompletionDays = 0.0;
        List<ContractEntity> completedWithDates = contracts.stream()
                .filter(c -> "COMPLETED".equalsIgnoreCase(c.getStatus()) && c.getCreatedAt() != null && c.getCompletedAt() != null)
                .toList();
        if (!completedWithDates.isEmpty()) {
            double totalHours = completedWithDates.stream()
                    .mapToDouble(c -> Math.max(1, Duration.between(c.getCreatedAt(), c.getCompletedAt()).toHours()))
                    .sum();
            avgCompletionDays = Math.round((totalHours / (completedWithDates.size() * 24.0)) * 10.0) / 10.0;
        }

        // Avis et note moyenne réels
        double avgRating = 5.0;
        long totalReviews = 0;
        try {
            var reviews = reviewRepository.findByTargetUserIdOrderByCreatedAtDesc(creatorId);
            totalReviews = reviews.size();
            if (totalReviews > 0) {
                avgRating = Math.round(reviews.stream().mapToDouble(r -> r.getRating() != null ? r.getRating() : 5.0).average().orElse(5.0) * 10.0) / 10.0;
            }
        } catch (Exception ignored) {}

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMissions", totalMissions);
        stats.put("completedMissions", completedMissions);
        stats.put("onTimeMissions", onTimeMissions);
        stats.put("lateMissions", lateMissions);
        stats.put("expiredMissions", expiredMissions);
        stats.put("completionRate", completionRate);
        stats.put("onTimeRate", onTimeRate);
        stats.put("avgCompletionDays", avgCompletionDays);
        stats.put("avgRating", avgRating);
        stats.put("totalReviews", totalReviews);

        return stats;
    }
}
