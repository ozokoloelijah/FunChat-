import React, { useState } from 'react';
import { 
  Share2, 
  X, 
  Copy, 
  Check, 
  QrCode, 
  Twitter, 
  Send, 
  MessageSquare, 
  Sparkles,
  Link2,
  Users
} from 'lucide-react';
import { Chat, User } from '../types/chat';

interface SocialShareModalProps {
  chat: Chat | null;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  chat,
  currentUser,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const targetName = chat ? chat.name : `${currentUser.name}'s FunChat`;
  const inviteCode = `funchat.me/join/${chat ? chat.id : currentUser.username}`;
  const shareText = `Join me on FunChat! End-to-end encrypted messaging with AI conversation summaries & location-based diaspora groups: ${inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${targetName} on FunChat`,
          text: shareText,
          url: `https://${inviteCode}`,
        });
      } catch {
        // user dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(`https://${inviteCode}`)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">FunDrop Social Invite</h3>
              <p className="text-xs text-slate-400">Share encrypted group or profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Visual Share Card */}
          <div className="p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl relative overflow-hidden text-center shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="w-14 h-14 mx-auto mb-2.5 rounded-2xl overflow-hidden border-2 border-emerald-400/50 p-0.5 bg-slate-800">
              <img
                src={chat ? chat.avatar : currentUser.avatar}
                alt="Avatar"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <h4 className="font-bold text-white text-base truncate">{targetName}</h4>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                🔒 E2EE Link
              </span>
              {chat?.locationTag && (
                <span className="text-[11px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  📍 {chat.locationTag.city || chat.locationTag.country}
                </span>
              )}
            </div>

            {/* Simulated mini QR */}
            <div className="mt-4 p-2 bg-white rounded-xl inline-block mx-auto shadow-sm">
              <div className="w-24 h-24 bg-slate-950 rounded p-1.5 grid grid-cols-4 grid-rows-4 gap-1">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs ${
                      i % 2 === 0 || i === 5 || i === 10 ? 'bg-emerald-400' : 'bg-slate-900'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-[10px] text-slate-400 mt-2 font-mono">Scan to Join on FunChat</div>
          </div>

          {/* Copyable link input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Direct Invite Link</label>
            <div className="flex items-center gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-xl focus-within:border-emerald-500 transition">
              <Link2 className="w-4 h-4 text-slate-500 ml-2 shrink-0" />
              <input
                type="text"
                readOnly
                value={inviteCode}
                className="w-full bg-transparent text-xs font-mono text-emerald-300 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Quick Share buttons */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-300">Share to Socials</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={shareTwitter}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Twitter className="w-4 h-4 text-sky-400" /> X (Twitter)
              </button>
              <button
                onClick={shareWhatsApp}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" /> WhatsApp
              </button>
              <button
                onClick={shareTelegram}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-4 h-4 text-cyan-400" /> Telegram
              </button>
            </div>
          </div>

          {/* Native Web Share button */}
          <button
            onClick={handleNativeShare}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Share2 className="w-4 h-4" /> Share via System Apps
          </button>
        </div>
      </div>
    </div>
  );
};
