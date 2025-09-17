import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import PropTypes from 'prop-types';

const MessageList = ({ messages }) => {
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);

  const chatMessages = messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
  };

  const isOutgoingMessage = (message) => {
    if (!currentUser || !message?.sender?.user) return false;
    const senderId = message.sender.user._id || message.sender.user;
    return senderId.toString() === currentUser._id.toString();
  };

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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7.93-7M3 4a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V4z"
            />
          </svg>
          <p className="text-sm">No messages yet</p>
          <p className="text-xs text-gray-400 mt-1">Start the conversation below</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4">
      {chatMessages.map((message, index) => {
        const isOutgoing = isOutgoingMessage(message);
        const isOptimistic = message.isOptimistic;

        return (
          <div
            key={message._id || `message-${index}`}
            className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
          >
            <div className="max-w-[82%] sm:max-w-[75%]">
              {/* Bubble */}
              <div
                className={[
                  'px-3 py-2 sm:px-4 sm:py-3 rounded-2xl shadow-sm ring-1 transition-colors',
                  isOutgoing
                    ? 'bg-indigo-600 text-white ring-indigo-500/20 rounded-br-md'
                    : 'bg-white text-gray-900 ring-gray-200 rounded-bl-md',
                  isOptimistic ? 'opacity-80' : '',
                ].join(' ')}
              >
                {/* Sender (incoming only) */}
                {!isOutgoing && message.sender && (
                  <div className="mb-1 text-[11px] font-medium text-gray-500">
                    {message.sender.name || 'Unknown User'}
                  </div>
                )}

                {/* Content */}
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>

                {/* Timestamp & sending spinner */}
                <div
                  className={`mt-1 flex items-center gap-1.5 text-[11px] ${
                    isOutgoing ? 'text-indigo-100/90' : 'text-gray-500'
                  }`}
                >
                  <span>{formatTimestamp(message.createdAt)}</span>
                  {isOptimistic && (
                    <svg
                      className="h-3.5 w-3.5 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Status (outgoing only, not optimistic) */}
              {isOutgoing && !isOptimistic && (
                <div className="mt-1 text-right text-[11px] text-gray-400">Delivered</div>
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

MessageList.propTypes = {
  messages: PropTypes.array.isRequired,
};

export default MessageList;
