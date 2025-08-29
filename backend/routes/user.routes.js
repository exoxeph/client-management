const express = require('express');
const router = express.Router();
const { 
  getUnverifiedUsers,
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  verifyUser,
  getUsers,
  getClients
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// @route   GET /api/users/clients
// @desc    Get all clients (non-admin users)
// @access  Private/Admin
router.get('/clients', protect, requireRole('admin'), getClients);

// @route   GET /api/users/unverified
// @desc    Get all unverified corporate users
// @access  Private/Admin
router.get('/unverified', protect, admin, getUnverifiedUsers);

// @route   POST /api/users/:id/verify
// @desc    Verify a corporate user
// @access  Private/Admin
router.post('/:id/verify', protect, admin, verifyUser);

// @route   DELETE /api/users/:id
// @desc    Delete a user (reject registration)
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteUser);

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', protect, admin, getUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', protect, admin, getUserById);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', protect, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;