package com.feedbackai.controller;

import com.feedbackai.common.ApiResponse;
import com.feedbackai.dto.response.OverviewStatsDto;
import com.feedbackai.entity.User;
import com.feedbackai.service.OverviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class OverviewController {

    private final OverviewService overviewService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardOverview(
            @AuthenticationPrincipal User user) {
        OverviewStatsDto stats = overviewService.getDashboardStats(user.getId());
        List<Map<String, Object>> trend = overviewService.getSentimentTrend(user.getId());
        List<Map<String, Object>> share = overviewService.getPlatformShare(user.getId());

        Map<String, Object> data = Map.of(
                "stats", stats,
                "trend", trend,
                "platformShare", share
        );
        return ResponseEntity.ok(ApiResponse.ok(data));
    }
}
