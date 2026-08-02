package com.feedbackai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertDto {
    private Long id;
    private Long productId;
    private String productName;
    private String type;
    private String message;
    private String severity;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
