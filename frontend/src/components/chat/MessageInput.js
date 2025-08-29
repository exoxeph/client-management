/**
 * MessageInput Component
 * Input form for typing and sending messages in the active chat
 */

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';

const MessageInput = () => {
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { activeChat, sendMessage, startTyping, stopTyping } = useChat();
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [messageText]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeChat || isSending) return;

    setIsSending(true);
    const textToSend = messageText.trim();
    
    try {
      // Clear the input immediately for better UX
      setMessageText('');
      
      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        stopTyping(activeChat._id);
      }
      
      // Send the message
      await sendMessage(activeChat._id, textToSend);
      
      // Focus back to textarea
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message text on error
      setMessageText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift + Enter = new line, let default behavior happen
        return;
      } else {
        // Enter = send message
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessageText(value);

    if (!activeChat) return;

    // Handle typing indicators
    if (value.trim()) {
      // Start typing indicator
      startTyping(activeChat._id);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(activeChat._id);
      }, 3000);
    } else {
      // Stop typing if input is empty
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        stopTyping(activeChat._id);
      }
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!activeChat) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-end space-x-2">
        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={messageText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              minHeight: '40px',
              maxHeight: '120px'
            }}
            disabled={isSending}
          />
          
          {/* Character counter for very long messages */}
          {messageText.length > 800 && (
            <div className="absolute bottom-1 right-2 text-xs text-gray-400">
              {messageText.length}/1000
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          disabled={!messageText.trim() || isSending}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            messageText.trim() && !isSending
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          {isSending ? (
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      {/* Typing Indicator Space */}
      <div className="mt-2 h-4">
        {/* This space will be used for typing indicators in future */}
      </div>
    </div>
  );
};

export default MessageInput;