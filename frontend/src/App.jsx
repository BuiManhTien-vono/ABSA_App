import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OverviewPage from './pages/OverviewPage';
import ProductsPage from './pages/ProductsPage';
import PlatformProductsPage from './pages/PlatformProductsPage';
import PlatformProductDetailPage from './pages/PlatformProductDetailPage';
import CustomersPage from './pages/CustomersPage';
import ReviewFeedPage from './pages/ReviewFeedPage';
import ConnectPage from './pages/ConnectPage';
import ShopeeStoresPage from './pages/ShopeeStoresPage';
import ShopeeCategoriesPage from './pages/ShopeeCategoriesPage';
import ShopeeCategoryProductsPage from './pages/ShopeeCategoryProductsPage';
import ShopeeProductDetailPage from './pages/ShopeeProductDetailPage';
import TemplatesPage from './pages/TemplatesPage';
import TicketsPage from './pages/TicketsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider } from './context/AuthContext';

function RequireAuth() {
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<MainLayout />}>
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:platformCode" element={<PlatformProductsPage />} />
              <Route path="/products/:platformCode/:id" element={<PlatformProductDetailPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/reviews" element={<ReviewFeedPage />} />
              <Route path="/connect" element={<ConnectPage />} />
              <Route path="/connect/shopee" element={<ShopeeStoresPage />} />
              <Route path="/connect/shopee/:shopId/categories" element={<ShopeeCategoriesPage />} />
              <Route path="/connect/shopee/:shopId/categories/:categoryId/products" element={<ShopeeCategoryProductsPage />} />
              <Route path="/connect/shopee/:shopId/products/:productId" element={<ShopeeProductDetailPage />} />
              <Route path="/connect/shopee/:shopId/products" element={<ShopeeCategoryProductsPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
