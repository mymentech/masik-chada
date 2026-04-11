import { AUTH_TOKEN_KEY, handleUnauthenticatedAuthError } from './apolloClient';

describe('apollo auth error handling', () => {
  it('removes token and redirects to /login when session expires', () => {
    const storage = {
      removeItem: vi.fn(),
    };
    const location = {
      pathname: '/dashboard',
      assign: vi.fn(),
    };

    handleUnauthenticatedAuthError(storage, location);

    expect(storage.removeItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
    expect(location.assign).toHaveBeenCalledWith('/login');
  });

  it('removes token without redirect loop when already on /login', () => {
    const storage = {
      removeItem: vi.fn(),
    };
    const location = {
      pathname: '/login',
      assign: vi.fn(),
    };

    handleUnauthenticatedAuthError(storage, location);

    expect(storage.removeItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
    expect(location.assign).not.toHaveBeenCalled();
  });
});
