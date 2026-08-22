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
} from 'lucide-react';
import dashboardService from '../services/dashboardService';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [kpiRes, trendRes, platformRes, spikesRes, recentRes] = await Promise.allSettled([
          dashboardService.getKpi(),
          dashboardService.getSentimentTrend({ groupBy: 'day' }),
          dashboardService.getPlatformDistribution(),
          dashboardService.getNegativeSpikes(7),
          dashboardService.getRecentReviews(10),
        ]);

        if (!isMounted) return;

        if (kpiRes.status === 'fulfilled') setKpi(kpiRes.value);
        if (trendRes.status === 'fulfilled') {
          const formatted = (trendRes.value || []).map((t) => ({
            date: t.date ? t.date.slice(5) : '',
            positive: t.posCount || 0,
            neutral: t.neuCount || 0,
            negative: t.negCount || 0,
          }));
          setTrendData(formatted);
        }

        if (platformRes.status === 'fulfilled') {
          const formatted = (platformRes.value || []).map((p) => ({
            name: p.platformName || p.platformCode,
            value: p.percentage || 0,
            color: PLATFORM_COLORS[p.platformCode] || '#8884d8',
          }));
          setPlatformData(formatted);
        }

        if (spikesRes.status === 'fulfilled') setSpikes(spikesRes.value || []);
        if (recentRes.status === 'fulfilled') setRecentReviews(recentRes.value || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    {
      title: 'Phản hồi hôm nay',
      value: kpi?.todayReviews?.toLocaleString('vi-VN') ?? '0',
      note: kpi ? `${kpi.todayChangePercent >= 0 ? '+' : ''}${kpi.todayChangePercent}% so với hôm qua` : '...',
      icon: MessageSquare,
      tone: 'violet',
      positive: (kpi?.todayChangePercent ?? 0) >= 0,
    },
    {
      title: 'Tỷ lệ tích cực',
      value: kpi ? `${kpi.posPercent}%` : '0%',
      note: kpi ? `${kpi.posChangePercent >= 0 ? '+' : ''}${kpi.posChangePercent}% so với kỳ trước` : '...',
      icon: CircleCheck,
      tone: 'green',
      positive: (kpi?.posChangePercent ?? 0) >= 0,
    },
    {
      title: 'Sản phẩm theo dõi',
      value: kpi?.totalProducts?.toString() ?? '0',
      note: `${kpi?.totalProducts ?? 0} sản phẩm đã đồng bộ`,
      icon: Package,
      tone: 'amber',
      positive: true,
    },
    {
      title: 'Shop đã kết nối',
      value: kpi?.connectedStores?.toString() ?? '0',
      note: `${kpi?.openTickets ?? 0} ticket CSKH đang mở`,
      icon: Link2,
      tone: 'purple',
      positive: (kpi?.openTickets ?? 0) === 0,
    },
  ];

  return (
    <div className="overview-page">
      <div className="overview-heading">
        <div className="overview-updated-row">
          <p>Dữ liệu hệ thống realtime · {new Date().toLocaleTimeString('vi-VN')} {new Date().toLocaleDateString('vi-VN')}</p>
          <span>{loading ? 'Đang tải...' : 'Trực tiếp'}</span>
        </div>
      </div>

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

      <section className="overview-chart-grid" aria-label="Biểu đồ phản hồi">
        <article className="overview-panel overview-trend-panel">
          <div className="overview-panel-header">
            <div>
              <h2>Xu hướng phản hồi</h2>
              <p>Phân tích theo cảm xúc (Realtime)</p>
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
              <h2>Phân bổ theo sàn</h2>
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

      <section className="overview-feed-grid" aria-label="Hoạt động phản hồi">
        <article className="overview-panel overview-feed-panel">
          <div className="overview-feed-title">
            <AlertCircle size={14} strokeWidth={1.8} />
            <h2>Phản hồi tiêu cực tăng đột biến</h2>
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
              <small>LIVE</small>
              <h2>Phản hồi mới nhất</h2>
            </div>
            <button className="overview-pause-button" type="button" onClick={() => setIsPaused((value) => !value)}>
              {isPaused ? <Play size={11} fill="currentColor" /> : <Pause size={11} fill="currentColor" />}
              {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
            </button>
          </div>

          <div className={`overview-review-list ${isPaused ? 'is-paused' : ''}`}>
            {recentReviews.length > 0 ? recentReviews.map((review) => (
              <div className="overview-review-row" key={review.id}>
                <span className="overview-review-avatar">
                  {(review.customerName || 'KH').charAt(0).toUpperCase()}
                </span>
                <div className="overview-review-content">
                  <div className="overview-review-meta">
                    <strong>{review.customerName || 'Khách hàng'}</strong>
                    <span className={`overview-sentiment ${
                      review.overallSentiment === 'NEU' ? 'overview-sentiment--neutral' :
                      review.overallSentiment === 'NEG' ? 'overview-sentiment--negative' : ''
                    }`}>
                      {review.overallSentiment === 'POS' ? 'Tích cực' :
                       review.overallSentiment === 'NEU' ? 'Trung tính' :
                       review.overallSentiment === 'NEG' ? 'Tiêu cực' : review.overallSentiment || 'Chưa phân tích'}
                    </span>
                    <span className="overview-platform-pill">{review.storeName || 'Shopee'}</span>
                    <time>{new Date(review.reviewCreatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</time>
                  </div>
                  <p>{review.commentText}</p>
                </div>
              </div>
            )) : (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                Chưa có đánh giá nào gần đây
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
