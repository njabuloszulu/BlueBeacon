import { AuthProvider, useAuth } from './AuthContext';

export function AppProvider({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

/** @deprecated Prefer useAuth — kept for Sidebar / Layout compatibility */
export function useApp() {
  const auth = useAuth();
  return {
    role: auth.role,
    user: auth.profile,
    token: auth.token,
    login: auth.login,
    logout: auth.logout,
    register: auth.register,
    rawUser: auth.rawUser,
    isAuthenticated: auth.isAuthenticated,
  };
}
