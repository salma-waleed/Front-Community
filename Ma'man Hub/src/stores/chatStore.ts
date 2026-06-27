// src/stores/chatStore.ts  — REPLACE your existing chatStore.ts with this
// ─────────────────────────────────────────────────────────────────────────────

import { create } from "zustand";
import {
  chatApi,
  type ChatMessageDto,
  type ConversationDto,
  type GroupDto,
  type GroupMemberDto,
} from "@/services/chatService";
import { chatSignalR } from "@/services/chatSignalR";

// ── State shape ────────────────────────────────────────────────────────────────

interface ChatState {
  // Lists
  conversations: ConversationDto[];
  groups: GroupDto[];

  // Active context
  activeType: "dm" | "group" | null;
  activeId: string | null;

  // Messages per context
  messages: Record<string, ChatMessageDto[]>;
  hasMore: Record<string, boolean>;
  cursors: Record<string, string | undefined>;

  // Group members cache
  groupMembers: Record<string, GroupMemberDto[]>;

  // Typing indicators
  typingUsers: Record<string, Set<string>>;

  // Online presence
  onlineUsers: Set<string>;

  // UI state
  isLoadingConvs: boolean;
  isLoadingMsgs: boolean;
  signalRConnected: boolean;

  // Actions
  loadConversations: () => Promise<void>;
  loadGroups: () => Promise<void>;
  setActive: (type: "dm" | "group", id: string) => Promise<void>;
  loadMoreMessages: (contextId: string, type: "dm" | "group") => Promise<void>;
  sendMessage: (
    content: string,
    opts?: {
      replyToMessageId?: string;
      type?: "image" | "file";
      fileUrl?: string;
      fileName?: string;
    }
  ) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  connectSignalR: (token: string) => Promise<void>;
  disconnectSignalR: () => Promise<void>;
  loadGroupMembers: (groupId: string) => Promise<void>;

  // New
  updateGroupSettings: (groupId: string, patch: Partial<GroupDto>) => void;
  removeGroupLocal: (groupId: string) => Promise<void>;
  addGroupLocal: (group: GroupDto) => void;
}

// ── Store ──────────────────────────────────────────────────────────────────────

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  groups: [],
  activeType: null,
  activeId: null,
  messages: {},
  hasMore: {},
  cursors: {},
  groupMembers: {},
  typingUsers: {},
  onlineUsers: new Set(),
  isLoadingConvs: false,
  isLoadingMsgs: false,
  signalRConnected: false,

  // ── Data loading ─────────────────────────────────────────────────────────────

  loadConversations: async () => {
    set({ isLoadingConvs: true });
    try {
      const convs = await chatApi.getConversations();
      set({ conversations: convs });
    } finally {
      set({ isLoadingConvs: false });
    }
  },

  loadGroups: async () => {
    const groups = await chatApi.getGroups();
    set({ groups });
  },

  setActive: async (type, id) => {
    set({ activeType: type, activeId: id, isLoadingMsgs: true });
    try {
      const result =
        type === "dm"
          ? await chatApi.getDmMessages(id)
          : await chatApi.getGroupMessages(id);

      set((s) => ({
        messages: { ...s.messages, [id]: result.items },
        hasMore: { ...s.hasMore, [id]: result.hasMore },
        cursors: { ...s.cursors, [id]: result.nextCursor },
      }));

      if (type === "dm") {
        await chatSignalR.markConversationRead(id);
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, unreadCount: 0 } : c
          ),
        }));
      } else {
        await chatSignalR.joinGroup(id);
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === id ? { ...g, unreadCount: 0 } : g
          ),
        }));
      }
    } finally {
      set({ isLoadingMsgs: false });
    }
  },

  loadMoreMessages: async (contextId, type) => {
    const { cursors, hasMore } = get();
    if (!hasMore[contextId]) return;

    const result =
      type === "dm"
        ? await chatApi.getDmMessages(contextId, cursors[contextId])
        : await chatApi.getGroupMessages(contextId, cursors[contextId]);

    set((s) => ({
      messages: {
        ...s.messages,
        [contextId]: [...result.items, ...(s.messages[contextId] ?? [])],
      },
      hasMore: { ...s.hasMore, [contextId]: result.hasMore },
      cursors: { ...s.cursors, [contextId]: result.nextCursor },
    }));
  },

  // ── Sending ───────────────────────────────────────────────────────────────────

  sendMessage: async (content, opts) => {
    const { activeType, activeId } = get();
    if (!activeType || !activeId) return;
    if (!content.trim() && !opts?.fileUrl) return;

    const req = {
      content,
      replyToMessageId: opts?.replyToMessageId,
      type: opts?.type ?? "text",
      fileUrl: opts?.fileUrl,
      fileName: opts?.fileName,
    };

    const msg =
      activeType === "dm"
        ? await chatApi.sendDmMessage(activeId, req)
        : await chatApi.sendGroupMessage(activeId, req);

    set((s) => {
      const existing = s.messages[activeId] ?? [];
      if (existing.some((m) => m.id === msg.id)) return {};
      return { messages: { ...s.messages, [activeId]: [...existing, msg] } };
    });
  },

  editMessage: async (messageId, newContent) => {
    const updated = await chatApi.editMessage(messageId, newContent);
    set((s) => ({
      messages: Object.fromEntries(
        Object.entries(s.messages).map(([ctxId, msgs]) => [
          ctxId,
          msgs.map((m) => (m.id === messageId ? updated : m)),
        ])
      ),
    }));
  },

  deleteMessage: async (messageId) => {
    await chatApi.deleteMessage(messageId);
    set((s) => ({
      messages: Object.fromEntries(
        Object.entries(s.messages).map(([ctxId, msgs]) => [
          ctxId,
          msgs.map((m) =>
            m.id === messageId
              ? { ...m, isDeleted: true, content: "This message was deleted" }
              : m
          ),
        ])
      ),
    }));
  },

  toggleReaction: async (messageId, emoji) => {
    const reactions = await chatApi.toggleReaction(messageId, emoji);
    set((s) => ({
      messages: Object.fromEntries(
        Object.entries(s.messages).map(([ctxId, msgs]) => [
          ctxId,
          msgs.map((m) => (m.id === messageId ? { ...m, reactions } : m)),
        ])
      ),
    }));
  },

  loadGroupMembers: async (groupId) => {
    const members = await chatApi.getGroupMembers(groupId);
    set((s) => ({ groupMembers: { ...s.groupMembers, [groupId]: members } }));
  },

  // ── Settings / membership local sync ─────────────────────────────────────────

  updateGroupSettings: (groupId, patch) => {
    set((s) => ({
      groups: s.groups.map((g) => (g.id === groupId ? { ...g, ...patch } : g)),
    }));
  },

  removeGroupLocal: async (groupId) => {
    try {
      await chatSignalR.leaveGroup(groupId);
    } catch {
      // best-effort — local cleanup still proceeds
    }
    set((s) => {
      const { [groupId]: _removed, ...restMessages } = s.messages;
      const { [groupId]: _removedMembers, ...restMembers } = s.groupMembers;
      return {
        groups: s.groups.filter((g) => g.id !== groupId),
        messages: restMessages,
        groupMembers: restMembers,
        activeId: s.activeId === groupId ? null : s.activeId,
        activeType: s.activeId === groupId ? null : s.activeType,
      };
    });
  },

  addGroupLocal: (group) => {
    set((s) => ({
      groups: s.groups.some((g) => g.id === group.id)
        ? s.groups
        : [group, ...s.groups],
    }));
  },

  // ── SignalR ───────────────────────────────────────────────────────────────────

  connectSignalR: async (token) => {
    await chatSignalR.connect(token);
    set({ signalRConnected: true });

    chatSignalR.on("NewMessage", (raw) => {
      const msg = raw as ChatMessageDto;
      set((s) => {
        const existing = s.messages[msg.contextId] ?? [];
        if (existing.some((m) => m.id === msg.id)) return {};

        const convUpdate = s.conversations.map((c) =>
          c.id === msg.contextId
            ? {
                ...c,
                lastMessage: msg.content,
                lastMessageAt: msg.timestamp,
                unreadCount:
                  s.activeId === msg.contextId ? 0 : c.unreadCount + 1,
              }
            : c
        );
        const groupUpdate = s.groups.map((g) =>
          g.id === msg.contextId
            ? {
                ...g,
                lastMessage: msg.content,
                lastMessageAt: msg.timestamp,
                unreadCount:
                  s.activeId === msg.contextId ? 0 : g.unreadCount + 1,
              }
            : g
        );

        return {
          messages: { ...s.messages, [msg.contextId]: [...existing, msg] },
          conversations: convUpdate,
          groups: groupUpdate,
        };
      });
    });

    chatSignalR.on("MessageEdited", (raw) => {
      const msg = raw as ChatMessageDto;
      set((s) => ({
        messages: Object.fromEntries(
          Object.entries(s.messages).map(([ctx, msgs]) => [
            ctx,
            msgs.map((m) => (m.id === msg.id ? msg : m)),
          ])
        ),
      }));
    });

    chatSignalR.on("MessageDeleted", (raw) => {
      const { messageId } = raw as { messageId: string };
      set((s) => ({
        messages: Object.fromEntries(
          Object.entries(s.messages).map(([ctx, msgs]) => [
            ctx,
            msgs.map((m) =>
              m.id === messageId
                ? { ...m, isDeleted: true, content: "This message was deleted" }
                : m
            ),
          ])
        ),
      }));
    });

    chatSignalR.on("ReactionsUpdated", (raw) => {
      const { messageId, reactions } = raw as {
        messageId: string;
        reactions: ChatMessageDto["reactions"];
      };
      set((s) => ({
        messages: Object.fromEntries(
          Object.entries(s.messages).map(([ctx, msgs]) => [
            ctx,
            msgs.map((m) => (m.id === messageId ? { ...m, reactions } : m)),
          ])
        ),
      }));
    });

    chatSignalR.on("TypingIndicator", (raw) => {
      const { conversationId, userId, isTyping } = raw as {
        conversationId: string;
        userId: string;
        isTyping: boolean;
      };
      set((s) => {
        const current = new Set(s.typingUsers[conversationId] ?? []);
        isTyping ? current.add(userId) : current.delete(userId);
        return { typingUsers: { ...s.typingUsers, [conversationId]: current } };
      });
    });

    chatSignalR.on("GroupTyping", (raw) => {
      const { groupId, userId, isTyping } = raw as {
        groupId: string;
        userId: string;
        isTyping: boolean;
      };
      set((s) => {
        const current = new Set(s.typingUsers[groupId] ?? []);
        isTyping ? current.add(userId) : current.delete(userId);
        return { typingUsers: { ...s.typingUsers, [groupId]: current } };
      });
    });

    chatSignalR.on("UserOnline", (raw) => {
      const userId = raw as string;
      set((s) => {
        const next = new Set(s.onlineUsers);
        next.add(userId);
        return {
          onlineUsers: next,
          conversations: s.conversations.map((c) =>
            c.participantId === userId ? { ...c, isOnline: true } : c
          ),
        };
      });
    });

    chatSignalR.on("UserOffline", (raw) => {
      const userId = raw as string;
      set((s) => {
        const next = new Set(s.onlineUsers);
        next.delete(userId);
        return {
          onlineUsers: next,
          conversations: s.conversations.map((c) =>
            c.participantId === userId ? { ...c, isOnline: false } : c
          ),
        };
      });
    });

    chatSignalR.on("AddedToGroup", (raw) => {
      const group = raw as GroupDto;
      set((s) => ({
        groups: s.groups.some((g) => g.id === group.id)
          ? s.groups
          : [group, ...s.groups],
      }));
    });

    chatSignalR.on("RemovedFromGroup", (raw) => {
      const { groupId } = raw as { groupId: string };
      set((s) => ({ groups: s.groups.filter((g) => g.id !== groupId) }));
    });

    chatSignalR.on("MessagesRead", (raw) => {
      const { conversationId, readBy } = raw as {
        conversationId: string;
        readBy: string;
      };
      set((s) => ({
        messages: {
          ...s.messages,
          [conversationId]: (s.messages[conversationId] ?? []).map((m) =>
            !m.readBy.includes(readBy)
              ? { ...m, readBy: [...m.readBy, readBy] }
              : m
          ),
        },
      }));
    });

    // ── New events ────────────────────────────────────────────────────────────

    chatSignalR.on("GroupSettingsUpdated", (raw) => {
      const { groupId, name, description, avatarUrl } = raw as {
        groupId: string;
        name: string;
        description?: string;
        avatarUrl?: string;
      };
      set((s) => ({
        groups: s.groups.map((g) =>
          g.id === groupId ? { ...g, name, description, avatarUrl } : g
        ),
      }));
    });

    chatSignalR.on("GroupDeleted", (raw) => {
      const { groupId } = raw as { groupId: string };
      chatSignalR.leaveGroup(groupId).catch(() => {});
      set((s) => {
        const { [groupId]: _removed, ...restMessages } = s.messages;
        const { [groupId]: _removedMembers, ...restMembers } = s.groupMembers;
        return {
          groups: s.groups.filter((g) => g.id !== groupId),
          messages: restMessages,
          groupMembers: restMembers,
          activeId: s.activeId === groupId ? null : s.activeId,
          activeType: s.activeId === groupId ? null : s.activeType,
        };
      });
    });

    chatSignalR.on("MemberJoined", (raw) => {
      const member = raw as GroupMemberDto & { groupId?: string };
      if (!member.groupId) return;
      set((s) => {
        const existing = s.groupMembers[member.groupId!] ?? [];
        if (existing.some((m) => m.userId === member.userId)) return {};
        return {
          groupMembers: {
            ...s.groupMembers,
            [member.groupId!]: [...existing, member],
          },
          groups: s.groups.map((g) =>
            g.id === member.groupId
              ? { ...g, membersCount: g.membersCount + 1 }
              : g
          ),
        };
      });
    });

    chatSignalR.on("MemberRoleChanged", (raw) => {
      const { groupId, userId, role } = raw as {
        groupId: string;
        userId: string;
        role: string;
      };
      set((s) => ({
        groupMembers: {
          ...s.groupMembers,
          [groupId]: (s.groupMembers[groupId] ?? []).map((m) =>
            m.userId === userId
              ? { ...m, role: role as GroupMemberDto["role"] }
              : m
          ),
        },
      }));
    });

    chatSignalR.on("MemberRemoved", (raw) => {
      const { groupId, userId } = raw as { groupId: string; userId: string };
      set((s) => ({
        groupMembers: {
          ...s.groupMembers,
          [groupId]: (s.groupMembers[groupId] ?? []).filter(
            (m) => m.userId !== userId
          ),
        },
        groups: s.groups.map((g) =>
          g.id === groupId
            ? { ...g, membersCount: Math.max(0, g.membersCount - 1) }
            : g
        ),
      }));
    });
  },

  disconnectSignalR: async () => {
    await chatSignalR.disconnect();
    set({ signalRConnected: false });
  },
}));