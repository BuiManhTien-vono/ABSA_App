import apiClient from './apiClient';

export const reviewService = {
  getByProduct: (productId, page = 0, size = 20) =>
    apiClient.get(`/products/${productId}/reviews?page=${page}&size=${size}`),
  getLatest: (page = 0, size = 20) =>
    apiClient.get(`/reviews/latest?page=${page}&size=${size}`),
  getById: (id) => apiClient.get(`/reviews/${id}`),
};
