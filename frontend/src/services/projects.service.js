/**
 * Projects Service
 * This file contains methods for making project-related API calls to the backend
 */

import api from './api';
// Project statuses
export const PROJECT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
  ADMIN_COUNTER: "admin-counter",
  CLIENT_COUNTER: "client-counter",
  DRAFT: "draft"
};

// Project verdicts
export const PROJECT_VERDICT = {
  NONE: "none",
  PENDING: "pending",
  CONFIRMED: "confirmed",
  REJECTED: "rejected"
};
// Project types
export const PROJECT_TYPES = {
  WEB: "Web app",
  MOBILE: "Mobile app",
  API: "API",
  DATA: "Data/ML",
  DEVOPS: "DevOps/Cloud",
  UI: "UI/UX",
  OTHER: "Other"
};

/**
 * Get all projects with filtering, search, pagination, and sorting
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (all, pending, confirmed, rejected, draft)
 * @param {string} params.verdict - Filter by verdict (all, none, pending, confirmed, rejected)
 * @param {string} params.q - Search query
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.sort - Sort field and direction (e.g., 'updatedAt:desc')
 * @returns {Promise<Object>} Promise resolving to { items, page, limit, total }
 */
const getProjects = async (params = {}) => {
  try {
    const response = await api.get('/projects', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

/**
 * Get project by ID
 * @param {string} id - Project ID
 * @returns {Promise<Object|null>} Promise resolving to project or null
 */
const getProjectById = async (id) => {
  try {
    console.log('Making API request to fetch project:', id);
    
    if (!id) {
      console.error('Invalid project ID provided:', id);
      throw new Error('Invalid project ID');
    }
    
    // Ensure we're using a clean ID string
    const cleanId = id.toString().trim();
    console.log('Using cleaned project ID for request:', cleanId);
    
    // Validate MongoDB ObjectId format (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(cleanId);
    console.log('Is valid MongoDB ObjectId?', isValidObjectId);
    
    if (!isValidObjectId) {
      console.error('Invalid MongoDB ObjectId format:', cleanId);
      throw new Error('Invalid project ID format');
    }
    
    // Add debug logging to track the full URL being requested
    const requestUrl = `/projects/${cleanId}`;
    console.log('Full request URL:', requestUrl);
    
    const response = await api.get(requestUrl);
    console.log('API response status:', response.status);
    console.log('API response data type:', typeof response.data);
    console.log('API response data:', JSON.stringify(response.data, null, 2));
    
    if (!response.data) {
      console.error('No data returned from API');
      return null;
    }
    
    // Add _id property to the response data for consistent ID handling
    if (!response.data._id && response.data.id) {
      console.log('Adding _id property to response data');
      response.data._id = response.data.id;
    } else if (!response.data._id && !response.data.id) {
      // If neither _id nor id exists, use the ID from the request
      console.log('No ID found in response data, using request ID');
      response.data._id = cleanId;
    }
    
    // Ensure the _id is a string for consistent comparison
    if (response.data._id) {
      response.data._id = response.data._id.toString();
      console.log('Normalized _id for consistent comparison:', response.data._id);
    }
    
    // Ensure arrays are properly initialized
    const arrayFields = ['features', 'userRoles', 'integrations', 'nonFunctionalRequirements', 
                         'acceptanceCriteria', 'successMetrics', 'platforms', 'techStack', 
                         'securityRequirements', 'milestones', 'files', 'repoUrls'];
    
    arrayFields.forEach(field => {
      if (!response.data[field]) {
        console.log(`Initializing missing array field: ${field}`);
        response.data[field] = [];
      } else if (!Array.isArray(response.data[field])) {
        console.log(`Converting non-array field to array: ${field}`);
        response.data[field] = [response.data[field]].filter(Boolean);
      }
    });
    
    // Ensure status field exists
    if (!response.data.status) {
      console.log('Status field missing, setting default status');
      response.data.status = PROJECT_STATUS.DRAFT;
    }
    
    console.log('Returning project data with ID:', response.data._id);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error);
    console.error('Error details:', error.response ? error.response.data : 'No response data');
    
    // For 403 errors, we want to throw the error so it can be handled by the component
    // This ensures the component can display the proper error message
    if (error.response && error.response.status === 403) {
      console.log('Received 403 Forbidden error, throwing to component');
      error.isPermissionError = true;
      throw error;
    }
    
    // For 404 errors, we can return null
    if (error.response && error.response.status === 404) {
      console.log('Handling 404 Not Found error gracefully');
      return null;
    }
    
    throw error;
  }
};

/**
 * Get projects summary counts
 * @param {boolean} isAdmin - Whether to fetch summary for admin view
 * @returns {Promise<Object>} Promise resolving to summary counts
 */
const getProjectsSummary = async (isAdmin = false) => {
  try {
    const url = isAdmin ? '/projects/summary?admin=true' : '/projects/summary';
    console.log('Fetching project summary with URL:', url);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching project summary:', error);
    throw error;
  }
};

/**
 * Format project data to match backend schema
 * @param {Object} projectData - Raw project data from form
 * @returns {Object} Formatted project data
 */
const formatProjectData = (projectData) => {
  // Create a formatted data object that matches the backend schema
  const formattedData = {
    overview: {
      title: projectData.title || '',
      type: projectData.type || '',
      description: projectData.description || '',
      goal: projectData.businessGoal || ''
    },
    scope: {
      features: processArrayField(projectData.features),
      userRoles: processArrayField(projectData.userRoles),
      integrations: processArrayField(projectData.integrations),
      nfr: Array.isArray(projectData.nonFunctionalRequirements) ? projectData.nonFunctionalRequirements.join(', ') : projectData.nonFunctionalRequirements || '',
      acceptanceCriteria: Array.isArray(projectData.acceptanceCriteria) ? projectData.acceptanceCriteria.join(', ') : projectData.acceptanceCriteria || '',
      successMetrics: Array.isArray(projectData.successMetrics) ? projectData.successMetrics.join(', ') : projectData.successMetrics || ''
    },
    technical: {
      platforms: processArrayField(projectData.platforms),
      stack: processArrayField(projectData.techStack),
      hosting: Array.isArray(projectData.hostingPreference) ? projectData.hostingPreference.join(', ') : projectData.hostingPreference || '',
      security: Array.isArray(projectData.securityRequirements) 
        ? projectData.securityRequirements.join(', ') 
        : projectData.securityRequirements || '',
      dataClass: Array.isArray(projectData.dataClassification) ? projectData.dataClassification.join(', ') : projectData.dataClassification || ''
    },
    timelineBudget: {
      startDate: projectData.startDate || null,
      endDate: projectData.endDate || null,
      budgetRange: Array.isArray(projectData.budgetRange) ? projectData.budgetRange.join(', ') : projectData.budgetRange || '',
      paymentModel: Array.isArray(projectData.paymentModel) ? projectData.paymentModel.join(', ') : projectData.paymentModel || '',
      milestones: Array.isArray(projectData.milestones) ? projectData.milestones : []
    },
    contacts: {
      name: Array.isArray(projectData.primaryContact) ? projectData.primaryContact[0].split('@')[0] : projectData.primaryContact ? projectData.primaryContact.split('@')[0] : '',
      email: Array.isArray(projectData.primaryContact) ? projectData.primaryContact[0] : projectData.primaryContact || '',
      commsPreference: Array.isArray(projectData.communicationPreference) ? projectData.communicationPreference[0] : projectData.communicationPreference || 'email'
    }
  };
  
  // Helper function to process array fields
  function processArrayField(field) {
    if (Array.isArray(field)) {
      return field;
    } else if (field && typeof field === 'string') {
      return field.split(',').map(item => item.trim()).filter(item => item);
    } else {
      return [];
    }
  }
  
  // Add repos if available
  if (projectData.repoUrls && projectData.repoUrls.length > 0) {
    formattedData.repos = Array.isArray(projectData.repoUrls) 
      ? projectData.repoUrls.map(url => ({ url }))
      : [{ url: projectData.repoUrls }];
  }
  
  // Add legal information if available
  if (projectData.ndaRequired !== undefined) {
    formattedData.legal = {
      ndaRequired: Boolean(projectData.ndaRequired)
    };
  }
  
  return formattedData;
};

/**
 * Create a new project draft
 * @param {Object} projectData - Project data
 * @returns {Promise<Object>} Promise resolving to created project draft
 */
const createDraft = async (projectData) => {
  try {
    // Validate required fields before sending to backend
    if (!projectData.type) {
      throw new Error('Project type is required');
    }
    if (!projectData.businessGoal) {
      throw new Error('Business goal is required');
    }
    
    const formattedData = formatProjectData(projectData);
    const response = await api.post('/projects/draft', formattedData);
    // Ensure the response includes _id for consistent ID handling
    if (response.data && !response.data._id && response.data.projectId) {
      response.data._id = response.data.projectId;
    }
    return response.data;
  } catch (error) {
    console.error('Error creating project draft:', error);
    throw error;
  }
};

/**
 * Update a project draft
 * @param {string} projectId - Project ID
 * @param {Object} projectData - Project data to update
 * @returns {Promise<Object>} Promise resolving to updated project draft
 */
const updateDraft = async (projectId, projectData) => {
  try {
    // Validate required fields before sending to backend
    if (!projectData.type) {
      throw new Error('Project type is required');
    }
    if (!projectData.businessGoal) {
      throw new Error('Business goal is required');
    }
    
    console.log('Original project data:', JSON.stringify(projectData, null, 2));
    const formattedData = formatProjectData(projectData);
    console.log('Formatted data to send to backend:', JSON.stringify(formattedData, null, 2));
    
    const response = await api.patch(`/projects/${projectId}/draft`, formattedData);
    console.log('Backend response:', JSON.stringify(response.data, null, 2));
    
    // Ensure the response includes _id for consistent ID handling
    if (response.data && !response.data._id && response.data.projectId) {
      response.data._id = response.data.projectId;
    }
    return response.data;
  } catch (error) {
    console.error(`Error updating project draft ${projectId}:`, error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

/**
 * Submit a project for review
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Promise resolving to submitted project
 */
const submitProject = async (projectId) => {
  try {
    const response = await api.post(`/projects/${projectId}/submit`);
    return response.data;
  } catch (error) {
    console.error(`Error submitting project ${projectId}:`, error);
    throw error;
  }
};

// uploadAttachments function has been removed

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
const formatDate = dateString => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

/**
 * Format relative time for display
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time
 */
const formatRelativeTime = dateString => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay > 30) {
    return formatDate(dateString);
  } else if (diffDay > 0) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  } else if (diffHour > 0) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  } else if (diffMin > 0) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else {
    return "Just now";
  }
};

/**
 * Get all projects for the current user
 * @param {boolean} isAdmin - Whether the request is coming from admin dashboard
 * @param {string} verdict - Optional verdict filter (pending, confirmed, rejected, all)
 * @param {string} searchTerm - Optional search term for project title, description, or type
 * @returns {Promise<Array>} Promise resolving to array of projects
 */
const getAllProjects = async (isAdmin = false, verdict = null, searchTerm = null) => {
  try {
    // Build the URL with query parameters
    const params = new URLSearchParams();
    
    // Add admin parameter if needed
    if (isAdmin) {
      params.append('admin', 'true');
    }
    
    // Add verdict filter if provided and not 'all'
    if (verdict && verdict !== 'all') {
      params.append('verdict', verdict);
    }
    
    // Add search term if provided
    if (searchTerm && searchTerm.trim() !== '') {
      params.append('q', searchTerm.trim());
    }
    
    // Determine the base URL
    const baseUrl = isAdmin ? '/projects' : '/projects/all';
    
    // Construct the full URL
    const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    
    console.log('Fetching projects with URL:', url);
    const response = await api.get(url);
    
    // Process the response
    if (!response.data) {
      console.warn('No data returned from API');
      return [];
    }
    
    // Handle different response formats
    if (Array.isArray(response.data)) {
      console.log('Response is an array with', response.data.length, 'items');
      return response.data;
    } 
    
    if (response.data.items && Array.isArray(response.data.items)) {
      console.log('Response has items array with', response.data.items.length, 'items');
      return response.data.items;
    } 
    
    if (typeof response.data === 'object') {
      // Check for paginated response structure
      if (response.data.items && Array.isArray(response.data.items)) {
        console.log('Found paginated items array with', response.data.items.length, 'items');
        return response.data.items;
      }
    }

    console.warn('Unexpected response structure from getAllProjects API:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching all projects:', error);
    throw error;
  }
};


/**
 * Get projects with pending verdict for admin review
 * @returns {Promise<Array>} Promise resolving to array of pending verdict projects
 */
const getPendingVerdictProjects = async () => {
  try {
    // First try the dedicated endpoint for pending verdict projects
    try {
      const response = await api.get('/projects/pending');
      
      // If we get a successful response, process it
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
        return response.data.items;
      }
    } catch (endpointError) {
      console.warn('Pending endpoint failed, falling back to filtered endpoint:', endpointError);
      // If the dedicated endpoint fails, fall back to the filtered approach
    }
    
    // Fallback: Use the existing listProjects endpoint with verdict filter
    const response = await api.get('/projects', { 
      params: { 
        verdict: PROJECT_VERDICT.PENDING,
        limit: 100 // Get a reasonable number of pending projects
      } 
    });
    
    // Check if response.data exists and has the expected structure
    if (response.data && response.data.items) {
      return response.data.items;
    } else if (Array.isArray(response.data)) {
      // If response.data is already an array, return it directly
      return response.data;
    } else {
      // Return empty array if data structure is unexpected
      console.warn('Unexpected response structure from pending verdict projects API:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching pending verdict projects:', error);
    throw error;
  }
};

/**
 * @deprecated Use updateProject(projectId, { verdict: '...' }) instead.
 * Update project verdict (admin only)
 * @param {string} projectId - Project ID
 * @param {string} verdict - New verdict (CONFIRMED or REJECTED)
 * @returns {Promise<Object>} Promise resolving to updated project
 */
const updateProjectVerdict = async (projectId, verdict) => {
  try {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    if (verdict !== PROJECT_VERDICT.CONFIRMED && verdict !== PROJECT_VERDICT.REJECTED) {
      throw new Error('Invalid verdict value');
    }
    
    const endpoint = verdict === PROJECT_VERDICT.CONFIRMED 
      ? `/projects/${projectId}/confirm` 
      : `/projects/${projectId}/reject`;
    
    const response = await api.post(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error updating project verdict to ${verdict}:`, error);
    throw error;
  }
};

/**
 * Submit a review for a project
 * @param {string} projectId - Project ID
 * @param {Object} reviewData - Review data
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {string} reviewData.comment - Review comment
 * @returns {Promise<Object>} Promise resolving to the submitted review
 */
const submitReview = async (projectId, reviewData) => {
  try {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    if (!reviewData || !reviewData.rating || !reviewData.comment) {
      throw new Error('Rating and comment are required');
    }
    
    console.log('Submitting review for project:', projectId);
    console.log('Review data:', JSON.stringify(reviewData));
    
    // Call the actual API endpoint for submitting reviews
    const response = await api.post(`/projects/${projectId}/reviews`, reviewData);
    console.log('Review submission successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting review:', error);
    
    // Enhanced error logging
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    throw error;
  }
};

/**
 * Check if the current user has already reviewed a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Object|null>} Promise resolving to the user's review or null if not found
 */
const getUserReview = async (projectId) => {
  try {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    // Get the project with reviews
    const project = await getProjectById(projectId);
    
    if (!project || !project.reviews) {
      return null;
    }
    
    // Get current user ID from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      return null;
    }
    
    // Find the review by the current user
    // Convert userId to string for proper comparison, with null checks
    const userReview = project.reviews.find(review => {
      // Ensure review and review.userId exist before calling toString()
      if (!review || !review.userId) {
        console.log('Skipping review with missing or invalid userId');
        return false;
      }
      
      // Convert both IDs to strings for consistent comparison
      return review.userId.toString() === user.id.toString();
    });
    return userReview || null;
  } catch (error) {
    console.error('Error getting user review:', error);
    return null;
  }
};

/**
 * Update a project (for counter-offers and verdicts)
 * @param {string} projectId - Project ID
 * @param {Object} updateData - Data to update. Can be project fields for a counter-offer, or { verdict: '...' } for a decision.
 * @returns {Promise<Object>} Promise resolving to the updated project
 */
const updateProject = async (projectId, updateData) => {
  try {
    if (!projectId) {
      throw new Error('Project ID is required for update');
    }
    // The endpoint is PATCH /api/projects/:id
    const response = await api.patch(`/projects/${projectId}`, updateData);
    return response.data;
  } catch (error)
  {
    console.error(`Error updating project ${projectId}:`, error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }
    throw error;
  }
};
const submitAdminReview = async (projectId, reviewData) => {
  try {
    const response = await api.post(`/projects/${projectId}/admin-review`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error submitting admin review:', error);
    throw error;
  }
};


// Export all service functions and constants
export const projectsService = {
  getProjects,
  getProjectById,
  getProjectsSummary,
  createDraft,
  updateDraft,
  submitProject,
  // uploadAttachments removed
  formatDate,
  formatRelativeTime,
  getAllProjects,
  getPendingVerdictProjects,
  updateProjectVerdict,
  updateProject,
  formatProjectData,
  submitReview,
  submitAdminReview,
  getUserReview
};