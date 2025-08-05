/**
 * Document Routes
 * This file contains routes for document-related operations
 */

const express = require('express');
const router = express.Router();
const { getBusinessLicense, getTaxDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

// @route   GET /api/documents/business-license/:corporateId
// @desc    Get business license document
// @access  Private
router.get('/business-license/:corporateId', protect, getBusinessLicense);

// @route   GET /api/documents/tax-document/:corporateId
// @desc    Get tax document
// @access  Private
router.get('/tax-document/:corporateId', protect, getTaxDocument);

module.exports = router;