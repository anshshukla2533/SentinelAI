import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiRequest } from './api';

export type AuthUser = {
  id: string;
  email: string;
  registration_token: string;
  created_at?: string;
};

type Credentials = {
  email: string;
  password: string;
};

type AuthResponse = {
  access_token: string;
  user: AuthUser;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  status: 'loading' | 'authenticated' | 'anonymous';
  getToken: () => Promise<string | null>;
  signIn: (credentials: Credentials) => Promise<void>;
  signUp: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
};

const SESSION_TOKEN_KEY = 'sentinel_access_token';
const AuthContext = createContext<AuthContextValue | null>(null);

function readToken() {
  return window.localStorage.getItem(SESSION_TOKEN_KEY);
}

function saveSession(response: AuthResponse) {
  window.localStorage.setItem(SESSION_TOKEN_KEY, response.access_token);
  return response.user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const getToken = useCallback(async () => readToken(), []);

  const loadSession = useCallback(async () => {
    const token = readToken();
    if (!token) {
      setIsLoaded(true);
      return;
    }

    try {
      const sessionUser = await apiRequest<AuthUser>('/me', { authToken: token });
      setUser(sessionUser);
    } catch {
      window.localStorage.removeItem(SESSION_TOKEN_KEY);
      setUser(null);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const signIn = useCallback(async (credentials: Credentials) => {
    const response = await apiRequest<AuthResponse>('/auth/login', { method: 'POST', json: credentials });
    setUser(saveSession(response));
  }, []);

  const signUp = useCallback(async (credentials: Credentials) => {
    const response = await apiRequest<AuthResponse>('/auth/signup', { method: 'POST', json: credentials });
    setUser(saveSession(response));
  }, []);

  const logout = useCallback(async () => {
    const token = readToken();
    try {
      await apiRequest('/auth/logout', { method: 'POST', authToken: token });
    } finally {
      window.localStorage.removeItem(SESSION_TOKEN_KEY);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await loadSession();
    return user;
  }, [loadSession, user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoaded,
    isSignedIn: Boolean(user),
    status: !isLoaded ? 'loading' : user ? 'authenticated' : 'anonymous',
    getToken,
    signIn,
    signUp,
    logout,
    refreshUser,
  }), [getToken, isLoaded, logout, refreshUser, signIn, signUp, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
