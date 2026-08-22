// src/services/apiClient.js
// Wrapper fetch với auto-inject Bearer Token và xử lý lỗi 401

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5058';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getToken() {
    return localStorage.getItem('absa_token');
  }

  async request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    // A 401 from a protected request means the saved session expired. Login
    // itself can legitimately return 401 for wrong credentials and must stay
    // on the form so its error can be displayed instead of forcing a reload.
    if (response.status === 401 && token && path !== '/api/v1/auth/login') {
      localStorage.removeItem('absa_token');
      localStorage.removeItem('absa_refresh_token');
      localStorage.removeItem('absa_user');
      window.location.href = '/login';
      throw new Error('Phiên đăng nhập hết hạn.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.message || `Lỗi ${response.status}`);
    }

    return response.json();
  }

  get(path) {
    return this.request(path, { method: 'GET' });
  }

  post(path, body) {
    return this.request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(path, body) {
    return this.request(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete(path) {
    return this.request(path, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient();
export default apiClient;
