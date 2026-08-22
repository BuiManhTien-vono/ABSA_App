import { useEffect, useState } from 'react';
import { Users, Search, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import customerService from '../services/customerService';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCustomers();
  }, [page, search, riskFilter]);

  async function loadCustomers() {
    try {
      setLoading(true);
      const res = await customerService.getCustomers({ page, pageSize: 15, search, riskLevel: riskFilter });
      setCustomers(res?.items || []);
      setTotalPages(res?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRiskChange(id, newRisk) {
    try {
      await customerService.updateRiskLevel(id, newRisk);
      loadCustomers();
    } catch (err) {
      alert('Lỗi cập nhật mức rủi ro: ' + err.message);
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#1e293b' }}>Quản lý Khách hàng</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Phát hiện review bomber & quản lý mức độ rủi ro khách hàng</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={riskFilter}
            onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            <option value="">Tất cả mức rủi ro</option>
            <option value="NORMAL">Bình thường (NORMAL)</option>
            <option value="POTENTIAL_BOMMER">Nghi ngờ BOMMER</option>
            <option value="VIP">Khách hàng VIP</option>
          </select>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm theo tên KH, ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>Đang tải danh sách khách hàng...</div>
        ) : customers.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>Không có khách hàng nào.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '12px 16px' }}>Khách hàng</th>
                <th style={{ padding: '12px 16px' }}>Mã trên sàn</th>
                <th style={{ padding: '12px 16px' }}>Gian hàng</th>
                <th style={{ padding: '12px 16px' }}>Tổng số đánh giá</th>
                <th style={{ padding: '12px 16px' }}>Mức Rủi Ro (Risk Level)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Cập nhật Mức rủi ro</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0f172a' }}>
                    {c.displayName || 'Khách hàng ẩn danh'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontFamily: 'monospace' }}>{c.platformUserId}</td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>{c.storeName || 'Store'}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{c.totalReviewsCount} đánh giá</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: c.riskLevel === 'POTENTIAL_BOMMER' ? '#fef2f2' : c.riskLevel === 'VIP' ? '#f0fdf4' : '#f8fafc',
                      color: c.riskLevel === 'POTENTIAL_BOMMER' ? '#b91c1c' : c.riskLevel === 'VIP' ? '#15803d' : '#64748b',
                      border: `1px solid ${c.riskLevel === 'POTENTIAL_BOMMER' ? '#fecaca' : c.riskLevel === 'VIP' ? '#bbf7d0' : '#e2e8f0'}`
                    }}>
                      {c.riskLevel}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <select
                      value={c.riskLevel}
                      onChange={(e) => handleRiskChange(c.id, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    >
                      <option value="NORMAL">NORMAL</option>
                      <option value="POTENTIAL_BOMMER">POTENTIAL_BOMMER</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
