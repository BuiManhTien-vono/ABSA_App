import { useAuth } from '../../hooks/useAuth';
import './TopBar.css';

export default function TopBar({ title }) {
  const { user } = useAuth();
  const initial = user?.fullName ? user.fullName[0].toUpperCase() : 'U';

  return (
    <header className="topbar-container">
      <h1 className="topbar-title">{title || 'Dashboard'}</h1>
      <div className="topbar-right">
        <div className="user-info">
          <div className="user-avatar">{initial}</div>
          <span className="user-name">{user?.fullName || user?.email}</span>
        </div>
      </div>
    </header>
  );
}
