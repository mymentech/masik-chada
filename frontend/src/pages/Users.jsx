import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { USERS_QUERY } from '../graphql/queries';
import {
  ADMIN_DELETE_USER_MUTATION,
  ADMIN_RESET_PASSWORD_MUTATION,
  ADMIN_UPDATE_USER_MUTATION,
  CREATE_USER_MUTATION,
} from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';
import { useIsMobile } from '../context/MobileContext';

const inputStyle = {
  width: '100%',
  height: 44,
  borderRadius: 10,
  border: '1.5px solid #d1d5db',
  background: '#f9fafb',
  padding: '0 12px',
  fontSize: 14,
  outline: 'none',
};

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 };

function Sheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.48)',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          width: '100%',
          maxWidth: 520,
          maxHeight: '92svh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{title}</h2>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function roleBadge(role) {
  const isAdmin = String(role || '').toLowerCase() === 'admin';
  return (
    <span
      style={{
        background: isAdmin ? '#fef3c7' : '#dcfce7',
        color: isAdmin ? '#92400e' : '#166534',
        borderRadius: 999,
        padding: '3px 10px',
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {isAdmin ? 'অ্যাডমিন' : 'কালেক্টর'}
    </span>
  );
}

export default function Users() {
  const isMobile = useIsMobile();
  const { user: me } = useAuth();
  const { data, loading, error } = useQuery(USERS_QUERY, { fetchPolicy: 'cache-and-network' });
  const users = data?.users || [];

  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [resetting, setResetting] = useState(null);
  const [notice, setNotice] = useState({ type: '', text: '' });

  const [createUser, createState] = useMutation(CREATE_USER_MUTATION);
  const [adminUpdate, updateState] = useMutation(ADMIN_UPDATE_USER_MUTATION);
  const [adminReset, resetState] = useMutation(ADMIN_RESET_PASSWORD_MUTATION);
  const [adminDelete] = useMutation(ADMIN_DELETE_USER_MUTATION);

  async function handleCreate(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setNotice({ type: '', text: '' });
    const selectedRole = String(f.get('role') || '').toLowerCase() === 'admin' ? 'Admin' : 'Collector';
    try {
      await createUser({
        variables: {
          input: {
            name: f.get('name').trim(),
            email: f.get('email').trim(),
            phone: f.get('phone').trim() || '+880',
            role: selectedRole,
            password: f.get('password'),
          },
        },
        refetchQueries: [{ query: USERS_QUERY }],
        awaitRefetchQueries: true,
      });
      setCreating(false);
      setNotice({ type: 'success', text: 'নতুন ইউজার যোগ হয়েছে।' });
    } catch (err) {
      setNotice({ type: 'error', text: err?.graphQLErrors?.[0]?.message || 'তৈরি করা যায়নি।' });
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editing) return;
    const f = new FormData(e.currentTarget);
    setNotice({ type: '', text: '' });
    const selectedRole = String(f.get('role') || '').toLowerCase() === 'admin' ? 'Admin' : 'Collector';
    try {
      await adminUpdate({
        variables: {
          id: editing.id,
          input: {
            name: f.get('name').trim(),
            email: f.get('email').trim(),
            phone: f.get('phone').trim() || '+880',
            role: selectedRole,
          },
        },
        refetchQueries: [{ query: USERS_QUERY }],
        awaitRefetchQueries: true,
      });
      setEditing(null);
      setNotice({ type: 'success', text: 'ইউজার আপডেট হয়েছে।' });
    } catch (err) {
      setNotice({ type: 'error', text: err?.graphQLErrors?.[0]?.message || 'আপডেট ব্যর্থ।' });
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (!resetting) return;
    const f = new FormData(e.currentTarget);
    const pw = f.get('password');
    setNotice({ type: '', text: '' });
    try {
      await adminReset({ variables: { id: resetting.id, newPassword: pw } });
      setResetting(null);
      setNotice({ type: 'success', text: `পাসওয়ার্ড রিসেট সম্পন্ন।` });
    } catch (err) {
      setNotice({ type: 'error', text: err?.graphQLErrors?.[0]?.message || 'রিসেট ব্যর্থ।' });
    }
  }

  async function handleDelete(u) {
    if (!window.confirm(`${u.name} কে মুছে ফেলতে চান?`)) return;
    setNotice({ type: '', text: '' });
    try {
      await adminDelete({
        variables: { id: u.id },
        refetchQueries: [{ query: USERS_QUERY }],
        awaitRefetchQueries: true,
      });
      setNotice({ type: 'success', text: 'ইউজার মুছে ফেলা হয়েছে।' });
    } catch (err) {
      setNotice({ type: 'error', text: err?.graphQLErrors?.[0]?.message || 'ডিলিট ব্যর্থ।' });
    }
  }

  return (
    <div style={{ background: '#f9fafb', minHeight: '100svh', padding: isMobile ? 16 : '24px 0' }}>
      <div className={isMobile ? '' : 'container'} style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>ইউজার ম্যানেজমেন্ট</h1>
          <button
            type="button"
            onClick={() => setCreating(true)}
            style={{
              height: 40,
              padding: '0 16px',
              background: '#16a34a',
              color: '#fff',
              border: 0,
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            + নতুন ইউজার
          </button>
        </div>

        {notice.text && (
          <div
            style={{
              background: notice.type === 'error' ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${notice.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
              color: notice.type === 'error' ? '#991b1b' : '#166534',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 14,
            }}
          >
            {notice.text}
          </div>
        )}

        {error && <p style={{ color: '#ef4444' }}>ইউজার তালিকা আনা যায়নি।</p>}

        <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          {!isMobile && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 140px 140px 220px',
                gap: 8,
                padding: '12px 20px',
                background: '#f0fdf4',
                fontSize: 11,
                fontWeight: 700,
                color: '#166534',
              }}
            >
              <span>নাম</span>
              <span>ইমেইল</span>
              <span>ফোন</span>
              <span>ভূমিকা</span>
              <span>অ্যাকশন</span>
            </div>
          )}

          {loading && users.length === 0 && (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0', fontSize: 14 }}>লোড হচ্ছে...</p>
          )}

          {users.map((u, idx) =>
            isMobile ? (
              <div key={u.id} style={{ padding: '14px 16px', background: idx % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{u.email}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{u.phone}</div>
                    <div style={{ marginTop: 6 }}>{roleBadge(u.role)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => setEditing(u)} style={{ background: '#dbeafe', color: '#2563eb', border: 0, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>এডিট</button>
                  <button type="button" onClick={() => setResetting(u)} style={{ background: '#fef3c7', color: '#92400e', border: 0, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>পাসওয়ার্ড রিসেট</button>
                  {String(me?.id) !== String(u.id) && (
                    <button type="button" onClick={() => handleDelete(u)} style={{ background: '#fee2e2', color: '#ef4444', border: 0, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>ডিলিট</button>
                  )}
                </div>
              </div>
            ) : (
              <div
                key={u.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 140px 140px 220px',
                  gap: 8,
                  padding: '12px 20px',
                  alignItems: 'center',
                  background: idx % 2 === 0 ? '#fff' : '#f9fafb',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: 13,
                }}
              >
                <span style={{ fontWeight: 600, color: '#111827' }}>{u.name}</span>
                <span style={{ color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</span>
                <span style={{ color: '#374151' }}>{u.phone}</span>
                <span>{roleBadge(u.role)}</span>
                <span style={{ display: 'flex', gap: 6 }}>
                  <button type="button" onClick={() => setEditing(u)} style={{ background: '#dbeafe', color: '#2563eb', border: 0, borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>এডিট</button>
                  <button type="button" onClick={() => setResetting(u)} style={{ background: '#fef3c7', color: '#92400e', border: 0, borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>রিসেট</button>
                  {String(me?.id) !== String(u.id) && (
                    <button type="button" onClick={() => handleDelete(u)} style={{ background: '#fee2e2', color: '#ef4444', border: 0, borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>ডিলিট</button>
                  )}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      <Sheet open={creating} onClose={() => setCreating(false)} title="নতুন ইউজার">
        <form onSubmit={handleCreate} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={labelStyle}>নাম</label>
            <input name="name" required className="ds-input" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>ইমেইল</label>
            <input name="email" type="email" required className="ds-input" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>ফোন</label>
            <input name="phone" defaultValue="+880" className="ds-input" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>ভূমিকা</label>
            <select name="role" defaultValue="Collector" className="ds-input" style={inputStyle}>
              <option value="Collector">কালেক্টর</option>
              <option value="Admin">অ্যাডমিন</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>পাসওয়ার্ড (ন্যূনতম ৬)</label>
            <input name="password" type="password" required minLength={6} className="ds-input" style={inputStyle} />
          </div>
          <button type="submit" disabled={createState.loading} style={{ height: 44, background: '#16a34a', color: '#fff', border: 0, borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
            {createState.loading ? 'তৈরি হচ্ছে...' : 'ইউজার তৈরি করুন'}
          </button>
        </form>
      </Sheet>

      <Sheet open={Boolean(editing)} onClose={() => setEditing(null)} title="ইউজার এডিট">
        {editing && (
          <form onSubmit={handleUpdate} style={{ display: 'grid', gap: 12 }}>
            <div>
              <label style={labelStyle}>নাম</label>
              <input name="name" defaultValue={editing.name} required className="ds-input" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>ইমেইল</label>
              <input name="email" type="email" defaultValue={editing.email} required className="ds-input" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>ফোন</label>
              <input name="phone" defaultValue={editing.phone} className="ds-input" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>ভূমিকা</label>
              <select name="role" defaultValue={editing.role} className="ds-input" style={inputStyle}>
                <option value="Collector">কালেক্টর</option>
                <option value="Admin">অ্যাডমিন</option>
              </select>
            </div>
            <button type="submit" disabled={updateState.loading} style={{ height: 44, background: '#16a34a', color: '#fff', border: 0, borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
              {updateState.loading ? 'সংরক্ষণ হচ্ছে...' : 'আপডেট করুন'}
            </button>
          </form>
        )}
      </Sheet>

      <Sheet open={Boolean(resetting)} onClose={() => setResetting(null)} title={`পাসওয়ার্ড রিসেট — ${resetting?.name || ''}`}>
        {resetting && (
          <form onSubmit={handleResetPassword} style={{ display: 'grid', gap: 12 }}>
            <div>
              <label style={labelStyle}>নতুন পাসওয়ার্ড (ন্যূনতম ৬)</label>
              <input name="password" type="password" required minLength={6} className="ds-input" style={inputStyle} />
            </div>
            <button type="submit" disabled={resetState.loading} style={{ height: 44, background: '#f59e0b', color: '#fff', border: 0, borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
              {resetState.loading ? 'রিসেট হচ্ছে...' : 'পাসওয়ার্ড সেট করুন'}
            </button>
          </form>
        )}
      </Sheet>
    </div>
  );
}
