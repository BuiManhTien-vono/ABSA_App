import apiClient from './apiClient';

export const customerService = {
  getCustomers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/v1/customers${query ? `?${query}` : ''}`);
  },
  getCustomerById: (id) => apiClient.get(`/api/v1/customers/${id}`),
  updateRiskLevel: (id, riskLevel) => apiClient.put(`/api/v1/customers/${id}/risk-level`, { riskLevel }),
};

export default customerService;
