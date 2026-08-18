import { useEffect, useState } from 'react';
import { alertService } from '../services/alertService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import './NotificationsPage.css';

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const res = await alertService.getAlerts();
      setAlerts(res.data?.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await alertService.markAsRead(id);
      loadAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="notifications-container">
      <h2>Thông báo & Cảnh báo System</h2>

      {alerts.length === 0 ? (
        <EmptyState message="Không có thông báo nào" />
      ) : (
        <div className="alerts-list">
          {alerts.map((a) => (
            <div key={a.id} className={`alert-card ${a.severity.toLowerCase()} ${a.isRead ? 'read' : ''}`}>
              <div className="alert-body">
                <span className="severity-badge">{a.severity}</span>
                <p className="alert-message">{a.message}</p>
                <span className="product-name">Sản phẩm: {a.productName}</span>
              </div>
              {!a.isRead && (
                <button onClick={() => handleMarkRead(a.id)} className="read-btn">
                  Đã đọc
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
