/**
 * ChatList — visual revamp only
 */
import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { MessageSquareText, Clock, InboxIcon, Sparkles, ChevronRight } from 'lucide-react';

const ChatList = () => {
  const { chats, activeChat, selectChat, isLoading, initiateChat, claimChat } = useChat();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const handleChatClick = (chat) => { selectChat(chat); };
  const handleClaimChat = async (e, chatId) => { e.stopPropagation(); try { await claimChat(chatId); } catch(e){ console.error(e);} };
  const handleNewChat = async () => { try { const c = await initiateChat(); if (c) selectChat(c); } catch(e){ console.error(e);} };

  const formatLastMessage = (m) => !m ? 'No messages yet' : (typeof m === 'object' && m.content) ? m.content : (typeof m === 'string' ? m : 'No messages yet');
  const formatTimestamp = (t) => { if(!t) return ''; const d=new Date(t), now=new Date(); const h=(now-d)/(1000*60*60); return h<1?'Just now': h<24?`${Math.floor(h)}h ago`: d.toLocaleDateString(); };
  const getUnreadCount = (chat) => (chat.unreadCounts && typeof chat.unreadCounts==='object') ? 0 : (chat.unreadCount || 0);

  const unclaimedChats = isAdmin ? chats.filter(c => c.status === 'unclaimed') : [];
  const myChats = isAdmin
    ? chats.filter(c => {
        const adminId = c?.assignedAdmin?.__id || c?.assignedAdmin?._id || c?.assignedAdmin;
        return c.status === 'active' && String(adminId) === String(currentUser._id);
      })
    : chats;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }
  if (isLoading && (!chats || chats.length === 0)) return <div className="p-4 text-center">Loading...</div>;

  if (!chats || chats.length === 0) {
    return (
      <div className="h-full rounded-2xl border border-indigo-100/60 bg-white/70 p-8 text-gray-600 shadow-md backdrop-blur">
        <div className="flex h-full flex-col items-center justify-center">
          <InboxIcon className="mb-3 h-10 w-10 text-indigo-400" />
          {isAdmin ? (
            <>
              <p className="text-sm font-medium">No chats available</p>
              <p className="mt-1 text-xs text-gray-400">Unclaimed requests from clients will appear here.</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="mt-1 text-xs text-gray-400">Need help? Start a chat with us.</p>
              <button
                onClick={handleNewChat}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Sparkles className="h-4 w-4" /> Start a New Chat
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-gradient-to-br from-white/90 to-indigo-50/40 shadow-lg backdrop-blur">
      {/* Unclaimed (admins) */}
      {isAdmin && unclaimedChats.length > 0 && (
        <div>
          <div className="flex items-center gap-2 border-b border-yellow-200/60 bg-gradient-to-r from-yellow-50 to-white px-4 py-2">
            <MessageSquareText className="h-4 w-4 text-yellow-700" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-yellow-800">Unclaimed Requests</h4>
          </div>

          {unclaimedChats.map((chat) => (
            <div
              key={chat._id}
              className="group relative cursor-pointer px-4 py-3 transition hover:bg-yellow-50/60"
              onClick={() => handleChatClick(chat)}
              role="button"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h5 className="truncate text-sm font-semibold text-gray-900">{chat.title || 'Support Request'}</h5>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatTimestamp(chat.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleClaimChat(e, chat._id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Claim <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header for admins */}
      {isAdmin && myChats.length > 0 && (
        <div className="sticky top-0 z-10 border-b border-green-200/60 bg-gradient-to-r from-green-50 to-white px-4 py-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-green-800">My Active Chats</h4>
        </div>
      )}

      <div className="divide-y divide-gray-100/70">
        {myChats.map((chat) => {
          const isActive = activeChat?._id === chat._id;
          const unreadCount = getUnreadCount(chat);
          const lastMessage = formatLastMessage(chat.lastMessage);
          const timestamp = formatTimestamp(chat.lastActivity);
          const avatarLetter = (chat.title || 'U').trim().charAt(0).toUpperCase();

          return (
            <div
              key={chat._id}
              onClick={() => selectChat(chat)}
              className={`group relative cursor-pointer px-4 py-4 transition ${
                isActive ? 'bg-indigo-50/80' : 'hover:bg-gray-50'
              } before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-r before:content-[""] ${
                isActive ? 'before:bg-indigo-500' : 'before:bg-transparent group-hover:before:bg-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* avatar with gradient ring */}
                <div className="relative mt-0.5 h-9 w-9 shrink-0">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/70 to-fuchsia-500/70 opacity-20 blur-[6px]" />
                  <div
                    className={`relative flex h-full w-full items-center justify-center rounded-full text-[11px] font-semibold ring-1 ring-black/5 ${
                      isActive ? 'bg-indigo-200 text-indigo-900' : 'bg-white text-gray-700'
                    }`}
                  >
                    {avatarLetter}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <h5 className={`truncate text-sm font-semibold ${isActive ? 'text-indigo-900' : 'text-gray-900'}`}>
                      {chat.title || 'Untitled Chat'}
                    </h5>
                    {timestamp && <span className="flex-shrink-0 text-xs text-gray-500">{timestamp}</span>}
                  </div>

                  <p className={`truncate text-xs ${isActive ? 'text-indigo-700' : 'text-gray-600'}`} title={lastMessage}>
                    {lastMessage}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        chat.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {chat.status || 'active'}
                    </span>

                    {unreadCount > 0 && (
                      <span className="relative inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                        <span className="absolute inset-0 -z-10 rounded-full bg-red-500/40 blur-[6px] animate-pulse" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;
