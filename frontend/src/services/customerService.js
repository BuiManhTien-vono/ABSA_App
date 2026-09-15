import apiClient, { buildQuery } from './apiClient';

export const customerService = {
  getCustomers: (params = {}) => apiClient.get(`/api/v1/customers${buildQuery(params)}`),
  getCustomerById: (id) => apiClient.get(`/api/v1/customers/${id}`),
  updateRiskLevel: (id, riskLevel) => apiClient.put(`/api/v1/customers/${id}/risk-level`, { riskLevel }),
};

export default customerService;
