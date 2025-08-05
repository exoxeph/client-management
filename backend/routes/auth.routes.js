/**
 * Auth Routes
 * This file contains routes for authentication-related operations
 */

const express = require('express');
const router = express.Router();
const { 
  registerIndividual, 
  registerCorporate, 
  loginUser, 
  loginAdmin,
  getUserProfile 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadDocuments, handleUploadErrors } = require('../middleware/upload');

// @route   POST /api/auth/register/individual
// @desc    Register individual user
// @access  Public
router.post('/register/individual', registerIndividual);

// @route   POST /api/auth/register/corporate
// @desc    Register corporate user
// @access  Public
router.post('/register/corporate', uploadDocuments, handleUploadErrors, registerCorporate);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// @route   POST /api/auth/login/admin
// @desc    Authenticate admin user & get token
// @access  Public
router.post('/login/admin', loginAdmin);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, getUserProfile);

module.exports = router;