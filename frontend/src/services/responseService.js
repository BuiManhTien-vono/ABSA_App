import apiClient, { buildQuery } from './apiClient';

export const responseService = {
  // Templates
  getTemplates: (params = {}) => apiClient.get(`/api/v1/templates${buildQuery(params)}`),
  createTemplate: (data) => apiClient.post('/api/v1/templates', data),
  updateTemplate: (id, data) => apiClient.put(`/api/v1/templates/${id}`, data),
  deleteTemplate: (id) => apiClient.delete(`/api/v1/templates/${id}`),

  // Automation Rules
  getRules: (params = {}) => apiClient.get(`/api/v1/automation-rules${buildQuery(params)}`),
  createRule: (data) => apiClient.post('/api/v1/automation-rules', data),
  updateRule: (id, data) => apiClient.put(`/api/v1/automation-rules/${id}`, data),
  toggleRule: (id) => apiClient.put(`/api/v1/automation-rules/${id}/toggle`),

  // Manual Response & History
  sendResponse: (reviewId, responseText) => apiClient.post(`/api/v1/reviews/${reviewId}/respond`, { responseText }),
  getResponseHistory: (reviewId) => apiClient.get(`/api/v1/reviews/${reviewId}/responses`),
};

export default responseService;
