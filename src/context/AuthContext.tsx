import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '../types';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
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
  const [loading, setLoading] = useState(true);

  const persistUser = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
    setUser(userData);
  };

  const deriveUser = (
    credentials: Partial<RegisterCredentials> & LoginCredentials,
    apiUser?: User
  ): User => {
    const email = apiUser?.email || credentials.email;
    const nameFromEmail = email ? email.split('@')[0] : "guest";
  
    const baseUsername =
      apiUser?.username ||
      apiUser?.name ||
      credentials.name ||
      nameFromEmail; //  
  
    return {
      id: apiUser?.id,
      username: baseUsername,
      name: apiUser?.name || credentials.name || baseUsername,
      email,
    };
  };

  // Load login state on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const loggedIn = localStorage.getItem('isLoggedIn');

    if (loggedIn === 'true' && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse stored user', err);
      }
    }

    setLoading(false);
  }, []);

  // LOGIN WITHOUT TOKEN
  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    console.log("API Login Response:", response);

    const success = response?.success ?? (response as any)?.data?.success;

    if (success) {
      const mappedUser = deriveUser(credentials, response.user);
      persistUser(mappedUser);
    } else {
      throw new Error('Login failed');
    }
  };

  // REGISTER WITHOUT TOKEN
  const register = async (credentials: RegisterCredentials) => {
    const response = await authApi.register(credentials);

    const success = response?.success ?? (response as any)?.data?.success;

    if (success) {
      const mappedUser = deriveUser(credentials, response.user);
      persistUser(mappedUser);
    } else {
      throw new Error('Registration failed');
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: user !== null,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
