/**
 * Chat Model
 * This model represents chat sessions between admins and clients
 */

const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    role: {
      type: String,
      required: true
    }
  }],
  
  title: {
    type: String
  },
  
  type: {
    type: String,
    enum: ['support', 'project_inquiry', 'general'],
    default: 'general'
  },
  
  status: {
    type: String,
    enum: ['unclaimed', 'active', 'closed', 'archived'],
    default: 'unclaimed'
  },
  
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'message'
  },
  
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  unreadCounts: {
    type: Map,
    of: Number,
    default: new Map()
  },
  
  chatSlug: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Method to check if a user is participant in this chat
ChatSchema.methods.hasParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString());
};

// Method to mark messages as read for a user
ChatSchema.methods.markAsRead = function(userId) {
  this.unreadCounts.set(userId.toString(), 0);
  return this.save();
};

module.exports = mongoose.model('chat', ChatSchema);