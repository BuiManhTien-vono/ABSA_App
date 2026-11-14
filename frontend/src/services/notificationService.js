// src/services/notificationService.js

const STORAGE_KEY = 'absa_notifications_data';
const EVENT_KEY = 'absa_notifications_changed';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'warning',
    category: 'ai_alert',
    title: 'Cảnh báo Review Bomber',
    message: 'Khách hàng cust-3 (Đỗ Thị Mai) có 5 đánh giá 1 sao liên tiếp với rủi ro cao (88%).',
    timestamp: Date.now() - 10 * 60 * 1000,
    timeText: '10 phút trước',
    read: false,
    link: '/customers/cust-3/analysis',
  },
  {
    id: 'notif-2',
    type: 'ticket',
    category: 'ticket',
    title: 'Ticket CSKH khẩn cấp',
    message: 'Khách hàng khiếu nại "Giao sai mẫu áo thun Oversize". Ticket quá hạn SLA 30 phút.',
    timestamp: Date.now() - 35 * 60 * 1000,
    timeText: '35 phút trước',
    read: false,
    link: '/tickets',
  },
  {
    id: 'notif-3',
    type: 'review',
    category: 'review',
    title: 'Đánh giá 1 sao mới trên Shopee',
    message: 'Shop Shopee Mall nhận 1 đánh giá tiêu cực cho Áo polo nam: "Vải mỏng, đường may lỗi".',
    timestamp: Date.now() - 2 * 3600 * 1000,
    timeText: '2 giờ trước',
    read: false,
    link: '/reviews',
  },
  {
    id: 'notif-4',
    type: 'sync',
    category: 'system',
    title: 'Đồng bộ dữ liệu thành công',
    message: 'Đã tự động đồng bộ 48 sản phẩm và 152 đánh giá mới từ gian hàng Shopee Mall.',
    timestamp: Date.now() - 5 * 3600 * 1000,
    timeText: '5 giờ trước',
    read: true,
    link: '/connect/shopee',
  },
  {
    id: 'notif-5',
    type: 'system',
    category: 'system',
    title: 'Hệ thống AI ABSA sẵn sàng',
    message: 'Mô hình phân loại khía cạnh cảm xúc (Aspect-Based Sentiment) đã tối ưu hóa xong.',
    timestamp: Date.now() - 24 * 3600 * 1000,
    timeText: '1 ngày trước',
    read: true,
    link: '/overview',
  },
];

class NotificationService {
  constructor() {
    this.ensureInitialized();
  }

  ensureInitialized() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
  }

  getNotifications() {
    this.ensureInitialized();
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(data) ? data : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  }

  saveNotifications(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: list }));
    }
  }

  getUnreadCount() {
    const list = this.getNotifications();
    return list.filter((n) => !n.read).length;
  }

  markAsRead(id) {
    const list = this.getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
    this.saveNotifications(list);
    return list;
  }

  markAllAsRead() {
    const list = this.getNotifications().map((n) => ({ ...n, read: true }));
    this.saveNotifications(list);
    return list;
  }

  deleteNotification(id) {
    const list = this.getNotifications().filter((n) => n.id !== id);
    this.saveNotifications(list);
    return list;
  }

  clearAll() {
    this.saveNotifications([]);
    return [];
  }

  addNotification(notification) {
    const list = this.getNotifications();
    const newNotif = {
      id: notification.id || `notif-${Date.now()}`,
      timestamp: Date.now(),
      timeText: 'Vừa xong',
      read: false,
      ...notification,
    };
    list.unshift(newNotif);
    this.saveNotifications(list);
    return list;
  }

  subscribe(callback) {
    const handler = (e) => callback(e.detail || this.getNotifications());
    window.addEventListener(EVENT_KEY, handler);
    return () => window.removeEventListener(EVENT_KEY, handler);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
