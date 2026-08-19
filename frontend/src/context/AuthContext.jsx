// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';
import apiClient from '../services/apiClient';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('absa_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  // Lưu thông tin auth vào state + localStorage
  const saveAuth = (data) => {
    // Backend trả về snake_case: access_token, refresh_token, user
    localStorage.setItem('absa_token', data.access_token);
    localStorage.setItem('absa_refresh_token', data.refresh_token);
    localStorage.setItem('absa_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const clearAuth = () => {
    localStorage.removeItem('absa_token');
    localStorage.removeItem('absa_refresh_token');
    localStorage.removeItem('absa_user');
    setUser(null);
  };

  // POST /api/v1/auth/login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiClient.post('/api/v1/auth/login', { email, password });
      saveAuth(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  // POST /api/v1/auth/register
  const register = async ({ email, password, fullName, phoneNumber }) => {
    setLoading(true);
    try {
      const data = await apiClient.post('/api/v1/auth/register', {
        email,
        password,
        full_name: fullName,
        phone_number: phoneNumber || null,
        role: 'STORE_MANAGER',
      });
      saveAuth(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  // POST /api/v1/auth/logout
  const logout = async () => {
    const refreshToken = localStorage.getItem('absa_refresh_token');
    if (refreshToken) {
      apiClient.post('/api/v1/auth/logout', { refresh_token: refreshToken }).catch(() => {});
    }
    clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
