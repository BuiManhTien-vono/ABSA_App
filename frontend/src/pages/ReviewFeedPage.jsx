import { useEffect, useState, useMemo } from 'react';
import {
  MessageSquare, Search, X, Sparkles, Brain,
  Lightbulb, AlertTriangle, ThumbsUp, ChevronLeft, ChevronRight,
  Send, Eye, RefreshCw, Zap, Package
} from 'lucide-react';
import reviewService from '../services/reviewService';
import responseService from '../services/responseService';
import storeService from '../services/storeService';
import { SHOPEE_STORES, STORE_CATEGORIES, getProductsForCategory, generateMockComments } from '../data/shopeeData';
import { LAZADA_STORES, LAZADA_STORE_CATEGORIES, getLazadaProductsForCategory, generateLazadaMockComments } from '../data/lazadaData';
import { TIKTOK_SHOP_STORES, TIKTOK_SHOP_STORE_CATEGORIES, getTikTokShopProductsForCategory, generateTikTokShopMockComments } from '../data/tiktokShopData';
import './ReviewFeedPage.css';

const SENTIMENT_MAP = {
  POS: { label: 'Tích cực', cls: 'badge--pos' },
  NEU: { label: 'Trung tính', cls: 'badge--neu' },
  NEG: { label: 'Tiêu cực', cls: 'badge--neg' },
  MIXED: { label: 'Hỗn hợp', cls: 'badge--mixed' },
};

const STATUS_MAP = {
  PENDING: { label: 'Chờ xử lý', cls: 'badge--neu' },
  REPLIED: { label: 'Đã phản hồi', cls: 'badge--pos' },
  SKIPPED: { label: 'Bỏ qua', cls: 'badge--muted' },
  FAILED: { label: 'Thất bại', cls: 'badge--neg' },
};

function StarRating({ rating = 5 }) {
  return (
    <div className="review-card__stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`review-card__star ${i <= rating ? '' : 'review-card__star--empty'}`}>★</span>
      ))}
    </div>
  );
}

function getMockReviewsForStore(storeId) {
  const store = LAZADA_STORES.find(s => s.id === storeId) || SHOPEE_STORES.find(s => s.id === storeId) || TIKTOK_SHOP_STORES.find(s => s.id === storeId);
  const storeName = store ? store.name : 'Cửa hàng';

  // 1. If Lazada store: generate 50 rich comments per product
  if (LAZADA_STORE_CATEGORIES[storeId]) {
    const categories = LAZADA_STORE_CATEGORIES[storeId] || [];
    const reviews = [];
    categories.forEach(cat => {
      const prods = getLazadaProductsForCategory(storeId, cat.id);
      prods.forEach(prod => {
        const comments = generateLazadaMockComments(prod, 50);
        comments.forEach(c => {
          reviews.push({
            id: c.id,
            platformReviewId: c.id,
            rating: c.rating,
            commentText: c.content,
            status: c.rating <= 2 ? 'PENDING' : 'REPLIED',
            reviewCreatedAt: c.createdAt,
            overallSentiment: c.sentiment,
            sentimentScore: c.rating >= 4 ? 0.95 : c.rating === 3 ? 0.85 : 0.92,
            customerName: c.user,
            storeName,
            productName: prod.name,
            aiAnalysis: {
              customerInsight: c.sentiment === 'POS' ? 'Khách hàng rất hài lòng về chất lượng sản phẩm và thái độ phục vụ của shop.' : c.sentiment === 'NEU' ? 'Khách hàng nhận xét sản phẩm ở mức ổn, đóng gói bình thường.' : 'Khách hàng không hài lòng về lỗi đóng gói và hỗ trợ xử lý chậm.',
              rootCause: c.sentiment === 'POS' ? 'Sản phẩm chính hãng, mô tả chuẩn xác.' : 'Đơn vị vận chuyển làm móp hộp, thiếu bọc chống sốc.',
              businessRecommendation: c.sentiment === 'POS' ? 'Duy trì chất lượng dịch vụ và gửi tặng mã giảm giá.' : 'Liên hệ hỗ trợ đổi trả ngay và kiểm tra quy trình đóng gói.',
              suggestedSellerResponse: `Dạ Lazada Mall ${storeName} xin chào bạn ${c.user}! Cảm ơn bạn đã tin tưởng ủng hộ shop. Shop đã ghi nhận phản hồi và sẽ hỗ trợ bạn ngay ạ!`
            },
            aspects: (c.absaTags || []).map((t, idx) => ({
              id: idx,
              macroCategory: t.aspect || 'QUALITY',
              microAspect: t.label || t.aspect,
              sentiment: t.sentiment,
              sentimentScore: 0.9
            }))
          });
        });
      });
    });
    return reviews;
  }

  // 2. If TikTok Shop store: generate 50 rich TikTok-style comments per product
  if (TIKTOK_SHOP_STORE_CATEGORIES[storeId]) {
    const categories = TIKTOK_SHOP_STORE_CATEGORIES[storeId] || [];
    const reviews = [];
    categories.forEach(cat => {
      const prods = getTikTokShopProductsForCategory(storeId, cat.id);
      prods.forEach(prod => {
        const comments = generateTikTokShopMockComments(prod, 50);
        comments.forEach(c => {
          reviews.push({
            id: c.id,
            platformReviewId: c.id,
            rating: c.rating,
            commentText: c.content,
            status: c.rating <= 2 ? 'PENDING' : 'REPLIED',
            reviewCreatedAt: c.createdAt,
            overallSentiment: c.sentiment,
            sentimentScore: c.rating >= 4 ? 0.95 : c.rating === 3 ? 0.85 : 0.92,
            customerName: c.user,
            storeName,
            productName: prod.name,
            aiAnalysis: {
              customerInsight: c.sentiment === 'POS' ? 'Khách hàng rất hào hứng sau khi xem livestream và hài lòng về sản phẩm.' : c.sentiment === 'NEU' ? 'Khách hàng đánh giá sản phẩm ở mức tạm chấp nhận được so với giá.' : 'Khách hàng bức xúc về lỗi giao hàng/nhầm phân loại trên TikTok Live.',
              rootCause: c.sentiment === 'POS' ? 'Sản phẩm đúng chất lượng quảng cáo trên video TikTok.' : 'Sự cố shipper dằn xóc hoặc thiếu hụt quà tặng cam kết.',
              businessRecommendation: c.sentiment === 'POS' ? 'Duy trì livestream tư vấn và tặng voucher cảm ơn.' : 'Chủ động đổi mới 1-1 và kiểm tra lại khâu nhặt đơn.',
              suggestedSellerResponse: `Dạ shop TikTok chào bạn ${c.user}! Cảm ơn bạn đã săn deal và ủng hộ shop trên Live. Shop đã chuyển thông tin cho nhân viên CSKH hỗ trợ bạn ngay ạ!`
            },
            aspects: (c.absaTags || []).map((t, idx) => ({
              id: idx,
              macroCategory: t.aspect || 'QUALITY',
              microAspect: t.label || t.aspect,
              sentiment: t.sentiment,
              sentimentScore: 0.9
            }))
          });
        });
      });
    });
    return reviews;
  }

  // 3. If Shopee store: generate 50 rich Shopee-style comments per product
  if (STORE_CATEGORIES[storeId]) {
    const categories = STORE_CATEGORIES[storeId] || [];
    const reviews = [];
    categories.forEach(cat => {
      const prods = getProductsForCategory(storeId, cat.id, { includeComments: false });
      prods.forEach(prod => {
        const comments = generateMockComments(prod, 50);
        comments.forEach(c => {
          reviews.push({
            id: c.id,
            platformReviewId: c.id,
            rating: c.starRating,
            commentText: c.content,
            status: c.starRating <= 2 ? 'PENDING' : 'REPLIED',
            reviewCreatedAt: c.date,
            overallSentiment: c.sentiment,
            sentimentScore: c.starRating >= 4 ? 0.95 : c.starRating === 3 ? 0.85 : 0.92,
            customerName: c.userName,
            storeName,
            productName: prod.name,
            aiAnalysis: {
              customerInsight: c.sentiment === 'POS' ? 'Khách hàng rất hài lòng về chất lượng sản phẩm và thái độ tư vấn.' : c.sentiment === 'NEU' ? 'Khách hàng đánh giá sản phẩm ở mức chấp nhận được so với giá.' : 'Khách hàng không hài lòng về lỗi đóng gói hoặc vận chuyển chậm.',
              rootCause: c.sentiment === 'POS' ? 'Sản phẩm chuẩn mô tả, chất liệu tốt.' : 'Sự cố vận chuyển dằn xóc hoặc quy trình đóng gói.',
              businessRecommendation: c.sentiment === 'POS' ? 'Duy trì chất lượng sản phẩm và tri ân khách hàng thân thiết.' : 'Liên hệ đổi trả 1-1 và bổ sung bọc xốp chống sốc.',
              suggestedSellerResponse: `Dạ Shopee Mall ${storeName} xin chào bạn ${c.userName}! Cảm ơn bạn đã tin tưởng mua sắm. Shop đã ghi nhận ý kiến và sẽ hỗ trợ ngay ạ!`
            },
            aspects: (c.aspects || []).map((t, idx) => ({
              id: idx,
              macroCategory: t.aspect || 'QUALITY',
              microAspect: t.label || t.aspect,
              sentiment: t.sentiment,
              sentimentScore: 0.9
            }))
          });
        });
      });
    });
    return reviews;
  }

  // 4. Fallback generator: creates 50 domain-accurate comments for any custom or non-standard mock store
  const fallbackProduct = { id: `prod-${storeId}`, name: storeName, categoryName: store ? store.category : 'Tổng hợp' };
  const mockComments = generateMockComments(fallbackProduct, 50);
  return mockComments.map((c, i) => ({
    id: `mock-rev-${storeId}-${i + 1}`,
    platformReviewId: `REV_${storeId}_${i + 1}`,
    rating: c.starRating,
    commentText: c.content,
    status: c.starRating <= 2 ? 'PENDING' : 'REPLIED',
    reviewCreatedAt: new Date(Date.now() - (i * 7200000)).toISOString(),
    overallSentiment: c.sentiment,
    sentimentScore: c.starRating >= 4 ? 0.95 : c.starRating === 3 ? 0.85 : 0.92,
    customerName: c.userName,
    storeName,
    productName: storeName,
    aiAnalysis: {
      customerInsight: c.sentiment === 'POS' ? 'Khách hàng rất khen ngợi chất lượng sản phẩm và thái độ phục vụ của shop.' : c.sentiment === 'NEU' ? 'Khách hàng nhận xét sản phẩm chấp nhận được so với tầm giá.' : 'Khách hàng bức xúc về lỗi đóng gói hoặc chất lượng không đúng mô tả.',
      rootCause: c.sentiment === 'POS' ? 'Chất lượng sản phẩm đúng cam kết, mô tả chuẩn xác.' : 'Lỗi vận chuyển dằn xóc hoặc sai sót khâu đóng gói.',
      businessRecommendation: c.sentiment === 'POS' ? 'Duy trì phong độ và tặng mã ưu đãi cho khách quay lại.' : 'Chủ động liên hệ đổi mới ngay và tặng quà đền bù.',
      suggestedSellerResponse: `Dạ ${storeName} xin chào bạn ${c.userName}! Cảm ơn bạn đã tin tưởng ủng hộ shop. Shop đã ghi nhận ý kiến và hỗ trợ ngay ạ!`
    },
    aspects: (c.aspects || []).map((t, idx) => ({
      id: idx,
      macroCategory: t.aspect || 'QUALITY',
      microAspect: t.label || t.aspect,
      sentiment: t.sentiment,
      sentimentScore: 0.9
    }))
  }));
}

export default function ReviewFeedPage() {
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);

  // Stores list for multi-shop filtering
  const [storesList, setStoresList] = useState([]);
  const [storeId, setStoreId] = useState('');

  // Filters
  const [rating, setRating] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Product filter state
  const [selectedProductName, setSelectedProductName] = useState('');

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    loadReviews();
  }, [storeId, rating, sentiment, status, search]);

  async function loadStores() {
    try {
      const res = await storeService.getStores({ pageSize: 100 });
      const dbStores = res?.items || [];
      const connectedList = [];

      // 1. All stores from DB are connected stores
      dbStores.forEach(s => {
        connectedList.push({
          id: s.id,
          storeName: s.storeName,
          platformName: s.platformName || 'API',
          isMock: false,
        });
      });

      // 2. Read connected platforms from localStorage
      try {
        const connections = JSON.parse(localStorage.getItem('connectedPlatforms') || '{}');

        if (connections.shopee?.connected || localStorage.getItem('shopeeActivated') === 'true') {
          const selectedIds = Array.isArray(connections.shopee?.stores) ? connections.shopee.stores.map(String) : [];
          SHOPEE_STORES.forEach(s => {
            if (selectedIds.length === 0 || selectedIds.includes(String(s.id))) {
              if (!connectedList.some(c => c.id === s.id || c.storeName === s.name)) {
                connectedList.push({ id: s.id, storeName: s.name, platformName: 'Shopee', isMock: true });
              }
            }
          });
        }

        if (connections.lazada?.connected) {
          const selectedIds = Array.isArray(connections.lazada?.stores) ? connections.lazada.stores.map(String) : [];
          LAZADA_STORES.forEach(s => {
            if (selectedIds.length === 0 || selectedIds.includes(String(s.id))) {
              if (!connectedList.some(c => c.id === s.id || c.storeName === s.name)) {
                connectedList.push({ id: s.id, storeName: s.name, platformName: 'Lazada', isMock: true });
              }
            }
          });
        }

        if (connections['tiktok-shop']?.connected) {
          const selectedIds = Array.isArray(connections['tiktok-shop']?.stores) ? connections['tiktok-shop'].stores.map(String) : [];
          TIKTOK_SHOP_STORES.forEach(s => {
            if (selectedIds.length === 0 || selectedIds.includes(String(s.id))) {
              if (!connectedList.some(c => c.id === s.id || c.storeName === s.name)) {
                connectedList.push({ id: s.id, storeName: s.name, platformName: 'TikTok Shop', isMock: true });
              }
            }
          });
        }
      } catch (e) {
        console.error(e);
      }

      setStoresList(connectedList);
    } catch (err) {
      console.error('Lỗi khi tải danh sách cửa hàng:', err);
    }
  }

  async function loadReviews() {
    try {
      setLoading(true);

      // If a mock store is selected from dropdown
      if (storeId && (storeId.startsWith('lzd-') || storeId.startsWith('shopee-') || storeId.startsWith('spe-') || storeId.startsWith('tts-') || storeId.startsWith('mock-'))) {
        let mockList = getMockReviewsForStore(storeId);

        if (rating) mockList = mockList.filter(r => String(r.rating) === String(rating));
        if (sentiment) mockList = mockList.filter(r => r.overallSentiment === sentiment);
        if (status) mockList = mockList.filter(r => r.status === status);
        if (search) {
          const q = search.toLowerCase();
          mockList = mockList.filter(r =>
            (r.commentText && r.commentText.toLowerCase().includes(q)) ||
            (r.customerName && r.customerName.toLowerCase().includes(q)) ||
            (r.productName && r.productName.toLowerCase().includes(q))
          );
        }

        setAllReviews(mockList);
        return;
      }

      // Fetch DB reviews
      const res = await reviewService.getReviews({
        page: 1,
        pageSize: 200,
        storeId: storeId || undefined,
        rating: rating ? parseInt(rating, 10) : undefined,
        sentiment,
        status,
        search,
      });

      let items = res?.items || [];

      // If All Stores is selected and DB is empty, combine mock reviews STRICTLY for connected stores
      if (items.length === 0 && !storeId) {
        let aggregated = [];
        const connectedMockStores = storesList.filter(s => s.isMock);
        // Only load reviews from stores that the user has actually connected!
        connectedMockStores.forEach(s => {
          aggregated = aggregated.concat(getMockReviewsForStore(s.id));
        });

        if (rating) aggregated = aggregated.filter(r => String(r.rating) === String(rating));
        if (sentiment) aggregated = aggregated.filter(r => r.overallSentiment === sentiment);
        if (status) aggregated = aggregated.filter(r => r.status === status);
        if (search) {
          const q = search.toLowerCase();
          aggregated = aggregated.filter(r =>
            (r.commentText && r.commentText.toLowerCase().includes(q)) ||
            (r.customerName && r.customerName.toLowerCase().includes(q)) ||
            (r.productName && r.productName.toLowerCase().includes(q))
          );
        }

        items = aggregated;
      }

      setAllReviews(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSeedMockData() {
    try {
      setSeeding(true);
      await storeService.createMockLazadaStore();
      await loadStores();
      await loadReviews();
    } catch (err) {
      alert('Không thể tạo dữ liệu mẫu: ' + err.message);
    } finally {
      setSeeding(false);
    }
  }

  async function handleOpenDetail(rItem) {
    const id = typeof rItem === 'object' ? rItem.id : rItem;
    const target = typeof rItem === 'object' ? rItem : allReviews.find(r => r.id === id);

    try {
      setDetailLoading(true);
      const detail = await reviewService.getReviewById(id).catch(() => null);
      const finalDetail = detail || target;
      setSelectedReview(finalDetail);
      setResponseText(finalDetail?.aiAnalysis?.suggestedSellerResponse || '');
    } catch (err) {
      if (target) {
        setSelectedReview(target);
        setResponseText(target?.aiAnalysis?.suggestedSellerResponse || '');
      }
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleSendResponse(e) {
    e.preventDefault();
    if (!responseText.trim() || !selectedReview) return;

    try {
      setSendingResponse(true);
      await responseService.sendResponse(selectedReview.id, responseText);
      alert('Gửi phản hồi thành công!');
      handleOpenDetail(selectedReview);
      loadReviews();
    } catch (err) {
      alert('Gửi phản hồi thất bại: ' + err.message);
    } finally {
      setSendingResponse(false);
    }
  }

  // Extract products list for the current reviews list
  const productsList = useMemo(() => {
    const map = new Map();
    allReviews.forEach(r => {
      if (r.productName && !map.has(r.productName)) {
        const prodReviews = allReviews.filter(x => x.productName === r.productName);
        const pos = prodReviews.filter(x => x.overallSentiment === 'POS').length;
        const neu = prodReviews.filter(x => x.overallSentiment === 'NEU').length;
        const neg = prodReviews.filter(x => x.overallSentiment === 'NEG').length;
        map.set(r.productName, {
          name: r.productName,
          count: prodReviews.length,
          pos,
          neu,
          neg,
          healthScore: Math.round((pos / Math.max(prodReviews.length, 1)) * 100),
        });
      }
    });
    return Array.from(map.values());
  }, [allReviews]);

  // Filtered reviews by product
  const filteredReviews = useMemo(() => {
    if (!selectedProductName) return allReviews;
    return allReviews.filter(r => r.productName === selectedProductName);
  }, [allReviews, selectedProductName]);

  // Active product metadata
  const selectedProductMeta = useMemo(() => {
    if (!selectedProductName) return null;
    return productsList.find(p => p.name === selectedProductName) || null;
  }, [productsList, selectedProductName]);

  // Pagination calculation
  const PAGE_SIZE = 12;
  const totalCount = filteredReviews.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  const displayedReviews = useMemo(() => {
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredReviews.slice(start, start + PAGE_SIZE);
  }, [filteredReviews, page, totalPages]);

  const sentimentInfo = (s) => SENTIMENT_MAP[s] || SENTIMENT_MAP.NEU;
  const statusInfo = (s) => STATUS_MAP[s] || STATUS_MAP.PENDING;
  const getCustomerName = (r) => r?.customerName || r?.customer_name || r?.customer?.displayName || r?.customer?.name || r?.customerDisplayName || 'Khách hàng';
  const getStoreName = (r) => r?.storeName || r?.store_name || r?.store?.storeName || r?.store?.name || 'Gian hàng';

  return (
    <div className="review-feed">
      {/* ── Left Panel: Review List ── */}
      <div className="review-feed__list">
        <div className="review-feed__header">
          <h1 className="review-feed__title">Luồng Đánh Giá & AI Phân Tích</h1>
          <p className="review-feed__subtitle">
            {totalCount > 0 ? `${totalCount} đánh giá` : 'Theo dõi tất cả đánh giá từ các sàn'} · ViSoBERT ABSA Engine
          </p>
        </div>

        {/* Filter Bar Level 1 */}
        <div className="review-feed__filters">
          {/* Multi-Store Dropdown */}
          <select 
            className="review-feed__filter-select" 
            value={storeId} 
            onChange={(e) => { setStoreId(e.target.value); setSelectedProductName(''); setPage(1); }}
            style={{ fontWeight: 600, color: 'var(--color-accent)' }}
          >
            <option value="">🏬 Tất cả Cửa hàng ({storesList.length})</option>
            {storesList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.platformName ? `[${s.platformName}] ` : ''}{s.storeName}
              </option>
            ))}
          </select>

          <select className="review-feed__filter-select" value={rating} onChange={(e) => { setRating(e.target.value); setPage(1); }}>
            <option value="">Tất cả Rating</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 sao</option>
            <option value="4">⭐⭐⭐⭐ 4 sao</option>
            <option value="3">⭐⭐⭐ 3 sao</option>
            <option value="2">⭐⭐ 2 sao</option>
            <option value="1">⭐ 1 sao</option>
          </select>

          <select className="review-feed__filter-select" value={sentiment} onChange={(e) => { setSentiment(e.target.value); setPage(1); }}>
            <option value="">Tất cả Cảm xúc</option>
            <option value="POS">Tích cực (POS)</option>
            <option value="NEU">Trung tính (NEU)</option>
            <option value="NEG">Tiêu cực (NEG)</option>
          </select>

          <select className="review-feed__filter-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">Tất cả Trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="REPLIED">Đã phản hồi</option>
            <option value="SKIPPED">Bỏ qua</option>
          </select>

          <div className="review-feed__search">
            <Search size={14} className="review-feed__search-icon" />
            <input
              type="text"
              className="review-feed__search-input"
              placeholder="Tìm kiếm đánh giá..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Level 2: Product Selector Bar */}
        {productsList.length > 0 && (
          <div className="product-pills-bar">
            <span className="product-pills-label">
              <Package size={13} /> Sản phẩm:
            </span>
            <button
              type="button"
              className={`product-pill ${!selectedProductName ? 'active' : ''}`}
              onClick={() => { setSelectedProductName(''); setPage(1); }}
            >
              📦 Tất cả ({allReviews.length})
            </button>
            {productsList.map((p) => (
              <button
                key={p.name}
                type="button"
                className={`product-pill ${selectedProductName === p.name ? 'active' : ''}`}
                onClick={() => { setSelectedProductName(p.name); setPage(1); }}
                title={`${p.pos} Tích cực, ${p.neu} Trung tính, ${p.neg} Tiêu cực`}
              >
                <span>{p.name}</span>
                <span className="product-pill-badge">{p.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Product Summary Header Card */}
        {selectedProductMeta && (
          <div className="product-summary-card">
            <div className="product-summary-header">
              <div className="product-summary-info">
                <div className="product-summary-icon">📦</div>
                <div>
                  <div className="product-summary-title">{selectedProductMeta.name}</div>
                  <div className="product-summary-meta">
                    {selectedProductMeta.count} đánh giá · {selectedProductMeta.pos} Tích cực · {selectedProductMeta.neu} Trung tính · {selectedProductMeta.neg} Tiêu cực
                  </div>
                </div>
              </div>
              <div className="product-summary-health">
                <div className="product-health-score">{selectedProductMeta.healthScore}%</div>
                <div className="product-health-label">Chỉ số hài lòng</div>
              </div>
            </div>
            <div className="product-sentiment-bar-track">
              <div className="product-bar-seg pos" style={{ width: `${(selectedProductMeta.pos / selectedProductMeta.count) * 100}%` }} title={`${selectedProductMeta.pos} Tích cực`} />
              <div className="product-bar-seg neu" style={{ width: `${(selectedProductMeta.neu / selectedProductMeta.count) * 100}%` }} title={`${selectedProductMeta.neu} Trung tính`} />
              <div className="product-bar-seg neg" style={{ width: `${(selectedProductMeta.neg / selectedProductMeta.count) * 100}%` }} title={`${selectedProductMeta.neg} Tiêu cực`} />
            </div>
          </div>
        )}

        {/* Review Cards (Level 3) */}
        <div className="review-feed__cards">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div className="review-card review-card--skeleton" key={i}>
                <div className="skeleton" style={{ height: 14, width: '40%' }} />
                <div className="skeleton" style={{ height: 12, width: '100%' }} />
                <div className="skeleton" style={{ height: 12, width: '80%' }} />
                <div className="skeleton" style={{ height: 10, width: '50%' }} />
              </div>
            ))
          ) : displayedReviews.length === 0 ? (
            <div className="empty-state" style={{ padding: '36px 20px', textAlign: 'center', background: '#fff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-slate-200)' }}>
              <Sparkles size={40} className="text-accent" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-slate-900)', margin: '0 0 6px 0' }}>
                Chưa có dữ liệu đánh giá trong hệ thống
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)', maxWidth: '420px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
                Bấm nút bên dưới để khởi tạo tự động đánh giá mẫu kèm phân tích AI ViSoBERT chi tiết (Insight khách hàng, Nguyên nhân & Đề xuất)!
              </p>
              <button 
                className="btn btn-primary"
                onClick={handleSeedMockData}
                disabled={seeding}
                style={{ margin: '0 auto', padding: '10px 20px' }}
              >
                {seeding ? (
                  <>
                    <RefreshCw size={16} className="spin" /> Đang khởi tạo dữ liệu AI...
                  </>
                ) : (
                  <>
                    <Zap size={16} /> Khởi Tạo Đánh Giá Mẫu & AI Insights
                  </>
                )}
              </button>
            </div>
          ) : (
            displayedReviews.map((r, idx) => {
              const si = sentimentInfo(r.overallSentiment);
              const sti = statusInfo(r.status);
              return (
                <div
                  key={r.id}
                  className={`review-card ${selectedReview?.id === r.id ? 'active' : ''}`}
                  onClick={() => handleOpenDetail(r)}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="review-card__top">
                    <div>
                      <span className="review-card__customer">{getCustomerName(r)}</span>
                      <span className="review-card__store">· {getStoreName(r)}</span>
                    </div>
                    <div className="review-card__badges">
                      <span className={`badge ${si.cls}`}>{si.label}</span>
                      <span className={`badge ${sti.cls}`}>{sti.label}</span>
                    </div>
                  </div>

                  <StarRating rating={r.rating} />
                  <p className="review-card__text">{r.commentText}</p>

                  <div className="review-card__footer">
                    <span className="review-card__product">Sản phẩm: {r.productName || 'N/A'}</span>
                    <time>{r.reviewCreatedAt ? new Date(r.reviewCreatedAt).toLocaleString('vi-VN') : ''}</time>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="review-feed__pagination">
            <span className="review-feed__page-info">Trang {page}/{totalPages} · {totalCount} đánh giá</span>
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={14} /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let p;
                if (totalPages <= 5) p = i + 1;
                else if (page <= 3) p = i + 1;
                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                else p = page - 2 + i;
                return (
                  <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
                );
              })}
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {/* ── Right Panel: AI Detail Drawer ── */}
      <div className="review-detail">
        {!selectedReview && !detailLoading ? (
          <div className="review-detail--empty">
            <Eye size={40} strokeWidth={1.2} />
            <p>Chọn một đánh giá từ danh sách bên trái để xem phân tích AI chi tiết</p>
          </div>
        ) : detailLoading ? (
          <div className="review-detail__body">
            <div className="skeleton" style={{ height: 20, width: '60%' }} />
            <div className="skeleton" style={{ height: 80 }} />
            <div className="skeleton" style={{ height: 80 }} />
            <div className="skeleton" style={{ height: 40 }} />
          </div>
        ) : (
          <>
            <div className="review-detail__header">
              <h3><Brain size={16} /> AI ABSA Analysis</h3>
              <button className="review-detail__close" onClick={() => setSelectedReview(null)}><X size={16} /></button>
            </div>

            <div className="review-detail__body">
              {/* Original Review */}
              <div style={{ padding: '12px 14px', background: 'var(--surface-100)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--surface-700)', lineHeight: 1.6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 11, fontWeight: 600, color: 'var(--surface-500)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                  <MessageSquare size={12} /> Bình luận gốc
                </div>
                "{selectedReview.commentText}"
                <div style={{ marginTop: 8, display: 'flex', gap: 8, fontSize: 12, color: 'var(--surface-400)' }}>
                  <span>{'⭐'.repeat(selectedReview.rating || 0)}</span>
                  <span>· {getCustomerName(selectedReview)}</span>
                </div>
              </div>

              {/* Overall Sentiment */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface-600)' }}>Cảm xúc tổng quan:</span>
                <span className={`badge ${sentimentInfo(selectedReview.aiAnalysis?.overallSentiment || selectedReview.overallSentiment).cls}`}>
                  {sentimentInfo(selectedReview.aiAnalysis?.overallSentiment || selectedReview.overallSentiment).label}
                </span>
              </div>

              {/* Customer Insight */}
              {selectedReview.aiAnalysis?.customerInsight && (
                <div className="insight-card insight-card--customer" style={{ animationDelay: '.1s' }}>
                  <div className="insight-card__label"><Sparkles size={13} /> Customer Insight</div>
                  <p className="insight-card__text">{selectedReview.aiAnalysis.customerInsight}</p>
                </div>
              )}

              {/* Root Cause */}
              {selectedReview.aiAnalysis?.rootCause && (
                <div className="insight-card insight-card--root" style={{ animationDelay: '.15s' }}>
                  <div className="insight-card__label"><AlertTriangle size={13} /> Nguyên nhân cốt lõi</div>
                  <p className="insight-card__text">{selectedReview.aiAnalysis.rootCause}</p>
                </div>
              )}

              {/* Business Recommendation */}
              {selectedReview.aiAnalysis?.businessRecommendation && (
                <div className="insight-card insight-card--recommendation" style={{ animationDelay: '.2s' }}>
                  <div className="insight-card__label"><Lightbulb size={13} /> Khuyến nghị cải thiện</div>
                  <p className="insight-card__text">{selectedReview.aiAnalysis.businessRecommendation}</p>
                </div>
              )}

              {/* Aspects */}
              {selectedReview.aspects?.length > 0 && (
                <div style={{ animationDelay: '.25s' }} className="animate-fade-in-up">
                  <div className="aspects-section__title">Khía cạnh phân tích ({selectedReview.aspects.length})</div>
                  <div className="aspects-grid">
                    {selectedReview.aspects.map((a, idx) => {
                      const cls = a.sentiment === 'POS' ? 'aspect-chip--pos' : a.sentiment === 'NEG' ? 'aspect-chip--neg' : 'aspect-chip--neu';
                      return (
                        <span key={a.id || idx} className={`aspect-chip ${cls}`} style={{ animationDelay: `${idx * 50}ms` }}>
                          {a.microAspect}: <strong>{a.sentiment}</strong>
                          {a.sentimentScore != null && <span className="aspect-chip__score">({(a.sentimentScore * 100).toFixed(0)}%)</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Response Form */}
              <div className="response-section">
                <h4 className="response-section__title">
                  <Send size={14} style={{ display: 'inline', marginRight: 6 }} />
                  Gửi Phản hồi cho Khách hàng
                </h4>
                <form onSubmit={handleSendResponse}>
                  <textarea
                    className="response-section__textarea"
                    rows={4}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Nhập nội dung phản hồi hoặc sử dụng gợi ý AI bên trên..."
                  />
                  <button type="submit" className="response-section__send" disabled={sendingResponse || !responseText.trim()}>
                    {sendingResponse ? 'Đang gửi...' : '✨ Gửi Phản hồi ngay'}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
