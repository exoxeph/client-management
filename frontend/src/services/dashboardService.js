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
  
  // Get unverified corporate users
  getUnverifiedCorporates: async (params = {}) => {
    try {
      console.log('Fetching unverified corporates with params:', params);
      const response = await api.get('/admin/unverified-corporates', { params });
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
      const response = await api.post(`/admin/corporates/${userId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving corporate user:', error);
      throw error;
    }
  },
  
  // Reject a corporate user
  rejectCorporate: async (userId, data = {}) => {
    try {
      const response = await api.post(`/admin/corporates/${userId}/reject`, data);
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