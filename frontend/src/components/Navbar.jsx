import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LogoMark from './LogoMark';

const navItems = [
  { to: '/dashboard', label: 'ড্যাশবোর্ড' },
  { to: '/donations', label: 'চাঁদা সংগ্রহ' },
  { to: '/donors', label: 'দাতা ম্যানেজমেন্ট' },
  { to: '/reports', label: 'রিপোর্ট' },
];

export default function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

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
            <div style={{ fontSize: 14, fontWeight: 700, color: '#166534', lineHeight: 1.1 }}>
              ময়দানে মুহাম্মাদ
            </div>
            <div style={{ fontSize: 10, color: '#16a34a', letterSpacing: '0.3px' }}>
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
                fontSize: 14,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            {user?.name && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', lineHeight: 1.2 }}>
                  {user.name}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.2 }}>অ্যাডমিন</div>
              </div>
            )}
          </div>

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
              fontSize: 13,
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