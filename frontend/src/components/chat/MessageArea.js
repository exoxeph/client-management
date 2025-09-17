/**
 * Simplified MessageArea Component
 * Clean message display and input interface
 * VISUAL REVAMP ONLY — logic unchanged
 */

import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { User, Users, MoreVertical } from 'lucide-react';

const MessageArea = () => {
  const { currentUser } = useAuth();
  const { activeChat, messages, markChatAsRead, leaveChat } = useChat();

  console.log('[MessageArea Render] Active Chat ID:', activeChat?._id);
  console.log('[MessageArea Render] All messages state:', messages);

  const chatMessages = messages[activeChat?._id] || [];
  if (!activeChat) return null;

  const getOtherParticipant = () => {
    return activeChat.participants?.find((p) => p.user._id !== currentUser._id) || {};
  };

  const getDisplayName = () => {
    const participant = getOtherParticipant();
    return (
      participant.profile?.fullName ||
      participant.profile?.companyName ||
      participant.user?.email ||
      'Unknown User'
    );
  };

  const getDisplayRole = () => {
    const participant = getOtherParticipant();
    return participant.role || 'user';
  };

  const displayName = getDisplayName();
  const displayRole = getDisplayRole();
  const avatarLetter = displayName?.trim()?.charAt(0)?.toUpperCase?.() || 'U';

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center border-b border-gray-200/80 bg-white/90 px-3 py-2 backdrop-blur">
        {/* Back */}
        <button
          onClick={() => leaveChat()}
          className="mr-2 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          title="Back to all chats"
          aria-label="Back to all chats"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0 7-7M3 12h18" />
          </svg>
        </button>

        {/* Avatar + Info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative h-10 w-10 shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30 blur-[6px]" aria-hidden="true" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white text-sm font-semibold text-gray-700 ring-1 ring-black/5">
              {avatarLetter}
            </div>
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-gray-900">{displayName}</h2>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
              {displayRole === 'corporate' ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
              <span className="capitalize truncate">{displayRole}</span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <button
          className="ml-2 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          title="More"
          aria-label="More"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Messages canvas */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white px-3 py-4">
        {chatMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="mb-3 text-4xl">💬</div>
              <p className="mb-1 text-lg font-medium">Start the conversation</p>
              <p className="text-sm">Send a message to begin chatting with {displayName}</p>
            </div>
          </div>
        ) : (
          <>
            {/* subtle container ring for messages */}
            <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white/80 p-1 sm:p-2 ring-1 ring-gray-200/70 shadow-sm">
              <MessageList messages={chatMessages} />
            </div>
          </>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-gray-200/80 bg-white/90 px-3 py-3 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl">
          <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
            <MessageInput chatId={activeChat._id} />
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Press Enter to send • Shift+Enter for a new line</p>
        </div>
      </div>
    </div>
  );
};

export default MessageArea;
