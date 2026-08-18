package com.feedbackai.controller;

import com.feedbackai.common.ApiResponse;
import com.feedbackai.dto.response.ReviewDto;
import com.feedbackai.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/api/products/{productId}/reviews")
    public ResponseEntity<ApiResponse<Page<ReviewDto>>> getReviewsByProduct(
            @PathVariable Long productId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                reviewService.getReviewsByProduct(productId, pageable)));
    }

    @GetMapping("/api/reviews/latest")
    public ResponseEntity<ApiResponse<Page<ReviewDto>>> getLatestReviews(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                reviewService.getLatestReviews(pageable)));
    }

    @GetMapping("/api/reviews/{id}")
    public ResponseEntity<ApiResponse<ReviewDto>> getReview(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getReviewById(id)));
    }
}
