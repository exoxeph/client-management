/**
 * Message Model
 * This model represents individual messages within chat sessions
 */

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chat',
    required: true,
    index: true
  },
  
  sender: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    }
  },
  
  content: {
    type: String,
    required: true
  },
  
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('message', MessageSchema);


