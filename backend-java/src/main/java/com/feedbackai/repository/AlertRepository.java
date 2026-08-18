package com.feedbackai.repository;

import com.feedbackai.entity.Alert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByProductIdOrderByCreatedAtDesc(Long productId);

    @Query("SELECT a FROM Alert a WHERE a.product.shop.user.id = :userId ORDER BY a.createdAt DESC")
    Page<Alert> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COUNT(a) FROM Alert a WHERE a.product.shop.user.id = :userId AND a.isRead = false")
    long countUnreadByUserId(@Param("userId") Long userId);
}
