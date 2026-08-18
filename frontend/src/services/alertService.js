import apiClient from './apiClient';

export const alertService = {
  getAlerts: (page = 0, size = 20) =>
    apiClient.get(`/alerts?page=${page}&size=${size}`),
  getByProduct: (productId) =>
    apiClient.get(`/products/${productId}/alerts`),
  markAsRead: (id) => apiClient.put(`/alerts/${id}/read`),
};
