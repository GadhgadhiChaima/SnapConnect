package com.snapconnect.repository;

import com.snapconnect.model.GigService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GigServiceRepository extends JpaRepository<GigService, Long> {
    List<GigService> findByCreatorIdOrderByCreatedAtDesc(Long creatorId);
    List<GigService> findByStatusOrderByRatingDesc(String status);
    List<GigService> findByCategoryNameAndStatusOrderByRatingDesc(String categoryName, String status);
}
