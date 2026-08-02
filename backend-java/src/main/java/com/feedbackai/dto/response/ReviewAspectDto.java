package com.feedbackai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewAspectDto {
    private Long id;
    private String aspect;
    private String sentiment;
    private Double confidenceScore;
}
