/**
 * Chat Context
 * Provides centralized state management for chat functionality
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { io as ioClient } from 'socket.io-client';
import { useAuth } from './AuthContext';
import chatService from '../services/chatService';



// Create the chat context
const ChatContext = createContext();

// Action types for the reducer
const ChatActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SOCKET_CONNECTED: 'SET_SOCKET_CONNECTED',
  SET_CHATS: 'SET_CHATS',
  ADD_CHAT: 'ADD_CHAT',
  UPDATE_CHAT: 'UPDATE_CHAT',
  SET_ACTIVE_CHAT: 'SET_ACTIVE_CHAT',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  ADD_OPTIMISTIC_MESSAGE: 'ADD_OPTIMISTIC_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  SET_TYPING_USERS: 'SET_TYPING_USERS',
  ADD_TYPING_USER: 'ADD_TYPING_USER',
  REMOVE_TYPING_USER: 'REMOVE_TYPING_USER',
  CLEAR_STATE: 'CLEAR_STATE'
};

// Initial state
const initialState = {
  chats: [],
  activeChat: null,
  messages: {},
  isLoading: false,
  error: null,
  socketConnected: false,
  typingUsers: {},
  onlineUsers: {} // prevent undefined access
};

// Reducer function
function chatReducer(state, action) {
  switch (action.type) {
    case ChatActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case ChatActionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    case ChatActionTypes.SET_SOCKET_CONNECTED:
      return { ...state, socketConnected: action.payload };

    case ChatActionTypes.SET_CHATS:
      return { ...state, chats: action.payload, isLoading: false, error: null };

    case ChatActionTypes.ADD_CHAT:
   const next = { unreadCount: 0, ...action.payload };
  const exists = state.chats.some(c => c._id === next._id);
  return {
    ...state,
    chats: exists
      ? state.chats.map(c => (c._id === next._id ? { ...c, ...next } : c))
      : [next, ...state.chats]
  };

    case ChatActionTypes.UPDATE_CHAT:
    const updated = action.payload; 
    const nextChats = state.chats.map(chat =>
    chat._id === updated._id ? { ...chat, ...updated } : chat
  );
  const nextActive =
    state.activeChat && state.activeChat._id === updated._id
      ? { ...state.activeChat, ...updated }
      : state.activeChat;
  return {
    ...state,
    chats: nextChats,
    activeChat: nextActive
  };
    

    case ChatActionTypes.SET_ACTIVE_CHAT:
      return { ...state, activeChat: action.payload };

    case ChatActionTypes.SET_MESSAGES:
      return {
        ...state,
        messages: { ...state.messages, [action.payload.chatId]: action.payload.messages },
        isLoading: false,
        error: null
      };

    case ChatActionTypes.ADD_MESSAGE: {
      const { chatId, message, tempId, isOptimistic } = action.payload;
      const existingMessages = state.messages[chatId] || [];

      // If this is an optimistic message, we just add it.
      if (isOptimistic) {
        return {
          ...state,
          messages: {
            ...state.messages,
            [chatId]: [...existingMessages, message]
          }
        };
      }
      // If this is a real message from the server:
      let messageExists = false;
      const newMessages = existingMessages.map(msg => {
        // Check if this message is a replacement for an optimistic one.
        if (msg._id === tempId) {
          messageExists = true;
          return message; // Replace the optimistic message with the real one.
        }
        return msg;
      });

      // If we didn't find an optimistic message to replace, it's a new message from someone else.
      if (!messageExists) {
        // And we must also check we don't add a duplicate real message
        if (!existingMessages.some(m => m._id === message._id)) {
            newMessages.push(message);
        }
      }
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [chatId]: newMessages
        }
      };
    }
    
    case ChatActionTypes.ADD_OPTIMISTIC_MESSAGE: {
      const { chatId: optimisticChatId, message: optimisticMessage } = action.payload;
      return {
        ...state,
        messages: {
          ...state.messages,
          [optimisticChatId]: [...(state.messages[optimisticChatId] || []), optimisticMessage]
        }
      };
    }
 
    case ChatActionTypes.UPDATE_MESSAGE:
      const { chatId: updateChatId, messageId, updatedMessage } = action.payload;
      // If the real message comes back from the server, we replace the temp one entirely.
      // If not, we just update the properties of the existing message.
      const messageToUpdate = updatedMessage || action.payload; 
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [updateChatId]: (state.messages[updateChatId] || []).map(msg =>
            msg._id === messageId ? messageToUpdate : msg
          )
        }
      };

    case ChatActionTypes.SET_TYPING_USERS:
      return {
        ...state,
        typingUsers: { ...state.typingUsers, [action.payload.chatId]: action.payload.users }
      };

    case ChatActionTypes.ADD_TYPING_USER: {
      const { chatId: typingChatId, user } = action.payload;
      const currentTypingUsers = state.typingUsers[typingChatId] || [];
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [typingChatId]: [...currentTypingUsers.filter(u => u.userId !== user.userId), user]
        }
      };
    }

    case ChatActionTypes.REMOVE_TYPING_USER: {
      const { chatId: stopTypingChatId, userId } = action.payload;
      const typingUsersForChat = state.typingUsers[stopTypingChatId] || [];
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [stopTypingChatId]: typingUsersForChat.filter(u => u.userId !== userId)
        }
      };
    }

    case ChatActionTypes.CLEAR_STATE:
      return initialState;

    default:
      return state;
  }
}

// Chat Provider Component
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { currentUser } = useAuth();

  const socketRef = useRef(null);
  const handlers = useRef({});

 

  /**
   * Fetch all chats for the current user
   */
   const fetchUserChats = useCallback(async () => {
    // Safety check
    if (!currentUser) {
      console.log("[fetchUserChats] Aborted: No current user.");
      return;
    }

    dispatch({ type: ChatActionTypes.SET_LOADING, payload: true });
    console.log("%c[fetchUserChats] Starting fetch...", "color: blue; font-weight: bold;");
    
    try {
      const response = await chatService.getUserChats();
      console.log("[fetchUserChats] Raw API Response:", response);

      // Check if the expected data structure is present
      const chatsArray = response?.data;
      if (!Array.isArray(chatsArray)) {
        // This will catch errors if the backend response shape changes
        throw new Error("Invalid data format from server. Expected response.data to be an array.");
      }
      
      console.log(`[fetchUserChats] Success. Found ${chatsArray.length} chats.`);
      dispatch({
        type: ChatActionTypes.SET_CHATS,
        payload: chatsArray
      });

    } catch (error) {
      // This will now show us a very detailed error if the API call fails
      console.error('❌ FATAL ERROR in fetchUserChats:', error);
      if (error.response) {
        console.error("Backend response data:", error.response.data);
      }
      dispatch({
        type: ChatActionTypes.SET_ERROR,
        payload: error.response?.data?.message || 'Failed to fetch chats'
      });
    } finally {
      dispatch({ type: ChatActionTypes.SET_LOADING, payload: false });
    }
  }, [currentUser]);

  // Initialize and cleanup socket connection based on auth state
   useEffect(() => {
    if (!currentUser?.token) {
       chatService.disconnect();
       dispatch({ type: ChatActionTypes.CLEAR_STATE });
       return;
     }
 
     // connect & keep a reference so other functions can use it if needed
     const socket = chatService.connect(currentUser.token);
     socketRef.current = socket;
 
     // named handlers (no isMounted guard; we detach in cleanup)
     const onConnect = () => {
       dispatch({ type: ChatActionTypes.SET_SOCKET_CONNECTED, payload: true });
       fetchUserChats();
     };
     const onNewMessage = (data) => {
       console.log('💬 New message received:', data);
       dispatch({ type: ChatActionTypes.ADD_MESSAGE, payload: data });
       dispatch({ type: ChatActionTypes.UPDATE_CHAT, payload: { _id: data.chatId, lastMessage: data.message, lastActivity: new Date().toISOString() } });
     };

     const onChatUpdated = (partial) => {
        // partial is like { _id, lastMessage, lastActivity }
        dispatch({ type: ChatActionTypes.UPDATE_CHAT, payload: partial });
      };

     const onUserTyping = (data) => {
       const { chatId, userId, userName } = data;
       dispatch({ type: ChatActionTypes.ADD_TYPING_USER, payload: { chatId, user: { userId, userName } } });
     };
     const onUserStoppedTyping = (data) => {
       const { chatId, userId } = data;
       dispatch({ type: ChatActionTypes.REMOVE_TYPING_USER, payload: { chatId, userId } });
     };
     const onError = (error) => {
       console.error('Socket error received:', error);
       dispatch({ type: ChatActionTypes.SET_ERROR, payload: error?.message || 'A socket error occurred.' });
     };
     const onDisconnect = () => {
       dispatch({ type: ChatActionTypes.SET_SOCKET_CONNECTED, payload: false });
     };
     const onNewChatRequest = (chat) => {
       dispatch({ type: ChatActionTypes.ADD_CHAT, payload: chat });
     };
     const onNewUnclaimedChat = (chat) => {
       console.log('📥 new_unclaimed_chat', chat);
       dispatch({ type: ChatActionTypes.ADD_CHAT, payload: chat });
     };
     const onChatClaimed = (updatedChat) => {
       console.log('🔔 chat_claimed', updatedChat);
       dispatch({ type: ChatActionTypes.UPDATE_CHAT, payload: updatedChat });
     };

     const onChatCreated = (chat) => {
      // idempotent ADD_CHAT (see reducer note below)
      dispatch({ type: ChatActionTypes.ADD_CHAT, payload: chat });
    };
 
     // attach
     socket.on('connect', onConnect);
     socket.on('new_message', onNewMessage);
     socket.on('user_typing', onUserTyping);
     socket.on('user_stopped_typing', onUserStoppedTyping);
     socket.on('error', onError);
     socket.on('disconnect', onDisconnect);
     socket.on('new_chat_request', onNewChatRequest);
     socket.on('new_unclaimed_chat', onNewUnclaimedChat);
     socket.on('chat_claimed', onChatClaimed);
     socket.on('chat_created', onChatCreated);
     socket.on('chat_updated', onChatUpdated);
 
     // cleanup: detach exactly what we attached, then disconnect
     return () => {
       socket.off('connect', onConnect);
       socket.off('new_message', onNewMessage);
       socket.off('user_typing', onUserTyping);
       socket.off('user_stopped_typing', onUserStoppedTyping);
       socket.off('error', onError);
       socket.off('disconnect', onDisconnect);
       socket.off('new_chat_request', onNewChatRequest);
       socket.off('new_unclaimed_chat', onNewUnclaimedChat);
       socket.off('chat_claimed', onChatClaimed);
       socket.off('chat_created', onChatCreated);
       socket.off('chat_updated', onChatUpdated);
       chatService.disconnect();
       dispatch({ type: ChatActionTypes.CLEAR_STATE });
     };
   }, [currentUser?.token, fetchUserChats]);

  /**
   * Select and load messages for a specific chat
   */
  // In frontend/src/context/ChatContext.js

  // In frontend/src/context/ChatContext.js

  const selectChat = useCallback(async (chat) => {
    if (!chat || !currentUser) return;

    // 1. Set the active chat.
    dispatch({ type: ChatActionTypes.SET_ACTIVE_CHAT, payload: chat });
    
   // 2. Join the socket room if connected.
   if (typeof chatService.joinChat === 'function') {
     chatService.joinChat(chat._id);
   }

    // 3. Load messages if they aren't already in the state.
    if (!state.messages[chat._id]) {
      dispatch({ type: ChatActionTypes.SET_LOADING, payload: true });
      try {
        const response = await chatService.getChatMessages(chat._id);
        const messagesArray = response.data || [];
        dispatch({
          type: ChatActionTypes.SET_MESSAGES,
          payload: {
            chatId: chat._id,
            messages: messagesArray
          }
        });
      } catch (error) {
        console.error('Error fetching messages:', error);
        dispatch({
          type: ChatActionTypes.SET_ERROR,
          payload: error.response?.data?.message || 'Failed to fetch messages'
        });
      } finally {
        dispatch({ type: ChatActionTypes.SET_LOADING, payload: false });
      }
    }
  }, [currentUser, state.messages]);

  /**
   * Send a message
   */
  // In ChatContext.js
  
  const sendMessage = useCallback(async (chatId, content) => {
    if (!chatId || !content.trim() || !currentUser) return;

    const senderName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email;

    const optimisticMessage = {
      _id: `temp_${Date.now()}`, // The temp ID is the key
      chat: chatId,
      sender: { user: currentUser._id, name: senderName, role: currentUser.role },
      content: content.trim(),
      type: 'text',
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };

    // Use the dedicated optimistic action
    dispatch({ type: ChatActionTypes.ADD_MESSAGE, payload: { chatId, message: optimisticMessage , isOptimistic: true } });

    try {
      chatService.sendMessage(chatId, content.trim(), optimisticMessage._id); // Pass the temp ID
    } catch (error) {
      console.error('Error sending message:', error);
      dispatch({ type: ChatActionTypes.SET_ERROR, payload: 'Failed to send message' });
    }
  }, [currentUser]);
  const markChatAsRead = useCallback(async (chatId) => {
    if (!chatId || !currentUser) return;

    try {
      // API call to update the database
      await chatService.markChatAsRead(chatId);

      // Dispatch action to update the UI state (e.g., reset unread count)
      dispatch({
        type: ChatActionTypes.UPDATE_CHAT,
        payload: { _id: chatId, unreadCount: 0 }
      });
      
      // Emit socket event to notify other sessions/users
      if (chatService.isConnected()) {
        chatService.markMessagesRead(chatId);
      }

    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  }, [currentUser]); // Dependency on currentUser

  /**
   * Initiate a new chat
   */

   const initiateChat = useCallback(async (participantId = null) => { // <-- Allow null ID
    // The check now only ensures there is a current user.
    if (!currentUser) return null;

    dispatch({ type: ChatActionTypes.SET_LOADING, payload: true });

    try {
      // The service returns the full API response, e.g., { success: true, data: {...} }
      const response = await chatService.initiateChat(participantId);
      
      // --- THIS IS THE CORRECTED LOGIC ---
      // The actual chat object is inside the 'data' property of the response.
      const newChat = response.data;
      
      if (newChat && newChat._id) {
        // We check if this chat is already in our state.
        const existingChat = state.chats.find(c => c._id === newChat._id);
        if (!existingChat) {
          // If not, we add it to our list.
          dispatch({ type: ChatActionTypes.ADD_CHAT, payload: newChat });
        }
        
        // NOW, we make this new (or found) chat the active one.
        selectChat(newChat);
        
        return newChat;
      } else {
        // If the backend returned a success response but no chat data, something is wrong.
        throw new Error("Received an invalid response from the server.");
      }

    } catch (error) {
      console.error('Error initiating chat:', error);
      dispatch({
        type: ChatActionTypes.SET_ERROR,
        payload: error.response?.data?.message || 'Failed to initiate chat'
      });
      return null; // Return null on failure
    } finally {
      dispatch({ type: ChatActionTypes.SET_LOADING, payload: false });
    }
  }, [currentUser, state.chats, selectChat]); // Ensure selectChat is in the dependency array

  
   

  const startTyping = useCallback((chatId) => {
    if (!chatId || !currentUser) return;
    try {
         if (typeof chatService.startTyping === 'function') {
     chatService.startTyping(chatId, currentUser._id, `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email);
   }
    } catch (error) {
      console.error('Error starting typing indicator:', error);
    }
  }, [currentUser]);

  const stopTyping = useCallback((chatId) => {
    if (!chatId || !currentUser) return;
    try {
      if (typeof chatService.stopTyping === 'function') {
     chatService.stopTyping(chatId, currentUser._id, `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email);
    }
    } catch (error) {
      console.error('Error stopping typing indicator:', error);
    }
  }, [currentUser]);

  const clearError = useCallback(() => {
    dispatch({ type: ChatActionTypes.SET_ERROR, payload: null });
  }, []);

  const leaveChat = useCallback(() => {
    // Check if there's an active chat to leave
    if (state.activeChat && chatService.isConnected()) {
      // 1. Tell the server we are leaving the real-time room
      chatService.leaveChat(state.activeChat._id);
    }
    
    // 2. THIS IS THE CRITICAL STEP: Update the local state
    // This will trigger the re-render in ChatWindow
    dispatch({ type: ChatActionTypes.SET_ACTIVE_CHAT, payload: null });

  }, [state.activeChat]); // The function depends on the activeChat from the state

  /**
   * Claim an unclaimed chat (Admin only)
   */
 const claimChat = useCallback(async (chatId) => {
  if (!chatId || !currentUser || currentUser.role !== 'admin') return null;

  try {
    // chatService returns the updated chat doc
    const updatedChat = await chatService.claimChat(chatId);

    // Optional optimistic update (socket 'chat_claimed' will also update)
    if (updatedChat) {
      dispatch({ type: ChatActionTypes.UPDATE_CHAT, payload: updatedChat });
      return updatedChat;
    }
  } catch (error) {
    console.error('Error claiming chat:', error);
    dispatch({
      type: ChatActionTypes.SET_ERROR,
      payload: error.response?.data?.message || 'Failed to claim chat'
    });
  }
  return null;
}, [currentUser]);



  const value = {
    chats: state.chats,
    activeChat: state.activeChat,
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    socketConnected: state.socketConnected,
    typingUsers: state.typingUsers,

    fetchUserChats,
    selectChat,
    sendMessage,
    initiateChat,
    claimChat,
    startTyping,
    markChatAsRead,
    stopTyping,
    leaveChat,
    clearError,

    isSocketConnected: state.socketConnected,
        getTotalUnreadCount: () => {
      if (!Array.isArray(state.chats)) return 0;
      let sum = 0;
      for (const c of state.chats) {
        const n = Number(c?.unreadCount ?? 0);
        if (!Number.isNaN(n)) sum    = n;
      }
      return sum;
    },
    getChatMessages: (chatId) => state.messages[chatId] || [],
    getTypingUsers: (chatId) => state.typingUsers[chatId] || [],
    getOnlineUsers: (chatId) => state.onlineUsers[chatId] || []
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
