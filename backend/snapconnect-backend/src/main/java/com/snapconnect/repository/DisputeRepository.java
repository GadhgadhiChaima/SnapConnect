package com.snapconnect.repository;

import com.snapconnect.model.DisputeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DisputeRepository extends JpaRepository<DisputeEntity, Long> {
    List<DisputeEntity> findByContractId(Long contractId);
    List<DisputeEntity> findByContractIdOrderByCreatedAtDesc(Long contractId);
    Optional<DisputeEntity> findFirstByContractIdOrderByIdDesc(Long contractId);
    List<DisputeEntity> findByOpenedByUserId(Long userId);
    List<DisputeEntity> findByRespondentId(Long respondentId);
    List<DisputeEntity> findByOpenedByUserIdOrRespondentIdOrderByCreatedAtDesc(Long openedByUserId, Long respondentId);
    List<DisputeEntity> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
}
