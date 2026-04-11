import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';

function mapLoginError(error) {
  if (!error) {
    return '';
  }

  const graphqlMessage = error.graphQLErrors?.[0]?.message;
  if (graphqlMessage) {
    return graphqlMessage;
  }

  return 'লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, loading, error } = useLogin();

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('ইমেইল এবং পাসওয়ার্ড দিন।');
      return;
    }

    try {
      await login({ email, password });
      const nextPath = location.state?.from || '/dashboard';
      navigate(nextPath, { replace: true });
    } catch {
      // Error is surfaced via Apollo state and mapped for UI below.
    }
  }

  const uiError = formError || mapLoginError(error);

  return (
    <main className="auth-page container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>লগইন</h1>

        <label htmlFor="email">ইমেইল</label>
        <input
          id="email"
          type="email"
          placeholder="collector@example.com"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="password">পাসওয়ার্ড</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {uiError ? <p className="error-text">{uiError}</p> : null}

        <button type="submit" className="primary-btn full-width" disabled={loading}>
          {loading ? 'প্রবেশ করা হচ্ছে...' : 'প্রবেশ করুন'}
        </button>
      </form>
    </main>
  );
}
