package com.snapconnect.repository;

import com.snapconnect.model.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {
    List<TransactionEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<TransactionEntity> findByWalletIdOrderByCreatedAtDesc(Long walletId);
}
