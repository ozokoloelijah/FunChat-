import React, { useState } from 'react';
import { ShieldCheck, Lock, QrCode, CheckCircle2, X, Copy, Check } from 'lucide-react';
import { Chat, User } from '../types/chat';

interface SafetyNumberModalProps {
  chat: Chat | null;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyNumberModal: React.FC<SafetyNumberModalProps> = ({
  chat,
  currentUser,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  if (!isOpen || !chat) return null;

  const safetyBlocks = chat.safetyNumber ? chat.safetyNumber.split(' ') : [];

  const handleCopy = () => {
    navigator.clipboard.writeText(chat.safetyNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Verify Safety Number</h3>
              <p className="text-xs text-slate-400">End-to-End Encryption Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Explanation */}
          <div className="text-center space-y-1.5">
            <p className="text-xs text-slate-300 leading-relaxed">
              To verify that messages and calls in <span className="font-semibold text-white">"{chat.name}"</span> are truly end-to-end encrypted with zero intermediary access, compare this 60-digit safety number with their device.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <Lock className="w-3 h-3" />
              <span>Curve25519 ECDH + AES-256-GCM Verified</span>
            </div>
          </div>

          {/* QR Code / Visual Matrix */}
          <div className="flex justify-center">
            <div className="p-3.5 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center">
              {/* Simulated crisp QR matrix pattern */}
              <div className="w-36 h-36 bg-slate-950 rounded-lg p-2.5 grid grid-cols-6 grid-rows-6 gap-1">
                {Array.from({ length: 36 }).map((_, i) => {
                  const isCorner =
                    (i % 6 < 2 && Math.floor(i / 6) < 2) ||
                    (i % 6 >= 4 && Math.floor(i / 6) < 2) ||
                    (i % 6 < 2 && Math.floor(i / 6) >= 4);
                  const active = isCorner || (i * 17 + 5) % 3 === 0;
                  return (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        active ? 'bg-emerald-400' : 'bg-slate-900'
                      }`}
                    />
                  );
                })}
              </div>
              <div className="mt-2 text-[10px] font-mono font-bold text-slate-800 flex items-center gap-1">
                <QrCode className="w-3 h-3" /> Scan from FunChat App
              </div>
            </div>
          </div>

          {/* 60-digit number block: 4 columns x 3 rows */}
          <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4">
            <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs text-slate-200">
              {safetyBlocks.map((block, i) => (
                <div key={i} className="py-1 px-1 bg-slate-900/60 rounded border border-slate-800/60">
                  {block}
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Fingerprint: {currentUser.e2eeFingerprint.slice(0, 19)}...
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>
          </div>

          {/* Verification toggle action */}
          <div className="space-y-2">
            <button
              onClick={() => setIsVerified(!isVerified)}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                isVerified
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isVerified ? 'Marked as Verified Secure' : 'Mark as Verified'}
            </button>
            <p className="text-center text-[11px] text-slate-500">
              End-to-end encrypted chats cannot be read by FunChat servers or third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
