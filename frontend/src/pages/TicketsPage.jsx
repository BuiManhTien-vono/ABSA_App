import { useEffect, useState } from 'react';
import { Headset, CheckCircle2, Clock, AlertTriangle, UserCheck } from 'lucide-react';
import ticketService from '../services/ticketService';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  async function loadData() {
    try {
      setLoading(true);
      const [tRes, sRes] = await Promise.all([
        ticketService.getTickets({ pageSize: 30, status: statusFilter }),
        ticketService.getStats(),
      ]);
      setTickets(tRes?.items || []);
      setStats(sRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(e) {
    e.preventDefault();
    if (!selectedTicket || !resolutionNotes.trim()) return;
    try {
      await ticketService.resolveTicket(selectedTicket.id, resolutionNotes);
      alert('Đã giải quyết ticket thành công!');
      setSelectedTicket(null);
      setResolutionNotes('');
      loadData();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#1e293b' }}>Hệ thống Ticket CSKH & Xử lý Khiếu nại</h1>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Tự động tạo ticket khi AI phát hiện đánh giá tiêu cực (NEG)</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Ticket Đang Mở (OPEN)</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444', marginTop: '4px' }}>{stats?.openCount || 0}</div>
        </div>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Đang Xử Lý (IN_PROGRESS)</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>{stats?.inProgressCount || 0}</div>
        </div>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Đã Giải Quyết (RESOLVED)</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>{stats?.resolvedCount || 0}</div>
        </div>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Ưu Tiên Gấp (URGENT/HIGH)</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#b91c1c', marginTop: '4px' }}>{(stats?.urgentCount || 0) + (stats?.highCount || 0)}</div>
        </div>
      </div>

      {/* Ticket List Table */}
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
              <th style={{ padding: '12px 16px' }}>Khách hàng</th>
              <th style={{ padding: '12px 16px' }}>Nội dung Đánh giá gốc</th>
              <th style={{ padding: '12px 16px' }}>Mức ưu tiên</th>
              <th style={{ padding: '12px 16px' }}>Trạng thái</th>
              <th style={{ padding: '12px 16px' }}>Nhân viên CSKH</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center' }}>Đang tải danh sách ticket...</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Không có ticket nào.</td></tr>
            ) : (
              tickets.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0f172a' }}>{t.customerName || 'Khách hàng'}</td>
                  <td style={{ padding: '12px 16px', color: '#334155', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {'⭐'.repeat(t.reviewRating)} {t.reviewComment}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                      background: t.priority === 'HIGH' || t.priority === 'URGENT' ? '#fee2e2' : '#f1f5f9',
                      color: t.priority === 'HIGH' || t.priority === 'URGENT' ? '#b91c1c' : '#475569'
                    }}>
                      {t.priority}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 500,
                      background: t.status === 'OPEN' ? '#fef2f2' : t.status === 'RESOLVED' ? '#dcfce7' : '#fef9c3',
                      color: t.status === 'OPEN' ? '#b91c1c' : t.status === 'RESOLVED' ? '#15803d' : '#a16207'
                    }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{t.assignedToName || 'Chưa gán'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedTicket(t)}
                      style={{ padding: '4px 10px', borderRadius: '4px', background: '#4f46e5', color: '#fff', border: 'none', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Xử lý
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resolve Modal */}
      {selectedTicket && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>Giải Quyết Ticket CSKH</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
              Đánh giá của <strong>{selectedTicket.customerName}</strong>: "{selectedTicket.reviewComment}"
            </p>
            <form onSubmit={handleResolve}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Ghi chú Giải quyết (Resolution Notes)</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Nhập ghi chú phương án xử lý (ví dụ: Đã gọi điện xin lỗi và gửi mã giảm giá 20%)..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setSelectedTicket(null)} style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', cursor: 'pointer' }}>Đóng</button>
                <button type="submit" style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: '#10b981', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>Xác nhận Giải quyết</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
