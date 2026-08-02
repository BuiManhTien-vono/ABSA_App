import apiClient from './apiClient';

export const overviewService = {
  getStats: () => apiClient.get('/overview/stats'),
  getTrend: () => apiClient.get('/overview/trend'),
  getPlatformShare: () => apiClient.get('/overview/platform-share'),
};
