import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Star, ExternalLink } from 'lucide-react';
import productService from '../services/productService';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  async function loadProducts() {
    try {
      setLoading(true);
      const res = await productService.getProducts({ page, pageSize: 12, search });
      setProducts(res?.items || []);
      setTotalPages(res?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#1e293b' }}>Quản lý Sản phẩm</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Theo dõi sản phẩm và tổng hợp cảm xúc khách hàng theo SKU</p>
        </div>
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Tìm theo tên SP, SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>Đang tải danh sách sản phẩm...</div>
      ) : products.length === 0 ? (
        <div style={{ background: '#fff', padding: '48px', textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          <Package size={36} style={{ marginBottom: '8px', color: '#cbd5e1' }} />
          <p style={{ margin: 0 }}>Không tìm thấy sản phẩm nào</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {products.map((p) => (
              <div key={p.id} style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px', flex: 1 }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <img
                      src={p.imageUrl || 'https://via.placeholder.com/60?text=SP'}
                      alt={p.name}
                      style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover', background: '#f1f5f9' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '11px', background: '#e0e7ff', color: '#3730a3', padding: '1px 6px', borderRadius: '4px', fontWeight: 500 }}>
                        {p.storeName || 'Shop'}
                      </span>
                      <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: '4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.name}>
                        {p.name}
                      </h3>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>SKU: {p.sku || 'N/A'}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#eab308', fontWeight: 600 }}>
                      <Star size={14} fill="currentColor" /> {p.averageRating ? p.averageRating.toFixed(1) : '5.0'}
                    </span>
                    <span style={{ color: '#64748b' }}>{p.reviewCount} đánh giá</span>
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link to={`/products/${p.id}`} style={{ fontSize: '12px', color: '#4f46e5', fontWeight: 500, textDecoration: 'none' }}>
                    Xem phân tích AI →
                  </Link>
                  {p.productUrl && (
                    <a href={p.productUrl} target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '12px', cursor: 'pointer' }}
              >
                Trước
              </button>
              <span style={{ padding: '6px 12px', fontSize: '12px', color: '#64748b' }}>
                Trang {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '12px', cursor: 'pointer' }}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
