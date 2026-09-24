package com.snapconnect.repository;

import com.snapconnect.model.ContractEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<ContractEntity, Long> {
    List<ContractEntity> findByClientIdOrderByCreatedAtDesc(Long clientId);
    List<ContractEntity> findByCreatorIdOrderByCreatedAtDesc(Long creatorId);
    Optional<ContractEntity> findByProposalId(Long proposalId);
    boolean existsByProposalId(Long proposalId);
    List<ContractEntity> findByStatusAndDeadlineBefore(String status, LocalDateTime time);
    List<ContractEntity> findByStatusAndReviewDeadlineBefore(String status, LocalDateTime time);
}

