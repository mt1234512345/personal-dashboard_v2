import { useCallback, useMemo, useState } from 'react';
import AuthContext from './AuthContext';
import { authService } from '../services/authService';

const TOKEN_KEY = 'authToken';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.login(password);
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      return true;
    } catch (err) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
      isLoading,
      error,
    }),
    [token, login, logout, isLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
