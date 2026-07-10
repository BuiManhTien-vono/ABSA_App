import { useState } from 'react';
import './JsonViewer.css';

export default function JsonViewer({ data }) {
  const [expanded, setExpanded] = useState(false);

  if (!data) return null;

  return (
    <div className="json-viewer animate-fade-in animate-delay-4">
      <button
        className="json-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 200ms' }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        Raw JSON
      </button>
      {expanded && (
        <pre className="json-content">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
