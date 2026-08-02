package com.feedbackai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ShopConnectReq {
    @NotBlank
    private String platform;
    private String shopName;
}
