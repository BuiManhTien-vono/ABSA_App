package com.feedbackai.service;

import com.feedbackai.dto.response.OverviewStatsDto;
import com.feedbackai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OverviewService {

    private final ShopRepository shopRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final AlertRepository alertRepository;

    public OverviewStatsDto getDashboardStats(Long userId) {
        long shopCount = shopRepository.findByUserId(userId).size();
        long productCount = productRepository.findByShopUserId(userId).size();
        long reviewCount = reviewRepository.findByUserId(userId, PageRequest.of(0, 1)).getTotalElements();
        long unreadAlerts = alertRepository.countUnreadByUserId(userId);

        return OverviewStatsDto.builder()
                .shops(shopCount)
                .products(productCount)
                .totalReviews(reviewCount)
                .unreadAlerts(unreadAlerts)
                .build();
    }

    public List<Map<String, Object>> getSentimentTrend(Long userId) {
        return List.of(
                Map.of("date", "08/07", "positive", 320, "neutral", 88, "negative", 42),
                Map.of("date", "09/07", "positive", 298, "neutral", 92, "negative", 55),
                Map.of("date", "10/07", "positive", 410, "neutral", 75, "negative", 38),
                Map.of("date", "11/07", "positive", 385, "neutral", 110, "negative", 61),
                Map.of("date", "12/07", "positive", 452, "neutral", 98, "negative", 48)
        );
    }

    public List<Map<String, Object>> getPlatformShare(Long userId) {
        return List.of(
                Map.of("platform", "Shopee", "count", 450),
                Map.of("platform", "Lazada", "count", 300),
                Map.of("platform", "TikTok", "count", 250)
        );
    }
}
