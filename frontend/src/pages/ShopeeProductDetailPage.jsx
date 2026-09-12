import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Sparkles, MessageSquare, ThumbsUp, Filter, Search, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { SHOPEE_STORES, STORE_CATEGORIES, findShopeeProductById, getProductsForCategory } from '../data/shopeeData';
import { getAspectLabel, getMacroLabel } from '../utils/aspectMapper';

export default function ShopeeProductDetailPage() {
  const { shopId, productId } = useParams();
  const [activeSentimentFilter, setActiveSentimentFilter] = useState('ALL'); // 'ALL' | 'POS' | 'NEU' | 'NEG'
  const [selectedStar, setSelectedStar] = useState('ALL'); // 'ALL' | 5 | 4 | 3 | 2 | 1
  const [selectedAspect, setSelectedAspect] = useState('ALL');
  const [searchComment, setSearchComment] = useState('');
  const [commentPage, setCommentPage] = useState(1);
  const pageSize = 10;

  // Find product
  const product = useMemo(() => findShopeeProductById(productId), [productId]);

  const store = useMemo(() => {
    if (!product) return null;
    return SHOPEE_STORES.find((s) => s.id === product.storeId) || { name: product.storeName };
  }, [product]);

  // Filter comments
  const filteredComments = useMemo(() => {
    if (!product?.comments) return [];
    return product.comments.filter((c) => {
      if (activeSentimentFilter !== 'ALL' && c.sentiment !== activeSentimentFilter) return false;
      if (selectedStar !== 'ALL' && c.starRating !== parseInt(selectedStar)) return false;
      if (selectedAspect !== 'ALL') {
        const hasAspect = c.aspects?.some((a) => a.aspect === selectedAspect || a.label === selectedAspect);
        if (!hasAspect) return false;
      }
      if (searchComment.trim()) {
        const query = searchComment.toLowerCase();
        const matchText = c.content.toLowerCase().includes(query) || c.userName.toLowerCase().includes(query) || c.variant.toLowerCase().includes(query);
        if (!matchText) return false;
      }
      return true;
    });
  }, [product, activeSentimentFilter, selectedStar, selectedAspect, searchComment]);

  const totalCommentPages = Math.max(1, Math.ceil(filteredComments.length / pageSize));
  const paginatedComments = useMemo(() => {
    const start = (commentPage - 1) * pageSize;
    return filteredComments.slice(start, start + pageSize);
  }, [filteredComments, commentPage, pageSize]);

  if (!product) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#ef4444' }}>
        <p>Không tìm thấy thông tin sản phẩm Shopee.</p>
        <Link to="/connect/shopee" style={{ color: '#4f46e5', textDecoration: 'none' }}>
          Quay lại danh sách cửa hàng
        </Link>
      </div>
    );
  }

  const allComments = product.comments || [];
  const totalComments = allComments.length;
  const posCommentsCount = allComments.filter((c) => c.sentiment === 'POS').length;
  const neuCommentsCount = allComments.filter((c) => c.sentiment === 'NEU').length;
  const negCommentsCount = allComments.filter((c) => c.sentiment === 'NEG').length;

  const aspectRows = product.aspectBreakdown || [];

  return (
    <div style={{ padding: '24px', maxWidth: '1080px', margin: '0 auto' }}>
      {/* Back to list link - EXACTLY MATCHING IMAGE 2 */}
      <Link
        to={`/connect/shopee/${product.storeId}/categories/${product.categoryId}/products`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          color: '#4f46e5',
          textDecoration: 'none',
          marginBottom: '16px',
          fontWeight: 500,
        }}
      >
        <ArrowLeft size={14} /> Quay lại danh sách
      </Link>

      {/* Header Info Card - EXACTLY MATCHING IMAGE 2 */}
      <div style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        alignItems: 'center',
      }}>
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '8px',
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
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 500,
            display: 'inline-block',
            marginBottom: '4px',
          }}>
            {product.storeBadge} · SHOPEE
          </span>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#0f172a',
            margin: '4px 0 6px 0',
            lineHeight: '1.4',
          }}>
            {product.name}
          </h1>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            SKU: {product.sku} · Danh mục: {product.categoryName}
          </div>
        </div>

        <div style={{
          textAlign: 'right',
          borderLeft: '1px solid #f1f5f9',
          paddingLeft: '24px',
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '4px',
          }}>
            <Star size={20} fill="#eab308" color="#eab308" /> {typeof product.rating === 'number' ? product.rating.toFixed(1) : product.rating}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            {product.reviewCount} Đánh giá
          </div>
        </div>
      </div>

      {/* Sentiment Overview Cards - EXACTLY MATCHING IMAGE 2 */}
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginBottom: '12px' }}>
        Phân bổ cảm xúc tổng quan
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          padding: '16px',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '12px', color: '#166534', fontWeight: 500 }}>
            Tích cực (POS)
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#15803d', marginTop: '4px' }}>
            {product.posCount} ({product.posPercent}%)
          </div>
        </div>

        <div style={{
          background: '#fefce8',
          border: '1px solid #fef08a',
          padding: '16px',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '12px', color: '#854d0e', fontWeight: 500 }}>
            Trung tính (NEU)
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#a16207', marginTop: '4px' }}>
            {product.neuCount} ({product.neuPercent}%)
          </div>
        </div>

        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          padding: '16px',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '12px', color: '#991b1b', fontWeight: 500 }}>
            Tiêu cực (NEG)
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#b91c1c', marginTop: '4px' }}>
            {product.negCount} ({product.negPercent}%)
          </div>
        </div>
      </div>

      {/* Aspect Level Breakdown Table - EXACTLY MATCHING IMAGE 2 */}
      <h2 style={{
        fontSize: '15px',
        fontWeight: 600,
        color: '#334155',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <Sparkles size={16} style={{ color: '#4f46e5' }} />
        Phân tích Chi tiết theo Khía cạnh (ViSoBERT ABSA)
      </h2>
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        marginBottom: '32px',
      }}>
        {aspectRows.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
            Chưa có khía cạnh nào được trích xuất cho sản phẩm này.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '10px 16px' }}>Nhóm Khía cạnh (Macro)</th>
                <th style={{ padding: '10px 16px' }}>Khía cạnh Chi tiết (Micro)</th>
                <th style={{ padding: '10px 16px' }}>Tích cực</th>
                <th style={{ padding: '10px 16px' }}>Trung tính</th>
                <th style={{ padding: '10px 16px' }}>Tiêu cực</th>
                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Tổng đề cập</th>
              </tr>
            </thead>
            <tbody>
              {aspectRows.map((row, idx) => {
                const macroKey = row.macroCategory || 'PRODUCT';
                const microKey = row.microAspect || '';
                const pos = row.posCount ?? 0;
                const neu = row.neuCount ?? 0;
                const neg = row.negCount ?? 0;
                const total = row.totalMentions ?? (pos + neu + neg);

                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: '#475569' }}>
                      {getMacroLabel(macroKey)}
                    </td>
                    <td style={{ padding: '10px 16px', color: '#0f172a', fontWeight: 500 }}>
                      {getAspectLabel(microKey)}
                    </td>
                    <td style={{ padding: '10px 16px', color: '#16a34a', fontWeight: 600 }}>{pos}</td>
                    <td style={{ padding: '10px 16px', color: '#ca8a04', fontWeight: 600 }}>{neu}</td>
                    <td style={{ padding: '10px 16px', color: '#dc2626', fontWeight: 600 }}>{neg}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600 }}>{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* SECTION 5: CUSTOMER REVIEWS & COMMENTS EXPLORER (50-100 COMMENTS WITH ABSA) */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        marginBottom: '40px',
      }}>
        {/* Section Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div>
            <h3 style={{
              fontSize: '17px',
              fontWeight: 700,
              color: '#0f172a',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <MessageSquare size={19} style={{ color: '#4f46e5' }} />
              Đánh giá & Bình luận khách hàng ({totalComments} bình luận)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Dữ liệu bình luận thực tế được mô hình AI phân tích cảm xúc và trích xuất từng khía cạnh chi tiết
            </p>
          </div>

          {/* Search box within comments */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm trong bình luận..."
              value={searchComment}
              onChange={(e) => {
                setSearchComment(e.target.value);
                setCommentPage(1);
              }}
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div style={{
          background: '#f8fafc',
          padding: '14px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {/* Sentiment Filter Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginRight: '4px' }}>Cảm xúc:</span>
            <button
              onClick={() => { setActiveSentimentFilter('ALL'); setCommentPage(1); }}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: activeSentimentFilter === 'ALL' ? 600 : 500,
                border: activeSentimentFilter === 'ALL' ? '1px solid #4f46e5' : '1px solid #cbd5e1',
                background: activeSentimentFilter === 'ALL' ? '#4f46e5' : '#fff',
                color: activeSentimentFilter === 'ALL' ? '#fff' : '#475569',
                cursor: 'pointer',
              }}
            >
              Tất cả ({totalComments})
            </button>
            <button
              onClick={() => { setActiveSentimentFilter('POS'); setCommentPage(1); }}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: activeSentimentFilter === 'POS' ? 600 : 500,
                border: activeSentimentFilter === 'POS' ? '1px solid #16a34a' : '1px solid #bbf7d0',
                background: activeSentimentFilter === 'POS' ? '#16a34a' : '#f0fdf4',
                color: activeSentimentFilter === 'POS' ? '#fff' : '#15803d',
                cursor: 'pointer',
              }}
            >
              Tích cực ({posCommentsCount})
            </button>
            <button
              onClick={() => { setActiveSentimentFilter('NEU'); setCommentPage(1); }}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: activeSentimentFilter === 'NEU' ? 600 : 500,
                border: activeSentimentFilter === 'NEU' ? '1px solid #ca8a04' : '1px solid #fef08a',
                background: activeSentimentFilter === 'NEU' ? '#ca8a04' : '#fefce8',
                color: activeSentimentFilter === 'NEU' ? '#fff' : '#854d0e',
                cursor: 'pointer',
              }}
            >
              Trung tính ({neuCommentsCount})
            </button>
            <button
              onClick={() => { setActiveSentimentFilter('NEG'); setCommentPage(1); }}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: activeSentimentFilter === 'NEG' ? 600 : 500,
                border: activeSentimentFilter === 'NEG' ? '1px solid #dc2626' : '1px solid #fecaca',
                background: activeSentimentFilter === 'NEG' ? '#dc2626' : '#fef2f2',
                color: activeSentimentFilter === 'NEG' ? '#fff' : '#991b1b',
                cursor: 'pointer',
              }}
            >
              Tiêu cực ({negCommentsCount})
            </button>
          </div>

          {/* Star and Aspect Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Số sao:</span>
              {['ALL', '5', '4', '3', '2', '1'].map((star) => {
                const isSelected = selectedStar === star;
                return (
                  <button
                    key={star}
                    onClick={() => { setSelectedStar(star); setCommentPage(1); }}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: isSelected ? 600 : 500,
                      border: isSelected ? '1px solid #eab308' : '1px solid #e2e8f0',
                      background: isSelected ? '#fefce8' : '#fff',
                      color: isSelected ? '#a16207' : '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    {star === 'ALL' ? 'Tất cả' : `${star}★`}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Lọc khía cạnh:</span>
              <select
                value={selectedAspect}
                onChange={(e) => { setSelectedAspect(e.target.value); setCommentPage(1); }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  background: '#fff',
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">Tất cả khía cạnh</option>
                <option value="Material_BuildQuality">Chất liệu & Độ bền</option>
                <option value="Appearance_Design">Kiểu dáng & Mẫu mã</option>
                <option value="Performance_Functionality">Hiệu năng & Chức năng</option>
                <option value="Usability_Experience">Trải nghiệm sử dụng</option>
                <option value="Authenticity_Packaging">Chính hãng & Tem nhãn</option>
                <option value="Delivery_Speed">Tốc độ giao hàng</option>
                <option value="External_Packaging">Đóng gói hàng</option>
                <option value="Consulting_Attitude">Thái độ tư vấn Shop</option>
                <option value="Price_Performance_Ratio">Mức độ đáng tiền (P/P)</option>
                <option value="AfterSales_Complaint">Bảo hành & Đổi trả</option>
              </select>
            </div>
          </div>
        </div>

        {/* Comments List */}
        {paginatedComments.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
            Không tìm thấy bình luận nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {paginatedComments.map((comment) => {
              const isPos = comment.sentiment === 'POS';
              const isNeu = comment.sentiment === 'NEU';
              const isNeg = comment.sentiment === 'NEG';

              return (
                <div
                  key={comment.id}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Comment Top Info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: comment.avatarColor,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '13px',
                      }}>
                        {comment.avatarChar}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                          {comment.userName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ display: 'flex', color: '#eab308' }}>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                fill={i < comment.starRating ? '#eab308' : '#e2e8f0'}
                                color={i < comment.starRating ? '#eab308' : '#cbd5e1'}
                              />
                            ))}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>·</span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{comment.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Sentiment Badge */}
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 9px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: isPos ? '#dcfce7' : isNeu ? '#fef9c3' : '#fee2e2',
                      color: isPos ? '#15803d' : isNeu ? '#a16207' : '#b91c1c',
                    }}>
                      {isPos ? 'Tích cực' : isNeu ? 'Trung tính' : 'Tiêu cực'}
                    </span>
                  </div>

                  {/* Variation */}
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                    {comment.variant}
                  </div>

                  {/* Comment Text Content */}
                  <div style={{
                    fontSize: '13px',
                    color: '#1e293b',
                    lineHeight: '1.55',
                    marginBottom: '12px',
                  }}>
                    {comment.content}
                  </div>

                  {/* AI ABSA Tags & Helpful button */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    paddingTop: '10px',
                    borderTop: '1px dashed #f1f5f9',
                  }}>
                    {/* Aspects Tags */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, alignSelf: 'center' }}>
                        Khía cạnh AI:
                      </span>
                      {comment.aspects?.map((asp, i) => {
                        const aspPos = asp.sentiment === 'POS';
                        const aspNeu = asp.sentiment === 'NEU';
                        return (
                          <span
                            key={i}
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 500,
                              background: aspPos ? '#eff6ff' : aspNeu ? '#fefce8' : '#fef2f2',
                              color: aspPos ? '#1d4ed8' : aspNeu ? '#854d0e' : '#b91c1c',
                              border: aspPos ? '1px solid #bfdbfe' : aspNeu ? '1px solid #fef08a' : '1px solid #fecaca',
                            }}
                          >
                            {asp.label}: {aspPos ? 'Tốt' : aspNeu ? 'Bình thường' : 'Kém'}
                          </span>
                        );
                      })}
                    </div>

                    {/* Helpful votes */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                      <ThumbsUp size={13} style={{ color: '#94a3b8' }} />
                      <span>{comment.helpfulVotes} hữu ích</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {totalCommentPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0',
            fontSize: '12px',
            color: '#64748b',
          }}>
            <div>
              Hiển thị {Math.min(filteredComments.length, (commentPage - 1) * pageSize + 1)} - {Math.min(filteredComments.length, commentPage * pageSize)} trên {filteredComments.length} bình luận
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                disabled={commentPage === 1}
                onClick={() => setCommentPage((p) => Math.max(1, p - 1))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: commentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: commentPage === 1 ? 0.5 : 1,
                  fontSize: '12px',
                }}
              >
                <ChevronLeft size={14} /> Trước
              </button>
              <span style={{ padding: '5px 10px', fontWeight: 600, color: '#334155' }}>
                Trang {commentPage} / {totalCommentPages}
              </span>
              <button
                disabled={commentPage === totalCommentPages}
                onClick={() => setCommentPage((p) => Math.min(totalCommentPages, p + 1))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: commentPage === totalCommentPages ? 'not-allowed' : 'pointer',
                  opacity: commentPage === totalCommentPages ? 0.5 : 1,
                  fontSize: '12px',
                }}
              >
                Sau <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
