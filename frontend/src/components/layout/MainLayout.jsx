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
  let title;
  if (location.pathname.startsWith('/products/') || location.pathname.match(/^\/connect\/shopee\/[^/]+\/products\/[^/]+/)) {
    title = 'Chi tiết sản phẩm';
  } else if (location.pathname.match(/^\/connect\/shopee\/[^/]+\/categories\/[^/]+\/products/)) {
    title = 'Sản phẩm';
  } else if (location.pathname.match(/^\/connect\/shopee\/[^/]+\/categories/)) {
    title = 'Danh mục cửa hàng';
  } else if (location.pathname.match(/^\/connect\/shopee\/[^/]+\/products/)) {
    title = 'Sản phẩm';
  } else if (location.pathname === '/connect/shopee') {
    title = 'Cửa hàng Shopee';
  } else {
    title = PAGE_TITLES[location.pathname] || 'FeedbackAI';
  }

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
