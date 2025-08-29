/**
 * Chat Controller
 * This file contains methods for chat-related operations
 */
const slugify = require('slugify');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const Individual = require('../models/Individual');
const Corporate = require('../models/Corporate');
const mongoose = require('mongoose');

/**
 * @desc    Create or get existing chat
 * @route   POST /api/chats/initiate
 * @access  Private
 */
const initiateChat = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
    
    if (currentUserRole === 'admin') {
      // Admin initiating chat with client - existing logic remains the same
      const { clientId: reqClientId } = req.body;
      
      if (!reqClientId) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required when admin initiates chat'
        });
      }
      
      // Verify client exists and is not an admin
      const client = await User.findById(reqClientId);
      if (!client || client.role === 'admin') {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }
      
      const adminId = currentUserId;
      const clientId = reqClientId;
      
      // Check if active chat already exists between these users
      let existingChat = await Chat.findOne({
        'participants.user': { $all: [adminId, clientId] },
        status: 'active'
      }).populate('participants.user', 'email role')
        .populate('lastMessage');
      
      if (existingChat) {
        return res.status(200).json({
          success: true,
          data: existingChat
        });
      }
      
      // Create new active chat with both participants
      const clientUser = await User.findById(clientId).lean();
      const clientProfile = clientUser.accountType === 'individual' 
          ? await Individual.findOne({ user: clientId }).lean() 
          : await Corporate.findOne({ user: clientId }).lean();
          
      const clientName = clientProfile?.fullName || clientProfile?.companyName || clientUser.email;
      const chatTitle = `Chat with ${clientName}`;

      const randomString = Math.random().toString(36).substring(2, 8);
      const chatSlug = slugify(`${chatTitle}-${randomString}`, { lower: true, strict: true });

      const newChat = new Chat({
        participants: [
          { user: adminId, role: 'admin' },
          { user: clientId, role: clientUser.role }
        ],
        title: chatTitle,
        chatSlug: chatSlug,
        status: 'active',
        assignedAdmin: adminId
      });
      
      await newChat.save();
      
      // Populate and return the new chat
      const populatedChat = await Chat.findById(newChat._id)
        .populate('participants.user', 'email role')
        .populate('lastMessage');
      
      if (req.io) {
  // notify the client you’re starting a chat
  req.io.to(`user_${clientId}`).emit('chat_created', populatedChat);

  // also notify the admin’s other tabs/devices (optional but nice)
  req.io.to(`user_${adminId}`).emit('chat_created', populatedChat)
      }
      
      
        return res.status(201).json({
        success: true,
        data: populatedChat
      })


      
    } else {
      // Client initiating chat - create unclaimed chat
      const clientId = currentUserId;
      const clientUser = await User.findById(clientId).lean();
      
      // Get client's profile for title
      const clientProfile = clientUser.accountType === 'individual' 
          ? await Individual.findOne({ user: clientId }).lean() 
          : await Corporate.findOne({ user: clientId }).lean();
          
      const clientName = clientProfile?.fullName || clientProfile?.companyName || clientUser.email;
      const chatTitle = `Support Request from ${clientName}`;

      const randomString = Math.random().toString(36).substring(2, 8);
      const chatSlug = slugify(`${chatTitle}-${randomString}`, { lower: true, strict: true });

      // Create unclaimed chat with only the client as participant
      const newChat = new Chat({
        participants: [
          { user: clientId, role: clientUser.role }
        ],
        title: chatTitle,
        chatSlug: chatSlug,
        status: 'unclaimed',
        assignedAdmin: null
      });
      
      await newChat.save();
      
      // Populate the new chat
      const populatedChat = await Chat.findById(newChat._id)
        .populate('participants.user', 'email role')
        .populate('lastMessage');
      
      // Emit socket event to all connected admins
      if (req.io) {
  const adminUsers = await User.find({ role: 'admin' }, '_id');

  // Emit a consistent event name the client listens to
  adminUsers.forEach(({ _id }) => {
    req.io.to(`user_${_id}`).emit('new_unclaimed_chat', {
      _id: populatedChat._id,
      title: populatedChat.title,
      status: 'unclaimed',
      assignedAdmin: null,
      participants: populatedChat.participants,
      lastMessage: populatedChat.lastMessage || null,
      lastActivity: populatedChat.lastActivity || populatedChat.createdAt,
      createdAt: populatedChat.createdAt
    });
  });
}
      
      return res.status(201).json({
        success: true,
        data: populatedChat
      });
    }
    
  } catch (error) {
    console.error("❌ FATAL ERROR in initiateChat:", error);
    console.error("Full Error Stack:", error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate chat due to a server error.',
      error: error.message
    });
  }
};

/**
 * @desc    Get all chats for current user
 * @route   GET /api/chats
 * @access  Private
 */

const getUserChats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    // 1. Find all active chats for the current user
    const chats = await Chat.find({ 'participants.user': userId, 'status': 'active' })
      .sort({ lastActivity: -1 })
      .populate('participants.user', 'email role accountType') // Populate basic user info
      .populate('lastMessage') // Populate the last message
      .lean(); // Use .lean() for clean, fast objects

    // 2. Enhance the chats with the correct title and unread count
    const enhancedChats = await Promise.all(chats.map(async (chat) => {
      // Find the "other" participant in the chat
      const otherParticipant = chat.participants.find(p => p.user?._id.toString() !== userId.toString());
      
      let chatTitle = "Chat"; // A safe default title
      if (otherParticipant && otherParticipant.user) {
        // Determine the name based on the other user's role and account type
        const otherUser = otherParticipant.user;
        if (otherUser.role === 'admin') {
          chatTitle = "Admin Support";
        } else if (otherUser.accountType === 'individual') {
          const profile = await Individual.findOne({ user: otherUser._id }).lean();
          chatTitle = profile?.fullName || otherUser.email;
        } else if (otherUser.accountType === 'corporate') {
          const profile = await Corporate.findOne({ user: otherUser._id }).lean();
          chatTitle = profile?.primaryContact?.name || otherUser.email;
        }
      }
      
      // Build the final chat object to send to the frontend
      return {
        ...chat,
        title: chatTitle,
        unreadCount: chat.unreadCounts ? (chat.unreadCounts[userId.toString()] || 0) : 0,
      };
    }));

    res.status(200).json({
      success: true,
      data: enhancedChats,
    });

  } catch (error) {
    console.error('FATAL ERROR in getUserChats:', error);
    res.status(500).json({ success: false, message: 'Failed to load chats' });
  }
};

/**
 * @desc    Get messages for a specific chat
 * @route   GET /api/chats/:chatId/messages
 * @access  Private
 */
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    
    // Verify user is participant in this chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    if (!chat.hasParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }
    
    // Get messages for this chat
    const messages = await Message.find({
      chat: chatId,
      isDeleted: false
    })
    .populate('sender.user', 'email role')
    .sort({ createdAt: 1 });
    
    res.status(200).json({
      success: true,
      data: messages
    });
    
  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Find the chat to ensure it exists
    const chat = await Chat.findById(chatId);

    // Verify user is a participant in this chat
    if (!chat || !chat.hasParticipant(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied to this chat' 
      });
    }

    // Call the markAsRead method from the Chat model
    await chat.markAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'Chat marked as read successfully'
    });

  } catch (error) {
    console.error('Error in markChatAsRead controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while marking chat as read' 
    });
  }
};

/**
 * @desc    Claim an unclaimed chat
 * @route   POST /api/chats/:chatId/claim
 * @access  Private (Admin only)
 */
const claimChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const adminId = req.user.id;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can claim chats' });
    }

    const updated = await Chat.findOneAndUpdate(
      { _id: chatId, status: 'unclaimed' },
      {
        $set: { status: 'active', assignedAdmin: adminId, lastActivity: new Date() },
        $addToSet: { participants: { user: adminId, role: 'admin' } }
      },
      { new: true }
    )
      .populate('participants.user', 'email role')
      .populate('assignedAdmin', 'email role')
      .populate('lastMessage');

    if (!updated) {
      const existing = await Chat.findById(chatId).lean();
      const status = existing?.status ?? 'unknown';
      return res.status(409).json({
        success: false,
        message: `Chat is not available for claiming. Current status: ${status}`
      });
    }

    // Resolve client id
    const clientPart = (updated.participants || []).find(p => p.role !== 'admin');
    const clientId = clientPart?.user?._id?.toString?.() || clientPart?.user?.toString?.();

    // Real-time: emit to the SAME room name you join in socketHandlers
    if (req.io) {
      req.io.to(chatId).emit('chat_claimed', updated);
      req.io.to(`user_${adminId}`).emit('chat_claimed', updated);
      if (clientId) req.io.to(`user_${clientId}`).emit('chat_claimed', updated);

      // notify other admins to remove from Unclaimed
      const admins = await User.find({ role: 'admin' }, '_id').lean();
      admins.forEach(({ _id }) => {
        if (_id.toString() !== adminId) {
          req.io.to(`user_${_id}`).emit('chat_claimed', updated);
        }
      });
    }

    return res.status(200).json({ success: true, data: updated, message: 'Chat claimed successfully' });
  } catch (error) {
    console.error('Error in claimChat controller:', error);
    return res.status(500).json({ success: false, message: 'Server error while claiming chat' });
  }
};


module.exports = {
  initiateChat,
  getUserChats,
  getChatMessages,
  markChatAsRead,
  claimChat
};


