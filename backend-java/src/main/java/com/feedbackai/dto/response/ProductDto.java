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
public class ProductDto {
    private Long id;
    private Long shopId;
    private String shopName;
    private String platform;
    private String externalId;
    private String name;
    private String category;
    private String imageUrl;
    private LocalDateTime createdAt;
    private long reviewCount;
    private long positiveCount;
    private long neutralCount;
    private long negativeCount;
}
