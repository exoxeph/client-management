/**
 * Project Routes
 * This file defines the routes for project-related operations
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { uploadProjectAttachments } = require('../middleware/upload');
const {
  createDraft,
  updateDraft,
  updateProject,
  submitProject,
  getProject,
  getProjectSummary,
  listProjects,
  uploadAttachments,
  createProject,
  confirmProject,
  rejectProject,
  submitAdminReview ,
  submitReview,
  tokenizeProject,
  generateContract,
  downloadContract
} = require('../controllers/projectsController');

// Create a new project draft (corporate/individual only)
router.post('/draft', protect, requireRole(['corporate', 'individual']), createDraft);

// Create a new project directly (corporate/individual only)
router.post('/', protect, requireRole(['corporate', 'individual']), createProject);

// Update a project draft (owner only)
router.patch('/:id/draft', protect, updateDraft);

// Submit a project (owner only)
router.post('/:id/submit', protect, submitProject);

// Get project summary (corporate/individual/admin/project_manager)
router.get('/summary', protect, requireRole(['corporate', 'individual', 'admin', 'project_manager']), getProjectSummary);

// Get all projects for the current user (corporate/individual/admin)
router.get('/all', protect, requireRole(['corporate', 'individual', 'admin', 'project_manager']), listProjects);

// Get pending verdict projects (admin and project_manager only)
router.get('/pending', protect, requireRole(['admin', 'project_manager']), listProjects);

// Get a project by ID (owner only)
router.get('/:id', protect, getProject);

// List projects with filtering, search, pagination, and sorting (all authenticated users)
router.get('/', protect, listProjects);

// Upload project attachments (owner only)
router.post('/:id/attachments', protect, uploadProjectAttachments, uploadAttachments);

// Confirm a submitted project (admin only)
router.post('/:id/confirm', protect, requireRole(['admin']), confirmProject);

// Reject a submitted project (admin only)
router.post('/:id/reject', protect, requireRole(['admin']), rejectProject);

// Submit a review for a project
router.post('/:id/reviews', protect, submitReview);

router.route('/:id')
  .get(protect, getProject)
  .patch(protect, updateProject); // Use PATCH for partial updates

router.route('/:id/admin-review')
  .post(protect, requireRole('admin'), submitAdminReview);

router.route('/:id/tokenize').post(protect, requireRole('admin'), tokenizeProject);

// Generate contract for a project (admin only)
router.post('/:id/generate-contract', protect, requireRole('admin'), generateContract);

// Download contract for a project (authenticated users - security check in controller)
router.get('/:id/download-contract', protect, downloadContract);

module.exports = router;