package com.feedbackai.service.oauth;

import com.feedbackai.dto.response.OAuthTokenResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@Slf4j
@Component
public class ShopeeOAuthHandler implements OAuthHandler {

    private final RestTemplate restTemplate;

    @Value("${oauth.shopee.client-id}")
    private String clientId;

    @Value("${oauth.shopee.client-secret}")
    private String clientSecret;

    @Value("${oauth.shopee.redirect-uri}")
    private String redirectUri;

    @Value("${oauth.shopee.authorize-url}")
    private String authorizeUrl;

    @Value("${oauth.shopee.token-url}")
    private String tokenUrl;

    public ShopeeOAuthHandler(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String getPlatformName() {
        return "shopee";
    }

    @Override
    public String getAuthorizeUrl(String state) {
        return UriComponentsBuilder.fromHttpUrl(authorizeUrl)
                .queryParam("partner_id", clientId)
                .queryParam("redirect", redirectUri)
                .queryParam("state", state)
                .build()
                .toUriString();
    }

    @Override
    public OAuthTokenResponse exchangeCodeForToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "code", code,
                "partner_id", Long.parseLong(clientId.isEmpty() ? "0" : clientId),
                "partner_key", clientSecret
        );

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    tokenUrl, HttpMethod.POST,
                    new HttpEntity<>(body, headers), Map.class);

            Map<?, ?> data = response.getBody();
            if (data == null) throw new RuntimeException("Empty response from Shopee");

            return OAuthTokenResponse.builder()
                    .accessToken(String.valueOf(data.get("access_token")))
                    .refreshToken(String.valueOf(data.get("refresh_token")))
                    .expiresIn(data.get("expire_in") != null ?
                            ((Number) data.get("expire_in")).longValue() : 0L)
                    .shopName(String.valueOf(data.getOrDefault("shop_name", "Shopee Shop")))
                    .shopId(String.valueOf(data.getOrDefault("shop_id", "")))
                    .build();
        } catch (Exception e) {
            log.error("Shopee token exchange failed", e);
            throw new RuntimeException("Failed to exchange Shopee authorization code: " + e.getMessage());
        }
    }
}
