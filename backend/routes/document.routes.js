/**
 * Document Routes
 * This file contains routes for document-related operations
 */

const express = require('express');
const router = express.Router();
const { getBusinessLicense, getTaxDocument } = require('../controllers/documentController');
const { protect, admin } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// Custom middleware to check if user is admin or document owner
const checkAdminOrOwner = (req, res, next) => {
  // If user is admin, allow access regardless of document ownership
  if (req.user && req.user.role === 'admin') {
    console.log('✅ Admin access granted for document');
    return next();
  }
  
  // If user is the owner of the document, allow access
  const { userId } = req.params;
  const currentUserId = req.user?.id || '';
  
  console.log('🔍 Comparing IDs:', { currentUserId, documentUserId: userId });
  
  // Convert both IDs to strings for comparison
  if (req.user && currentUserId.toString() === userId.toString()) {
    console.log('✅ Owner access granted for document');
    return next();
  }
  
  // Otherwise, deny access
  console.log('❌ Access denied: Not admin or owner');
  return res.status(403).json({ message: 'Not authorized to access this document' });
};

// @route   GET /api/documents/business-license/:userId
// @desc    Get business license document
// @access  Private - Admin or document owner
router.get('/business-license/:userId', protect, checkAdminOrOwner, getBusinessLicense);

// @route   GET /api/documents/tax-document/:userId
// @desc    Get tax document
// @access  Private - Admin or document owner
router.get('/tax-document/:userId', protect, checkAdminOrOwner, getTaxDocument);

module.exports = router;