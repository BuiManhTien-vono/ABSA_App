package com.feedbackai.repository;

import com.feedbackai.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByProductId(Long productId, Pageable pageable);

    @Query("SELECT r FROM Review r ORDER BY r.syncedAt DESC")
    Page<Review> findLatest(Pageable pageable);

    @Query("SELECT r FROM Review r LEFT JOIN r.aspects a WHERE a.id IS NULL")
    List<Review> findUnclassifiedReviews();

    @Query("SELECT r FROM Review r WHERE r.product.shop.user.id = :userId ORDER BY r.syncedAt DESC")
    Page<Review> findByUserId(@Param("userId") Long userId, Pageable pageable);
}
