import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface RegisterParams {
  name: string;
  email: string;
  password: string;
  role?: string;
  homeCurrency?: string;
  avatar_url?: string;
  country?: string;
  phone_code?: string;
  phone_number?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (params: RegisterParams) => Promise<{ success: boolean; requiresVerification?: boolean; email?: string }>;
  verifySignupOtp: (email: string, otpCode: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('globetrotter_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  const fetchCurrentUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.auth.getProfile();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('globetrotter_token', res.token);
        setToken(res.token);
        setUser(res.user);
        success(`Welcome back, ${res.user.name}`, 'Successfully logged into your travel space.');
        return res.user;
      }
      return null;
    } catch (err: any) {
      error('Login Failed', err.message || 'Invalid email or password');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (params: RegisterParams): Promise<{ success: boolean; requiresVerification?: boolean; email?: string }> => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(params);
      if (res.success) {
        if (res.requiresVerification) {
          success('Verification Code Dispatched', 'A 6-digit code has been delivered to your email inbox.');
          return { success: true, requiresVerification: true, email: res.email || params.email };
        } else if (res.token && res.user) {
          localStorage.setItem('globetrotter_token', res.token);
          setToken(res.token);
          setUser(res.user);
          success('Account Created', 'Welcome to GlobeTrotter!');
          return { success: true, requiresVerification: false };
        }
      }
      return { success: false };
    } catch (err: any) {
      error('Registration Failed', err.message || 'Unable to create account');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const verifySignupOtp = async (email: string, otpCode: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.auth.verifyEmailOtp({ email, otpCode });
      if (res.success && res.token) {
        localStorage.setItem('globetrotter_token', res.token);
        setToken(res.token);
        setUser(res.user);
        success('Account Verified', 'Your email has been confirmed. Welcome aboard!');
        return true;
      }
      return false;
    } catch (err: any) {
      error('Verification Failed', err.message || 'Invalid or expired code.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('globetrotter_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      const res = await api.auth.updateProfile(data);
      if (res.success) {
        await refreshProfile();
        success('Profile Updated', 'Your travel preferences and bio have been saved.');
        return true;
      }
      return false;
    } catch (err: any) {
      error('Update Failed', err.message || 'Could not update profile');
      return false;
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await api.auth.getProfile();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Refresh profile error:', err);
    }
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(user && user.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        verifySignupOtp,
        logout,
        updateProfile,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
