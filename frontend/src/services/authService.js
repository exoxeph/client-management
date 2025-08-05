/**
 * Auth Service
 * This file contains methods for making authentication API calls to the backend
 */

import axios from 'axios';

// Create axios instance with base URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
const authService = {
  // Register individual user
  registerIndividual: async (userData) => {
    const response = await api.post('/auth/register/individual', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  
  // Register corporate user
  registerCorporate: async (userData) => {
    // For corporate registration with file uploads, we need to use FormData
    const formData = new FormData();
    
    // Add all text fields to formData
    Object.keys(userData).forEach(key => {
      if (key !== 'businessLicense' && key !== 'taxDocument') {
        // Handle nested objects like headquartersAddress and primaryContact
        if (typeof userData[key] === 'object' && userData[key] !== null) {
          Object.keys(userData[key]).forEach(nestedKey => {
            formData.append(`${key}[${nestedKey}]`, userData[key][nestedKey]);
          });
        } else {
          formData.append(key, userData[key]);
        }
      }
    });
    
    // Add file uploads if they exist
    if (userData.businessLicense) {
      formData.append('businessLicense', userData.businessLicense);
    }
    
    if (userData.taxDocument) {
      formData.append('taxDocument', userData.taxDocument);
    }
    
    const response = await api.post('/auth/register/corporate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  
  // Login user
  login: async (email, password, isAdmin) => {
    const endpoint = isAdmin ? '/auth/login/admin' : '/auth/login';
    const response = await api.post(endpoint, { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },
  
  // Get user profile
  getUserProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  // Get current user from API (more up-to-date than localStorage)
  fetchCurrentUser: async () => {
    // Check if token exists before making the API call
    const token = localStorage.getItem('token');
    console.log('authService.fetchCurrentUser - Token exists:', !!token);
    if (!token) {
      console.log('authService.fetchCurrentUser - No token, returning null');
      return null;
    }
    
    try {
      console.log('authService.fetchCurrentUser - Making API request to /me');
      const response = await api.get('/me');
      console.log('authService.fetchCurrentUser - API response:', response);
      
      // Extract user data from response
      let userData = null;
      if (response.data && response.data.user) {
        console.log('authService.fetchCurrentUser - User data found in response.data.user');
        userData = response.data.user;
      } else if (response.data) {
        console.log('authService.fetchCurrentUser - User data found in response.data');
        userData = response.data;
      }
      
      if (!userData) {
        console.log('authService.fetchCurrentUser - No user data found in response');
        return null;
      }
      
      // Ensure role is present
      if (!userData.role) {
        console.log('authService.fetchCurrentUser - No role found in user data, using accountType as fallback');
        // Use accountType as fallback if role is missing
        if (userData.accountType) {
          userData.role = userData.accountType;
        } else {
          console.log('authService.fetchCurrentUser - No accountType found, setting default role');
          // Set a default role to prevent redirection issues
          userData.role = 'user';
        }
      }
      
      console.log('authService.fetchCurrentUser - Final user data with role:', userData.role);
      
      // Update localStorage with the latest user data
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('authService.fetchCurrentUser - Error:', error);
      console.error('authService.fetchCurrentUser - Error response:', error.response);
      // If we get a 401, clear token and user data
      if (error.response && error.response.status === 401) {
        console.log('authService.fetchCurrentUser - 401 error, clearing token and user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else if (error.response && error.response.status === 403) {
        console.log('authService.fetchCurrentUser - 403 error, not clearing token');
        // Try to get user from localStorage as fallback
        const userStr = localStorage.getItem('user');
        if (userStr) {
          console.log('authService.fetchCurrentUser - Using localStorage user data as fallback');
          return JSON.parse(userStr);
        }
      }
      throw error; // Re-throw the error for the caller to handle
    }
  },
  

};

export default authService;