import SentimentBadge from './SentimentBadge';
import './AspectTable.css';

export default function AspectTable({ aspects }) {
  if (!aspects || aspects.length === 0) {
    return (
      <div className="aspect-table-card animate-fade-in animate-delay-2">
        <div className="card-header">
          <h2>Aspect Analysis</h2>
        </div>
        <div className="empty-state">Chưa có kết quả phân tích aspect.</div>
      </div>
    );
  }

  return (
    <div className="aspect-table-card animate-fade-in animate-delay-2">
      <div className="card-header">
        <h2>Aspect Analysis</h2>
        <span className="aspect-count">{aspects.length} aspects</span>
      </div>
      <div className="table-wrapper">
        <table className="aspect-table">
          <thead>
            <tr>
              <th>Macro</th>
              <th>Micro Aspect</th>
              <th>Sentiment</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            {aspects.map((a, i) => (
              <tr key={i} className="table-row">
                <td>
                  <span className="macro-badge">{a.macro}</span>
                </td>
                <td className="micro-name">{a.micro?.replace(/_/g, ' ')}</td>
                <td>
                  <SentimentBadge sentiment={a.sentiment} size="sm" />
                </td>
                <td className="evidence-cell">
                  {a.evidence ? (
                    <span className="evidence-text">&ldquo;{a.evidence}&rdquo;</span>
                  ) : (
                    <span className="no-evidence">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
