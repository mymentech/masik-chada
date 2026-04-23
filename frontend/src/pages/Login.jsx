import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import LogoMark from '../components/LogoMark';

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function mapLoginError(error) {
  if (!error) return '';
  const graphqlMessage = error.graphQLErrors?.[0]?.message;
  if (graphqlMessage) return graphqlMessage;
  return 'লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
}

const inputBase = {
  width: '100%',
  height: 52,
  borderRadius: 12,
  padding: '0 14px',
  fontSize: 15,
  outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms',
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [focusedField, setFocusedField] = useState('');
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
      // Error surfaced via Apollo state.
    }
  }

  const uiError = formError || mapLoginError(error);

  function inputStyle(fieldName) {
    const focused = focusedField === fieldName;
    return {
      ...inputBase,
      border: focused ? '2px solid #16a34a' : '1.5px solid #d1d5db',
      background: '#f9fafb',
      boxShadow: focused ? '0 0 0 3px rgba(22,163,74,0.12)' : 'none',
    };
  }

  return (
    <div
      style={{
        minHeight: '100svh',
        background: 'linear-gradient(160deg, #166534 0%, #15803d 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Hero section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px 24px',
          flex: '0 0 auto',
        }}
      >
        <LogoMark size={72} bg="rgba(255,255,255,0.18)" />
        <h1
          style={{
            color: '#ffffff',
            fontSize: 26,
            fontWeight: 700,
            margin: '18px 0 6px',
            textAlign: 'center',
          }}
        >
          ময়দানে মুহাম্মাদ
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, margin: 0 }}>
          Maidan-e-Muhammad
        </p>
      </div>

      {/* White card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px 24px 0 0',
          padding: '28px 24px 48px',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
          flex: 1,
          marginTop: 'auto',
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 24px', color: '#111827' }}>
          লগইন করুন
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 6,
              }}
            >
              ইমেইল
            </label>
            <input
              id="email"
              type="email"
              placeholder="collector@example.com"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              style={inputStyle('email')}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 6,
              }}
            >
              পাসওয়ার্ড
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                style={{ ...inputStyle('password'), paddingRight: 48 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {uiError ? (
            <p
              role="alert"
              style={{ margin: 0, color: '#ef4444', fontSize: 14, fontWeight: 500 }}
            >
              {uiError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              height: 52,
              background: loading ? '#86efac' : '#16a34a',
              color: '#ffffff',
              border: 0,
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4,
              transition: 'background 150ms',
            }}
          >
            {loading ? 'প্রবেশ করা হচ্ছে...' : 'প্রবেশ করুন'}
          </button>
        </form>
      </div>
    </div>
  );
}