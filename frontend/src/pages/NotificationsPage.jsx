import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  Headphones,
  MessageSquare,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Trash2,
  ExternalLink,
  CheckCheck,
  Search,
  Filter,
  Inbox
} from 'lucide-react';
import notificationService from '../services/notificationService';
import './NotificationsPage.css';

const CATEGORIES = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'UNREAD', label: 'Chưa đọc' },
  { key: 'ai_alert', label: 'Cảnh báo AI' },
  { key: 'review', label: 'Đánh giá & Review' },
  { key: 'ticket', label: 'Ticket CSKH' },
  { key: 'system', label: 'Hệ thống' },
];

function getNotificationIcon(type) {
  switch (type) {
    case 'warning':
      return <AlertTriangle size={18} className="notif-icon notif-icon--warning" />;
    case 'ticket':
      return <Headphones size={18} className="notif-icon notif-icon--ticket" />;
    case 'review':
      return <MessageSquare size={18} className="notif-icon notif-icon--review" />;
    case 'sync':
      return <RefreshCw size={18} className="notif-icon notif-icon--sync" />;
    default:
      return <Sparkles size={18} className="notif-icon notif-icon--system" />;
  }
}

function getCategoryBadge(category) {
  switch (category) {
    case 'ai_alert':
      return <span className="notif-tag notif-tag--alert">Cảnh báo rủi ro</span>;
    case 'ticket':
      return <span className="notif-tag notif-tag--ticket">CSKH SLA</span>;
    case 'review':
      return <span className="notif-tag notif-tag--review">Đánh giá sàn</span>;
    case 'system':
      return <span className="notif-tag notif-tag--system">Hệ thống</span>;
    default:
      return null;
  }
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(() => notificationService.getNotifications());
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((updated) => {
      setNotifications(updated);
    });
    return () => unsubscribe();
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Category filter
      if (activeCategory === 'UNREAD') {
        if (n.read) return false;
      } else if (activeCategory !== 'ALL' && n.category !== activeCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = n.title?.toLowerCase().includes(q);
        const inMsg = n.message?.toLowerCase().includes(q);
        return inTitle || inMsg;
      }

      return true;
    });
  }, [notifications, activeCategory, searchQuery]);

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
  };

  const handleMarkRead = (id) => {
    notificationService.markAsRead(id);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    notificationService.deleteNotification(id);
  };

  const handleActionClick = (notification) => {
    notificationService.markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="notif-page-container">
      {/* Page Header */}
      <div className="notif-page-header">
        <div className="notif-header-info">
          <div className="notif-title-row">
            <h1 className="notif-page-title">Thông báo & Cảnh báo</h1>
            {unreadCount > 0 && (
              <span className="notif-unread-badge">
                {unreadCount} chưa đọc
              </span>
            )}
          </div>
          <p className="notif-page-desc">
            Theo dõi các cảnh báo rủi ro khách hàng, đánh giá tiêu cực và thông báo hệ thống tự động
          </p>
        </div>

        <div className="notif-header-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              className="notif-btn notif-btn--secondary"
              onClick={handleMarkAllRead}
            >
              <CheckCheck size={16} />
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="notif-toolbar">
        <div className="notif-categories-tabs" role="tablist">
          {CATEGORIES.map((cat) => {
            let badge = null;
            if (cat.key === 'ALL') badge = notifications.length;
            if (cat.key === 'UNREAD') badge = unreadCount;

            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                role="tab"
                aria-selected={isActive}
                type="button"
                className={`notif-tab-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                {cat.label}
                {badge !== null && badge > 0 && (
                  <span className={`notif-tab-count ${cat.key === 'UNREAD' ? 'unread' : ''}`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="notif-search-box">
          <Search size={15} className="notif-search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm thông báo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="notif-clear-search"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="notif-list-wrapper">
        {filteredNotifications.length === 0 ? (
          <div className="notif-empty-state">
            <Inbox size={48} strokeWidth={1.2} className="notif-empty-icon" />
            <h3 className="notif-empty-title">Không có thông báo nào</h3>
            <p className="notif-empty-subtitle">
              {searchQuery
                ? 'Không tìm thấy thông báo phù hợp với từ khóa của bạn.'
                : 'Bạn đã đọc hết mọi thông báo quan trọng!'}
            </p>
          </div>
        ) : (
          <div className="notif-cards-list">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`notif-card ${!notif.read ? 'notif-card--unread' : ''}`}
                onClick={() => handleActionClick(notif)}
              >
                <div className="notif-card-icon-col">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="notif-card-main">
                  <div className="notif-card-top">
                    <div className="notif-card-title-group">
                      <span className="notif-card-title">{notif.title}</span>
                      {getCategoryBadge(notif.category)}
                      {!notif.read && <span className="notif-dot-unread" title="Chưa đọc" />}
                    </div>
                    <span className="notif-card-time">{notif.timeText || 'Gần đây'}</span>
                  </div>

                  <p className="notif-card-message">{notif.message}</p>

                  <div className="notif-card-footer">
                    {notif.link && (
                      <span className="notif-link-action">
                        Xem chi tiết
                        <ExternalLink size={13} />
                      </span>
                    )}

                    <div className="notif-card-buttons">
                      {!notif.read && (
                        <button
                          type="button"
                          className="notif-action-icon-btn"
                          title="Đánh dấu đã đọc"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkRead(notif.id);
                          }}
                        >
                          <CheckCircle2 size={15} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="notif-action-icon-btn notif-action-icon-btn--delete"
                        title="Xóa thông báo"
                        onClick={(e) => handleDelete(notif.id, e)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
