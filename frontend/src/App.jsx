import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OverviewPage from './pages/OverviewPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CustomersPage from './pages/CustomersPage';
import ReviewFeedPage from './pages/ReviewFeedPage';
import ConnectPage from './pages/ConnectPage';
import TemplatesPage from './pages/TemplatesPage';
import TicketsPage from './pages/TicketsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/auth';

function RequireAuth() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
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
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/reviews" element={<ReviewFeedPage />} />
              <Route path="/connect" element={<ConnectPage />} />
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
