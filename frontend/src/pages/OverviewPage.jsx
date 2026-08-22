import { useState } from 'react';
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
import './OverviewPage.css';

const STATS = [
  {
    title: 'Phản hồi hôm nay',
    value: '1,247',
    note: '+12% so với hôm qua',
    icon: MessageSquare,
    tone: 'violet',
    positive: true,
  },
  {
    title: 'Tỷ lệ tích cực',
    value: '68%',
    note: '+3% so với tuần trước',
    icon: CircleCheck,
    tone: 'green',
    positive: true,
  },
  {
    title: 'Sản phẩm theo dõi',
    value: '43',
    note: '+5 sản phẩm mới tuần này',
    icon: Package,
    tone: 'amber',
    positive: true,
  },
  {
    title: 'Shop đã kết nối',
    value: '3',
    note: 'Shopee · Lazada · TikTok',
    icon: Link2,
    tone: 'purple',
    positive: false,
  },
];

const TREND_DATA = [
  { date: '08/07', positive: 310, neutral: 92, negative: 58 },
  { date: '09/07', positive: 292, neutral: 101, negative: 64 },
  { date: '10/07', positive: 398, neutral: 78, negative: 46 },
  { date: '11/07', positive: 382, neutral: 110, negative: 52 },
  { date: '12/07', positive: 432, neutral: 96, negative: 43 },
  { date: '13/07', positive: 371, neutral: 86, negative: 73 },
  { date: '14/07', positive: 452, neutral: 118, negative: 55 },
];

const PLATFORM_DATA = [
  { name: 'Shopee', value: 45, color: '#ed4d2d' },
  { name: 'Lazada', value: 30, color: '#123c68' },
  { name: 'TikTok', value: 25, color: '#20232d' },
];

const SPIKES = [
  { product: 'Áo thun basic nam cổ tròn', platform: 'Shopee', color: '#ed4d2d', change: '+340%' },
  { product: 'Tai nghe Bluetooth chống ồn', platform: 'Lazada', color: '#123c68', change: '+185%' },
];

const REVIEWS = [
  {
    initials: 'N',
    name: 'Nguyễn Minh T.',
    sentiment: 'Tích cực',
    platform: 'Shopee',
    time: 'vừa xong',
    content: 'Vải rất mềm mại, form đẹp, đóng gói cẩn thận. Sẽ mua lại!',
  },
  {
    initials: 'H',
    name: 'Hoàng Anh',
    sentiment: 'Trung tính',
    platform: 'Lazada',
    time: '2 phút',
    content: 'Sản phẩm ổn, thời gian giao hàng có thể nhanh hơn.',
  },
  {
    initials: 'T',
    name: 'Trần Thu',
    sentiment: 'Tích cực',
    platform: 'TikTok Shop',
    time: '5 phút',
    content: 'Đúng mô tả, màu đẹp và nhân viên tư vấn nhiệt tình.',
  },
];

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

  return (
    <div className="overview-page">
      <div className="overview-heading">
        <div className="overview-updated-row">
          <p>Thứ Hai, 14 tháng 7 năm 2026 · Cập nhật lúc 10:32 SA</p>
          <span>Trực tiếp</span>
        </div>
      </div>

      <section className="overview-kpi-grid" aria-label="Chỉ số tổng quan">
        {STATS.map((stat) => {
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
              <p>7 ngày qua · phân tích theo cảm xúc</p>
            </div>
            <span className="overview-period-label">
              <CalendarDays size={12} />
              7 ngày
            </span>
          </div>

          <div className="overview-trend-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND_DATA} margin={{ top: 14, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#eef1f5" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9aa3af', fontSize: 9 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9aa3af', fontSize: 9 }} domain={[0, 600]} />
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
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PLATFORM_DATA}
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
                  {PLATFORM_DATA.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="overview-platform-legend">
            {PLATFORM_DATA.map((platform) => (
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
            {SPIKES.map((item, index) => (
              <div className="overview-spike-row" key={item.product}>
                <span className="overview-spike-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="overview-spike-info">
                  <strong>{item.product}</strong>
                  <span><i style={{ background: item.color }} />{item.platform} · 29 đánh giá</span>
                </div>
                <strong className="overview-spike-change">{item.change}</strong>
              </div>
            ))}
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
            {REVIEWS.map((review) => (
              <div className="overview-review-row" key={`${review.name}-${review.time}`}>
                <span className="overview-review-avatar">{review.initials}</span>
                <div className="overview-review-content">
                  <div className="overview-review-meta">
                    <strong>{review.name}</strong>
                    <span className={`overview-sentiment ${review.sentiment === 'Trung tính' ? 'overview-sentiment--neutral' : ''}`}>
                      {review.sentiment}
                    </span>
                    <span className="overview-platform-pill">{review.platform}</span>
                    <time>{review.time}</time>
                  </div>
                  <p>{review.content}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
