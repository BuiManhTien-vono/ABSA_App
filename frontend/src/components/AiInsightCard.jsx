// src/components/AiInsightCard.jsx - AI Root Cause Diagnosis & Recommendation Card
import { AlertTriangle, Lightbulb, MessageSquareQuote } from 'lucide-react';
import './AiInsightCard.css';

export default function AiInsightCard({ spikes = [] }) {
  const topFrictions = (spikes || []).slice(0, 3);

  return (
    <div className="ai-insight-container">
      {/* Root Cause Diagnosis */}
      <div className="ai-card diagnosis">
        <div className="ai-card-header">
          <div className="ai-card-icon red">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3>Chẩn đoán Nguyên nhân Tiêu cực (AI Friction Points)</h3>
          </div>
        </div>

        <div className="ai-insight-list">
          {topFrictions.length > 0 ? (
            topFrictions.map((item, idx) => (
              <div className="ai-insight-item" key={item.productId || idx}>
                <div className="ai-insight-bullet red" />
                <div>
                  <strong>{item.productName}</strong>
                  <span style={{ color: '#64748b', marginLeft: '6px' }}>
                    ({item.negCount} đánh giá NEG · {item.negPercent}% phản hồi xấu)
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="ai-insight-item">
              <div className="ai-insight-bullet red" />
              <div>Tỷ lệ hài lòng tổng thể đạt mức cao, chưa phát hiện điểm sụt giảm bất thường.</div>
            </div>
          )}
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="ai-card action">
        <div className="ai-card-header">
          <div className="ai-card-icon indigo">
            <Lightbulb size={18} />
          </div>
          <div>
            <h3>Gợi ý Khắc phục & Mẫu phản hồi CSKH (AI Action Plan)</h3>
          </div>
        </div>

        <div className="ai-insight-list">
          <div className="ai-insight-item">
            <div className="ai-insight-bullet indigo" />
            <div>
              <strong>Vận chuyển & Đóng gói:</strong> Nên bổ sung 2 lớp bóng khí (bubble wrap) cho các đơn túi ví/giày dép để tránh móp hộp.
            </div>
          </div>

          <div className="ai-reply-box">
            <MessageSquareQuote size={14} style={{ display: 'inline', marginRight: '4px' }} />
            "Shop xin lỗi bạn vì trải nghiệm đóng gói chưa đạt kỳ vọng. Shop đã gửi mã voucher giảm 15% cho đơn tiếp theo và lưu ý đơn vị vận chuyển ạ!"
          </div>
        </div>
      </div>
    </div>
  );
}
