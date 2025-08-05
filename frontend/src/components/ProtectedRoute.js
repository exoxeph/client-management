import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

/**
 * ProtectedRoute component that checks if user is authenticated
 * If authenticated, renders the child components
 * If not authenticated, redirects to login page
 */
export const ProtectedRoute = ({ adminOnly = false }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const location = useLocation();
  
  // Store the current path to redirect back after login
  const currentPath = location.pathname + location.search;
  
  useEffect(() => {
    console.log('ProtectedRoute - Current path:', currentPath);
    
    const verifyUser = async () => {
      console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
      console.log('ProtectedRoute - currentUser:', currentUser);
      
      if (isAuthenticated) {
        try {
          // Get fresh user data from API
          console.log('ProtectedRoute - Fetching current user data');
          const userData = await authService.fetchCurrentUser();
          console.log('ProtectedRoute - User data received:', userData);
          
          if (userData) {
            setVerifiedUser(userData);
          } else {
            // If API returns null but we have token, use local storage data
            console.log('ProtectedRoute - API returned null, using local storage data');
            setVerifiedUser(currentUser);
          }
        } catch (error) {
          console.error('ProtectedRoute - Error fetching current user:', error);
          
          // Only clear auth if it's a 401 error
          if (error.response && error.response.status === 401) {
            console.log('ProtectedRoute - 401 Unauthorized, clearing auth');
            // Let the auth context handle the logout
            // Don't redirect here, we'll do it below
          } else {
            // For other errors, fall back to local storage data
            console.log('ProtectedRoute - Falling back to local storage data');
            setVerifiedUser(currentUser);
          }
        } finally {
          setLoading(false);
        }
      } else {
        console.log('ProtectedRoute - User not authenticated');
        setLoading(false);
      }
    };
    
    verifyUser();
  }, [isAuthenticated, currentUser, currentPath]);
  
  // Show loading state
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // If not authenticated and not loading, redirect to login with return URL
  if (!isAuthenticated && !loading) {
    console.log('ProtectedRoute - Redirecting to login with return URL:', currentPath);
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(currentPath)}`} replace />;
  }
  
  // If still loading, don't redirect yet
  if (loading) {
    console.log('ProtectedRoute - Still loading, not redirecting yet');
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // If adminOnly is true and user is not admin, redirect to home
  if (adminOnly && (!verifiedUser || verifiedUser.role !== 'admin')) {
    console.log('ProtectedRoute - User is not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  // If authenticated and passes role check, render the protected route
  console.log('ProtectedRoute - User is authenticated, rendering protected route');
  return <Outlet />;
};