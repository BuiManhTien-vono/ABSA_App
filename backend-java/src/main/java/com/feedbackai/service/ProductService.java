package com.feedbackai.service;

import com.feedbackai.dto.response.ProductDto;
import com.feedbackai.entity.Product;
import com.feedbackai.entity.Shop;
import com.feedbackai.repository.ProductRepository;
import com.feedbackai.repository.ShopRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;

    public List<ProductDto> getProductsByShop(Long shopId) {
        return productRepository.findByShopId(shopId).stream()
                .map(this::toDto)
                .toList();
    }

    public List<ProductDto> getProductsByUser(Long userId) {
        return productRepository.findByShopUserId(userId).stream()
                .map(this::toDto)
                .toList();
    }

    public ProductDto getProductById(Long id) {
        return toDto(productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + id)));
    }

    @Transactional
    public ProductDto createProduct(Long shopId, ProductDto dto) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new EntityNotFoundException("Shop not found: " + shopId));

        Product product = Product.builder()
                .shop(shop)
                .externalId(dto.getExternalId())
                .name(dto.getName())
                .category(dto.getCategory())
                .imageUrl(dto.getImageUrl())
                .build();

        return toDto(productRepository.save(product));
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + id));

        if (dto.getName() != null) product.setName(dto.getName());
        if (dto.getCategory() != null) product.setCategory(dto.getCategory());
        if (dto.getImageUrl() != null) product.setImageUrl(dto.getImageUrl());

        return toDto(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Product not found: " + id);
        }
        productRepository.deleteById(id);
    }

    private ProductDto toDto(Product p) {
        long posCount = 0, neuCount = 0, negCount = 0;
        if (p.getReviews() != null) {
            for (var review : p.getReviews()) {
                if (review.getAspects() != null) {
                    for (var aspect : review.getAspects()) {
                        switch (aspect.getSentiment()) {
                            case "positive" -> posCount++;
                            case "neutral" -> neuCount++;
                            case "negative" -> negCount++;
                        }
                    }
                }
            }
        }

        return ProductDto.builder()
                .id(p.getId())
                .shopId(p.getShop().getId())
                .shopName(p.getShop().getShopName())
                .platform(p.getShop().getPlatform())
                .externalId(p.getExternalId())
                .name(p.getName())
                .category(p.getCategory())
                .imageUrl(p.getImageUrl())
                .createdAt(p.getCreatedAt())
                .reviewCount(p.getReviews() != null ? p.getReviews().size() : 0)
                .positiveCount(posCount)
                .neutralCount(neuCount)
                .negativeCount(negCount)
                .build();
    }
}
