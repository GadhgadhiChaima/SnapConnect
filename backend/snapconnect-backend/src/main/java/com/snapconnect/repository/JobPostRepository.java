package com.snapconnect.repository;

import com.snapconnect.model.JobPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobPostRepository extends JpaRepository<JobPost, Long> {
    List<JobPost> findByClientIdOrderByCreatedAtDesc(Long clientId);
    List<JobPost> findByStatusOrderByCreatedAtDesc(String status);
    List<JobPost> findByCategoryNameAndStatusOrderByCreatedAtDesc(String categoryName, String status);
}
