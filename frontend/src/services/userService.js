/**
 * User Service
 * This file contains methods for user-related API calls
 */

import api from './api';

const userService = {
  /**
   * Get all clients (non-admin users)
   * @returns {Promise} Promise that resolves to the list of clients
   */
  getClients: async () => {
    const response = await api.get('/users/clients');
    return response.data;
  },

  /**
   * Get all users
   * @returns {Promise} Promise that resolves to the list of users
   */
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise} Promise that resolves to the user data
   */
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise} Promise that resolves to the updated user data
   */
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise} Promise that resolves to the deletion confirmation
   */
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  /**
   * Get unverified corporate users
   * @returns {Promise} Promise that resolves to the list of unverified users
   */
  getUnverifiedUsers: async () => {
    const response = await api.get('/users/unverified');
    return response.data;
  },

  /**
   * Verify a user
   * @param {string} id - User ID
   * @returns {Promise} Promise that resolves to the verification confirmation
   */
  verifyUser: async (id) => {
    const response = await api.post(`/users/${id}/verify`);
    return response.data;
  }
};

export default userService;