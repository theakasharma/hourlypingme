'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { fetchCurrentUser, removeToken, setToken } from '@/lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: try to restore session from stored JWT
  useEffect(() => {
    fetchCurrentUser()
      .then((u) => setUser(u))
      .finally(() => setLoading(false));
  }, []);

  function login(token, userData) {
    setToken(token);
    setUser(userData);
  }

  function logout() {
    removeToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
