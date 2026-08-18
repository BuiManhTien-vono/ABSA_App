package com.feedbackai.notification;

import com.feedbackai.dto.response.AlertDto;
import com.feedbackai.dto.response.ReviewDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void pushNewAlert(AlertDto alert) {
        log.debug("Pushing alert notification: {}", alert.getType());
        messagingTemplate.convertAndSend("/topic/alerts", alert);
    }

    public void pushNewReview(ReviewDto review) {
        log.debug("Pushing review notification for product: {}", review.getProductName());
        messagingTemplate.convertAndSend("/topic/reviews", review);
    }
}
