/**
 * Project Routes
 * This file defines the routes for project-related operations
 */

const express = require('express');
const router = express.Router();

// --- Middleware Imports ---
// Ensure these paths are correct relative to projectsRoutes.js
const { protect, admin } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
// Corrected path to upload.js and using named destructuring for uploadProjectAttachments
const { uploadProjectAttachments } = require('../middleware/upload'); 
// Assuming handleUploadErrors is a separate middleware you want to use globally,
// or you'd apply it specifically after uploadProjectAttachments
const { handleUploadErrors } = require('../middleware/upload');


// --- Controller Function Imports ---
// Ensure these function names exactly match what is exported from projectsController.js
const {
  createDraft,
  updateDraft,
  updateProject,
  submitProject,
  getProject,
  getProjectSummary,
  listProjects,
  uploadAttachments, // This is the controller function that handles after upload middleware
  createProject,
  confirmProject,
  rejectProject,
  submitAdminReview,
  submitReview,
  tokenizeProject,
  generateContract,
  downloadContract,
  syncCodebase,
  ingestToPinecone,
  askCodebasePinecone,
  askCodebaseV2 
} = require('../controllers/projectsController');


// --- Define your project-specific routes here ---

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

// Get a project by ID (owner or authorized roles)
router.get('/:id', protect, getProject);

// List projects with filtering, search, pagination, and sorting (all authenticated users)
router.get('/', protect, listProjects);

// Upload project attachments (owner only) - Now correctly imports and uses the middleware
// IMPORTANT: Place handleUploadErrors AFTER uploadProjectAttachments
router.post('/:id/attachments', protect, uploadProjectAttachments, handleUploadErrors, uploadAttachments);

// Confirm a submitted project (admin only)
router.post('/:id/confirm', protect, requireRole(['admin']), confirmProject);

// Reject a submitted project (admin only)
router.post('/:id/reject', protect, requireRole(['admin']), rejectProject);

// Submit a review for a project
router.post('/:id/reviews', protect, submitReview);

// General project operations by ID (GET and PATCH)
router.route('/:id')
  .get(protect, getProject)
  .patch(protect, updateProject);

// Admin review submission
router.route('/:id/admin-review')
  .post(protect, requireRole('admin'), submitAdminReview);

// AI-generated requirements (tokenize)
router.route('/:id/tokenize').post(protect, requireRole('admin'), tokenizeProject);

// Generate contract for a project (admin only)
router.post('/:id/generate-contract', protect, requireRole('admin'), generateContract);

// Download contract for a project (authenticated users - security check in controller)
router.get('/:id/download-contract', protect, downloadContract);

    
// --- RAG System Routes (Admin only, using Pinecone) ---
router.post('/:id/codebase/sync', protect, admin, syncCodebase); // Preprocessing remains the same
router.post('/:id/codebase/ingest-pinecone', protect, admin, ingestToPinecone); // NEW: Pinecone ingestion route
router.post('/:id/codebase/ask', protect, admin, askCodebasePinecone); // NEW: Pinecone ask route
router.post('/:id/codebase/ask-v2', protect, admin, askCodebaseV2);
  

// Export the router instance for use in server.js
module.exports = router;