package com.feedbackai.dto.request;

import lombok.Data;

import java.util.Map;

@Data
public class ReportGenerateReq {
    private String title;
    private String type;
    private Map<String, Object> parameters;
}
