package com.feedbackai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {
    private Long id;
    private Long productId;
    private String productName;
    private String externalId;
    private String authorName;
    private String content;
    private Integer rating;
    private String platform;
    private LocalDateTime reviewedAt;
    private LocalDateTime syncedAt;
    private List<ReviewAspectDto> aspects;
}
