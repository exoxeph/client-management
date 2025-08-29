/**
 * User Controller
 * This file contains methods for user-related operations
 */

const User = require('../models/User');
const Corporate = require('../models/Corporate');
const fs = require('fs');

/**
 * @desc    Get all unverified corporate users
 * @route   GET /api/users/unverified
 * @access  Private/Admin
 */
const getUnverifiedUsers = async (req, res) => {
  try {
    // Only admin can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this resource' });
    }

    // Find all unverified corporate users and populate their profile data
    const users = await User.find({
      role: 'corporate',
      isVerified: false
    }).populate('profileData');

    // Format the response
    const formattedUsers = users.map(user => ({
      _id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profileData
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching unverified users:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res) => {
  try {
    // Sample implementation
    // const user = await User.findById(req.params.id).select('-password');
    // if (!user) {
    //   return res.status(404).json({ message: 'User not found' });
    // }
    // res.status(200).json(user);
    
    // Placeholder response
    res.status(200).json({ message: 'Get user by ID functionality will be implemented here' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create a new user
 * @route   POST /api/users
 * @access  Public
 */
const createUser = async (req, res) => {
  try {
    // Sample implementation
    // const { name, email, password } = req.body;
    // const userExists = await User.findOne({ email });
    // if (userExists) {
    //   return res.status(400).json({ message: 'User already exists' });
    // }
    // const user = await User.create({ name, email, password });
    // res.status(201).json({
    //   _id: user._id,
    //   name: user.name,
    //   email: user.email
    // });
    
    // Placeholder response
    res.status(201).json({ message: 'Create user functionality will be implemented here' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private
 */
const updateUser = async (req, res) => {
  try {
    // Sample implementation
    // const user = await User.findById(req.params.id);
    // if (!user) {
    //   return res.status(404).json({ message: 'User not found' });
    // }
    // const { name, email } = req.body;
    // user.name = name || user.name;
    // user.email = email || user.email;
    // const updatedUser = await user.save();
    // res.status(200).json({
    //   _id: updatedUser._id,
    //   name: updatedUser.name,
    //   email: updatedUser.email
    // });
    
    // Placeholder response
    res.status(200).json({ message: 'Update user functionality will be implemented here' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete user (reject registration)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    // Only admin can delete users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete users' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    // If it's a corporate user, delete their profile data first
    if (user.role === 'corporate' && user.profileData) {
      const corporate = await Corporate.findById(user.profileData);
      if (corporate) {
        // Delete uploaded documents if they exist
        if (corporate.documents) {
          if (corporate.documents.businessLicense) {
            try {
              fs.unlinkSync(corporate.documents.businessLicense.filePath);
            } catch (err) {
              console.error('Error deleting business license file:', err);
            }
          }
          if (corporate.documents.taxDocument) {
            try {
              fs.unlinkSync(corporate.documents.taxDocument.filePath);
            } catch (err) {
              console.error('Error deleting tax document file:', err);
            }
          }
        }
        await corporate.remove();
      }
    }

    // Delete the user
    await user.remove();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Verify a corporate user
 * @route   POST /api/users/:id/verify
 * @access  Private/Admin
 */
const verifyUser = async (req, res) => {
  try {
    // Only admin can verify users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to verify users' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'corporate') {
      return res.status(400).json({ message: 'Only corporate users can be verified' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Update user verification status
    user.isVerified = true;
    await user.save();

    res.json({ message: 'User verified successfully' });
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = async (req, res) => {
  try {
    // Only admin can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this resource' });
    }

    // Find all users and exclude password field
    const users = await User.find({}).select('-password');

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all clients (non-admin users)
 * @route   GET /api/users/clients
 * @access  Private/Admin
 */
const getClients = async (req, res) => {
  try {
    // Find all users whose role is not 'admin' and select only required fields
    const clients = await User.find({
      role: { $ne: 'admin' }
    }).select('firstName lastName email');

    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  getUnverifiedUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  verifyUser,
  getUsers,
  getClients
};