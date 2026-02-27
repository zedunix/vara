import { create } from 'zustand';
import api from '@/utils/api';
import type { User, LoginData, RegisterData, AuthResponse } from '@/types/auth';

const SESSION_KEY = 'vara_session';
const REMEMBER_KEY = 'vara_remember_me';

interface StoredSession {
  user: User;
  token: string;
}

function persistSession(user: User, token: string, rememberMe: boolean): void {
  const session: StoredSession = { user, token };
  if (rememberMe) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(REMEMBER_KEY, 'true');
    sessionStorage.removeItem(SESSION_KEY);
  } else {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.removeItem(SESSION_KEY);
    localStorage.setItem(REMEMBER_KEY, 'false');
  }
  // Always keep token in localStorage for the Axios interceptor
  localStorage.setItem('token', token);
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(REMEMBER_KEY);
  localStorage.removeItem('token');
  sessionStorage.removeItem(SESSION_KEY);
}

function readSession(): StoredSession | null {
  try {
    const fromLocal = localStorage.getItem(SESSION_KEY);
    if (fromLocal) return JSON.parse(fromLocal) as StoredSession;
    const fromSession = sessionStorage.getItem(SESSION_KEY);
    if (fromSession) return JSON.parse(fromSession) as StoredSession;
  } catch {
    clearSession();
  }
  return null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isRestoring: boolean;
  error: string | null;
  redirectUrl: string | null;
  login: (data: LoginData, rememberMe?: boolean) => Promise<string | null>;
  register: (data: RegisterData, files: FormData) => Promise<void>;
  logout: () => void;
  restoreSession: () => void;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isRestoring: true,
  error: null,
  redirectUrl: null,

  restoreSession: () => {
    const stored = readSession();
    if (stored) {
      localStorage.setItem('token', stored.token);
      set({ user: stored.user, token: stored.token, isRestoring: false });
    } else {
      set({ isRestoring: false });
    }
  },

  login: async (data: LoginData, rememberMe = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      const { user, token } = response.data.data!;
      const redirectUrl = response.data.redirectUrl || '/dashboard';

      persistSession(user, token, rememberMe);
      set({ user, token, isLoading: false, redirectUrl });
      return redirectUrl;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterData, files: FormData) => {
    set({ isLoading: true, error: null });
    try {
      Object.entries(data).forEach(([key, value]) => {
        if (value) files.append(key, value);
      });

      const response = await api.post<AuthResponse>('/auth/register', files, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { user, token } = response.data.data!;
      persistSession(user, token, false);
      set({ user, token, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    clearSession();
    set({ user: null, token: null, redirectUrl: null });
  },

  clearError: () => set({ error: null }),

  updateUser: (userData: Partial<User>) => {
    set((state) => {
      if (!state.user) return {};
      const updated = { ...state.user, ...userData };
      // Keep stored session in sync
      const remember = localStorage.getItem(REMEMBER_KEY) === 'true';
      if (state.token) persistSession(updated, state.token, remember);
      return { user: updated };
    });
  },
}));
