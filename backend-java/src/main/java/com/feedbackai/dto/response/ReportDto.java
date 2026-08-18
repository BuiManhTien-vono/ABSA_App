package com.feedbackai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDto {
    private Long id;
    private String title;
    private String type;
    private String status;
    private String fileUrl;
    private Map<String, Object> parameters;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
