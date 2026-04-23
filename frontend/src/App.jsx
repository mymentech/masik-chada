import { Suspense, lazy } from 'react';
import { useQuery } from '@apollo/client';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import PrivateRoute from './components/PrivateRoute';
import { useIsMobile } from './context/MobileContext';
import { useAuth } from './context/AuthContext';
import { ME_QUERY } from './graphql/queries';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Donations = lazy(() => import('./pages/Donations'));
const Donors = lazy(() => import('./pages/Donors'));
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Reports = lazy(() => import('./pages/Reports'));
const Profile = lazy(() => import('./pages/Profile'));
const Users = lazy(() => import('./pages/Users'));
const Settings = lazy(() => import('./pages/Settings'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

function RouteFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
      <p style={{ color: '#9ca3af', fontSize: 18 }}>পৃষ্ঠা লোড হচ্ছে...</p>
    </div>
  );
}

function AdminOnly({ children }) {
  const { user, isAuthenticated } = useAuth();
  const { data, loading } = useQuery(ME_QUERY, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const role = data?.me?.role || user?.role;
  const isAdmin = String(role || '').toLowerCase() === 'admin';

  if (loading && !role) {
    return <RouteFallback />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppLayout() {
  const isMobile = useIsMobile();

  return (
    <>
      {!isMobile && <Navbar />}
      <main className="page-main">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/donors" element={<Donors />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users" element={<AdminOnly><Users /></AdminOnly>} />
            <Route path="/settings" element={<AdminOnly><Settings /></AdminOnly>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </main>
      {isMobile && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<PrivateRoute />}>
          <Route path="/*" element={<AppLayout />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
