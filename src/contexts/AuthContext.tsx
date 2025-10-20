import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginUser, registerUser, logoutUser } from '../lib/api';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  user_id: number;
  name: string;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: DecodedToken | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing token on initial load
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
        } else {
          // Token expired, remove it
          localStorage.removeItem('token');
        }
      } catch (error) {
        // Invalid token, remove it
        localStorage.removeItem('token');
        console.error('Invalid token:', error);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await loginUser(email, password);
      const decoded = jwtDecode<DecodedToken>(response.token);
      setUser(decoded);
      return { error: null };
    } catch (error: any) {
      setUser(null);
      return { error: error.response?.data?.message || 'Login failed' };
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      await registerUser(name, email, password);
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const signOut = () => {
    logoutUser();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}