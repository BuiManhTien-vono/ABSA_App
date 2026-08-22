import { useEffect, useState } from 'react';
import { MessageSquare, Star, Filter, Search, X } from 'lucide-react';
import reviewService from '../services/reviewService';
import responseService from '../services/responseService';

export default function ReviewFeedPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);

  // Filters
  const [rating, setRating] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadReviews();
  }, [page, rating, sentiment, status, search]);

  async function loadReviews() {
    try {
      setLoading(true);
      const res = await reviewService.getReviews({
        page,
        pageSize: 15,
        rating: rating ? parseInt(rating, 10) : undefined,
        sentiment,
        status,
        search,
      });
      setReviews(res?.items || []);
      setTotalPages(res?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenDetail(id) {
    try {
      setDetailLoading(true);
      const detail = await reviewService.getReviewById(id);
      setSelectedReview(detail);
      setResponseText(detail?.aiAnalysis?.suggestedSellerResponse || '');
    } catch (err) {
      alert('Không thể tải chi tiết đánh giá: ' + err.message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleSendResponse(e) {
    e.preventDefault();
    if (!responseText.trim() || !selectedReview) return;

    try {
      setSendingResponse(true);
      await responseService.sendResponse(selectedReview.id, responseText);
      alert('Gửi phản hồi thành công!');
      handleOpenDetail(selectedReview.id);
      loadReviews();
    } catch (err) {
      alert('Gửi phản hồi thất bại: ' + err.message);
    } finally {
      setSendingResponse(false);
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '20px' }}>
      {/* Main Review Feed */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#1e293b' }}>Luồng Đánh Giá & AI Phân Tích (Review Feed)</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Theo dõi tất cả đánh giá từ các sàn, phân tích ViSoBERT & phản hồi</p>
        </div>

        {/* Filter Bar */}
        <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <select value={rating} onChange={(e) => { setRating(e.target.value); setPage(1); }} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
            <option value="">Tất cả Rating</option>
            <option value="5">5 Sao ⭐⭐⭐⭐⭐</option>
            <option value="4">4 Sao ⭐⭐⭐⭐</option>
            <option value="3">3 Sao ⭐⭐⭐</option>
            <option value="2">2 Sao ⭐⭐</option>
            <option value="1">1 Sao ⭐</option>
          </select>
          <select value={sentiment} onChange={(e) => { setSentiment(e.target.value); setPage(1); }} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
            <option value="">Tất cả Cảm xúc</option>
            <option value="POS">Tích cực (POS)</option>
            <option value="NEU">Trung tính (NEU)</option>
            <option value="NEG">Tiêu cực (NEG)</option>
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
            <option value="">Tất cả Trạng thái</option>
            <option value="PENDING">Chờ xử lý (PENDING)</option>
            <option value="REPLIED">Đã phản hồi (REPLIED)</option>
            <option value="SKIPPED">Bỏ qua (SKIPPED)</option>
          </select>
          <input
            type="text"
            placeholder="Tìm kiếm đánh giá..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ flex: 1, minWidth: '180px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
          />
        </div>

        {/* Review Cards */}
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>Đang tải đánh giá...</div>
        ) : reviews.length === 0 ? (
          <div style={{ background: '#fff', padding: '48px', textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
            Không tìm thấy đánh giá phù hợp.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reviews.map((r) => (
              <div
                key={r.id}
                onClick={() => handleOpenDetail(r.id)}
                style={{
                  background: selectedReview?.id === r.id ? '#f0f9ff' : '#fff',
                  border: `1px solid ${selectedReview?.id === r.id ? '#0284c7' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>{r.customerName || 'Khách hàng'}</strong>
                    <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>on {r.storeName || 'Shop'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: r.overallSentiment === 'POS' ? '#dcfce7' : r.overallSentiment === 'NEG' ? '#fee2e2' : '#fef9c3',
                      color: r.overallSentiment === 'POS' ? '#15803d' : r.overallSentiment === 'NEG' ? '#b91c1c' : '#a16207',
                    }}>
                      {r.overallSentiment || 'NEU'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                      {r.status}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#eab308', fontSize: '13px', marginBottom: '8px' }}>
                  {'⭐'.repeat(r.rating)}
                </div>

                <p style={{ fontSize: '13px', color: '#334155', margin: '0 0 8px 0', lineHeight: 1.4 }}>{r.commentText}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                  <span>Sản phẩm: {r.productName || 'N/A'}</span>
                  <time>{new Date(r.reviewCreatedAt).toLocaleString('vi-VN')}</time>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail & AI Side Drawer */}
      {selectedReview && (
        <div style={{ width: '400px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Chi tiết AI ABSA Analysis</h3>
            <button onClick={() => setSelectedReview(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>
          </div>

          {detailLoading ? (
            <div>Đang tải chi tiết...</div>
          ) : (
            <>
              <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Customer Insight:</div>
                <p style={{ fontSize: '12px', color: '#1e293b', margin: 0 }}>{selectedReview.aiAnalysis?.customerInsight || 'Không có insight'}</p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Aspects Detected:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedReview.aspects?.map((a) => (
                    <span key={a.id} style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: a.sentiment === 'POS' ? '#dcfce7' : a.sentiment === 'NEG' ? '#fee2e2' : '#fef9c3',
                      color: a.sentiment === 'POS' ? '#15803d' : a.sentiment === 'NEG' ? '#b91c1c' : '#a16207',
                      border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                      {a.microAspect}: <strong>{a.sentiment}</strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* Response Section */}
              <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600 }}>Gửi Phản hồi cho Khách hàng</h4>
                <form onSubmit={handleSendResponse}>
                  <textarea
                    rows={4}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Nhập nội dung phản hồi..."
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginBottom: '8px' }}
                  />
                  <button
                    type="submit"
                    disabled={sendingResponse}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#4f46e5', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                  >
                    {sendingResponse ? 'Đang gửi...' : 'Gửi Phản hồi ngay'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
