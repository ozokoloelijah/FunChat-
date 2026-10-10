import React, { useState, useRef, useEffect } from 'react';
import { 
  Lock, 
  Sparkles, 
  ShieldCheck, 
  Share2, 
  Clock, 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Smile, 
  Check, 
  CheckCheck, 
  Play, 
  Pause, 
  Volume2, 
  X, 
  Reply, 
  Eye, 
  Users, 
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import { Chat, Message, User } from '../types/chat';
import { playSendSound, playReactionPop } from '../utils/sound';

interface ChatViewProps {
  chat: Chat | null;
  currentUser: User;
  onSendMessage: (text: string, mediaUrl?: string, mediaType?: 'image' | 'voice', voiceDuration?: number, replyTo?: any) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onOpenSafetyNumber: () => void;
  onOpenAISummary: () => void;
  onOpenSocialShare: () => void;
  onInspectPacket: (message: Message) => void;
  onToggleDisappearing: (seconds: number | null) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  chat,
  currentUser,
  onSendMessage,
  onAddReaction,
  onOpenSafetyNumber,
  onOpenAISummary,
  onOpenSocialShare,
  onInspectPacket,
  onToggleDisappearing,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showAttachMenu, setShowAttachMenu] = useState<boolean>(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [activeVoicePlaying, setActiveVoicePlaying] = useState<string | null>(null);
  const [voicePlaybackSpeed, setVoicePlaybackSpeed] = useState<number>(1);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [showImagePrompt, setShowImagePrompt] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const EMOJI_LIST = ['❤️', '🔥', '😂', '👏', '⚡', '🤯', '🙌', '💯', '✨', '😎'];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  // Voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecordingVoice]);

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mb-4 shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-1">FunChat Web</h3>
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
          Select a conversation or diaspora community group to start end-to-end encrypted messaging with AI-driven summaries.
        </p>
      </div>
    );
  }

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    playSendSound();
    onSendMessage(
      inputText.trim(),
      undefined,
      undefined,
      undefined,
      replyingMessage
        ? {
            id: replyingMessage.id,
            senderName: replyingMessage.senderName,
            text: replyingMessage.text,
          }
        : undefined
    );

    setInputText('');
    setReplyingMessage(null);
  };

  const handleSendVoiceNote = () => {
    setIsRecordingVoice(false);
    playSendSound();
    const duration = Math.max(2, recordingSeconds);
    onSendMessage(
      `Voice note (${duration}s)`,
      'voice_note_simulated',
      'voice',
      duration
    );
    setRecordingSeconds(0);
  };

  const handleSendImage = (url: string) => {
    if (!url.trim()) return;
    playSendSound();
    onSendMessage('Photo attachment', url.trim(), 'image');
    setImageUrlInput('');
    setShowImagePrompt(false);
    setShowAttachMenu(false);
  };

  const toggleVoicePlayback = (messageId: string) => {
    if (activeVoicePlaying === messageId) {
      setActiveVoicePlaying(null);
    } else {
      setActiveVoicePlaying(messageId);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/95 relative overflow-hidden">
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none" />

      {/* Top Chat Header */}
      <div className="h-16 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-10">
        {/* Contact / Group Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-10 h-10 rounded-2xl object-cover border border-slate-700/80"
            />
            {chat.type === 'community' && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[9px] font-bold">
                👥
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm truncate">{chat.name}</h3>
              {chat.locationTag && (
                <span className="text-[10px] bg-slate-800 text-cyan-400 px-2 py-0.5 rounded-full border border-slate-700/60 font-medium shrink-0">
                  📍 {chat.locationTag.city || chat.locationTag.country}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              {chat.typingUser ? (
                <span className="text-emerald-400 font-medium animate-pulse flex items-center gap-1">
                  <span>{chat.typingUser} is typing</span>
                  <span className="inline-block w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                </span>
              ) : chat.type === 'community' ? (
                <span>{chat.onlineCount || 34} online • E2EE Group</span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Online • Local time: {currentUser.utcOffset}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Top Action Bar */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* AI Summarize Catch-Up Button */}
          <button
            onClick={onOpenAISummary}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Generate AI Conversation Summary"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">AI Catch-Up</span>
          </button>

          {/* End-to-End Encryption Safety Lock Button */}
          <button
            onClick={onOpenSafetyNumber}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 transition cursor-pointer border border-slate-700/60"
            title="Verify 60-digit E2EE Safety Number"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* FunDrop Social Share */}
          <button
            onClick={onOpenSocialShare}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition cursor-pointer border border-slate-700/60"
            title="Share Group Invite"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Disappearing Messages Toggle */}
          <button
            onClick={() => onToggleDisappearing(chat.disappearsIn ? null : 86400)}
            className={`p-2 rounded-xl transition cursor-pointer border ${
              chat.disappearsIn
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 border-slate-700/60'
            }`}
            title={chat.disappearsIn ? 'Disappearing messages: 24h active' : 'Enable disappearing messages (24h)'}
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Disappearing banner if active */}
      {chat.disappearsIn && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-[11px] text-amber-300 flex items-center justify-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Disappearing messages enabled: New messages self-destruct after 24 hours.</span>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 z-0">
        {/* Encryption Assurance Watermark */}
        <div className="flex justify-center my-2">
          <div className="bg-slate-900/90 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-[11px] text-slate-400 flex items-center gap-1.5 shadow-sm">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Messages are end-to-end encrypted. No one outside of this chat can read them.</span>
          </div>
        </div>

        {chat.messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group/msg relative`}
            >
              {/* Sender Name in Group Chat */}
              {!isMe && chat.type === 'community' && (
                <span className="text-[11px] font-semibold text-emerald-400 ml-11 mb-1">
                  {msg.senderName}
                </span>
              )}

              <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%]`}>
                {/* Avatar for others */}
                {!isMe && (
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-xl object-cover border border-slate-700 shrink-0 mb-1"
                  />
                )}

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-3.5 relative shadow-md transition ${
                    isMe
                      ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-br-xs'
                      : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-xs'
                  }`}
                >
                  {/* Quoted reply header */}
                  {msg.replyTo && (
                    <div className="mb-2 p-2 rounded-xl bg-black/20 border-l-2 border-emerald-300 text-xs text-white/90">
                      <div className="font-bold text-[10px] text-emerald-300">{msg.replyTo.senderName}</div>
                      <div className="truncate text-[11px] opacity-80">{msg.replyTo.text}</div>
                    </div>
                  )}

                  {/* Photo Attachment */}
                  {msg.mediaType === 'image' && msg.mediaUrl && (
                    <div className="mb-2 rounded-xl overflow-hidden max-w-sm border border-black/10">
                      <img src={msg.mediaUrl} alt="Attachment" className="w-full h-auto object-cover max-h-60" />
                    </div>
                  )}

                  {/* Voice Note Player */}
                  {msg.mediaType === 'voice' ? (
                    <div className="flex items-center gap-3 py-1 min-w-[200px]">
                      <button
                        onClick={() => toggleVoicePlayback(msg.id)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer shadow-md ${
                          isMe ? 'bg-white text-emerald-700' : 'bg-emerald-500 text-slate-950'
                        }`}
                      >
                        {activeVoicePlaying === msg.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1 space-y-1">
                        {/* Audio Waveform visualization */}
                        <div className="flex items-center gap-1 h-6">
                          {[40, 70, 95, 60, 85, 30, 90, 65, 45, 80, 50, 75, 90, 60, 40].map((h, idx) => (
                            <div
                              key={idx}
                              className={`w-1 rounded-full transition-all duration-200 ${
                                activeVoicePlaying === msg.id && idx % 3 === 0
                                  ? 'bg-amber-300 animate-pulse'
                                  : isMe
                                  ? 'bg-white/80'
                                  : 'bg-emerald-400'
                              }`}
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-[10px] opacity-80 font-mono">
                          <span>0:0{msg.voiceDuration || 4}</span>
                          <button
                            onClick={() => setVoicePlaybackSpeed(s => s === 1 ? 1.5 : s === 1.5 ? 2 : 1)}
                            className="hover:underline font-bold"
                          >
                            {voicePlaybackSpeed}x
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Text Content */
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
                  )}

                  {/* Bubble Metadata & E2EE Lock */}
                  <div className="flex items-center justify-end gap-1.5 mt-1 pt-0.5 text-[10px] opacity-75">
                    {/* Inspect raw ciphertext button */}
                    <button
                      onClick={() => onInspectPacket(msg)}
                      className="hover:opacity-100 transition cursor-pointer flex items-center gap-0.5"
                      title="Inspect raw zero-knowledge AES-256-GCM ciphertext"
                    >
                      <Lock className="w-2.5 h-2.5" />
                    </button>

                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* Status ticks for me */}
                    {isMe && (
                      <span title={msg.status}>
                        {msg.status === 'sent' && <Check className="w-3 h-3" />}
                        {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 opacity-70" />}
                        {msg.status === 'read' && <CheckCheck className="w-3 h-3 text-cyan-200" />}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action buttons (Reply & Reactions) */}
                <div className="opacity-0 group-hover/msg:opacity-100 transition flex items-center gap-1 shrink-0 mb-2">
                  <button
                    onClick={() => setReplyingMessage(msg)}
                    className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                    title="Reply"
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </button>

                  <div className="relative group/emoji">
                    <button
                      className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                      title="React"
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-full mb-1 left-0 hidden group-hover/emoji:flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-full shadow-xl z-20">
                      {['❤️', '🔥', '😂', '👏', '⚡', '🤯'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            playReactionPop();
                            onAddReaction(msg.id, emoji);
                          }}
                          className="hover:scale-125 transition text-sm p-1 cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reaction Badges Under Bubble */}
              {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'mr-2' : 'ml-11'}`}>
                  {Object.entries(msg.reactions).map(([emoji, users]) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        playReactionPop();
                        onAddReaction(msg.id, emoji);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-full text-xs hover:border-slate-700 transition cursor-pointer"
                    >
                      <span>{emoji}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{users.length}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview Bar */}
      {replyingMessage && (
        <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Reply className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="font-bold text-emerald-400">{replyingMessage.senderName}</span>
              <span className="text-slate-400 ml-2 truncate max-w-xs inline-block align-bottom">
                {replyingMessage.text}
              </span>
            </div>
          </div>
          <button
            onClick={() => setReplyingMessage(null)}
            className="p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Image Prompt Drawer */}
      {showImagePrompt && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
          <input
            type="url"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="Paste image URL (e.g. Unsplash or photo link)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => handleSendImage(imageUrlInput)}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold cursor-pointer transition shrink-0"
          >
            Attach
          </button>
          <button
            onClick={() => setShowImagePrompt(false)}
            className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Message Input Bar */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 backdrop-blur-md shrink-0 z-10">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* Attachment Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title="Attach media"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {showAttachMenu && (
              <div className="absolute bottom-full mb-2 left-0 p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-1 min-w-[150px] z-30">
                <button
                  type="button"
                  onClick={() => {
                    setShowImagePrompt(true);
                    setShowAttachMenu(false);
                  }}
                  className="w-full p-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" /> Photo / Image
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSendMessage('📍 Shared location: Lekki Phase 1, Lagos', undefined, undefined);
                    setShowAttachMenu(false);
                  }}
                  className="w-full p-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-cyan-400" /> Share Location
                </button>
              </div>
            )}
          </div>

          {/* Emoji Picker Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              <Smile className="w-4 h-4" />
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 left-0 p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex gap-1 z-30">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setInputText((t) => t + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="p-1.5 hover:scale-125 transition text-base cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voice recording active banner or input box */}
          {isRecordingVoice ? (
            <div className="flex-1 flex items-center justify-between bg-rose-500/10 border border-rose-500/30 rounded-2xl px-4 py-2 text-rose-300 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-mono font-bold">Recording Voice Note: 0:0{recordingSeconds}s</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordingVoice(false)}
                  className="px-2 py-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendVoiceNote}
                  className="px-3 py-1 bg-rose-500 text-white rounded-lg font-bold cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`End-to-end encrypted message to ${chat.name}...`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          )}

          {/* Mic Button (Voice Note) or Send Button */}
          {inputText.trim() ? (
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer shadow-lg shadow-emerald-500/20"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsRecordingVoice(!isRecordingVoice)}
              className={`p-2.5 rounded-xl transition cursor-pointer ${
                isRecordingVoice
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Record Voice Note"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
