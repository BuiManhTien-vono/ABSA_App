import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import productService from '../services/productService';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [pRes, sRes] = await Promise.all([
          productService.getProductById(id),
          productService.getSentimentSummary(id),
        ]);
        setProduct(pRes);
        setSummary(sRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) return <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>Đang tải thông tin sản phẩm...</div>;
  if (!product) return <div style={{ padding: '48px', textAlign: 'center', color: '#ef4444' }}>Không tìm thấy sản phẩm.</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4f46e5', textDecoration: 'none', marginBottom: '16px' }}>
        <ArrowLeft size={14} /> Quay lại danh sách
      </Link>

      {/* Header Info Card */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <img src={product.imageUrl || 'https://via.placeholder.com/80'} alt={product.name} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '11px', background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>
            {product.storeName} · {product.platformCode}
          </span>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '6px 0' }}>{product.name}</h1>
          <div style={{ fontSize: '12px', color: '#64748b' }}>SKU: {product.sku || 'N/A'} · Category: {product.categoryName || 'Mặc định'}</div>
        </div>
        <div style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', paddingLeft: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={20} fill="#eab308" color="#eab308" /> {product.averageRating}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{product.reviewCount} Đánh giá</div>
        </div>
      </div>

      {/* Sentiment Overview Cards */}
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginBottom: '12px' }}>Phân bổ cảm xúc tổng quan</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: '#166534', fontWeight: 500 }}>Tích cực (POS)</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#15803d', marginTop: '4px' }}>{product.posCount} ({summary?.overall?.posPercent || 0}%)</div>
        </div>
        <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '16px', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: '#854d0e', fontWeight: 500 }}>Trung tính (NEU)</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#a16207', marginTop: '4px' }}>{product.neuCount} ({summary?.overall?.neuPercent || 0}%)</div>
        </div>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: '#991b1b', fontWeight: 500 }}>Tiêu cực (NEG)</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#b91c1c', marginTop: '4px' }}>{product.negCount} ({summary?.overall?.negPercent || 0}%)</div>
        </div>
      </div>

      {/* Aspect Level Breakdown Table */}
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginBottom: '12px' }}>Phân tích Chi tiết theo Khía cạnh (Aspect-Based)</h2>
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {!summary?.aspectBreakdown || summary.aspectBreakdown.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Chưa có khía cạnh nào được trích xuất cho sản phẩm này.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '10px 16px' }}>Macro Category</th>
                <th style={{ padding: '10px 16px' }}>Micro Aspect</th>
                <th style={{ padding: '10px 16px' }}>Tích cực</th>
                <th style={{ padding: '10px 16px' }}>Trung tính</th>
                <th style={{ padding: '10px 16px' }}>Tiêu cực</th>
                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Tổng đề cập</th>
              </tr>
            </thead>
            <tbody>
              {summary.aspectBreakdown.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 600, color: '#475569' }}>{row.macroCategory}</td>
                  <td style={{ padding: '10px 16px', color: '#0f172a', fontWeight: 500 }}>{row.microAspect}</td>
                  <td style={{ padding: '10px 16px', color: '#16a34a' }}>{row.posCount}</td>
                  <td style={{ padding: '10px 16px', color: '#ca8a04' }}>{row.neuCount}</td>
                  <td style={{ padding: '10px 16px', color: '#dc2626' }}>{row.negCount}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600 }}>{row.totalMentions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
