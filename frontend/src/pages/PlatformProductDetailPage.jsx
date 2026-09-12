import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MessageSquare, Sparkles, Star } from 'lucide-react';
import {
  SHOPEE_STORES,
  STORE_CATEGORIES,
  generateMockComments,
  getProductsForCategory,
} from '../data/shopeeData';
import {
  LAZADA_STORES,
  findLazadaProductById,
  generateLazadaMockComments,
} from '../data/lazadaData';
import {
  TIKTOK_SHOP_STORES,
  findTikTokShopProductById,
  generateTikTokShopMockComments,
} from '../data/tiktokShopData';
import { getAspectLabel, getMacroLabel } from '../utils/aspectMapper';
import './PlatformProductDetailPage.css';

function findShopeeProduct(productId) {
  for (const store of SHOPEE_STORES) {
    for (const category of STORE_CATEGORIES[store.id] || []) {
      const products = getProductsForCategory(store.id, category.id, { includeComments: false });
      const product = products.find((item) => item.id === productId);
      if (product) return product;
    }
  }
  return null;
}

const PLATFORM_DATA = {
  shopee: {
    name: 'Shopee',
    stores: SHOPEE_STORES,
    findProduct: findShopeeProduct,
    generateComments: (product) => generateMockComments(product, product.reviewCount || 75),
  },
  lazada: {
    name: 'Lazada',
    stores: LAZADA_STORES,
    findProduct: findLazadaProductById,
    generateComments: (product) => generateLazadaMockComments(product, 20),
  },
  'tiktok-shop': {
    name: 'TikTok Shop',
    stores: TIKTOK_SHOP_STORES,
    findProduct: findTikTokShopProductById,
    generateComments: (product) => generateTikTokShopMockComments(product, 20),
  },
};

function normalizeComment(comment) {
  return {
    id: comment.id,
    userName: comment.userName || comment.user || 'Khách hàng',
    avatar: comment.avatarChar || comment.userName?.charAt(0) || comment.user?.charAt(0) || 'K',
    rating: comment.starRating ?? comment.rating ?? 5,
    sentiment: comment.sentiment || 'NEU',
    date: comment.date || (comment.createdAt
      ? new Date(comment.createdAt).toLocaleString('vi-VN')
      : ''),
    variant: comment.variant || comment.productVariant || 'Mặc định',
    content: comment.content || '',
    aspects: comment.aspects || comment.absaTags || [],
    helpfulVotes: comment.helpfulVotes ?? comment.likes ?? 0,
  };
}

function inferMacro(aspect) {
  if (aspect.includes('Delivery') || aspect.includes('Packaging')) return 'SHIPPING';
  if (aspect.includes('Consulting') || aspect.includes('Response') || aspect.includes('AfterSales')) return 'SERVICE';
  if (aspect.includes('Price')) return 'PRICE';
  return 'PRODUCT';
}

function buildAspectBreakdown(comments) {
  const rows = new Map();
  comments.forEach((comment) => {
    comment.aspects.forEach((item) => {
      const microAspect = item.aspect || item.label || 'Overall_Sentiment';
      const key = `${inferMacro(microAspect)}:${microAspect}`;
      if (!rows.has(key)) {
        rows.set(key, {
          macroCategory: inferMacro(microAspect),
          microAspect,
          posCount: 0,
          neuCount: 0,
          negCount: 0,
          totalMentions: 0,
        });
      }
      const row = rows.get(key);
      const sentiment = item.sentiment || comment.sentiment;
      if (sentiment === 'POS') row.posCount += 1;
      else if (sentiment === 'NEG') row.negCount += 1;
      else row.neuCount += 1;
      row.totalMentions += 1;
    });
  });
  return [...rows.values()];
}

function formatPrice(value) {
  return typeof value === 'number'
    ? `${value.toLocaleString('vi-VN')} ₫`
    : 'Chưa cập nhật';
}

export default function PlatformProductDetailPage() {
  const { platformCode: routePlatformCode, id } = useParams();
  const platformCode = routePlatformCode?.toLowerCase();
  const platform = PLATFORM_DATA[platformCode];

  const product = useMemo(
    () => platform?.findProduct(id) || null,
    [id, platform],
  );

  const comments = useMemo(() => {
    if (!product) return [];
    const source = platform.generateComments(product);
    return source.map(normalizeComment);
  }, [platform, product]);

  if (!platform || !product) {
    return (
      <div className="platform-detail-empty">
        <MessageSquare size={38} />
        <strong>Không tìm thấy sản phẩm trên sàn này</strong>
        <Link to={platform ? `/products/${platformCode}` : '/products'}>Quay lại danh sách sản phẩm</Link>
      </div>
    );
  }

  const store = platform.stores.find((item) => item.id === product.storeId);
  const positiveCount = product.posCount ?? comments.filter((item) => item.sentiment === 'POS').length;
  const neutralCount = product.neuCount ?? comments.filter((item) => item.sentiment === 'NEU').length;
  const negativeCount = product.negCount ?? comments.filter((item) => item.sentiment === 'NEG').length;
  const totalSentiments = Math.max(positiveCount + neutralCount + negativeCount, 1);
  const aspectRows = product.aspectBreakdown?.length
    ? product.aspectBreakdown
    : buildAspectBreakdown(comments);

  return (
    <div className={`platform-detail-page platform-detail-page--${platformCode}`}>
      <Link className="platform-detail-back" to={`/products/${platformCode}`}>
        <ArrowLeft size={15} /> Quay lại sản phẩm {platform.name}
      </Link>

      <section className="platform-detail-hero">
        <img src={product.image} alt={product.name} />
        <div className="platform-detail-identity">
          <span>{store?.name || product.storeName} · {platform.name}</span>
          <h1>{product.name}</h1>
          <p>SKU: {product.sku || 'N/A'} · Danh mục: {product.categoryName || 'Chưa phân loại'}</p>
          <strong>{formatPrice(product.price)}</strong>
        </div>
        <div className="platform-detail-rating">
          <strong><Star size={20} fill="currentColor" /> {Number(product.rating || 0).toFixed(1)}</strong>
          <span>{product.reviewCount ?? comments.length} đánh giá</span>
        </div>
      </section>

      <section>
        <h2 className="platform-detail-heading">Phân bổ cảm xúc tổng quan</h2>
        <div className="platform-sentiment-grid">
          <article className="is-positive">
            <span>Tích cực (POS)</span>
            <strong>{positiveCount} ({Math.round((positiveCount / totalSentiments) * 100)}%)</strong>
          </article>
          <article className="is-neutral">
            <span>Trung tính (NEU)</span>
            <strong>{neutralCount} ({Math.round((neutralCount / totalSentiments) * 100)}%)</strong>
          </article>
          <article className="is-negative">
            <span>Tiêu cực (NEG)</span>
            <strong>{negativeCount} ({Math.round((negativeCount / totalSentiments) * 100)}%)</strong>
          </article>
        </div>
      </section>

      <section className="platform-detail-section">
        <h2 className="platform-detail-heading"><Sparkles size={16} /> Phân tích khía cạnh</h2>
        <div className="platform-aspect-table-wrap">
          <table className="platform-aspect-table">
            <thead><tr><th>Nhóm</th><th>Khía cạnh</th><th>POS</th><th>NEU</th><th>NEG</th><th>Tổng</th></tr></thead>
            <tbody>
              {aspectRows.map((row) => (
                <tr key={`${row.macroCategory}-${row.microAspect}`}>
                  <td>{getMacroLabel(row.macroCategory)}</td>
                  <td>{getAspectLabel(row.microAspect)}</td>
                  <td className="is-positive">{row.posCount}</td>
                  <td className="is-neutral">{row.neuCount}</td>
                  <td className="is-negative">{row.negCount}</td>
                  <td>{row.totalMentions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="platform-detail-section">
        <h2 className="platform-detail-heading"><MessageSquare size={16} /> Phản hồi mẫu ({comments.length})</h2>
        <div className="platform-comment-list">
          {comments.slice(0, 12).map((comment) => (
            <article className="platform-comment" key={comment.id}>
              <span className="platform-comment__avatar">{comment.avatar.toUpperCase()}</span>
              <div>
                <header>
                  <strong>{comment.userName}</strong>
                  <span>{Array.from({ length: comment.rating }, () => '★').join('')}</span>
                  <time>{comment.date}</time>
                </header>
                <small><CheckCircle2 size={12} /> Đã mua hàng · {comment.variant}</small>
                <p>{comment.content}</p>
                <footer>
                  {comment.aspects.map((aspect, index) => (
                    <span className={`is-${(aspect.sentiment || comment.sentiment).toLowerCase()}`} key={`${aspect.aspect}-${index}`}>
                      {aspect.label || getAspectLabel(aspect.aspect)}
                    </span>
                  ))}
                </footer>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
