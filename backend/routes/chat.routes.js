/**
 * Chat Routes
 * This file defines the routes for chat-related operations
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  initiateChat,
  getUserChats,
  getChatMessages,
  markChatAsRead,
  claimChat
} = require('../controllers/chatController');

// @route   POST /api/chats/initiate
// @desc    Create or get existing chat
// @access  Private
router.post('/initiate', protect, initiateChat);

// @route   GET /api/chats
// @desc    Get all chats for current user
// @access  Private
router.get('/', protect, getUserChats);

// @route   GET /api/chats/:chatId/messages
// @desc    Get messages for a specific chat
// @access  Private
router.get('/:chatId/messages', protect, getChatMessages);

// @route   PUT /api/chats/:chatId/read
// @desc    Mark chat as read
// @access  Private
router.put('/:chatId/read', protect, markChatAsRead);

// @route   POST /api/chats/:chatId/claim
// @desc    Claim an unclaimed chat
// @access  Private (Admin only)
router.post('/:chatId/claim', protect, claimChat);

module.exports = router;