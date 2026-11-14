import { useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Package, Store, ChevronRight, ShoppingBag, BarChart3, Search, X, Star } from 'lucide-react';
import { SHOPEE_STORES, STORE_CATEGORIES, getProductsForCategory } from '../data/shopeeData';
import { LAZADA_STORES, LAZADA_STORE_CATEGORIES, getLazadaProductsForCategory } from '../data/lazadaData';
import { TIKTOK_SHOP_STORES, TIKTOK_SHOP_STORE_CATEGORIES, getTikTokShopProductsForCategory } from '../data/tiktokShopData';

// Helper: read connected platforms from localStorage
function getConnectedPlatforms() {
  try {
    return JSON.parse(localStorage.getItem('connectedPlatforms') || '{}');
  } catch { return {}; }
}

// Platform info
const PLATFORM_INFO = {
  shopee: {
    name: 'Shopee Việt Nam',
    icon: '🛒',
    color: '#ee4d2d',
    gradient: 'linear-gradient(135deg, #ee4d2d, #ff6633)',
    getStores: () => SHOPEE_STORES,
    getCategories: () => STORE_CATEGORIES,
    getProducts: (storeId, categoryId) => getProductsForCategory(storeId, categoryId, { includeComments: false }),
  },
  lazada: {
    name: 'Lazada Việt Nam',
    icon: '🏪',
    color: '#0f146d',
    gradient: 'linear-gradient(135deg, #0f146d, #2b31a6)',
    getStores: () => LAZADA_STORES,
    getCategories: () => LAZADA_STORE_CATEGORIES,
    getProducts: getLazadaProductsForCategory,
  },
  'tiktok-shop': {
    name: 'TikTok Shop Việt Nam',
    icon: '🎵',
    color: '#111827',
    gradient: 'linear-gradient(135deg, #111827, #374151)',
    getStores: () => TIKTOK_SHOP_STORES,
    getCategories: () => TIKTOK_SHOP_STORE_CATEGORIES,
    getProducts: getTikTokShopProductsForCategory,
  },
};

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = (searchParams.get('search') || '').trim();
  const connectedPlatforms = useMemo(() => getConnectedPlatforms(), []);

  // Search across all platforms and products if searchQuery is provided
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    const results = [];

    // Collect products from all platforms
    Object.entries(PLATFORM_INFO).forEach(([pCode, pInfo]) => {
      const stores = pInfo.getStores();
      const categories = pInfo.getCategories();

      stores.forEach((store) => {
        const storeCats = categories[store.id] || [];
        storeCats.forEach((cat) => {
          const prods = pInfo.getProducts(store.id, cat.id);
          prods.forEach((prod) => {
            const matchName = prod.name?.toLowerCase().includes(query);
            const matchStore = store.name?.toLowerCase().includes(query);
            const matchCat = cat.name?.toLowerCase().includes(query);
            if (matchName || matchStore || matchCat) {
              results.push({
                ...prod,
                platformCode: pCode,
                platformName: pInfo.name,
                platformIcon: pInfo.icon,
                storeName: store.name,
                categoryName: cat.name,
              });
            }
          });
        });
      });
    });

    return results;
  }, [searchQuery]);

  const connectedList = useMemo(() => {
    return Object.entries(connectedPlatforms)
      .filter(([, v]) => v.connected)
      .map(([code, data]) => {
        const info = PLATFORM_INFO[code];
        if (!info) return null;
        const allStores = info.getStores();
        const connectedStoreIds = Array.isArray(data.stores) ? data.stores : [];
        const connectedStores = connectedStoreIds.length
          ? allStores.filter((s) => connectedStoreIds.includes(s.id))
          : allStores;
        const categories = info.getCategories();
        const totalCategories = connectedStores.reduce(
          (sum, s) => sum + (categories[s.id]?.length || 0), 0
        );
        const totalReviews = connectedStores.reduce((sum, s) => {
          const cats = categories[s.id] || [];
          return sum + cats.reduce((catSum, cat) => {
            const prods = info.getProducts(s.id, cat.id);
            return catSum + prods.reduce((pSum, p) => pSum + (p.reviewCount || 0), 0);
          }, 0);
        }, 0);
        const avgRating = connectedStores.length > 0
          ? (connectedStores.reduce((sum, s) => sum + (s.rating || 0), 0) / connectedStores.length).toFixed(1)
          : '0.0';

        return {
          code,
          ...info,
          connectedAt: data.connectedAt,
          storeCount: connectedStores.length,
          totalCategories,
          totalReviews,
          avgRating,
          stores: connectedStores,
        };
      })
      .filter(Boolean);

    if (list.length === 0) {
      // Demo Fallback
      list = [
        {
          code: 'shopee',
          ...PLATFORM_INFO.shopee,
          connectedAt: new Date().toISOString(),
          storeCount: 3,
          totalCategories: 3 * STORE_CATEGORIES['spe-01']?.length || 15,
          totalReviews: SHOPEE_STORES.slice(0, 3).reduce((sum, s) => sum + s.reviewCount, 0),
          avgRating: '4.8',
          stores: SHOPEE_STORES.slice(0, 3),
        },
        {
          code: 'lazada',
          ...PLATFORM_INFO.lazada,
          connectedAt: new Date().toISOString(),
          storeCount: 3,
          totalCategories: 3 * LAZADA_STORE_CATEGORIES['lzd-01']?.length || 15,
          totalReviews: LAZADA_STORES.slice(0, 3).reduce((sum, s) => sum + (s.reviewCount || 450), 0),
          avgRating: '4.7',
          stores: LAZADA_STORES.slice(0, 3),
        },
        {
          code: 'tiktok-shop',
          ...PLATFORM_INFO['tiktok-shop'],
          connectedAt: new Date().toISOString(),
          storeCount: 2,
          totalCategories: 2 * TIKTOK_SHOP_STORE_CATEGORIES['tts-01']?.length || 10,
          totalReviews: TIKTOK_SHOP_STORES.slice(0, 2).reduce((sum, s) => sum + s.reviewCount, 0),
          avgRating: '4.9',
          stores: TIKTOK_SHOP_STORES.slice(0, 2),
        },
      ];
    }
    return list;
  }, [connectedPlatforms]);

  const totalStores = connectedList.reduce((s, p) => s + p.storeCount, 0);
  const totalReviews = connectedList.reduce((s, p) => s + p.totalReviews, 0);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Quản lý Sản phẩm
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            Theo dõi sản phẩm và tổng hợp cảm xúc khách hàng từ các sàn TMĐT đã kết nối
          </p>
        </div>

        {searchQuery && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#e0e7ff', color: '#4338ca', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
          }}>
            <Search size={14} />
            <span>Kết quả tìm kiếm cho: "{searchQuery}" ({searchResults.length})</span>
            <button
              type="button"
              onClick={() => setSearchParams({})}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#4338ca' }}
              title="Xóa tìm kiếm"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* When search is active, show search results */}
      {searchQuery ? (
        <div style={{ marginBottom: '36px' }}>
          {searchResults.length === 0 ? (
            <div style={{
              background: '#fff', padding: '48px 24px', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b'
            }}>
              <Package size={40} style={{ color: '#cbd5e1', marginBottom: '8px' }} />
              <h3 style={{ fontSize: '15px', color: '#334155', margin: '0 0 6px' }}>Không tìm thấy sản phẩm nào</h3>
              <p style={{ fontSize: '13px', margin: 0 }}>Vui lòng thử lại với từ khóa khác hoặc xóa bộ lọc tìm kiếm.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {searchResults.map((prod) => (
                <div
                  key={`${prod.platformCode}-${prod.id}`}
                  onClick={() => navigate(`/products/${prod.platformCode}/${prod.id}`)}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 180ms ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.07)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                    <img
                      src={prod.image}
                      alt={prod.name}
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #f1f5f9' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        display: 'inline-block', fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                        background: prod.platformCode === 'shopee' ? '#fff1f0' : prod.platformCode === 'lazada' ? '#eff6ff' : '#f8fafc',
                        color: prod.platformCode === 'shopee' ? '#e11d48' : prod.platformCode === 'lazada' ? '#1d4ed8' : '#0f172a',
                        marginBottom: '4px'
                      }}>
                        {prod.platformIcon} {prod.platformName}
                      </span>
                      <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {prod.name}
                      </h4>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <span>{prod.storeName}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600, color: '#d97706' }}>
                      <Star size={13} fill="#d97706" /> {prod.rating} ({prod.reviewCount})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '32px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #f0f4ff, #e8ecff)',
          padding: '20px', borderRadius: '12px', border: '1px solid #c7d2fe',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShoppingBag size={18} style={{ color: '#4f46e5' }} />
            <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 600 }}>Sàn kết nối</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#312e81' }}>{connectedList.length}</div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          padding: '20px', borderRadius: '12px', border: '1px solid #bbf7d0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Store size={18} style={{ color: '#16a34a' }} />
            <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>Tổng cửa hàng</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#14532d' }}>{totalStores}</div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
          padding: '20px', borderRadius: '12px', border: '1px solid #fde68a',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <BarChart3 size={18} style={{ color: '#d97706' }} />
            <span style={{ fontSize: '12px', color: '#b45309', fontWeight: 600 }}>Tổng đánh giá</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#78350f' }}>{totalReviews.toLocaleString()}</div>
        </div>
      </div>

      {/* Connected Platforms */}
      {connectedList.length === 0 ? (
        <div style={{
          background: '#fff', padding: '64px 32px', textAlign: 'center',
          borderRadius: '12px', border: '1px solid #e2e8f0',
        }}>
          <Package size={48} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#475569', margin: '0 0 6px 0' }}>
            Chưa kết nối sàn TMĐT nào
          </h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px 0' }}>
            Hãy đến trang <Link to="/connect" style={{ color: '#4f46e5', fontWeight: 500 }}>Kết nối sàn</Link> để bắt đầu
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {connectedList.map((platform) => (
            <div
              key={platform.code}
              onClick={() => navigate(`/products/${platform.code}`)}
              style={{
                background: '#fff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${platform.color}15`;
                e.currentTarget.style.borderColor = platform.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              {/* Platform gradient header */}
              <div style={{
                background: platform.gradient, padding: '18px 24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '32px' }}>{platform.icon}</span>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                      {platform.name}
                    </h2>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                      Kết nối: {platform.connectedAt ? new Date(platform.connectedAt).toLocaleDateString('vi-VN') : '—'}
                    </span>
                  </div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255,255,255,0.2)', padding: '8px 16px',
                  borderRadius: '20px', color: '#fff', fontSize: '13px', fontWeight: 600,
                }}>
                  Xem sản phẩm <ChevronRight size={16} />
                </div>
              </div>

              {/* Stats row */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1px', background: '#f1f5f9',
              }}>
                {[
                  { label: 'Cửa hàng', value: platform.storeCount, color: '#4f46e5' },
                  { label: 'Danh mục', value: platform.totalCategories, color: '#0ea5e9' },
                  { label: 'Đánh giá', value: platform.totalReviews.toLocaleString(), color: '#f59e0b' },
                  { label: 'Rating TB', value: `⭐ ${platform.avgRating}`, color: '#10b981' },
                ].map((stat, i) => (
                  <div key={i} style={{ background: '#fff', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, marginBottom: '4px' }}>{stat.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Store previews */}
              <div style={{ padding: '14px 24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {platform.stores.slice(0, 6).map((s) => (
                  <span key={s.id} style={{
                    fontSize: '12px', padding: '4px 10px', borderRadius: '16px',
                    background: '#f1f5f9', color: '#475569', fontWeight: 500,
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                  }}>
                    {s.avatar} {s.name}
                  </span>
                ))}
                {platform.stores.length > 6 && (
                  <span style={{ fontSize: '12px', color: '#94a3b8', alignSelf: 'center' }}>
                    +{platform.stores.length - 6} khác
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
