import './SentimentBadge.css';

const SENTIMENT_CONFIG = {
  POS: { label: 'Positive', icon: '↑' },
  NEG: { label: 'Negative', icon: '↓' },
  NEU: { label: 'Neutral', icon: '→' },
  MIXED: { label: 'Mixed', icon: '↕' },
};

export default function SentimentBadge({ sentiment, size = 'md' }) {
  const config = SENTIMENT_CONFIG[sentiment] || { label: sentiment, icon: '•' };
  return (
    <span className={`sentiment-badge sentiment-${sentiment} size-${size}`}>
      <span className="badge-icon">{config.icon}</span>
      <span className="badge-label">{sentiment}</span>
    </span>
  );
}
