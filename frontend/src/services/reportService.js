import apiClient from './apiClient';

export const reportService = {
  getReports: () => apiClient.get('/reports'),
  getById: (id) => apiClient.get(`/reports/${id}`),
  generate: (title, type, parameters = {}) =>
    apiClient.post('/reports/generate', { title, type, parameters }),
};
