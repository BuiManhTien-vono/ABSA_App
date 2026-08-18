// frontend/src/context/AuthContext.jsx - React Auth Context & Provider
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('absa_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('absa_token') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('absa_refresh_token') || null);
  const [loading, setLoading] = useState(false);

  const saveAuth = (authData) => {
    setUser(authData.user);
    setToken(authData.access_token);
    setRefreshToken(authData.refresh_token);
    localStorage.setItem('absa_user', JSON.stringify(authData.user));
    localStorage.setItem('absa_token', authData.access_token);
    localStorage.setItem('absa_refresh_token', authData.refresh_token);
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('absa_user');
    localStorage.removeItem('absa_token');
    localStorage.removeItem('absa_refresh_token');
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Email hoặc mật khẩu không chính xác.');
      }
      const data = await response.json();
      saveAuth(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, fullName, role = 'STORE_MANAGER') => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName, role }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Đăng ký không thành công.');
      }
      const data = await response.json();
      saveAuth(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (refreshToken) {
      fetch(`${API_BASE}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }).catch(() => {});
    }
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
