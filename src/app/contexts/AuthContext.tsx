import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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

  const login = async (email: string, password: string) => {
    // Mock authentication - in production, this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Demo users for different roles
    if (email === 'user@spkt.id') {
      setUser({
        id: '1',
        name: 'Budi Santoso',
        email: 'user@spkt.id',
        role: 'user',
        nik: '3201012345678901',
        phone: '081234567890'
      });
    } else if (email === 'petugas@spkt.id') {
      setUser({
        id: '2',
        name: 'Ipda. Ahmad Wijaya',
        email: 'petugas@spkt.id',
        role: 'petugas'
      });
    } else if (email === 'admin@spkt.id') {
      setUser({
        id: '3',
        name: 'Kompol. Sarah Putri',
        email: 'admin@spkt.id',
        role: 'admin'
      });
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
