package com.feedbackai.service;

import com.feedbackai.dto.response.ReviewAspectDto;
import com.feedbackai.dto.response.ReviewDto;
import com.feedbackai.dto.response.TopAspectDto;
import com.feedbackai.entity.Review;
import com.feedbackai.entity.ReviewAspect;
import com.feedbackai.repository.ReviewAspectRepository;
import com.feedbackai.repository.ReviewRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewAspectRepository reviewAspectRepository;

    public Page<ReviewDto> getReviewsByProduct(Long productId, Pageable pageable) {
        return reviewRepository.findByProductId(productId, pageable)
                .map(this::toDto);
    }

    public Page<ReviewDto> getLatestReviews(Pageable pageable) {
        return reviewRepository.findLatest(pageable)
                .map(this::toDto);
    }

    public ReviewDto getReviewById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Review not found: " + id));
        return toDto(review);
    }

    public List<TopAspectDto> getTopAspects(Long productId) {
        List<Object[]> rows = reviewAspectRepository.findTopAspectsByProductId(productId);
        return rows.stream()
                .map(row -> TopAspectDto.builder()
                        .aspect((String) row[0])
                        .sentiment((String) row[1])
                        .count((Long) row[2])
                        .build())
                .toList();
    }

    public List<Review> findUnclassifiedReviews() {
        return reviewRepository.findUnclassifiedReviews();
    }

    public void saveAspects(Long reviewId, List<ReviewAspect> aspects) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Review not found: " + reviewId));
        aspects.forEach(a -> a.setReview(review));
        reviewAspectRepository.saveAll(aspects);
    }

    private ReviewDto toDto(Review r) {
        List<ReviewAspectDto> aspectDtos = r.getAspects() != null ?
                r.getAspects().stream()
                        .map(a -> ReviewAspectDto.builder()
                                .id(a.getId())
                                .aspect(a.getAspect())
                                .sentiment(a.getSentiment())
                                .confidenceScore(a.getConfidenceScore())
                                .build())
                        .toList() :
                List.of();

        return ReviewDto.builder()
                .id(r.getId())
                .productId(r.getProduct().getId())
                .productName(r.getProduct().getName())
                .externalId(r.getExternalId())
                .authorName(r.getAuthorName())
                .content(r.getContent())
                .rating(r.getRating())
                .platform(r.getPlatform())
                .reviewedAt(r.getReviewedAt())
                .syncedAt(r.getSyncedAt())
                .aspects(aspectDtos)
                .build();
    }
}
