import { create } from 'zustand';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  reactions?: { emoji: string; userId: string }[];
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isTyping: boolean;
}

export interface GroupChat {
  id: string;
  name: string;
  avatar?: string;
  membersCount: number;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

interface ChatState {
  conversations: Conversation[];
  groupChats: GroupChat[];
  activeConversation: string | null;
  messages: Record<string, Message[]>;
  isConnected: boolean;
  typingUsers: Record<string, string[]>;
  setConversations: (conversations: Conversation[]) => void;
  setGroupChats: (chats: GroupChat[]) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  setConnected: (connected: boolean) => void;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  markAsRead: (conversationId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  groupChats: [],
  activeConversation: null,
  messages: {},
  isConnected: false,
  typingUsers: {},
  setConversations: (conversations) => set({ conversations }),
  setGroupChats: (groupChats) => set({ groupChats }),
  setActiveConversation: (activeConversation) => set({ activeConversation }),
  addMessage: (conversationId, message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message],
      },
    }));
  },
  setMessages: (conversationId, messages) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    }));
  },
  setConnected: (isConnected) => set({ isConnected }),
  setTyping: (conversationId, userId, isTyping) => {
    set((state) => {
      const current = state.typingUsers[conversationId] || [];
      const updated = isTyping
        ? [...new Set([...current, userId])]
        : current.filter((id) => id !== userId);
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: updated,
        },
      };
    });
  },
  markAsRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    }));
  },
}));
