import apiClient from './apiClient';

export const storeService = {
  getPlatforms: () => apiClient.get('/api/v1/platforms'),
  getStores: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/v1/stores${query ? `?${query}` : ''}`);
  },
  getStoreById: (id) => apiClient.get(`/api/v1/stores/${id}`),
  createStore: (data) => apiClient.post('/api/v1/stores', data),
  updateStore: (id, data) => apiClient.put(`/api/v1/stores/${id}`, data),
  deleteStore: (id) => apiClient.delete(`/api/v1/stores/${id}`),
  syncStore: (id) => apiClient.post(`/api/v1/stores/${id}/sync`),
};

export default storeService;
