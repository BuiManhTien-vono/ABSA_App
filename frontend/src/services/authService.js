import apiClient from './apiClient';

export const authService = {
  async register(email, password, fullName) {
    const res = await apiClient.post('/auth/register', { email, password, fullName });
    if (res.data?.token) localStorage.setItem('token', res.data.token);
    return res.data;
  },

  async login(email, password) {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data?.token) localStorage.setItem('token', res.data.token);
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};
