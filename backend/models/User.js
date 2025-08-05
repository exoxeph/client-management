/**
 * User Model
 * This model represents both individual and corporate users
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Base schema for common fields between individual and corporate users
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['individual', 'corporate', 'admin'],
    default: 'individual'
  },
  isVerified: {
    type: Boolean,
    default: function() {
      return this.role === 'individual'; // Auto-verify individuals
    }
  },
  accountType: {
    type: String,
    enum: ['individual', 'corporate', 'admin'],
    required: true
  },
  // Reference to either Individual or Corporate model
  profileData: {
    type: mongoose.Schema.Types.ObjectId,
    required: false, // Make it optional during creation
    // This is a reference to either Individual or Corporate model
    // We'll determine which one based on the accountType field
    refPath: 'accountType'
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('user', UserSchema);