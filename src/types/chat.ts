export interface User {
  id: string;
  phoneNumber: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  // Origin location
  originCountry: string;
  originState: string;
  originCity: string;
  // Current residence
  currentCountry: string;
  timezone: string;
  utcOffset: string;
  // Security & 2FA
  twoFactorEnabled: boolean;
  e2eePublicKey: string;
  e2eeFingerprint: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface MessageReaction {
  emoji: string;
  users: string[]; // user IDs
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  // E2EE fields
  encrypted: boolean;
  ciphertext?: string;
  iv?: string;
  // Rich media
  mediaUrl?: string;
  mediaType?: 'image' | 'voice' | 'file';
  voiceDuration?: number; // in seconds
  // Reactions & replies
  reactions?: Record<string, string[]>; // emoji -> array of user names
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  // Ephemeral
  selfDestructAt?: number;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group' | 'community';
  name: string;
  avatar: string;
  description?: string;
  participants: User[];
  messages: Message[];
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  disappearsIn?: number | null; // e.g. 86400 (24h) or null
  safetyNumber: string;
  locationTag?: {
    country: string;
    state?: string;
    city?: string;
    type: 'origin' | 'residence' | 'global';
  };
  onlineCount?: number;
  typingUser?: string | null;
}

export interface StatusStory {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  originCity?: string;
  text: string;
  bgColor?: string;
  imageUrl?: string;
  timestamp: number;
  viewsCount: number;
  hasSeen?: boolean;
}

export interface AISummaryResult {
  tldr: string;
  keyTopics: string[];
  actionItems: string[];
  decisions: string[];
  sentiment: string;
  funQuote?: string;
}
