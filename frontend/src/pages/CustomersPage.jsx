import { useEffect, useState, useMemo, useCallback } from 'react';
import { Users, Store, Search, ShieldAlert, Crown, UserCheck, X, Sparkles, AlertTriangle, Eye, MessageSquare, BarChart3 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import customerService from '../services/customerService';
import './CustomersPage.css';

const RISK_BADGE = {
  NORMAL: 'badge--muted',
  POTENTIAL_BOMMER: 'badge--neg',
  VIP: 'badge--pos',
};

import { LAZADA_STORES, LAZADA_STORE_CATEGORIES, getLazadaProductsForCategory, generateLazadaMockComments } from '../data/lazadaData';
import { SHOPEE_STORES, STORE_CATEGORIES, getProductsForCategory, generateMockComments } from '../data/shopeeData';
import { TIKTOK_SHOP_STORES, TIKTOK_SHOP_STORE_CATEGORIES, getTikTokShopProductsForCategory, generateTikTokShopMockComments } from '../data/tiktokShopData';

function getConnectedStoresList() {
  const stores = [];
  try {
    const connections = JSON.parse(localStorage.getItem('connectedPlatforms') || '{}');
    if (connections['tiktok-shop']?.connected) {
      const selectedIds = Array.isArray(connections['tiktok-shop']?.stores) ? connections['tiktok-shop'].stores.map(String) : [];
      TIKTOK_SHOP_STORES.forEach(s => {
        if (selectedIds.length === 0 || selectedIds.includes(String(s.id))) {
          stores.push({ id: s.id, name: s.name, platform: 'TikTok Shop', reviewCount: s.reviewCount });
        }
      });
    }
    if (connections.shopee?.connected || localStorage.getItem('shopeeActivated') === 'true') {
      const selectedIds = Array.isArray(connections.shopee?.stores) ? connections.shopee.stores.map(String) : [];
      SHOPEE_STORES.forEach(s => {
        if (selectedIds.length === 0 || selectedIds.includes(String(s.id))) {
          stores.push({ id: s.id, name: s.name, platform: 'Shopee', reviewCount: s.reviewCount });
        }
      });
    }
    if (connections.lazada?.connected) {
      const selectedIds = Array.isArray(connections.lazada?.stores) ? connections.lazada.stores.map(String) : [];
      LAZADA_STORES.forEach(s => {
        if (selectedIds.length === 0 || selectedIds.includes(String(s.id))) {
          stores.push({ id: s.id, name: s.name, platform: 'Lazada', reviewCount: s.reviewCount || 0 });
        }
      });
    }
  } catch (e) {
    console.error(e);
  }

  // An empty list is meaningful: all platform/store connections are off.
  // Do not show fallback demo stores when the user has no active connection.
  return stores.filter((store, index, list) => list.findIndex(item => item.id === store.id) === index);
}

// --- Collect reviews from connected stores (same data source as ReviewFeedPage & PlatformProductDetailPage) ---

function getAllReviewsForStore(storeId, storeName, platform) {
  const reviews = [];

  // Lazada stores - sample up to 3 categories and 3 products each (blazing fast)
  if (LAZADA_STORE_CATEGORIES[storeId]) {
    const categories = (LAZADA_STORE_CATEGORIES[storeId] || []).slice(0, 3);
    categories.forEach(cat => {
      const prods = (getLazadaProductsForCategory(storeId, cat.id) || []).slice(0, 3);
      prods.forEach(prod => {
        const comments = generateLazadaMockComments(prod, 6);
        comments.forEach(c => {
          reviews.push({
            customerName: c.user,
            productName: prod.name,
            rating: c.rating,
            sentiment: c.sentiment,
            text: c.content,
            date: c.createdAt,
            storeName,
            platform,
          });
        });
      });
    });
    return reviews;
  }

  // TikTok Shop stores - sample up to 3 categories and 3 products each
  if (TIKTOK_SHOP_STORE_CATEGORIES[storeId]) {
    const categories = (TIKTOK_SHOP_STORE_CATEGORIES[storeId] || []).slice(0, 3);
    categories.forEach(cat => {
      const prods = (getTikTokShopProductsForCategory(storeId, cat.id) || []).slice(0, 3);
      prods.forEach(prod => {
        const comments = generateTikTokShopMockComments(prod, 6);
        comments.forEach(c => {
          reviews.push({
            customerName: c.user,
            productName: prod.name,
            rating: c.rating,
            sentiment: c.sentiment,
            text: c.content,
            date: c.createdAt,
            storeName,
            platform,
          });
        });
      });
    });
    return reviews;
  }

  // Shopee stores - sample up to 3 categories and 3 products each
  if (STORE_CATEGORIES[storeId]) {
    const categories = (STORE_CATEGORIES[storeId] || []).slice(0, 3);
    categories.forEach(cat => {
      const prods = (getProductsForCategory(storeId, cat.id, { includeComments: false }) || []).slice(0, 3);
      prods.forEach(prod => {
        const comments = generateMockComments(prod, 6);
        comments.forEach(c => {
          reviews.push({
            customerName: c.userName,
            productName: prod.name,
            rating: c.starRating,
            sentiment: c.sentiment,
            text: c.content,
            date: c.date,
            storeName,
            platform,
          });
        });
      });
    });
    return reviews;
  }

  return reviews;
}

function computeRiskLevel(posCount, neuCount, negCount) {
  const total = posCount + neuCount + negCount;
  if (total < 2) return 'NORMAL';
  const negPct = negCount / total;
  const posPct = posCount / total;
  if (negPct > 0.6) return 'POTENTIAL_BOMMER';
  if (posPct > 0.8) return 'VIP';
  return 'NORMAL';
}

function generateEvidenceAndRecommendation(riskLevel, posCount, neuCount, negCount) {
  const total = posCount + neuCount + negCount;
  const negPct = Math.round((negCount / Math.max(total, 1)) * 100);
  const posPct = Math.round((posCount / Math.max(total, 1)) * 100);

  if (riskLevel === 'POTENTIAL_BOMMER') {
    return {
      evidenceReason: `${negCount}/${total} đánh giá 1-2★ (${negPct}% Tiêu cực). Tỷ lệ đánh giá tiêu cực cao bất thường, cần xem xét kỹ lịch sử mua hàng.`,
      aiRecommendation: 'Cần liên hệ hỗ trợ xác minh kỹ đơn hàng trước khi giải quyết bồi hoàn. Hạn chế tặng Voucher tự động.',
    };
  }
  if (riskLevel === 'VIP') {
    return {
      evidenceReason: `${posCount}/${total} đánh giá 4-5★ (${posPct}% Tích cực). Khách hàng thân thiết với lịch sử mua sắm tốt.`,
      aiRecommendation: 'Khách hàng thân thiết VIP. Đề xuất tự động gửi tặng Voucher giảm giá 15% định kỳ.',
    };
  }
  return {
    evidenceReason: `Đánh giá tự nhiên, tỷ lệ khen/chê hợp lý (${posPct}% Tích cực, ${negPct}% Tiêu cực), không có dấu hiệu bất thường.`,
    aiRecommendation: 'Tài khoản bình thường. Tiếp tục chăm sóc theo quy trình tiêu chuẩn.',
  };
}

function generateCustomersForStore(store) {
  const storeReviews = getAllReviewsForStore(store.id, store.name, store.platform);

  // Profiles are scoped to one store. Single-pass aggregation for maximum speed.
  const customerMap = new Map();
  for (let i = 0; i < storeReviews.length; i++) {
    const review = storeReviews[i];
    const name = review.customerName || 'Khách hàng ẩn danh';
    const customerKey = `${store.id}::${name}`;
    let cust = customerMap.get(customerKey);
    if (!cust) {
      cust = {
        customerName: name,
        reviews: [],
        storeName: store.name,
        platform: store.platform,
        posCount: 0,
        neuCount: 0,
        negCount: 0,
        ratingSum: 0,
      };
      customerMap.set(customerKey, cust);
    }
    cust.reviews.push(review);
    if (review.sentiment === 'POS') cust.posCount++;
    else if (review.sentiment === 'NEU') cust.neuCount++;
    else if (review.sentiment === 'NEG') cust.negCount++;
    cust.ratingSum += (review.rating || 0);
  }

  const results = [];
  let idCounter = 1;

  customerMap.forEach((data) => {
    const customerName = data.customerName;
    const reviews = data.reviews;
    const posCount = data.posCount;
    const neuCount = data.neuCount;
    const negCount = data.negCount;
    const totalReviews = reviews.length;
    const avgRating = parseFloat((data.ratingSum / Math.max(totalReviews, 1)).toFixed(1));

    const riskLevel = computeRiskLevel(posCount, neuCount, negCount);
    const { evidenceReason, aiRecommendation } = generateEvidenceAndRecommendation(riskLevel, posCount, neuCount, negCount);

    const prefix = data.platform === 'TikTok Shop' ? 'TTS' : data.platform === 'Shopee' ? 'SHP' : 'LZD';
    const userNum = 300000 + (idCounter * 7 + customerName.length * 43) % 690000;

    // Take up to 5 most recent reviews with REAL product names
    const recentReviews = reviews.slice(0, 5).map(r => ({
      prod: r.productName,
      rating: r.rating,
      text: r.text,
      sentiment: r.sentiment,
      date: typeof r.date === 'string' ? r.date.split('T')[0] : r.date,
    }));

    results.push({
      id: `cust-${idCounter++}`,
      displayName: customerName,
      platformUserId: `${prefix}_USER_${userNum}`,
      storeName: data.storeName,
      platform: data.platform,
      totalReviewsCount: totalReviews,
      riskLevel,
      posCount,
      neuCount,
      negCount,
      avgRating,
      evidenceReason,
      aiRecommendation,
      recentReviews,
    });
  });

  // Sort: POTENTIAL_BOMMER first, then VIP, then NORMAL (by review count desc within each group)
  const riskOrder = { POTENTIAL_BOMMER: 0, VIP: 1, NORMAL: 2 };
  results.sort((a, b) => {
    const orderDiff = (riskOrder[a.riskLevel] ?? 2) - (riskOrder[b.riskLevel] ?? 2);
    if (orderDiff !== 0) return orderDiff;
    return b.totalReviewsCount - a.totalReviewsCount;
  });

  return results;
}

export default function CustomersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStoreId = searchParams.get('store');
  const savedStoreId = sessionStorage.getItem('absa_customers_selected_store');

  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(() => urlStoreId || savedStoreId || null);
  const [customersCache, setCustomersCache] = useState({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(() => searchParams.get('search') || sessionStorage.getItem('absa_customers_search') || '');
  const [riskFilter, setRiskFilter] = useState(() => searchParams.get('risk') || sessionStorage.getItem('absa_customers_risk') || '');
  const [page, setPage] = useState(() => {
    const p = parseInt(searchParams.get('page') || sessionStorage.getItem('absa_customers_page') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const [pageSize, setPageSize] = useState(() => {
    const ps = parseInt(sessionStorage.getItem('absa_customers_pagesize') || '10', 10);
    return isNaN(ps) ? 10 : ps;
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // 1. Initial load: read stores immediately (0ms) and load the targeted or first store
  useEffect(() => {
    const list = getConnectedStoresList();
    setStores(list);
    if (list.length > 0) {
      const currentId = urlStoreId || savedStoreId;
      const targetStore = list.find(s => s.id === currentId) || list[0];
      setSelectedStoreId(targetStore.id);
      sessionStorage.setItem('absa_customers_selected_store', targetStore.id);

      // Keep searchParams in sync without polluting history
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('store', targetStore.id);
        return next;
      }, { replace: true });

      // Compute ONLY for targetStore (takes < 1ms)
      setLoading(true);
      const timer = setTimeout(() => {
        const initialCusts = generateCustomersForStore(targetStore);
        setCustomersCache({ [targetStore.id]: initialCusts });
        setLoading(false);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, []);

  // 2. Select store on-demand (cached = 0ms switch, uncached = 1ms computation)
  function handleSelectStore(store) {
    if (selectedStoreId === store.id) return;
    setSelectedStoreId(store.id);
    setPage(1);
    setSelectedCustomer(null);
    sessionStorage.setItem('absa_customers_selected_store', store.id);
    sessionStorage.setItem('absa_customers_page', '1');
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('store', store.id);
      next.set('page', '1');
      return next;
    }, { replace: true });

    if (!customersCache[store.id]) {
      setLoading(true);
      setTimeout(() => {
        const custs = generateCustomersForStore(store);
        setCustomersCache(prev => ({ ...prev, [store.id]: custs }));
        setLoading(false);
      }, 10);
    }
  }

  // Continuously record scroll position so returning to this page restores the exact scroll position
  useEffect(() => {
    const container = document.querySelector('.page-content');
    const handleScroll = () => {
      const top = container ? container.scrollTop : window.scrollY;
      sessionStorage.setItem('absa_customers_scroll_top', String(top));
    };

    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Restore scroll position, store card in view, and highlighted customer row when data loads
  useEffect(() => {
    if (!loading && currentCustomers.length > 0) {
      const savedScrollTop = sessionStorage.getItem('absa_customers_scroll_top');
      const lastCustId = sessionStorage.getItem('absa_customers_last_customer_id');

      const timer = setTimeout(() => {
        // 1. Scroll active store card into view horizontally
        const activeStoreBtn = document.querySelector('.customer-store-card.active');
        if (activeStoreBtn) {
          activeStoreBtn.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
        }

        // 2. Restore vertical scroll position on both container and window
        const container = document.querySelector('.page-content');
        if (savedScrollTop !== null) {
          const top = parseInt(savedScrollTop, 10);
          if (!isNaN(top)) {
            if (container) container.scrollTop = top;
            window.scrollTo(0, top);
          }
        }

        // 3. Highlight and focus customer row if returning from analysis
        if (lastCustId) {
          const row = document.getElementById(`customer-row-${lastCustId}`);
          if (row) {
            row.scrollIntoView({ block: 'nearest', behavior: 'instant' });
            row.classList.add('customer-row--returned');
            setTimeout(() => row.classList.remove('customer-row--returned'), 3500);
          }
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [loading, selectedStoreId, page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    sessionStorage.setItem('absa_customers_page', String(newPage));
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    }, { replace: true });
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
    sessionStorage.setItem('absa_customers_search', val);
    sessionStorage.setItem('absa_customers_page', '1');
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (val) next.set('search', val);
      else next.delete('search');
      next.set('page', '1');
      return next;
    }, { replace: true });
  };

  const handleRiskFilterChange = (val) => {
    setRiskFilter(val);
    setPage(1);
    sessionStorage.setItem('absa_customers_risk', val);
    sessionStorage.setItem('absa_customers_page', '1');
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (val) next.set('risk', val);
      else next.delete('risk');
      next.set('page', '1');
      return next;
    }, { replace: true });
  };

  const handlePageSizeChange = (val) => {
    setPageSize(val);
    setPage(1);
    sessionStorage.setItem('absa_customers_pagesize', String(val));
    sessionStorage.setItem('absa_customers_page', '1');
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', '1');
      return next;
    }, { replace: true });
  };

  async function handleRiskChange(id, newRisk, e) {
    if (e) e.stopPropagation();
    try {
      await customerService.updateRiskLevel(id, newRisk).catch(() => null);
      if (selectedStoreId && customersCache[selectedStoreId]) {
        setCustomersCache(prev => ({
          ...prev,
          [selectedStoreId]: prev[selectedStoreId].map(c => c.id === id ? { ...c, riskLevel: newRisk } : c)
        }));
      }
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(prev => prev ? { ...prev, riskLevel: newRisk } : null);
      }
    } catch (err) {
      alert('Lỗi cập nhật mức rủi ro: ' + err.message);
    }
  }

  const activeStore = stores.find(s => s.id === selectedStoreId) || null;
  const currentCustomers = (selectedStoreId && customersCache[selectedStoreId]) || [];

  const customers = useMemo(() => {
    let items = currentCustomers;
    if (riskFilter) items = items.filter(c => c.riskLevel === riskFilter);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(c =>
        (c.displayName || '').toLowerCase().includes(q) ||
        (c.platformUserId || '').toLowerCase().includes(q) ||
        (c.storeName || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [currentCustomers, riskFilter, search]);

  const totalCustomers = customers.length;
  const vipCount = customers.filter((c) => c.riskLevel === 'VIP').length;
  const riskCount = customers.filter((c) => c.riskLevel === 'POTENTIAL_BOMMER').length;
  const maxReviews = Math.max(1, ...customers.map((c) => c.totalReviewsCount || 0));

  const totalPages = Math.ceil(totalCustomers / pageSize) || 1;

  const displayedCustomers = useMemo(() => {
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;
    return customers.slice(start, start + pageSize);
  }, [customers, page, totalPages, pageSize]);

  return (
    <div className="customers-page">
      {/* Header */}
      <div className="customers-page__header">
        <div>
          <h1 className="customers-page__title">
            <Users size={22} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 8 }} />
            Quản lý Khách hàng & Phân tích Rủi ro
          </h1>
          <p className="customers-page__subtitle">Phát hiện review bomber, phân loại khách VIP & quản lý bằng chứng rủi ro đa sàn</p>
        </div>
        <div className="customers-page__filters">
          <select
            className="input"
            style={{ width: 'auto', minWidth: 180 }}
            value={riskFilter}
            onChange={(e) => handleRiskFilterChange(e.target.value)}
          >
            <option value="">Tất cả mức rủi ro ({totalCustomers})</option>
            <option value="NORMAL">🟢 Bình thường (NORMAL)</option>
            <option value="POTENTIAL_BOMMER">🔴 Nghi ngờ BOMMER ({riskCount})</option>
            <option value="VIP">⭐ Khách hàng VIP ({vipCount})</option>
          </select>
          <div className="customers-search">
            <Search size={14} className="customers-search__icon" />
            <input
              type="text"
              className="customers-search__input"
              placeholder="Tìm tên KH, Mã sàn, Store..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="customers-stats stagger-children">
        <div className="customer-stat-card">
          <div className="customer-stat__icon customer-stat__icon--total"><Users size={20} /></div>
          <div>
            <div className="customer-stat__value">{totalCustomers.toLocaleString()}</div>
            <div className="customer-stat__label">Tổng khách hàng theo dõi</div>
          </div>
        </div>
        <div className="customer-stat-card">
          <div className="customer-stat__icon customer-stat__icon--vip"><Crown size={20} /></div>
          <div>
            <div className="customer-stat__value">{vipCount}</div>
            <div className="customer-stat__label">Khách hàng VIP (Ưu đãi)</div>
          </div>
        </div>
        <div className="customer-stat-card">
          <div className="customer-stat__icon customer-stat__icon--risk"><ShieldAlert size={20} /></div>
          <div>
            <div className="customer-stat__value">{riskCount}</div>
            <div className="customer-stat__label">Nghi ngờ Review Bomber</div>
          </div>
        </div>
      </div>

      {/* Store scope selector: customers are only visible after choosing a shop. */}
      <section className="customer-store-groups">
        <div className="customer-store-groups__header">
          <div>
            <h2>Cửa hàng đã kết nối</h2>
            <p>Chọn một cửa hàng để xem khách hàng đã mua hàng và đánh giá cửa hàng đó.</p>
          </div>
          {activeStore && <span className="customer-store-groups__scope">Phạm vi: {activeStore.name}</span>}
        </div>
        {stores.length === 0 ? (
          <div className="customer-store-groups__empty">Chưa có cửa hàng nào được kết nối. Dữ liệu khách hàng đang được ẩn.</div>
        ) : (
          <div className="customer-store-groups__list">
            {stores.map((store) => {
              const cached = customersCache[store.id];
              const countLabel = cached ? `${cached.length} khách hàng đã phân tích` : `${store.reviewCount || 100}+ đánh giá`;
              return (
                <button
                  type="button"
                  key={store.id}
                  className={`customer-store-card ${selectedStoreId === store.id ? 'active' : ''}`}
                  onClick={() => handleSelectStore(store)}
                >
                  <span className="customer-store-card__platform">{store.platform}</span>
                  <strong>{store.name}</strong>
                  <span>{countLabel}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Table */}
      <div className="customers-table-wrapper">
        {loading ? (
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div className="skeleton" style={{ width: 24, height: 24, borderRadius: '50%' }} />
              <div className="skeleton" style={{ width: 260, height: 16 }} />
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--surface-100)' }}>
                <div className="skeleton" style={{ width: 140, height: 18 }} />
                <div className="skeleton" style={{ width: 110, height: 16 }} />
                <div className="skeleton" style={{ width: 130, height: 16 }} />
                <div className="skeleton" style={{ width: 80, height: 16 }} />
                <div className="skeleton" style={{ flex: 1, height: 18 }} />
                <div className="skeleton" style={{ width: 64, height: 28, borderRadius: 6 }} />
              </div>
            ))}
          </div>
        ) : !activeStore ? (
          <div className="empty-state">
            <Store size={36} />
            <p>{stores.length ? 'Hãy chọn một cửa hàng để xem danh sách khách hàng.' : 'Kết nối cửa hàng để bắt đầu phân tích khách hàng.'}</p>
          </div>
        ) : displayedCustomers.length === 0 ? (
          <div className="empty-state">
            <Users size={36} />
            <p>Không tìm thấy khách hàng phù hợp.</p>
          </div>
        ) : (
          <table className="customers-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Mã trên sàn</th>
                <th>Gian hàng</th>
                <th>Đánh giá</th>
                <th>Mức Rủi Ro & Bằng Chứng AI</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {displayedCustomers.map((c) => {
                const isRisk = c.riskLevel === 'POTENTIAL_BOMMER';
                const isVip = c.riskLevel === 'VIP';
                const reasonCls = isRisk ? 'evidence-reason-tag--risk' : isVip ? 'evidence-reason-tag--vip' : 'evidence-reason-tag--normal';
                
                return (
                  <tr 
                    key={c.id} 
                    id={`customer-row-${c.id}`}
                    onClick={() => setSelectedCustomer(c)}
                    className={selectedCustomer?.id === c.id ? 'active' : ''}
                  >
                    <td>
                      <div className="customer-row__name">
                        <div className="customer-avatar">{c.displayName.charAt(0).toUpperCase()}</div>
                        <div>
                          <span className="customer-display-name">{c.displayName}</span>
                          <div style={{ fontSize: 11, color: 'var(--surface-400)' }}>{c.platform || 'Lazada'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="customer-platform-tag">{c.platformUserId}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--surface-800)' }}>
                      {c.storeName}
                    </td>
                    <td>
                      <div className="customer-review-bar">
                        <span style={{ fontWeight: 700, minWidth: 24 }}>{c.totalReviewsCount}</span>
                        <div className="customer-review-bar__bg">
                          <div className="customer-review-bar__fill" style={{ width: `${(c.totalReviewsCount / maxReviews) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div>
                          <span className={`badge ${RISK_BADGE[c.riskLevel] || 'badge--muted'}`}>
                            {isRisk ? '🔴 POTENTIAL_BOMMER' : isVip ? '⭐ VIP' : '🟢 NORMAL'}
                          </span>
                        </div>
                        <span className={`evidence-reason-tag ${reasonCls}`}>
                          {c.evidenceReason}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button 
                          type="button"
                          className="btn btn--secondary btn--sm"
                          style={{ fontSize: 11, padding: '4px 8px' }}
                          onClick={() => setSelectedCustomer(c)}
                        >
                          <Eye size={12} /> Bằng chứng
                        </button>
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          style={{ fontSize: 11, padding: '4px 8px' }}
                          onClick={() => {
                            const container = document.querySelector('.page-content');
                            const scrollY = container ? container.scrollTop : window.scrollY;
                            sessionStorage.setItem('absa_customers_scroll_top', String(scrollY));
                            sessionStorage.setItem('absa_customers_last_customer_id', c.id);
                            navigate(`/customers/${c.id}/analysis`, { 
                              state: { 
                                customer: c, 
                                returnStoreId: selectedStoreId, 
                                returnPage: page,
                                returnScrollTop: scrollY,
                                returnCustomerId: c.id
                              } 
                            });
                          }}
                          aria-label={`Xem phân tích ${c.displayName || 'khách hàng'}`}
                        >
                          <BarChart3 size={12} /> Phân tích
                        </button>
                        <select
                          className="customer-risk-select"
                          value={c.riskLevel}
                          onChange={(e) => handleRiskChange(c.id, e.target.value, e)}
                        >
                          <option value="NORMAL">NORMAL</option>
                          <option value="POTENTIAL_BOMMER">POTENTIAL_BOMMER</option>
                          <option value="VIP">VIP</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {totalCustomers > 0 && (
          <div className="customers-pagination">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span className="customers-pagination__info">
                Hiển thị {Math.min((page - 1) * pageSize + 1, totalCustomers)} - {Math.min(page * pageSize, totalCustomers)} trên {totalCustomers} khách hàng · Trang {page}/{totalPages}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--surface-500)' }}>
                <span>Hiển thị:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="input"
                  style={{ width: 'auto', padding: '3px 8px', fontSize: 12, height: 28, background: 'var(--surface-0)' }}
                >
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>
              </div>
            </div>

            <div className="customers-pagination__controls">
              <button disabled={page <= 1} onClick={() => handlePageChange(1)} title="Trang đầu">«</button>
              <button disabled={page <= 1} onClick={() => handlePageChange(page - 1)} title="Trang trước">‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let p;
                if (totalPages <= 5) p = i + 1;
                else if (page <= 3) p = i + 1;
                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                else p = page - 2 + i;
                return (
                  <button key={p} className={p === page ? 'active' : ''} onClick={() => handlePageChange(p)}>{p}</button>
                );
              })}
              <button disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)} title="Trang kế">›</button>
              <button disabled={page >= totalPages} onClick={() => handlePageChange(totalPages)} title="Trang cuối">»</button>
            </div>
          </div>
        )}
      </div>

      {/* Right Drawer: AI Customer Evidence Panel */}
      {selectedCustomer && (
        <div className="customer-drawer-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="customer-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="customer-drawer__header">
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--brand-600)', fontWeight: 700, letterSpacing: '.05em', marginBottom: 4 }}>
                  <Sparkles size={13} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} />
                  Bằng Chứng AI & Hồ Sơ Rủi Ro Khách Hàng
                </div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--surface-900)' }}>
                  {selectedCustomer.displayName}
                </h3>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <span className="customer-platform-tag">{selectedCustomer.platformUserId}</span>
                  <span style={{ fontSize: 12, color: 'var(--surface-500)', alignSelf: 'center' }}>· {selectedCustomer.storeName}</span>
                </div>
              </div>
              <button className="customer-drawer__close" onClick={() => setSelectedCustomer(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="customer-drawer__body">
              {/* Risk Badge & Stats */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--surface-50)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-200)' }}>
                <div style={{ textAlign: 'center', paddingRight: 12, borderRight: '1px solid var(--surface-200)' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--surface-900)' }}>⭐ {selectedCustomer.avgRating || 4.5}</div>
                  <div style={{ fontSize: 11, color: 'var(--surface-500)' }}>Điểm đánh giá TB</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12, marginBottom: 4, fontWeight: 600 }}>
                    <span style={{ color: '#16a34a' }}>👍 {selectedCustomer.posCount} Khen</span>
                    <span style={{ color: '#d97706' }}>😐 {selectedCustomer.neuCount} Trung tính</span>
                    <span style={{ color: '#dc2626' }}>👎 {selectedCustomer.negCount} Chê</span>
                  </div>
                  <span className={`badge ${RISK_BADGE[selectedCustomer.riskLevel]}`}>
                    {selectedCustomer.riskLevel}
                  </span>
                </div>
              </div>

              {/* Evidence Box */}
              <div className={`evidence-box ${selectedCustomer.riskLevel === 'POTENTIAL_BOMMER' ? 'evidence-box--risk' : selectedCustomer.riskLevel === 'VIP' ? 'evidence-box--vip' : 'evidence-box--normal'}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 6 }}>
                  {selectedCustomer.riskLevel === 'POTENTIAL_BOMMER' ? (
                    <AlertTriangle size={15} />
                  ) : selectedCustomer.riskLevel === 'VIP' ? (
                    <Crown size={15} />
                  ) : (
                    <UserCheck size={15} />
                  )}
                  Dẫn Chứng Phân Tích Rủi Ro ViSoBERT
                </div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
                  {selectedCustomer.evidenceReason}
                </p>
              </div>

              {/* AI Recommendation */}
              <div style={{ background: '#e0e7ff', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid #c7d2fe', fontSize: 13, color: '#3730a3' }}>
                <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} /> Đề xuất xử lý cho bộ phận CSKH:
                </div>
                {selectedCustomer.aiRecommendation}
              </div>

              {/* Recent Review History */}
              {selectedCustomer.recentReviews?.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--surface-900)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageSquare size={14} /> Lịch sử đánh giá thực tế ({selectedCustomer.recentReviews.length})
                  </div>
                  {selectedCustomer.recentReviews.map((r, i) => (
                    <div key={i} className="customer-review-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: 'var(--surface-900)' }}>{r.prod}</span>
                        <span style={{ color: '#f59e0b', fontWeight: 700 }}>{'⭐'.repeat(r.rating)}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--surface-700)', lineHeight: 1.5 }}>
                        "{r.text}"
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--surface-400)' }}>
                        <span className={`badge ${r.sentiment === 'POS' ? 'badge--pos' : r.sentiment === 'NEG' ? 'badge--neg' : 'badge--neu'}`}>
                          {r.sentiment}
                        </span>
                        <time>{r.date}</time>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
