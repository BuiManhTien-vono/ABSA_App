// frontend/src/components/Auth/AuthModal.jsx - Modern Enterprise Auth Modal
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, loading } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('STORE_MANAGER');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        await register(email, password, fullName, role);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-overlay animate-fade-in">
      <div className="auth-card">
        <button className="auth-close" onClick={onClose}>✕</button>
        <div className="auth-header">
          <div className="auth-logo-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h2>{isLoginView ? 'Đăng Nhập Hệ Thống' : 'Tạo Tài Khoản Mới'}</h2>
          <p>{isLoginView ? 'Hệ thống Quản lý & Phân tích ABSA Enterprise' : 'Đăng ký tài khoản Quản trị / Shop / CSKH'}</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLoginView && (
            <div className="form-group">
              <label>Họ và Tên</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên..."
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Đăng Nhập</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@higen-absa.com"
            />
          </div>

          <div className="form-group">
            <label>Mật Khẩu</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {!isLoginView && (
            <div className="form-group">
              <label>Vai Trò Hệ Thống (Role)</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="STORE_MANAGER">Chủ Gian Hàng (Store Manager)</option>
                <option value="CSKH_STAFF">Nhân Viên CSKH (CSKH Staff)</option>
                <option value="ADMIN">Quản Trị Viên (System Admin)</option>
              </select>
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : (isLoginView ? 'Đăng Nhập' : 'Tạo Tài Khoản')}
          </button>
        </form>

        <div className="auth-footer">
          {isLoginView ? (
            <p>Chưa có tài khoản? <button type="button" onClick={() => { setIsLoginView(false); setError(null); }}>Đăng ký ngay</button></p>
          ) : (
            <p>Đã có tài khoản? <button type="button" onClick={() => { setIsLoginView(true); setError(null); }}>Đăng nhập</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
