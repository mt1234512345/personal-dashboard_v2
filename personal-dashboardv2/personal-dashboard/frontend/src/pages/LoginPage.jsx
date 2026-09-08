import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import LoginForm from '../components/LoginForm';
import { APP_NAME } from '../config';

export function LoginPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">{APP_NAME}</h1>
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;
