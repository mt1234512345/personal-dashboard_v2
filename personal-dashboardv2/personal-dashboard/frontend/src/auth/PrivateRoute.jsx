import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

/** Wraps a page element: redirects to /login when there's no token,
 * otherwise renders the page. Usage:
 *   <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
 */
export function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default PrivateRoute;
