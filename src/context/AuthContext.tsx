import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '../types';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // LOGIN
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials);

      // Extract token and user from nested data
      const newToken = response?.data?.data?.token;
      const newUser = response?.data?.data?.user;

      if (!newToken) {
        console.error('TOKEN MISSING IN RESPONSE:', response);
        throw new Error('Login failed: Token not received');
      }

      setToken(newToken);
      setUser(newUser || null);

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      throw error;
    }
  };

  // REGISTER
  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await authApi.register(credentials);

      // Extract token and user from nested data
      const newToken = response?.data?.data?.token;
      const newUser = response?.data?.data?.user;

      if (!newToken) {
        console.error('TOKEN MISSING IN RESPONSE:', response);
        throw new Error('Registration failed: Token not received');
      }

      setToken(newToken);
      setUser(newUser || null);

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      throw error;
    }
  };

  // LOGOUT
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
