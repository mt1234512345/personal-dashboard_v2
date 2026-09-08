import { createContext } from 'react';

// Shape mirrors the frontend spec exactly:
// { token, isAuthenticated, login(password), logout(), isLoading, error }
const AuthContext = createContext(undefined);

export default AuthContext;
