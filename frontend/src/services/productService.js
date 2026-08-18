import apiClient from './apiClient';

export const productService = {
  getByShop: (shopId) => apiClient.get(`/shops/${shopId}/products`),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (shopId, data) => apiClient.post(`/shops/${shopId}/products`, data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`),
  getTopAspects: (productId) => apiClient.get(`/products/${productId}/top-aspects`),
};
