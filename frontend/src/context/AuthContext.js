import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper: persist both token and user (without leaking sensitive stuff)
  const persistSession = (user, token) => {
    if (token) localStorage.setItem('token', token);
    // (Optional) also persist user profile if you like:
    localStorage.setItem('user', JSON.stringify({ ...user, token }));
    setCurrentUser({ ...user, token });
  };

  // Helper: clear session
  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('AuthContext - Token exists:', !!token);

        if (!token) {
          console.log('AuthContext - No token found, user not authenticated');
          clearSession();
          return;
        }

        console.log('AuthContext - Fetching current user data');
        // This endpoint typically returns user profile only (no token)
        const apiUser = await authService.fetchCurrentUser(); // expect { _id, email, role, ... }

        // Merge token into the user object we keep in memory
        console.log('AuthContext - User data received:', apiUser);
        persistSession(apiUser, token);
      } catch (error) {
        console.error('AuthContext - Error fetching user from API:', error);

        // Fallback: try localStorage user (from prior successful session)
        const storedToken = localStorage.getItem('token');
        const storedUserRaw = localStorage.getItem('user');
        if (storedToken && storedUserRaw) {
          try {
            const storedUser = JSON.parse(storedUserRaw);
            // Ensure token is present (in case older data lacked it)
            persistSession(storedUser, storedToken);
          } catch {
            clearSession();
          }
        } else {
          clearSession();
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login
  const login = async (email, password, isAdmin = false) => {
    const data = await authService.login(email, password, isAdmin);
    // Expecting data like: { user: {...}, token: '...' } or { ...userFields, token }
    const token = data.token || data?.data?.token;
    const user  = data.user  || data?.data?.user || data; // support different shapes
    persistSession(user, token);
    return { user, token };
  };

  // Register (individual)
  const registerIndividual = async (userData) => {
    const data = await authService.registerIndividual(userData);
    const token = data.token || data?.data?.token;
    const user  = data.user  || data?.data?.user || data;
    persistSession(user, token);
    return { user, token };
  };

  // Register (corporate)
  const registerCorporate = async (userData) => {
    const data = await authService.registerCorporate(userData);
    const token = data.token || data?.data?.token;
    const user  = data.user  || data?.data?.user || data;
    persistSession(user, token);
    return { user, token };
  };

  const logout = () => {
    try { authService.logout?.(); } catch {}
    clearSession();
    navigate('/');
  };

  // Refresh user profile from API, preserve token
  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      clearSession();
      throw new Error('No token');
    }
    const apiUser = await authService.fetchCurrentUser();
    persistSession(apiUser, token);
    return { ...apiUser, token };
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser?.token,
    login,
    registerIndividual,
    registerCorporate,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
