package com.snapconnect.repository;

import com.snapconnect.model.ContractActivityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContractActivityRepository extends JpaRepository<ContractActivityEntity, Long> {
    List<ContractActivityEntity> findByContractIdOrderByCreatedAtDesc(Long contractId);
    List<ContractActivityEntity> findByContractIdOrderByCreatedAtAsc(Long contractId);
    List<ContractActivityEntity> findAllByOrderByCreatedAtDesc();
    List<ContractActivityEntity> findTop15ByOrderByCreatedAtDesc();
}
