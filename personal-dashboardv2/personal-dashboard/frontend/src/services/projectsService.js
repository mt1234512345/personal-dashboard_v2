import { apiCall } from './api';
import { ENDPOINTS } from '../config';
import { queryString } from '../utils/formatter';

export const projectsService = {
  getAll: (filters) => apiCall(`${ENDPOINTS.projects}?${queryString(filters)}`),
  getById: (id) => apiCall(`${ENDPOINTS.projects}/${id}`),
  create: (data) =>
    apiCall(ENDPOINTS.projects, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    apiCall(`${ENDPOINTS.projects}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`${ENDPOINTS.projects}/${id}`, { method: 'DELETE' }),
};
