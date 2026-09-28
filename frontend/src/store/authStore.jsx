import { createContext, useContext, useEffect } from 'react';
import { create } from 'zustand';

const AuthContext = createContext(null);

const useAuthStore = create((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
  logout: () => set({ token: null, user: null, isAuthenticated: false }),
}));

export function AuthProvider({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { useAuthStore };
