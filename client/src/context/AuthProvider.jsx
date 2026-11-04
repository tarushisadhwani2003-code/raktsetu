import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { AuthContext } from './auth-context';

export default function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: true });

  const setUser = useCallback((user) => setState({ user, loading: false }), []);

  // Restore the session on page load.
  useEffect(() => {
    let active = true;
    api
      .get('/auth/me')
      .then(({ data }) => active && setUser(data.user))
      .catch(() => active && setUser(null));
    return () => {
      active = false;
    };
  }, [setUser]);

  // If the session expires while the app is open, sign the user out locally.
  useEffect(() => {
    const interceptor = api.interceptors.response.use(undefined, (error) => {
      const url = error?.config?.url ?? '';
      if (error?.response?.status === 401 && !url.startsWith('/auth/')) {
        setState((previous) => (previous.user ? { user: null, loading: false } : previous));
      }
      return Promise.reject(error);
    });
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const login = useCallback(
    async (identifier, password) => {
      const { data } = await api.post('/auth/login', { identifier, password });
      setUser(data.user);
      return data.user;
    },
    [setUser],
  );

  const register = useCallback(
    async (payload) => {
      const { data } = await api.post('/auth/register', payload);
      setUser(data.user);
      return data.user;
    },
    [setUser],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  }, [setUser]);

  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/auth/me');
    setUser(data.user);
    return data.user;
  }, [setUser]);

  const value = useMemo(
    () => ({
      user: state.user,
      loading: state.loading,
      isAuthenticated: Boolean(state.user),
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [state, login, register, logout, refreshUser, setUser],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
