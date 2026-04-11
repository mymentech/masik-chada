import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'ড্যাশবোর্ড' },
  { to: '/donations', label: 'দান সংগ্রহ' },
  { to: '/donors', label: 'ডোনার' },
  { to: '/reports', label: 'রিপোর্ট' }
];

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link to="/dashboard" className="brand">
          মাসিক চাঁদা
        </Link>

        <nav className="nav-links" aria-label="মেইন নেভিগেশন">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="logout-btn"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
        >
          <LogOut size={16} />
          <span>লগআউট</span>
        </button>
      </div>
    </header>
  );
}
