package com.feedbackai.controller;

import com.feedbackai.common.ApiResponse;
import com.feedbackai.dto.response.AlertDto;
import com.feedbackai.entity.User;
import com.feedbackai.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AlertDto>>> getUserAlerts(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                alertService.getAlertsByUser(user.getId(), pageable)));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<AlertDto>>> getProductAlerts(
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(
                alertService.getAlertsByProduct(productId)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<AlertDto>> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(alertService.markAsRead(id)));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal User user) {
        alertService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(null, "All alerts marked as read"));
    }
}
