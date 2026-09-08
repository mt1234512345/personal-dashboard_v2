import { apiCall } from './api';
import { ENDPOINTS } from '../config';
import { queryString } from '../utils/formatter';

export const tasksService = {
  getAll: (filters) => apiCall(`${ENDPOINTS.tasks}?${queryString(filters)}`),
  getById: (id) => apiCall(`${ENDPOINTS.tasks}/${id}`),
  create: (data) =>
    apiCall(ENDPOINTS.tasks, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    apiCall(`${ENDPOINTS.tasks}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggle: (id) => apiCall(`${ENDPOINTS.tasks}/${id}/toggle`, { method: 'PATCH' }),
  delete: (id) => apiCall(`${ENDPOINTS.tasks}/${id}`, { method: 'DELETE' }),
};
