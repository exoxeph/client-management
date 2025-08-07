/**
 * Projects Controller
 * This controller handles project-related operations
 */

const Project = require('../models/Project');
const mongoose = require('mongoose');

/**
 * Create a new project
 * @route POST /api/projects
 * @access Private (corporate, individual)
 */
const createProject = async (req, res) => {
  try {
    // Extract user info from auth middleware
    const { id: ownerUserId, role } = req.user;

    // Validate role
    if (role !== 'corporate' && role !== 'individual') {
      return res.status(403).json({ message: 'Only corporate and individual users can create projects' });
    }

    // Create new project
    const project = new Project({
      ownerUserId,
      ownerRole: role,
      status: 'draft',
      verdict: 'none',
      ...req.body,
      activityLog: [
        {
          at: new Date(),
          type: 'project_created',
          by: ownerUserId,
          note: 'Project created'
        }
      ]
    });

    // Save the project
    await project.save();

    res.status(201).json({
      message: 'Project created successfully',
      projectId: project._id,
      status: project.status
    });
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
    // Extract user info from auth middleware
    const { id: ownerUserId, role } = req.user;

    // Validate role (should be handled by middleware, but double-check)
    if (role !== 'corporate' && role !== 'individual') {
      return res.status(403).json({ message: 'Only corporate and individual users can create projects' });
    }

    // Fetch user contact information based on role
    let contactInfo = { name: '', email: '' };
    
    if (role === 'corporate') {
      // Get corporate user info
      const Corporate = require('../models/Corporate');
      const corporate = await Corporate.findOne({ user: ownerUserId });
      
      if (corporate && corporate.primaryContact) {
        contactInfo.name = corporate.primaryContact.name;
        contactInfo.email = corporate.primaryContact.email;
      }
    } else if (role === 'individual') {
      // Get individual user info
      const Individual = require('../models/Individual');
      const individual = await Individual.findOne({ user: ownerUserId });
      
      if (individual) {
        contactInfo.name = individual.fullName;
        contactInfo.email = individual.email;
      }
    }

    // Create initial project with minimal data
    const project = new Project({
      ownerUserId,
      ownerRole: role,
      status: 'draft',
      verdict: 'none',
      // Add any initial data from request body
      ...req.body,
      // Add contact information automatically
      contacts: {
        name: contactInfo.name,
        email: contactInfo.email
      },
      // Add initial activity log entry
      activityLog: [
        {
          at: new Date(),
          type: 'draft_created',
          by: ownerUserId,
          note: 'Project draft created'
        }
      ]
    });

    // Save the project
    await project.save();

    // Return the project ID for future updates
    res.status(201).json({
      message: 'Project draft created successfully',
      projectId: project._id,
      _id: project._id, // Include _id for consistent frontend handling
      numericProjectId: project.projectId,
      status: project.status
    });
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

    console.log('Updating draft project:', projectId);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    // Find the project
    const project = await Project.findById(projectId);

    // Check if project exists
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the owner
    if (project.ownerUserId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    // Check if project is in draft status
    if (project.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft projects can be updated' });
    }

    // Create update data object from request body
    // The frontend sends a properly formatted nested structure via formatProjectData
    const updateData = {};
    
    // Extract all fields from request body that match our schema
    // This ensures we capture the complete nested structure provided by the frontend
    // Instead of iterating through allowedFields, directly check for each main section
    // to ensure we're handling the nested structure correctly
    if (req.body.overview) {
      updateData.overview = req.body.overview;
      console.log('Processing overview:', JSON.stringify(updateData.overview, null, 2));
    }
    
    if (req.body.scope) {
      updateData.scope = req.body.scope;
      console.log('Processing scope:', JSON.stringify(updateData.scope, null, 2));
    }
    
    if (req.body.technical) {
      updateData.technical = req.body.technical;
      console.log('Processing technical:', JSON.stringify(updateData.technical, null, 2));
    }
    
    if (req.body.timelineBudget) {
      updateData.timelineBudget = req.body.timelineBudget;
      console.log('Processing timelineBudget:', JSON.stringify(updateData.timelineBudget, null, 2));
    }
    
    if (req.body.legal) {
      updateData.legal = req.body.legal;
      console.log('Processing legal:', JSON.stringify(updateData.legal, null, 2));
    }
    
    if (req.body.repos) {
      updateData.repos = req.body.repos;
      console.log('Processing repos:', JSON.stringify(updateData.repos, null, 2));
    }
    
    // Handle contacts field specially to ensure it's not empty
    if (req.body.contacts) {
      // If contacts is provided in the request, use it
      updateData.contacts = req.body.contacts;
      console.log('Processing contacts:', JSON.stringify(updateData.contacts, null, 2));
    } else if (!project.contacts || !project.contacts.name || !project.contacts.email) {
      // If contacts is not in the request and the project doesn't have valid contacts,
      // fetch user contact information based on role
      let contactInfo = { name: '', email: '' };
      
      if (project.ownerRole === 'corporate') {
        // Get corporate user info
        const Corporate = require('../models/Corporate');
        const corporate = await Corporate.findOne({ user: project.ownerUserId });
        
        if (corporate && corporate.primaryContact) {
          contactInfo.name = corporate.primaryContact.name;
          contactInfo.email = corporate.primaryContact.email;
        }
      } else if (project.ownerRole === 'individual') {
        // Get individual user info
        const Individual = require('../models/Individual');
        const individual = await Individual.findOne({ user: project.ownerUserId });
        
        if (individual) {
          contactInfo.name = individual.fullName;
          contactInfo.email = individual.email;
        }
      }
      
      // Only update contacts if we found valid information
      if (contactInfo.name && contactInfo.email) {
        updateData.contacts = contactInfo;
        console.log('Using default contacts:', JSON.stringify(updateData.contacts, null, 2));
      }
    }

    console.log('Update data prepared:', JSON.stringify(updateData, null, 2));

    // Add activity log entry
    const activityLogEntry = {
      at: new Date(),
      type: 'draft_updated',
      by: userId,
      note: 'Project draft updated'
    };

    // Check if updateData is empty (no valid fields to update)
    if (Object.keys(updateData).length === 0) {
      console.log('No valid fields to update');
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    // Ensure we're not trying to update with invalid data
    try {
      // Validate the update data against our schema
      const tempProject = new Project({
        ...project.toObject(),
        ...updateData
      });
      await tempProject.validate();
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({ 
        message: 'Validation error', 
        error: validationError.message 
      });
    }

    // Update the project
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        $set: updateData,
        $push: { activityLog: activityLogEntry }
      },
      { new: true, runValidators: true }
    );

    console.log('Project updated successfully');

    res.status(200).json({
      message: 'Project draft updated successfully',
      projectId: updatedProject._id,
      _id: updatedProject._id, // Include _id for consistent frontend handling
      numericProjectId: updatedProject.projectId,
      status: updatedProject.status
    });
  } catch (error) {
    console.error('Error updating project draft:', error);
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

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    // Find the project
    const project = await Project.findById(projectId);

    // Check if project exists
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the owner
    if (project.ownerUserId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to submit this project' });
    }

    // Check if project is in draft status
    if (project.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft projects can be submitted' });
    }

    // Validate required fields before submission
    const requiredSections = ['overview', 'scope', 'technical', 'timelineBudget', 'contacts'];
    const missingFields = [];

    // Check if overview section is complete
    if (!project.overview || !project.overview.title || !project.overview.type || !project.overview.description || !project.overview.goal) {
      missingFields.push('overview (title, type, description, goal)');
    }

    // Check if contacts section is complete
    if (!project.contacts || !project.contacts.name || !project.contacts.email) {
      missingFields.push('contacts (name, email)');
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Project is incomplete. Please complete all required fields before submission.',
        missingFields
      });
    }

    // Add activity log entry
    const activityLogEntry = {
      at: new Date(),
      type: 'project_submitted',
      by: userId,
      note: 'Project submitted for review'
    };

    // Update the project status to submitted
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        $set: { 
          status: 'submitted',
          verdict: 'pending'
        },
        $push: { activityLog: activityLogEntry }
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Project submitted successfully',
      projectId: updatedProject._id,
      _id: updatedProject._id, // Include _id for consistent frontend handling
      numericProjectId: updatedProject.projectId,
      status: updatedProject.status,
      verdict: updatedProject.verdict
    });
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

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: 'invalid_request', message: 'Invalid project ID' });
    }

    // Find the project
    const project = await Project.findById(projectId);

    // Check if project exists
    if (!project) {
      return res.status(404).json({ error: 'not_found', message: 'Project not found' });
    }

    // Check if user is authorized to view this project
    // If user is admin or project_manager, allow access without ownership check
    if (role !== 'admin' && role !== 'project_manager') {
      // For corporate/individual users, check ownership
      if (role === 'corporate' || role === 'individual') {
        if (project.ownerUserId.toString() !== userId) {
          return res.status(403).json({ error: 'forbidden', reason: 'ownership', message: 'Not authorized to view this project' });
        }
      } else {
        // For other roles that are neither admin/project_manager nor corporate/individual
        return res.status(403).json({ error: 'forbidden', reason: 'role', message: 'Not authorized to view this project' });
      }
    }

    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
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

    // Build the match stage based on user role
    let matchStage = {};
    
    // For admin/project_manager with admin=true query param, don't filter by ownerUserId
    // For corporate/individual users, only show their own projects
    if ((role === 'admin' || role === 'project_manager') && isAdminQuery) {
      // Admin and project managers can see all projects
      // No longer forcing verdict=pending filter for admin users
      console.log('Admin query detected in summary, showing all projects');
      // Empty matchStage means no filtering
    } else {
      // For non-admin users or admin without admin=true, filter by ownerUserId
      matchStage = { ownerUserId: new mongoose.Types.ObjectId(userId) };
    }

    // Aggregate projects by status for the current user
    const summary = await Project.aggregate([
      // Match projects based on the constructed match stage
      { $match: matchStage },
      // Group by status and verdict and count
      { $group: {
          _id: { status: '$status', verdict: '$verdict' },
          count: { $sum: 1 }
        }
      },
      // Reshape the output
      { $project: {
          _id: 0,
          status: '$_id.status',
          verdict: '$_id.verdict',
          count: 1
        }
      }
    ]);

    // Convert to object with status and verdict as keys
    const result = {
      draft: 0,
      submitted: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      // Verdict counts
      none: 0,
      pending: 0,
      confirmed: 0,
      rejected_verdict: 0,
      // Map to frontend status names
      get pending_status() { return this.submitted + this.under_review; },
      get confirmed_status() { return this.approved; }
    };

    // Fill in the counts from the aggregation
    summary.forEach(item => {
      // Update status counts
      result[item.status] = (result[item.status] || 0) + item.count;
      
      // Update verdict counts (use rejected_verdict to avoid name collision)
      if (item.verdict === 'rejected') {
        result.rejected_verdict = (result.rejected_verdict || 0) + item.count;
      } else {
        result[item.verdict] = (result[item.verdict] || 0) + item.count;
      }
    });

    // Calculate total projects
    const total = summary.reduce((acc, item) => acc + item.count, 0);
    
    // Return the summary with normalized status names and total
    res.status(200).json({
      total: total,
      status: {
        pending: result.pending_status,
        confirmed: result.confirmed_status,
        rejected: result.rejected
      },
      verdict: {
        none: result.none,
        pending: result.pending,
        confirmed: result.confirmed,
        rejected: result.rejected_verdict
      }
    });
  } catch (error) {
    console.error('Error fetching project summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * List projects with filtering, search, pagination, and sorting
 * @route GET /api/projects
 * @route GET /api/projects/all
 * @route GET /api/projects/pending
 * @access Private (corporate, individual, admin)
 */
const listProjects = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const isAllRoute = req.path === '/all';
    const isPendingRoute = req.path === '/pending';
    const { status = 'all', verdict = isPendingRoute ? 'pending' : 'all', q = '', page = 1, limit = 10, sort = 'updatedAt:desc' } = req.query;
    const isAdminQuery = req.query.admin === 'true';
    // Parse pagination parameters (only if not the /all route)
    const pageNum = isAllRoute ? 1 : parseInt(page, 10);
    const limitNum = isAllRoute ? 0 : Math.min(parseInt(limit, 10), 100); // Cap at 100 items, 0 means no limit
    const skip = isAllRoute ? 0 : (pageNum - 1) * limitNum;

    // Build the filter
    // For admin or project_manager users, don't filter by ownerUserId to see all projects
    // For corporate/individual users, only show their own projects
    let filter = {};

    if (role === 'admin' || role === 'project_manager') {
      // Admin and project managers can see all projects
      // No longer forcing verdict=pending filter for admin users
      if (isAdminQuery) {
        console.log('Admin query detected, but not forcing verdict filter');
      }
    } else {
      // Limit to user's own projects
      filter.ownerUserId = userId;
    }

 

    // Add status filter if not 'all'
    if (status !== 'all') {
      // Map frontend status names to backend status values
      if (status === 'pending') {
        filter.status = { $in: ['submitted', 'under_review'] };
      } else if (status === 'confirmed') {
        filter.status = 'approved';
      } else if (status === 'rejected') {
        filter.status = 'rejected';
      } else {
        filter.status = status; // For 'draft' or any direct match
      }
    }

    // Add verdict filter if not 'all' or if it's the pending route
    // Apply verdict filter for all queries including admin=true
    if (verdict !== 'all') {
      filter.verdict = verdict;
    }


    // Add text search if query is provided
    if (q) {
      // Search across multiple fields: title, description, and type
      filter['$or'] = [
        { 'overview.title': { $regex: q, $options: 'i' } },
        { 'overview.description': { $regex: q, $options: 'i' } },
        { 'overview.type': { $regex: q, $options: 'i' } }
      ];
    }

    // Parse sort parameter
    const [sortField, sortOrder] = sort.split(':');
    const sortOptions = {
      [sortField]: sortOrder === 'desc' ? -1 : 1
    };

    // Execute the query with pagination (if not /all route)
    const query = Project.find(filter)
      .sort(sortOptions)
      .select('ownerUserId ownerRole status verdict reviews overview timelineBudget updatedAt createdAt projectId')
    
    // Apply pagination if not /all route
    if (!isAllRoute) {
      query.skip(skip).limit(limitNum);
    }
    
    const projects = await query;

    // Log projects before sending to frontend
    console.log("✅ Final projects being sent to frontend:", projects);
    
    // For /all or /pending route, return just the array of projects
    if (isAllRoute || isPendingRoute) {
      return res.status(200).json(projects);
    }
    
    // For regular route, return paginated format
    // Get total count for pagination
    const total = await Project.countDocuments(filter);

    // The projects are already logged above before the route check
    res.status(200).json({
      items: projects,
      page: pageNum,
      limit: limitNum,
      total
    });
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

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    // Find the project
    const project = await Project.findById(projectId);

    // Check if project exists
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the owner
    if (project.ownerUserId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    // Check if project is in draft status
    if (project.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft projects can be updated' });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Process uploaded files
    const attachments = req.files.map(file => ({
      filename: file.originalname,
      url: `/uploads/project-attachments/${file.filename}`,
      mime: file.mimetype,
      size: file.size
    }));

    // Add activity log entry
    const activityLogEntry = {
      at: new Date(),
      type: 'attachments_added',
      by: userId,
      note: `${attachments.length} attachment(s) added`
    };

    // Update the project with new attachments
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        $push: { 
          attachments: { $each: attachments },
          activityLog: activityLogEntry
        }
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Attachments uploaded successfully',
      attachments: updatedProject.attachments
    });
  } catch (error) {
    console.error('Error uploading attachments:', error);
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

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    // Find the project
    const project = await Project.findById(projectId);

    // Check if project exists
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if project is in submitted status
    if (project.status !== 'submitted' || project.verdict !== 'pending') {
      return res.status(400).json({ message: 'Only submitted projects with pending verdict can be confirmed' });
    }

    // Add activity log entry
    const activityLogEntry = {
      at: new Date(),
      type: 'project_confirmed',
      by: userId,
      note: 'Project confirmed by admin'
    };

    // Update the project verdict to confirmed
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        $set: { verdict: 'confirmed' },
        $push: { activityLog: activityLogEntry }
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Project confirmed successfully',
      projectId: updatedProject._id,
      _id: updatedProject._id,
      numericProjectId: updatedProject.projectId,
      status: updatedProject.status,
      verdict: updatedProject.verdict
    });
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

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    // Find the project
    const project = await Project.findById(projectId);

    // Check if project exists
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if project is in submitted status
    if (project.status !== 'submitted' || project.verdict !== 'pending') {
      return res.status(400).json({ message: 'Only submitted projects with pending verdict can be rejected' });
    }

    // Add activity log entry
    const activityLogEntry = {
      at: new Date(),
      type: 'project_rejected',
      by: userId,
      note: reason || 'Project rejected by admin'
    };

    // Update the project verdict to rejected
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        $set: { verdict: 'rejected' },
        $push: { activityLog: activityLogEntry }
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Project rejected successfully',
      projectId: updatedProject._id,
      _id: updatedProject._id,
      numericProjectId: updatedProject.projectId,
      status: updatedProject.status,
      verdict: updatedProject.verdict
    });
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

    console.log(`Review submission attempt - Project ID: ${projectId}, User ID: ${userId}`);
    console.log('Review data:', { rating, comment });
    console.log('Request body:', req.body);

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      console.log(`Invalid project ID: ${projectId}`);
      return res.status(400).json({ error: 'invalid_request', message: 'Invalid project ID' });
    }

    // Validate review data - more strict validation
    if (rating === undefined || rating === null) {
      console.log('Missing rating in review submission');
      return res.status(400).json({ error: 'invalid_request', message: 'Rating is required' });
    }
    
    if (!comment || comment.trim() === '') {
      console.log('Missing or empty comment in review submission');
      return res.status(400).json({ error: 'invalid_request', message: 'Comment is required' });
    }

    // Find the project
    const project = await Project.findById(projectId);

    // Check if project exists
    if (!project) {
      console.log(`Project not found with ID: ${projectId}`);
      return res.status(404).json({ error: 'not_found', message: 'Project not found' });
    }

    console.log(`Project found - Title: ${project.overview?.title || 'Untitled'}, Verdict: ${project.verdict}`);

    // Check if project verdict is confirmed
    if (project.verdict !== 'confirmed') {
      console.log(`Cannot review project with verdict: ${project.verdict}`);
      return res.status(400).json({ error: 'invalid_request', message: 'Only confirmed projects can be reviewed' });
    }

    // Convert both IDs to strings for consistent comparison
    const userIdStr = userId.toString();
    
    // Check if user has already submitted a review
    const existingReview = project.reviews.find(review => {
      // Ensure review.userId exists and convert to string
      return review.userId && review.userId.toString() === userIdStr;
    });
    
    if (existingReview) {
      console.log(`User ${userIdStr} has already submitted a review for project ${projectId}`);
      return res.status(400).json({ error: 'invalid_request', message: 'You have already submitted a review for this project' });
    }

    // Add the review to the project
    const newReview = {
      userId,
      rating: Number(rating), // Ensure rating is a number
      comment,
      createdAt: new Date()
    };
    
    project.reviews.push(newReview);
    console.log('New review added:', newReview);

    // Add to activity log
    const activityEntry = {
      at: new Date(),
      type: 'review_submitted',
      by: userId,
      note: `Review submitted with rating ${rating}/5`
    };
    
    project.activityLog.push(activityEntry);
    console.log('Activity log updated:', activityEntry);

    // Save the project
    await project.save();
    console.log(`Project ${projectId} saved with new review`);

    res.status(201).json({
      message: 'Review submitted successfully',
      review: {
        userId: userIdStr, // Use the already converted string ID
        rating: Number(rating),
        comment,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'server_error', message: 'Server error occurred while submitting review', details: error.message });
  }
};

module.exports = {
  createDraft,
  updateDraft,
  submitProject,
  getProject,
  getProjectSummary,
  listProjects,
  uploadAttachments,
  createProject,
  confirmProject,
  rejectProject,
  submitReview
};