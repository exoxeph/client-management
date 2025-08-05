/**
 * Counter Model
 * This model is used to generate auto-incrementing IDs for various collections
 */

const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  // The name of the sequence (e.g., 'projectId')
  name: {
    type: String,
    required: true,
    unique: true
  },
  // The current sequence value
  sequence_value: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('counter', CounterSchema);