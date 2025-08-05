// Dashboard service for frontend
import api from './api';

// Mock data for dashboard
const mockRecentActivity = [
  {
    id: '1',
    title: 'Login detected',
    description: 'Successful login from New York, USA',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    type: 'login'
  },
  {
    id: '2',
    title: 'Profile updated',
    description: 'You updated your profile information',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    type: 'update'
  },
  {
    id: '3',
    title: 'Document uploaded',
    description: 'New tax document was uploaded',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    type: 'document'
  }
];

const dashboardService = {
  // Get recent activity
  getRecentActivity: async () => {
    try {
      // In a real app, this would call the API
      // const response = await api.get('/dashboard/activity');
      // return response.data;
      
      // For now, return mock data
      return mockRecentActivity;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  },
  
  // Get unverified corporate users with pagination, filtering and sorting
  getUnverifiedCorporates: async (params = {}) => {
    try {
      // Track performance
      const startTime = performance.now();
      console.log('Fetching unverified corporates with params:', params);
      
      // Default parameters if not provided
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        sort: params.sort || 'newest',
        ...params
      };
      
      // Make API call
      const response = await api.get('/admin/unverified-corporates', { params: queryParams });
      
      // Track performance
      const endTime = performance.now();
      console.log(`API call to fetch unverified corporates completed in ${endTime - startTime}ms`);
      console.log('Unverified corporates response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching unverified corporates:', error);
      throw error;
    }
  },
  
  // Approve a corporate user
  approveCorporate: async (userId) => {
    try {
      // Track performance
      const startTime = performance.now();
      console.log(`Approving corporate user with ID: ${userId}`);
      
      const response = await api.post(`/admin/corporates/${userId}/approve`);
      
      // Track performance
      const endTime = performance.now();
      console.log(`API call to approve corporate user completed in ${endTime - startTime}ms`);
      
      return response.data;
    } catch (error) {
      console.error('Error approving corporate user:', error);
      throw error;
    }
  },
  
  // Reject a corporate user
  rejectCorporate: async (userId, data = {}) => {
    try {
      // Validate userId
      if (!userId) {
        throw new Error('User ID is required for rejection');
      }
      
      // Ensure userId is a string
      const userIdStr = String(userId).trim();
      
      // Construct the API URL
      const apiUrl = `/admin/corporates/${userIdStr}/reject`;
      
      // Make the API call
      const response = await api.post(apiUrl, data);
      
      return response.data;
    } catch (error) {
      console.error('Error rejecting corporate user:', error);
      throw error;
    }
  }
};

// Legacy methods for backward compatibility
export const legacyDashboardService = {
  getUnverifiedUsers: dashboardService.getUnverifiedCorporates,
  verifyUser: dashboardService.approveCorporate,
  rejectUser: dashboardService.rejectCorporate
};

export default dashboardService;