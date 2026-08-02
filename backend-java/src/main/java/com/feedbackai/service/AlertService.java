package com.feedbackai.service;

import com.feedbackai.dto.response.AlertDto;
import com.feedbackai.entity.Alert;
import com.feedbackai.entity.Product;
import com.feedbackai.repository.AlertRepository;
import com.feedbackai.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final ProductRepository productRepository;

    public Page<AlertDto> getAlertsByUser(Long userId, Pageable pageable) {
        return alertRepository.findByUserId(userId, pageable).map(this::toDto);
    }

    public List<AlertDto> getAlertsByProduct(Long productId) {
        return alertRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public AlertDto markAsRead(Long alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new EntityNotFoundException("Alert not found: " + alertId));
        alert.setIsRead(true);
        return toDto(alertRepository.save(alert));
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Alert> alerts = alertRepository.findByUserId(userId, Pageable.unpaged()).getContent();
        alerts.forEach(a -> a.setIsRead(true));
        alertRepository.saveAll(alerts);
    }

    @Transactional
    public Alert createAlert(Long productId, String type, String message, String severity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + productId));

        Alert alert = Alert.builder()
                .product(product)
                .type(type)
                .message(message)
                .severity(severity)
                .build();

        return alertRepository.save(alert);
    }

    public long countUnread(Long userId) {
        return alertRepository.countUnreadByUserId(userId);
    }

    private AlertDto toDto(Alert a) {
        return AlertDto.builder()
                .id(a.getId())
                .productId(a.getProduct().getId())
                .productName(a.getProduct().getName())
                .type(a.getType())
                .message(a.getMessage())
                .severity(a.getSeverity())
                .isRead(a.getIsRead())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
