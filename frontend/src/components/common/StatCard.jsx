import './StatCard.css';

export default function StatCard({ icon: Icon, title, value }) {
  return (
    <div className="stat-card">
      {Icon && (
        <div className="stat-icon">
          <Icon size={24} />
        </div>
      )}
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-title">{title}</span>
      </div>
    </div>
  );
}
