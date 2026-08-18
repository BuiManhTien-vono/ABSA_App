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
public class TikTokOAuthHandler implements OAuthHandler {

    private final RestTemplate restTemplate;

    @Value("${oauth.tiktok.client-id}")
    private String clientId;

    @Value("${oauth.tiktok.client-secret}")
    private String clientSecret;

    @Value("${oauth.tiktok.redirect-uri}")
    private String redirectUri;

    @Value("${oauth.tiktok.authorize-url}")
    private String authorizeUrl;

    @Value("${oauth.tiktok.token-url}")
    private String tokenUrl;

    public TikTokOAuthHandler(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String getPlatformName() {
        return "tiktok";
    }

    @Override
    public String getAuthorizeUrl(String state) {
        return UriComponentsBuilder.fromHttpUrl(authorizeUrl)
                .queryParam("app_key", clientId)
                .queryParam("state", state)
                .build()
                .toUriString();
    }

    @Override
    public OAuthTokenResponse exchangeCodeForToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "app_key", clientId,
                "app_secret", clientSecret,
                "auth_code", code,
                "grant_type", "authorized_code"
        );

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    tokenUrl, HttpMethod.POST,
                    new HttpEntity<>(body, headers), Map.class);

            Map<?, ?> wrapper = response.getBody();
            if (wrapper == null) throw new RuntimeException("Empty response from TikTok");

            @SuppressWarnings("unchecked")
            Map<?, ?> data = (Map<?, ?>) wrapper.getOrDefault("data", wrapper);

            return OAuthTokenResponse.builder()
                    .accessToken(String.valueOf(data.get("access_token")))
                    .refreshToken(String.valueOf(data.get("refresh_token")))
                    .expiresIn(data.get("access_token_expire_in") != null ?
                            ((Number) data.get("access_token_expire_in")).longValue() : 0L)
                    .shopName(String.valueOf(data.getOrDefault("seller_name", "TikTok Shop")))
                    .shopId(String.valueOf(data.getOrDefault("open_id", "")))
                    .build();
        } catch (Exception e) {
            log.error("TikTok token exchange failed", e);
            throw new RuntimeException("Failed to exchange TikTok authorization code: " + e.getMessage());
        }
    }
}
