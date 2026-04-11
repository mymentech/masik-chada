import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';

export function useLogin() {
  const { login } = useAuth();

  const [runLogin, state] = useMutation(LOGIN_MUTATION, {
    onCompleted: (result) => {
      const token = result?.login?.token;
      if (token) {
        login(token);
      }
    }
  });

  return {
    ...state,
    login: ({ email, password }) =>
      runLogin({
        variables: { email, password }
      })
  };
}
