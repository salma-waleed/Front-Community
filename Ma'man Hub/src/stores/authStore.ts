import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'student' | 'parent' | 'content_creator' | 'specialist' | 'admin';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  isLoading: boolean;
  rememberMe: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setRole: (role: UserRole | null) => void;
  setIsLoading: (loading: boolean) => void;
  setRememberMe: (remember: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      role: null,
      isLoading: true,
      rememberMe: false,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setRole: (role) => set({ role }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setRememberMe: (rememberMe) => set({ rememberMe }),
      logout: () => set({ user: null, session: null, role: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ rememberMe: state.rememberMe }),
    }
  )
);
