/**
 * Dashboard Routes
 * This file contains routes for dashboard-related operations
 */

const express = require('express');
const router = express.Router();
const { 
  getMe, 
  getRecentActivity, 
  getUnverifiedCorporates, 
  getUnverifiedCorporateUsers,
  approveCorporate, 
  rejectCorporate
} = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/auth');

/**
 * User Profile Routes
 */
// @route   GET /api/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, getMe);

/**
 * Activity Routes
 */
// @route   GET /api/activity/recent
// @desc    Get recent activity
// @access  Private
router.get('/activity/recent', protect, getRecentActivity);

/**
 * Admin Routes - Unverified Corporate Users
 */
// @route   GET /api/admin/unverified-corporates
// @desc    Get unverified corporate users with optimized performance
// @access  Private/Admin
router.get('/admin/unverified-corporates', protect, admin, getUnverifiedCorporates);

// @route   GET /api/admin/unverified-corporate-users
// @desc    Get unverified corporate users with pagination and caching
// @access  Private/Admin
router.get('/admin/unverified-corporate-users', protect, admin, getUnverifiedCorporateUsers);

/**
 * Corporate User Verification Routes
 */
// @route   POST /api/admin/corporates/:id/approve
// @desc    Approve corporate user
// @access  Private/Admin
router.post('/admin/corporates/:id/approve', protect, admin, approveCorporate);

// @route   POST /api/admin/corporates/:id/reject
// @desc    Reject corporate user
// @access  Private/Admin
router.post('/admin/corporates/:id/reject', protect, admin, rejectCorporate);



module.exports = router;