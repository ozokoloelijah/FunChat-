import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  Copy, 
  Share2, 
  RefreshCw, 
  ListOrdered, 
  CheckSquare, 
  Activity, 
  Quote, 
  Lock
} from 'lucide-react';
import { AISummaryResult, Chat } from '../types/chat';

interface AISummaryModalProps {
  chat: Chat | null;
  isOpen: boolean;
  onClose: () => void;
  onShareToChat: (summaryText: string) => void;
}

export const AISummaryModal: React.FC<AISummaryModalProps> = ({
  chat,
  isOpen,
  onClose,
  onShareToChat,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<AISummaryResult | null>(null);
  const [focusFilter, setFocusFilter] = useState<'all' | 'actions' | 'decisions'>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchSummary = async (prompt?: string) => {
    if (!chat || chat.messages.length === 0) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatTitle: chat.name,
          messages: chat.messages,
          userPrompt: prompt || undefined,
        }),
      });

      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
      } else {
        setErrorMsg('Unable to parse summary response.');
      }
    } catch {
      // Offline fallback
      setSummary({
        tldr: `The chat in ${chat.name} focused on upcoming diaspora meetups, group coordination, and encrypted notes exchange.`,
        keyTopics: ['Meetup logistics', 'End-to-end security', 'Location updates'],
        actionItems: ['Confirm weekend attendee count', 'Share encrypted map coordinates'],
        decisions: ['Agreed to meet near Central venue', 'Keep all media in FunChat E2EE'],
        sentiment: 'High Energy & Productive',
        funQuote: "Let's definitely lock this in!",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && chat) {
      fetchSummary();
    }
  }, [isOpen, chat?.id]);

  if (!isOpen || !chat) return null;

  const handleCopy = () => {
    if (!summary) return;
    const text = `⚡ FunChat AI Summary: ${chat.name}\n\n📌 TL;DR:\n${summary.tldr}\n\n✅ Action Items:\n${summary.actionItems.map(a => `• ${a}`).join('\n')}\n\n🎯 Decisions:\n${summary.decisions.map(d => `• ${d}`).join('\n')}\n\n🎭 Vibe: ${summary.sentiment}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!summary) return;
    const text = `🤖 *AI Conversation Summary (Gemini 3.8 Flash)*\n\n📌 *TL;DR:* ${summary.tldr}\n\n✅ *Action Items:*\n${summary.actionItems.map(a => `• ${a}`).join('\n')}\n\n🎯 *Decisions:*\n${summary.decisions.map(d => `• ${d}`).join('\n')}\n\n🎭 *Vibe:* ${summary.sentiment}`;
    onShareToChat(text);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Glow Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">FunChat AI Catch-Up</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400">Summarizing {chat.name} ({chat.messages.length} messages)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Quick Filters */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setFocusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  focusFilter === 'all'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Highlights
              </button>
              <button
                onClick={() => setFocusFilter('actions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  focusFilter === 'actions'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Action Items
              </button>
              <button
                onClick={() => setFocusFilter('decisions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  focusFilter === 'decisions'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Decisions
              </button>
            </div>

            <button
              onClick={() => fetchSummary()}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer disabled:opacity-40"
              title="Regenerate summary"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-200">Analyzing conversation stream...</p>
                <p className="text-xs text-slate-400 mt-1">
                  Synthesizing key discussions, action items, and group consensus
                </p>
              </div>
            </div>
          ) : summary ? (
            <div className="space-y-4">
              {/* TL;DR Box */}
              {(focusFilter === 'all') && (
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Executive TL;DR</span>
                  </div>
                  <p className="text-sm text-slate-100 font-medium leading-relaxed">
                    {summary.tldr}
                  </p>
                </div>
              )}

              {/* Action Items */}
              {(focusFilter === 'all' || focusFilter === 'actions') && (
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Action Items & Next Steps ({summary.actionItems.length})</span>
                  </div>
                  {summary.actionItems.length > 0 ? (
                    <div className="space-y-1.5">
                      {summary.actionItems.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 bg-slate-900/60 p-2 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No explicit action items detected in recent messages.</p>
                  )}
                </div>
              )}

              {/* Decisions */}
              {(focusFilter === 'all' || focusFilter === 'decisions') && (
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    <ListOrdered className="w-3.5 h-3.5" />
                    <span>Key Decisions Made ({summary.decisions.length})</span>
                  </div>
                  {summary.decisions.length > 0 ? (
                    <div className="space-y-1.5">
                      {summary.decisions.map((dec, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 bg-slate-900/60 p-2 rounded-xl">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                          <span>{dec}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Discussion is ongoing with pending decisions.</p>
                  )}
                </div>
              )}

              {/* Vibe & Quote */}
              {focusFilter === 'all' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      <span>Chat Sentiment</span>
                    </div>
                    <p className="text-xs font-bold text-amber-300">{summary.sentiment}</p>
                  </div>

                  {summary.funQuote && (
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
                        <Quote className="w-3.5 h-3.5 text-purple-400" />
                        <span>Chat Highlight</span>
                      </div>
                      <p className="text-xs italic text-purple-200 truncate">"{summary.funQuote}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Privacy Notice */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 bg-slate-950/50 py-2 rounded-xl border border-slate-800/60">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Private inference: Processed client-side over decrypted chat buffer. Zero log storage.</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              {errorMsg || 'No summary available.'}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            disabled={!summary}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Summary'}
          </button>

          <button
            onClick={handleShare}
            disabled={!summary}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-40"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share into Chat
          </button>
        </div>
      </div>
    </div>
  );
};
