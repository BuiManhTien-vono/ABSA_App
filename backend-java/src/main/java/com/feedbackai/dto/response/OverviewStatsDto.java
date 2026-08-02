package com.feedbackai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverviewStatsDto {
    private long shops;
    private long products;
    private long totalReviews;
    private long unreadAlerts;
}
