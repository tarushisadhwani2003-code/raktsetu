import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

/** { user, loading, isAuthenticated, login, register, logout, refreshUser, setUser } */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
