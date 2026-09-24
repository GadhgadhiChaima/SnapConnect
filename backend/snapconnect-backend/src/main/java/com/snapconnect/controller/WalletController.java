package com.snapconnect.controller;

import com.snapconnect.model.TransactionEntity;
import com.snapconnect.model.WalletEntity;
import com.snapconnect.repository.TransactionRepository;
import com.snapconnect.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class WalletController {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final com.snapconnect.repository.UserRepository userRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<WalletEntity> getWalletByUser(@PathVariable Long userId) {
        WalletEntity wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> walletRepository.save(WalletEntity.builder().userId(userId).availableBalance(0.0).build()));
        return ResponseEntity.ok(wallet);
    }

    @GetMapping("/user/{userId}/transactions")
    public ResponseEntity<List<TransactionEntity>> getTransactionsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(transactionRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @PostMapping("/user/{userId}/withdraw")
    public ResponseEntity<?> requestWithdrawal(
            @PathVariable Long userId,
            @RequestBody Map<String, Double> body) {
        var userOpt = userRepository.findById(userId);
        if (userOpt.isPresent() && userOpt.get().isCurrentlySuspended()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Votre compte est actuellement suspendu. Action impossible."));
        }

        Double amount = body.get("amount");
        if (amount == null || amount <= 0) {
            return ResponseEntity.badRequest().build();
        }

        WalletEntity wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> walletRepository.save(WalletEntity.builder().userId(userId).availableBalance(0.0).build()));

        if (wallet.getAvailableBalance() < amount) {
            return ResponseEntity.badRequest().build();
        }

        wallet.setAvailableBalance(wallet.getAvailableBalance() - amount);
        walletRepository.save(wallet);

        TransactionEntity tx = TransactionEntity.builder()
                .walletId(wallet.getId())
                .userId(userId)
                .type("WITHDRAWAL")
                .amount(-amount)
                .description("Withdrawal request via Bank Transfer / SEPA / Stripe")
                .status("COMPLETED")
                .build();
        return ResponseEntity.ok(transactionRepository.save(tx));
    }
}
