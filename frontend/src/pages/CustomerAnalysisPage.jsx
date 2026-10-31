import { useEffect, useState } from 'react';
import { ArrowLeft, BarChart3, Star, ShieldAlert, UserRound } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import customerService from '../services/customerService';

const sentimentLabels = {
  PosCount: { label: 'Tích cực', color: '#16a34a', background: '#dcfce7' },
  NeuCount: { label: 'Trung tính', color: '#a16207', background: '#fef9c3' },
  NegCount: { label: 'Tiêu cực', color: '#dc2626', background: '#fee2e2' },
};

function formatRisk(riskLevel) {
  if (riskLevel === 'POTENTIAL_BOMMER') return 'Nghi ngờ bom review';
  if (riskLevel === 'VIP') return 'Khách hàng VIP';
  return 'Bình thường';
}

export default function CustomerAnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadCustomer() {
      const customerFromNavigation = location.state?.customer;
      if (customerFromNavigation) {
        setCustomer({
          ...customerFromNavigation,
          averageRating: customerFromNavigation.averageRating ?? customerFromNavigation.avgRating ?? 0,
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const detail = await customerService.getCustomerById(id);
        if (active) setCustomer(detail);
      } catch (err) {
        if (active) setError(err.message || 'Không thể tải phân tích khách hàng.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCustomer();
    return () => { active = false; };
  }, [id, location.state]);

  if (loading) {
    return <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>Đang tải phân tích khách hàng...</div>;
  }

  if (error || !customer) {
    return (
      <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
        <button type="button" onClick={() => navigate('/customers')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: 0, background: 'none', color: '#0369a1', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={16} /> Quay lại khách hàng
        </button>
        <div style={{ marginTop: '24px', padding: '24px', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', background: '#fff1f2' }}>
          {error || 'Không tìm thấy khách hàng.'}
        </div>
      </div>
    );
  }

  const sentimentTotal = customer.posCount + customer.neuCount + customer.negCount;
  const sentiments = [
    ['PosCount', customer.posCount],
    ['NeuCount', customer.neuCount],
    ['NegCount', customer.negCount],
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <button type="button" onClick={() => navigate('/customers')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: 0, background: 'none', color: '#0369a1', cursor: 'pointer', padding: 0, marginBottom: '18px', fontSize: '13px' }}>
        <ArrowLeft size={16} /> Quay lại danh sách khách hàng
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', display: 'grid', placeItems: 'center' }}><UserRound size={22} /></div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#1e293b' }}>Phân tích khách hàng</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>{customer.displayName || 'Khách hàng ẩn danh'} · {customer.platformUserId}</p>
          </div>
        </div>
        <span style={{ padding: '6px 10px', borderRadius: '14px', background: customer.riskLevel === 'POTENTIAL_BOMMER' ? '#fee2e2' : customer.riskLevel === 'VIP' ? '#dcfce7' : '#f1f5f9', color: customer.riskLevel === 'POTENTIAL_BOMMER' ? '#b91c1c' : customer.riskLevel === 'VIP' ? '#15803d' : '#475569', fontSize: '12px', fontWeight: 600 }}>
          <ShieldAlert size={13} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />{formatRisk(customer.riskLevel)}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', marginBottom: '16px' }}>
        {[
          ['Tổng đánh giá', customer.totalReviewsCount, 'lượt'],
          ['Điểm trung bình', customer.averageRating.toFixed(1), '/ 5'],
          ['Đánh giá tích cực', customer.posCount, 'lượt'],
          ['Đánh giá tiêu cực', customer.negCount, 'lượt'],
        ].map(([label, value, suffix]) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
            <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>{label}</div>
            <strong style={{ fontSize: '24px', color: '#0f172a' }}>{value}</strong> <span style={{ color: '#94a3b8', fontSize: '12px' }}>{suffix}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 1fr)', gap: '16px' }}>
        <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', margin: '0 0 20px', color: '#1e293b' }}><BarChart3 size={17} /> Phân bổ cảm xúc</h2>
          {sentiments.map(([key, count]) => {
            const config = sentimentLabels[key];
            const percentage = sentimentTotal ? Math.round((count / sentimentTotal) * 100) : 0;
            return (
              <div key={key} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}><span style={{ color: config.color, fontWeight: 600 }}>{config.label}</span><span style={{ color: '#64748b' }}>{count} lượt · {percentage}%</span></div>
                <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}><div style={{ width: `${percentage}%`, height: '100%', background: config.color, borderRadius: '5px' }} /></div>
              </div>
            );
          })}
          {!sentimentTotal && <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Chưa có kết quả phân tích cảm xúc.</p>}
        </section>

        <section style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', margin: '0 0 16px', color: '#1e293b' }}><Star size={17} color="#eab308" /> Hồ sơ khách hàng</h2>
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0 }}>Khách hàng thuộc gian hàng <strong>{customer.storeName || 'chưa xác định'}</strong>. Điểm trung bình được tính từ các đánh giá đã lưu; phân bổ cảm xúc lấy từ kết quả AI ABSA.</p>
        </section>
      </div>
    </div>
  );
}