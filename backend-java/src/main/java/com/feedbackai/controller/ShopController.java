package com.feedbackai.controller;

import com.feedbackai.common.ApiResponse;
import com.feedbackai.dto.response.OAuthTokenResponse;
import com.feedbackai.dto.response.ShopDto;
import com.feedbackai.entity.User;
import com.feedbackai.service.ShopService;
import com.feedbackai.service.oauth.OAuthHandlerFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;
    private final OAuthHandlerFactory oAuthHandlerFactory;

    @Value("${frontend.url}")
    private String frontendUrl;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShopDto>>> getUserShops(
            @AuthenticationPrincipal User user) {
        List<ShopDto> shops = shopService.getShopsByUser(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(shops));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShopDto>> getShopById(@PathVariable Long id) {
        ShopDto shop = shopService.getShopById(id);
        return ResponseEntity.ok(ApiResponse.ok(shop));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> disconnectShop(@PathVariable Long id) {
        shopService.disconnectShop(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Shop disconnected"));
    }

    @GetMapping("/connect/{platform}")
    public ResponseEntity<ApiResponse<Map<String, String>>> connectPlatform(
            @PathVariable String platform) {
        String state = UUID.randomUUID().toString();
        String redirectUrl = oAuthHandlerFactory.getHandler(platform).getAuthorizeUrl(state);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("redirectUrl", redirectUrl)));
    }

    @GetMapping("/callback/{platform}")
    public ResponseEntity<Void> oauthCallback(
            @PathVariable String platform,
            @RequestParam String code,
            @RequestParam(required = false) String state,
            @AuthenticationPrincipal User user) {
        try {
            OAuthTokenResponse token = oAuthHandlerFactory
                    .getHandler(platform)
                    .exchangeCodeForToken(code);
            shopService.saveConnectedShop(user, platform, token);

            URI redirect = URI.create(frontendUrl + "/connect?status=success&platform=" + platform);
            return ResponseEntity.status(HttpStatus.FOUND).location(redirect).build();
        } catch (Exception e) {
            log.error("OAuth callback failed for {}: {}", platform, e.getMessage());
            URI redirect = URI.create(frontendUrl + "/connect?status=failed&platform=" + platform);
            return ResponseEntity.status(HttpStatus.FOUND).location(redirect).build();
        }
    }
}
