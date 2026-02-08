// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserDto {
  id: string;
  fullName: string;
  role: string;
  profilePictureUrl?: string;
  isFirstLogin: boolean;
  email:string;
}

interface AuthState {
  user: UserDto | null;
  token: string | null;
  setUser: (user: UserDto) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);