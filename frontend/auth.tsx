import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from './api';

export type AuthUser = {
  id: number;
  email: string;
  registration_token: string;
  created_at?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  status: 'loading' | 'authenticated' | 'anonymous';
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthContextValue['status']>('loading');

  async function refreshUser() {
    try {
      const currentUser = await apiRequest<AuthUser>('/me');
      setUser(currentUser);
      setStatus('authenticated');
      return currentUser;
    } catch {
      setUser(null);
      setStatus('anonymous');
      return null;
    }
  }

  useEffect(() => {
    void refreshUser();
  }, []);

  async function login(email: string, password: string) {
    const result = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      json: { email, password },
    });
    setUser(result.user);
    setStatus('authenticated');
    return result.user;
  }

  async function signup(email: string, password: string) {
    const result = await apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      json: { email, password },
    });
    setUser(result.user);
    setStatus('authenticated');
    return result.user;
  }

  async function logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setStatus('anonymous');
    }
  }

  return (
    <AuthContext.Provider value={{ user, status, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
