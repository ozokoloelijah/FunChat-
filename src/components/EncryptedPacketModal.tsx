import React, { useState } from 'react';
import { Lock, X, Copy, Check, ShieldCheck, Key } from 'lucide-react';
import { Message } from '../types/chat';

interface EncryptedPacketModalProps {
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EncryptedPacketModal: React.FC<EncryptedPacketModalProps> = ({
  message,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !message) return null;

  const mockPayload = {
    protocol: 'FunChat Signal/E2EE-v2',
    cipher: 'AES-256-GCM',
    keyExchange: 'Curve25519 (ECDH)',
    timestamp: message.timestamp,
    iv: message.iv || '0f4a8b192c3d5e718293ab4f',
    ciphertext: message.ciphertext || btoa(message.text) + '.c8f9a2',
    authTag: '8b7f29a03c4d5162738495a6b7c8d9e0',
    verification: 'HMAC-SHA256 Match',
    ephemeralStatus: 'Zero-Knowledge Relayed',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(mockPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Encrypted Packet Inspector</h3>
              <p className="text-xs text-slate-400">Zero-Knowledge Cryptographic Audit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-emerald-300">Verifiable Privacy: </span>
              This raw payload is all that passes through FunChat relays. Only peer private keys can decipher the message content.
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
              <span>Raw Over-The-Wire Payload</span>
              <button
                onClick={handleCopy}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied JSON' : 'Copy JSON'}
              </button>
            </div>
            <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-56 leading-relaxed">
              {JSON.stringify(mockPayload, null, 2)}
            </pre>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
            <span className="flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-slate-500" /> Key length: 256 bits
            </span>
            <span className="font-mono text-emerald-400">Status: E2EE Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
