import React, { useState } from 'react';
import { Users, MapPin, Globe2, Sparkles, X, Plus, Search, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Chat, User } from '../types/chat';

interface CommunityExplorerModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onJoinCommunity: (group: Partial<Chat>) => void;
  existingChatIds: string[];
}

export const CommunityExplorerModal: React.FC<CommunityExplorerModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onJoinCommunity,
  existingChatIds,
}) => {
  const [activeTab, setActiveTab] = useState<'origin' | 'residence' | 'global'>('origin');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreateCustom, setShowCreateCustom] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customCity, setCustomCity] = useState<string>(currentUser.originCity || '');

  if (!isOpen) return null;

  const COMMUNITIES_CATALOG: Array<Partial<Chat> & { category: 'origin' | 'residence' | 'global'; members: number }> = [
    {
      id: `comm_${currentUser.originCity.toLowerCase()}_network`,
      type: 'community',
      name: `${currentUser.originCity} Diaspora & Friends Worldwide`,
      avatar: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150&auto=format&fit=crop&q=80',
      description: `Official homeland community for people from ${currentUser.originCity}, ${currentUser.originCountry}. Connecting alumni, creators & tech talents.`,
      category: 'origin',
      members: 1420,
      safetyNumber: '99120 74123 60912 34159 10823 48123 90123 48192 14298 90312 85610 23145',
      locationTag: {
        country: currentUser.originCountry,
        city: currentUser.originCity,
        type: 'origin',
      },
    },
    {
      id: `comm_${currentUser.originState.toLowerCase()}_creatives`,
      type: 'community',
      name: `${currentUser.originState} Creative & Startup Guild`,
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      description: `Statewide network for founders, designers, and innovators from ${currentUser.originState}, ${currentUser.originCountry}.`,
      category: 'origin',
      members: 890,
      safetyNumber: '11928 49102 81923 38192 90923 14712 80123 64812 77123 90123 48192 30192',
      locationTag: {
        country: currentUser.originCountry,
        state: currentUser.originState,
        type: 'origin',
      },
    },
    {
      id: `comm_residence_${currentUser.currentCountry.toLowerCase()}`,
      type: 'community',
      name: `${currentUser.currentCountry} Expats & Gen-Z Connect`,
      avatar: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=150&auto=format&fit=crop&q=80',
      description: `Connecting diaspora and locals currently living in ${currentUser.currentCountry}. Timezone: ${currentUser.utcOffset}.`,
      category: 'residence',
      members: 3100,
      safetyNumber: '34159 10823 48123 90123 48192 14298 90312 85610 23145 99120 74123 60912',
      locationTag: {
        country: currentUser.currentCountry,
        type: 'residence',
      },
    },
    {
      id: `comm_residence_nightlife`,
      type: 'community',
      name: `${currentUser.currentCountry} Weekend Vibes & Foodies`,
      avatar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80',
      description: `Curated meetups, authentic diaspora cuisine, and weekend hangouts across ${currentUser.currentCountry}.`,
      category: 'residence',
      members: 950,
      safetyNumber: '48123 90123 48192 14298 90312 85610 23145 99120 74123 60912 34159 10823',
      locationTag: {
        country: currentUser.currentCountry,
        type: 'residence',
      },
    },
    {
      id: 'comm_global_cipher',
      type: 'community',
      name: 'CipherRoom // Zero-Knowledge & Web3 Privacy',
      avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
      description: 'Global privacy enthusiasts, cryptography researchers, and open-source protocol builders.',
      category: 'global',
      members: 5400,
      safetyNumber: '85610 23145 99120 74123 60912 34159 10823 48123 90123 48192 14298 90312',
      locationTag: {
        country: 'Global',
        type: 'global',
      },
    },
    {
      id: 'comm_global_afrobeats',
      type: 'community',
      name: 'Afro-Global Sound & Culture Lounge',
      avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
      description: 'Listening parties, DJ set drops, and diaspora cultural discussions spanning Lagos, London, Toronto & NYC.',
      category: 'global',
      members: 6200,
      safetyNumber: '74123 60912 34159 10823 48123 90123 48192 14298 90312 85610 23145 99120',
      locationTag: {
        country: 'Global',
        type: 'global',
      },
    },
  ];

  const filtered = COMMUNITIES_CATALOG.filter((c) => {
    const matchesCategory = c.category === activeTab;
    const matchesQuery = searchQuery === '' || 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleCreateCustomGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    onJoinCommunity({
      id: `comm_custom_${Date.now()}`,
      type: 'community',
      name: customName.trim(),
      avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&auto=format&fit=crop&q=80',
      description: `Community group for ${customCity || currentUser.originCity} created by ${currentUser.name}.`,
      safetyNumber: '48192 14298 90312 85610 23145 99120 74123 60912 34159 10823 48123 90123',
      locationTag: {
        country: currentUser.originCountry,
        city: customCity || currentUser.originCity,
        type: 'origin',
      },
    });

    setCustomName('');
    setShowCreateCustom(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Location-Based Communities</h3>
              <p className="text-xs text-slate-400">
                Connect with hometown roots & local diaspora networks
              </p>
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
          {/* Tabs */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('origin')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'origin'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Homeland ({currentUser.originCity})</span>
              </button>
              <button
                onClick={() => setActiveTab('residence')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'residence'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Living In ({currentUser.currentCountry})</span>
              </button>
              <button
                onClick={() => setActiveTab('global')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'global'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Global Hubs</span>
              </button>
            </div>

            <button
              onClick={() => setShowCreateCustom(!showCreateCustom)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab} communities...`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Custom group create drawer */}
          {showCreateCustom && (
            <form onSubmit={handleCreateCustomGroup} className="p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Start a Location Group
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Lagos Tech Club"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="Target City"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition cursor-pointer"
              >
                Launch Encrypted Community Group
              </button>
            </form>
          )}

          {/* Community Cards List */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {filtered.map((comm) => {
              const alreadyJoined = existingChatIds.includes(comm.id || '');

              return (
                <div
                  key={comm.id}
                  className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={comm.avatar}
                      alt={comm.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{comm.name}</h4>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded-md">
                          🔒 E2EE
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{comm.description}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Users className="w-3 h-3 text-emerald-400" /> {comm.members} members
                        </span>
                        <span>•</span>
                        <span className="text-cyan-400 font-medium">
                          📍 {comm.locationTag?.city || comm.locationTag?.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onJoinCommunity(comm);
                      onClose();
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                      alreadyJoined
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                    }`}
                  >
                    {alreadyJoined ? 'Open Chat' : 'Join'}
                  </button>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                No communities found matching your search. Try creating one!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
