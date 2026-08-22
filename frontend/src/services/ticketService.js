import apiClient from './apiClient';

export const ticketService = {
  getTickets: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/v1/tickets${query ? `?${query}` : ''}`);
  },
  getTicketById: (id) => apiClient.get(`/api/v1/tickets/${id}`),
  assignTicket: (id, userId) => apiClient.put(`/api/v1/tickets/${id}/assign`, { userId }),
  updateStatus: (id, status) => apiClient.put(`/api/v1/tickets/${id}/status`, { status }),
  resolveTicket: (id, resolutionNotes) => apiClient.put(`/api/v1/tickets/${id}/resolve`, { resolutionNotes }),
  getStats: () => apiClient.get('/api/v1/tickets/stats'),
};

export default ticketService;
