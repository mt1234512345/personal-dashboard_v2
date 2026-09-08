import { apiCall } from './api';
import { ENDPOINTS } from '../config';

export const weeklyService = {
  getPlanning: (weekStartDate) =>
    apiCall(`${ENDPOINTS.weeklyPlanning}?week_start_date=${weekStartDate}`),
  updateDay: (dayOfWeek, data) =>
    apiCall(`${ENDPOINTS.weeklyPlanning}/${dayOfWeek}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
