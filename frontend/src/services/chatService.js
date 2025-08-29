// src/services/chatService.js
import { io } from 'socket.io-client';
import axios from 'axios';

const SERVER_URL = 'http://localhost:5000';          // <-- matches your server log
const BASE_API_URL = `${SERVER_URL}/api`;

class ChatService {
  socket = null;

  // Axios client with auth header
  api = axios.create({
    baseURL: BASE_API_URL,
    withCredentials: true,
  });

  constructor() {
    // attach token to every REST request
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  // -------- Socket lifecycle --------
  connect(token) {
    if (this.socket?.connected) return this.socket;

    if (this.socket) {
      try { this.socket.disconnect(); } catch {}
      this.socket = null;
    }

    console.log(`Attempting to connect to Socket.io server at ${SERVER_URL}`);

    this.socket = io(SERVER_URL, {
      path: '/socket.io',              // explicit; matches server default
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelayMax: 10000,
      // allow default transports (polling -> websocket upgrade)
      auth: { token },                 // server reads socket.handshake.auth.token
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      try { this.socket.disconnect(); } catch {}
      this.socket = null;
    }
  }

  // -------- Socket emits --------
  sendMessage(chatId, content, tempId) { // <-- Add tempId as an argument
    if (this.socket) {
      // Pass the tempId along with the other data
      this.socket.emit('send_message', { chatId, content, tempId });
    }
  }
  joinChat(chatId) {
    this.socket?.emit('join_chat', { chatId });
  }
  leaveChat(chatId) {
    this.socket?.emit('leave_chat', { chatId });
  }
  startTyping(chatId, userId, userName) {
    this.socket?.emit('typing_start', { chatId, userId, userName });
  }
  stopTyping(chatId, userId, userName) {
    this.socket?.emit('typing_stop', { chatId, userId, userName });
  }

  
  markMessagesRead(chatId) {
    if (!this.socket) {
      console.error('Socket not initialized, cannot mark messages as read.');
      return; // Silently fail if socket is not ready
    }

    this.socket.emit('mark_messages_read', {
      chatId
    });
  }

  isConnected() {
    // This will return true only if the socket exists and its 'connected' property is true
    return this.socket ? this.socket.connected : false;
  }

  /**
   * Get the current socket instance
   */
  getSocket() {
    return this.socket;
  }

  // -------- REST methods expected by ChatContext --------
  async getUserChats() {
    // adjust to your backend route if different
    // e.g., '/chats/me' or '/chats'
    const res = await this.api.get('/chats');
    return res.data;
  }

  async markChatAsRead(chatId) {
    try {
      // This corresponds to the PUT /api/chats/:chatId/read route on your backend
      const response = await this.api.put(`/chats/${chatId}/read`);
      return response.data;
    } catch (error) {
      console.error(`Error marking chat ${chatId} as read:`, error);
      throw error;
    }
  }
  
  async getChatMessages(chatId) {
    const res = await this.api.get(`/chats/${chatId}/messages`);
    return res.data;
  }

  async initiateChat(participantId) {
    try {
      const response = await this.api.post('/chats/initiate', {
        // The backend expects a `clientId` in the body
        clientId: participantId 
      });
      return response.data;
    } catch (error) { // <-- THIS IS THE MISSING BLOCK
      console.error('Error initiating chat:', error);
      throw error;
    }
  }

  async claimChat(chatId) {
    try {
      // This corresponds to the POST /api/chats/:chatId/claim route on your backend
      const response = await this.api.post(`/chats/${chatId}/claim`);
      return response.data;
    } catch (error)
    {
      console.error(`Error claiming chat ${chatId}:`, error);
      throw error;
    }
  }

  async claimChat(chatId) {
  const res = await this.api.post(`/chats/${chatId}/claim`);
  // Support either { success, data } or direct chat doc
  return res.data?.data || res.data;
  }
  
}

// Export a singleton
const chatService = new ChatService();
export default chatService;
