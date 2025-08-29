/**
 * ChatWindow Component
 * Main floating chat widget that appears in the bottom-right corner
 */

import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import ChatList from './ChatList';
import MessageArea from './MessageArea';
import NewChatModal from './NewChatModal';

const ChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const { socketConnected, error, activeChat, leaveChat } = useChat();
  const { currentUser } = useAuth();

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={handleToggle}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors duration-200 flex items-center justify-center"
            aria-label="Open chat"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7.93-7M3 4a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" 
              />
            </svg>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-[48rem] h-[40rem] max-w-[90vw] max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg">Conversations</h3>
              {/* Connection Status Indicator */}
              <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors duration-200"
              aria-label="Close chat"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 m-2 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* --- NEW CONDITIONAL BODY --- */}
          <div className="flex-1 overflow-y-auto">
            {activeChat ? (
              // If a chat is selected, show the message area
              <MessageArea />
            ) : (
              // Otherwise, show the list of chats
              <div className="w-full h-full flex flex-col">
                <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-700">Recent Chats</h4>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => setIsNewChatModalOpen(true)}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      title="Start new chat"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto">
                  <ChatList />
                </div>
              </div>
            )}
          </div>

          {/* Connection Status Footer */}
          <div className="px-3 py-2 bg-gray-50 rounded-b-lg border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {socketConnected ? 'Connected' : 'Disconnected'}
              </span>
              <span className="text-xs text-gray-400">
                Real-time messaging
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* New Chat Modal */}
      <NewChatModal 
        isOpen={isNewChatModalOpen} 
        onClose={() => setIsNewChatModalOpen(false)} 
      />
    </>
  );
};

export default ChatWindow;