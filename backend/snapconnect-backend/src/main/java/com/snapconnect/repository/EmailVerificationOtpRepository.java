package com.snapconnect.repository;

import com.snapconnect.model.EmailVerificationOtp;
import com.snapconnect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationOtpRepository extends JpaRepository<EmailVerificationOtp, Long> {

    Optional<EmailVerificationOtp> findTopByUserAndCodeAndUsedFalse(User user, String code);

    Optional<EmailVerificationOtp> findTopByUserAndUsedFalseOrderByCreatedAtDesc(User user);

    void deleteByUser(User user);
}
