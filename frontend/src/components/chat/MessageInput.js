/**
 * MessageInput Component
 * Input form for typing and sending messages in the active chat
 * BARE VISUAL – no extra boxes; logic unchanged
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
      setMessageText('');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        stopTyping(activeChat._id);
      }
      await sendMessage(activeChat._id, textToSend);
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) return; // newline
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessageText(value);
    if (!activeChat) return;

    if (value.trim()) {
      startTyping(activeChat._id);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => stopTyping(activeChat._id), 3000);
    } else {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        stopTyping(activeChat._id);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  if (!activeChat) return null;

  const tooLong = messageText.length > 800;

  return (
    <div className="flex items-end gap-2">
      {/* Input */}
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={messageText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          className="w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          style={{ minHeight: '40px', maxHeight: '140px' }}
          disabled={isSending}
        />
        {tooLong && (
          <div className="pointer-events-none absolute bottom-1 right-3 rounded bg-white/90 px-1.5 py-0.5 text-[11px] text-gray-500 ring-1 ring-gray-200">
            {messageText.length}/1000
          </div>
        )}
      </div>

      {/* Send */}
      <button
        onClick={handleSendMessage}
        disabled={!messageText.trim() || isSending}
        aria-label="Send message"
        className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          messageText.trim() && !isSending
            ? 'bg-indigo-600 text-white hover:-translate-y-0.5 hover:bg-indigo-700 shadow-sm'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isSending ? (
          <svg className="h-5 w-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default MessageInput;
