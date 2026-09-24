package com.snapconnect.repository;

import com.snapconnect.model.Role;
import com.snapconnect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByRoleOrderByIdDesc(Role role);
    long countByRole(Role role);
    List<User> findAllByOrderByIdDesc();
}
