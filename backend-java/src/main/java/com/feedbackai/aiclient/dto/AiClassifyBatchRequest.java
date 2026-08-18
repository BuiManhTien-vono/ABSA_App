package com.feedbackai.aiclient.dto;

import java.util.List;

public record AiClassifyBatchRequest(List<AiClassifyRequest> items) {
}
