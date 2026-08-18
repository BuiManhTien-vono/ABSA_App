package com.feedbackai.aiclient;

import com.feedbackai.aiclient.dto.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Slf4j
@Component
public class AiServiceClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String internalToken;

    public AiServiceClient(
            RestTemplate restTemplate,
            @Value("${ai-service.base-url}") String baseUrl,
            @Value("${ai-service.internal-token}") String internalToken) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
        this.internalToken = internalToken;
    }

    public AiClassifyResponse classify(Long reviewId, String content) {
        AiClassifyRequest request = new AiClassifyRequest(reviewId, content);

        HttpHeaders headers = createHeaders();
        HttpEntity<AiClassifyRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<AiClassifyResponse> response = restTemplate.exchange(
                    baseUrl + "/internal/classify",
                    HttpMethod.POST,
                    entity,
                    AiClassifyResponse.class);

            return response.getBody();
        } catch (Exception e) {
            log.error("AI classify failed for reviewId={}: {}", reviewId, e.getMessage());
            throw new RuntimeException("AI service classify failed: " + e.getMessage(), e);
        }
    }

    public AiClassifyBatchResponse classifyBatch(List<AiClassifyRequest> items) {
        AiClassifyBatchRequest request = new AiClassifyBatchRequest(items);

        HttpHeaders headers = createHeaders();
        HttpEntity<AiClassifyBatchRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<AiClassifyBatchResponse> response = restTemplate.exchange(
                    baseUrl + "/internal/classify-batch",
                    HttpMethod.POST,
                    entity,
                    AiClassifyBatchResponse.class);

            return response.getBody();
        } catch (Exception e) {
            log.error("AI classify-batch failed: {}", e.getMessage());
            throw new RuntimeException("AI service classify-batch failed: " + e.getMessage(), e);
        }
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Internal-Token", internalToken);
        return headers;
    }
}
