import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from API or localStorage on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is authenticated first
        const token = localStorage.getItem('token');
        console.log('AuthContext - Token exists:', !!token);
        if (token) {
          // Only try to get user data from API if we have a token
          console.log('AuthContext - Fetching current user data');
          const user = await authService.fetchCurrentUser();
          console.log('AuthContext - User data received:', user);
          setCurrentUser(user);
        } else {
          // No token, so user is not authenticated
          console.log('AuthContext - No token found, user not authenticated');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('AuthContext - Error fetching user from API:', error);
        // Fall back to localStorage if API call fails
        console.log('AuthContext - Falling back to localStorage');
        const user = authService.getCurrentUser();
        console.log('AuthContext - User from localStorage:', user);
        setCurrentUser(user);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password, isAdmin = false) => {
    try {
      const data = await authService.login(email, password, isAdmin);
      setCurrentUser(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Register individual function
  const registerIndividual = async (userData) => {
    try {
      const data = await authService.registerIndividual(userData);
      setCurrentUser(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Register corporate function
  const registerCorporate = async (userData) => {
    try {
      const data = await authService.registerCorporate(userData);
      setCurrentUser(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    navigate('/');
  };

  // Refresh user data from API
  const refreshUser = async () => {
    try {
      const userData = await authService.fetchCurrentUser();
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  };

  // Value object that will be passed to any consuming components
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    registerIndividual,
    registerCorporate,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};