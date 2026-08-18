package com.feedbackai.aiclient.dto;

import java.util.List;

public record AiClassifyResponse(Long reviewId, List<AiAspectResult> aspects) {
}
