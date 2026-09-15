import apiClient, { buildQuery } from './apiClient';

export const productService = {
  getProducts: (params = {}) => apiClient.get(`/api/v1/products${buildQuery(params)}`),
  getProductById: (id) => apiClient.get(`/api/v1/products/${id}`),
  getProductReviews: (id, params = {}) => apiClient.get(`/api/v1/products/${id}/reviews${buildQuery(params)}`),
  getSentimentSummary: (id) => apiClient.get(`/api/v1/products/${id}/sentiment-summary`),
};

export default productService;
