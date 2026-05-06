import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, rawApi, setAccessToken } from '../services/api';

const AuthContext = createContext(null);

function profileFromUser(user) {
  if (!user) return null;
  const name = user.fullName || 'User';
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return {
    name,
    id: user.id?.slice(0, 8) ?? '—',
    avatar: initials || '?',
    role: user.role,
    station: user.stationId,
    court: user.court,
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const role = user?.role ?? null;

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await rawApi.post('/auth/refresh');
      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        setToken(data.accessToken);
        return data.accessToken;
      }
    } catch {
      setAccessToken(null);
      setToken(null);
      setUser(null);
    }
    return null;
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void refreshSession();
    }, 0);
    return () => window.clearTimeout(t);
  }, [refreshSession]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const access = data.accessToken;
    setAccessToken(access);
    setToken(access);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await rawApi.post('/auth/logout');
    } catch {
      /* ignore */
    }
    setAccessToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      /** Same as `user` — API user object with id, fullName, role, … */
      rawUser: user,
      role,
      profile: profileFromUser(user),
      login,
      register,
      logout,
      refreshSession,
      isAuthenticated: Boolean(token && user),
    }),
    [token, user, role, login, register, logout, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
