import apiClient from './apiClient';

export const dashboardService = {
  getKpi: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/v1/dashboard/kpi${query ? `?${query}` : ''}`);
  },
  getSentimentTrend: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/v1/dashboard/sentiment-trend${query ? `?${query}` : ''}`);
  },
  getPlatformDistribution: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/v1/dashboard/platform-distribution${query ? `?${query}` : ''}`);
  },
  getNegativeSpikes: (days = 7) => apiClient.get(`/api/v1/dashboard/negative-spikes?days=${days}`),
  getRecentReviews: (count = 10) => apiClient.get(`/api/v1/dashboard/recent-reviews?count=${count}`),
};

export default dashboardService;
