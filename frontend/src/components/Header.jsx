import './Header.css';

export default function Header({ status, elapsed }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="brand-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#grad)" />
              <path d="M8 14h12M14 8v12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="28" y2="28">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="brand-title">HIGEN-ABSA</h1>
            <p className="brand-subtitle">Vietnamese E-commerce Sentiment Analysis</p>
          </div>
        </div>
        <div className="header-status">
          {status && <span className="status-text">{status}</span>}
          {elapsed != null && (
            <span className="status-elapsed">{elapsed}ms</span>
          )}
        </div>
      </div>
    </header>
  );
}
