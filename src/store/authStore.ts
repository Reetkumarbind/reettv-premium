import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  clearError: () => void;
}

const guestUser: User = {
  id: 'local-guest',
  email: 'guest@reet.tv',
  username: 'Guest User',
  created_at: new Date(0).toISOString(),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: guestUser,
      session: null,
      isLoading: false,
      isAuthenticated: true,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: guestUser, session: null, isAuthenticated: true, error: null }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);
