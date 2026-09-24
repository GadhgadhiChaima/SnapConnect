package com.snapconnect.repository;

import com.snapconnect.model.DisputeMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DisputeMessageRepository extends JpaRepository<DisputeMessageEntity, Long> {
    List<DisputeMessageEntity> findByDisputeIdOrderByCreatedAtAsc(Long disputeId);
    List<DisputeMessageEntity> findByDisputeIdOrderByCreatedAtDesc(Long disputeId);
    long countByDisputeId(Long disputeId);
}
