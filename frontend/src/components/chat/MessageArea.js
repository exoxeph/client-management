/**
 * Simplified MessageArea Component
 * Clean message display and input interface
 */

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { User, Users, MoreVertical } from 'lucide-react';

const MessageArea = () => {
  const { currentUser } = useAuth();
  const { activeChat, messages, markChatAsRead, isSocketConnected, leaveChat } = useChat();
  
  console.log('[MessageArea Render] Active Chat ID:', activeChat?._id);
  console.log('[MessageArea Render] All messages state:', messages);
  const chatMessages = messages[activeChat?._id] || [];

 

  if (!activeChat) return null;

  const getOtherParticipant = () => {
    return activeChat.participants?.find(p => p.user._id !== currentUser._id) || {};
  };

  const getDisplayName = () => {
    const participant = getOtherParticipant();
    return participant.profile?.fullName || 
           participant.profile?.companyName || 
           participant.user?.email || 
           'Unknown User';
  };

  const getDisplayRole = () => {
    const participant = getOtherParticipant();
    return participant.role || 'user';
  };

  const displayName = getDisplayName();
  const displayRole = getDisplayRole();

  return (
    <div className="flex flex-col h-full bg-white">
      
            {/* Simple Header with Back Button */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        {/* --- ADD THIS BACK BUTTON --- */}
        <button 
          onClick={() => leaveChat()} 
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full mr-2"
          title="Back to all chats"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        {/* --- END OF BACK BUTTON --- */}

        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full flex-shrink-0 ...`}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          
          {/* User Info */}
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900 truncate">
              {displayName}
            </h2>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              {displayRole === 'corporate' ? (
                <Users className="w-4 h-4 flex-shrink-0" />
              ) : (
                <User className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="capitalize truncate">{displayRole}</span>
            </div>
          </div>
        </div>
        
        {/* Simple Menu */}
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-2">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {chatMessages.length === 0 ? (
          /* Empty State */
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-lg font-medium mb-2">Start the conversation</p>
              <p className="text-sm">Send a message to begin chatting with {displayName}</p>
            </div>
          </div>
        ) : (
          <>
            <MessageList messages={chatMessages} />
            
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <MessageInput chatId={activeChat._id} />
      </div>
    </div>
  );
};

export default MessageArea;
