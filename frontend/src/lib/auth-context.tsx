'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from './types';
import { apiClient } from './api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<User>;
  logout: (redirectTo?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { useRouter, usePathname } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    try {
      if (!apiClient.getAccessToken()) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const res = await apiClient.get<User>('/auth/me');
      setUser(res.data);
    } catch {
      setUser(null);
      apiClient.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    apiClient.onUnauthorized = () => {
      setUser(null);
      if (typeof window !== 'undefined' && !pathname?.startsWith('/auth/')) {
        router.push('/auth/login');
      }
    };
  }, [router, pathname]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await apiClient.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>(
      '/auth/login',
      { email, password },
    );
    apiClient.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data: { email: string; password: string; fullName: string; phone?: string }): Promise<User> => {
    const res = await apiClient.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>(
      '/auth/register',
      data,
    );
    apiClient.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async (redirectTo: string = '/auth/login') => {
    try {
      if (apiClient.getAccessToken()) {
        await Promise.race([
          apiClient.post('/auth/logout'),
          new Promise((resolve) => setTimeout(resolve, 800)),
        ]);
      }
    } catch {
      // Ignore logout upstream errors
    } finally {
      apiClient.clearTokens();
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
