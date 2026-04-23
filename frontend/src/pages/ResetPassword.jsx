import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { RESET_PASSWORD_MUTATION } from '../graphql/mutations';
import LogoMark from '../components/LogoMark';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [resetPassword, state] = useMutation(RESET_PASSWORD_MUTATION);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('টোকেন পাওয়া যায়নি। অনুগ্রহ করে লিংকটি সঠিকভাবে ব্যবহার করুন।');
      return;
    }
    if (pw.length < 6) {
      setError('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (pw !== confirm) {
      setError('পাসওয়ার্ড মিলছে না।');
      return;
    }
    try {
      await resetPassword({ variables: { token, newPassword: pw } });
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err?.graphQLErrors?.[0]?.message || 'রিসেট ব্যর্থ হয়েছে।');
    }
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
        <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#111827', textAlign: 'center' }}>
          নতুন পাসওয়ার্ড সেট করুন
        </h1>

        {done ? (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              borderRadius: 10,
              padding: '14px 16px',
              fontSize: 14,
              marginTop: 18,
              textAlign: 'center',
            }}
          >
            পাসওয়ার্ড রিসেট সম্পন্ন। আপনাকে লগইন পেজে নিয়ে যাওয়া হচ্ছে...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14, marginTop: 8 }}>
            <div>
              <label htmlFor="rp-new" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                নতুন পাসওয়ার্ড
              </label>
              <input
                id="rp-new"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="ds-input"
                style={{ width: '100%', height: 48, borderRadius: 12, border: '1.5px solid #d1d5db', background: '#f9fafb', padding: '0 14px', fontSize: 15, outline: 'none' }}
              />
            </div>
            <div>
              <label htmlFor="rp-confirm" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                পাসওয়ার্ড কনফার্ম
              </label>
              <input
                id="rp-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="ds-input"
                style={{ width: '100%', height: 48, borderRadius: 12, border: '1.5px solid #d1d5db', background: '#f9fafb', padding: '0 14px', fontSize: 15, outline: 'none' }}
              />
            </div>

            {error && (
              <p role="alert" style={{ margin: 0, color: '#ef4444', fontSize: 14, fontWeight: 500 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={state.loading}
              style={{
                height: 48,
                background: state.loading ? '#86efac' : '#16a34a',
                color: '#fff',
                border: 0,
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                cursor: state.loading ? 'not-allowed' : 'pointer',
              }}
            >
              {state.loading ? 'সংরক্ষণ হচ্ছে...' : 'পাসওয়ার্ড সেট করুন'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <Link to="/login" style={{ fontSize: 13, color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>
            ← লগইনে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
