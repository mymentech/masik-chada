import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

export const AUTH_TOKEN_KEY = 'auth_token';

const httpLink = new HttpLink({
  uri: '/graphql'
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  };
});

export function handleUnauthenticatedAuthError(
  storage = window.localStorage,
  location = window.location,
) {
  storage.removeItem(AUTH_TOKEN_KEY);
  if (location.pathname !== '/login') {
    location.assign('/login');
  }
}

export const errorLink = onError(({ graphQLErrors, networkError }) => {
  const isUnauthenticated =
    graphQLErrors?.some((error) => error.extensions?.code === 'UNAUTHENTICATED') ||
    networkError?.statusCode === 401;

  if (isUnauthenticated) {
    handleUnauthenticatedAuthError();
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  devtools: {
    enabled: import.meta.env.DEV
  }
});
