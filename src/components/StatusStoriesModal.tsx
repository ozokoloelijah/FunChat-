import React, { useState, useEffect } from 'react';
import { X, Plus, Eye, Send, Sparkles, MapPin, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { StatusStory, User } from '../types/chat';

interface StatusStoriesModalProps {
  stories: StatusStory[];
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onAddStory: (story: Partial<StatusStory>) => void;
  onReplyToStory: (userName: string, replyText: string) => void;
}

export const StatusStoriesModal: React.FC<StatusStoriesModalProps> = ({
  stories,
  currentUser,
  isOpen,
  onClose,
  onAddStory,
  onReplyToStory,
}) => {
  const [activeStoryIdx, setActiveStoryIdx] = useState<number>(0);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newText, setNewText] = useState<string>('');
  const [newBgColor, setNewBgColor] = useState<string>('from-emerald-600 to-teal-800');
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [replyText, setReplyText] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  const BG_PRESETS = [
    'from-emerald-600 to-teal-800',
    'from-violet-600 to-indigo-900',
    'from-rose-600 to-amber-700',
    'from-cyan-600 to-blue-900',
    'from-fuchsia-600 to-purple-900',
  ];

  // Auto-advance progress bar
  useEffect(() => {
    if (!isOpen || isCreating || stories.length === 0) return;
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeStoryIdx < stories.length - 1) {
            setActiveStoryIdx((idx) => idx + 1);
            return 0;
          } else {
            clearInterval(interval);
            return 100;
          }
        }
        return prev + 2; // ~5 seconds per story
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, activeStoryIdx, isCreating, stories.length]);

  if (!isOpen) return null;

  const currentStory = stories[activeStoryIdx];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() && !newImageUrl.trim()) return;

    onAddStory({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      originCity: currentUser.originCity,
      text: newText.trim(),
      bgColor: newBgColor,
      imageUrl: newImageUrl.trim() || undefined,
      timestamp: Date.now(),
      viewsCount: 1,
    });

    setNewText('');
    setNewImageUrl('');
    setIsCreating(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentStory) return;
    onReplyToStory(currentStory.userName, `Replying to status: "${currentStory.text}" -> ${replyText}`);
    setReplyText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-lg p-4">
      <div className="w-full max-w-sm h-[680px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Controls & Story Progress */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {!isCreating && (
            <div className="flex gap-1.5 mb-3">
              {stories.map((_, idx) => (
                <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-100"
                    style={{
                      width:
                        idx < activeStoryIdx
                          ? '100%'
                          : idx === activeStoryIdx
                          ? `${progress}%`
                          : '0%',
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-white">
            {!isCreating && currentStory ? (
              <div className="flex items-center gap-2.5">
                <img
                  src={currentStory.userAvatar}
                  alt={currentStory.userName}
                  className="w-9 h-9 rounded-full object-cover border border-white/40"
                />
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>{currentStory.userName}</span>
                    {currentStory.originCity && (
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-normal">
                        📍 {currentStory.originCity}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-white/70">24-hour Vibe Status</div>
                </div>
              </div>
            ) : (
              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Post 24h Vibe
              </div>
            )}

            <div className="flex items-center gap-2">
              {!isCreating && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition text-white cursor-pointer"
                  title="Add Story"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Middle Main Content */}
        {isCreating ? (
          <form onSubmit={handleCreateSubmit} className="flex-1 pt-20 p-6 flex flex-col justify-between z-10 bg-slate-900">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Your 24-Hour Vibe Update</label>
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="What's your current vibe? Diaspora news, music recommendations, weekend hangouts..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Background Theme</label>
                <div className="flex gap-2">
                  {BG_PRESETS.map((grad, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewBgColor(grad)}
                      className={`w-8 h-8 rounded-full bg-gradient-to-tr ${grad} cursor-pointer transition ${
                        newBgColor === grad ? 'ring-2 ring-white scale-110' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Optional Image URL</label>
                <div className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl">
                  <ImageIcon className="w-4 h-4 text-slate-500 shrink-0" />
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-transparent text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="w-1/3 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-2/3 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer transition shadow-lg shadow-emerald-500/20"
              >
                Post Status
              </button>
            </div>
          </form>
        ) : currentStory ? (
          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            {/* Story Image / Gradient background */}
            {currentStory.imageUrl ? (
              <img
                src={currentStory.imageUrl}
                alt="Story media"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-b ${currentStory.bgColor || 'from-emerald-600 to-teal-800'}`} />
            )}

            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

            {/* Nav Arrows */}
            <div className="absolute inset-0 flex items-center justify-between px-2 z-10 pointer-events-none">
              <button
                disabled={activeStoryIdx === 0}
                onClick={() => setActiveStoryIdx((i) => Math.max(0, i - 1))}
                className="p-1 rounded-full bg-black/30 text-white disabled:opacity-0 pointer-events-auto transition cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                disabled={activeStoryIdx === stories.length - 1}
                onClick={() => setActiveStoryIdx((i) => Math.min(stories.length - 1, i + 1))}
                className="p-1 rounded-full bg-black/30 text-white disabled:opacity-0 pointer-events-auto transition cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Story Text */}
            <div className="relative z-10 px-8 text-center text-white space-y-3">
              <p className="text-xl font-bold drop-shadow-md leading-relaxed">
                "{currentStory.text}"
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[11px] text-emerald-300">
                <Eye className="w-3.5 h-3.5" />
                <span>{currentStory.viewsCount} views • Encrypted Story</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <p>No active stories</p>
            <button
              onClick={() => setIsCreating(true)}
              className="mt-3 px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
            >
              Post First Story
            </button>
          </div>
        )}

        {/* Bottom Reply Bar */}
        {!isCreating && currentStory && (
          <div className="p-3 bg-black/70 backdrop-blur-md border-t border-white/10 z-20">
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${currentStory.userName}...`}
                className="w-full bg-white/10 border border-white/20 rounded-full py-2 px-3.5 text-xs text-white placeholder-white/50 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full transition cursor-pointer disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
