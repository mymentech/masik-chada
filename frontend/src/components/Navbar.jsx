import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ME_QUERY } from '../graphql/queries';
import LogoMark from './LogoMark';

const baseItems = [
  { to: '/dashboard', label: 'ড্যাশবোর্ড' },
  { to: '/donations', label: 'চাঁদা সংগ্রহ' },
  { to: '/donors', label: 'দাতা ম্যানেজমেন্ট' },
  { to: '/reports', label: 'রিপোর্ট' },
];

const adminItems = [
  { to: '/users', label: 'ইউজার' },
  { to: '/settings', label: 'সেটিংস' },
];

export default function Navbar() {
  const { logout, user, isAuthenticated } = useAuth();
  const { data } = useQuery(ME_QUERY, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const activeUser = data?.me || user;
  const isAdmin = String(activeUser?.role || '').toLowerCase() === 'admin';
  const navItems = isAdmin ? [...baseItems, ...adminItems] : baseItems;

  return (
    <header className="topbar">
      <div
        className="container"
        style={{ minHeight: 64, display: 'flex', alignItems: 'center', gap: 16 }}
      >
        {/* Logo lockup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <LogoMark size={34} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#166534', lineHeight: 1.1 }}>
              ময়দানে মুহাম্মাদ
            </div>
            <div style={{ fontSize: 14, color: '#16a34a', letterSpacing: '0.3px' }}>
              Maidan-e-Muhammad
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav
          style={{ display: 'flex', gap: 2, marginLeft: 'auto', flexWrap: 'wrap' }}
          aria-label="মেইন নেভিগেশন"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 18,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#166534' : '#6b7280',
                background: isActive ? '#f0fdf4' : 'transparent',
                textDecoration: 'none',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, position: 'relative' }}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 120)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            {activeUser?.name && (
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: '#374151', lineHeight: 1.2 }}>
                  {activeUser.name}
                </div>
                <div style={{ fontSize: 15, color: '#9ca3af', lineHeight: 1.2 }}>
                  {isAdmin ? 'অ্যাডমিন' : 'কালেক্টর'}
                </div>
              </div>
            )}
          </button>

          {menuOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                background: '#ffffff',
                border: '1px solid #f3f4f6',
                borderRadius: 12,
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                minWidth: 180,
                padding: 6,
                zIndex: 30,
              }}
            >
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); navigate('/profile'); setMenuOpen(false); }}
                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 0, padding: '10px 12px', borderRadius: 8, fontSize: 18, color: '#374151', cursor: 'pointer' }}
              >
                আমার প্রোফাইল
              </button>
              {isAdmin && (
                <>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); navigate('/users'); setMenuOpen(false); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 0, padding: '10px 12px', borderRadius: 8, fontSize: 18, color: '#374151', cursor: 'pointer' }}
                  >
                    ইউজার ম্যানেজমেন্ট
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); navigate('/settings'); setMenuOpen(false); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 0, padding: '10px 12px', borderRadius: 8, fontSize: 18, color: '#374151', cursor: 'pointer' }}
                  >
                    সেটিংস
                  </button>
                </>
              )}
              <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0' }} />
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); logout(); navigate('/login', { replace: true }); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'transparent', border: 0, padding: '10px 12px', borderRadius: 8, fontSize: 18, color: '#4f46e5', cursor: 'pointer' }}
              >
                <LogOut size={14} />
                লগআউট
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#eef2ff',
              color: '#4f46e5',
              border: 0,
              borderRadius: 8,
              padding: '8px 14px',
              fontWeight: 600,
              fontSize: 17,
              cursor: 'pointer',
              minHeight: 36,
            }}
          >
            <LogOut size={14} />
            লগআউট
          </button>
        </div>
      </div>
    </header>
  );
}
