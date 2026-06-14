'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { spktApi } from '@/lib/spktApi';

export type UserRole = 'user' | 'petugas' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  nik?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    spktApi
      .getSession()
      .then(({ user: sessionUser }) => {
        if (sessionUser) {
          setUser({
            id: sessionUser.id,
            name: sessionUser.name,
            email: sessionUser.email,
            role: sessionUser.role,
            nik: sessionUser.nik,
            phone: sessionUser.phone,
          });
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { user: dbUser } = await spktApi.login(email, password);
    setUser({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      nik: dbUser.nik,
      phone: dbUser.phone,
    });
  };

  const logout = async () => {
    await spktApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
