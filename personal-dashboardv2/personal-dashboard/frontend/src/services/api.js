import { API_BASE_URL } from '../config';

const TOKEN_KEY = 'authToken';

/**
 * Fetch wrapper: attaches the bearer token (if present), always sends/
 * expects JSON, and on a 401 clears the stored token and hard-redirects to
 * /login (mirrors the frontend spec's api.js exactly).
 *
 * One deliberate improvement over the spec's literal sample: on a non-2xx
 * response we try to read the backend's `{ "error": "..." }` body and use
 * that as the thrown Error's message, falling back to a generic
 * "API error: <status>" only if the body isn't JSON/doesn't have `error`.
 * Every backend error handler returns that shape, so this lets forms show
 * "Task not found" instead of "API error: 404" without changing the
 * function's contract (still throws Error on !response.ok).
 */
export async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkErr) {
    throw new Error('Network error -- could not reach the server.');
  }

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    let message = `API error: ${response.status}`;
    try {
      const body = await response.json();
      if (body && body.error) message = body.error;
    } catch (_parseErr) {
      // Body wasn't JSON -- keep the generic message.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export { TOKEN_KEY };
