import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './MainLayout.css';

const PAGE_TITLES = {
  '/overview': 'Tổng quan Dashboard',
  '/products': 'Quản lý Sản phẩm',
  '/reviews': 'Review Feed Real-time',
  '/connect': 'Kết nối Sàn E-commerce',
  '/reports': 'Báo cáo Insight',
  '/notifications': 'Thông báo & Cảnh báo',
  '/settings': 'Cài đặt Tài khoản',
};

export default function MainLayout() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'FeedbackAI';

  return (
    <div className="main-wrapper">
      <Sidebar />
      <div className="content-wrapper">
        <TopBar title={title} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
