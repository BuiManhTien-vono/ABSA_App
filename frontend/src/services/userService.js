import apiClient from './apiClient';

export const userService = {
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/v1/users${query ? `?${query}` : ''}`);
  },
  getUserById: (id) => apiClient.get(`/api/v1/users/${id}`),
  createUser: (data) => apiClient.post('/api/v1/users', data),
  updateUser: (id, data) => apiClient.put(`/api/v1/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/api/v1/users/${id}`),
  changePassword: (data) => apiClient.put('/api/v1/auth/change-password', data),
};

export default userService;
