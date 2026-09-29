/**
 * Authentication state management using Zustand.
 * Provides auth context for protected routes.
 */

import { createContext, useContext, useEffect } from 'react';
import { create } from 'zustand';

/** React context for auth state (isAuthenticated flag). */
const AuthContext = createContext(null);

/**
 * Zustand store for authentication.
 *
 * State:
 *   - token: JWT access token (stored in memory)
 *   - user: Current user profile object
 *   - isAuthenticated: Boolean flag
 *
 * Actions:
 *   - setAuth(token, user): Log in
 *   - logout(): Clear state
 */
const useAuthStore = create((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  /**
   * Set authentication token and user data.
   * @param {string} token - JWT access token.
   * @param {Object} user - User profile object.
   */
  setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
  /** Clear authentication state (log out). */
  logout: () => set({ token: null, user: null, isAuthenticated: false }),
}));

/**
 * React provider that exposes isAuthenticated to the component tree.
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Child components.
 */
export function AuthProvider({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication state.
 * Must be used within AuthProvider.
 *
 * @returns {{ isAuthenticated: boolean }}
 * @throws {Error} If used outside AuthProvider.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { useAuthStore };
