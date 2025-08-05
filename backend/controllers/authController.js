/**
 * Auth Controller
 * This file contains methods for authentication-related operations
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Individual = require('../models/Individual');
const Corporate = require('../models/Corporate');
const fs = require('fs');
const path = require('path');

// Helper function to generate JWT token
const generateToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

/**
 * @desc    Register individual user
 * @route   POST /api/auth/register/individual
 * @access  Public
 */
const registerIndividual = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, nationalId, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user first
    const user = await User.create({
      email,
      password,
      accountType: 'individual',
      role: 'individual'
    });

    // Create individual profile with reference to user
    const individual = await Individual.create({
      fullName,
      email,
      phoneNumber,
      nationalId,
      user: user._id // Set the user reference directly
    });

    // Update user with reference to individual profile
    user.profileData = individual._id;
    await user.save();

    if (user) {
      // Generate token
      const token = generateToken(user._id, user.email, user.role);

      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        accountType: user.accountType,
        profile: {
          fullName: individual.fullName,
          phoneNumber: individual.phoneNumber,
          nationalId: individual.nationalId
        },
        token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Register corporate user
 * @route   POST /api/auth/register/corporate
 * @access  Public
 */
const registerCorporate = async (req, res) => {
  try {
    console.log('FILES:', req.files);
    
    // Extract data from request body
    const { 
      companyName, 
      companyEmail, 
      companyPhone, 
      registrationNumber, 
      taxId, 
      website,
      headquartersAddress,
      primaryContact,
      password
    } = req.body;

    // Check if files were uploaded
    const businessLicenseFile = req.files?.businessLicense ? req.files.businessLicense[0] : null;
    const taxDocumentFile = req.files?.taxDocument ? req.files.taxDocument[0] : null;

    // Check if user already exists
    const userExists = await User.findOne({ email: companyEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Prepare documents object
    const documents = {};
    
    if (businessLicenseFile) {
      // Store file data in MongoDB
      documents.businessLicense = {
        fileName: businessLicenseFile.originalname,
        fileData: businessLicenseFile.buffer,
        contentType: businessLicenseFile.mimetype,
        // Keep filePath for backward compatibility
        filePath: `/uploads/business-licenses/${Date.now()}-${businessLicenseFile.originalname}`
      };
      
      // Write file to disk for backward compatibility
      const dir = path.join(__dirname, '..', 'uploads', 'business-licenses');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const filePath = path.join(dir, `${Date.now()}-${businessLicenseFile.originalname}`);
      fs.writeFileSync(filePath, businessLicenseFile.buffer);
    }
    
    if (taxDocumentFile) {
      // Store file data in MongoDB
      documents.taxDocument = {
        fileName: taxDocumentFile.originalname,
        fileData: taxDocumentFile.buffer,
        contentType: taxDocumentFile.mimetype,
        // Keep filePath for backward compatibility
        filePath: `/uploads/tax-documents/${Date.now()}-${taxDocumentFile.originalname}`
      };
      
      // Write file to disk for backward compatibility
      const dir = path.join(__dirname, '..', 'uploads', 'tax-documents');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const filePath = path.join(dir, `${Date.now()}-${taxDocumentFile.originalname}`);
      fs.writeFileSync(filePath, taxDocumentFile.buffer);
    }

    // Create user first
    const user = await User.create({
      email: companyEmail,
      password,
      accountType: 'corporate',
      role: 'corporate'
    });

    // Create corporate profile with reference to user
    const corporate = await Corporate.create({
      companyName,
      companyEmail,
      companyPhone,
      registrationNumber,
      taxId,
      website,
      headquartersAddress,
      primaryContact,
      documents,
      user: user._id // Set the user reference directly
    });

    // Update user with reference to corporate profile
    user.profileData = corporate._id;
    await user.save();

    if (user) {
      // Generate token
      const token = generateToken(user._id, user.email, user.role);

      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        accountType: user.accountType,
        profile: {
          companyName: corporate.companyName,
          companyPhone: corporate.companyPhone,
          registrationNumber: corporate.registrationNumber
        },
        token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // For corporate users, check verification status
    if (user.role === 'corporate' && !user.isVerified) {
      return res.status(401).json({ message: 'Your account is pending verification by an admin' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Get profile data based on account type
    let profileData;
    if (user.accountType === 'individual') {
      profileData = await Individual.findById(user.profileData);
    } else {
      profileData = await Corporate.findById(user.profileData);
    }

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    res.status(200).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      accountType: user.accountType,
      profile: profileData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get profile data based on account type
    let profileData;
    if (user.accountType === 'individual') {
      profileData = await Individual.findById(user.profileData);
    } else {
      profileData = await Corporate.findById(user.profileData);
    }

    res.status(200).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      accountType: user.accountType,
      profile: profileData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Login admin user
 * @route   POST /api/auth/login/admin
 * @access  Public
 */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      accountType: user.accountType,
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerIndividual,
  registerCorporate,
  loginUser,
  loginAdmin,
  getUserProfile
};