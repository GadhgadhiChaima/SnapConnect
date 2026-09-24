package com.snapconnect.controller;

import com.snapconnect.model.JobPost;
import com.snapconnect.model.Proposal;
import com.snapconnect.repository.JobPostRepository;
import com.snapconnect.repository.ProposalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proposals")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ProposalController {

    private final ProposalRepository proposalRepository;
    private final JobPostRepository jobPostRepository;
    private final com.snapconnect.repository.ContractRepository contractRepository;
    private final com.snapconnect.service.ContractLifecycleService lifecycleService;
    private final com.snapconnect.service.NotificationService notificationService;
    private final com.snapconnect.repository.UserRepository userRepository;

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<Proposal>> getProposalsByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(proposalRepository.findByJobIdOrderByCreatedAtDesc(jobId));
    }

    @GetMapping("/creator/{creatorId}")
    public ResponseEntity<List<Proposal>> getProposalsByCreator(@PathVariable Long creatorId) {
        return ResponseEntity.ok(proposalRepository.findByCreatorIdOrderByCreatedAtDesc(creatorId));
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> hasCreatorApplied(@RequestParam Long jobId, @RequestParam Long creatorId) {
        return ResponseEntity.ok(proposalRepository.existsByJobIdAndCreatorId(jobId, creatorId));
    }

    @PostMapping
    public ResponseEntity<?> submitProposal(@RequestBody Proposal proposal) {
        if (proposal.getCreatorId() != null) {
            var userOpt = userRepository.findById(proposal.getCreatorId());
            if (userOpt.isPresent() && userOpt.get().isCurrentlySuspended()) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                        .body("Votre compte est actuellement suspendu. Action impossible.");
            }
        }

        if (proposal.getJobId() != null && proposal.getCreatorId() != null) {
            if (proposalRepository.existsByJobIdAndCreatorId(proposal.getJobId(), proposal.getCreatorId())) {
                return ResponseEntity.badRequest().body("Vous avez déjà soumis une proposition pour cette mission.");
            }
        }
        Proposal saved = proposalRepository.save(proposal);
        // Increment job proposal count and notify client
        jobPostRepository.findById(proposal.getJobId()).ifPresent(job -> {
            job.setProposalsCount((job.getProposalsCount() == null ? 0 : job.getProposalsCount()) + 1);
            jobPostRepository.save(job);

            notificationService.notifyUser(
                    job.getClientId(),
                    "NEW_PROPOSAL",
                    "Nouvelle proposition pour votre brief",
                    (proposal.getCreatorName() != null ? proposal.getCreatorName() : "Un créateur") + " a déposé une offre de " + proposal.getBidAmount() + " DT pour « " + job.getTitle() + " ».",
                    "/client/jobs/" + job.getId() + "/proposals"
            );
        });
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<?> acceptProposal(@PathVariable Long id) {
        return proposalRepository.findById(id).map(p -> {
            com.snapconnect.model.JobPost job = p.getJobId() != null ? jobPostRepository.findById(p.getJobId()).orElse(null) : null;
            if (job != null && job.getClientId() != null) {
                var userOpt = userRepository.findById(job.getClientId());
                if (userOpt.isPresent() && userOpt.get().isCurrentlySuspended()) {
                    return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                            .body("Votre compte est actuellement suspendu. Action impossible.");
                }
            }

            p.setStatus("ACCEPTED");
            Proposal saved = proposalRepository.save(p);

            // Création / Récupération idempotente du contrat en base MySQL
            com.snapconnect.model.ContractEntity contract = contractRepository.findByProposalId(p.getId())
                    .orElseGet(() -> {
                        int days = (p.getDeliveryDays() != null && p.getDeliveryDays() > 0) ? p.getDeliveryDays() : 7;
                        java.time.LocalDateTime start = java.time.LocalDateTime.now();
                        com.snapconnect.model.ContractEntity c = com.snapconnect.model.ContractEntity.builder()
                                .proposalId(p.getId())
                                .jobId(p.getJobId())
                                .jobTitle(job != null ? job.getTitle() : "Mission #" + p.getJobId())
                                .clientId(job != null ? job.getClientId() : 1L)
                                .clientName(job != null ? job.getClientName() : "Client Actuel")
                                .clientAvatar(job != null ? job.getClientAvatar() : null)
                                .creatorId(p.getCreatorId())
                                .creatorName(p.getCreatorName() != null ? p.getCreatorName() : "Créateur Mobile")
                                .creatorAvatar(p.getCreatorAvatar())
                                .title(job != null ? job.getTitle() : "Tournage Smartphone 4K ProRes")
                                .description(p.getCoverLetter() != null ? p.getCoverLetter() : "Production de contenus 4K certifiés.")
                                .amount(p.getBidAmount() != null ? p.getBidAmount() : 250.0)
                                .status("ACTIVE")
                                .escrowStatus("SECURED")
                                .startDate(start)
                                .deadline(start.plusDays(days))
                                .revisionsAllowed(2)
                                .revisionsUsed(0)
                                .build();
                        com.snapconnect.model.ContractEntity pers = contractRepository.save(c);
                        lifecycleService.logActivity(pers.getId(), p.getCreatorId(), pers.getCreatorName(), "CREATOR", "CONTRACT_CREATED",
                                "Contrat généré suite à acceptation de proposition. Date limite : " + pers.getDeadline());
                        return pers;
                    });

            // Notify Creator (aucun émoji)
            notificationService.notifyUser(
                    p.getCreatorId(),
                    "PROPOSAL_ACCEPTED",
                    "Votre candidature a été acceptée",
                    "Le client a validé votre offre pour « " + (job != null ? job.getTitle() : "la mission") + " ». Le contrat #" + contract.getId() + " est actif avec garantie séquestre.",
                    "/creator/contracts/" + contract.getId()
            );

            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Proposal> rejectProposal(@PathVariable Long id) {
        return proposalRepository.findById(id).map(p -> {
            p.setStatus("REJECTED");
            Proposal saved = proposalRepository.save(p);

            // Notify Creator
            notificationService.notifyUser(
                    p.getCreatorId(),
                    "PROPOSAL_REJECTED",
                    "Mise à jour concernant votre proposition",
                    "Le client a sélectionné un autre profil pour cette mission. D'autres briefs smartphone sont disponibles !",
                    "/jobs"
            );

            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
}
