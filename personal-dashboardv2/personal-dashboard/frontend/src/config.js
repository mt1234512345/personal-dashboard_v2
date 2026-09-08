// Empty string means "same origin as the page" (relative fetch URLs) --
// that's what the combined Railway deploy wants, since Flask serves this
// built app and the API from the same host. Local dev (`npm run dev`)
// still sets VITE_API_BASE_URL=http://localhost:5000 in .env to reach a
// separately-running backend on a different port.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Personal Dashboard';

export const ENDPOINTS = {
  login: '/login',
  health: '/health',
  dashboard: '/dashboard',
  morning: '/morning',
  tasks: '/api/tasks',
  content: '/api/content',
  projects: '/api/projects',
  weeklyPlanning: '/api/weekly-planning',
};
