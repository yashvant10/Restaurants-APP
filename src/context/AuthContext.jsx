import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

// Create the context
const AuthContext = createContext(null);

// Custom hook to consume the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('velocitibites_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('velocitibites_token') || null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!user && !!token);
  const [isLoading, setIsLoading] = useState(false);

  // Sync auth state when user or token changes
  useEffect(() => {
    setIsAuthenticated(!!user && !!token);
  }, [user, token]);

  // Login handler — calls POST /api/auth/login
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token: jwtToken, user: userData } = response.data;

      // Persist session
      localStorage.setItem('velocitibites_token', jwtToken);
      localStorage.setItem('velocitibites_user', JSON.stringify(userData));

      setToken(jwtToken);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register handler — calls POST /api/auth/register
  const register = useCallback(async (fullName, email, password, role) => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/register', {
        full_name: fullName,
        email,
        password,
        role,
      });
      const { token: jwtToken, user: userData } = response.data;

      // Persist session
      localStorage.setItem('velocitibites_token', jwtToken);
      localStorage.setItem('velocitibites_user', JSON.stringify(userData));

      setToken(jwtToken);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed. Please try again.';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('velocitibites_user');
    localStorage.removeItem('velocitibites_token');
    localStorage.removeItem('velocitibites_cart');
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
