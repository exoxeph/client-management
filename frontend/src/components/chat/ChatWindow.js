/**
 * ChatWindow Component
 * Main floating chat widget that appears in the bottom-right corner
 * VISUAL REVAMP — behavior/logic preserved
 */

import React, { useEffect, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import ChatList from './ChatList';
import MessageArea from './MessageArea';
import NewChatModal from './NewChatModal';

const ChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const { socketConnected, error, activeChat } = useChat();
  const { currentUser } = useAuth();

  const handleClose = () => setIsOpen(false);
  const handleToggle = () => setIsOpen((v) => !v);

  // Optional a11y: allow Esc to close when open (no other logic changed)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <>
      {/* Floating Toggle (FAB) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-50">
          <button
            onClick={handleToggle}
            aria-label="Open chat"
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-xl ring-1 ring-black/10 transition-all hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7.93-7M3 4a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" />
            </svg>
            <span
              className={`absolute -top-0.5 -right-0.5 inline-flex h-3 w-3 rounded-full ring-2 ring-white ${
                socketConnected ? 'bg-emerald-400' : 'bg-red-400'
              }`}
              title={socketConnected ? 'Connected' : 'Disconnected'}
            />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Chat window"
          className="fixed bottom-5 right-5 z-50"
        >
          <div
            className="chatwin-animate overflow-hidden rounded-2xl border border-white/25 bg-white/90 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 w-[48rem] max-w-[92vw] h-[40rem] max-h-[82vh] flex flex-col relative"
          >
            {/* Decorative rim */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/40" />
            <div className="pointer-events-none absolute inset-0 rounded-2xl [background:radial-gradient(120%_60%_at_100%_0%,rgba(99,102,241,0.15),transparent_45%)]" />

            {/* Header */}
            <div className="relative flex items-center justify-between bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 text-white">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="truncate text-base font-semibold">
                  {activeChat ? (activeChat.title || 'Conversation') : 'Conversations'}
                </h3>
                <span
                  className={`inline-flex h-2.5 w-2.5 rounded-full ${
                    socketConnected ? 'bg-emerald-400' : 'bg-red-400'
                  }`}
                  title={socketConnected ? 'Connected' : 'Disconnected'}
                />
              </div>

              <div className="flex items-center gap-2">
                {/** Admin quick action mirrors the subheader button (does not change logic) */}
                {!activeChat && currentUser?.role === 'admin' && (
                  <button
                    onClick={() => setIsNewChatModalOpen(true)}
                    title="Start new chat"
                    className="hidden sm:inline-flex rounded-md bg-white/10 px-2 py-1 text-sm font-medium text-white ring-1 ring-inset ring-white/20 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
                  >
                    New
                  </button>
                )}
                <button
                  onClick={handleClose}
                  aria-label="Close chat"
                  className="rounded-md p-1 text-white/90 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Error bar */}
            {error && (
              <div className="m-3 rounded-lg border-l-4 border-red-400 bg-red-50/95 px-3 py-2 text-sm text-red-700 shadow-sm">
                {error}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {activeChat ? (
                <MessageArea />
              ) : (
                <div className="flex h-full w-full flex-col">
                  {/* Subheader */}
                  <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/80 bg-gray-50/80 px-4 py-2 backdrop-blur">
                    <h4 className="text-sm font-medium text-gray-700">Recent Chats</h4>
                    {currentUser?.role === 'admin' && (
                      <button
                        onClick={() => setIsNewChatModalOpen(true)}
                        title="Start new chat"
                        className="rounded-md p-1.5 text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="flex-1 overflow-y-auto px-2 py-2">
                    <ChatList />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200/80 bg-gray-50/80 px-4 py-2">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${socketConnected ? 'text-emerald-600' : 'text-red-600'}`}>
                  {socketConnected ? 'Connected' : 'Disconnected'}
                </span>
                <span className="text-gray-500">Real-time messaging</span>
              </div>
            </div>
          </div>

          {/* mount animation (reduced motion friendly) */}
          <style>{`
            @media (prefers-reduced-motion: no-preference) {
              .chatwin-animate {
                animation: chatwin-pop 220ms cubic-bezier(.2,.8,.2,1) both;
                transform-origin: 100% 100%;
              }
            }
            @keyframes chatwin-pop {
              from { opacity: 0; transform: translateY(8px) scale(.98); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
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
