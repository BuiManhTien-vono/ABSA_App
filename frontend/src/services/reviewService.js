import apiClient, { buildQuery } from './apiClient';

export const reviewService = {
  getReviews: (params = {}) => apiClient.get(`/api/v1/reviews${buildQuery(params)}`),
  getReviewById: (id) => apiClient.get(`/api/v1/reviews/${id}`),
  updateStatus: (id, status) => apiClient.put(`/api/v1/reviews/${id}/status`, { status }),
};

export default reviewService;
