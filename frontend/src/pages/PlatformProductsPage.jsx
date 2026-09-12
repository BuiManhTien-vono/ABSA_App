import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  Package,
  Search,
  Star,
  Store,
} from 'lucide-react';
import {
  SHOPEE_STORES,
  STORE_CATEGORIES,
  getProductsForCategory,
} from '../data/shopeeData';
import {
  LAZADA_STORES,
  LAZADA_STORE_CATEGORIES,
  getLazadaProductsForCategory,
} from '../data/lazadaData';
import {
  TIKTOK_SHOP_STORES,
  TIKTOK_SHOP_STORE_CATEGORIES,
  getTikTokShopProductsForCategory,
} from '../data/tiktokShopData';
import './PlatformProductsPage.css';

const PLATFORM_DATA = {
  shopee: {
    name: 'Shopee Việt Nam',
    shortName: 'Shopee',
    icon: '🛒',
    stores: SHOPEE_STORES,
    categories: STORE_CATEGORIES,
    getProducts: (storeId, categoryId) => (
      getProductsForCategory(storeId, categoryId, { includeComments: false })
    ),
  },
  lazada: {
    name: 'Lazada Việt Nam',
    shortName: 'Lazada',
    icon: '🏪',
    stores: LAZADA_STORES,
    categories: LAZADA_STORE_CATEGORIES,
    getProducts: getLazadaProductsForCategory,
  },
  'tiktok-shop': {
    name: 'TikTok Shop Việt Nam',
    shortName: 'TikTok Shop',
    icon: '🎵',
    stores: TIKTOK_SHOP_STORES,
    categories: TIKTOK_SHOP_STORE_CATEGORIES,
    getProducts: getTikTokShopProductsForCategory,
  },
};

function readConnectedStoreIds(platformCode, allStores) {
  try {
    const connections = JSON.parse(localStorage.getItem('connectedPlatforms') || '{}');
    const connection = connections[platformCode];
    if (connection?.connected) {
      const storeIds = Array.isArray(connection.stores) ? connection.stores.map(String) : [];
      return storeIds.length
        ? storeIds
        : allStores.map((store) => String(store.id));
    }

    if (platformCode === 'shopee' && localStorage.getItem('shopeeActivated') === 'true') {
      return allStores.map((store) => String(store.id));
    }
  } catch {
    return [];
  }
  return [];
}

function formatPrice(value) {
  return typeof value === 'number'
    ? `${value.toLocaleString('vi-VN')} ₫`
    : 'Chưa cập nhật';
}

export default function PlatformProductsPage() {
  const { platformCode: routePlatformCode } = useParams();
  const platformCode = routePlatformCode?.toLowerCase();
  const platform = PLATFORM_DATA[platformCode];
  const connectedStoreIds = useMemo(
    () => readConnectedStoreIds(platformCode, platform?.stores || []),
    [platform, platformCode],
  );
  const [expandedStoreIds, setExpandedStoreIds] = useState(
    () => new Set(connectedStoreIds.slice(0, 1)),
  );
  const [search, setSearch] = useState('');

  const storeGroups = useMemo(() => {
    if (!platform) return [];
    const connectedIdSet = new Set(connectedStoreIds);
    const query = search.trim().toLocaleLowerCase('vi');

    return platform.stores
      .filter((store) => connectedIdSet.has(String(store.id)))
      .map((store) => {
        const products = (platform.categories[store.id] || []).flatMap((category) => (
          platform.getProducts(store.id, category.id).map((product) => ({
            ...product,
            storeName: product.storeName || store.name,
            platformCode,
          }))
        ));
        if (!query) return { store, products };

        const storeMatches = [store.name, store.code, store.category]
          .some((value) => value?.toLocaleLowerCase('vi').includes(query));
        const matchingProducts = products.filter((product) => (
          [product.name, product.sku, product.categoryName]
            .some((value) => value?.toLocaleLowerCase('vi').includes(query))
        ));
        return storeMatches || matchingProducts.length
          ? { store, products: storeMatches ? products : matchingProducts }
          : null;
      })
      .filter(Boolean);
  }, [connectedStoreIds, platform, platformCode, search]);

  if (!platform) {
    return (
      <div className="platform-products-empty">
        <Package size={38} />
        <strong>Sàn không được hỗ trợ</strong>
        <Link to="/products">Quay lại danh sách sàn</Link>
      </div>
    );
  }

  function toggleStore(storeId) {
    setExpandedStoreIds((current) => {
      const next = new Set(current);
      if (next.has(storeId)) next.delete(storeId);
      else next.add(storeId);
      return next;
    });
  }

  return (
    <div className={`platform-products-page platform-products-page--${platformCode}`}>
      <Link className="platform-products-back" to="/products">
        <ArrowLeft size={15} /> Quay lại danh sách sàn
      </Link>

      <header className="platform-products-header">
        <div className="platform-products-title">
          <span>{platform.icon}</span>
          <div>
            <h1>Sản phẩm {platform.name}</h1>
            <p>Mỗi sản phẩm được đặt trong cửa hàng đã liên kết tương ứng.</p>
          </div>
        </div>
        <label className="platform-products-search">
          <Search size={15} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm cửa hàng, sản phẩm hoặc SKU..."
          />
        </label>
      </header>

      {connectedStoreIds.length === 0 ? (
        <div className="platform-products-empty">
          <Store size={38} />
          <strong>Chưa kết nối cửa hàng {platform.shortName}</strong>
          <span>Hãy chọn sàn và cửa hàng trong trang kết nối trước.</span>
          <Link to="/connect">Đi đến trang kết nối</Link>
        </div>
      ) : storeGroups.length === 0 ? (
        <div className="platform-products-empty">
          <Search size={34} />
          <strong>Không tìm thấy dữ liệu phù hợp</strong>
          <span>Hãy thử một tên cửa hàng, sản phẩm hoặc SKU khác.</span>
        </div>
      ) : (
        <div className="platform-store-list">
          {storeGroups.map(({ store, products }) => {
            const storeId = String(store.id);
            const isExpanded = expandedStoreIds.has(storeId) || Boolean(search.trim());
            return (
              <section className={`platform-store ${isExpanded ? 'is-expanded' : ''}`} key={store.id}>
                <button
                  className="platform-store__toggle"
                  type="button"
                  onClick={() => toggleStore(storeId)}
                  aria-expanded={isExpanded}
                >
                  <span className="platform-store__avatar">{store.avatar || platform.icon}</span>
                  <span className="platform-store__identity">
                    <strong>{store.name}</strong>
                    <small>{store.code} · {store.category}</small>
                  </span>
                  <span className="platform-store__metric">
                    <strong>{products.length}</strong>
                    <small>sản phẩm mock</small>
                  </span>
                  <span className="platform-store__metric">
                    <strong>{store.reviewCount?.toLocaleString('vi-VN') || 0}</strong>
                    <small>đánh giá</small>
                  </span>
                  <ChevronDown size={18} />
                </button>

                {isExpanded && (
                  <div className="platform-store__products">
                    {products.length === 0 ? (
                      <div className="platform-store__empty">Cửa hàng chưa có sản phẩm phù hợp.</div>
                    ) : products.map((product) => (
                      <article className="platform-product-card" key={product.id}>
                        <div className="platform-product-card__main">
                          <img src={product.image} alt={product.name} />
                          <div>
                            <span>{product.categoryName}</span>
                            <h2 title={product.name}>{product.name}</h2>
                            <small>SKU: {product.sku || 'N/A'}</small>
                          </div>
                        </div>
                        <div className="platform-product-card__summary">
                          <strong>{formatPrice(product.price)}</strong>
                          <span><Star size={13} fill="currentColor" /> {Number(product.rating || 0).toFixed(1)}</span>
                        </div>
                        <Link to={`/products/${platformCode}/${product.id}`}>
                          Xem sản phẩm <span aria-hidden="true">→</span>
                        </Link>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
