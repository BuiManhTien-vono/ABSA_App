import { useState } from 'react';
import './ReviewInput.css';

const SAMPLE_REVIEWS = [
  "Áo đẹp nhưng vải mỏng, giao hàng lâu, shop rep nhiệt tình.",
  "Giao nhanh thật, có 10 ngày là tới.",
  "Shop rep nhanh ghê, 3 ngày mới trả lời.",
  "Hàng đẹp nhưng thiếu ốc vít, lắp không được.",
  "Sản phẩm rất ok, đáng mua, sẽ ủng hộ shop tiếp.",
  "Có freeship không shop?",
  "ok nhận xu 5 sao",
];

export default function ReviewInput({ onAnalyze, loading }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !loading) {
      onAnalyze(text.trim());
    }
  };

  const handleSample = (sample) => {
    setText(sample);
    onAnalyze(sample);
  };

  return (
    <div className="review-input-card animate-fade-in">
      <div className="card-header">
        <div className="card-header-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h2>Nhập Review</h2>
      </div>
      <form onSubmit={handleSubmit} className="card-body">
        <textarea
          id="review-input"
          className="review-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập bình luận của khách hàng để phân tích..."
          rows={5}
        />
        <div className="actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !text.trim()}
            id="analyze-btn"
          >
            {loading ? (
              <>
                <span className="spinner" />
                Đang phân tích...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                Phân tích
              </>
            )}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setText('')}
            disabled={loading}
          >
            Xóa
          </button>
        </div>
      </form>
      <div className="samples-section">
        <p className="samples-label">Ví dụ mẫu:</p>
        <div className="samples-grid">
          {SAMPLE_REVIEWS.map((sample, i) => (
            <button
              key={i}
              className="sample-btn"
              onClick={() => handleSample(sample)}
              disabled={loading}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
