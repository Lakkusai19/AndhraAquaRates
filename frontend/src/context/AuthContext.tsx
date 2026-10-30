import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<User>;
  register: (data: any) => Promise<User>;
  setAuthSession: (user: User, access: string, refresh: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isBuyer: boolean;
  isAdmin: boolean;
  hasActiveSubscription: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('ashp_access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem('ashp_access_token');
      localStorage.removeItem('ashp_refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const setAuthSession = (userData: User, access: string, refresh: string) => {
    localStorage.setItem('ashp_access_token', access);
    localStorage.setItem('ashp_refresh_token', refresh);
    setUser(userData);
  };

  const login = async (credentials: any): Promise<User> => {
    const res = await authApi.login(credentials);
    setAuthSession(res.data.user, res.data.access, res.data.refresh);
    return res.data.user;
  };

  const register = async (data: any): Promise<User> => {
    const res = await authApi.register(data);
    setAuthSession(res.data.user, res.data.access, res.data.refresh);
    return res.data.user;
  };

  const logout = () => {
    const refresh = localStorage.getItem('ashp_refresh_token');
    if (refresh) {
      authApi.logout(refresh).catch(() => {});
    }
    localStorage.removeItem('ashp_access_token');
    localStorage.removeItem('ashp_refresh_token');
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isBuyer = user?.role === 'BUYER';
  const isAdmin = user?.role === 'ADMIN';
  const hasActiveSubscription = !!user?.has_active_subscription;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        setAuthSession,
        logout,
        refreshUser,
        isAuthenticated,
        isBuyer,
        isAdmin,
        hasActiveSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
