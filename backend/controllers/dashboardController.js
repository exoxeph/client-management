/**
 * Dashboard Controller
 * This file contains controllers for dashboard-related operations
 */

const User = require('../models/User');
const Corporate = require('../models/Corporate');
const Individual = require('../models/Individual');

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
    
    // Get additional profile data based on user role
    let profileData = null;
    
    if (user.role === 'corporate') {
      profileData = await Corporate.findOne({ user: user._id });
    } else if (user.role === 'individual') {
      profileData = await Individual.findOne({ user: user._id });
    }
    
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      profileData
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

/**
 * @desc    Get recent activity
 * @route   GET /api/activity/recent
 * @access  Private
 */
const getRecentActivity = async (req, res) => {
  try {
    // TODO: Implement real activity tracking
    // For now, return mock data
    const mockActivity = [
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
    
    res.status(200).json(mockActivity);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Error fetching recent activity' });
  }
};

/**
 * @desc    Get unverified corporate users with optimized performance
 * @route   GET /api/admin/unverified-corporates
 * @access  Private/Admin
 */
const getUnverifiedCorporates = async (req, res) => {
  try {
    // Track performance
    const startTime = performance.now();
    
    const { page = 1, limit = 10, sort = 'newest', q } = req.query;
    
    // Build query with proper indexing support
    let query = {
      role: 'corporate',
      isVerified: false
    };
    
    // Apply search filter if provided
    if (q) {
      // Create a text search query
      query.$or = [
        { 'profileData.companyName': { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { 'profileData.headquartersAddress.country': { $regex: q, $options: 'i' } }
      ];
    }
    
    // Determine sort order
    const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    
    // Execute count and find operations in parallel for better performance
    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .populate('profileData')
        .sort(sortOption)
        .skip((page - 1) * Number(limit))
        .limit(Number(limit))
        .lean()
    ]);
    
    // Format document URLs
    const formattedUsers = users.map(user => {
      // Format document URLs
      const businessLicenseUrl = user.profileData?.documents?.businessLicense?.filePath ? 
        `/api/admin/documents/${user._id}/businessLicense` : null;
      
      const taxDocUrl = user.profileData?.documents?.taxDocument?.filePath ? 
        `/api/admin/documents/${user._id}/taxDocument` : null;
      
      // Check if MongoDB data is available
      const hasMongoData = !!(user.profileData?.documents?.businessLicense?.fileData || 
                            user.profileData?.documents?.taxDocument?.fileData);
      
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
          hasMongoData
        }
      };
    });
    
    // Track performance
    const endTime = performance.now();
    
    res.status(200).json({
      users: formattedUsers,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      performance: {
        executionTime: endTime - startTime,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching unverified corporate users:', error);
    res.status(500).json({ message: 'Error fetching unverified corporate users' });
  }
};

/**
 * @desc    Approve corporate user
 * @route   POST /api/admin/corporates/:id/approve
 * @access  Private/Admin
 */
const approveCorporate = async (req, res) => {
  try {
    // Track performance
    const startTime = performance.now();
    
    const { id } = req.params;
    
    // Find the user
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'corporate') {
      return res.status(400).json({ message: 'User is not a corporate user' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }
    
    // Update user verification status
    user.isVerified = true;
    await user.save();
    
    // Log the approval action
    console.log(`Corporate user ${id} approved by admin ${req.user.id} at ${new Date().toISOString()}`);
    
    // Track performance
    const endTime = performance.now();
    
    res.status(200).json({
      message: 'Corporate user approved successfully',
      userId: id,
      performance: {
        executionTime: endTime - startTime,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error approving corporate user:', error);
    res.status(500).json({ message: 'Error approving corporate user' });
  }
};

/**
 * @desc    Reject corporate user
 * @route   POST /api/admin/corporates/:id/reject
 * @access  Private/Admin
 */
const rejectCorporate = async (req, res) => {
  try {
    // Track performance
    const startTime = performance.now();
    
    const { id } = req.params;
    const { reason } = req.body;
    
    // Find the user
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'corporate') {
      return res.status(400).json({ message: 'User is not a corporate user' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'Cannot reject a verified user' });
    }
    
    // Find and delete the corporate profile
    await Corporate.findOneAndDelete({ user: id });
    
    // Delete the user
    await User.findByIdAndDelete(id);
    
    // Log the rejection action
    console.log(`Corporate user ${id} rejected by admin ${req.user.id} at ${new Date().toISOString()}. Reason: ${reason || 'Not provided'}`);
    
    // Track performance
    const endTime = performance.now();
    
    res.status(200).json({
      message: 'Corporate user rejected successfully',
      userId: id,
      performance: {
        executionTime: endTime - startTime,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error rejecting corporate user:', error);
    res.status(500).json({ message: 'Error rejecting corporate user' });
  }
};

/**
 * @desc    Get document image
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
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // If fileData exists in MongoDB, serve it directly
    if (document.fileData) {
      console.log(`Serving ${docType} from MongoDB for user ${userId}`);
      
      // Log content type and buffer length for debugging
      console.log('Content-Type:', document.contentType);
      console.log('Buffer length:', document.fileData.length);
      
      // Set proper headers
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Content-Type', document.contentType || 'image/png'); // Use a safe fallback
      
      // Ensure we're sending a proper buffer
      return res.send(Buffer.from(document.fileData));
    }
    
    // If no fileData but filePath exists, serve from file system
    if (document.filePath) {
      console.log(`Serving ${docType} from file system for user ${userId}`);
      // Extract just the filename from the path and construct a proper URL
      let filePath = document.filePath;
      // Extract the subdirectory (business-licenses or tax-documents) and filename
      const pathParts = filePath.split(/[\/\\]/);
      const fileName = pathParts[pathParts.length - 1];
      const subDir = docType === 'businessLicense' ? 'business-licenses' : 'tax-documents';
      // Construct a proper URL path
      filePath = `/uploads/${subDir}/${fileName}`;
      return res.redirect(filePath);
    }
    
    // If neither fileData nor filePath exists
    return res.status(404).json({ message: 'Document data not found' });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get unverified corporate users with pagination and caching
 * @route   GET /api/admin/unverified-corporate-users
 * @access  Private/Admin
 */
const getUnverifiedCorporateUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'newest', q } = req.query;

    const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    
    // Build query with proper indexing support
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

    const [total, corporates] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .populate('profileData')
        .sort(sortOption)
        .skip((page - 1) * Number(limit))
        .limit(Number(limit))
        .select('email profileData createdAt')
        .lean()
    ]);

    // Format the response
    const formattedUsers = corporates.map(user => {
      // Check if documents exist and have either fileData or filePath
      const hasBusinessLicense = !!(user.profileData?.documents?.businessLicense?.fileData || 
                                  user.profileData?.documents?.businessLicense?.filePath);
      const hasTaxDocument = !!(user.profileData?.documents?.taxDocument?.fileData || 
                              user.profileData?.documents?.taxDocument?.filePath);
      
      // Check if MongoDB data is available for either document
      const hasMongoData = !!(user.profileData?.documents?.businessLicense?.fileData || 
                           user.profileData?.documents?.taxDocument?.fileData);
      
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
        // Add document URLs with proper API endpoints
        docs: {
          businessLicenseUrl: hasBusinessLicense ? `/api/admin/documents/${user._id}/businessLicense` : null,
          taxDocUrl: hasTaxDocument ? `/api/admin/documents/${user._id}/taxDocument` : null,
          hasMongoData
        }
      };
    });

    res.status(200).json({ 
      total, 
      corporates: formattedUsers,
      page: Number(page),
      pages: Math.ceil(total / limit),
      performance: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching unverified corporate users:', error);
    res.status(500).json({ message: 'Error fetching unverified corporate users' });
  }
};

module.exports = {
  getMe,
  getRecentActivity,
  getUnverifiedCorporates,
  getUnverifiedCorporateUsers,
  approveCorporate,
  rejectCorporate,
  getDocumentImage
};