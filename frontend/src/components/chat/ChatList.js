/**
 * ChatList Component
 * Displays the list of conversations with click handling and unread badges
 */

import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
const ChatList = () => {
  const { chats, activeChat, selectChat, isLoading, initiateChat, claimChat } = useChat();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const handleChatClick = (chat) => {
    selectChat(chat);
  };

  const handleClaimChat = async (e, chatId) => {
    e.stopPropagation(); // This is important to prevent the chat item from being selected
    try {
      await claimChat(chatId);
    } catch (error) {
      console.error('Failed to claim chat:', error);
      // Optional: add a toast notification for the error
    }
  };


  const handleNewChat = async () => {
    try {
      // For a client, we call initiateChat without an ID.
      // The backend will automatically find an admin.
      const newChat = await initiateChat();
      if (newChat) {
        // After the chat is created, we automatically select it
        // to open the message window.
        selectChat(newChat);
      }
    } catch (error) {
      console.error("Failed to start new chat", error);
      // Optional: add a toast notification for the error
    }
  };

  const formatLastMessage = (message) => {
    if (!message) return 'No messages yet';
    
    // If message is populated object, get content
    if (typeof message === 'object' && message.content) {
      return message.content;
    }
    
    // If message is string, return as is
    if (typeof message === 'string') {
      return message;
    }
    
    return 'No messages yet';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getUnreadCount = (chat) => {
    // If unreadCounts is a Map or object, try to get current user's unread count
    if (chat.unreadCounts && typeof chat.unreadCounts === 'object') {
      // For now, just return 0 as we don't have user context here
      // This will be enhanced when we implement proper unread counting
      return 0;
    }
    
    // Fallback to unreadCount property if it exists
    return chat.unreadCount || 0;
  };

  const unclaimedChats = isAdmin ? chats.filter(c => c.status === 'unclaimed') : [];
     const myChats = isAdmin
     ? chats.filter(c => {
         const adminId = c?.assignedAdmin?.__id || c?.assignedAdmin?._id || c?.assignedAdmin;
         return c.status === 'active' && String(adminId) === String(currentUser._id);
       })
     : chats;


  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isLoading && (!chats || chats.length === 0)) {
    // Keep your existing loading spinner
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!chats || chats.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 flex flex-col items-center justify-center h-full">
        <svg 
          className="w-10 h-10 mx-auto mb-3 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7.93-7M3 4a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V4z"></path>
        </svg>
        
        {/* --- THIS IS THE CORRECTED LOGIC --- */}
        {isAdmin ? (
            // If the user is an admin, show a simple message.
            <>
              <p className="text-sm font-medium">No chats available</p>
              <p className="text-xs text-gray-400 mt-1">Unclaimed requests from clients will appear here.</p>
            </>
        ) : (
            // If the user is a CLIENT, show the button.
            <>
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">Need help? Start a chat with us.</p>
              <button
                onClick={handleNewChat}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Start a New Chat
              </button>
            </>
        )}
      </div>
    );
  }

    // --- THIS IS THE NEW RENDERING LOGIC ---

  return (
    <div className="divide-y divide-gray-200">
      {/* SECTION 1: UNCLAIMED CHATS (Only renders for Admins) */}
      {isAdmin && unclaimedChats.length > 0 && (
        <div>
          <div className="px-3 py-2 bg-yellow-50 border-b border-yellow-200">
            <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-wider">Unclaimed Requests</h4>
          </div>
          {unclaimedChats.map((chat) => (
            <div key={chat._id} className="p-3">
              <div className="flex justify-between items-center mb-1">
                <h5 className="text-sm font-medium text-gray-900 truncate">{chat.title || 'Support Request'}</h5>
                <span className="text-xs text-gray-500 ml-2">{formatTimestamp(chat.createdAt)}</span>
              </div>
              <button
                onClick={(e) => handleClaimChat(e, chat._id)}
                className="mt-2 w-full text-center px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700"
              >
                Claim
              </button>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 2: MY CHATS (for Admins) or ALL CHATS (for Clients) */}
      {isAdmin && myChats.length > 0 && (
          <div className="px-3 py-2 bg-green-50 border-b border-green-200">
            <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider">My Active Chats</h4>
          </div>
      )}
      
      {myChats.map((chat) => {
        const isActive = activeChat?._id === chat._id;
        const unreadCount = getUnreadCount(chat);
        const lastMessage = formatLastMessage(chat.lastMessage);
        const timestamp = formatTimestamp(chat.lastActivity);

        return (
          // This is your original, working JSX for rendering a single chat item.
          <div key={chat._id} onClick={() => selectChat(chat)} className={`px-3 py-4 cursor-pointer ... ${isActive ? 'bg-blue-50 ...' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h5 className={`text-sm font-medium truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>{chat.title || 'Untitled Chat'}</h5>
                  {timestamp && <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{timestamp}</span>}
                </div>
                <p className={`text-xs truncate ${isActive ? 'text-blue-700' : 'text-gray-600'}`}>{lastMessage}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${chat.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{chat.status || 'active'}</span>
                  {unreadCount > 0 && <span className="...">{unreadCount}</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;