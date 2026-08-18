import apiClient from './apiClient';

export const shopService = {
  getShops: () => apiClient.get('/shops'),
  getShop: (id) => apiClient.get(`/shops/${id}`),
  disconnectShop: (id) => apiClient.delete(`/shops/${id}`),
  getConnectUrl: (platform) => apiClient.get(`/shops/connect/${platform}`),
};
