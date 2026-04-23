import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { REQUEST_PASSWORD_RESET_MUTATION } from '../graphql/mutations';
import LogoMark from '../components/LogoMark';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [requestReset, state] = useMutation(REQUEST_PASSWORD_RESET_MUTATION);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await requestReset({ variables: { email: email.trim() } });
    } catch {
      // We still show success — endpoint never reveals whether the email exists.
    }
    setSubmitted(true);
  }

  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #166534 0%, #15803d 100%)',
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          maxWidth: 460,
          width: '100%',
          padding: '36px 32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <LogoMark size={56} />
        </div>
        <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, color: '#111827', textAlign: 'center' }}>
          পাসওয়ার্ড রিসেট
        </h1>
        <p style={{ margin: '0 0 22px', color: '#6b7280', fontSize: 18, textAlign: 'center', lineHeight: 1.6 }}>
          আপনার রেজিস্টার্ড ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হবে।
        </p>

        {submitted ? (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              borderRadius: 10,
              padding: '14px 16px',
              fontSize: 18,
              lineHeight: 1.6,
            }}
          >
            যদি <strong>{email}</strong> একটি রেজিস্টার্ড অ্যাকাউন্ট হয়ে থাকে, তাহলে আপনি কিছুক্ষণের
            মধ্যে রিসেট লিংক সম্বলিত একটি ইমেইল পাবেন। স্প্যাম ফোল্ডারও দেখে নিন।
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
            <div>
              <label htmlFor="fp-email" style={{ display: 'block', fontSize: 17, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                ইমেইল
              </label>
              <input
                id="fp-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ds-input"
                style={{ width: '100%', height: 48, borderRadius: 12, border: '1.5px solid #d1d5db', background: '#f9fafb', padding: '0 14px', fontSize: 19, outline: 'none' }}
              />
            </div>
            <button
              type="submit"
              disabled={state.loading}
              style={{
                height: 48,
                background: state.loading ? '#86efac' : '#16a34a',
                color: '#fff',
                border: 0,
                borderRadius: 12,
                fontSize: 19,
                fontWeight: 600,
                cursor: state.loading ? 'not-allowed' : 'pointer',
              }}
            >
              {state.loading ? 'পাঠানো হচ্ছে...' : 'রিসেট লিংক পাঠান'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <Link to="/login" style={{ fontSize: 17, color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>
            ← লগইনে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
