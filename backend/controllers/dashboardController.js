/**
 * Dashboard Controller
 * This file contains methods for dashboard-related operations
 */

const User = require('../models/User');
const Corporate = require('../models/Corporate');
const Individual = require('../models/Individual');
const mongoose = require('mongoose');

/**
 * @desc    Get current user profile
 * @route   GET /api/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get profile data based on account type
    let profileData = null;
    if (user.profileData) {
      if (user.accountType === 'individual') {
        const Individual = require('../models/Individual');
        profileData = await Individual.findById(user.profileData);
      } else if (user.accountType === 'corporate') {
        profileData = await Corporate.findById(user.profileData);
      }
    }

    // Ensure role is always included and properly set
    const userResponse = {
      id: user._id,
      email: user.email,
      name: profileData ? 
        (profileData.fullName || profileData.companyName) : 
        user.email.split('@')[0],
      role: user.role || user.accountType, // Fallback to accountType if role is missing
      isVerified: user.isVerified,
      accountType: user.accountType // Include accountType for additional context
    };
    
    console.log('Returning user data with role:', userResponse.role);
    
    res.json({
      user: userResponse
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get recent activity
 * @route   GET /api/activity/recent
 * @access  Private
 */
const getRecentActivity = async (req, res) => {
  try {
    // Mock data for now - in a real app, this would fetch from a database
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

    res.json(mockRecentActivity);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get unverified corporate users
 * @route   GET /api/admin/unverified-corporates
 * @access  Private/Admin
 */
const getUnverifiedCorporates = async (req, res) => {
  try {
    const { q, sort = 'newest' } = req.query;
    
    // Find all unverified corporate users
    let query = {
      role: 'corporate',
      isVerified: false
    };
    
    // Apply search filter if provided
    if (q) {
      query.$or = [
        { 'profileData.companyName': { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { 'profileData.headquartersAddress.country': { $regex: q, $options: 'i' } }
      ];
    }
    
    // Find users and populate their profile data
    let users = await User.find(query)
      .populate('profileData')
      .lean();
    
    // Format the response
    const formattedUsers = users.map(user => {
      // Format document URLs to ensure they're properly accessible
      let businessLicenseUrl = user.profileData?.documents?.businessLicense?.filePath;
      let taxDocUrl = user.profileData?.documents?.taxDocument?.filePath;
      
      // If paths exist but don't start with /uploads, prepend it
      if (businessLicenseUrl && !businessLicenseUrl.startsWith('/uploads')) {
        // Extract just the filename from the path
        const pathParts = businessLicenseUrl.split(/[\\/]/);
        const fileName = pathParts[pathParts.length - 1];
        // Use the correct subdirectory
        businessLicenseUrl = `/uploads/business-licenses/${fileName}`;
      }
      
      if (taxDocUrl && !taxDocUrl.startsWith('/uploads')) {
        // Extract just the filename from the path
        const pathParts = taxDocUrl.split(/[\\/]/);
        const fileName = pathParts[pathParts.length - 1];
        // Use the correct subdirectory
        taxDocUrl = `/uploads/tax-documents/${fileName}`;
      }
      
      // Create direct MongoDB document URLs
      const businessLicenseMongoUrl = `/api/admin/documents/${user._id}/businessLicense`;
      const taxDocMongoUrl = `/api/admin/documents/${user._id}/taxDocument`;
      
      return {
        _id: user._id,
        email: user.email,
        companyName: user.profileData?.companyName,
        registrationNumber: user.profileData?.registrationNumber,
        taxId: user.profileData?.taxId,
        phone: user.profileData?.companyPhone,
        country: user.profileData?.headquartersAddress?.country,
        submittedAt: user.createdAt,
        status: 'pending',
        docs: {
          businessLicenseUrl,
          taxDocUrl,
          // Add MongoDB document URLs
          businessLicenseMongoUrl,
          taxDocMongoUrl,
          // Flag to indicate if MongoDB storage is available
          hasMongoData: !!(user.profileData?.documents?.businessLicense?.fileData || 
                          user.profileData?.documents?.taxDocument?.fileData)
        }
      };
    });
    
    // Apply sorting
    if (sort === 'oldest') {
      formattedUsers.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
    } else {
      formattedUsers.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    }
    
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching unverified corporates:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Approve corporate user
 * @route   POST /api/admin/corporates/:id/approve
 * @access  Private/Admin
 */
const approveCorporate = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'corporate') {
      return res.status(400).json({ message: 'User is not a corporate account' });
    }
    
    user.isVerified = true;
    await user.save();
    
    res.json({ success: true, message: 'Corporate account approved successfully' });
  } catch (error) {
    console.error('Error approving corporate account:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Reject corporate user
 * @route   POST /api/admin/corporates/:id/reject
 * @access  Private/Admin
 */
const rejectCorporate = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'corporate') {
      return res.status(400).json({ message: 'User is not a corporate account' });
    }
    
    // In a real app, you might want to:
    // 1. Send an email to the user with the rejection reason
    // 2. Mark the account as rejected instead of deleting it
    // 3. Keep a record of the rejection reason
    
    // For this example, we'll just delete the user
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Corporate account rejected successfully' });
  } catch (error) {
    console.error('Error rejecting corporate account:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get document image directly from MongoDB
 * @route   GET /api/admin/documents/:userId/:docType
 * @access  Private/Admin
 */
const getDocumentImage = async (req, res) => {
  try {
    const { userId, docType } = req.params;
    
    if (!['businessLicense', 'taxDocument'].includes(docType)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }
    
    // Find the user and populate their profile data
    const user = await User.findById(userId)
      .populate('profileData')
      .lean();
    
    if (!user || user.role !== 'corporate') {
      return res.status(404).json({ message: 'Corporate user not found' });
    }
    
    // Get the document from the user's profile
    const document = user.profileData?.documents?.[docType];
    
    if (!document || !document.fileData) {
      // Try to serve from file system as fallback
      if (document && document.filePath) {
        // Extract just the filename from the path and construct a proper URL
        let filePath = document.filePath;
        // Extract the subdirectory (business-licenses or tax-documents) and filename
        const pathParts = filePath.split(/[\\/]/);
        const fileName = pathParts[pathParts.length - 1];
        const subDir = docType === 'businessLicense' ? 'business-licenses' : 'tax-documents';
        // Construct a proper URL path
        filePath = `/uploads/${subDir}/${fileName}`;
        return res.redirect(filePath);
      }
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Set the content type and send the file data
    res.contentType(document.contentType);
    res.send(document.fileData);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMe,
  getRecentActivity,
  getUnverifiedCorporates,
  approveCorporate,
  rejectCorporate,
  getDocumentImage
};