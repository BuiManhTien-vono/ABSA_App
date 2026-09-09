// src/pages/OverviewPage.jsx - HIGEN-ABSA 2.0 Aspect Intelligence Studio
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertCircle,
  CalendarDays,
  CircleCheck,
  Link2,
  MessageSquare,
  Package,
  Pause,
  Play,
  FileSpreadsheet,
  Sparkles,
  Search,
  Filter,
  Trash2,
  Database,
} from 'lucide-react';
import dashboardService from '../services/dashboardService';
import storeService from '../services/storeService';
import ExcelUploadModal from '../components/ExcelUploadModal';
import AspectMatrix from '../components/AspectMatrix';
import AiInsightCard from '../components/AiInsightCard';
import { getAspectLabel } from '../utils/aspectMapper';
import './OverviewPage.css';

const PLATFORM_COLORS = {
  SHOPEE: '#ed4d2d',
  LAZADA: '#123c68',
  TIKI: '#1a94ff',
  TIKTOK_SHOP: '#20232d',
};

const LINE_LABELS = {
  positive: 'Tích cực',
  neutral: 'Trung tính',
  negative: 'Tiêu cực',
};

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="overview-chart-tooltip">
      <strong>{label}</strong>
      {payload.map((entry) => (
        <span key={entry.dataKey} style={{ color: entry.color }}>
          {LINE_LABELS[entry.dataKey]}: {entry.value}
        </span>
      ))}
    </div>
  );
}

export default function OverviewPage() {
  const [isPaused, setIsPaused] = useState(false);
  const [kpi, setKpi] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [platformData, setPlatformData] = useState([]);
  const [spikes, setSpikes] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [excelAspects, setExcelAspects] = useState([]);
  const [selectedAspect, setSelectedAspect] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('ALL');
  const [storesList, setStoresList] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  const fetchStores = async () => {
    try {
      const res = await storeService.getStores({ pageSize: 50 });
      setStoresList(res?.items || res || []);
    } catch (e) {
      console.error('Failed to fetch stores:', e);
    }
  };

  const loadDashboardData = async (storeId = selectedStoreId) => {
    try {
      setLoading(true);
      const [kpiRes, trendRes, platformRes, spikesRes, recentRes, aspectRes] = await Promise.allSettled([
        dashboardService.getKpi(),
        dashboardService.getSentimentTrend({ groupBy: 'day' }),
        dashboardService.getPlatformDistribution(),
        dashboardService.getNegativeSpikes(7),
        dashboardService.getRecentReviews(25),
        dashboardService.getAspectSummary(storeId || null),
      ]);

      if (kpiRes.status === 'fulfilled') setKpi(kpiRes.value);
      if (trendRes.status === 'fulfilled') {
        const formatted = (trendRes.value || []).map((t) => ({
          date: t.date ? t.date.slice(5) : '',
          positive: t.pos_count ?? t.posCount ?? 0,
          neutral: t.neu_count ?? t.neuCount ?? 0,
          negative: t.neg_count ?? t.negCount ?? 0,
        }));
        setTrendData(formatted);
      }

      if (platformRes.status === 'fulfilled') {
        const formatted = (platformRes.value || []).map((p) => ({
          name: p.platform_name ?? p.platformName ?? p.platform_code ?? p.platformCode ?? 'Sàn TMĐT',
          value: p.percentage ?? 0,
          color: PLATFORM_COLORS[p.platform_code ?? p.platformCode] || '#8884d8',
        }));
        setPlatformData(formatted);
      }

      if (spikesRes.status === 'fulfilled') {
        const formattedSpikes = (spikesRes.value || []).map((s) => ({
          productId: s.product_id ?? s.productId,
          productName: s.product_name ?? s.productName ?? 'Sản phẩm',
          storeName: s.store_name ?? s.storeName ?? 'Store',
          negCount: s.neg_count ?? s.negCount ?? 0,
          negPercent: s.neg_percent ?? s.negPercent ?? 0,
        }));
        setSpikes(formattedSpikes);
      }

      if (recentRes.status === 'fulfilled') {
        const formattedRecent = (recentRes.value || []).map((r) => ({
          id: r.id,
          commentText: r.comment_text ?? r.commentText ?? '',
          rating: r.rating ?? 5,
          overallSentiment: r.overall_sentiment ?? r.overallSentiment ?? 'POS',
          customerName: r.customer_name ?? r.customerName ?? 'Khách hàng',
          productName: r.product_name ?? r.productName ?? 'Sản phẩm',
          storeName: r.store_name ?? r.storeName ?? 'Sàn TMĐT',
          reviewCreatedAt: r.review_created_at ?? r.reviewCreatedAt,
        }));
        setRecentReviews(formattedRecent);
      }

      if (aspectRes.status === 'fulfilled') {
        setExcelAspects(aspectRes.value || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
    loadDashboardData();
  }, []);

  const handleDeleteStore = async (storeId) => {
    if (!storeId) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa tập dữ liệu / file Excel này cùng toàn bộ đánh giá liên quan?')) return;
    try {
      await storeService.deleteStore(storeId);
      setSelectedStoreId('');
      fetchStores();
      loadDashboardData('');
    } catch (err) {
      alert('Không thể xóa tập dữ liệu: ' + err.message);
    }
  };

  const todayReviews = kpi?.today_reviews ?? kpi?.todayReviews ?? 0;
  const todayChange = kpi?.today_change_percent ?? kpi?.todayChangePercent ?? 0;
  const posPercent = kpi?.pos_percent ?? kpi?.posPercent ?? 0;
  const posChange = kpi?.pos_change_percent ?? kpi?.posChangePercent ?? 0;
  const totalProducts = kpi?.total_products ?? kpi?.totalProducts ?? 0;
  const connectedStores = kpi?.connected_stores ?? kpi?.connectedStores ?? 0;
  const openTickets = kpi?.open_tickets ?? kpi?.openTickets ?? 0;

  const stats = [
    {
      title: 'Phản hồi hôm nay',
      value: todayReviews.toLocaleString('vi-VN'),
      note: kpi ? `${todayChange >= 0 ? '+' : ''}${todayChange}% so với hôm qua` : '...',
      icon: MessageSquare,
      tone: 'violet',
      positive: todayChange >= 0,
    },
    {
      title: 'Tỷ lệ tích cực',
      value: kpi ? `${posPercent}%` : '0%',
      note: kpi ? `${posChange >= 0 ? '+' : ''}${posChange}% so với kỳ trước` : '...',
      icon: CircleCheck,
      tone: 'green',
      positive: posChange >= 0,
    },
    {
      title: 'Sản phẩm theo dõi',
      value: totalProducts.toString(),
      note: `${totalProducts} sản phẩm đã đồng bộ`,
      icon: Package,
      tone: 'amber',
      positive: true,
    },
    {
      title: 'Shop đã kết nối',
      value: connectedStores.toString(),
      note: `${openTickets} ticket CSKH đang mở`,
      icon: Link2,
      tone: 'purple',
      positive: openTickets === 0,
    },
  ];

  // Filter reviews based on search keyword and sentiment filter
  const filteredReviews = recentReviews.filter((r) => {
    const matchesKeyword = !searchKeyword || r.commentText.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesSentiment = sentimentFilter === 'ALL' || r.overallSentiment === sentimentFilter;
    return matchesKeyword && matchesSentiment;
  });

  return (
    <div className="overview-page">
      {/* Studio Hero Banner */}
      <div className="overview-studio-hero">
        <div className="overview-hero-content">
          <h1>
            <Sparkles size={24} className="text-indigo-400" />
            HIGEN-ABSA 2.0 Studio
          </h1>
          <p>
            Hệ thống phân tích Cảm xúc theo Khía cạnh (Aspect-Based Sentiment Analysis) thế hệ mới dùng mô hình AI ViSoBERT.
          </p>
        </div>

        <div className="overview-hero-actions">
          <div className="overview-hero-badge">
            <span className="overview-live-dot" />
            Realtime AI Connected
          </div>

          <button
            className="overview-hero-excel-btn"
            type="button"
            onClick={() => setIsExcelModalOpen(true)}
          >
            <FileSpreadsheet size={16} />
            Phân tích File Excel Đánh giá
          </button>
        </div>
      </div>

      {/* Excel Dataset Management Toolbar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '12px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Database size={16} className="text-indigo-600" />
          <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>Lịch sử Tập dữ liệu / Gian hàng:</strong>
          <select
            value={selectedStoreId}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedStoreId(val);
              loadDashboardData(val);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              fontWeight: 500,
              color: '#0f172a',
              background: '#f8fafc',
              minWidth: '280px'
            }}
          >
            <option value="">Tất cả tập dữ liệu (Tổng hợp SQL Database)</option>
            {storesList.map((st) => (
              <option key={st.id} value={st.id}>
                {st.storeName || st.store_name} ({st.reviewCount ?? st.review_count ?? 0} đánh giá)
              </option>
            ))}
          </select>
        </div>

        {selectedStoreId && (
          <button
            type="button"
            onClick={() => handleDeleteStore(selectedStoreId)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#dc2626',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <Trash2 size={13} />
            Xóa Tập Dữ Liệu Này
          </button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <section className="overview-kpi-grid" aria-label="Chỉ số tổng quan">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article className="overview-stat-card" key={stat.title}>
              <span className={`overview-stat-icon overview-stat-icon--${stat.tone}`}>
                <Icon size={15} strokeWidth={1.8} />
              </span>
              <span className="overview-stat-title">{stat.title}</span>
              <strong className="overview-stat-value">{stat.value}</strong>
              <span className={`overview-stat-note overview-stat-note--${stat.positive ? 'positive' : 'muted'}`}>
                {stat.note}
              </span>
            </article>
          );
        })}
      </section>

      {/* Hero Feature 1: ABSA Category & Micro-Aspect Matrix Component */}
      <AspectMatrix
        topAspects={excelAspects}
        selectedAspect={selectedAspect}
        onSelectAspect={(asp) => setSelectedAspect(asp)}
      />

      {/* Hero Feature 2: AI Friction Diagnosis & Recommendation Card */}
      <AiInsightCard spikes={spikes} />

      {/* Charts Grid */}
      <section className="overview-chart-grid" aria-label="Biểu đồ phản hồi">
        <article className="overview-panel overview-trend-panel">
          <div className="overview-panel-header">
            <div>
              <h2>Xu hướng Cảm xúc khách hàng</h2>
              <p>Phân tích theo ngày (Realtime AI)</p>
            </div>
            <span className="overview-period-label">
              <CalendarDays size={12} />
              Theo ngày
            </span>
          </div>

          <div className="overview-trend-chart">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 14, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#eef1f5" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9aa3af', fontSize: 9 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9aa3af', fontSize: 9 }} />
                  <Tooltip content={<TrendTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="plainline"
                    iconSize={14}
                    formatter={(value) => LINE_LABELS[value]}
                    wrapperStyle={{ color: '#7c8795', fontSize: 9, paddingTop: 8 }}
                  />
                  <Line type="monotone" dataKey="positive" stroke="#2ca987" strokeWidth={2} dot={false} activeDot={{ r: 3 }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="neutral" stroke="#d3a72b" strokeWidth={1.6} dot={false} activeDot={{ r: 3 }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="negative" stroke="#d85b62" strokeWidth={1.6} dot={false} activeDot={{ r: 3 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: 13 }}>
                {loading ? 'Đang tải biểu đồ...' : 'Chưa có dữ liệu đánh giá'}
              </div>
            )}
          </div>
        </article>

        <article className="overview-panel overview-platform-panel">
          <div className="overview-panel-header">
            <div>
              <h2>Phân bổ theo Gian hàng & Sàn</h2>
              <p>Tỷ lệ phản hồi</p>
            </div>
          </div>

          <div className="overview-platform-chart">
            {platformData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="52%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                    stroke="#ffffff"
                    strokeWidth={2}
                    isAnimationActive={false}
                  >
                    {platformData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: 13 }}>
                {loading ? 'Đang tải...' : 'Chưa có dữ liệu gian hàng'}
              </div>
            )}
          </div>

          <div className="overview-platform-legend">
            {platformData.map((platform) => (
              <div className="overview-platform-row" key={platform.name}>
                <span className="overview-platform-dot" style={{ background: platform.color }} />
                <span>{platform.name}</span>
                <strong>{platform.value}%</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Live Stream & Search Section */}
      <section className="overview-feed-grid" aria-label="Hoạt động phản hồi">
        <article className="overview-panel overview-feed-panel">
          <div className="overview-feed-title">
            <AlertCircle size={14} strokeWidth={1.8} />
            <h2>Sản phẩm có phản hồi xấu tăng đột biến</h2>
          </div>
          <div className="overview-spike-list">
            {spikes.length > 0 ? spikes.map((item, index) => (
              <div className="overview-spike-row" key={item.productId || index}>
                <span className="overview-spike-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="overview-spike-info">
                  <strong>{item.productName}</strong>
                  <span>{item.storeName || 'Store'} · {item.negCount} đánh giá NEG</span>
                </div>
                <strong className="overview-spike-change" style={{ color: '#ef4444' }}>{item.negPercent}% NEG</strong>
              </div>
            )) : (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                Không có sản phẩm nào có cảnh báo đột biến tiêu cực
              </div>
            )}
          </div>
        </article>

        <article className="overview-panel overview-feed-panel">
          <div className="overview-live-header">
            <div className="overview-feed-title overview-feed-title--live">
              <span className="overview-live-dot" />
              <small>LIVE AI STREAM</small>
              <h2>Phản hồi mới nhất</h2>
            </div>
            <button className="overview-pause-button" type="button" onClick={() => setIsPaused((value) => !value)}>
              {isPaused ? <Play size={11} fill="currentColor" /> : <Pause size={11} fill="currentColor" />}
              {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', marginBottom: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={13} style={{ position: 'absolute', left: '8px', top: '8px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Tìm từ khóa trong bình luận..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '26px',
                  paddingRight: '8px',
                  paddingTop: '6px',
                  paddingBottom: '6px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.78rem',
                }}
              />
            </div>
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              style={{
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.78rem',
                background: '#ffffff',
              }}
            >
              <option value="ALL">Tất cả cảm xúc</option>
              <option value="POS">Tích cực (POS)</option>
              <option value="NEU">Trung tính (NEU)</option>
              <option value="NEG">Tiêu cực (NEG)</option>
            </select>
          </div>

          <div className={`overview-review-list ${isPaused ? 'is-paused' : ''}`}>
            {filteredReviews.length > 0 ? filteredReviews.map((review, idx) => {
              const sentimentStr = (review?.overallSentiment || 'POS').toUpperCase();
              const rawDate = review?.reviewCreatedAt;
              let formattedTime = 'Vừa xong';
              if (rawDate) {
                try {
                  const d = new Date(rawDate);
                  if (!isNaN(d.getTime())) {
                    formattedTime = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  }
                } catch {
                  formattedTime = 'Vừa xong';
                }
              }
              return (
                <div className="overview-review-row" key={review?.id || idx}>
                  <span className="overview-review-avatar">
                    {(review?.customerName || 'KH').charAt(0).toUpperCase()}
                  </span>
                  <div className="overview-review-content">
                    <div className="overview-review-meta">
                      <strong>{review?.customerName || 'Khách hàng'}</strong>
                      <span className={`overview-sentiment ${
                        sentimentStr === 'NEU' ? 'overview-sentiment--neutral' :
                        sentimentStr === 'NEG' ? 'overview-sentiment--negative' : ''
                      }`}>
                        {sentimentStr === 'POS' ? 'Tích cực' :
                         sentimentStr === 'NEU' ? 'Trung tính' :
                         sentimentStr === 'NEG' ? 'Tiêu cực' : 'Chưa phân tích'}
                      </span>
                      <span className="overview-platform-pill">{review?.storeName || 'Sàn TMĐT'}</span>
                      <time>{formattedTime}</time>
                    </div>
                    <p>{review?.commentText || ''}</p>
                  </div>
                </div>
              );
            }) : (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                Không tìm thấy bình luận nào phù hợp
              </div>
            )}
          </div>
        </article>
      </section>

      {/* Upload Modal */}
      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccess={(result) => {
          if (result) {
            setExcelAspects(result.top_aspects || result.topAspects || []);
          }
          loadDashboardData();
        }}
      />
    </div>
  );
}
