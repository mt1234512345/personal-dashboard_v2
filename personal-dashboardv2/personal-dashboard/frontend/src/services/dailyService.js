import { apiCall } from './api';
import { ENDPOINTS } from '../config';

export const dailyService = {
  getDashboard: () => apiCall(ENDPOINTS.dashboard),
  getMorning: () => apiCall(ENDPOINTS.morning),
  postMorning: (data) =>
    apiCall(ENDPOINTS.morning, { method: 'POST', body: JSON.stringify(data) }),
};
