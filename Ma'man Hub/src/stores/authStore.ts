import { create } from 'zustand';

export interface UserDto {
  id: string;
  fullName: string;
  role: string;
  profilePictureUrl?: string;
  isFirstLogin: boolean;
  email: string;
}

interface AuthState {
  user: UserDto | null;
  token: string | null;
  setUser: (user: UserDto) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

const loadUser = (): UserDto | null => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const loadToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const useAuthStore = create<AuthState>()((set) => ({
  user:     loadUser(),
  token:    loadToken(),
  setUser:  (user)  => { localStorage.setItem('user', JSON.stringify(user)); set({ user }); },
  setToken: (token) => { localStorage.setItem('access_token', token); set({ token }); },
  logout:   () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, token: null });
  },
}));