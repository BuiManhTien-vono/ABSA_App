package com.feedbackai.repository;

import com.feedbackai.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShopRepository extends JpaRepository<Shop, Long> {
    List<Shop> findByUserId(Long userId);
    List<Shop> findByStatus(String status);
}
