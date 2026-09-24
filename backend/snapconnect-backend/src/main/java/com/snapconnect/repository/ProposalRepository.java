package com.snapconnect.repository;

import com.snapconnect.model.Proposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProposalRepository extends JpaRepository<Proposal, Long> {
    List<Proposal> findByJobIdOrderByCreatedAtDesc(Long jobId);
    List<Proposal> findByCreatorIdOrderByCreatedAtDesc(Long creatorId);
    boolean existsByJobIdAndCreatorId(Long jobId, Long creatorId);
}
