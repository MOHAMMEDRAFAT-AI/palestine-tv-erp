import { create } from 'zustand';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { employee_number?: string; email?: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (credentials) => {
    const response = await api.login(credentials);
    const { user, token } = response.data.data;
    localStorage.setItem('ptv_token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('ptv_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = localStorage.getItem('ptv_token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const response = await api.getMe();
      set({ user: response.data.data, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('ptv_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
}));
