package com.feedbackai.controller;

import com.feedbackai.common.ApiResponse;
import com.feedbackai.dto.response.ProductDto;
import com.feedbackai.dto.response.TopAspectDto;
import com.feedbackai.entity.User;
import com.feedbackai.service.ProductService;
import com.feedbackai.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDto>>> getUserProducts(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getProductsByUser(user.getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getProductById(id)));
    }

    @GetMapping("/{id}/top-aspects")
    public ResponseEntity<ApiResponse<List<TopAspectDto>>> getTopAspects(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getTopAspects(id)));
    }

    @PostMapping("/shops/{shopId}")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(
            @PathVariable Long shopId,
            @RequestBody ProductDto dto) {
        ProductDto created = productService.createProduct(shopId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @PathVariable Long id, @RequestBody ProductDto dto) {
        return ResponseEntity.ok(ApiResponse.ok(productService.updateProduct(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Product deleted"));
    }
}
