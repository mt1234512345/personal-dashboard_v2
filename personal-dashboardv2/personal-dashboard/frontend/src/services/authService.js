import { apiCall } from './api';
import { ENDPOINTS } from '../config';

export const authService = {
  login: (password) =>
    apiCall(ENDPOINTS.login, {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
};
