package com.feedbackai.aiclient.dto;

import java.util.List;

public record AiClassifyBatchResponse(List<AiClassifyResponse> results) {
}
