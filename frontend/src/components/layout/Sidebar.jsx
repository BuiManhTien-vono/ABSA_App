import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  Link2,
  BarChart2,
  Settings,
  Bell,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

export default function Sidebar() {
  const { logout } = useAuth();

  const navItems = [
    { to: '/overview', label: 'Tổng quan', icon: LayoutDashboard },
    { to: '/products', label: 'Sản phẩm', icon: Package },
    { to: '/reviews', label: 'Review Feed', icon: MessageSquare },
    { to: '/connect', label: 'Kết nối sàn', icon: Link2 },
    { to: '/reports', label: 'Báo cáo', icon: BarChart2 },
    { to: '/notifications', label: 'Thông báo', icon: Bell },
    { to: '/settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <aside className="sidebar-container">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Sparkles size={20} />
        </div>
        <span className="brand-title">FeedbackAI</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
