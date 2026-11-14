import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  Search,
  CheckCheck,
  AlertTriangle,
  Headphones,
  MessageSquare,
  RefreshCw,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import notificationService from '../../services/notificationService';
import './TopBar.css';

const PLATFORMS = [
  { name: 'Shopee', tone: 'shopee' },
  { name: 'Lazada', tone: 'lazada' },
  { name: 'TikTok Shop', tone: 'tiktok' },
];

function getNotifIcon(type) {
  switch (type) {
    case 'warning':
      return <AlertTriangle size={15} className="topbar-notif-icon topbar-notif-icon--warning" />;
    case 'ticket':
      return <Headphones size={15} className="topbar-notif-icon topbar-notif-icon--ticket" />;
    case 'review':
      return <MessageSquare size={15} className="topbar-notif-icon topbar-notif-icon--review" />;
    case 'sync':
      return <RefreshCw size={15} className="topbar-notif-icon topbar-notif-icon--sync" />;
    default:
      return <Sparkles size={15} className="topbar-notif-icon topbar-notif-icon--system" />;
  }
}

export default function TopBar({ title }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState('7');
  const [activePlatforms, setActivePlatforms] = useState(() => PLATFORMS.map((item) => item.name));

  // Notifications state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => notificationService.getNotifications());
  const notifRef = useRef(null);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((updated) => {
      setNotifications(updated);
    });
    return () => unsubscribe();
  }, []);

  // Click outside to close notification dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notifOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    navigate(trimmedQuery ? `/products?search=${encodeURIComponent(trimmedQuery)}` : '/products');
  };

  const togglePlatform = (platform) => {
    setActivePlatforms((current) => (
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform]
    ));
  };

  const handleNotificationClick = (notif) => {
    notificationService.markAsRead(notif.id);
    setNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    notificationService.markAllAsRead();
  };

  const handleViewAll = () => {
    setNotifOpen(false);
    navigate('/notifications');
  };

  return (
    <header className="topbar-container">
      <div className="topbar-tools">
        <form className="topbar-search" onSubmit={handleSearch} role="search">
          <Search size={16} strokeWidth={1.8} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm sản phẩm, đánh giá..."
            aria-label="Tìm sản phẩm hoặc đánh giá"
          />
        </form>

        <div className="topbar-actions">
          <div className="topbar-platforms" role="group" aria-label="Lọc theo sàn">
            {PLATFORMS.map((platform) => {
              const isActive = activePlatforms.includes(platform.name);
              return (
                <button
                  key={platform.name}
                  className={`topbar-platform topbar-platform--${platform.tone}`}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => togglePlatform(platform.name)}
                >
                  <span />
                  {platform.name}
                </button>
              );
            })}
          </div>

          <label className="topbar-period">
            <CalendarDays size={16} strokeWidth={1.7} aria-hidden="true" />
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              aria-label="Khoảng thời gian"
            >
              <option value="7">7 ngày</option>
              <option value="30">30 ngày</option>
              <option value="90">90 ngày</option>
            </select>
          </label>

          {/* Interactive Notification Bell with Dropdown */}
          <div className="topbar-notif-wrapper" ref={notifRef}>
            <button
              type="button"
              className={`topbar-notification ${notifOpen ? 'topbar-notification--active' : ''}`}
              onClick={() => setNotifOpen(!notifOpen)}
              aria-label="Thông báo"
              title="Thông báo"
              aria-expanded={notifOpen}
            >
              <Bell size={19} strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="topbar-notification-badge">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="topbar-notif-dropdown">
                <div className="topbar-notif-header">
                  <div className="topbar-notif-header-title">
                    <span>Thông báo</span>
                    {unreadCount > 0 && (
                      <span className="topbar-notif-header-count">{unreadCount} mới</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="topbar-notif-header-btn"
                      onClick={handleMarkAllRead}
                      title="Đánh dấu đã đọc tất cả"
                    >
                      <CheckCheck size={14} />
                      Đọc hết
                    </button>
                  )}
                </div>

                <div className="topbar-notif-list">
                  {notifications.length === 0 ? (
                    <div className="topbar-notif-empty">Không có thông báo mới</div>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.id}
                        className={`topbar-notif-item ${!notif.read ? 'topbar-notif-item--unread' : ''}`}
                        onClick={() => handleNotificationClick(notif)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="topbar-notif-item-icon">
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="topbar-notif-item-content">
                          <div className="topbar-notif-item-title-row">
                            <span className="topbar-notif-item-title">{notif.title}</span>
                            {!notif.read && <span className="topbar-notif-dot" />}
                          </div>
                          <p className="topbar-notif-item-msg">{notif.message}</p>
                          <span className="topbar-notif-item-time">{notif.timeText || 'Gần đây'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="topbar-notif-footer">
                  <button
                    type="button"
                    className="topbar-notif-view-all"
                    onClick={handleViewAll}
                  >
                    Xem tất cả thông báo
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="topbar-title-row">
        <h1 className="topbar-title">{title || 'Dashboard'}</h1>
      </div>
    </header>
  );
}
