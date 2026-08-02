package com.feedbackai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopAspectDto {
    private String aspect;
    private Long count;
    private String sentiment;
}
