import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Search, Star, ExternalLink, ChevronRight, Package, ArrowLeft } from 'lucide-react';
import { SHOPEE_STORES, STORE_CATEGORIES, getProductsForCategory } from '../data/shopeeData';

export default function ShopeeCategoryProductsPage() {
  const { shopId, categoryId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState(null);

  const store = SHOPEE_STORES.find((s) => s.id === shopId);
  const categories = STORE_CATEGORIES[shopId] || [];
  const currentCat = categories.find((c) => c.id === categoryId) || categories[0];

  // Get products for current category
  const products = useMemo(() => {
    if (!currentCat) return [];
    return getProductsForCategory(shopId, currentCat.id);
  }, [shopId, currentCat]);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  if (!store || !currentCat) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#ef4444' }}>
        <p>Không tìm thấy danh mục hoặc cửa hàng.</p>
        <Link to="/connect/shopee" style={{ color: '#4f46e5', textDecoration: 'none' }}>
          Quay lại danh sách cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '18px', fontSize: '13px', flexWrap: 'wrap' }}>
        <Link to="/connect" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>
          Kết nối sàn
        </Link>
        <ChevronRight size={14} style={{ color: '#94a3b8' }} />
        <Link to="/connect/shopee" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>
          Shopee Việt Nam
        </Link>
        <ChevronRight size={14} style={{ color: '#94a3b8' }} />
        <Link to={`/connect/shopee/${store.id}/categories`} style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>
          {store.name}
        </Link>
        <ChevronRight size={14} style={{ color: '#94a3b8' }} />
        <span style={{ color: '#334155', fontWeight: 600 }}>{currentCat.name}</span>
      </div>

      {/* Category Tabs Pill Switcher */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '20px',
        borderBottom: '1px solid #e2e8f0',
      }}>
        {categories.map((cat) => {
          const isActive = cat.id === currentCat.id;
          return (
            <button
              key={cat.id}
              onClick={() => navigate(`/connect/shopee/${store.id}/categories/${cat.id}/products`)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                border: isActive ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                background: isActive ? '#4f46e5' : '#fff',
                color: isActive ? '#fff' : '#475569',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              <span style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '10px',
                background: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                color: isActive ? '#fff' : '#64748b',
              }}>
                {cat.productCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Header - EXACTLY MATCHING IMAGE 1 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#1e293b' }}>
            Quản lý Sản phẩm
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            Theo dõi sản phẩm và tổng hợp cảm xúc khách hàng theo SKU · Danh mục: <strong style={{ color: '#334155' }}>{currentCat.name}</strong> ({filteredProducts.length} sản phẩm)
          </p>
        </div>
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Tìm theo tên SP, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
              background: '#fff',
            }}
          />
        </div>
      </div>

      {/* Product Grid - EXACTLY MATCHING IMAGE 1 */}
      {filteredProducts.length === 0 ? (
        <div style={{
          background: '#fff',
          padding: '48px',
          textAlign: 'center',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          color: '#64748b',
        }}>
          <Package size={36} style={{ marginBottom: '8px', color: '#cbd5e1' }} />
          <p style={{ margin: 0 }}>Không tìm thấy sản phẩm nào</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          {filteredProducts.map((p) => {
            const isHovered = hoveredId === p.id;
            return (
              <div
                key={p.id}
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: '#fff',
                  borderRadius: '8px',
                  border: isHovered ? '1px solid #c7d2fe' : '1px solid #e2e8f0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isHovered ? '0 4px 12px rgba(79, 70, 229, 0.08)' : '0 1px 2px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Top Section with Image and Info */}
                <div style={{ padding: '16px', flex: 1 }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '6px',
                        objectFit: 'cover',
                        background: '#f1f5f9',
                        flexShrink: 0,
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontSize: '11px',
                        background: '#e0e7ff',
                        color: '#3730a3',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 500,
                        display: 'inline-block',
                        marginBottom: '4px',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {p.storeBadge}
                      </span>
                      <h3
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#0f172a',
                          margin: '0 0 4px 0',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          height: '36px',
                        }}
                        title={p.name}
                      >
                        {p.name}
                      </h3>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        SKU: {p.sku}
                      </div>
                    </div>
                  </div>

                  {/* Rating and Reviews Row */}
                  <div style={{
                    marginTop: '14px',
                    paddingTop: '12px',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#eab308', fontWeight: 600 }}>
                      <Star size={14} fill="currentColor" /> {typeof p.rating === 'number' ? p.rating.toFixed(1) : p.rating}
                    </span>
                    <span style={{ color: '#64748b' }}>{p.reviewCount} đánh giá</span>
                  </div>
                </div>

                {/* Bottom Action Row - EXACTLY MATCHING IMAGE 1 */}
                <div style={{
                  background: '#f8fafc',
                  padding: '8px 16px',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Link
                    to={`/products/shopee/${p.id}`}
                    style={{
                      fontSize: '12px',
                      color: '#4f46e5',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    Xem phân tích AI →
                  </Link>
                  <Link
                    to={`/products/shopee/${p.id}`}
                    style={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                  >
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
