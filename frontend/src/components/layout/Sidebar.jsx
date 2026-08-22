import { NavLink } from 'react-router-dom';
import {
  BarChart2,
  LayoutDashboard,
  Link2,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/auth';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/overview', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/products', label: 'Sản phẩm', icon: Package },
  { to: '/reviews', label: 'Phản hồi', icon: MessageSquare },
  { to: '/connect', label: 'Kết nối sàn', icon: Link2, connected: true },
  { to: '/reports', label: 'Báo cáo', icon: BarChart2 },
  { to: '/settings', label: 'Cài đặt', icon: Settings },
];

const ROLE_LABELS = {
  ADMIN: 'Quản trị viên',
  STORE_MANAGER: 'Quản lý cửa hàng',
  USER: 'Thành viên',
};

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const displayName = user?.fullName
    || user?.full_name
    || user?.name
    || user?.email?.split('@')[0]
    || 'Nguyễn Thanh';
  const role = ROLE_LABELS[user?.role] || user?.role || 'Quản lý cửa hàng';
  const initials = getInitials(displayName) || 'NT';

  return (
    <aside className="sidebar-container">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Sparkles size={15} />
        </div>
        <div className="sidebar-brand-copy">
          <span className="sidebar-brand-title">FeedbackAI</span>
          <span className="sidebar-brand-subtitle">TMĐT Analytics</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Điều hướng chính">
        <span className="sidebar-menu-label">Menu</span>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              title={item.label}
            >
              <Icon size={16} strokeWidth={1.7} />
              <span className="sidebar-nav-label">{item.label}</span>
              {item.connected && <span className="sidebar-status-dot" aria-label="Đã kết nối" />}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-avatar" aria-hidden="true">{initials}</div>
        <div className="sidebar-user-copy">
          <strong>{displayName}</strong>
          <span>{role}</span>
        </div>
        <button
          onClick={logout}
          className="sidebar-logout-button"
          type="button"
          aria-label="Đăng xuất"
          title="Đăng xuất"
        >
          <LogOut size={15} strokeWidth={1.7} />
        </button>
      </div>
    </aside>
  );
}
