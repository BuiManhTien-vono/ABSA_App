import apiClient from './apiClient';

export const productService = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/v1/products${query ? `?${query}` : ''}`);
  },
  getProductById: (id) => apiClient.get(`/api/v1/products/${id}`),
  getProductReviews: (id, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/v1/products/${id}/reviews${query ? `?${query}` : ''}`);
  },
  getSentimentSummary: (id) => apiClient.get(`/api/v1/products/${id}/sentiment-summary`),
};

export default productService;
