import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header({ status, elapsed, onOpenAuth }) {
  const { user, logout } = useAuth();

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
            <p className="brand-subtitle">Enterprise E-commerce Sentiment Analysis (.NET 10 + SQL Server)</p>
          </div>
        </div>

        <div className="header-right">
          <div className="header-status">
            {status && <span className="status-text">{status}</span>}
            {elapsed != null && (
              <span className="status-elapsed">{elapsed}ms</span>
            )}
          </div>

          <div className="header-user-section">
            {user ? (
              <div className="user-profile-pill">
                <div className="user-avatar">
                  {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.full_name || user.email}</span>
                  <span className="user-role-badge">{user.role}</span>
                </div>
                <button className="btn-logout" onClick={logout} title="Đăng xuất">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              </div>
            ) : (
              <button className="btn-login-trigger" onClick={onOpenAuth}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Đăng Nhập
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
