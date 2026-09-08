import { apiCall } from './api';
import { ENDPOINTS } from '../config';
import { queryString } from '../utils/formatter';

export const contentService = {
  getAll: (filters) => apiCall(`${ENDPOINTS.content}?${queryString(filters)}`),
  getById: (id) => apiCall(`${ENDPOINTS.content}/${id}`),
  create: (data) =>
    apiCall(ENDPOINTS.content, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    apiCall(`${ENDPOINTS.content}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id, status) =>
    apiCall(`${ENDPOINTS.content}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  updateThoughts: (id, thoughts) =>
    apiCall(`${ENDPOINTS.content}/${id}/thoughts`, {
      method: 'PUT',
      body: JSON.stringify({ thoughts }),
    }),
  delete: (id) => apiCall(`${ENDPOINTS.content}/${id}`, { method: 'DELETE' }),
};
