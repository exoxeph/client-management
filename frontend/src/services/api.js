/**
 * API Service
 * This file contains methods for making API calls to the backend
 */

import axios from 'axios';

// Use the environment variable for API URL or fallback to localhost
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
    console.log('API Error Interceptor:', error);
    
    // Enhanced error logging
    if (error.response) {
      console.log('API Error Response Status:', error.response.status);
      console.log('API Error Response Data:', error.response.data);
      console.log('API Error Response Headers:', error.response.headers);
    } else if (error.request) {
      console.log('API Error Request (no response received):', error.request);
    } else {
      console.log('API Error Message:', error.message);
    }
    
    console.log('Current pathname:', window.location.pathname);
    
    // Handle 401 Unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401) {
      console.log('401 Unauthorized - Redirecting to login');
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect to login if we're not already on the login page
      // This prevents redirect loops
      if (!window.location.pathname.includes('/login')) {
        console.log('Redirecting to login page');
        window.location.href = '/login';
      }
    } else if (error.response && error.response.status === 403) {
      console.log('403 Forbidden - Not redirecting');
      // Don't redirect on 403 errors, just log them and pass through to the component
      // Add a custom property to the error to indicate it's a permission error
      error.isPermissionError = true;
      console.log('Error response data:', error.response.data);
      // Make sure we're not clearing auth data on 403 errors
    } else if (error.response && error.response.status === 404) {
      console.log('404 Not Found - Not redirecting');
      // Don't redirect on 404 errors, just log them
      error.isNotFoundError = true;
    } else if (error.response && error.response.status === 400) {
      console.log('400 Bad Request - Client Error');
      // Add a custom property to the error to indicate it's a validation error
      error.isValidationError = true;
      console.log('Validation error details:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Export the API instance as default
export default api;

// Auth services
const authService = {
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await api.post('/users/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },
  
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },
};

// User services
const userService = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export { authService, userService };