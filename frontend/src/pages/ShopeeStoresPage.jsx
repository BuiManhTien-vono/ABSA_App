import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Search, Star, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import { SHOPEE_STORES, STORE_CATEGORIES } from '../data/shopeeData';

export const MOCK_SHOPEE_STORES = SHOPEE_STORES;

export default function ShopeeStoresPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState(null);

  const filteredStores = MOCK_SHOPEE_STORES.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalProducts = MOCK_SHOPEE_STORES.reduce((sum, s) => sum + s.productCount, 0);
  const totalReviews = MOCK_SHOPEE_STORES.reduce((sum, s) => sum + s.reviewCount, 0);
  const avgRating = (MOCK_SHOPEE_STORES.reduce((sum, s) => sum + s.rating, 0) / MOCK_SHOPEE_STORES.length).toFixed(1);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', fontSize: '13px' }}>
        <Link to="/connect" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>
          Kết nối sàn
        </Link>
        <ChevronRight size={14} style={{ color: '#94a3b8' }} />
        <span style={{ color: '#334155', fontWeight: 600 }}>Shopee Việt Nam</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #ee4d2d, #ff6633)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '16px', fontWeight: 700,
            }}>S</div>
            <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#1e293b' }}>Quản lý Cửa hàng Shopee</h1>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            Quản lý và theo dõi {MOCK_SHOPEE_STORES.length} cửa hàng đã kết nối trên Shopee Việt Nam
          </p>
        </div>
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Tìm cửa hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 32px', borderRadius: '6px',
              border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '6px' }}>Tổng cửa hàng</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>{MOCK_SHOPEE_STORES.length}</div>
        </div>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '6px' }}>Tổng sản phẩm</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#4f46e5' }}>{totalProducts.toLocaleString()}</div>
        </div>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '6px' }}>Tổng đánh giá</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#0ea5e9' }}>{totalReviews.toLocaleString()}</div>
        </div>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '6px' }}>Rating trung bình</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#eab308', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={18} fill="#eab308" /> {avgRating}
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginBottom: '14px' }}>
        Danh sách cửa hàng ({filteredStores.length})
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {filteredStores.map((store) => {
          const isHovered = hoveredId === store.id;
          return (
            <div
              key={store.id}
              onClick={() => navigate(`/connect/shopee/${store.id}/categories`)}
              onMouseEnter={() => setHoveredId(store.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: '#fff',
                borderRadius: '10px',
                border: isHovered ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isHovered ? '0 4px 16px rgba(79, 70, 229, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                transform: isHovered ? 'translateY(-2px)' : 'none',
              }}
            >
              <div style={{ padding: '18px' }}>
                {/* Store header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #f0f4ff, #e0e7ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px',
                  }}>
                    {store.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {store.name}
                    </h3>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      <span style={{
                        background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px',
                        fontFamily: 'monospace', fontSize: '10px',
                      }}>{store.code}</span>
                      <span style={{ margin: '0 6px' }}>·</span>
                      <span>{store.category}</span>
                      <span style={{ margin: '0 6px' }}>·</span>
                      <span style={{ color: '#4f46e5', fontWeight: 500 }}>
                        {(STORE_CATEGORIES[store.id] || []).length} danh mục
                      </span>
                    </div>
                  </div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 500,
                    background: '#dcfce7', color: '#15803d',
                  }}>
                    <CheckCircle2 size={11} /> Active
                  </span>
                </div>

                {/* Stats */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px',
                  padding: '12px', background: '#f8fafc', borderRadius: '8px',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>Sản phẩm</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>{store.productCount}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>Đánh giá</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>{store.reviewCount.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>Rating</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                      <Star size={11} fill="#eab308" /> {store.rating}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>Doanh thu</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>{store.revenue}</div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: '10px 18px', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Kết nối: {new Date(store.connectedAt).toLocaleDateString('vi-VN')}
                </span>
                <span style={{
                  fontSize: '12px', color: '#4f46e5', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  Xem danh mục <ChevronRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStores.length === 0 && (
        <div style={{
          background: '#fff', padding: '48px', textAlign: 'center',
          borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b',
        }}>
          <Store size={36} style={{ marginBottom: '8px', color: '#cbd5e1' }} />
          <p style={{ margin: 0 }}>Không tìm thấy cửa hàng phù hợp</p>
        </div>
      )}
    </div>
  );
}
