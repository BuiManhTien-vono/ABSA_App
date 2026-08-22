import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './MainLayout.css';

const PAGE_TITLES = {
  '/overview': 'Tổng quan',
  '/products': 'Sản phẩm',
  '/reviews': 'Phản hồi',
  '/connect': 'Kết nối sàn',
  '/reports': 'Báo cáo',
  '/notifications': 'Thông báo',
  '/settings': 'Cài đặt',
};

export default function MainLayout() {
  const location = useLocation();
  const title = location.pathname.startsWith('/products/')
    ? 'Chi tiết sản phẩm'
    : PAGE_TITLES[location.pathname] || 'FeedbackAI';

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
