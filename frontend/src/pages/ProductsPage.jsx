import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { shopService } from '../services/shopService';
import PlatformBadge from '../components/common/PlatformBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import './ProductsPage.css';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const shopsRes = await shopService.getShops();
        setShops(shopsRes.data || []);

        if (shopsRes.data && shopsRes.data.length > 0) {
          const prodRes = await productService.getByShop(shopsRes.data[0].id);
          setProducts(prodRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleShopChange = async (shopId) => {
    setSelectedShop(shopId);
    setLoading(true);
    try {
      if (shopId === 'all') {
        setProducts([]);
      } else {
        const res = await productService.getByShop(shopId);
        setProducts(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <div className="filter-group">
          <label>Lọc theo Cửa hàng:</label>
          <select value={selectedShop} onChange={(e) => handleShopChange(e.target.value)}>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.shopName} ({s.platform})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <EmptyState message="Chưa có sản phẩm nào cho cửa hàng này" />
      ) : (
        <div className="products-grid">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <div className="product-card-header">
                <PlatformBadge platform={p.platform} />
                <span className="product-category">{p.category || 'N/A'}</span>
              </div>
              <h3 className="product-name">{p.name}</h3>
              <div className="product-metrics">
                <span>{p.reviewCount} đánh giá</span>
                <span className="pos">+{p.positiveCount}</span>
                <span className="neg">-{p.negativeCount}</span>
              </div>
              <Link to={`/products/${p.id}`} className="view-detail-btn">
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
