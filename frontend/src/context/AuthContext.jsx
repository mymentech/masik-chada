import { createContext, useContext, useMemo, useState } from 'react';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login: (nextToken, userData) => {
        localStorage.setItem(TOKEN_KEY, nextToken);
        setToken(nextToken);
        if (userData) {
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
          setUser(userData);
        }
      },
      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}