import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import PrivateRoute from './PrivateRoute';

function renderPrivateRoute(initialEntries = ['/dashboard']) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<h1>Private Dashboard</h1>} />
          </Route>
          <Route path="/login" element={<h1>Login Page</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('PrivateRoute', () => {
  it('redirects unauthenticated users to /login', async () => {
    localStorage.removeItem('auth_token');
    renderPrivateRoute();

    expect(await screen.findByRole('heading', { name: 'Login Page' })).toBeInTheDocument();
  });

  it('allows authenticated users to access protected route', async () => {
    localStorage.setItem('auth_token', 'valid-token');
    renderPrivateRoute();

    expect(await screen.findByRole('heading', { name: 'Private Dashboard' })).toBeInTheDocument();
  });
});
