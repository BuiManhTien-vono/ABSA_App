import './InsightCards.css';

const INSIGHT_FIELDS = [
  { key: 'customer_insight', title: 'Customer Insight', icon: '💡', color: 'blue' },
  { key: 'root_cause', title: 'Root Cause', icon: '🔍', color: 'red' },
  { key: 'business_recommendation', title: 'Recommendation', icon: '📋', color: 'green' },
  { key: 'suggested_seller_response', title: 'Seller Response', icon: '💬', color: 'purple' },
];

export default function InsightCards({ insight }) {
  if (!insight) return null;

  return (
    <div className="insight-section animate-fade-in animate-delay-3">
      <h2 className="section-title">Generated Insights</h2>
      <div className="insight-grid">
        {INSIGHT_FIELDS.map(({ key, title, icon, color }) => (
          <div key={key} className={`insight-card insight-${color}`}>
            <div className="insight-header">
              <span className="insight-icon">{icon}</span>
              <h3>{title}</h3>
            </div>
            <p className="insight-text">{insight[key] || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
