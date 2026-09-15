import { useEffect, useState } from 'react';
import {
  Headset, CheckCircle2, Clock, AlertTriangle, LayoutGrid, Table2, X,
  CircleAlert, ArrowRight, UserCheck, RefreshCw, Zap, Plus, Sparkles
} from 'lucide-react';
import ticketService from '../services/ticketService';
import './TicketsPage.css';

const PRIORITY_BADGE = {
  URGENT: 'badge--urgent',
  HIGH: 'badge--high',
  MEDIUM: 'badge--medium',
  LOW: 'badge--low',
};

const STATUS_BADGE = {
  OPEN: 'badge--open',
  IN_PROGRESS: 'badge--in-progress',
  RESOLVED: 'badge--resolved',
  CLOSED: 'badge--closed',
};

const KANBAN_COLUMNS = [
  { key: 'OPEN', label: 'Đang mở', cls: 'kanban-column--open', icon: CircleAlert },
  { key: 'IN_PROGRESS', label: 'Đang xử lý', cls: 'kanban-column--progress', icon: Clock },
  { key: 'RESOLVED', label: 'Đã giải quyết', cls: 'kanban-column--resolved', icon: CheckCircle2 },
  { key: 'CLOSED', label: 'Đã đóng', cls: 'kanban-column--closed', icon: CheckCircle2 },
];

const DEFAULT_MOCK_TICKETS = [
  {
    id: 'ticket-101',
    customerName: 'Nguyễn Thu Hà',
    reviewRating: 1,
    reviewComment: 'Tai nghe dùng 1 tiếng là sụt pin tắt nguồn! Chat với shop không ai trả lời.',
    productName: 'Tai Nghe True Wireless Chống Ồn',
    storeName: 'Điện Tử Digital World',
    priority: 'URGENT',
    status: 'OPEN',
    assignedToName: 'Trần Văn Nam (CSKH)',
    createdAt: '2026-09-14T10:30:00',
    aiAnalysis: 'Lỗi thời lượng pin nghiêm trọng. Khách hàng bức xúc tột độ có thể đánh giá tiêu cực trên MXH.'
  },
  {
    id: 'ticket-102',
    customerName: 'Đặng Minh Quân',
    reviewRating: 2,
    reviewComment: 'Giao nhầm size tã bỉm rồi shop ơi! Đặt size L mà giao size M cho bé.',
    productName: 'Tã Bỉm Trẻ Em Cao Cấp',
    storeName: 'Mẹ & Bé Paradise',
    priority: 'HIGH',
    status: 'OPEN',
    assignedToName: 'Lê Mỹ Duyên',
    createdAt: '2026-09-14T11:15:00',
    aiAnalysis: 'Giao nhầm phân loại hàng. Đề xuất đổi hàng hỏa tốc trong ngày.'
  },
  {
    id: 'ticket-103',
    customerName: 'Bùi Việt Hùng',
    reviewRating: 1,
    reviewComment: 'Bị liệt phím Space sau 3 ngày sử dụng! Đề nghị shop cho đổi bảo hành gấp.',
    productName: 'Bàn Phím Cơ Bluetooth K87',
    storeName: 'Điện Tử Digital World',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    assignedToName: 'Nguyễn Văn Nam (CSKH)',
    createdAt: '2026-09-14T09:00:00',
    aiAnalysis: 'Lỗi phần cứng sản phẩm. Đã liên hệ shipper lấy hàng về bảo hành 1-1.'
  },
  {
    id: 'ticket-104',
    customerName: 'Đỗ Đức Anh',
    reviewRating: 3,
    reviewComment: 'Áo mỏng hơn hình quảng cáo, chỉ thừa ở cổ áo tương đối nhiều.',
    productName: 'Áo Phông Cotton Nam Premium',
    storeName: 'Thời Trang Nam Urban',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    assignedToName: 'Phạm Thu Thảo',
    createdAt: '2026-09-13T16:20:00',
    aiAnalysis: 'Khách hàng nhận xét chất lượng ở mức trung bình. Đã gửi tin nhắn tư vấn và mã bù 10%.'
  },
  {
    id: 'ticket-105',
    customerName: 'Phạm Quốc Bảo',
    reviewRating: 2,
    reviewComment: 'Bọc hàng sơ sài quá, hộp đựng giày bị móp bẹp gí góc.',
    productName: 'Giày Sneaker Thể Thao Nam',
    storeName: 'Thể Thao & Outdoor Pro',
    priority: 'HIGH',
    status: 'RESOLVED',
    assignedToName: 'Lê Mỹ Duyên',
    createdAt: '2026-09-13T08:45:00',
    resolutionNotes: 'Đã gọi điện xin lỗi khách hàng, tặng Voucher 20k và đóng gói lại chống sốc cho đơn sau.'
  },
  {
    id: 'ticket-106',
    customerName: 'Nguyễn Khánh Duy',
    reviewRating: 1,
    reviewComment: 'Hàng móp vỏ hộp, nhắn tin hỗ trợ cả ngày không thấy shop nào thèm reply.',
    productName: 'Son Kem Lỳ Velvet Tint',
    storeName: 'Sức Khỏe & Làm Đẹp Care',
    priority: 'MEDIUM',
    status: 'CLOSED',
    assignedToName: 'Phạm Thu Thảo',
    createdAt: '2026-09-12T14:10:00',
    resolutionNotes: 'Đã hoàn tất gửi quà bù đắp và khách hàng chấp nhận sửa lại đánh giá thành 5 sao.'
  }
];

function getInitial(name) {
  return (name || 'U').charAt(0).toUpperCase();
}

import { LAZADA_STORES } from '../data/lazadaData';
import { SHOPEE_STORES } from '../data/shopeeData';
import { TIKTOK_SHOP_STORES } from '../data/tiktokShopData';

function getConnectedStoreNames() {
  const names = [];
  try {
    const connections = JSON.parse(localStorage.getItem('connectedPlatforms') || '{}');
    if (connections.lazada?.connected) {
      const selectedIds = Array.isArray(connections.lazada?.stores) ? connections.lazada.stores.map(String) : [];
      LAZADA_STORES.forEach(s => {
        if (selectedIds.length === 0 || selectedIds.includes(String(s.id))) {
          names.push(s.name);
        }
      });
    }
    if (connections.shopee?.connected || localStorage.getItem('shopeeActivated') === 'true') {
      const selectedIds = Array.isArray(connections.shopee?.stores) ? connections.shopee.stores.map(String) : [];
      SHOPEE_STORES.forEach(s => {
        if (selectedIds.length === 0 || selectedIds.includes(String(s.id))) {
          names.push(s.name);
        }
      });
    }
    if (connections['tiktok-shop']?.connected) {
      const selectedIds = Array.isArray(connections['tiktok-shop']?.stores) ? connections['tiktok-shop'].stores.map(String) : [];
      TIKTOK_SHOP_STORES.forEach(s => {
        if (selectedIds.length === 0 || selectedIds.includes(String(s.id))) {
          names.push(s.name);
        }
      });
    }
  } catch (e) {
    console.error(e);
  }
  return names;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  async function loadData() {
    try {
      setLoading(true);
      const [tRes] = await Promise.all([
        ticketService.getTickets({ pageSize: 100, status: statusFilter }).catch(() => null),
      ]);
      const items = tRes?.items || [];
      let rawItems = items.length > 0 ? items : DEFAULT_MOCK_TICKETS;

      const connectedNames = getConnectedStoreNames();
      if (connectedNames.length > 0) {
        rawItems = rawItems.filter(t => connectedNames.includes(t.storeName));
      } else {
        // If 0 stores are connected, 0 tickets are shown!
        rawItems = [];
      }

      setTickets(rawItems);
    } catch (err) {
      console.error(err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(e) {
    e.preventDefault();
    if (!selectedTicket || !resolutionNotes.trim()) return;
    try {
      await ticketService.resolveTicket(selectedTicket.id, resolutionNotes).catch(() => null);
      
      // Update local state
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: 'RESOLVED', resolutionNotes } : t));
      alert('Đã giải quyết ticket thành công!');
      setSelectedTicket(null);
      setResolutionNotes('');
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  }

  async function handleStatusChange(ticketId, newStatus, e) {
    if (e) e.stopPropagation();
    try {
      await ticketService.updateTicketStatus(ticketId, newStatus).catch(() => null);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Calculate live stats from tickets list
  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;
  const urgentCount = tickets.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH').length;

  const statCards = [
    { key: 'open', label: 'Ticket Đang Mở', value: openCount, cls: 'ticket-stat-card--open' },
    { key: 'progress', label: 'Đang Xử Lý', value: inProgressCount, cls: 'ticket-stat-card--progress' },
    { key: 'resolved', label: 'Đã Giải Quyết', value: resolvedCount, cls: 'ticket-stat-card--resolved' },
    { key: 'urgent', label: 'Ưu Tiên Gấp', value: urgentCount, cls: 'ticket-stat-card--urgent' },
  ];

  // Group tickets by status for Kanban
  const filteredTickets = statusFilter ? tickets.filter(t => t.status === statusFilter) : tickets;

  const groupedTickets = {};
  KANBAN_COLUMNS.forEach((col) => { groupedTickets[col.key] = []; });
  filteredTickets.forEach((t) => {
    if (groupedTickets[t.status]) groupedTickets[t.status].push(t);
    else if (groupedTickets.OPEN) groupedTickets.OPEN.push(t);
  });

  return (
    <div className="tickets-page">
      {/* Header */}
      <div className="tickets-page__header">
        <div>
          <h1 className="tickets-page__title">
            <Headset size={22} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 8 }} />
            Hệ thống Ticket CSKH & Khiếu Nại
          </h1>
          <p className="tickets-page__subtitle">Tự động tạo ticket từ đánh giá tiêu cực · Phân công & theo dõi tiến độ xử lý khiếu nại</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="tickets-stats stagger-children">
        {statCards.map((s) => (
          <div key={s.key} className={`ticket-stat-card ${s.cls}`}>
            <span className="ticket-stat__label">{s.label}</span>
            <span className="ticket-stat__value">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="tickets-toolbar">
        <div className="tickets-toolbar__filters">
          {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((f) => {
            const count = f ? tickets.filter(t => t.status === f).length : tickets.length;
            return (
              <button
                key={f || 'all'}
                className={`ticket-filter-chip ${statusFilter === f ? 'active' : ''}`}
                onClick={() => setStatusFilter(f)}
              >
                {f === 'OPEN' ? 'Đang mở' : f === 'IN_PROGRESS' ? 'Đang xử lý' : f === 'RESOLVED' ? 'Đã giải quyết' : f === 'CLOSED' ? 'Đã đóng' : 'Tất cả'} ({count})
              </button>
            );
          })}
        </div>

        <div className="tickets-view-toggle">
          <button className={viewMode === 'kanban' ? 'active' : ''} onClick={() => setViewMode('kanban')}>
            <LayoutGrid size={13} /> Kanban
          </button>
          <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}>
            <Table2 size={13} /> Bảng
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="empty-state">Đang tải danh sách ticket CSKH...</div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Board */
        <div className="tickets-kanban">
          {KANBAN_COLUMNS.map((col) => {
            const Icon = col.icon;
            const items = groupedTickets[col.key] || [];
            return (
              <div key={col.key} className={`kanban-column ${col.cls}`}>
                <div className="kanban-column__header">
                  <span className="kanban-column__title">
                    <Icon size={14} /> {col.label}
                  </span>
                  <span className="kanban-column__count">{items.length}</span>
                </div>
                <div className="kanban-column__cards">
                  {items.length === 0 ? (
                    <div style={{ padding: 16, textAlign: 'center', color: 'var(--surface-400)', fontSize: 12 }}>
                      Không có ticket
                    </div>
                  ) : (
                    items.map((t, idx) => (
                      <div
                        key={t.id}
                        className="kanban-card"
                        style={{ animationDelay: `${idx * 40}ms` }}
                        onClick={() => setSelectedTicket(t)}
                      >
                        <div className="kanban-card__priority">
                          <span className={`badge ${PRIORITY_BADGE[t.priority] || 'badge--muted'}`}>{t.priority}</span>
                          <span style={{ fontSize: 11, color: 'var(--surface-500)', fontWeight: 600 }}>{t.storeName}</span>
                        </div>
                        <div className="kanban-card__comment">
                          <span style={{ color: '#f59e0b', fontWeight: 700, marginRight: 4 }}>{'⭐'.repeat(t.reviewRating || 0)}</span>
                          "{t.reviewComment || 'Không có nội dung'}"
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--surface-500)', marginBottom: 8 }}>
                          📦 {t.productName || 'Sản phẩm'}
                        </div>
                        <div className="kanban-card__footer">
                          <span style={{ fontWeight: 600, color: 'var(--surface-800)' }}>👤 {t.customerName || 'Khách hàng'}</span>
                          {t.assignedToName ? (
                            <span className="kanban-card__avatar" title={t.assignedToName}>{getInitial(t.assignedToName)}</span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--surface-400)' }}>Chưa gán</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="tickets-table-wrapper">
          <table className="tickets-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Sản phẩm & Gian hàng</th>
                <th>Nội dung Đánh giá</th>
                <th>Mức ưu tiên</th>
                <th>Trạng thái</th>
                <th>Nhân viên CSKH</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state">Không có ticket nào.</div></td></tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.id} onClick={() => setSelectedTicket(t)} style={{ cursor: 'pointer' }}>
                    <td className="tickets-table__customer">{t.customerName || 'Khách hàng'}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--surface-900)' }}>{t.productName}</div>
                      <div style={{ fontSize: 11, color: 'var(--surface-400)' }}>{t.storeName}</div>
                    </td>
                    <td className="tickets-table__comment">
                      <span style={{ color: '#f59e0b', fontWeight: 700, marginRight: 4 }}>{'⭐'.repeat(t.reviewRating || 0)}</span>
                      "{t.reviewComment}"
                    </td>
                    <td><span className={`badge ${PRIORITY_BADGE[t.priority] || 'badge--muted'}`}>{t.priority}</span></td>
                    <td>
                      <select 
                        className="customer-risk-select"
                        value={t.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(t.id, e.target.value, e)}
                      >
                        <option value="OPEN">OPEN (Đang mở)</option>
                        <option value="IN_PROGRESS">IN_PROGRESS (Đang xử lý)</option>
                        <option value="RESOLVED">RESOLVED (Đã giải quyết)</option>
                        <option value="CLOSED">CLOSED (Đã đóng)</option>
                      </select>
                    </td>
                    <td style={{ color: t.assignedToName ? 'var(--surface-700)' : 'var(--surface-400)', fontWeight: 600 }}>
                      {t.assignedToName || 'Chưa gán'}
                    </td>
                    <td className="tickets-table__actions" onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn--primary btn--sm" onClick={() => setSelectedTicket(t)}>Xử lý Ticket</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Resolve Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedTicket(null)}>
          <div className="modal-content animate-scale-in" style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--surface-900)' }}>
                <Headset size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 8, color: 'var(--brand-600)' }} />
                Chi Tiết & Xử Lý Ticket CSKH #{selectedTicket.id}
              </h3>
              <button className="review-detail__close" onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--surface-400)', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <div className="resolve-modal__review" style={{ background: 'var(--surface-50)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-200)', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span className={`badge ${PRIORITY_BADGE[selectedTicket.priority] || 'badge--muted'}`}>{selectedTicket.priority}</span>
                <span className={`badge ${STATUS_BADGE[selectedTicket.status] || 'badge--muted'}`}>{selectedTicket.status}</span>
                <span style={{ fontSize: 12, color: 'var(--surface-500)', alignSelf: 'center', fontWeight: 600 }}>🏬 {selectedTicket.storeName}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--surface-800)', marginBottom: 4 }}>
                Khách hàng: <strong>{selectedTicket.customerName}</strong> · Sản phẩm: <strong>{selectedTicket.productName}</strong>
              </div>
              <div style={{ marginTop: 6, fontSize: 13, fontStyle: 'italic', color: 'var(--surface-700)', background: '#fff', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-200)' }}>
                <span style={{ color: '#f59e0b', fontWeight: 700, marginRight: 6 }}>{'⭐'.repeat(selectedTicket.reviewRating || 0)}</span>
                "{selectedTicket.reviewComment}"
              </div>
              {selectedTicket.aiAnalysis && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#3730a3', background: '#e0e7ff', padding: 8, borderRadius: 'var(--radius-sm)' }}>
                  <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} /> <strong>Phân tích AI:</strong> {selectedTicket.aiAnalysis}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--surface-700)', marginBottom: 6 }}>
                Chuyển Trạng Thái Ticket
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`btn btn--sm ${selectedTicket.status === st ? 'btn--primary' : 'btn--secondary'}`}
                    onClick={(e) => handleStatusChange(selectedTicket.id, st, e)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleResolve}>
              <div className="tpl-form__group">
                <label className="tpl-form__label">Ghi chú giải quyết / Phương án xử lý CSKH</label>
                <textarea
                  className="input"
                  rows={4}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Ví dụ: Đã gọi điện xin lỗi khách hàng, đổi lại sản phẩm mới và tặng voucher 20k..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="tpl-form__actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <button type="button" className="btn btn--secondary" onClick={() => setSelectedTicket(null)}>Đóng</button>
                <button type="submit" className="btn btn--primary">
                  <CheckCircle2 size={14} /> Xử lý & Đánh dấu Đã giải quyết
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
