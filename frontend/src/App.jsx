import { useState, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OverviewPage from './pages/OverviewPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ReviewFeedPage from './pages/ReviewFeedPage';
import ConnectPage from './pages/ConnectPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import LoadingSpinner from './components/common/LoadingSpinner';

import { useAnalyze } from './hooks/useAnalyze';
import Header from './components/Header';
import ReviewInput from './components/ReviewInput';
import ResultPanel from './components/ResultPanel';
import AspectTable from './components/AspectTable';
import InsightCards from './components/InsightCards';
import JsonViewer from './components/JsonViewer';
import AuthModal from './components/Auth/AuthModal';
import './App.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

function AnalysisApp() {
  const { result, loading, error, elapsed, analyze } = useAnalyze();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const statusText = loading
    ? 'Đang phân tích...'
    : error
    ? `Lỗi: ${error}`
    : result
    ? 'Hoàn thành'
    : '';

  return (
    <div className="app">
      <Header
        status={statusText}
        elapsed={result ? elapsed : null}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
      <main className="main-layout">
        <aside className="sidebar">
          <ReviewInput onAnalyze={analyze} loading={loading} />
        </aside>
        <section className="content">
          {error && (
            <div className="error-banner animate-fade-in">
              <span className="error-icon">⚠</span>
              <span>{error}</span>
            </div>
          )}
          {!result && !error && (
            <div className="welcome-state animate-fade-in">
              <div className="welcome-icon">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <h2>Nhập review để bắt đầu phân tích</h2>
              <p>Hệ thống sẽ phân tích khía cạnh, cảm xúc, trích bằng chứng và sinh insight tự động.</p>
            </div>
          )}
          {result && (
            <div className="results-stack">
              <ResultPanel result={result} />
              <AspectTable aspects={result.aspect_sentiments} />
              <InsightCards insight={result.insight} />
              <JsonViewer data={result} />
            </div>
          )}
        </section>
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/analyze" element={<AnalysisApp />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/reviews" element={<ReviewFeedPage />} />
            <Route path="/connect" element={<ConnectPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<AnalysisApp />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
