package com.feedbackai.repository;

import com.feedbackai.entity.ReviewAspect;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReviewAspectRepository extends JpaRepository<ReviewAspect, Long> {

    List<ReviewAspect> findByReviewId(Long reviewId);

    @Query("SELECT ra.aspect AS aspect, ra.sentiment AS sentiment, COUNT(ra) AS cnt " +
           "FROM ReviewAspect ra JOIN ra.review r " +
           "WHERE r.product.id = :productId " +
           "GROUP BY ra.aspect, ra.sentiment " +
           "ORDER BY cnt DESC")
    List<Object[]> findTopAspectsByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(ra) FROM ReviewAspect ra " +
           "JOIN ra.review r " +
           "WHERE r.product.id = :productId " +
           "AND ra.sentiment = 'negative' " +
           "AND ra.createdAt >= :since")
    long countNegativeAspectsSince(@Param("productId") Long productId,
                                   @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(ra) FROM ReviewAspect ra " +
           "JOIN ra.review r " +
           "WHERE r.product.id = :productId " +
           "AND ra.createdAt >= :since")
    long countAllAspectsSince(@Param("productId") Long productId,
                              @Param("since") LocalDateTime since);
}
