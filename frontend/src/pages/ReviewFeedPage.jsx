import { useEffect, useState, useCallback } from 'react';
import { reviewService } from '../services/reviewService';
import { useWebSocket } from '../hooks/useWebSocket';
import PlatformBadge from '../components/common/PlatformBadge';
import SentimentBadge from '../components/SentimentBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import './ReviewFeedPage.css';

export default function ReviewFeedPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await reviewService.getLatest();
        setReviews(res.data?.content || []);
      } catch (err) {
        console.error('Failed to load reviews', err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  const handleNewReview = useCallback((newReview) => {
    setReviews((prev) => [newReview, ...prev]);
  }, []);

  useWebSocket(null, handleNewReview);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="review-feed-container">
      <div className="feed-header">
        <h2>Dòng thời gian Đánh giá (Real-time)</h2>
        <span className="live-indicator">● LIVE</span>
      </div>

      {reviews.length === 0 ? (
        <EmptyState message="Chưa có đánh giá nào được đồng bộ" />
      ) : (
        <div className="feed-list">
          {reviews.map((r) => (
            <div key={r.id} className="feed-card">
              <div className="feed-card-header">
                <div className="author-info">
                  <span className="author-name">{r.authorName || 'Khách hàng'}</span>
                  <span className="product-tag">{r.productName}</span>
                </div>
                <PlatformBadge platform={r.platform} />
              </div>
              <p className="feed-content">{r.content}</p>
              {r.aspects && r.aspects.length > 0 && (
                <div className="aspects-list">
                  {r.aspects.map((asp) => (
                    <div key={asp.id || asp.aspect} className="aspect-pill">
                      <span>{asp.aspect}</span>
                      <SentimentBadge sentiment={asp.sentiment} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
