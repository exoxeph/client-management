/**
 * Corporate Model
 * This model represents corporate user profile data
 */

const mongoose = require('mongoose');

const CorporateSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  companyEmail: {
    type: String,
    required: [true, 'Company email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  companyPhone: {
    type: String,
    required: [true, 'Company phone is required'],
    trim: true
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    trim: true
  },
  taxId: {
    type: String,
    required: [true, 'Tax ID is required'],
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  headquartersAddress: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State/Province is required']
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP/Postal code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    }
  },
  primaryContact: {
    name: {
      type: String,
      required: [true, 'Contact name is required']
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required']
    }
  },
  documents: {
    businessLicense: {
      fileName: String,
      filePath: String,
      fileData: Buffer,
      contentType: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    },
    taxDocument: {
      fileName: String,
      filePath: String,
      fileData: Buffer,
      contentType: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }
  },
  // Reference back to the User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('corporate', CorporateSchema);