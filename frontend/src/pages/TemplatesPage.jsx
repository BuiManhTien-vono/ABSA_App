import { useEffect, useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, FileText, Zap } from 'lucide-react';
import responseService from '../services/responseService';

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'rules'
  const [templates, setTemplates] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showTplModal, setShowTplModal] = useState(false);
  const [tplData, setTplData] = useState({ title: '', contentTemplate: '', targetRating: '', targetSentiment: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [tRes, rRes] = await Promise.all([
        responseService.getTemplates({ pageSize: 50 }),
        responseService.getRules({ pageSize: 50 }),
      ]);
      setTemplates(tRes?.items || []);
      setRules(rRes?.items || []);
    } catch (err) {
      console.error(err);
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
      });
      setShowTplModal(false);
      setTplData({ title: '', contentTemplate: '', targetRating: '', targetSentiment: '' });
      loadData();
    } catch (err) {
      alert('Lỗi tạo mẫu: ' + err.message);
    }
  }

  async function handleToggleRule(id) {
    try {
      await responseService.toggleRule(id);
      loadData();
    } catch (err) {
      alert('Lỗi toggle quy tắc: ' + err.message);
    }
  }

  async function handleDeleteTemplate(id) {
    if (!confirm('Xóa mẫu phản hồi này?')) return;
    try {
      await responseService.deleteTemplate(id);
      loadData();
    } catch (err) {
      alert('Lỗi xóa mẫu: ' + err.message);
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#1e293b' }}>Quản lý Mẫu Phản hồi & Quy tắc Tự động</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Cấu hình mẫu trả lời và tự động hóa response cho gian hàng</p>
        </div>
        {activeTab === 'templates' && (
          <button
            onClick={() => setShowTplModal(true)}
            style={{ padding: '8px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Tạo Mẫu Mới
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('templates')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'templates' ? '2px solid #4f46e5' : '2px solid transparent',
            color: activeTab === 'templates' ? '#4f46e5' : '#64748b',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <FileText size={15} /> Mẫu Phản Hồi ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'rules' ? '2px solid #4f46e5' : '2px solid transparent',
            color: activeTab === 'rules' ? '#4f46e5' : '#64748b',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Zap size={15} /> Quy Tắc Tự Động ({rules.length})
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>Đang tải...</div>
      ) : activeTab === 'templates' ? (
        /* Templates Tab */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {templates.map((t) => (
            <div key={t.id} style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>{t.title}</strong>
                  <button onClick={() => handleDeleteTemplate(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  {t.targetRating && <span style={{ fontSize: '11px', background: '#fef9c3', color: '#854d0e', padding: '1px 6px', borderRadius: '4px' }}>{t.targetRating} ⭐</span>}
                  {t.targetSentiment && <span style={{ fontSize: '11px', background: '#e0e7ff', color: '#3730a3', padding: '1px 6px', borderRadius: '4px' }}>{t.targetSentiment}</span>}
                </div>
                <p style={{ fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '10px', borderRadius: '6px', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {t.contentTemplate}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Rules Tab */
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '12px 16px' }}>Tên Quy Tắc</th>
                <th style={{ padding: '12px 16px' }}>Khoảng Rating</th>
                <th style={{ padding: '12px 16px' }}>Hành Động</th>
                <th style={{ padding: '12px 16px' }}>Trạng Thái</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Bật/Tắt</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0f172a' }}>{r.ruleName}</td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>{r.minRating} ⭐ – {r.maxRating} ⭐</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{r.actionType}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', background: r.isEnabled ? '#dcfce7' : '#f1f5f9', color: r.isEnabled ? '#15803d' : '#64748b' }}>
                      {r.isEnabled ? 'Đang hoạt động' : 'Tắt'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button onClick={() => handleToggleRule(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: r.isEnabled ? '#16a34a' : '#94a3b8' }}>
                      {r.isEnabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal create template */}
      {showTplModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Tạo Mẫu Phản hồi Mới</h3>
            <form onSubmit={handleCreateTemplate}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Tiêu đề mẫu</label>
                <input type="text" required value={tplData.title} onChange={(e) => setTplData({ ...tplData, title: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Nội dung mẫu (Hỗ trợ biến template)</label>
                <textarea rows={4} required value={tplData.contentTemplate} onChange={(e) => setTplData({ ...tplData, contentTemplate: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowTplModal(false)} style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: '#4f46e5', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>Lưu mẫu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
