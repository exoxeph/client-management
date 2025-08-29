import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import PropTypes from 'prop-types'; // Import PropTypes for prop validation

const MessageList = ({ messages }) => { // <-- 1. RECEIVE messages as a prop
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);

  // 2. USE the prop directly. Do not call useChat() here.
  const chatMessages = messages || [];

  // 3. Auto-scroll logic now lives here.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);


  // All your helper functions remain the same
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };
  const isOutgoingMessage = (message) => {
    if (!currentUser || !message?.sender?.user) {
      return false;
    }
    const senderId = message.sender.user._id || message.sender.user;
    // --- THIS IS THE FIX ---
    // Compare the sender's ID to the currentUser's _id property.
    return senderId.toString() === currentUser._id.toString();
  };

  // The activeChat check is no longer needed here.

  if (chatMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-gray-500">
          <svg 
            className="w-12 h-12 mx-auto mb-2 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7.93-7M3 4a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1-1H3a1 1 0 01-1-1V4z" 
            />
          </svg>
          <p className="text-sm">No messages yet</p>
          <p className="text-xs text-gray-400 mt-1">Start the conversation below</p>
        </div>
      </div>
    );
  }

  return (
    // Your existing return JSX is perfect and remains here.
    // It will now correctly re-render whenever the `messages` prop changes.
    <div className="flex-1 p-4 space-y-4"> {/* Removed overflow-y-auto, parent handles it */}
      {chatMessages.map((message, index) => {
        const isOutgoing = isOutgoingMessage(message);
        const isOptimistic = message.isOptimistic;
        
        return (
          <div
            key={message._id || `message-${index}`}
            className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md`}>
              {/* Message Bubble */}
              <div
                className={`px-4 py-2 rounded-lg shadow-sm ${
                  isOutgoing
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                } ${isOptimistic ? 'opacity-70' : ''}`}
              >
                {/* Sender Name */}
                {!isOutgoing && message.sender && (
                  <div className="text-xs text-gray-600 mb-1 font-medium">
                    {message.sender.name || 'Unknown User'}
                  </div>
                )}
                
                {/* Content */}
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                
                {/* Timestamp */}
                <div className={`text-xs mt-1 ${
                  isOutgoing ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTimestamp(message.createdAt)}
                  {isOptimistic && (
                    <span className="ml-1">
                      <svg className="w-3 h-3 inline animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
              
              {/* Message Status for outgoing messages */}
              {isOutgoing && !isOptimistic && (
                <div className="text-xs text-gray-500 mt-1 text-right">
                  Delivered
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

// Add prop validation for clarity and bug prevention
MessageList.propTypes = {
  messages: PropTypes.array.isRequired
};

export default MessageList;