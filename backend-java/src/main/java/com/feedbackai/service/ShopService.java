package com.feedbackai.service;

import com.feedbackai.dto.response.OAuthTokenResponse;
import com.feedbackai.dto.response.ShopDto;
import com.feedbackai.entity.Shop;
import com.feedbackai.entity.User;
import com.feedbackai.repository.ShopRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopRepository shopRepository;

    public List<ShopDto> getShopsByUser(Long userId) {
        return shopRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .toList();
    }

    public ShopDto getShopById(Long id) {
        return toDto(shopRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Shop not found: " + id)));
    }

    @Transactional
    public ShopDto saveConnectedShop(User user, String platform, OAuthTokenResponse token) {
        Shop shop = Shop.builder()
                .user(user)
                .platform(platform)
                .shopName(token.getShopName() != null ? token.getShopName() : platform + " Shop")
                .accessToken(token.getAccessToken())
                .refreshToken(token.getRefreshToken())
                .tokenExpiry(token.getExpiresIn() != null ?
                        LocalDateTime.now().plusSeconds(token.getExpiresIn()) : null)
                .connectedAt(LocalDateTime.now())
                .status("ACTIVE")
                .build();

        return toDto(shopRepository.save(shop));
    }

    @Transactional
    public void disconnectShop(Long shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new EntityNotFoundException("Shop not found: " + shopId));
        shop.setStatus("DISCONNECTED");
        shop.setAccessToken(null);
        shop.setRefreshToken(null);
        shopRepository.save(shop);
    }

    private ShopDto toDto(Shop shop) {
        return ShopDto.builder()
                .id(shop.getId())
                .platform(shop.getPlatform())
                .shopName(shop.getShopName())
                .status(shop.getStatus())
                .connectedAt(shop.getConnectedAt())
                .productCount(shop.getProducts() != null ? shop.getProducts().size() : 0)
                .build();
    }
}
