import { useEffect, useState } from 'react';
import { overviewService } from '../services/overviewService';
import StatCard from '../components/common/StatCard';
import SentimentTrendChart from '../components/charts/SentimentTrendChart';
import PlatformPieChart from '../components/charts/PlatformPieChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Store, Package, MessageSquare, AlertTriangle } from 'lucide-react';
import './OverviewPage.css';

export default function OverviewPage() {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [share, setShare] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, trendRes, shareRes] = await Promise.all([
          overviewService.getStats(),
          overviewService.getTrend(),
          overviewService.getPlatformShare(),
        ]);
        setStats(statsRes.data);
        setTrend(trendRes.data);
        setShare(shareRes.data);
      } catch (err) {
        console.error('Failed to load overview data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="overview-container">
      <div className="kpi-grid">
        <StatCard icon={Store} title="Cửa hàng kết nối" value={stats?.shops || 0} />
        <StatCard icon={Package} title="Sản phẩm theo dõi" value={stats?.products || 0} />
        <StatCard icon={MessageSquare} title="Tổng đánh giá" value={stats?.totalReviews || 0} />
        <StatCard icon={AlertTriangle} title="Cảnh báo chưa đọc" value={stats?.unreadAlerts || 0} />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Xu hướng Cảm xúc</h3>
          <SentimentTrendChart data={trend} />
        </div>
        <div className="chart-card">
          <h3>Thị phần theo Sàn</h3>
          <PlatformPieChart data={share} />
        </div>
      </div>
    </div>
  );
}
