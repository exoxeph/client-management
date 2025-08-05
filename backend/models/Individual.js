/**
 * Individual Model
 * This model represents individual user profile data
 */

const mongoose = require('mongoose');

const IndividualSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  nationalId: {
    type: String,
    required: [true, 'National ID is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10,13}$/.test(v);
      },
      message: props => `${props.value} is not a valid National ID. Must be 10-13 digits.`
    }
  },
  // Additional fields can be added as needed
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
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

module.exports = mongoose.model('individual', IndividualSchema);