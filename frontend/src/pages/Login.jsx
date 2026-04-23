import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import LogoMark from '../components/LogoMark';
import { useIsMobile } from '../context/MobileContext';

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
  fontSize: 19,
  outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms',
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
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

  const formCard = (
    <div
      style={{
        background: '#ffffff',
        borderRadius: isMobile ? '24px 24px 0 0' : 20,
        padding: isMobile ? '28px 24px 48px' : '40px 44px',
        boxShadow: isMobile ? '0 -4px 24px rgba(0,0,0,0.12)' : '0 20px 40px rgba(0,0,0,0.18)',
        flex: 1,
        marginTop: isMobile ? 'auto' : 0,
        width: '100%',
        maxWidth: isMobile ? undefined : 440,
      }}
    >
      <h2 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 6px', color: '#111827' }}>
        লগইন করুন
      </h2>
      <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: 18 }}>
        আপনার অ্যাকাউন্টে প্রবেশ করতে ইমেইল ও পাসওয়ার্ড দিন।
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
        <div>
          <label
            htmlFor="email"
            style={{ display: 'block', fontSize: 18, fontWeight: 600, color: '#374151', marginBottom: 6 }}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label
              htmlFor="password"
              style={{ fontSize: 18, fontWeight: 600, color: '#374151' }}
            >
              পাসওয়ার্ড
            </label>
            <Link
              to="/forgot-password"
              style={{ fontSize: 17, color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          </div>
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
          <p role="alert" style={{ margin: 0, color: '#ef4444', fontSize: 18, fontWeight: 500 }}>
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
            fontSize: 20,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 4,
            transition: 'background 150ms',
            boxShadow: '0 8px 20px rgba(22,163,74,0.25)',
          }}
        >
          {loading ? 'প্রবেশ করা হচ্ছে...' : 'প্রবেশ করুন'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 6 }}>
          <Link to="/" style={{ fontSize: 17, color: '#6b7280', textDecoration: 'none' }}>
            ← হোমপেজে ফিরে যান
          </Link>
        </div>
      </form>
    </div>
  );

  if (isMobile) {
    return (
      <div
        style={{
          minHeight: '100svh',
          background: 'linear-gradient(160deg, #166534 0%, #15803d 100%)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
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
          <h1 style={{ color: '#ffffff', fontSize: 30, fontWeight: 700, margin: '18px 0 6px', textAlign: 'center' }}>
            ময়দানে মুহাম্মাদ
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 18, margin: 0 }}>Maidan-e-Muhammad</p>
        </div>
        {formCard}
      </div>
    );
  }

  // Desktop: split layout
  return (
    <div style={{ minHeight: '100svh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left brand panel */}
      <div
        style={{
          background: 'linear-gradient(160deg, #166534 0%, #15803d 100%)',
          color: '#ffffff',
          padding: '56px 64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 24,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LogoMark size={44} bg="rgba(255,255,255,0.18)" />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>ময়দানে মুহাম্মাদ</div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', letterSpacing: 1 }}>
              Maidan-e-Muhammad
            </div>
          </div>
        </div>

        <div>
          <h1 style={{ fontSize: 44, fontWeight: 700, margin: '0 0 14px', lineHeight: 1.2 }}>
            মাসিক চাঁদা সংগ্রহ এখন আরও সহজ
          </h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: 20, lineHeight: 1.7, maxWidth: 460 }}>
            দাতা, কালেকশন, রিপোর্ট — সব একজায়গায়। মাঠ পর্যায়ে কাজকে আরও দ্রুত ও নির্ভুল করুন।
          </p>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {['মাসিক চাঁদার স্বয়ংক্রিয় হিসাব', 'বিস্তারিত কালেক্টর রিপোর্ট', 'নিরাপদ ও ভূমিকা-ভিত্তিক অ্যাক্সেস'].map((t) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.9)', fontSize: 18 }}>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.18)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          background: '#f9fafb',
        }}
      >
        {formCard}
      </div>
    </div>
  );
}
