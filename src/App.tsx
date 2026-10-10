/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { RegistrationModal } from './components/RegistrationModal';
import { SafetyNumberModal } from './components/SafetyNumberModal';
import { AISummaryModal } from './components/AISummaryModal';
import { EncryptedPacketModal } from './components/EncryptedPacketModal';
import { SocialShareModal } from './components/SocialShareModal';
import { StatusStoriesModal } from './components/StatusStoriesModal';
import { CommunityExplorerModal } from './components/CommunityExplorerModal';
import { ChangePhoneModal } from './components/ChangePhoneModal';
import { Chat, Message, StatusStory, User } from './types/chat';
import { createInitialChats, INITIAL_STORIES } from './utils/mockData';
import { encryptMessage } from './utils/crypto';
import { isSoundEnabled, setSoundEnabled, playReceiveSound } from './utils/sound';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('funchat_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(!currentUser);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [stories, setStories] = useState<StatusStory[]>(INITIAL_STORIES);

  // Modals state
  const [safetyNumberModalOpen, setSafetyNumberModalOpen] = useState<boolean>(false);
  const [aiSummaryModalOpen, setAiSummaryModalOpen] = useState<boolean>(false);
  const [socialShareModalOpen, setSocialShareModalOpen] = useState<boolean>(false);
  const [statusStoriesModalOpen, setStatusStoriesModalOpen] = useState<boolean>(false);
  const [communityExplorerModalOpen, setCommunityExplorerModalOpen] = useState<boolean>(false);
  const [changePhoneModalOpen, setChangePhoneModalOpen] = useState<boolean>(false);
  const [inspectingMessage, setInspectingMessage] = useState<Message | null>(null);
  const [soundActive, setSoundActive] = useState<boolean>(true);

  // Initialize chats once currentUser exists
  useEffect(() => {
    if (currentUser) {
      const initial = createInitialChats(currentUser);
      setChats(initial);
      if (initial.length > 0 && !activeChatId) {
        setActiveChatId(initial[0].id);
      }
    }
  }, [currentUser]);

  // Handle registration complete
  const handleRegistrationComplete = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('funchat_user', JSON.stringify(user));
    setIsRegistrationOpen(false);
  };

  // Handle phone number update
  const handlePhoneUpdated = (newPhone: string) => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      phoneNumber: newPhone,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('funchat_user', JSON.stringify(updatedUser));
  };

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  // Sound toggle
  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
  };

  // Send message
  const handleSendMessage = (
    text: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'voice',
    voiceDuration?: number,
    replyTo?: any
  ) => {
    if (!activeChat || !currentUser) return;

    const { ciphertext, iv } = encryptMessage(text, activeChat.safetyNumber);

    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      chatId: activeChat.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text,
      timestamp: Date.now(),
      status: 'delivered',
      encrypted: true,
      ciphertext,
      iv,
      mediaUrl,
      mediaType,
      voiceDuration,
      replyTo,
      reactions: {},
    };

    setChats((prevChats) =>
      prevChats.map((c) => {
        if (c.id === activeChat.id) {
          return {
            ...c,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    // Realistic multi-contact simulated response
    triggerSimulatedResponse(activeChat.id, text);
  };

  const triggerSimulatedResponse = (chatId: string, userText: string) => {
    const replies = [
      "100% agreed! Encrypted and noted. ⚡",
      "That sounds awesome! Catching up via FunChat AI summary now.",
      "Got it! Let's sync on this during the diaspora meetup this weekend.",
      "Just verified your message safety fingerprint. Perfectly secure! 🔒",
      "Love this vibe! Dropping an invite link to the group members.",
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];

    // 1. Show typing indicator after 800ms
    setTimeout(() => {
      setChats((prev) =>
        prev.map((c) => {
          if (c.id === chatId) {
            const replier = c.type === 'community' ? 'Amara Kalu' : c.name;
            return { ...c, typingUser: replier };
          }
          return c;
        })
      );
    }, 800);

    // 2. Deliver message after 2200ms
    setTimeout(() => {
      const replierName = activeChat?.type === 'community' ? 'Amara Kalu' : activeChat?.name || 'Amara Kalu';
      const replierAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

      const replyMsg: Message = {
        id: `msg_resp_${Date.now()}`,
        chatId,
        senderId: 'user_amara',
        senderName: replierName,
        senderAvatar: replierAvatar,
        text: randomReply,
        timestamp: Date.now(),
        status: 'read',
        encrypted: true,
        ciphertext: btoa(randomReply) + '.ae391f',
        iv: '012f849a01b2c3d4e5f67890',
        reactions: {},
      };

      setChats((prev) =>
        prev.map((c) => {
          if (c.id === chatId) {
            return {
              ...c,
              typingUser: null,
              messages: [...c.messages, replyMsg],
            };
          }
          return c;
        })
      );

      playReceiveSound();
    }, 2400);
  };

  // Add emoji reaction
  const handleAddReaction = (messageId: string, emoji: string) => {
    if (!currentUser || !activeChat) return;

    setChats((prev) =>
      prev.map((c) => {
        if (c.id === activeChat.id) {
          const updatedMessages = c.messages.map((m) => {
            if (m.id === messageId) {
              const currentReactions = { ...(m.reactions || {}) };
              const currentUsers = currentReactions[emoji] || [];

              if (currentUsers.includes(currentUser.name)) {
                // remove
                currentReactions[emoji] = currentUsers.filter((u) => u !== currentUser.name);
                if (currentReactions[emoji].length === 0) {
                  delete currentReactions[emoji];
                }
              } else {
                // add
                currentReactions[emoji] = [...currentUsers, currentUser.name];
              }

              return { ...m, reactions: currentReactions };
            }
            return m;
          });
          return { ...c, messages: updatedMessages };
        }
        return c;
      })
    );
  };

  // Toggle disappearing messages
  const handleToggleDisappearing = (seconds: number | null) => {
    if (!activeChat) return;
    setChats((prev) =>
      prev.map((c) => (c.id === activeChat.id ? { ...c, disappearsIn: seconds } : c))
    );
  };

  // Join or open community group
  const handleJoinCommunity = (communityData: Partial<Chat>) => {
    if (!currentUser) return;
    const existing = chats.find((c) => c.id === communityData.id);

    if (existing) {
      setActiveChatId(existing.id);
    } else {
      const newChat: Chat = {
        id: communityData.id || `comm_${Date.now()}`,
        type: 'community',
        name: communityData.name || 'New Community',
        avatar: communityData.avatar || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150&auto=format&fit=crop&q=80',
        description: communityData.description,
        participants: [currentUser],
        messages: [
          {
            id: `msg_welcome_${Date.now()}`,
            chatId: communityData.id || `comm_${Date.now()}`,
            senderId: 'system',
            senderName: 'FunChat Security',
            senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            text: `Welcome to ${communityData.name}! All communications in this location group are end-to-end encrypted.`,
            timestamp: Date.now(),
            status: 'read',
            encrypted: true,
          },
        ],
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        safetyNumber: communityData.safetyNumber || '99120 74123 60912 34159 10823 48123 90123 48192 14298 90312 85610 23145',
        locationTag: communityData.locationTag,
        onlineCount: 15,
      };

      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
    }
  };

  // Add new status story
  const handleAddStory = (storyData: Partial<StatusStory>) => {
    const newStory: StatusStory = {
      id: `story_${Date.now()}`,
      userId: storyData.userId || currentUser?.id || 'me',
      userName: storyData.userName || currentUser?.name || 'Me',
      userAvatar: storyData.userAvatar || currentUser?.avatar || '',
      originCity: storyData.originCity || currentUser?.originCity,
      text: storyData.text || '',
      bgColor: storyData.bgColor,
      imageUrl: storyData.imageUrl,
      timestamp: Date.now(),
      viewsCount: 1,
    };
    setStories((prev) => [newStory, ...prev]);
  };

  // Reply to story directly into user's chat
  const handleReplyToStory = (userName: string, replyText: string) => {
    // Find or create direct chat
    let target = chats.find((c) => c.name.toLowerCase().includes(userName.toLowerCase()));
    if (target) {
      setActiveChatId(target.id);
      handleSendMessage(replyText);
    } else {
      handleSendMessage(`@${userName}: ${replyText}`);
    }
  };

  // Share AI summary text directly into active chat
  const handleShareSummaryToChat = (summaryText: string) => {
    handleSendMessage(summaryText);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Registration & 2FA Modal */}
      <RegistrationModal
        isOpen={isRegistrationOpen}
        onComplete={handleRegistrationComplete}
      />

      {currentUser && (
        <>
          {/* Main Layout: Left Sidebar + Right Chat View */}
          <div className="flex w-full h-full">
            {/* Sidebar (WhatsApp style) */}
            <Sidebar
              chats={chats}
              activeChatId={activeChatId}
              onSelectChat={(id) => {
                setActiveChatId(id);
                // clear unread
                setChats((prev) =>
                  prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
                );
              }}
              currentUser={currentUser}
              stories={stories}
              onOpenStories={() => setStatusStoriesModalOpen(true)}
              onOpenCommunityExplorer={() => setCommunityExplorerModalOpen(true)}
              onOpenSocialShare={() => setSocialShareModalOpen(true)}
              onOpenChangePhone={() => setChangePhoneModalOpen(true)}
              soundEnabled={soundActive}
              onToggleSound={handleToggleSound}
              onNewChat={() => setCommunityExplorerModalOpen(true)}
            />

            {/* Active Chat Main View */}
            <ChatView
              chat={activeChat}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
              onAddReaction={handleAddReaction}
              onOpenSafetyNumber={() => setSafetyNumberModalOpen(true)}
              onOpenAISummary={() => setAiSummaryModalOpen(true)}
              onOpenSocialShare={() => setSocialShareModalOpen(true)}
              onInspectPacket={(msg) => setInspectingMessage(msg)}
              onToggleDisappearing={handleToggleDisappearing}
            />
          </div>

          {/* E2EE Safety Number Verification Modal */}
          <SafetyNumberModal
            chat={activeChat}
            currentUser={currentUser}
            isOpen={safetyNumberModalOpen}
            onClose={() => setSafetyNumberModalOpen(false)}
          />

          {/* AI-Driven Conversation Summaries (Gemini 3.8 Flash) Modal */}
          <AISummaryModal
            chat={activeChat}
            isOpen={aiSummaryModalOpen}
            onClose={() => setAiSummaryModalOpen(false)}
            onShareToChat={handleShareSummaryToChat}
          />

          {/* Raw Cryptographic Packet Inspector */}
          <EncryptedPacketModal
            message={inspectingMessage}
            isOpen={!!inspectingMessage}
            onClose={() => setInspectingMessage(null)}
          />

          {/* FunDrop Social Invite Modal */}
          <SocialShareModal
            chat={activeChat}
            currentUser={currentUser}
            isOpen={socialShareModalOpen}
            onClose={() => setSocialShareModalOpen(false)}
          />

          {/* 24-Hour Status Stories Modal */}
          <StatusStoriesModal
            stories={stories}
            currentUser={currentUser}
            isOpen={statusStoriesModalOpen}
            onClose={() => setStatusStoriesModalOpen(false)}
            onAddStory={handleAddStory}
            onReplyToStory={handleReplyToStory}
          />

          {/* Location-Based Communities Directory Modal */}
          <CommunityExplorerModal
            currentUser={currentUser}
            isOpen={communityExplorerModalOpen}
            onClose={() => setCommunityExplorerModalOpen(false)}
            onJoinCommunity={handleJoinCommunity}
            existingChatIds={chats.map((c) => c.id)}
          />

          {/* Change Phone Number (Web SMS Server 2FA) Modal */}
          <ChangePhoneModal
            currentUser={currentUser}
            isOpen={changePhoneModalOpen}
            onClose={() => setChangePhoneModalOpen(false)}
            onPhoneUpdated={handlePhoneUpdated}
          />
        </>
      )}
    </div>
  );
}
