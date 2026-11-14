import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  BarChart2,
  FileText,
  Headphones,
  LayoutDashboard,
  Link2,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/auth';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/overview', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/products', label: 'Sản phẩm', icon: Package },
  { to: '/reviews', label: 'Phản hồi (Feed)', icon: MessageSquare },
  { to: '/customers', label: 'Khách hàng', icon: Users },
  { to: '/tickets', label: 'Ticket CSKH', icon: Headphones },
  { to: '/templates', label: 'Mẫu & Quy tắc', icon: FileText },
  { to: '/connect', label: 'Kết nối sàn', icon: Link2, connected: true },
  { to: '/settings', label: 'Cài đặt', icon: Settings },
];

const ROLE_LABELS = {
  ADMIN: 'Quản trị viên',
  STORE_MANAGER: 'Quản lý cửa hàng',
  CSKH_STAFF: 'Nhân viên CSKH',
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
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    navigate('/login', { replace: true });
  };

  const displayName = user?.fullName
    || user?.full_name
    || user?.name
    || user?.email?.split('@')[0]
    || 'Tài khoản';
  const role = ROLE_LABELS[user?.role] || user?.role || 'Người dùng';
  const initials = getInitials(displayName) || 'U';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside className="sidebar-container">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Sparkles size={15} />
        </div>
        <div className="sidebar-brand-copy">
          <span className="sidebar-brand-title">HIGEN-ABSA</span>
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

        {isAdmin && (
          <>
            <span className="sidebar-menu-label" style={{ marginTop: '12px' }}>Quản trị</span>
            <NavLink
              to="/users"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              title="Quản lý User"
            >
              <Shield size={16} strokeWidth={1.7} />
              <span className="sidebar-nav-label">Quản lý User</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <>
            <div className="sidebar-user-avatar" aria-hidden="true">{initials}</div>
            <div className="sidebar-user-copy">
              <strong>{displayName}</strong>
              <span>{role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="sidebar-logout-button"
              type="button"
              aria-label="Đăng xuất"
              title="Đăng xuất"
            >
              <LogOut size={15} strokeWidth={1.7} />
            </button>
          </>
        ) : (
          <Link
            to="/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '8px 12px',
              background: '#4f46e5',
              color: '#ffffff',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </aside>
  );
}
