import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Layers, ArrowLeft, Package, Sparkles, Store } from 'lucide-react';
import { SHOPEE_STORES, STORE_CATEGORIES, getProductsForCategory } from '../data/shopeeData';

export default function ShopeeCategoriesPage() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState(null);

  const store = SHOPEE_STORES.find((s) => s.id === shopId);
  const categories = STORE_CATEGORIES[shopId] || [];

  if (!store) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#ef4444' }}>
        <p>Không tìm thấy cửa hàng.</p>
        <Link to="/connect/shopee" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>
          Quay lại danh sách cửa hàng
        </Link>
      </div>
    );
  }

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', fontSize: '13px', flexWrap: 'wrap' }}>
        <Link to="/connect" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>
          Kết nối sàn
        </Link>
        <ChevronRight size={14} style={{ color: '#94a3b8' }} />
        <Link to="/connect/shopee" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>
          Shopee Việt Nam
        </Link>
        <ChevronRight size={14} style={{ color: '#94a3b8' }} />
        <span style={{ color: '#334155', fontWeight: 600 }}>{store.name}</span>
        <ChevronRight size={14} style={{ color: '#94a3b8' }} />
        <span style={{ color: '#64748b' }}>Danh mục ngành hàng</span>
      </div>

      {/* Store Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #ee4d2d, #ff6633)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            boxShadow: '0 4px 12px rgba(238, 77, 45, 0.25)',
          }}>
            {store.avatar}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#0f172a' }}>{store.name}</h1>
              <span style={{
                background: '#fee2e2',
                color: '#dc2626',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
              }}>
                SHOPEE MALL
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              {store.description}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', padding: '0 12px', borderRight: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Ngành hàng</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{store.category}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '0 12px', borderRight: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Số danh mục</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#4f46e5' }}>{categories.length}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '0 12px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Người theo dõi</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{store.followers.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Categories Section Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} style={{ color: '#4f46e5' }} />
            Danh mục sản phẩm của cửa hàng
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            Chọn danh mục để xem danh sách sản phẩm và phân tích cảm xúc phản hồi theo AI
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Tìm danh mục sản phẩm..."
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

      {/* Category Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '18px',
      }}>
        {filteredCategories.map((cat) => {
          const isHovered = hoveredId === cat.id;
          const prods = getProductsForCategory(store.id, cat.id);
          const itemCount = prods.length > 0 ? prods.length : cat.productCount;

          return (
            <div
              key={cat.id}
              onClick={() => navigate(`/connect/shopee/${store.id}/categories/${cat.id}/products`)}
              onMouseEnter={() => setHoveredId(cat.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: '#fff',
                borderRadius: '12px',
                border: isHovered ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isHovered ? '0 8px 24px rgba(79, 70, 229, 0.12)' : '0 1px 3px rgba(0,0,0,0.03)',
                transform: isHovered ? 'translateY(-3px)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: isHovered ? 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' : '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    transition: 'all 0.2s ease',
                  }}>
                    {cat.icon}
                  </div>
                  <span style={{
                    fontSize: '11px',
                    background: '#f1f5f9',
                    color: '#475569',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                  }}>
                    {cat.code}
                  </span>
                </div>

                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: isHovered ? '#4f46e5' : '#0f172a',
                  margin: '0 0 6px 0',
                  transition: 'color 0.2s ease',
                }}>
                  {cat.name}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: '#64748b',
                  lineHeight: '1.5',
                  margin: '0 0 16px 0',
                  minHeight: '40px',
                }}>
                  {cat.description}
                </p>
              </div>

              <div style={{
                paddingTop: '14px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{
                  fontSize: '12px',
                  color: '#3b82f6',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#eff6ff',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}>
                  <Package size={13} /> {itemCount} sản phẩm
                </span>

                <span style={{
                  fontSize: '13px',
                  color: '#4f46e5',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  Xem sản phẩm <ChevronRight size={15} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div style={{
          background: '#fff',
          padding: '48px',
          textAlign: 'center',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          color: '#64748b',
        }}>
          <Layers size={36} style={{ marginBottom: '8px', color: '#cbd5e1' }} />
          <p style={{ margin: 0 }}>Không tìm thấy danh mục phù hợp với từ khóa "{search}"</p>
        </div>
      )}
    </div>
  );
}
