import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  MapPin, 
  Users, 
  Lock, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Pin, 
  ShieldCheck, 
  Clock, 
  Share2, 
  Camera, 
  Mic, 
  CheckCheck,
  ChevronRight,
  Smartphone
} from 'lucide-react';
import { Chat, StatusStory, User } from '../types/chat';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  currentUser: User;
  stories: StatusStory[];
  onOpenStories: () => void;
  onOpenCommunityExplorer: () => void;
  onOpenSocialShare: () => void;
  onOpenChangePhone: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  currentUser,
  stories,
  onOpenStories,
  onOpenCommunityExplorer,
  onOpenSocialShare,
  onOpenChangePhone,
  soundEnabled,
  onToggleSound,
  onNewChat,
}) => {
  const [filter, setFilter] = useState<'all' | 'community' | 'direct' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredChats = chats.filter((chat) => {
    // Filter tab
    if (filter === 'community' && chat.type !== 'community') return false;
    if (filter === 'direct' && chat.type !== 'direct') return false;
    if (filter === 'unread' && chat.unreadCount === 0) return false;

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = chat.name.toLowerCase().includes(q);
      const matchLoc = chat.locationTag?.city?.toLowerCase().includes(q) ||
        chat.locationTag?.country?.toLowerCase().includes(q);
      const matchMsg = chat.messages.some((m) => m.text.toLowerCase().includes(q));
      return matchName || matchLoc || matchMsg;
    }

    return true;
  });

  return (
    <div className="w-full md:w-96 h-full flex flex-col bg-slate-900 border-r border-slate-800/80 shrink-0 select-none">
      {/* Brand & Action Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 text-lg">
            ⚡
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
              FunChat
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-md font-mono">
                2FA E2EE
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              {currentUser.originCity} • {currentUser.utcOffset}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl transition cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                : 'bg-slate-800/60 text-slate-500 hover:text-slate-400'
            }`}
            title={soundEnabled ? 'Mute micro-sounds' : 'Enable micro-sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Social Share / FunDrop */}
          <button
            onClick={onOpenSocialShare}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="FunDrop Social Invites"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Explore Diaspora Communities */}
          <button
            onClick={onOpenCommunityExplorer}
            className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
            title="Find Location & Diaspora Groups"
          >
            <MapPin className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 24-Hour Stories / Status Carousel */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> 24h Vibe Status
          </span>
          <button
            onClick={onOpenStories}
            className="text-[11px] text-emerald-400 hover:underline font-semibold cursor-pointer"
          >
            View All ({stories.length})
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto py-1 px-1 scrollbar-none">
          {/* User's Add Story Circle */}
          <button
            onClick={onOpenStories}
            className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
          >
            <div className="relative w-12 h-12 rounded-full p-0.5 border-2 border-dashed border-slate-600 group-hover:border-emerald-400 transition">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full rounded-full object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                +
              </div>
            </div>
            <span className="text-[10px] text-slate-400 truncate max-w-[52px]">Your Vibe</span>
          </button>

          {/* Contacts Stories */}
          {stories.map((st) => (
            <button
              key={st.id}
              onClick={onOpenStories}
              className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-emerald-400 via-teal-300 to-cyan-500 shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition">
                <img
                  src={st.userAvatar}
                  alt={st.userName}
                  className="w-full h-full rounded-full object-cover border-2 border-slate-900"
                />
              </div>
              <span className="text-[10px] text-slate-300 truncate max-w-[56px] font-medium">
                {st.userName.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats, diaspora cities, or messages..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            filter === 'all'
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('community')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 whitespace-nowrap ${
            filter === 'community'
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-3 h-3" />
          <span>Communities</span>
        </button>
        <button
          onClick={() => setFilter('direct')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            filter === 'direct'
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
          }`}
        >
          Direct
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            filter === 'unread'
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
          }`}
        >
          Unread
        </button>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
        {filteredChats.map((chat) => {
          const isActive = chat.id === activeChatId;
          const lastMsg = chat.messages[chat.messages.length - 1];

          return (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`p-3.5 flex items-center gap-3 transition cursor-pointer hover:bg-slate-800/50 relative ${
                isActive ? 'bg-slate-800/80 border-l-4 border-emerald-500' : ''
              }`}
            >
              {/* Chat Avatar with online dot */}
              <div className="relative shrink-0">
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-700/80"
                />
                {chat.type === 'community' ? (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[9px] font-bold">
                    👥
                  </div>
                ) : (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                    {chat.name}
                    {chat.isPinned && <Pin className="w-3 h-3 text-slate-400 shrink-0" />}
                  </h4>
                  {lastMsg && (
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 truncate pr-2 flex items-center gap-1">
                    {lastMsg?.senderId === currentUser.id && (
                      <CheckCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    )}
                    {lastMsg?.mediaType === 'voice' ? (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Mic className="w-3 h-3 text-emerald-400" /> Voice note
                      </span>
                    ) : lastMsg?.mediaType === 'image' ? (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Camera className="w-3 h-3 text-emerald-400" /> Photo
                      </span>
                    ) : (
                      <span>{lastMsg ? lastMsg.text : 'Encrypted conversation started'}</span>
                    )}
                  </p>

                  {/* Unread badge & Location badge */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {chat.locationTag && (
                      <span className="text-[10px] text-cyan-400 font-medium hidden sm:inline">
                        {chat.locationTag.city || chat.locationTag.country}
                      </span>
                    )}
                    {chat.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] shadow-sm shadow-emerald-500/30">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredChats.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500">
            No conversations match this view.
          </div>
        )}
      </div>

      {/* User Footer Profile & 2FA Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-white truncate">{currentUser.name}</span>
              <span title="2FA Verified" className="inline-flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </span>
            </div>
            <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
              <span>📍 {currentUser.originCity}</span>
              <span>•</span>
              <button
                onClick={onOpenChangePhone}
                className="text-emerald-400 hover:text-emerald-300 font-mono transition cursor-pointer flex items-center gap-0.5"
                title="Change Phone Number"
              >
                <Smartphone className="w-2.5 h-2.5" />
                <span>{currentUser.phoneNumber}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenChangePhone}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
            title="Change Phone Number (Web SMS 2FA)"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
          </button>
          <button
            onClick={onOpenCommunityExplorer}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
            title="Explore Location Communities"
          >
            <ChevronRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
