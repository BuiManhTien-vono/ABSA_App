import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import AspectBarChart from '../components/charts/AspectBarChart';
import PlatformBadge from '../components/common/PlatformBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SentimentBadge from '../components/SentimentBadge';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [topAspects, setTopAspects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, aspectsRes, reviewsRes] = await Promise.all([
          productService.getById(id),
          productService.getTopAspects(id),
          reviewService.getByProduct(id),
        ]);
        setProduct(prodRes.data);
        setTopAspects(aspectsRes.data || []);
        setReviews(reviewsRes.data?.content || []);
      } catch (err) {
        console.error('Failed to load product detail', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="product-detail-container">
      {product && (
        <div className="product-header-card">
          <div className="product-title-row">
            <h2>{product.name}</h2>
            <PlatformBadge platform={product.platform} />
          </div>
          <div className="product-meta-row">
            <span>Danh mục: {product.category || 'N/A'}</span>
            <span>Mã sàn: {product.externalId || 'N/A'}</span>
          </div>
        </div>
      )}

      <div className="detail-grid">
        <div className="aspects-section card">
          <h3>Top Khía cạnh Phổ biến (Aspect Cloud)</h3>
          <AspectBarChart data={topAspects} />
        </div>

        <div className="reviews-section card">
          <h3>Đánh giá Gần đây ({reviews.length})</h3>
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-data">Chưa có đánh giá nào</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="review-item">
                  <div className="review-item-header">
                    <span className="author">{r.authorName || 'Khách hàng'}</span>
                    <span className="rating">{'★'.repeat(r.rating || 5)}</span>
                  </div>
                  <p className="content">{r.content}</p>
                  {r.aspects && r.aspects.length > 0 && (
                    <div className="aspects-tags">
                      {r.aspects.map((asp) => (
                        <span key={asp.id || asp.aspect} className="aspect-tag">
                          {asp.aspect}: <SentimentBadge sentiment={asp.sentiment} />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
