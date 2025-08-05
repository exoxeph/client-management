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
  approveCorporate, 
  rejectCorporate,
  getDocumentImage
} = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, getMe);

// @route   GET /api/activity/recent
// @desc    Get recent activity
// @access  Private
router.get('/activity/recent', protect, getRecentActivity);

// Admin-only routes
// @route   GET /api/admin/unverified-corporates
// @desc    Get unverified corporate users
// @access  Private/Admin
router.get('/admin/unverified-corporates', protect, admin, getUnverifiedCorporates);

// @route   POST /api/admin/corporates/:id/approve
// @desc    Approve corporate user
// @access  Private/Admin
router.post('/admin/corporates/:id/approve', protect, admin, approveCorporate);

// @route   POST /api/admin/corporates/:id/reject
// @desc    Reject corporate user
// @access  Private/Admin
router.post('/admin/corporates/:id/reject', protect, admin, rejectCorporate);

// @route   GET /api/admin/documents/:userId/:docType
// @desc    Get document image directly from MongoDB
// @access  Private/Admin
router.get('/admin/documents/:userId/:docType', protect, admin, getDocumentImage);

module.exports = router;