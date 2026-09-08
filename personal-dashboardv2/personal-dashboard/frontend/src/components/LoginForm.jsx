import { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';

/** The password input + submit button used on LoginPage. */
export function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password) return;
    const success = await login(password);
    if (success) navigate('/', { replace: true });
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label className="form-field">
        <span className="form-label">Password</span>
        <input
          type="password"
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="current-password"
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
        {isLoading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

export default LoginForm;
