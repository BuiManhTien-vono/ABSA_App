import { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Store, ChevronRight, ShoppingBag, BarChart3 } from 'lucide-react';
import { SHOPEE_STORES, STORE_CATEGORIES } from '../data/shopeeData';
import { LAZADA_STORES, LAZADA_STORE_CATEGORIES } from '../data/lazadaData';

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
  },
  lazada: {
    name: 'Lazada Việt Nam',
    icon: '🏪',
    color: '#0f146d',
    gradient: 'linear-gradient(135deg, #0f146d, #2b31a6)',
    getStores: () => LAZADA_STORES,
    getCategories: () => LAZADA_STORE_CATEGORIES,
  },
};

export default function ProductsPage() {
  const navigate = useNavigate();
  const connectedPlatforms = useMemo(() => getConnectedPlatforms(), []);

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
        const totalReviews = connectedStores.reduce((sum, s) => sum + (s.reviewCount || 0), 0);
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
  }, [connectedPlatforms]);

  const totalStores = connectedList.reduce((s, p) => s + p.storeCount, 0);
  const totalReviews = connectedList.reduce((s, p) => s + p.totalReviews, 0);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
          Quản lý Sản phẩm
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
          Theo dõi sản phẩm và tổng hợp cảm xúc khách hàng từ các sàn TMĐT đã kết nối
        </p>
      </div>

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
