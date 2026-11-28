import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Package, Star, MessageSquare, Search, Store, ChevronRight, RefreshCw
} from 'lucide-react';
import storeService from '../services/storeService';
import productService from '../services/productService';

function normalizeStore(s) {
  if (!s) return null;
  return {
    id: s.id,
    platformId: s.platformId ?? s.platform_id,
    platformCode: s.platformCode ?? s.platform_code ?? '',
    platformName: s.platformName ?? s.platform_name ?? 'Sàn TMĐT',
    storeName: s.storeName ?? s.store_name ?? 'Cửa hàng API',
    storeCodeOnPlatform: s.storeCodeOnPlatform ?? s.store_code_on_platform ?? '',
    status: s.status ?? 'CONNECTED',
    productCount: s.productCount ?? s.product_count ?? 0,
    reviewCount: s.reviewCount ?? s.review_count ?? 0,
    lastSyncedAt: s.lastSyncedAt ?? s.last_synced_at ?? null,
  };
}

function normalizeProduct(p) {
  return {
    id: p.id,
    storeId: p.storeId ?? p.store_id,
    storeName: p.storeName ?? p.store_name ?? '',
    platformCode: p.platformCode ?? p.platform_code ?? '',
    platformProductId: p.platformProductId ?? p.platform_product_id ?? '',
    sku: p.sku ?? '',
    name: p.name ?? '',
    categoryName: p.categoryName ?? p.category_name ?? 'Khác',
    reviewCount: p.reviewCount ?? p.review_count ?? 0,
    averageRating: p.averageRating ?? p.average_rating ?? 0,
  };
}

function normalizeReview(r) {
  return {
    id: r.id,
    rating: r.rating ?? 5,
    commentText: r.commentText ?? r.comment_text ?? '',
    status: r.status ?? 'PENDING',
    reviewCreatedAt: r.reviewCreatedAt ?? r.review_created_at ?? null,
    customerName: r.customerName ?? r.customer_name ?? 'Khách hàng',
    overallSentiment: r.overallSentiment ?? r.overall_sentiment ?? null,
  };
}

export default function ApiStoreProductsPage() {
  const { storeId, productId } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [reviewSearch, setReviewSearch] = useState('');

  useEffect(() => {
    let active = true;
    async function loadStoreAndProducts() {
      try {
        setLoading(true);
        const [storeRes, prodRes] = await Promise.all([
          storeService.getStoreById(storeId),
          productService.getProducts({ storeId, page: 1, pageSize: 100 }),
        ]);
        if (!active) return;
        setStore(normalizeStore(storeRes));
        const items = (prodRes?.items || []).map(normalizeProduct);
        setProducts(items);
        if (productId) {
          const found = items.find((p) => p.id === productId);
          setSelectedProduct(found || null);
        } else {
          setSelectedProduct(null);
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu cửa hàng API:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadStoreAndProducts();
    return () => { active = false; };
  }, [storeId, productId]);

  useEffect(() => {
    if (!productId) {
      setReviews([]);
      return;
    }
    let active = true;
    async function loadReviews() {
      try {
        setReviewsLoading(true);
        const res = await productService.getProductReviews(productId, { page: 1, pageSize: 200 });
        if (!active) return;
        setReviews((res?.items || []).map(normalizeReview));
      } catch (err) {
        console.error('Lỗi tải bình luận sản phẩm:', err);
      } finally {
        if (active) setReviewsLoading(false);
      }
    }
    loadReviews();
    return () => { active = false; };
  }, [productId]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
    );
  }, [products, search]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (ratingFilter !== 'ALL' && Number(r.rating) !== Number(ratingFilter)) return false;
      if (reviewSearch.trim()) {
        const q = reviewSearch.trim().toLowerCase();
        return (
          r.commentText.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reviews, ratingFilter, reviewSearch]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        Đang tải dữ liệu cửa hàng...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '13px', color: '#64748b' }}>
        <Link to="/products" style={{ color: '#4f46e5', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
          <ArrowLeft size={14} /> Quản lý Sản phẩm
        </Link>
        <ChevronRight size={14} />
        <button
          type="button"
          onClick={() => navigate(`/products/store/${storeId}`)}
          style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: productId ? '#4f46e5' : '#0f172a', fontWeight: 600 }}
        >
          {store?.storeName || 'Cửa hàng API'}
        </button>
        {selectedProduct && (
          <>
            <ChevronRight size={14} />
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{selectedProduct.name}</span>
          </>
        )}
      </div>

      {/* Store Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
        borderRadius: '12px',
        padding: '20px 24px',
        color: '#fff',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Store size={20} />
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>{store?.storeName || 'Cửa hàng API'}</h1>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 }}>
              {store?.platformName}
            </span>
          </div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>
            Mã shop: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{store?.storeCodeOnPlatform}</span> •{' '}
            {products.length} sản phẩm • {store?.reviewCount || products.reduce((s, p) => s + p.reviewCount, 0)} đánh giá
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/connect')}
          style={{
            background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)',
            color: '#fff', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
          }}
        >
          Quản lý Kết nối
        </button>
      </div>

      {/* View 1: Product Detail + 100 Reviews */}
      {productId && selectedProduct ? (
        <div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: 600, background: '#eef2ff', padding: '3px 10px', borderRadius: '999px' }}>
                  {selectedProduct.categoryName}
                </span>
                <h2 style={{ margin: '10px 0 6px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  {selectedProduct.name}
                </h2>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  SKU: <span style={{ fontFamily: 'monospace' }}>{selectedProduct.sku}</span> • {selectedProduct.reviewCount} bình luận •{' '}
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>★ {Number(selectedProduct.averageRating || 0).toFixed(1)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/products/store/${storeId}`)}
                style={{
                  padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1',
                  background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                }}
              >
                <ArrowLeft size={14} /> Quay lại danh sách sản phẩm
              </button>
            </div>
          </div>

          {/* Filter bar for Reviews */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['ALL', '5', '4', '3', '2', '1'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRatingFilter(val)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    border: '1px solid',
                    borderColor: ratingFilter === val ? '#4f46e5' : '#e2e8f0',
                    background: ratingFilter === val ? '#4f46e5' : '#fff',
                    color: ratingFilter === val ? '#fff' : '#334155',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {val === 'ALL' ? `Tất cả (${reviews.length})` : `${val} ★`}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Tìm trong bình luận..."
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                style={{ width: '100%', padding: '7px 12px 7px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Review list */}
          {reviewsLoading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={18} /> Đang tải bình luận...
            </div>
          ) : filteredReviews.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              Không có bình luận nào phù hợp bộ lọc.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredReviews.map((r) => (
                <div key={r.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{r.customerName}</span>
                      <span style={{ color: '#f59e0b', fontSize: '13px', letterSpacing: '1px' }}>
                        {'★'.repeat(r.rating)}{'☆'.repeat(Math.max(0, 5 - r.rating))}
                      </span>
                      <span style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 600,
                        background: r.status === 'REPLIED' ? '#dcfce7' : '#f1f5f9',
                        color: r.status === 'REPLIED' ? '#15803d' : '#475569',
                      }}>
                        {r.status === 'REPLIED' ? 'Đã phản hồi' : 'Chờ xử lý'}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {r.reviewCreatedAt ? new Date(r.reviewCreatedAt).toLocaleString('vi-VN') : ''}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>{r.commentText}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* View 2: 10 Products Grid */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Danh sách Sản phẩm ({filteredProducts.length})
            </h2>
            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Tìm tên sản phẩm, SKU, danh mục..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              Cửa hàng này chưa có sản phẩm nào trong cơ sở dữ liệu.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/products/store/${storeId}/${p.id}`)}
                  style={{
                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px',
                    cursor: 'pointer', transition: 'box-shadow 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#4f46e5', background: '#eef2ff', padding: '3px 8px', borderRadius: '999px' }}>
                      {p.categoryName}
                    </span>
                    <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={13} fill="#f59e0b" /> {Number(p.averageRating || 0).toFixed(1)}
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600, color: '#0f172a', lineHeight: 1.4 }}>
                    {p.name}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace', marginBottom: '12px' }}>
                    SKU: {p.sku}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '13px' }}>
                    <span style={{ color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                      <MessageSquare size={14} color="#4f46e5" /> {p.reviewCount} bình luận
                    </span>
                    <span style={{ color: '#4f46e5', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Xem bình luận <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
