package com.snapconnect.repository;

import com.snapconnect.model.UserSanctionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSanctionRepository extends JpaRepository<UserSanctionEntity, Long> {
    List<UserSanctionEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<UserSanctionEntity> findByDisputeId(Long disputeId);
    List<UserSanctionEntity> findByStatus(String status);
    Optional<UserSanctionEntity> findFirstByUserIdAndStatus(Long userId, String status);
    List<UserSanctionEntity> findAllByOrderByCreatedAtDesc();
}
