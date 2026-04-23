import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import PrivateRoute from './components/PrivateRoute';
import { useIsMobile } from './context/MobileContext';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Donations = lazy(() => import('./pages/Donations'));
const Donors = lazy(() => import('./pages/Donors'));
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Reports = lazy(() => import('./pages/Reports'));

function RouteFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
      <p style={{ color: '#9ca3af', fontSize: 14 }}>পৃষ্ঠা লোড হচ্ছে...</p>
    </div>
  );
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
        <Route element={<PrivateRoute />}>
          <Route path="/*" element={<AppLayout />} />
        </Route>
      </Routes>
    </Suspense>
  );
}