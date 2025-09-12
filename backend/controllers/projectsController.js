/**
 * Projects Controller
 * This controller handles project-related operations
 */

const Project = require('../models/Project');
const User = require('../models/User');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
const { Pinecone } = require('@pinecone-database/pinecone');
// --- Weaviate Client Imports and Initialization ---
// const weaviate = require('weaviate-client'); // Correct package name for v4+
// const WEAVIATE_URL = process.env.WEAVIATE_URL;
// const WEAVIATE_API_KEY = process.env.WEAVIATE_API_KEY;
// --- Transformers.js for Local Embeddings ---
const { pipeline, Float32Array } = require('@xenova/transformers'); // NEW: Import Transformers.js pipeline


let textEmbeddingPipeline = null;
let pipelineInitializedPromise = null;
async function initializeTextEmbeddingPipeline() {
    if (textEmbeddingPipeline) { // Already initialized
        return textEmbeddingPipeline;
    }
    if (pipelineInitializedPromise) { // Already initializing, wait for it
        return pipelineInitializedPromise;
    }

    pipelineInitializedPromise = (async () => {
        try {
            console.log('Initializing local text embedding pipeline with Transformers.js...');
            const p = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            textEmbeddingPipeline = p; // Assign to global variable
            console.log('✅ Local text embedding pipeline initialized successfully!');
            return textEmbeddingPipeline;
        } catch (error) {
            console.error('❌ Failed to initialize Transformers.js pipeline:', error);
            textEmbeddingPipeline = null; // Ensure it's null on failure
            throw error; // Re-throw to propagate error
        } finally {
            pipelineInitializedPromise = null; // Clear the promise after completion (success or failure)
        }
    })();
    return pipelineInitializedPromise;
}
// --- END NEW ---
// --- Global Gemini API Setup (for generation) ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI;
let generativeModel;

// --- Gemini Generative Model Setup ---
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY environment variable is not set. Gemini generation features will not work.");
} else {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  generativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

// ... (code before this, including Transformers.js initialization) ...
initializeTextEmbeddingPipeline();
// --- Pinecone Client Initialization ---

    
// --- Pinecone Client Initialization (v2+ Serverless Style) ---
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;

let pineconeClient = null;

if (!PINECONE_API_KEY) {
    console.error("PINECONE_API_KEY environment variable is not set. Pinecone client will not be initialized.");
} else {
    try {
        console.log('Attempting Pinecone client initialization (v2+ serverless)...');
        pineconeClient = new Pinecone({
            apiKey: PINECONE_API_KEY,
        });
        console.log('✅ Pinecone client initialized successfully!');
    } catch (error) {
        console.error('❌ Failed to initialize Pinecone client:', error.message);
        pineconeClient = null;
    }
}
// --- END Pinecone Client Initialization ---

  

/**
 * Create a new project
 * @route POST /api/projects
 * @access Private (corporate, individual)
 */
const createProject = async (req, res) => {
  try {
    const { id: ownerUserId, role } = req.user;
    if (role !== 'corporate' && role !== 'individual') {
      return res.status(403).json({ message: 'Only corporate and individual users can create projects' });
    }
    const project = new Project({
      ownerUserId,
      ownerRole: role,
      status: 'draft',
      verdict: 'none',
      ...req.body,
      activityLog: [ { at: new Date(), type: 'project_created', by: ownerUserId, note: 'Project created' } ]
    });
    await project.save();
    res.status(201).json({ message: 'Project created successfully', projectId: project._id, status: project.status });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a draft project
 * @route POST /api/projects/draft
 * @access Private (corporate, individual)
 */
const createDraft = async (req, res) => {
  try {
    const { id: ownerUserId, role } = req.user;
    if (role !== 'corporate' && role !== 'individual') {
      return res.status(403).json({ message: 'Only corporate and individual users can create projects' });
    }
    let contactInfo = { name: '', email: '' };
    if (role === 'corporate') {
      const Corporate = require('../models/Corporate');
      const corporate = await Corporate.findOne({ user: ownerUserId });
      if (corporate && corporate.primaryContact) {
        contactInfo.name = corporate.companyName || corporate.primaryContact?.name || contactInfo.name;
        contactInfo.email = corporate.primaryContact?.email || contactInfo.email;
      }
    } else if (role === 'individual') {
      const Individual = require('../models/Individual');
      const individual = await Individual.findOne({ user: ownerUserId });
      if (individual) {
        contactInfo.name = individual.fullName || contactInfo.name;
        contactInfo.email = individual.email || contactInfo.email;
      }
    }
    const project = new Project({
      ownerUserId,
      ownerRole: role,
      status: 'draft',
      verdict: 'none',
      ...req.body,
      contacts: { name: contactInfo.name, email: contactInfo.email },
      activityLog: [ { at: new Date(), type: 'draft_created', by: ownerUserId, note: 'Project draft created' } ]
    });
    await project.save();
    res.status(201).json({ message: 'Project draft created successfully', projectId: project._id, _id: project._id, numericProjectId: project.projectId, status: project.status });
  } catch (error) {
    console.error('Error creating project draft:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update a draft project
 * @route PATCH /api/projects/:id/draft
 * @access Private (owner only)
 */
const updateDraft = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { id: userId } = req.user;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.ownerUserId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    if (project.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft projects can be updated' });
    }
    const updateData = {};
    if (req.body.overview) { updateData.overview = req.body.overview; }
    if (req.body.scope) { updateData.scope = req.body.scope; }
    if (req.body.technical) { updateData.technical = req.body.technical; }
    if (req.body.timelineBudget) { updateData.timelineBudget = req.body.timelineBudget; }
    if (req.body.legal) { updateData.legal = req.body.legal; }
    if (req.body.repos) { updateData.repos = req.body.repos; }
    if (req.body.contacts) {
      updateData.contacts = req.body.contacts;
    } else if (!project.contacts || !project.contacts.name || !project.contacts.email) {
      let contactInfo = { name: '', email: '' };
      if (project.ownerRole === 'corporate') {
        const Corporate = require('../models/Corporate');
        const corporate = await Corporate.findOne({ user: project.ownerUserId });
        if (corporate && corporate.primaryContact) {
          contactInfo.name = corporate.companyName || corporate.primaryContact?.name || contactInfo.name;
          contactInfo.email = corporate.primaryContact?.email || contactInfo.email;
        }
      } else if (project.ownerRole === 'individual') {
        const Individual = require('../models/Individual');
        const individual = await Individual.findOne({ user: project.ownerUserId });
        if (individual) {
          contactInfo.name = individual.fullName || contactInfo.name;
          contactInfo.email = individual.email || contactInfo.email;
        }
      }
      if (contactInfo.name && contactInfo.email) {
        updateData.contacts = contactInfo;
      }
    }
    const activityLogEntry = { at: new Date(), type: 'draft_updated', by: userId, note: 'Project draft updated' };
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    try {
      const tempProject = new Project({ ...project.toObject(), ...updateData });
      await tempProject.validate();
    } catch (validationError) {
      return res.status(400).json({ message: 'Validation error', error: validationError.message });
    }
    const updatedProject = await Project.findByIdAndUpdate( projectId, { $set: updateData, $push: { activityLog: activityLogEntry } }, { new: true, runValidators: true } );
    res.status(200).json({ message: 'Project draft updated successfully', projectId: updatedProject._id, _id: updatedProject._id, numericProjectId: updatedProject.projectId, status: updatedProject.status });
  } catch (error) {
    console.error('Error updating project draft:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update a project (for counter-offers and verdict changes)
 * @route PATCH /api/projects/:id
 * @access Private (owner or admin)
 */
const updateProject = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { id: userId, role } = req.user;
    const updatePayload = req.body;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.ownerUserId.toString() !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    let activityNote = '';
    if (updatePayload.verdict) {
      if (updatePayload.verdict === 'confirmed') {
        if ((role === 'admin' && (project.status === 'submitted' || project.status === 'client-counter')) || ((project.ownerRole === 'corporate' || project.ownerRole === 'individual') && project.status === 'admin-counter')) {
              project.status = 'approved';
              project.verdict = 'confirmed';
              activityNote = `Project approved by ${role}.`;
        } else {
          return res.status(400).json({ message: `Cannot confirm project with status: ${project.status}` });
        }
      } else if (updatePayload.verdict === 'rejected') {
        if ((role === 'admin' && (project.status === 'submitted' || project.status === 'client-counter')) || ((project.ownerRole === 'corporate' || project.ownerRole === 'individual') && project.status === 'admin-counter')) {
              project.status = 'rejected';
              project.verdict = 'rejected';
              activityNote = `Project rejected by ${role}.`;
        } else {
          return res.status(400).json({ message: `Cannot reject project with status: ${project.status}` });
        }
      }
    } else {
        Object.assign(project, updatePayload);
        if (role === 'admin') {
            project.status = 'admin-counter';
            activityNote = 'Admin submitted a counter-offer.';
        } else {
            project.status = 'client-counter';
            activityNote = 'Client submitted a re-counter.';
        }
    }
    project.activityLog.push({ at: new Date(), type: 'project_updated', by: userId, note: activityNote });
    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Submit a project
 * @route POST /api/projects/:id/submit
 * @access Private (owner only)
 */
const submitProject = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { id: userId } = req.user;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.ownerUserId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to submit this project' });
    }
    if (project.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft projects can be submitted' });
    }
    const missingFields = [];
    if (!project.overview || !project.overview.title || !project.overview.type || !project.overview.description || !project.overview.goal) {
      missingFields.push('overview (title, type, description, goal)');
    }
    if (!project.contacts || !project.contacts.name || !project.contacts.email) {
      missingFields.push('contacts (name, email)');
    }
    if (missingFields.length > 0) {
      return res.status(400).json({ message: 'Project is incomplete. Please complete all required fields before submission.', missingFields });
    }
    const activityLogEntry = { at: new Date(), type: 'project_submitted', by: userId, note: 'Project submitted for review' };
    const updatedProject = await Project.findByIdAndUpdate( projectId, { $set: { status: 'submitted', verdict: 'pending' }, $push: { activityLog: activityLogEntry } }, { new: true } );
    res.status(200).json({ message: 'Project submitted successfully', projectId: updatedProject._id, _id: updatedProject._id, numericProjectId: updatedProject.projectId, status: updatedProject.status, verdict: updatedProject.verdict });
  } catch (error) {
    console.error('Error submitting project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get a project by ID
 * @route GET /api/projects/:id
 * @access Private (owner only)
 */
const getProject = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { id: userId, role } = req.user;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      console.warn(`[Get Project] Invalid project ID provided: ${projectId}`);
      return res.status(400).json({ error: 'invalid_request', message: 'Invalid project ID' });
    }

    // --- NEW: First fetch WITHOUT .select() to see raw DB content ---
    let projectRaw = await Project.findById(projectId);
    console.log(`[Get Project DEBUG] Raw project from DB for ${projectId}:`, projectRaw?.codebase);
    // --- END NEW ---

    // Find the project and explicitly select necessary codebase fields
    const project = await Project.findById(projectId)
      .select('+codebase');

    if (!project) {
      console.warn(`[Get Project] Project ${projectId} not found.`);
      return res.status(404).json({ error: 'not_found', message: 'Project not found' });
    }

    if (role !== 'admin' && role !== 'project_manager') {
      if (role === 'corporate' || role === 'individual') {
        if (project.ownerUserId.toString() !== userId) {
          console.warn(`[Get Project] Unauthorized access to project ${projectId} by user ${userId} (role: ${role}).`);
          return res.status(403).json({ error: 'forbidden', reason: 'ownership', message: 'Not authorized to view this project' });
        }
      } else {
        console.warn(`[Get Project] Unauthorized access to project ${projectId} by user ${userId} (unsupported role: ${role}).`);
        return res.status(403).json({ error: 'forbidden', reason: 'role', message: 'Not authorized to view this project' });
      }
    }

    // Debug log to inspect the project object before sending
    console.log(`[Get Project] Sending project ${projectId} data to frontend. Codebase details:`, project?.codebase);

    res.status(200).json(project);
  } catch (error) {
    console.error(`❌ FATAL ERROR in getProject controller for ${req.params.projectId}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get project summary (counts by status)
 * @route GET /api/projects/summary
 * @access Private (corporate, individual, admin, project_manager)
 */
const getProjectSummary = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const isAdminQuery = req.query.admin === 'true';
    let matchStage = {};
    if ((role === 'admin' || role === 'project_manager') && isAdminQuery) {
    } else {
      matchStage = { ownerUserId: new mongoose.Types.ObjectId(userId) };
    }
    const summary = await Project.aggregate([ { $match: matchStage }, { $group: { _id: { status: '$status', verdict: '$verdict' }, count: { $sum: 1 } } }, { $project: { _id: 0, status: '$_id.status', verdict: '$_id.verdict', count: 1 } } ]);
    const result = { draft: 0, submitted: 0, under_review: 0, approved: 0, rejected: 0, none: 0, pending: 0, confirmed: 0, rejected_verdict: 0, get pending_status() { return this.submitted + this.under_review; }, get confirmed_status() { return this.approved; } };
    summary.forEach(item => {
      result[item.status] = (result[item.status] || 0) + item.count;
      if (item.verdict === 'rejected') {
        result.rejected_verdict = (result.rejected_verdict || 0) + item.count;
      } else {
        result[item.verdict] = (result[item.verdict] || 0) + item.count;
      }
    });
    const total = summary.reduce((acc, item) => acc + item.count, 0);
    res.status(200).json({ total: total, status: { pending: result.pending_status, confirmed: result.confirmed_status, rejected: result.rejected }, verdict: { none: result.none, pending: result.pending, confirmed: result.confirmed, rejected: result.rejected_verdict } });
  } catch (error) {
    console.error('Error fetching project summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * List projects with filtering, search, pagination, and sorting
 * @route GET /api/projects
 * @access Private (corporate, individual, admin)
 */
const listProjects = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const { status = 'all', verdict = 'all', q = '', page = 1, limit = 10, sort = 'updatedAt:desc' } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const skip = (pageNum - 1) * limitNum;
    let filter = {};
    if (role === 'admin' || role === 'project_manager') {
      filter.status = { $ne: 'draft' };
    } else {
      filter.ownerUserId = userId;
    }
    if (status !== 'all') {
      filter.status = status;
    }
    if (verdict !== 'all') {
      filter.verdict = verdict;
    }
    if (q) {
      filter['$or'] = [ { 'overview.title': { $regex: q, $options: 'i' } }, { 'overview.description': { $regex: q, $options: 'i' } } ];
    }
    const sortOptions = { [sort.split(':')[0]]: sort.split(':')[1] === 'desc' ? -1 : 1 };
    const projects = await Project.find(filter) .sort(sortOptions) .skip(skip) .limit(limitNum) .select('ownerUserId ownerRole status verdict overview timelineBudget updatedAt createdAt projectId adminReview reviews');
    const total = await Project.countDocuments(filter);
    res.status(200).json({ items: projects, page: pageNum, limit: limitNum, total });
  } catch (error) {
    console.error('Error listing projects:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Upload project attachments
 * @route POST /api/projects/:id/attachments
 * @access Private (owner only)
 */
const uploadAttachments = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { id: userId } = req.user;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }
    const project = await Project.findById(projectId)
    .select('+codebase.jsonDigestFilePath +codebase.rawTextDigestFilePath +codebase.weaviateClass +codebase.status +codebase.lastProcessedAt');
    if (!project) {
      console.warn(`[Get Project] Project ${projectId} not found.`);
      return res.status(404).json({ message: 'Project not found' });
    }
    
    console.log(`[Get Project] Sending project ${projectId} data to frontend. Codebase details:`, project?.codebase);

    if (project.ownerUserId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    if (project.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft projects can be updated' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const attachments = req.files.map(file => ({ filename: file.originalname, url: `/uploads/project-attachments/${file.filename}`, mime: file.mimetype, size: file.size }));
    const activityLogEntry = { at: new Date(), type: 'attachments_added', by: userId, note: `${attachments.length} attachment(s) added` };
    const updatedProject = await Project.findByIdAndUpdate( projectId, { $push: { attachments: { $each: attachments }, activityLog: activityLogEntry } }, { new: true } );
    res.status(200).json({ message: 'Attachments uploaded successfully', attachments: updatedProject.attachments });
  } catch (error) {
    console.error('Error uploading attachments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Submit an admin's internal review of a client for a project
 * @route POST /api/projects/:id/admin-review
 * @access Private (admin only)
 */
const submitAdminReview = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { id: adminId } = req.user;
    const { professionalism, communication, clarityOfRequirements, comment } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.verdict !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed projects can be reviewed' });
    }
    if (project.adminReview && project.adminReview.adminId) {
        return res.status(400).json({ message: 'An admin review for this project already exists.' });
    }
    project.adminReview = { adminId, professionalism, communication, clarityOfRequirements, comment, createdAt: new Date() };
    project.activityLog.push({ at: new Date(), type: 'admin_review_submitted', by: adminId, note: 'Admin submitted an internal review of the client.' });
    await project.save();
    res.status(201).json({ message: 'Admin review submitted successfully', adminReview: project.adminReview });
  } catch (error) {
    console.error('Error submitting admin review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Confirm a submitted project (admin only)
 * @route POST /api/projects/:id/confirm
 * @access Private (admin only)
 */
const confirmProject = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { id: userId } = req.user;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.status !== 'submitted' || project.verdict !== 'pending') {
      return res.status(400).json({ message: 'Only submitted projects with pending verdict can be confirmed' });
    }
    const activityLogEntry = { at: new Date(), type: 'project_confirmed', by: userId, note: 'Project confirmed by admin' };
    const updatedProject = await Project.findByIdAndUpdate( projectId, { $set: { verdict: 'confirmed' }, $push: { activityLog: activityLogEntry } }, { new: true } );
    res.status(200).json({ message: 'Project confirmed successfully', projectId: updatedProject._id, _id: updatedProject._id, numericProjectId: updatedProject.projectId, status: updatedProject.status, verdict: updatedProject.verdict });
  } catch (error) {
    console.error('Error confirming project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Reject a submitted project (admin only)
 * @route POST /api/projects/:id/reject
 * @access Private (admin only)
 */
const rejectProject = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { id: userId } = req.user;
    const { reason } = req.body;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.status !== 'submitted' || project.verdict !== 'pending') {
      return res.status(400).json({ message: 'Only submitted projects with pending verdict can be rejected' });
    }
    const activityLogEntry = { at: new Date(), type: 'project_rejected', by: userId, note: reason || 'Project rejected by admin' };
    const updatedProject = await Project.findByIdAndUpdate( projectId, { $set: { verdict: 'rejected' }, $push: { activityLog: activityLogEntry } }, { new: true } );
    res.status(200).json({ message: 'Project rejected successfully', projectId: updatedProject._id, _id: updatedProject._id, numericProjectId: updatedProject.projectId, status: updatedProject.status, verdict: updatedProject.verdict });
  } catch (error) {
    console.error('Error rejecting project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Submit a review for a project
 * @route POST /api/projects/:id/reviews
 * @access Private (authenticated users)
 */
const submitReview = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { id: userId } = req.user;
    const { rating, comment } = req.body;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: 'invalid_request', message: 'Invalid project ID' });
    }
    if (rating === undefined || rating === null) {
      return res.status(400).json({ error: 'invalid_request', message: 'Rating is required' });
    }
    if (!comment || comment.trim() === '') {
      return res.status(400).json({ error: 'invalid_request', message: 'Comment is required' });
    }
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'not_found', message: 'Project not found' });
    }
    if (project.verdict !== 'confirmed') {
      return res.status(400).json({ error: 'invalid_request', message: 'Only confirmed projects can be reviewed' });
    }
    const userIdStr = userId.toString();
    const existingReview = project.reviews.find(review => {
      return review.userId && review.userId.toString() === userIdStr;
    });
    if (existingReview) {
      return res.status(400).json({ error: 'invalid_request', message: 'You have already submitted a review for this project' });
    }
    const newReview = { userId, rating: Number(rating), comment, createdAt: new Date() };
    project.reviews.push(newReview);
    const activityEntry = { at: new Date(), type: 'review_submitted', by: userId, note: `Review submitted with rating ${rating}/5` };
    project.activityLog.push(activityEntry);
    await project.save();
    res.status(201).json({ message: 'Review submitted successfully', review: { userId: userIdStr, rating: Number(rating), comment, createdAt: new Date().toISOString() } });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'server_error', message: 'Server error occurred while submitting review', details: error.message });
  }
};

const tokenizeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    const projectProposal = `
      Project Title: ${project.overview?.title || 'N/A'}
      Description: ${project.overview?.description || 'N/A'}
      Business Goal: ${project.overview?.goal || 'N/A'}
      Key Features submitted by client: ${project.scope?.features?.join(', ') || 'N/A'}
    `;
    if (!generativeModel) {
      return res.status(500).json({ message: "Generative AI model not initialized. Check GEMINI_API_KEY." });
    }
    const masterPrompt = `
You are "ClientManager AI", an expert software architect and project manager for the development firm "DevSolutions Inc.". Your task is to analyze a new client project proposal and convert it into a detailed, structured, and professional project requirements document.

Your ONLY output MUST be a single, raw, valid JSON object. Do not include any text, explanations, conversation, or markdown formatting like \`\`\`json. Your response must begin with \`{\` and end with \`}\`.

Analyze the following project proposal:
---
Project Title: ${project.overview?.title || 'N/A'}
Description: ${project.overview?.description || 'N/A'}
Business Goal: ${project.overview?.goal || 'N/A'}
Key Features submitted by client: ${project.scope?.features?.join(', ') || 'N/A'}
---

Generate the requirements document using this exact JSON schema. Be concise but comprehensive. The acceptance criteria must be specific and testable.

{
  "summary": "A high-level, one-sentence summary of the project's purpose and primary goal.",
  "userStories": [
    { "asA": "Primary User Role", "iWantTo": "Perform a key action", "soThat": "I can achieve a specific benefit." },
    { "asA": "Secondary User Role", "iWantTo": "Perform another action", "soThat": "I can achieve another benefit." }
  ],
  "functionalRequirements": {
    "frontend": [
      { "id": "FE-01", "component": "User Authentication", "task": "Develop a user login page with email and password fields.", "acceptanceCriteria": "User can enter valid credentials to log in. User sees an error message with invalid credentials.", "priority": "High" }
    ],
    "backend": [
      { "id": "BE-01", "service": "Authentication Service", "task": "Create a secure API endpoint for JWT-based user login.", "acceptanceCriteria": "Endpoint validates credentials against the database. On success, it returns a signed JWT. On failure, it returns a 401 Unauthorized error.", "priority": "High" }
    ]
  },
  "nonFunctionalRequirements": [
    { "id": "NFR-01", "category": "Security", "requirement": "All passwords must be hashed using bcrypt. API must be protected against CSRF and XSS attacks." }
  ],
  "suggestedTechnologies": {
    "frontend": ["React", "Tailwind CSS"],
    "backend": ["Node.js", "Express.js", "MongoDB"],
    "deployment": ["Vercel", "Render"]
  }
}`;
    const result = await generativeModel.generateContent(masterPrompt);
    let jsonString = result.response.text();
    if (jsonString.startsWith("```json\n")) {
      jsonString = jsonString.slice(7, -3);
    }
    const generatedRequirements = JSON.parse(jsonString);
    project.requirements = generatedRequirements;
    project.activityLog.push({ by: req.user.id, type: 'requirements_generated', note: 'AI-generated requirements created.' });
    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error("Error during project tokenization:", error);
    res.status(500).json({ message: "Failed to tokenize project", error: error.message });
  }
};

/**
 * Generate a PDF contract for a project
 * @route POST /api/projects/:id/generate-contract
 * @access Private (owner or admin)
 */
const generateContract = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { id: userId } = req.user;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }
    const project = await Project.findById(projectId).populate('ownerUserId', 'email');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.ownerUserId._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to generate contract for this project' });
    }
    const templatePath = path.join(__dirname, '..', 'templates', 'contractTemplate.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    let clientName = project.contacts?.name || 'Client Name';
    let clientEmail = project.contacts?.email || project.ownerUserId.email || 'client@email.com';
    if (project.ownerRole === 'corporate') {
      const Corporate = require('../models/Corporate');
      const corporate = await Corporate.findOne({ user: project.ownerUserId._id });
      if (corporate) {
        clientName = corporate.companyName || corporate.primaryContact?.name || clientName;
        clientEmail = corporate.primaryContact?.email || clientEmail;
      }
    } else if (project.ownerRole === 'individual') {
      const Individual = require('../models/Individual');
      const individual = await Individual.findOne({ user: project.ownerUserId._id });
      if (individual) {
        clientName = individual.fullName || clientName;
        clientEmail = individual.email || clientEmail;
      }
    }
    const formatDate = (date) => {
      if (!date) return 'To be determined';
      return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };
    htmlTemplate = htmlTemplate .replace(/{{clientName}}/g, clientName) .replace(/{{clientEmail}}/g, clientEmail) .replace(/{{companyName}}/g, 'DevSolutions Inc.') .replace(/{{projectTitle}}/g, project.overview?.title || 'Untitled Project') .replace(/{{projectDescription}}/g, project.overview?.description || 'No description provided') .replace(/{{projectGoal}}/g, project.overview?.goal || 'No goal specified') .replace(/{{budgetRange}}/g, project.timelineBudget?.budgetRange || 'To be negotiated') .replace(/{{paymentModel}}/g, project.timelineBudget?.paymentModel || 'To be determined') .replace(/{{startDate}}/g, formatDate(project.timelineBudget?.startDate)) .replace(/{{endDate}}/g, formatDate(project.timelineBudget?.endDate)) .replace(/{{currentDate}}/g, formatDate(new Date()));
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' } });
    await browser.close();
    const contractsDir = path.join(__dirname, '..', 'uploads', 'contracts');
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir, { recursive: true });
    }
    const fileName = `contract-${project._id}.pdf`;
    const filePath = path.join(contractsDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);
    project.contract = { filePath: filePath, fileName: fileName, generatedAt: new Date(), status: 'generated' };
    project.activityLog.push({ at: new Date(), type: 'contract_generated', by: userId, note: 'PDF contract generated' });
    await project.save();
    res.status(200).json({ message: 'Contract generated successfully', contract: project.contract });
  } catch (error) {
    console.error('Error generating contract:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Download a generated contract PDF
 * @route GET /api/projects/:id/download-contract
 * @access Private (owner or admin)
 */
const downloadContract = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { id: userId, role } = req.user;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.ownerUserId.toString() !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to download this project' });
    }
    if (!project.contract || !project.contract.filePath) {
      return res.status(404).json({ message: 'Contract not found. Please generate the contract first.' });
    }
    if (!fs.existsSync(project.contract.filePath)) {
      return res.status(404).json({ message: 'Contract file not found on server' });
    }
    res.download(project.contract.filePath, project.contract.fileName, (err) => {
      if (err) {
        console.error('Error downloading contract:', err);
        res.status(500).json({ message: 'Error downloading contract' });
      }
    });
  } catch (error) {
    console.error('Error downloading contract:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const syncCodebase = async (req, res) => {
  const { id: projectId } = req.params;
  const { repoUrl } = req.body;
  const { role } = req.user;

  // --- 1. VALIDATION AND INITIAL SETUP ---
  if (role !== 'admin') {
    console.warn(`[Sync Codebase] Forbidden access attempt for project ${projectId} by role: ${role}`);
    return res.status(403).json({ message: 'Forbidden: Only admins can perform this action.' });
  }

  let project;
  let tempPythonScriptPath = '';
  let tempDirForPythonScript = ''; // Initialize here for wider scope

  try {
    project = await Project.findById(projectId);
    if (!project) {
      console.warn(`[Sync Codebase] Project ${projectId} not found.`);
      return res.status(404).json({ message: 'Project not found' });
    }

    // --- Update project status to 'pending' immediately ---
    project.codebase = {
      repoUrl: repoUrl.trim(),
      status: 'pending',
      jsonDigestFilePath: null,
      rawTextDigestFilePath: null,
      pineconeIndexName: null,
      lastProcessedAt: null,
    };
    await project.save();

    res.status(200).json({
      message: 'Codebase preprocessing started. JSON and raw text digests will be generated.',
      project: { id: project._id, codebase: project.codebase }
    });
    
    // --- 2. BACKGROUND PREPROCESSING ---
    (async () => {
      let finalProjectUpdate; // Use this variable throughout the async background task
      
      try {
        const currentRepoUrl = repoUrl.trim();
        const githubToken = process.env.GITHUB_TOKEN;

        const includePatterns = [ "*.js", "*.ts", "*.jsx", "*.tsx", "*.py", "*.java", "*.cpp", "*.h", "*.go", "*.rs", "*.php", "*.cs", "*.html", "*.css", "*.scss", "*.vue", "*.svelte", "*.json", "*.yaml", "*.yml", "*.xml", "*.md" ];
        const excludePatterns = [ "node_modules/*", "dist/*", "build/*", ".git/*", "*.log", "*.map", "*.min.js", "venv/*", "__pycache__/*" ];
        
        const includePatternsJson = JSON.stringify(includePatterns);
        const excludePatternsJson = JSON.stringify(excludePatterns);
        
        tempDirForPythonScript = path.join(os.tmpdir(), `gitingest-py-script-${projectId}-${Date.now()}`);
        fs.mkdirSync(tempDirForPythonScript, { recursive: true });
        tempPythonScriptPath = path.join(tempDirForPythonScript, 'run_gitingest.py');

        const pythonScriptContent = `
import json
import sys
import os
from gitingest import ingest

repo_url = os.environ.get('REPO_URL')
github_token = os.environ.get('GITHUB_TOKEN')
include_patterns = json.loads(os.environ.get('INCLUDE_PATTERNS_JSON', '[]'))
exclude_patterns = json.loads(os.environ.get('EXCLUDE_PATTERNS_JSON', '[]'))

if not repo_url:
    print("Error: REPO_URL environment variable is missing.", file=sys.stderr)
    sys.exit(1)

try:
    raw_summary_str, raw_tree_str, raw_full_files_content_str = ingest(
        repo_url,
        token=github_token,
        include_patterns=include_patterns,
        exclude_patterns=exclude_patterns,
        max_file_size=102400
    )

    files_data = []
    file_blocks_raw = raw_full_files_content_str.split('================================================\\nFILE: ')
    
    for block_str in file_blocks_raw: 
        block_str = block_str.strip()
        if not block_str:
            continue
        
        lines = block_str.split('\\n')
        if not lines:
            continue
        
        file_path = lines[0].strip()

        actual_content_start_index = -1
        for i in range(1, len(lines)):
            if lines[i].strip() == '================================================':
                actual_content_start_index = i + 1
                break
        
        if actual_content_start_index != -1:
            file_content = '\\n'.join(lines[actual_content_start_index:]).strip()
            if file_content:
                files_data.append({"path": file_path, "content": file_content})
        else:
            sys.stderr.write(f"Warning: Inner content delimiter not found for file {file_path}. Skipping file.\\n")


    full_text_digest = f"{raw_summary_str.strip()}\\n\\n{raw_tree_str.strip()}\\n\\n{raw_full_files_content_str.strip()}"

    output_json = {
        "repoUrl": repo_url,
        "processedAt": os.environ.get('PROCESSED_AT_ISO'),
        "summary": raw_summary_str.strip(),
        "tree": raw_tree_str.strip(),
        "files": files_data,
        "fullTextDigest": full_text_digest
    }
    print(json.dumps(output_json))

except Exception as e:
    print(f"Error during gitingest processing: {e}", file=sys.stderr)
    sys.exit(1)
        `;
        fs.writeFileSync(tempPythonScriptPath, pythonScriptContent);
        console.log(`[Python Script] Created temporary Python script at: ${tempPythonScriptPath}`);

        const pythonEnv = { ...process.env, REPO_URL: currentRepoUrl, GITHUB_TOKEN: githubToken || '', PROCESSED_AT_ISO: new Date().toISOString(), INCLUDE_PATTERNS_JSON: includePatternsJson, EXCLUDE_PATTERNS_JSON: excludePatternsJson, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };
        
        const child = spawn('python', [tempPythonScriptPath], { env: pythonEnv, shell: false, });
        let stdoutBuffer = '';
        let stderrBuffer = '';
        child.stdout.on('data', (data) => { stdoutBuffer += data.toString(); });
        child.stderr.on('data', (data) => { stderrBuffer += data.toString(); });
        child.on('close', async (code) => {
          console.log(`[Python Script] Process finished with code ${code}.`);
          if (stderrBuffer) console.error(`[Python Script] Stderr: ${stderrBuffer}`);
          
          try {
            if (code !== 0) {
              throw new Error(`Python script for gitingest failed with code ${code}. Stderr: ${stderrBuffer}`);
            }

            let digestJson;
            try {
                digestJson = JSON.parse(stdoutBuffer);
                if (!digestJson.files || !Array.isArray(digestJson.files)) {
                    throw new Error("Python script output was not valid or expected JSON structure.");
                }
                console.log(`[Python Script] Successfully parsed JSON output. Found ${digestJson.files.length} files.`);
            } catch (jsonParseError) {
                throw new Error(`Failed to parse JSON output from Python script: ${jsonParseError.message}. Raw output (first 500 chars): ${stdoutBuffer.substring(0, 500)}`);
            }
            
            const digestDir = path.join(__dirname, '..', 'uploads', 'codebase-digests');
            fs.mkdirSync(digestDir, { recursive: true });
            
            const filesInDigestDir = fs.readdirSync(digestDir);
            const projectSpecificPattern = new RegExp(`^project-${projectId}-digest-.*\\.(json|txt)$`);
            for (const file of filesInDigestDir) {
                if (projectSpecificPattern.test(file)) {
                    try {
                        fs.unlinkSync(path.join(digestDir, file));
                        console.log(`[Cleanup] Removed old digest file: ${file}`);
                    } catch (unlinkError) {
                        console.warn(`[Cleanup] Failed to remove old digest file ${file}: ${unlinkError.message}`);
                    }
                }
            }

            const jsonFileName = `project-${projectId}-digest-${Date.now()}.json`;
            const jsonFilePath = path.join(digestDir, jsonFileName);
            fs.writeFileSync(jsonFilePath, JSON.stringify(digestJson, null, 2));
            console.log(`[Digest] Successfully saved JSON digest to ${jsonFilePath}`);

            const rawTextFileName = `project-${projectId}-digest-${Date.now()}.txt`;
            const rawTextFilePath = path.join(digestDir, rawTextFileName);
            fs.writeFileSync(rawTextFilePath, digestJson.fullTextDigest);
            console.log(`[Digest] Successfully saved raw text digest to ${rawTextFilePath}`);

            // --- FINAL, ROBUST FIX: Update nested fields using dot notation ---
            if (!process.env.PINECONE_INDEX_NAME) {
                throw new Error("PINECONE_INDEX_NAME environment variable is not defined. Cannot save to database.");
            }

            const updatedProjectResult = await Project.findByIdAndUpdate(
                projectId,
                {
                    $set: {
                        'codebase.status': 'digest_created',
                        'codebase.jsonDigestFilePath': jsonFilePath,
                        'codebase.rawTextDigestFilePath': rawTextFilePath,
                        'codebase.pineconeIndexName': process.env.PINECONE_INDEX_NAME, // Use dot notation
                        'codebase.lastProcessedAt': new Date(),
                    }
                },
                { new: true, runValidators: true }
            );

            if (updatedProjectResult) {
                console.log(`[Database] Project ${projectId} updated with digest info. Pinecone Index: ${updatedProjectResult.codebase.pineconeIndexName}`);
            } else {
                console.warn(`[Database] Project ${projectId} not found for final update after digest creation (findByIdAndUpdate returned null).`);
            }

          } catch (ingestionError) {
              console.error(`❌ FATAL ERROR during gitingest output processing for project ${projectId}:`, ingestionError);
              finalProjectUpdate = await Project.findById(projectId);
              if (finalProjectUpdate) {
                finalProjectUpdate.codebase.status = 'failed';
                finalProjectUpdate.codebase.lastProcessedAt = new Date();
                await finalProjectUpdate.save();
                console.log(`[Database] Project ${projectId} status set to 'failed'.`);
              } else {
                console.error(`[Database] Project ${projectId} not found, unable to update status to 'failed'.`);
              }
          } finally {
              if (tempDirForPythonScript && fs.existsSync(tempDirForPythonScript)) {
                  try {
                      fs.rmSync(tempDirForPythonScript, { recursive: true, force: true });
                      console.log(`[Cleanup] Removed temporary Python script directory: ${tempDirForPythonScript}`);
                  } catch (rmError) {
                      console.warn(`[Cleanup] Failed to remove temporary Python script directory ${tempDirForPythonScript}: ${rmError.message}`);
                  }
              }
          }
        }); // End of child.on('close')

      } catch (backgroundTaskInitError) {
        console.error(`❌ FATAL ERROR during background preprocessing task initialization for project ${projectId}:`, backgroundTaskInitError);
        finalProjectUpdate = await Project.findById(projectId);
        if (finalProjectUpdate) {
            finalProjectUpdate.codebase.status = 'failed';
            finalProjectUpdate.codebase.lastProcessedAt = new Date();
            await finalProjectUpdate.save();
            console.log(`[Database] Project ${projectId} status set to 'failed' due to initialization error.`);
        } else {
            console.error(`[Database] Project ${projectId} not found for initial error update.`);
        }
      }
    })(); // Immediately invoke the async background function

  } catch (outerControllerError) {
    console.error('Error in syncCodebase controller (outer catch):', outerControllerError); // <<< CORRECTED
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to initiate codebase preprocessing.', error: outerControllerError.message });
    }
    if (project && project.codebase && project.codebase.status === 'pending') {
        project.codebase.status = 'failed';
        await project.save();
        console.log(`[Database] Project ${projectId} status set to 'failed' due to controller error.`);
    }
  }
};

// --- NEW: Helper function for text chunking ---
function chunkText(text, chunkSize, overlap) {
    if (text.length <= chunkSize) {
        return [text];
    }
    const chunks = [];
    let i = 0;
    while (i < text.length) {
        chunks.push(text.substring(i, i + chunkSize));
        i += chunkSize - overlap;
    }
    return chunks;
}


/**
 * Ingests preprocessed codebase data from the JSON digest file into Weaviate (using local embeddings).
 * @route POST /api/projects/:id/codebase/ingest-weaviate
 * @access Private (admin only)
 */
const ingestToPinecone = async (req, res) => {
  const { id: projectId } = req.params;
  const { role } = req.user;

  // --- 1. VALIDATION AND SETUP ---
  if (role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Only admins can ingest codebases.' });
  }
  if (!pineconeClient) {
    return res.status(500).json({ message: 'Pinecone client is not initialized. Check server startup logs.' });
  }
  if (!textEmbeddingPipeline) {
    return res.status(500).json({ message: 'Local text embedding pipeline is not initialized.' });
  }

  let project;
  try {
    project = await Project.findById(projectId);
    if (!project || project.codebase.status !== 'digest_created' || !project.codebase.jsonDigestFilePath) {
      return res.status(400).json({ message: 'Codebase digest not created. Please run "Sync Codebase" first.' });
    }
    if (!project.codebase.pineconeIndexName) {
        return res.status(500).json({ message: 'Pinecone index name not found in project codebase data.' });
    }

    project.codebase.status = 'syncing_pinecone';
    await project.save();

    res.status(200).json({
      message: 'Pinecone ingestion started. This may take some time.',
      project: { id: project._id, codebase: project.codebase }
    });

    // --- 2. BACKGROUND PINECONE INGESTION PROCESS ---
    (async (client, embedder) => {
      let finalProjectUpdate;
      const indexName = project.codebase.pineconeIndexName;
      try {
        const jsonFilePath = project.codebase.jsonDigestFilePath;
        const rawJsonData = fs.readFileSync(jsonFilePath, 'utf8');
        const digestJson = JSON.parse(rawJsonData);

        if (!digestJson.files || digestJson.files.length === 0) {
          throw new Error('No files found in the JSON digest to ingest.');
        }

        console.log(`[Pinecone] Starting ingestion for index: ${indexName} with ${digestJson.files.length} files.`);

        // --- Get a reference to the Pinecone Index ---
        const index = client.index(indexName);

        // --- Prepare Vectors for Batch Upsert ---
        const vectorsToUpsert = [];
        const PINECONE_METADATA_LIMIT = 40000; // Be conservative with the 40960 byte limit
        const CHUNK_SIZE = 1000; // Chunk size in characters
        const CHUNK_OVERLAP = 200; // Overlap between chunks


        for (const fileData of digestJson.files) {
          if (!fileData.content || fileData.content.trim().length === 0) continue;
          
         // --- NEW: Chunking Logic ---
          const textChunks = chunkText(fileData.content, CHUNK_SIZE, CHUNK_OVERLAP);
          
          for (let i = 0; i < textChunks.length; i++) {
            const chunk = textChunks[i];
            
            // Check if this chunk's content (as metadata) is under the limit
            if (Buffer.byteLength(chunk, 'utf8') > PINECONE_METADATA_LIMIT) {
                console.warn(`[Pinecone] Skipping chunk from file ${fileData.path} because it exceeds the metadata size limit even after chunking.`);
                continue;
            }


          const embedding = await embedder(chunk, { pooling: 'mean', normalize: true });
          const vector = Array.from(embedding.data);


           vectorsToUpsert.push({
              id: `${projectId}-${fileData.path.replace(/[^a-zA-Z0-9]/g, '_')}-chunk${i}`, // Unique ID for each chunk
              values: vector,
              metadata: {
                content: chunk, // Store the smaller chunk, not the full file content
                path: fileData.path,
                repoUrl: digestJson.repoUrl,
                projectId: projectId.toString(),
              },
            });
          }
          // --- END NEW ---
        }
        
        
        if (vectorsToUpsert.length > 0) {
          console.log(`[Pinecone] Attempting to upsert ${vectorsToUpsert.length} vectors (from chunking) to index '${indexName}'.`);
          
          // Pinecone upserts work best in smaller batches
          const batchSize = 100;
          for (let i = 0; i < vectorsToUpsert.length; i += batchSize) {
              const batch = vectorsToUpsert.slice(i, i + batchSize);
              await index.upsert(batch);
              console.log(`[Pinecone] Upserted batch ${i / batchSize + 1} of ${Math.ceil(vectorsToUpsert.length / batchSize)}`);
          }

          console.log(`[Pinecone] Successfully upserted all ${vectorsToUpsert.length} vectors.`);
        } else {
            console.warn('[Pinecone] No valid vectors were prepared for upsertion into index.');
        }


        // --- Finalize Project Status ---
        finalProjectUpdate = await Project.findById(projectId);
        if (finalProjectUpdate) {
          finalProjectUpdate.codebase.status = 'completed';
          finalProjectUpdate.codebase.lastProcessedAt = new Date();
          await finalProjectUpdate.save();
          console.log(`[Pinecone] Project ${projectId} status set to 'completed'.`);
        }
      } catch (ingestionError) {
        console.error(`❌ FATAL ERROR during Pinecone ingestion for project ${projectId}:`, ingestionError);
        finalProjectUpdate = await Project.findById(projectId);
        if (finalProjectUpdate) {
          finalProjectUpdate.codebase.status = 'failed';
          finalProjectUpdate.codebase.lastProcessedAt = new Date();
          await finalProjectUpdate.save();
          console.log(`[Pinecone] Project ${projectId} status set to 'failed'.`);
        }
      }
    })(pineconeClient, textEmbeddingPipeline);

  } catch (outerError) {
    console.error('Error in ingestToPinecone controller (outer catch):', outerError);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to initiate Pinecone ingestion.', error: outerError.message });
    }
  }
};

/**
 * Asks a question about the codebase, retrieving answers from Weaviate via RAG (using local embedding).
 * @route POST /api/projects/:id/codebase/ask
 * @access Private (admin only)
 */

const askCodebasePinecone = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { question } = req.body;
    const { role } = req.user;

    // --- 1. VALIDATION AND SETUP ---
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only admins can query the codebase.' });
    }
    if (!pineconeClient) {
      return res.status(500).json({ message: 'Pinecone client is not initialized.' });
    }
    if (!textEmbeddingPipeline) {
      return res.status(500).json({ message: 'Local text embedding pipeline is not initialized.' });
    }

    const project = await Project.findById(projectId);
    if (!project || project.codebase.status !== 'completed' || !project.codebase.pineconeIndexName) {
      return res.status(400).json({ message: `Codebase ingestion is not complete. Current status: ${project.codebase?.status || 'N/A'}` });
    }

    // --- 2. RETRIEVE CONTEXT FROM PINECONE ---
    const indexName = project.codebase.pineconeIndexName;
    const index = pineconeClient.index(indexName);

    console.log(`[Pinecone Query] Generating embedding for question: "${question}"`);
        
// --- CRITICAL FIX: Create a more specific query string for embedding ---
    const specificQuery = `Code snippet from a file named PublicProfilePage.js: ${question}`;
    console.log(`[Pinecone Query] Generating embedding for specific query: "${specificQuery}"`);
    const questionEmbedding = await textEmbeddingPipeline(specificQuery, { pooling: 'mean', normalize: true });
    const questionVector = Array.from(questionEmbedding.data);
    // --- END CRITICAL FIX ---

  
    
    const queryResponse = await index.query({
      vector: questionVector,
      topK: 15,
      includeMetadata: true,
    });

    const searchResults = queryResponse.matches || [];
    console.log(`[Pinecone Query] Received ${searchResults.length} search results from index '${indexName}'.`);

    if (searchResults.length === 0) {
      console.warn(`[Pinecone Query] No relevant search results found for project ${projectId}.`);
      return res.status(200).json({ answer: 'No relevant code snippets were found for your question in the ingested codebase.' });
    }

    // --- CRITICAL FIX: Log the metadata and ensure content is retrieved ---
    const context = searchResults.map(match => {
      console.log('[Pinecone Query] Retrieved match metadata:', match.metadata); // <<< NEW LOG

      const path = match.metadata?.path || 'N/A';
      const content = match.metadata?.content || `[Error: Content not found in metadata for path ${path}]`; // More explicit error

      return `File: ${path}\n\n${content}`;
    }).join('\n\n---\n\n');
    // --- END CRITICAL FIX ---

    // --- 3. CONSTRUCT RAG PROMPT AND CALL GEMINI ---
    const ragPrompt = `You are an expert software developer and senior architect. Your task is to answer a question about a codebase, using the provided context. The context consists of relevant code snippets retrieved from a vector database.

**Instructions:**
1.  Analyze the user's question carefully.
2.  Review the provided code snippets (context).
3.  Formulate a clear, concise, and accurate answer.
4.  If the context includes relevant code, incorporate it into your answer using markdown for formatting.
5.  If the context is insufficient to answer the question, state that you cannot provide an answer based on the available information.

**User's Question:**
${question}

**Retrieved Context (Code Snippets):**
---
${context}
---

**Your Answer:`;

    // --- NEW: Log the final prompt before sending to Gemini ---
    console.log(`[Gemini Generation] Sending final prompt to Gemini for project ${projectId}:`);
    console.log("==================== START OF PROMPT ====================");
    console.log(ragPrompt);
    console.log("===================== END OF PROMPT =====================");
    // --- END NEW ---

    const result = await generativeModel.generateContent(ragPrompt);
    const answer = result.response.text();
    console.log(`[Gemini Generation] Answer received for project ${projectId}.`);

    res.status(200).json({ answer });

  } catch (error) {
    console.error('Error in askCodebasePinecone controller:', error);
    res.status(500).json({ message: 'An error occurred while processing your question.', error: error.message });
  }
};




module.exports = { createProject, createDraft, updateDraft, updateProject, submitProject, getProject, getProjectSummary, listProjects, uploadAttachments, submitAdminReview, confirmProject, rejectProject, submitReview, tokenizeProject, generateContract, downloadContract, syncCodebase, ingestToPinecone, askCodebasePinecone, };