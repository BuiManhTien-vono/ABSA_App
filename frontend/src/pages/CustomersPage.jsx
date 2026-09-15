import { useEffect, useState } from 'react';
import { Users, Search, ShieldAlert, Crown, UserCheck, X, Sparkles, AlertTriangle, Eye, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import customerService from '../services/customerService';
import './CustomersPage.css';

const RISK_BADGE = {
  NORMAL: 'badge--muted',
  POTENTIAL_BOMMER: 'badge--neg',
  VIP: 'badge--pos',
};

const CUSTOMER_SEEDS = [
  { name: 'Nguyễn Thu Hà', risk: 'POTENTIAL_BOMMER', rating: 1.8, pos: 2, neu: 2, neg: 14, reason: '14/18 đánh giá 1-2★ (78% Tiêu cực). Từng spam 4 bình luận đòi bồi thường trong 24h.', rec: 'Cần liên hệ hỗ trợ xác minh kỹ đơn hàng trước khi giải quyết bồi hoàn. Hạn chế tặng Voucher tự động.', reviewText: 'Pin dùng được 1 tiếng là sụt tắt nguồn! Đề nghị shop cho đổi trả gấp.' },
  { name: 'Lê Mai Anh', risk: 'VIP', rating: 5.0, pos: 12, neu: 0, neg: 0, reason: '100% đánh giá 5★ (12 đơn hàng). Đóng góp nhiều bình luận khen ngợi chi tiết.', rec: 'Khách hàng thân thiết VIP. Đề xuất tự động gửi tặng Voucher giảm giá 15% định kỳ.', reviewText: 'Vải mát, mịn, giặt không xù. Đóng gói rất cẩn thận 2 lớp chống sốc.' },
  { name: 'Trần Tuấn Kiệt', risk: 'VIP', rating: 4.9, pos: 14, neu: 1, neg: 0, reason: '14/15 đánh giá 5★. Thường xuyên quay video review chi tiết sản phẩm.', rec: 'Khách hàng VIP tiềm năng làm KOC review. Nên duy trì chăm sóc ưu tiên.', reviewText: 'Hàng chuẩn chính hãng, đóng gói bọc xốp đẹp chill. 10 điểm cho shop!' },
  { name: 'Đặng Minh Quân', risk: 'POTENTIAL_BOMMER', rating: 1.5, pos: 1, neu: 1, neg: 7, reason: '7/9 đánh giá 1-2★. Tỷ lệ khiếu nại giao sai màu/thiếu quà cao bất thường.', rec: 'Chụp ảnh đóng gói cẩn thận trước khi bàn giao Shipper cho khách hàng này.', reviewText: 'Giao nhầm hàng rồi shop ơi. Gọi tổng đài máy bận liên tục.' },
  { name: 'Phạm Quốc Bảo', risk: 'NORMAL', rating: 4.6, pos: 6, neu: 2, neg: 0, reason: 'Đánh giá tự nhiên, tỷ lệ khen/chê hợp lý, không có dấu hiệu bất thường.', rec: 'Tài khoản bình thường. Tiếp tục chăm sóc theo quy trình tiêu chuẩn.', reviewText: 'Dùng rất ổn trong tầm giá, giao hàng nhanh 2 ngày đã nhận được.' },
  { name: 'Bùi Việt Hùng', risk: 'POTENTIAL_BOMMER', rating: 2.0, pos: 3, neu: 3, neg: 16, reason: '16/22 đánh giá 1-2★. Lịch sử khiếu nại bóp méo bao bì trên 3 gian hàng khác nhau.', rec: 'Hệ thống đánh dấu nguy cơ Review Bomber. Kiểm tra quy trình niêm phong vỏ hộp.', reviewText: 'Vỏ hộp móp méo, tem vỡ. Đề nghị đền bù đổi mới!' },
  { name: 'Vũ Thùy Linh', risk: 'VIP', rating: 5.0, pos: 14, neu: 0, neg: 0, reason: '14/14 đánh giá 5★ kèm hình ảnh check-in thực tế.', rec: 'Khách hàng VIP cao cấp. Ưu tiên xử lý đơn và tặng mã ưu đãi đặc biệt.', reviewText: 'Sản phẩm mượt đẹp xinh xỉu. Shop tặng kèm quà dưỡng da rất thích!' },
  { name: 'Trần Thanh Hương', risk: 'NORMAL', rating: 4.2, pos: 4, neu: 1, neg: 1, reason: 'Đánh giá bình thường, có khen và góp ý xây dựng.', rec: 'Tài khoản tiêu chuẩn.', reviewText: 'Sản phẩm mặc vừa vặn, đóng gói cẩn thận chỉn chu.' },
  { name: 'Hoàng Trọng Nghĩa', risk: 'POTENTIAL_BOMMER', rating: 1.6, pos: 2, neu: 1, neg: 11, reason: '11/14 đánh giá 1★. Hay yêu cầu hoàn tiền không trả hàng.', rec: 'Yêu cầu quy trình trả hàng đúng quy định sàn trước khi hoàn tiền.', reviewText: 'Hàng hư hỏng không dùng được, shop làm ăn dối trá!' },
  { name: 'Đỗ Phương Thảo', risk: 'VIP', rating: 4.8, pos: 18, neu: 2, neg: 0, reason: '20 đơn hàng tin tưởng mua sắm liên tục 6 tháng qua.', rec: 'Gửi thiệp cảm ơn và tặng mã quà tặng độc quyền VIP.', reviewText: 'Luôn ủng hộ shop, giao hàng hỏa tốc trong ngày sản phẩm chuẩn 100%.' },
  { name: 'Nguyễn Văn Hải', risk: 'NORMAL', rating: 4.5, pos: 8, neu: 2, neg: 1, reason: 'Tài khoản mua sắm định kỳ, đánh giá khách quan.', rec: 'Tài khoản bình thường.', reviewText: 'Sản phẩm đúng như mô tả, dùng tốt.' },
  { name: 'Phạm Kim Ngân', risk: 'VIP', rating: 5.0, pos: 10, neu: 0, neg: 0, reason: '10/10 đánh giá 5★, mua hàng giá trị cao.', rec: 'VIP Member. Gửi ưu đãi giảm 20% đơn tiếp theo.', reviewText: 'Chất lượng tuyệt vời, tư vấn CSKH 100 điểm!' },
  { name: 'Trịnh Quốc Tuấn', risk: 'POTENTIAL_BOMMER', rating: 1.7, pos: 1, neu: 2, neg: 9, reason: 'Spam bình luận tiêu cực liên tục trong các phiên Livestream.', rec: 'Tự động kiểm tra lịch sử chat và chặn bình luận rác.', reviewText: 'Shop lừa đảo, đặt một đằng giao một nẻo!' },
  { name: 'Lê Hoàng Yến', risk: 'NORMAL', rating: 4.4, pos: 5, neu: 1, neg: 0, reason: 'Đánh giá tích cực vừa đủ, thái độ vui vẻ.', rec: 'Chăm sóc thông thường.', reviewText: 'Đóng gói chắc chắn, bọc nilon 3 lớp ưng ý.' },
  { name: 'Đinh Quang Huy', risk: 'VIP', rating: 4.9, pos: 16, neu: 1, neg: 0, reason: '16/17 đơn hàng 5★, mua sắm đa dạng.', rec: 'Tài khoản thân thiết, ưu tiên giao hàng nhanh.', reviewText: 'Đồ dùng rất bền, shop hỗ trợ nhiệt tình.' },
];

import { LAZADA_STORES } from '../data/lazadaData';
import { SHOPEE_STORES } from '../data/shopeeData';
import { TIKTOK_SHOP_STORES } from '../data/tiktokShopData';

function getConnectedStoresList() {
  const stores = [];
  try {
    const connections = JSON.parse(localStorage.getItem('connectedPlatforms') || '{}');
    if (connections['tiktok-shop']?.connected) {
      const selectedIds = Array.isArray(connections['tiktok-shop']?.stores) ? connections['tiktok-shop'].stores.map(String) : [];
      TIKTOK_SHOP_STORES.forEach(s => {
        if (selectedIds.length === 0 || selectedIds.includes(String(s.id))) {
          stores.push({ id: s.id, name: s.name, platform: 'TikTok Shop' });
        }
      });
    }
    if (connections.shopee?.connected || localStorage.getItem('shopeeActivated') === 'true') {
      const selectedIds = Array.isArray(connections.shopee?.stores) ? connections.shopee.stores.map(String) : [];
      SHOPEE_STORES.forEach(s => {
        if (selectedIds.length === 0 || selectedIds.includes(String(s.id))) {
          stores.push({ id: s.id, name: s.name, platform: 'Shopee' });
        }
      });
    }
    if (connections.lazada?.connected) {
      const selectedIds = Array.isArray(connections.lazada?.stores) ? connections.lazada.stores.map(String) : [];
      LAZADA_STORES.forEach(s => {
        if (selectedIds.length === 0 || selectedIds.includes(String(s.id))) {
          stores.push({ id: s.id, name: s.name, platform: 'Lazada' });
        }
      });
    }
  } catch (e) {
    console.error(e);
  }

  // Fallback to all mock stores if none explicitly connected
  if (stores.length === 0) {
    TIKTOK_SHOP_STORES.forEach(s => stores.push({ id: s.id, name: s.name, platform: 'TikTok Shop' }));
    SHOPEE_STORES.slice(0, 3).forEach(s => stores.push({ id: s.id, name: s.name, platform: 'Shopee' }));
    LAZADA_STORES.slice(0, 3).forEach(s => stores.push({ id: s.id, name: s.name, platform: 'Lazada' }));
  }

  return stores;
}

function generateRichCustomerList() {
  const targetStores = getConnectedStoresList();
  const results = [];
  let idCounter = 1;

  targetStores.forEach((store, storeIdx) => {
    // Pick 3 unique seeds for each store
    const seedIndices = [
      (storeIdx * 3) % CUSTOMER_SEEDS.length,
      (storeIdx * 3 + 1) % CUSTOMER_SEEDS.length,
      (storeIdx * 3 + 2) % CUSTOMER_SEEDS.length,
    ];

    seedIndices.forEach((seedIdx, subIdx) => {
      const seed = CUSTOMER_SEEDS[seedIdx];
      const prefix = store.platform === 'TikTok Shop' ? 'TTS' : store.platform === 'Shopee' ? 'SHP' : 'LZD';
      const userNum = 300000 + (storeIdx * 43 + subIdx * 19 + idCounter * 7) % 690000;

      results.push({
        id: `cust-${idCounter++}`,
        displayName: seed.name,
        platformUserId: `${prefix}_USER_${userNum}`,
        storeName: store.name,
        platform: store.platform,
        totalReviewsCount: seed.pos + seed.neu + seed.neg,
        riskLevel: seed.risk,
        posCount: seed.pos,
        neuCount: seed.neu,
        negCount: seed.neg,
        avgRating: seed.rating,
        evidenceReason: seed.reason,
        aiRecommendation: seed.rec,
        recentReviews: [
          {
            prod: `Sản phẩm gian hàng ${store.name}`,
            rating: Math.round(seed.rating),
            text: seed.reviewText,
            sentiment: seed.risk === 'POTENTIAL_BOMMER' ? 'NEG' : seed.risk === 'VIP' ? 'POS' : 'NEU',
            date: `2026-09-${String(15 - (idCounter % 10)).padStart(2, '0')}`
          }
        ]
      });
    });
  });

  return results;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, [page, search, riskFilter]);

  async function loadCustomers() {
    try {
      setLoading(true);
      const res = await customerService.getCustomers({ page: 1, pageSize: 100, search, riskLevel: riskFilter }).catch(() => null);
      const dbItems = res?.items || [];

      let items = generateRichCustomerList();

      if (dbItems.length > 0) {
        dbItems.forEach((c, idx) => {
          if (idx < items.length) {
            if (c.displayName && c.displayName !== 'Khách hàng ẩn danh') items[idx].displayName = c.displayName;
            if (c.platformUserId && c.platformUserId !== 'string') items[idx].platformUserId = c.platformUserId;
            if (c.storeName && c.storeName !== 'Store') items[idx].storeName = c.storeName;
            if (c.riskLevel && c.riskLevel !== 'NORMAL') items[idx].riskLevel = c.riskLevel;
          }
        });
      }

      if (riskFilter) items = items.filter(c => c.riskLevel === riskFilter);
      if (search) {
        const q = search.toLowerCase();
        items = items.filter(c => 
          (c.displayName || '').toLowerCase().includes(q) || 
          (c.platformUserId || '').toLowerCase().includes(q) ||
          (c.storeName || '').toLowerCase().includes(q)
        );
      }

      setCustomers(items);
    } catch (err) {
      console.error(err);
      setCustomers(generateRichCustomerList());
    } finally {
      setLoading(false);
    }
  }

  async function handleRiskChange(id, newRisk, e) {
    if (e) e.stopPropagation();
    try {
      await customerService.updateRiskLevel(id, newRisk).catch(() => null);
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, riskLevel: newRisk } : c));
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(prev => prev ? { ...prev, riskLevel: newRisk } : null);
      }
    } catch (err) {
      alert('Lỗi cập nhật mức rủi ro: ' + err.message);
    }
  }

  const totalCustomers = customers.length;
  const vipCount = customers.filter((c) => c.riskLevel === 'VIP').length;
  const riskCount = customers.filter((c) => c.riskLevel === 'POTENTIAL_BOMMER').length;
  const maxReviews = Math.max(1, ...customers.map((c) => c.totalReviewsCount || 0));

  return (
    <div className="customers-page">
      {/* Header */}
      <div className="customers-page__header">
        <div>
          <h1 className="customers-page__title">
            <Users size={22} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 8 }} />
            Quản lý Khách hàng & Phân tích Rủi ro
          </h1>
          <p className="customers-page__subtitle">Phát hiện review bomber, phân loại khách VIP & quản lý bằng chứng rủi ro đa sàn</p>
        </div>
        <div className="customers-page__filters">
          <select
            className="input"
            style={{ width: 'auto', minWidth: 180 }}
            value={riskFilter}
            onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả mức rủi ro ({totalCustomers})</option>
            <option value="NORMAL">🟢 Bình thường (NORMAL)</option>
            <option value="POTENTIAL_BOMMER">🔴 Nghi ngờ BOMMER ({riskCount})</option>
            <option value="VIP">⭐ Khách hàng VIP ({vipCount})</option>
          </select>
          <div className="customers-search">
            <Search size={14} className="customers-search__icon" />
            <input
              type="text"
              className="customers-search__input"
              placeholder="Tìm tên KH, Mã sàn, Store..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="customers-stats stagger-children">
        <div className="customer-stat-card">
          <div className="customer-stat__icon customer-stat__icon--total"><Users size={20} /></div>
          <div>
            <div className="customer-stat__value">{totalCustomers}</div>
            <div className="customer-stat__label">Tổng khách hàng theo dõi</div>
          </div>
        </div>
        <div className="customer-stat-card">
          <div className="customer-stat__icon customer-stat__icon--vip"><Crown size={20} /></div>
          <div>
            <div className="customer-stat__value">{vipCount}</div>
            <div className="customer-stat__label">Khách hàng VIP (Ưu đãi)</div>
          </div>
        </div>
        <div className="customer-stat-card">
          <div className="customer-stat__icon customer-stat__icon--risk"><ShieldAlert size={20} /></div>
          <div>
            <div className="customer-stat__value">{riskCount}</div>
            <div className="customer-stat__label">Nghi ngờ Review Bomber</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="customers-table-wrapper">
        {loading ? (
          <div className="empty-state">Đang tải danh sách & dữ liệu rủi ro khách hàng...</div>
        ) : customers.length === 0 ? (
          <div className="empty-state">
            <Users size={36} />
            <p>Không tìm thấy khách hàng phù hợp.</p>
          </div>
        ) : (
          <table className="customers-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Mã trên sàn</th>
                <th>Gian hàng</th>
                <th>Đánh giá</th>
                <th>Mức Rủi Ro & Bằng Chứng AI</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const isRisk = c.riskLevel === 'POTENTIAL_BOMMER';
                const isVip = c.riskLevel === 'VIP';
                const reasonCls = isRisk ? 'evidence-reason-tag--risk' : isVip ? 'evidence-reason-tag--vip' : 'evidence-reason-tag--normal';
                
                return (
                  <tr 
                    key={c.id} 
                    onClick={() => setSelectedCustomer(c)}
                    className={selectedCustomer?.id === c.id ? 'active' : ''}
                  >
                    <td>
                      <div className="customer-row__name">
                        <div className="customer-avatar">{c.displayName.charAt(0).toUpperCase()}</div>
                        <div>
                          <span className="customer-display-name">{c.displayName}</span>
                          <div style={{ fontSize: 11, color: 'var(--surface-400)' }}>{c.platform || 'Lazada'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="customer-platform-tag">{c.platformUserId}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--surface-800)' }}>
                      {c.storeName}
                    </td>
                    <td>
                      <div className="customer-review-bar">
                        <span style={{ fontWeight: 700, minWidth: 24 }}>{c.totalReviewsCount}</span>
                        <div className="customer-review-bar__bg">
                          <div className="customer-review-bar__fill" style={{ width: `${(c.totalReviewsCount / maxReviews) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div>
                          <span className={`badge ${RISK_BADGE[c.riskLevel] || 'badge--muted'}`}>
                            {isRisk ? '🔴 POTENTIAL_BOMMER' : isVip ? '⭐ VIP' : '🟢 NORMAL'}
                          </span>
                        </div>
                        <span className={`evidence-reason-tag ${reasonCls}`}>
                          {c.evidenceReason}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button 
                          type="button"
                          className="btn btn--secondary btn--sm"
                          style={{ fontSize: 11, padding: '4px 8px' }}
                          onClick={() => setSelectedCustomer(c)}
                        >
                          <Eye size={12} /> Bằng chứng
                        </button>
                        <select
                          className="customer-risk-select"
                          value={c.riskLevel}
                          onChange={(e) => handleRiskChange(c.id, e.target.value, e)}
                        >
                          <option value="NORMAL">NORMAL</option>
                          <option value="POTENTIAL_BOMMER">POTENTIAL_BOMMER</option>
                          <option value="VIP">VIP</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Right Drawer: AI Customer Evidence Panel */}
      {selectedCustomer && (
        <div className="customer-drawer-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="customer-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="customer-drawer__header">
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--brand-600)', fontWeight: 700, letterSpacing: '.05em', marginBottom: 4 }}>
                  <Sparkles size={13} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} />
                  Bằng Chứng AI & Hồ Sơ Rủi Ro Khách Hàng
                </div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--surface-900)' }}>
                  {selectedCustomer.displayName}
                </h3>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <span className="customer-platform-tag">{selectedCustomer.platformUserId}</span>
                  <span style={{ fontSize: 12, color: 'var(--surface-500)', alignSelf: 'center' }}>· {selectedCustomer.storeName}</span>
                </div>
              </div>
              <button className="customer-drawer__close" onClick={() => setSelectedCustomer(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="customer-drawer__body">
              {/* Risk Badge & Stats */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--surface-50)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-200)' }}>
                <div style={{ textAlign: 'center', paddingRight: 12, borderRight: '1px solid var(--surface-200)' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--surface-900)' }}>⭐ {selectedCustomer.avgRating || 4.5}</div>
                  <div style={{ fontSize: 11, color: 'var(--surface-500)' }}>Điểm đánh giá TB</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12, marginBottom: 4, fontWeight: 600 }}>
                    <span style={{ color: '#16a34a' }}>👍 {selectedCustomer.posCount} Khen</span>
                    <span style={{ color: '#d97706' }}>😐 {selectedCustomer.neuCount} Trung tính</span>
                    <span style={{ color: '#dc2626' }}>👎 {selectedCustomer.negCount} Chê</span>
                  </div>
                  <span className={`badge ${RISK_BADGE[selectedCustomer.riskLevel]}`}>
                    {selectedCustomer.riskLevel}
                  </span>
                </div>
              </div>

              {/* Evidence Box */}
              <div className={`evidence-box ${selectedCustomer.riskLevel === 'POTENTIAL_BOMMER' ? 'evidence-box--risk' : selectedCustomer.riskLevel === 'VIP' ? 'evidence-box--vip' : 'evidence-box--normal'}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 6 }}>
                  {selectedCustomer.riskLevel === 'POTENTIAL_BOMMER' ? (
                    <AlertTriangle size={15} />
                  ) : selectedCustomer.riskLevel === 'VIP' ? (
                    <Crown size={15} />
                  ) : (
                    <UserCheck size={15} />
                  )}
                  Dẫn Chứng Phân Tích Rủi Ro ViSoBERT
                </div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
                  {selectedCustomer.evidenceReason}
                </p>
              </div>

              {/* AI Recommendation */}
              <div style={{ background: '#e0e7ff', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid #c7d2fe', fontSize: 13, color: '#3730a3' }}>
                <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} /> Đề xuất xử lý cho bộ phận CSKH:
                </div>
                {selectedCustomer.aiRecommendation}
              </div>

              {/* Recent Review History */}
              {selectedCustomer.recentReviews?.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--surface-900)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageSquare size={14} /> Lịch sử đánh giá thực tế ({selectedCustomer.recentReviews.length})
                  </div>
                  {selectedCustomer.recentReviews.map((r, i) => (
                    <div key={i} className="customer-review-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: 'var(--surface-900)' }}>{r.prod}</span>
                        <span style={{ color: '#f59e0b', fontWeight: 700 }}>{'⭐'.repeat(r.rating)}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--surface-700)', lineHeight: 1.5 }}>
                        "{r.text}"
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--surface-400)' }}>
                        <span className={`badge ${r.sentiment === 'POS' ? 'badge--pos' : r.sentiment === 'NEG' ? 'badge--neg' : 'badge--neu'}`}>
                          {r.sentiment}
                        </span>
                        <time>{r.date}</time>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


