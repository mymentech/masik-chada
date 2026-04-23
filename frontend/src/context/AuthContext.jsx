import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { gql, useApolloClient } from '@apollo/client';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const ME_QUERY = gql`
  query MeForAuthBootstrap {
    me {
      id
      name
      email
      phone
      role
    }
  }
`;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const apolloClient = useApolloClient();
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!token) return;

    // Keep role/profile in sync with backend so admin visibility is reliable
    // even when this browser has an old cached auth_user object.
    let cancelled = false;
    apolloClient
      .query({ query: ME_QUERY, fetchPolicy: 'network-only' })
      .then((res) => {
        if (cancelled) return;
        const me = res?.data?.me;
        if (!me) return;
        localStorage.setItem(USER_KEY, JSON.stringify(me));
        setUser(me);
      })
      .catch(() => {
        // Keep current session state; route guards will handle unauthorized access.
      });

    return () => {
      cancelled = true;
    };
  }, [token, apolloClient]);

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
