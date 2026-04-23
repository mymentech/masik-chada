import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { ME_QUERY } from '../graphql/queries';
import { CHANGE_PASSWORD_MUTATION, UPDATE_PROFILE_MUTATION } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';
import { useIsMobile } from '../context/MobileContext';

const cardStyle = (isMobile) => ({
  background: '#ffffff',
  borderRadius: 16,
  padding: isMobile ? 20 : 28,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
});

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
};

const inputStyle = {
  width: '100%',
  height: 46,
  borderRadius: 12,
  border: '1.5px solid #d1d5db',
  background: '#f9fafb',
  padding: '0 14px',
  fontSize: 14,
  outline: 'none',
};

const buttonPrimary = (loading) => ({
  height: 46,
  background: loading ? '#86efac' : '#16a34a',
  color: '#ffffff',
  border: 0,
  borderRadius: 12,
  fontWeight: 600,
  fontSize: 14,
  cursor: loading ? 'not-allowed' : 'pointer',
  padding: '0 22px',
});

function Feedback({ notice }) {
  if (!notice?.text) return null;
  const isError = notice.type === 'error';
  return (
    <div
      role={isError ? 'alert' : 'status'}
      style={{
        background: isError ? '#fef2f2' : '#f0fdf4',
        border: `1px solid ${isError ? '#fecaca' : '#bbf7d0'}`,
        color: isError ? '#991b1b' : '#166534',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: 14,
        marginBottom: 14,
      }}
    >
      {notice.text}
    </div>
  );
}

export default function Profile() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user: authUser, login: setAuth, token, logout } = useAuth();
  const { data, loading } = useQuery(ME_QUERY, { fetchPolicy: 'cache-and-network' });
  const me = data?.me;

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [profileNotice, setProfileNotice] = useState({ type: '', text: '' });
  const [pwNotice, setPwNotice] = useState({ type: '', text: '' });

  useEffect(() => {
    if (me) {
      setForm({ name: me.name || '', email: me.email || '', phone: me.phone || '+880' });
    }
  }, [me]);

  const [updateProfile, updateState] = useMutation(UPDATE_PROFILE_MUTATION);
  const [changePassword, changeState] = useMutation(CHANGE_PASSWORD_MUTATION);
  const isAdmin = String(me?.role || '').toLowerCase() === 'admin';

  async function saveProfile(e) {
    e.preventDefault();
    setProfileNotice({ type: '', text: '' });
    try {
      const res = await updateProfile({
        variables: {
          input: {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim() || '+880',
          },
        },
        refetchQueries: [{ query: ME_QUERY }],
        awaitRefetchQueries: true,
      });
      const updated = res.data?.updateProfile;
      if (updated && token) {
        setAuth(token, { ...(authUser || {}), ...updated });
      }
      setProfileNotice({ type: 'success', text: 'প্রোফাইল আপডেট হয়েছে।' });
    } catch (err) {
      setProfileNotice({ type: 'error', text: err?.graphQLErrors?.[0]?.message || 'আপডেট করা যায়নি।' });
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPwNotice({ type: '', text: '' });
    if (pwForm.newPassword.length < 6) {
      setPwNotice({ type: 'error', text: 'নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।' });
      return;
    }
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwNotice({ type: 'error', text: 'নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না।' });
      return;
    }
    try {
      await changePassword({
        variables: {
          input: {
            currentPassword: pwForm.currentPassword,
            newPassword: pwForm.newPassword,
          },
        },
      });
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      setPwNotice({ type: 'success', text: 'পাসওয়ার্ড পরিবর্তন হয়েছে।' });
    } catch (err) {
      setPwNotice({ type: 'error', text: err?.graphQLErrors?.[0]?.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ।' });
    }
  }

  function logoutFromProfile() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div style={{ background: '#f9fafb', minHeight: '100svh', padding: isMobile ? '16px' : '24px 0' }}>
      <div className={isMobile ? '' : 'container'} style={{ display: 'grid', gap: 20, maxWidth: 820 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>প্রোফাইল</h1>

        {isAdmin && isMobile && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Link
              to="/users"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '14px 10px',
                background: '#fef3c7',
                borderRadius: 12,
                color: '#92400e',
                fontWeight: 600,
                fontSize: 13,
                textDecoration: 'none',
              }}
            >
              ইউজার ম্যানেজমেন্ট
            </Link>
            <Link
              to="/settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '14px 10px',
                background: '#dbeafe',
                borderRadius: 12,
                color: '#1d4ed8',
                fontWeight: 600,
                fontSize: 13,
                textDecoration: 'none',
              }}
            >
              সেটিংস
            </Link>
          </div>
        )}

        {isMobile && (
          <button
            type="button"
            onClick={logoutFromProfile}
            style={{
              height: 44,
              border: 0,
              borderRadius: 12,
              background: '#eef2ff',
              color: '#4f46e5',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            লগআউট
          </button>
        )}

        {loading && !me ? (
          <p style={{ color: '#9ca3af' }}>লোড হচ্ছে...</p>
        ) : null}

        <section style={cardStyle(isMobile)}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#111827' }}>
            ব্যক্তিগত তথ্য
          </h2>
          <Feedback notice={profileNotice} />
          <form onSubmit={saveProfile} style={{ display: 'grid', gap: 14 }}>
            <div>
              <label htmlFor="profile-name" style={labelStyle}>নাম</label>
              <input
                id="profile-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="ds-input"
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
              <div>
                <label htmlFor="profile-email" style={labelStyle}>ইমেইল</label>
                <input
                  id="profile-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="ds-input"
                  style={inputStyle}
                />
              </div>
              <div>
                <label htmlFor="profile-phone" style={labelStyle}>ফোন</label>
                <input
                  id="profile-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="ds-input"
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  background: isAdmin ? '#fef3c7' : '#dcfce7',
                  color: isAdmin ? '#92400e' : '#166534',
                  borderRadius: 999,
                  padding: '4px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {isAdmin ? 'অ্যাডমিন' : 'কালেক্টর'}
              </span>
            </div>
            <div>
              <button type="submit" disabled={updateState.loading} style={buttonPrimary(updateState.loading)}>
                {updateState.loading ? 'সংরক্ষণ হচ্ছে...' : 'প্রোফাইল আপডেট করুন'}
              </button>
            </div>
          </form>
        </section>

        <section style={cardStyle(isMobile)}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#111827' }}>
            পাসওয়ার্ড পরিবর্তন
          </h2>
          <Feedback notice={pwNotice} />
          <form onSubmit={savePassword} style={{ display: 'grid', gap: 14 }}>
            <div>
              <label htmlFor="cur-pw" style={labelStyle}>বর্তমান পাসওয়ার্ড</label>
              <input
                id="cur-pw"
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                className="ds-input"
                style={inputStyle}
                autoComplete="current-password"
              />
            </div>
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
              <div>
                <label htmlFor="new-pw" style={labelStyle}>নতুন পাসওয়ার্ড</label>
                <input
                  id="new-pw"
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  className="ds-input"
                  style={inputStyle}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label htmlFor="confirm-pw" style={labelStyle}>নতুন পাসওয়ার্ড কনফার্ম</label>
                <input
                  id="confirm-pw"
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                  className="ds-input"
                  style={inputStyle}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div>
              <button type="submit" disabled={changeState.loading} style={buttonPrimary(changeState.loading)}>
                {changeState.loading ? 'সংরক্ষণ হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
