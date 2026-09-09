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
    const isFormData = options.body instanceof FormData;
    const headers = { ...options.headers };

    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let body = options.body;
    if (body && !isFormData && typeof body !== 'string') {
      body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
      body,
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
      let msg = error.detail || error.message;
      if (!msg && error.errors && typeof error.errors === 'object') {
        msg = Object.values(error.errors).flat().join('; ');
      }
      throw new Error(msg || `Lỗi ${response.status}`);
    }

    if (options.responseType === 'blob') {
      return response.blob();
    }

    return response.json();
  }

  get(path, options = {}) {
    return this.request(path, { method: 'GET', ...options });
  }

  post(path, body, options = {}) {
    return this.request(path, {
      method: 'POST',
      body,
      ...options,
    });
  }

  put(path, body, options = {}) {
    return this.request(path, {
      method: 'PUT',
      body,
      ...options,
    });
  }

  delete(path, options = {}) {
    return this.request(path, { method: 'DELETE', ...options });
  }
}

const apiClient = new ApiClient();
export default apiClient;
