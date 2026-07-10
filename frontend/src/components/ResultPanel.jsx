import SentimentBadge from './SentimentBadge';
import './ResultPanel.css';

export default function ResultPanel({ result }) {
  if (!result) return null;

  const overall = result.overall_sentiment || {};
  const aspects = result.aspect_sentiments || [];

  return (
    <div className="result-panel animate-fade-in animate-delay-1">
      <div className="metrics-row">
        <div className="metric-card">
          <span className="metric-label">Overall</span>
          <SentimentBadge sentiment={overall.label || '-'} size="lg" />
        </div>
        <div className="metric-card">
          <span className="metric-label">Aspects</span>
          <span className="metric-value">{aspects.length}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Spam</span>
          <span className={`metric-value ${result.spam ? 'warn' : ''}`}>
            {result.spam ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Intent QA</span>
          <span className={`metric-value ${result.intent_qa ? 'info' : ''}`}>
            {result.intent_qa ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    </div>
  );
}
