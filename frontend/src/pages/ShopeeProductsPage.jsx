import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, Star, Package, ChevronRight, ExternalLink, Eye, ShoppingCart, TrendingUp, ArrowUpDown } from 'lucide-react';
import { MOCK_SHOPEE_STORES } from './ShopeeStoresPage';

// Mock products data generator per store
const MOCK_PRODUCTS_BY_STORE = {
  'spe-01': [
    { id: 'p01-01', name: 'Áo Sơ Mi Nữ Tay Dài Cổ V Phong Cách Hàn Quốc', sku: 'BELLA-SM-001', price: 289000, originalPrice: 450000, stock: 152, sold: 1230, rating: 4.9, reviewCount: 342, status: 'active', image: '👚' },
    { id: 'p01-02', name: 'Váy Đầm Công Sở Dáng Chữ A Sang Trọng', sku: 'BELLA-VD-002', price: 459000, originalPrice: 650000, stock: 78, sold: 856, rating: 4.7, reviewCount: 198, status: 'active', image: '👗' },
    { id: 'p01-03', name: 'Quần Jean Nữ Ống Rộng Lưng Cao', sku: 'BELLA-QJ-003', price: 359000, originalPrice: 520000, stock: 234, sold: 2100, rating: 4.8, reviewCount: 567, status: 'active', image: '👖' },
    { id: 'p01-04', name: 'Áo Khoác Blazer Nữ Dáng Rộng Oversize', sku: 'BELLA-BL-004', price: 589000, originalPrice: 890000, stock: 45, sold: 423, rating: 4.6, reviewCount: 89, status: 'active', image: '🧥' },
    { id: 'p01-05', name: 'Chân Váy Midi Xếp Ly Vintage', sku: 'BELLA-CV-005', price: 239000, originalPrice: 380000, stock: 189, sold: 1567, rating: 4.8, reviewCount: 412, status: 'active', image: '👗' },
    { id: 'p01-06', name: 'Set Đồ Nữ Croptop + Quần Ống Rộng', sku: 'BELLA-SET-006', price: 399000, originalPrice: 599000, stock: 67, sold: 934, rating: 4.5, reviewCount: 234, status: 'active', image: '👚' },
    { id: 'p01-07', name: 'Áo Phông Nữ Cotton Oversize Unisex', sku: 'BELLA-AP-007', price: 159000, originalPrice: 250000, stock: 456, sold: 3400, rating: 4.9, reviewCount: 890, status: 'active', image: '👕' },
    { id: 'p01-08', name: 'Đầm Maxi Hoa Nhí Dáng Suông', sku: 'BELLA-DM-008', price: 419000, originalPrice: 620000, stock: 0, sold: 678, rating: 4.4, reviewCount: 145, status: 'out_of_stock', image: '👗' },
  ],
  'spe-02': [
    { id: 'p02-01', name: 'Serum Vitamin C Brighten & Glow 30ml', sku: 'MPHQ-SR-001', price: 345000, originalPrice: 520000, stock: 234, sold: 4560, rating: 4.8, reviewCount: 890, status: 'active', image: '💧' },
    { id: 'p02-02', name: 'Kem Chống Nắng SPF50+ PA++++ Tone Up', sku: 'MPHQ-KCN-002', price: 289000, originalPrice: 420000, stock: 567, sold: 8900, rating: 4.9, reviewCount: 1230, status: 'active', image: '🧴' },
    { id: 'p02-03', name: 'Mặt Nạ Ngủ Dưỡng Ẩm Hyaluronic Acid', sku: 'MPHQ-MN-003', price: 199000, originalPrice: 350000, stock: 123, sold: 2340, rating: 4.7, reviewCount: 456, status: 'active', image: '🎭' },
    { id: 'p02-04', name: 'Son Tint Lì Mềm Mượt Không Khô Môi', sku: 'MPHQ-ST-004', price: 169000, originalPrice: 280000, stock: 345, sold: 5670, rating: 4.6, reviewCount: 789, status: 'active', image: '💄' },
    { id: 'p02-05', name: 'Sữa Rửa Mặt Amino Acid Dịu Nhẹ', sku: 'MPHQ-SRM-005', price: 145000, originalPrice: 250000, stock: 456, sold: 3450, rating: 4.8, reviewCount: 567, status: 'active', image: '🧼' },
    { id: 'p02-06', name: 'Toner AHA BHA PHA Tẩy Da Chết Nhẹ', sku: 'MPHQ-TN-006', price: 259000, originalPrice: 380000, stock: 89, sold: 1890, rating: 4.5, reviewCount: 345, status: 'active', image: '💧' },
    { id: 'p02-07', name: 'Phấn Nước Cushion Che Phủ Hoàn Hảo', sku: 'MPHQ-PN-007', price: 389000, originalPrice: 550000, stock: 0, sold: 2340, rating: 4.7, reviewCount: 678, status: 'out_of_stock', image: '🪞' },
    { id: 'p02-08', name: 'Kem Dưỡng Ẩm Cica Repair Phục Hồi', sku: 'MPHQ-KD-008', price: 275000, originalPrice: 420000, stock: 178, sold: 1560, rating: 4.6, reviewCount: 234, status: 'active', image: '🧴' },
    { id: 'p02-09', name: 'Bộ Cọ Trang Điểm 12 Cây Chuyên Nghiệp', sku: 'MPHQ-BC-009', price: 459000, originalPrice: 780000, stock: 56, sold: 890, rating: 4.4, reviewCount: 123, status: 'active', image: '🖌️' },
  ],
  'spe-03': [
    { id: 'p03-01', name: 'Tai Nghe Bluetooth True Wireless ANC', sku: 'DTTU-TN-001', price: 890000, originalPrice: 1500000, stock: 123, sold: 3456, rating: 4.7, reviewCount: 890, status: 'active', image: '🎧' },
    { id: 'p03-02', name: 'Chuột Gaming Không Dây RGB 16000 DPI', sku: 'DTTU-CG-002', price: 450000, originalPrice: 750000, stock: 234, sold: 5670, rating: 4.8, reviewCount: 1234, status: 'active', image: '🖱️' },
    { id: 'p03-03', name: 'Bàn Phím Cơ Wireless Hot-Swap 75%', sku: 'DTTU-BP-003', price: 1290000, originalPrice: 1800000, stock: 45, sold: 890, rating: 4.9, reviewCount: 456, status: 'active', image: '⌨️' },
    { id: 'p03-04', name: 'Loa Bluetooth Mini Chống Nước IPX7', sku: 'DTTU-LB-004', price: 590000, originalPrice: 950000, stock: 189, sold: 2340, rating: 4.6, reviewCount: 567, status: 'active', image: '🔊' },
    { id: 'p03-05', name: 'Sạc Nhanh GaN 65W 3 Cổng USB-C PD', sku: 'DTTU-SN-005', price: 450000, originalPrice: 690000, stock: 345, sold: 7890, rating: 4.8, reviewCount: 1560, status: 'active', image: '🔌' },
    { id: 'p03-06', name: 'Đèn Bàn LED Thông Minh Điều Khiển App', sku: 'DTTU-DB-006', price: 690000, originalPrice: 1100000, stock: 67, sold: 1230, rating: 4.5, reviewCount: 345, status: 'active', image: '💡' },
    { id: 'p03-07', name: 'Camera WiFi Trong Nhà 2K 360 Độ', sku: 'DTTU-CM-007', price: 590000, originalPrice: 890000, stock: 156, sold: 3450, rating: 4.7, reviewCount: 789, status: 'active', image: '📷' },
    { id: 'p03-08', name: 'Ổ Cứng SSD Portable 1TB USB 3.2', sku: 'DTTU-SSD-008', price: 1490000, originalPrice: 2200000, stock: 78, sold: 1890, rating: 4.8, reviewCount: 456, status: 'active', image: '💾' },
    { id: 'p03-09', name: 'Hub USB-C 8 in 1 HDMI 4K', sku: 'DTTU-HUB-009', price: 690000, originalPrice: 1050000, stock: 0, sold: 2100, rating: 4.6, reviewCount: 567, status: 'out_of_stock', image: '🔗' },
    { id: 'p03-10', name: 'Webcam Full HD 1080p Tự Động Lấy Nét', sku: 'DTTU-WC-010', price: 450000, originalPrice: 720000, stock: 234, sold: 1560, rating: 4.5, reviewCount: 234, status: 'active', image: '📹' },
  ],
};

// Generate default products for stores without specific data
function getProductsForStore(shopId) {
  if (MOCK_PRODUCTS_BY_STORE[shopId]) {
    return MOCK_PRODUCTS_BY_STORE[shopId];
  }

  const store = MOCK_SHOPEE_STORES.find((s) => s.id === shopId);
  if (!store) return [];

  const defaultProducts = [
    { suffix: 'SP-001', name: `${store.category} cao cấp chính hãng`, price: 299000, originalPrice: 450000, stock: 120, sold: 890, rating: 4.7, reviewCount: 234, status: 'active' },
    { suffix: 'SP-002', name: `${store.category} phổ thông giá tốt`, price: 159000, originalPrice: 280000, stock: 345, sold: 2340, rating: 4.5, reviewCount: 567, status: 'active' },
    { suffix: 'SP-003', name: `${store.category} mới nhất 2026`, price: 459000, originalPrice: 690000, stock: 67, sold: 456, rating: 4.8, reviewCount: 123, status: 'active' },
    { suffix: 'SP-004', name: `${store.category} nhập khẩu chất lượng`, price: 589000, originalPrice: 890000, stock: 89, sold: 1230, rating: 4.6, reviewCount: 345, status: 'active' },
    { suffix: 'SP-005', name: `${store.category} hot trend bán chạy`, price: 239000, originalPrice: 380000, stock: 234, sold: 3450, rating: 4.9, reviewCount: 789, status: 'active' },
    { suffix: 'SP-006', name: `${store.category} combo tiết kiệm`, price: 399000, originalPrice: 599000, stock: 45, sold: 678, rating: 4.4, reviewCount: 156, status: 'active' },
    { suffix: 'SP-007', name: `${store.category} limited edition`, price: 799000, originalPrice: 1200000, stock: 12, sold: 234, rating: 4.8, reviewCount: 89, status: 'active' },
    { suffix: 'SP-008', name: `${store.category} sale sốc cuối mùa`, price: 129000, originalPrice: 350000, stock: 0, sold: 5670, rating: 4.3, reviewCount: 890, status: 'out_of_stock' },
    { suffix: 'SP-009', name: `${store.category} mẫu mới exclusive`, price: 349000, originalPrice: 520000, stock: 156, sold: 1890, rating: 4.7, reviewCount: 456, status: 'active' },
    { suffix: 'SP-010', name: `${store.category} freeship toàn quốc`, price: 199000, originalPrice: 320000, stock: 567, sold: 4560, rating: 4.6, reviewCount: 678, status: 'active' },
  ];

  return defaultProducts.map((p, i) => ({
    id: `${shopId}-p${String(i + 1).padStart(2, '0')}`,
    sku: `${store.code}-${p.suffix}`,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    stock: p.stock,
    sold: p.sold,
    rating: p.rating,
    reviewCount: p.reviewCount,
    status: p.status,
    image: store.avatar,
  }));
}

export default function ShopeeProductsPage() {
  const { shopId } = useParams();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [hoveredId, setHoveredId] = useState(null);

  const store = MOCK_SHOPEE_STORES.find((s) => s.id === shopId);
  const products = useMemo(() => getProductsForStore(shopId), [shopId]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === 'price') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'sold') result.sort((a, b) => b.sold - a.sold);
    else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    else result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, search, sortBy]);

  if (!store) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#ef4444' }}>
        Không tìm thấy cửa hàng.
      </div>
    );
  }

  const totalRevenue = products.reduce((sum, p) => sum + p.price * p.sold, 0);
  const activeCount = products.filter((p) => p.status === 'active').length;
  const outOfStockCount = products.filter((p) => p.status === 'out_of_stock').length;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumb */}
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
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #f0f4ff, #e0e7ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px',
          }}>
            {store.avatar}
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#1e293b' }}>{store.name}</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
              <span style={{
                background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px',
                fontFamily: 'monospace', fontSize: '11px',
              }}>{store.code}</span>
              <span style={{ margin: '0 8px' }}>·</span>
              {store.category}
              <span style={{ margin: '0 8px' }}>·</span>
              <Star size={12} fill="#eab308" color="#eab308" style={{ verticalAlign: '-1px' }} /> {store.rating}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1',
              fontSize: '13px', color: '#334155', background: '#fff', cursor: 'pointer',
            }}
          >
            <option value="name">Sắp xếp: Tên</option>
            <option value="price">Sắp xếp: Giá</option>
            <option value="sold">Sắp xếp: Bán chạy</option>
            <option value="rating">Sắp xếp: Rating</option>
          </select>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm sản phẩm, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px 8px 32px', borderRadius: '6px',
                border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Package size={15} style={{ color: '#4f46e5' }} />
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Tổng sản phẩm</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>{products.length}</div>
          <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>
            {activeCount} đang bán · {outOfStockCount} hết hàng
          </div>
        </div>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <ShoppingCart size={15} style={{ color: '#0ea5e9' }} />
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Tổng đã bán</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>
            {products.reduce((sum, p) => sum + p.sold, 0).toLocaleString()}
          </div>
        </div>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <TrendingUp size={15} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Doanh thu ước tính</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#10b981' }}>
            {(totalRevenue / 1000000000).toFixed(1)} tỷ
          </div>
        </div>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Star size={15} style={{ color: '#eab308' }} />
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Tổng đánh giá</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>
            {products.reduce((sum, p) => sum + p.reviewCount, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginBottom: '14px' }}>
        Sản phẩm ({filteredProducts.length})
      </h2>
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {filteredProducts.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <Package size={36} style={{ marginBottom: '8px', color: '#cbd5e1' }} />
            <p style={{ margin: 0 }}>Không tìm thấy sản phẩm</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '12px 16px', width: '40%' }}>Sản phẩm</th>
                <th style={{ padding: '12px 16px' }}>SKU</th>
                <th style={{ padding: '12px 16px' }}>Giá bán</th>
                <th style={{ padding: '12px 16px' }}>Kho</th>
                <th style={{ padding: '12px 16px' }}>Đã bán</th>
                <th style={{ padding: '12px 16px' }}>Rating</th>
                <th style={{ padding: '12px 16px' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const isHovered = hoveredId === p.id;
                const discount = Math.round((1 - p.price / p.originalPrice) * 100);
                return (
                  <tr
                    key={p.id}
                    onMouseEnter={() => setHoveredId(p.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: isHovered ? '#fafbff' : 'transparent',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '8px',
                          background: '#f1f5f9', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '20px', flexShrink: 0,
                        }}>
                          {p.image}
                        </div>
                        <span style={{
                          fontWeight: 500, color: '#0f172a',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          maxWidth: '280px', display: 'block',
                        }} title={p.name}>
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>
                      {p.sku}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#ee4d2d' }}>
                        {p.price.toLocaleString('vi-VN')}đ
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through' }}>
                        {p.originalPrice.toLocaleString('vi-VN')}đ
                      </div>
                      <span style={{
                        fontSize: '10px', background: '#fff1f2', color: '#e11d48',
                        padding: '1px 4px', borderRadius: '3px', fontWeight: 600,
                      }}>-{discount}%</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: p.stock === 0 ? '#ef4444' : '#334155' }}>
                      {p.stock === 0 ? 'Hết hàng' : p.stock.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>
                      {p.sold.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#eab308', fontWeight: 600 }}>
                        <Star size={12} fill="#eab308" /> {p.rating}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{p.reviewCount} đánh giá</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 500,
                        background: p.status === 'active' ? '#dcfce7' : '#fee2e2',
                        color: p.status === 'active' ? '#15803d' : '#b91c1c',
                      }}>
                        {p.status === 'active' ? 'Đang bán' : 'Hết hàng'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
