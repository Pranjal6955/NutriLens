import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import * as authApi from '../services/auth';

interface AuthContextValue {
  user: authApi.AuthUser | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<authApi.AuthUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>(
    'loading',
  );

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const me = await authApi.fetchCurrentUser();
        setUser(me);
        setStatus('authenticated');
      } catch (_err) {
        setUser(null);
        setStatus('unauthenticated');
      }
    };

    bootstrap();
  }, []);

  const handleLogin = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setUser(response.user);
    setStatus('authenticated');
  }, []);

  const handleSignup = useCallback(async (name: string, email: string, password: string) => {
    await authApi.register({ name, email, password });
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login: handleLogin, signup: handleSignup, logout: handleLogout }),
    [user, status, handleLogin, handleSignup, handleLogout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
