import apiClient from './apiClient';

export const reviewService = {
  getReviews: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/v1/reviews${query ? `?${query}` : ''}`);
  },
  getReviewById: (id) => apiClient.get(`/api/v1/reviews/${id}`),
  updateStatus: (id, status) => apiClient.put(`/api/v1/reviews/${id}/status`, { status }),
};

export default reviewService;
