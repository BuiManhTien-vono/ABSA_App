import { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import './ReportsPage.css';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const res = await reportService.getReports();
      setReports(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      await reportService.generate('Báo cáo Tổng hợp', 'MONTHLY');
      loadReports();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Báo cáo Insights</h2>
        <button onClick={handleGenerate} className="generate-btn">
          + Tạo báo cáo mới
        </button>
      </div>

      {reports.length === 0 ? (
        <EmptyState message="Chưa có báo cáo nào" />
      ) : (
        <div className="reports-list">
          {reports.map((r) => (
            <div key={r.id} className="report-card">
              <div className="report-info">
                <h3>{r.title}</h3>
                <span className="report-meta">Loại: {r.type} | Trạng thái: {r.status}</span>
              </div>
              {r.fileUrl && (
                <a href={r.fileUrl} target="_blank" rel="noreferrer" className="download-link">
                  Tải xuống
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
