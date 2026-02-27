import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useAuthStore } from '@/store/authStore';
import type { User, LoginData, RegisterData } from '@/types/auth';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isRestoring: boolean;
  error: string | null;
  login: (data: LoginData, rememberMe?: boolean) => Promise<string | null>;
  register: (data: RegisterData, files: FormData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const store = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  // Restore session exactly once on mount — prevents flicker
  useEffect(() => {
    store.restoreSession();
    setInitialized(true);
  }, []);

  const login = useCallback(
    (data: LoginData, rememberMe = false) => store.login(data, rememberMe),
    []
  );

  const register = useCallback(
    (data: RegisterData, files: FormData) => store.register(data, files),
    []
  );

  const logout = useCallback(() => store.logout(), []);
  const clearError = useCallback(() => store.clearError(), []);
  const updateUser = useCallback(
    (userData: Partial<User>) => store.updateUser(userData),
    []
  );

  // Block rendering until restoreSession has run
  if (!initialized || store.isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user: store.user,
        token: store.token,
        isLoading: store.isLoading,
        isRestoring: store.isRestoring,
        error: store.error,
        login,
        register,
        logout,
        clearError,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
