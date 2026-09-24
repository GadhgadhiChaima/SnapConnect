package com.snapconnect.repository;

import com.snapconnect.model.ReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, Long> {
    List<ReviewEntity> findByTargetUserIdOrderByCreatedAtDesc(Long targetUserId);
    List<ReviewEntity> findByContractId(Long contractId);
}
