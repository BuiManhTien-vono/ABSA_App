package com.feedbackai.service.oauth;

import com.feedbackai.dto.response.OAuthTokenResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@Slf4j
@Component
public class LazadaOAuthHandler implements OAuthHandler {

    private final RestTemplate restTemplate;

    @Value("${oauth.lazada.client-id}")
    private String clientId;

    @Value("${oauth.lazada.client-secret}")
    private String clientSecret;

    @Value("${oauth.lazada.redirect-uri}")
    private String redirectUri;

    @Value("${oauth.lazada.authorize-url}")
    private String authorizeUrl;

    @Value("${oauth.lazada.token-url}")
    private String tokenUrl;

    public LazadaOAuthHandler(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String getPlatformName() {
        return "lazada";
    }

    @Override
    public String getAuthorizeUrl(String state) {
        return UriComponentsBuilder.fromHttpUrl(authorizeUrl)
                .queryParam("response_type", "code")
                .queryParam("redirect_uri", redirectUri)
                .queryParam("client_id", clientId)
                .queryParam("state", state)
                .build()
                .toUriString();
    }

    @Override
    public OAuthTokenResponse exchangeCodeForToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);
        body.add("app_key", clientId);
        body.add("app_secret", clientSecret);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    tokenUrl, HttpMethod.POST,
                    new HttpEntity<>(body, headers), Map.class);

            Map<?, ?> data = response.getBody();
            if (data == null) throw new RuntimeException("Empty response from Lazada");

            return OAuthTokenResponse.builder()
                    .accessToken(String.valueOf(data.get("access_token")))
                    .refreshToken(String.valueOf(data.get("refresh_token")))
                    .expiresIn(data.get("expires_in") != null ?
                            ((Number) data.get("expires_in")).longValue() : 0L)
                    .shopName(String.valueOf(data.getOrDefault("account", "Lazada Shop")))
                    .shopId(String.valueOf(data.getOrDefault("country_user_info", "")))
                    .build();
        } catch (Exception e) {
            log.error("Lazada token exchange failed", e);
            throw new RuntimeException("Failed to exchange Lazada authorization code: " + e.getMessage());
        }
    }
}
