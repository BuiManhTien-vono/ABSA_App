import { useEffect, useState } from 'react';
import { Plus, Trash2, FileText, Zap, X, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import responseService from '../services/responseService';
import './TemplatesPage.css';

const SENTIMENT_BADGES = {
  POS: 'badge--pos',
  NEU: 'badge--neu',
  NEG: 'badge--neg',
  MIXED: 'badge--mixed',
};

const DEFAULT_MOCK_TEMPLATES = [
  {
    id: 'tpl-1',
    title: 'Cảm ơn Đánh Giá 5 Sao & Tặng Voucher 10%',
    contentTemplate: 'Dạ shop xin chào bạn {customer_name}! Cảm ơn bạn rất nhiều đã tin tưởng mua sản phẩm {product_name} tại {store_name}. Shop gửi tặng bạn mã giảm giá 10% HIGEN10 cho lần mua tiếp theo ạ!',
    targetRating: 5,
    targetSentiment: 'POS',
    targetAspect: 'Usability_Experience'
  },
  {
    id: 'tpl-2',
    title: 'Xin Lỗi & Hỗ Trợ Đổi Trả Khẩn Cấp (1-2 Sao)',
    contentTemplate: 'Dạ shop rất làm tiếc về trải nghiệm không hài lòng của bạn {customer_name} với sản phẩm {product_name}. Shop đã chuyển thông tin cho bộ phận CSKH gọi điện hỗ trợ bạn đổi mới 1-1 ngay ạ!',
    targetRating: 1,
    targetSentiment: 'NEG',
    targetAspect: 'Product_Defect'
  },
  {
    id: 'tpl-3',
    title: 'Phản Hồi Đánh Giá Trung Tính & Tiếp Thu Ý Kiến',
    contentTemplate: 'Dạ {store_name} chân thành cảm ơn bạn {customer_name} đã đánh giá sản phẩm {product_name}. Shop xin ghi nhận đóng góp của bạn để tiếp tục nâng cao chất lượng dịch vụ ạ!',
    targetRating: 3,
    targetSentiment: 'NEU',
    targetAspect: 'Material_BuildQuality'
  },
  {
    id: 'tpl-4',
    title: 'Khen Ngợi Tốc Độ Giao Hàng & Đóng Gói',
    contentTemplate: 'Dạ cảm ơn bạn {customer_name} đã khen ngợi dịch vụ đóng gói & giao hàng của {store_name}! Chúc bạn luôn có trải nghiệm tuyệt vời cùng {product_name} ạ!',
    targetRating: 5,
    targetSentiment: 'POS',
    targetAspect: 'Delivery_Speed'
  }
];

const DEFAULT_MOCK_RULES = [
  {
    id: 'rule-1',
    ruleName: 'Tự động trả lời & Tặng Voucher cho Đánh giá 5 Sao (POS)',
    minRating: 5,
    maxRating: 5,
    applySentimentsJson: '["POS"]',
    actionType: 'AUTO_REPLY_VOUCHER',
    delayMinutes: 0,
    isEnabled: true
  },
  {
    id: 'rule-2',
    ruleName: 'Tạo Ticket CSKH Xử lý Khẩn cho Đánh giá 1-2 Sao (NEG)',
    minRating: 1,
    maxRating: 2,
    applySentimentsJson: '["NEG"]',
    actionType: 'CREATE_URGENT_TICKET',
    delayMinutes: 5,
    isEnabled: true
  },
  {
    id: 'rule-3',
    ruleName: 'Gợi ý Phản hồi AI ViSoBERT cho Đánh giá 3 Sao (NEU)',
    minRating: 3,
    maxRating: 3,
    applySentimentsJson: '["NEU","MIXED"]',
    actionType: 'SUGGEST_AI_RESPONSE',
    delayMinutes: 15,
    isEnabled: false
  }
];

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showTplModal, setShowTplModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);

  const [tplData, setTplData] = useState({ title: '', contentTemplate: '', targetRating: '', targetSentiment: '', targetAspect: '' });
  const [ruleData, setRuleData] = useState({ ruleName: '', minRating: 1, maxRating: 5, sentiment: 'POS', actionType: 'AUTO_REPLY', delayMinutes: 0 });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [tRes, rRes] = await Promise.all([
        responseService.getTemplates({ pageSize: 50 }).catch(() => null),
        responseService.getRules({ pageSize: 50 }).catch(() => null),
      ]);
      const tItems = tRes?.items || [];
      const rItems = rRes?.items || [];

      setTemplates(tItems.length > 0 ? tItems : DEFAULT_MOCK_TEMPLATES);
      setRules(rItems.length > 0 ? rItems : DEFAULT_MOCK_RULES);
    } catch (err) {
      console.error(err);
      setTemplates(DEFAULT_MOCK_TEMPLATES);
      setRules(DEFAULT_MOCK_RULES);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTemplate(e) {
    e.preventDefault();
    try {
      await responseService.createTemplate({
        title: tplData.title,
        contentTemplate: tplData.contentTemplate,
        targetRating: tplData.targetRating ? parseInt(tplData.targetRating, 10) : null,
        targetSentiment: tplData.targetSentiment || null,
        targetAspect: tplData.targetAspect || null,
      }).catch(() => null);

      // Local fallback insert
      const newTpl = {
        id: `tpl-${Date.now()}`,
        title: tplData.title,
        contentTemplate: tplData.contentTemplate,
        targetRating: tplData.targetRating ? parseInt(tplData.targetRating, 10) : null,
        targetSentiment: tplData.targetSentiment || null,
        targetAspect: tplData.targetAspect || null,
      };
      setTemplates(prev => [newTpl, ...prev]);

      setShowTplModal(false);
      setTplData({ title: '', contentTemplate: '', targetRating: '', targetSentiment: '', targetAspect: '' });
    } catch (err) {
      alert('Lỗi tạo mẫu: ' + err.message);
    }
  }

  async function handleCreateRule(e) {
    e.preventDefault();
    try {
      await responseService.createRule({
        ruleName: ruleData.ruleName,
        minRating: parseInt(ruleData.minRating, 10),
        maxRating: parseInt(ruleData.maxRating, 10),
        applySentimentsJson: JSON.stringify([ruleData.sentiment]),
        actionType: ruleData.actionType,
        delayMinutes: parseInt(ruleData.delayMinutes, 10) || 0,
        isEnabled: true
      }).catch(() => null);

      const newRule = {
        id: `rule-${Date.now()}`,
        ruleName: ruleData.ruleName,
        minRating: parseInt(ruleData.minRating, 10),
        maxRating: parseInt(ruleData.maxRating, 10),
        applySentimentsJson: JSON.stringify([ruleData.sentiment]),
        actionType: ruleData.actionType,
        delayMinutes: parseInt(ruleData.delayMinutes, 10) || 0,
        isEnabled: true
      };
      setRules(prev => [newRule, ...prev]);

      setShowRuleModal(false);
      setRuleData({ ruleName: '', minRating: 1, maxRating: 5, sentiment: 'POS', actionType: 'AUTO_REPLY', delayMinutes: 0 });
    } catch (err) {
      alert('Lỗi tạo quy tắc: ' + err.message);
    }
  }

  async function handleToggleRule(id) {
    try {
      await responseService.toggleRule(id).catch(() => null);
      setRules(prev => prev.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteTemplate(id) {
    if (!confirm('Xóa mẫu phản hồi này?')) return;
    try {
      await responseService.deleteTemplate(id).catch(() => null);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  // Highlight template variables like {customer_name}
  function renderContent(text) {
    if (!text) return null;
    const parts = text.split(/(\{customer_name\}|\{product_name\}|\{store_name\})/g);
    return parts.map((part, i) => {
      if (part === '{customer_name}' || part === '{product_name}' || part === '{store_name}') {
        return <span key={i} className="template-var">{part}</span>;
      }
      return part;
    });
  }

  return (
    <div className="templates-page">
      {/* Header */}
      <div className="templates-page__header">
        <div>
          <h1 className="templates-page__title">Quản lý Mẫu Phản hồi & Quy tắc Tự động</h1>
          <p className="templates-page__subtitle">Cấu hình mẫu trả lời linh hoạt & quy tắc tự động kích hoạt bot phản hồi</p>
        </div>
        {activeTab === 'templates' ? (
          <button className="btn btn--primary" onClick={() => setShowTplModal(true)}>
            <Plus size={15} /> Tạo Mẫu Mới
          </button>
        ) : (
          <button className="btn btn--primary" onClick={() => setShowRuleModal(true)}>
            <Plus size={15} /> Tạo Quy Tắc Mới
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="templates-tabs">
        <button className={`templates-tab ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
          <FileText size={15} /> Mẫu Phản Hồi
          <span className="templates-tab__count">{templates.length}</span>
        </button>
        <button className={`templates-tab ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}>
          <Zap size={15} /> Quy Tắc Tự Động
          <span className="templates-tab__count">{rules.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="empty-state">Đang tải cấu hình...</div>
      ) : activeTab === 'templates' ? (
        /* ── Templates Grid ── */
        templates.length === 0 ? (
          <div className="empty-state">
            <FileText size={36} />
            <p>Chưa có mẫu phản hồi nào.</p>
            <button className="btn btn--primary" onClick={() => setShowTplModal(true)}>
              <Plus size={14} /> Tạo mẫu đầu tiên
            </button>
          </div>
        ) : (
          <div className="templates-grid">
            {templates.map((t, idx) => (
              <div key={t.id} className="template-card" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="template-card__top">
                  <span className="template-card__title">{t.title}</span>
                  <button className="template-card__delete" onClick={() => handleDeleteTemplate(t.id)} title="Xóa mẫu">
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="template-card__tags">
                  {t.targetRating && (
                    <span className="badge badge--neu">{'⭐'.repeat(t.targetRating)} {t.targetRating} sao</span>
                  )}
                  {t.targetSentiment && (
                    <span className={`badge ${SENTIMENT_BADGES[t.targetSentiment] || 'badge--muted'}`}>{t.targetSentiment}</span>
                  )}
                  {t.targetAspect && (
                    <span className="badge badge--info">{t.targetAspect}</span>
                  )}
                  {!t.targetRating && !t.targetSentiment && (
                    <span className="badge badge--muted">Tất cả đánh giá</span>
                  )}
                </div>

                <div className="template-card__content">{renderContent(t.contentTemplate)}</div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* ── Rules Table ── */
        rules.length === 0 ? (
          <div className="empty-state">
            <Zap size={36} />
            <p>Chưa có quy tắc tự động nào.</p>
          </div>
        ) : (
          <div className="rules-table-wrapper">
            <table className="rules-table">
              <thead>
                <tr>
                  <th>Tên Quy Tắc</th>
                  <th>Khoảng Rating</th>
                  <th>Cảm xúc áp dụng</th>
                  <th>Hành Động</th>
                  <th>Trạng Thái</th>
                  <th style={{ textAlign: 'right' }}>Bật/Tắt</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => {
                  let sentiments = [];
                  try { sentiments = typeof r.applySentimentsJson === 'string' ? JSON.parse(r.applySentimentsJson || '[]') : r.applySentimentsJson || []; } catch {}
                  return (
                    <tr key={r.id}>
                      <td className="rules-table__name">{r.ruleName}</td>
                      <td>
                        <div className="rules-table__rating">
                          {'⭐'.repeat(r.minRating || 1)} – {'⭐'.repeat(r.maxRating || 5)}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {sentiments.map((s) => (
                            <span key={s} className={`badge ${SENTIMENT_BADGES[s] || 'badge--muted'}`}>{s}</span>
                          ))}
                          {sentiments.length === 0 && <span className="badge badge--muted">Tất cả</span>}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge--info">{r.actionType}</span>
                        {r.delayMinutes > 0 && (
                          <span style={{ fontSize: 11, color: 'var(--surface-400)', marginLeft: 6 }}>({r.delayMinutes} phút)</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${r.isEnabled ? 'badge--pos' : 'badge--muted'}`}>
                          {r.isEnabled ? 'Đang hoạt động' : 'Đã tắt'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className={`toggle-switch ${r.isEnabled ? 'active' : ''}`} onClick={() => handleToggleRule(r.id)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Modal: Create Template */}
      {showTplModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowTplModal(false)}>
          <div className="modal-content animate-scale-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--surface-900)' }}>
                <FileText size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 8 }} />
                Tạo Mẫu Phản hồi Mới
              </h3>
              <button className="review-detail__close" onClick={() => setShowTplModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--surface-400)', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate}>
              <div className="tpl-form__group">
                <label className="tpl-form__label">Tiêu đề mẫu</label>
                <input className="input" type="text" required value={tplData.title} onChange={(e) => setTplData({ ...tplData, title: e.target.value })} placeholder="Ví dụ: Cảm ơn đánh giá 5 sao" />
              </div>

              <div className="tpl-form__group">
                <label className="tpl-form__label">Nội dung mẫu phản hồi</label>
                <textarea className="input" rows={5} required value={tplData.contentTemplate} onChange={(e) => setTplData({ ...tplData, contentTemplate: e.target.value })} placeholder="Xin chào {customer_name}, cảm ơn bạn đã đánh giá sản phẩm {product_name}..." style={{ resize: 'vertical' }} />
                <span className="tpl-form__hint">Hỗ trợ biến: {'{customer_name}'}, {'{product_name}'}, {'{store_name}'}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="tpl-form__group">
                  <label className="tpl-form__label">Rating mục tiêu</label>
                  <select className="input" value={tplData.targetRating} onChange={(e) => setTplData({ ...tplData, targetRating: e.target.value })}>
                    <option value="">Tất cả rating</option>
                    <option value="5">5 sao ⭐⭐⭐⭐⭐</option>
                    <option value="4">4 sao ⭐⭐⭐⭐</option>
                    <option value="3">3 sao ⭐⭐⭐</option>
                    <option value="2">2 sao ⭐⭐</option>
                    <option value="1">1 sao ⭐</option>
                  </select>
                </div>
                <div className="tpl-form__group">
                  <label className="tpl-form__label">Sentiment mục tiêu</label>
                  <select className="input" value={tplData.targetSentiment} onChange={(e) => setTplData({ ...tplData, targetSentiment: e.target.value })}>
                    <option value="">Tất cả sentiment</option>
                    <option value="POS">Tích cực (POS)</option>
                    <option value="NEU">Trung tính (NEU)</option>
                    <option value="NEG">Tiêu cực (NEG)</option>
                  </select>
                </div>
              </div>

              <div className="tpl-form__actions">
                <button type="button" className="btn btn--secondary" onClick={() => setShowTplModal(false)}>Hủy</button>
                <button type="submit" className="btn btn--primary">
                  <Plus size={14} /> Lưu mẫu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Rule */}
      {showRuleModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowRuleModal(false)}>
          <div className="modal-content animate-scale-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--surface-900)' }}>
                <Zap size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 8, color: 'var(--brand-600)' }} />
                Tạo Quy Tắc Tự Động Mới
              </h3>
              <button className="review-detail__close" onClick={() => setShowRuleModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--surface-400)', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRule}>
              <div className="tpl-form__group">
                <label className="tpl-form__label">Tên quy tắc</label>
                <input className="input" type="text" required value={ruleData.ruleName} onChange={(e) => setRuleData({ ...ruleData, ruleName: e.target.value })} placeholder="Ví dụ: Tự động trả lời 5 sao kèm voucher" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="tpl-form__group">
                  <label className="tpl-form__label">Min Rating</label>
                  <select className="input" value={ruleData.minRating} onChange={(e) => setRuleData({ ...ruleData, minRating: e.target.value })}>
                    <option value="1">1 sao ⭐</option>
                    <option value="2">2 sao ⭐⭐</option>
                    <option value="3">3 sao ⭐⭐⭐</option>
                    <option value="4">4 sao ⭐⭐⭐⭐</option>
                    <option value="5">5 sao ⭐⭐⭐⭐⭐</option>
                  </select>
                </div>
                <div className="tpl-form__group">
                  <label className="tpl-form__label">Max Rating</label>
                  <select className="input" value={ruleData.maxRating} onChange={(e) => setRuleData({ ...ruleData, maxRating: e.target.value })}>
                    <option value="1">1 sao ⭐</option>
                    <option value="2">2 sao ⭐⭐</option>
                    <option value="3">3 sao ⭐⭐⭐</option>
                    <option value="4">4 sao ⭐⭐⭐⭐</option>
                    <option value="5">5 sao ⭐⭐⭐⭐⭐</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="tpl-form__group">
                  <label className="tpl-form__label">Cảm xúc áp dụng</label>
                  <select className="input" value={ruleData.sentiment} onChange={(e) => setRuleData({ ...ruleData, sentiment: e.target.value })}>
                    <option value="POS">Tích cực (POS)</option>
                    <option value="NEU">Trung tính (NEU)</option>
                    <option value="NEG">Tiêu cực (NEG)</option>
                    <option value="MIXED">Hỗn hợp (MIXED)</option>
                  </select>
                </div>
                <div className="tpl-form__group">
                  <label className="tpl-form__label">Hành động tự động</label>
                  <select className="input" value={ruleData.actionType} onChange={(e) => setRuleData({ ...ruleData, actionType: e.target.value })}>
                    <option value="AUTO_REPLY">Trả lời tự động theo mẫu</option>
                    <option value="AUTO_REPLY_VOUCHER">Tự động trả lời + Gửi Voucher</option>
                    <option value="CREATE_URGENT_TICKET">Tạo Ticket CSKH xử lý khẩn</option>
                    <option value="SUGGEST_AI_RESPONSE">Gợi ý AI ViSoBERT</option>
                  </select>
                </div>
              </div>

              <div className="tpl-form__group">
                <label className="tpl-form__label">Thời gian hoãn (Phút)</label>
                <input className="input" type="number" min="0" value={ruleData.delayMinutes} onChange={(e) => setRuleData({ ...ruleData, delayMinutes: e.target.value })} placeholder="0 (Gửi ngay)" />
              </div>

              <div className="tpl-form__actions">
                <button type="button" className="btn btn--secondary" onClick={() => setShowRuleModal(false)}>Hủy</button>
                <button type="submit" className="btn btn--primary">
                  <Zap size={14} /> Lưu quy tắc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

