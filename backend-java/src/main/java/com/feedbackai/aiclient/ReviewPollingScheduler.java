package com.feedbackai.aiclient;

import com.feedbackai.aiclient.dto.AiAspectResult;
import com.feedbackai.aiclient.dto.AiClassifyBatchResponse;
import com.feedbackai.aiclient.dto.AiClassifyRequest;
import com.feedbackai.aiclient.dto.AiClassifyResponse;
import com.feedbackai.dto.response.AlertDto;
import com.feedbackai.entity.Alert;
import com.feedbackai.entity.Review;
import com.feedbackai.entity.ReviewAspect;
import com.feedbackai.notification.NotificationService;
import com.feedbackai.repository.ReviewAspectRepository;
import com.feedbackai.service.AlertService;
import com.feedbackai.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReviewPollingScheduler {

    private final ReviewService reviewService;
    private final AiServiceClient aiServiceClient;
    private final ReviewAspectRepository reviewAspectRepository;
    private final AlertService alertService;
    private final NotificationService notificationService;

    @Value("${polling.negative-spike-threshold:0.4}")
    private double negativeSpikeThreshold;

    @Scheduled(fixedRateString = "${polling.interval-ms:300000}")
    @Transactional
    public void pollAndClassifyReviews() {
        List<Review> unclassified = reviewService.findUnclassifiedReviews();
        if (unclassified.isEmpty()) {
            log.debug("No unclassified reviews found");
            return;
        }

        log.info("Found {} unclassified reviews, sending to AI service", unclassified.size());

        List<AiClassifyRequest> items = unclassified.stream()
                .map(r -> new AiClassifyRequest(r.getId(), r.getContent()))
                .toList();

        try {
            AiClassifyBatchResponse batchResponse = aiServiceClient.classifyBatch(items);

            if (batchResponse == null || batchResponse.results() == null) {
                log.warn("Empty response from AI service");
                return;
            }

            for (AiClassifyResponse result : batchResponse.results()) {
                List<ReviewAspect> aspects = new ArrayList<>();
                for (AiAspectResult ar : result.aspects()) {
                    aspects.add(ReviewAspect.builder()
                            .aspect(ar.aspect())
                            .sentiment(ar.sentiment())
                            .confidenceScore(ar.confidenceScore() != null ? ar.confidenceScore() : 0.0)
                            .build());
                }
                reviewService.saveAspects(result.reviewId(), aspects);
            }

            log.info("Classified {} reviews successfully", batchResponse.results().size());

            checkNegativeSpikes(unclassified);

        } catch (Exception e) {
            log.error("Failed to classify reviews: {}", e.getMessage(), e);
        }
    }

    private void checkNegativeSpikes(List<Review> classifiedReviews) {
        Map<Long, List<Review>> byProduct = classifiedReviews.stream()
                .collect(Collectors.groupingBy(r -> r.getProduct().getId()));

        LocalDateTime since = LocalDateTime.now().minusHours(1);

        for (Map.Entry<Long, List<Review>> entry : byProduct.entrySet()) {
            Long productId = entry.getKey();
            String productName = entry.getValue().get(0).getProduct().getName();

            long totalAspects = reviewAspectRepository.countAllAspectsSince(productId, since);
            long negativeAspects = reviewAspectRepository.countNegativeAspectsSince(productId, since);

            if (totalAspects > 0) {
                double negativeRatio = (double) negativeAspects / totalAspects;
                if (negativeRatio >= negativeSpikeThreshold) {
                    String message = String.format(
                            "Negative aspect spike detected for \"%s\": %.0f%% negative aspects (%d/%d) in the last hour",
                            productName, negativeRatio * 100, negativeAspects, totalAspects);

                    Alert alert = alertService.createAlert(
                            productId,
                            "NEGATIVE_SPIKE",
                            message,
                            negativeRatio >= 0.6 ? "CRITICAL" : "WARNING");

                    notificationService.pushNewAlert(AlertDto.builder()
                            .id(alert.getId())
                            .productId(productId)
                            .productName(productName)
                            .type(alert.getType())
                            .message(alert.getMessage())
                            .severity(alert.getSeverity())
                            .isRead(false)
                            .createdAt(alert.getCreatedAt())
                            .build());

                    log.warn("ALERT: {}", message);
                }
            }
        }
    }
}
