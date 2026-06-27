// src/pages/GroupChatPage.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Group Chat — real SignalR + REST, emoji picker, file attach, member panel,
// inline edit (no modal), group settings, invite links, add-by-email
// ─────────────────────────────────────────────────────────────────────────────

import {
  useState, useEffect, useRef, useCallback,
  type KeyboardEvent, type ChangeEvent,
} from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Search, MoreVertical, Users, X, Edit2, Trash2,
  Reply, CornerDownRight, ChevronDown, Loader2, Hash,
  Smile, Paperclip, Image as ImageIcon, File as FileIcon,
  Plus, AtSign, Shield, Crown, UserMinus, Settings, Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { chatSignalR } from "@/services/chatSignalR";
import { chatApi } from "@/services/chatService";
import type { ChatMessageDto, GroupMemberDto } from "@/services/chatService";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { EditPreview } from "@/components/chat/EditPreview";
import { GroupSettingsModal } from "@/components/chat/GroupSettingsModal";
import { InviteAndAddMembersModal } from "@/components/chat/InviteAndAddMembersModal";

// ── Emoji data ─────────────────────────────────────────────────────────────────

const EMOJI_GROUPS = [
  { label: "Reactions", emojis: ["👍","❤️","😂","😮","😢","🙏","🔥","🎉","✅","💯","😍","🤔"] },
  { label: "Smileys",   emojis: ["😀","😃","😄","😁","😆","😅","🤣","😊","😇","🙂","😉","😋","😛","😝","😜","🤪","😎","🤓","🧐","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭"] },
  { label: "Gestures",  emojis: ["👋","🤚","🖐","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🙏","🤝","💪"] },
  { label: "Objects",   emojis: ["💬","📩","📧","📝","📌","📎","🔗","💡","🔔","🎵","🎶","🎤","🎧","🎯","🏆","🥇","🎁","🎊","🎈","🌟","⭐","✨","💫","🔑","🔒","🔓","📱","💻","🖥️","⌨️","🖱️"] },
];

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

// ── Helpers ────────────────────────────────────────────────────────────────────

function initials(name: string) {
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`
    : name.slice(0, 2);
}

function fmtTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(ts: string) {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function roleIcon(role: string) {
  if (role === "owner") return <Crown className="h-3 w-3 text-yellow-500" />;
  if (role === "admin") return <Shield className="h-3 w-3 text-blue-500" />;
  return null;
}

// ── Emoji Picker ───────────────────────────────────────────────────────────────

function EmojiPicker({ onSelect, onClose }: { onSelect: (e: string) => void; onClose: () => void }) {
  const [activeGroup, setActiveGroup] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-full mb-2 right-0 w-72 bg-popover border rounded-2xl shadow-xl overflow-hidden z-50"
    >
      <div className="flex border-b">
        {EMOJI_GROUPS.map((g, i) => (
          <button
            key={g.label}
            onClick={() => setActiveGroup(i)}
            className={cn(
              "flex-1 py-2 text-[11px] font-medium transition-colors",
              activeGroup === i
                ? "bg-accent/10 text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            )}
          >{g.label}</button>
        ))}
      </div>
      <div className="p-2 grid grid-cols-8 gap-0.5 max-h-48 overflow-y-auto">
        {EMOJI_GROUPS[activeGroup].emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => { onSelect(emoji); onClose(); }}
            className="p-1.5 text-lg hover:bg-muted rounded-lg transition-colors hover:scale-110"
          >{emoji}</button>
        ))}
      </div>
    </motion.div>
  );
}

// ── Attached file preview (input area) ────────────────────────────────────────

interface AttachedFile { file: File; preview?: string; type: "image" | "file"; }

function FilePreview({
  attached,
  onRemove,
  uploading,
}: {
  attached: AttachedFile;
  onRemove: () => void;
  uploading?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center gap-2 px-4 py-2 border-t bg-muted/30"
    >
      {attached.type === "image" && attached.preview ? (
        <img src={attached.preview} alt="" className="h-12 w-12 rounded-lg object-cover border" />
      ) : (
        <div className="h-12 w-12 rounded-lg bg-muted border flex items-center justify-center">
          <FileIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attached.file.name}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {uploading && <Loader2 className="h-3 w-3 animate-spin" />}
          {uploading ? "Uploading…" : `${(attached.file.size / 1024).toFixed(1)} KB`}
        </p>
      </div>
      <button
        onClick={onRemove}
        disabled={uploading}
        className="p-1 hover:bg-muted rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

// ── Reply preview ──────────────────────────────────────────────────────────────

function ReplyPreview({ reply, onCancel }: { reply: ChatMessageDto; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="flex items-center gap-2 px-4 py-2 border-t bg-muted/30 text-sm overflow-hidden"
    >
      <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-accent">{reply.senderName}</span>
        <span className="text-muted-foreground ml-2 truncate">
          {reply.isDeleted ? "Deleted message" : reply.content}
        </span>
      </div>
      <button onClick={onCancel} className="p-1 hover:bg-muted rounded-full shrink-0">
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────────

function MessageBubble({
  msg, isMe, showAvatar, myId, onReply, onEdit, onDelete, onReact,
}: {
  msg: ChatMessageDto; isMe: boolean; showAvatar: boolean; myId: string;
  onReply: (m: ChatMessageDto) => void; onEdit: (m: ChatMessageDto) => void;
  onDelete: (id: string) => void; onReact: (id: string, emoji: string) => void;
}) {
  const grouped = msg.reactions.reduce<Record<string, string[]>>((acc, r) => {
    acc[r.emoji] = [...(acc[r.emoji] ?? []), r.userId];
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("group flex gap-2.5 items-end", isMe && "flex-row-reverse")}
    >
      <div className="w-8 shrink-0 flex items-end">
        {showAvatar && !isMe && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={msg.senderAvatar} />
            <AvatarFallback className="text-xs">{initials(msg.senderName)}</AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className={cn("max-w-[65%] min-w-0", isMe && "items-end flex flex-col")}>
        {showAvatar && !isMe && (
          <p className="text-[11px] font-semibold text-muted-foreground mb-0.5 ml-0.5">
            {msg.senderName}
          </p>
        )}

        {msg.replyTo && (
          <div className={cn(
            "flex items-start gap-1.5 mb-1 px-3 py-1.5 rounded-xl text-xs border-l-2 border-accent/60 bg-muted/50",
            isMe && "self-end"
          )}>
            <CornerDownRight className="h-3 w-3 text-accent/70 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-semibold text-accent/80">{msg.replyTo.senderName}</span>
              <p className="text-muted-foreground truncate">{msg.replyTo.content}</p>
            </div>
          </div>
        )}

        {msg.type === "image" && msg.fileUrl && (
          <img
            src={msg.fileUrl}
            alt={msg.fileName ?? "image"}
            className={cn("max-w-[200px] rounded-2xl mb-1 border", isMe ? "rounded-br-sm" : "rounded-bl-sm")}
          />
        )}
        {msg.type === "file" && msg.fileUrl && (
          <a
            href={msg.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-2xl mb-1 text-sm border bg-muted hover:bg-muted/70 transition-colors",
              isMe ? "rounded-br-sm" : "rounded-bl-sm"
            )}
          >
            <FileIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{msg.fileName ?? "File"}</span>
          </a>
        )}

        {msg.content && (
          <div className="relative">
            <div className={cn(
              "relative px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words",
              isMe ? "bg-accent text-accent-foreground rounded-br-sm" : "bg-muted rounded-bl-sm",
              msg.isDeleted && "opacity-50 italic"
            )}>
              {msg.content}
              {msg.isEdited && !msg.isDeleted && (
                <span className="ml-1.5 text-[10px] opacity-60">(edited)</span>
              )}
              <p className={cn(
                "text-[10px] opacity-60 mt-0.5",
                isMe ? "text-right" : "text-left"
              )}>{fmtTime(msg.timestamp)}</p>

              {!msg.isDeleted && (
                <div className={cn(
                  "absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity z-10",
                  "flex items-center gap-0.5 bg-background border rounded-full shadow-lg px-1.5 py-1",
                  isMe ? "right-0" : "left-0"
                )}>
                  {QUICK_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => onReact(msg.id, e)}
                      className="p-0.5 hover:scale-125 transition-transform text-base"
                    >{e}</button>
                  ))}
                  <div className="w-px h-4 bg-border mx-0.5" />
                  <button onClick={() => onReply(msg)} className="p-1 hover:bg-muted rounded-full" title="Reply">
                    <Reply className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  {isMe && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-muted rounded-full">
                          <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(msg)}>
                          <Edit2 className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(msg.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {Object.keys(grouped).length > 0 && (
          <div className={cn("flex flex-wrap gap-1 mt-1", isMe && "justify-end")}>
            {Object.entries(grouped).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => onReact(msg.id, emoji)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors",
                  users.includes(myId)
                    ? "bg-accent/20 border-accent/40 text-accent"
                    : "bg-muted border-border hover:bg-muted/70"
                )}
              >
                {emoji} <span>{users.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Typing indicator (group) ────────────────────────────────────────────────────

function GroupTypingBubble({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  const label = names.length === 1
    ? `${names[0]} is typing`
    : names.length === 2
    ? `${names[0]} and ${names[1]} are typing`
    : `${names[0]} and ${names.length - 1} others are typing`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 pl-10"
    >
      <div className="flex gap-1 bg-muted rounded-2xl px-3 py-2.5">
        {[0,1,2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </motion.div>
  );
}

// ── Create group modal ─────────────────────────────────────────────────────────

function CreateGroupModal({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const { loadGroups } = useChatStore();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await chatApi.createGroup({ name: name.trim(), description: desc.trim() || undefined, memberIds: [] });
      await loadGroups();
      onCreated();
      onClose();
      setName(""); setDesc("");
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Create group</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Name *</label>
            <Input placeholder="e.g. React Study Group" value={name}
              onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
            <Input placeholder="What's this group about?" value={desc}
              onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!name.trim() || loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create group
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Group sidebar item ─────────────────────────────────────────────────────────

function GroupItem({ name, sub, time, unread, active, membersCount, myRole, onClick }: {
  name: string; sub: string; time?: string; unread: number;
  active: boolean; membersCount: number; myRole: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-3 py-3 flex items-start gap-3 rounded-xl transition-all text-left",
        active ? "bg-accent/10 shadow-sm" : "hover:bg-muted/50"
      )}
    >
      <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
        {initials(name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-1">
          <p className={cn("text-sm truncate", active ? "font-semibold" : "font-medium")}>{name}</p>
          {time && <span className="text-[10px] text-muted-foreground shrink-0">{time}</span>}
        </div>
        <p className={cn(
          "text-xs truncate mt-0.5",
          unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"
        )}>{sub || "No messages yet"}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          <Users className="h-2.5 w-2.5 inline mr-0.5" />
          {membersCount} members · {myRole}
        </p>
      </div>
      {unread > 0 && (
        <span className="shrink-0 min-w-5 h-5 flex items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold px-1">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </button>
  );
}

// ── DateSeparator ──────────────────────────────────────────────────────────────

function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[11px] text-muted-foreground font-medium px-2 py-0.5 bg-muted rounded-full">{date}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function GroupChatPage() {
  const { user, token } = useAuthStore();
  const { toast } = useToast();
  const {
    groups, activeId, activeType,
    messages, hasMore, typingUsers,
    isLoadingConvs, isLoadingMsgs,
    loadGroups, setActive, loadMoreMessages,
    sendMessage, editMessage, deleteMessage,
    toggleReaction, connectSignalR,
    loadGroupMembers, groupMembers,
    removeGroupLocal,
  } = useChatStore();

  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessageDto | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessageDto | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [attached, setAttached] = useState<AttachedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const fileRef     = useRef<HTMLInputElement>(null);
  const imgRef      = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const myId = user?.id ?? "";

  useEffect(() => {
    if (token) { connectSignalR(token); loadGroups(); }
  }, [token]);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 150)
      el.scrollTop = el.scrollHeight;
  }, [messages, activeId]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
    if (el.scrollTop < 80 && activeId && hasMore[activeId]) {
      const prev = el.scrollHeight;
      loadMoreMessages(activeId, "group").then(() => {
        requestAnimationFrame(() => {
          if (scrollRef.current)
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight - prev;
        });
      });
    }
  }, [activeId, hasMore]);

  const handleInputChange = (val: string) => {
    setInput(val);

    if (!editingMsg) {
      const lastAt = val.lastIndexOf("@");
      if (lastAt !== -1 && !val.slice(lastAt).includes(" "))
        setMentionQuery(val.slice(lastAt + 1));
      else setMentionQuery(null);

      if (!typingTimer.current && activeId) chatSignalR.sendGroupTyping(activeId, true);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        if (activeId) chatSignalR.sendGroupTyping(activeId, false);
        typingTimer.current = null;
      }, 2500);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAttached({
      file,
      preview: type === "image" ? (reader.result as string) : undefined,
      type,
    });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const insertMention = (name: string) => {
    const lastAt = input.lastIndexOf("@");
    setInput(input.slice(0, lastAt) + `@${name} `);
    setMentionQuery(null);
    inputRef.current?.focus();
  };

  // ── Inline edit handlers ─────────────────────────────────────────────────────

  const startEdit = (msg: ChatMessageDto) => {
    setEditingMsg(msg);
    setReplyTo(null);
    setAttached(null);
    setMentionQuery(null);
    setInput(msg.content);
    inputRef.current?.focus();
  };

  const cancelEdit = () => {
    setEditingMsg(null);
    setInput("");
  };

  const handleSend = async () => {
    if ((!input.trim() && !attached) || isUploading) return;

    if (editingMsg) {
      const trimmed = input.trim();
      if (trimmed && trimmed !== editingMsg.content) {
        await editMessage(editingMsg.id, trimmed);
      }
      setEditingMsg(null);
      setInput("");
      setShowEmoji(false);
      inputRef.current?.focus();
      return;
    }

    try {
      let fileMeta: { type: "image" | "file"; fileUrl: string; fileName: string } | undefined;

      if (attached) {
        setIsUploading(true);
        const uploaded = await chatApi.uploadChatFile(attached.file);
        fileMeta = {
          type: attached.type,
          fileUrl: uploaded.url,
          fileName: uploaded.fileName ?? attached.file.name,
        };
      }

      await sendMessage(input.trim(), { replyToMessageId: replyTo?.id, ...fileMeta });

      setInput("");
      setReplyTo(null);
      setAttached(null);
      setShowEmoji(false);
      if (typingTimer.current) { clearTimeout(typingTimer.current); typingTimer.current = null; }
      if (activeId) chatSignalR.sendGroupTyping(activeId, false);
      inputRef.current?.focus();
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (e.key === "Escape" && editingMsg) cancelEdit();
  };

  const handleDeleteGroup = async () => {
    if (!activeGroup) return;
    if (!confirm(`Delete "${activeGroup.name}" permanently? This cannot be undone.`)) return;
    try {
      await chatApi.deleteGroup(activeGroup.id);
      await removeGroupLocal(activeGroup.id);
      toast({ title: "Group deleted" });
    } catch {
      toast({ title: "Couldn't delete group", variant: "destructive" });
    }
  };

  const activeGroup = groups.find((g) => g.id === activeId && activeType === "group");
  const activeMessages = (activeId ? messages[activeId] : undefined) ?? [];
  const members: GroupMemberDto[] = activeId ? (groupMembers[activeId] ?? []) : [];
  const myMember = members.find((m) => m.userId === myId);
  const myRole = myMember?.role ?? activeGroup?.myRole ?? "member";
  const isOwner = myRole === "owner";
  const canModerate = myRole === "owner" || myRole === "admin";

  const typingSet = activeId ? (typingUsers[activeId] ?? new Set<string>()) : new Set<string>();
  const typingNames = Array.from(typingSet)
    .map((uid) => members.find((m) => m.userId === uid)?.userName ?? "Someone")
    .filter(Boolean);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMentions: GroupMemberDto[] =
    mentionQuery !== null
      ? members.filter(
          (m) => m.userId !== myId &&
            m.userName.toLowerCase().includes(mentionQuery.toLowerCase())
        )
      : [];

  function buildRows(msgs: ChatMessageDto[]) {
    const rows: (ChatMessageDto | { separator: string; key: string })[] = [];
    let lastDate = "";
    for (const msg of msgs) {
      const d = fmtDate(msg.timestamp);
      if (d !== lastDate) { rows.push({ separator: d, key: `sep-${d}-${msg.id}` }); lastDate = d; }
      rows.push(msg);
    }
    return rows;
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] rounded-2xl border overflow-hidden bg-background shadow-sm">

        {/* ── SIDEBAR ───────────────────────────────────────────────────────── */}
        <aside className="w-72 flex flex-col border-r bg-muted/20">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base">Group Chats</h2>
              <Button
                variant="ghost" size="icon" className="h-8 w-8"
                onClick={() => setShowCreateGroup(true)}
                title="Create group"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search groups…"
                className="pl-9 h-8 text-sm bg-background"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {isLoadingConvs ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-10">
                <Hash className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">No groups yet</p>
                <Button variant="outline" size="sm" onClick={() => setShowCreateGroup(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Create one
                </Button>
              </div>
            ) : (
              filteredGroups.map((g) => (
                <GroupItem
                  key={g.id}
                  name={g.name}
                  sub={g.lastMessage}
                  time={g.lastMessageAt ? fmtDate(g.lastMessageAt) : undefined}
                  unread={g.unreadCount}
                  active={activeId === g.id && activeType === "group"}
                  membersCount={g.membersCount}
                  myRole={g.myRole}
                  onClick={() => {
                    setActive("group", g.id);
                    loadGroupMembers(g.id);
                    setShowMembers(false);
                    cancelEdit();
                    setReplyTo(null);
                  }}
                />
              ))
            )}
          </div>
        </aside>

        {/* ── CHAT ──────────────────────────────────────────────────────────── */}
        {!activeGroup ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="p-6 bg-muted/30 rounded-full">
              <Hash className="h-10 w-10 opacity-30" />
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">No group selected</p>
              <p className="text-xs mt-1 opacity-70">Pick a group or create one</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowCreateGroup(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Create group
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0">

              {/* Header */}
              <div className="px-4 py-3 border-b flex items-center justify-between gap-3 bg-background">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                    {initials(activeGroup.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{activeGroup.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {activeGroup.membersCount} members
                      {typingNames.length > 0 && (
                        <span className="text-accent ml-1">
                          · {typingNames[0]}{typingNames.length > 1 ? ` +${typingNames.length - 1}` : ""} typing…
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant={showMembers ? "secondary" : "ghost"}
                    size="icon" className="h-8 w-8"
                    onClick={() => setShowMembers((v) => !v)}
                    title="Toggle members"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canModerate && (
                        <>
                          <DropdownMenuItem onClick={() => setShowAddMembers(true)}>
                            <Plus className="h-4 w-4 mr-2" /> Add members
                          </DropdownMenuItem>
                          {isOwner && (
                            <DropdownMenuItem onClick={() => setShowSettings(true)}>
                              <Settings className="h-4 w-4 mr-2" /> Group settings
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {isOwner ? (
                        <DropdownMenuItem className="text-destructive" onClick={handleDeleteGroup}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete group
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="text-destructive">
                          Leave group
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5 relative"
              >
                {isLoadingMsgs ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    {hasMore[activeId!] && (
                      <div className="text-center mb-3">
                        <button
                          onClick={() => loadMoreMessages(activeId!, "group")}
                          className="text-xs text-muted-foreground hover:text-foreground underline"
                        >Load earlier messages</button>
                      </div>
                    )}

                    {buildRows(activeMessages).map((row) => {
                      if ("separator" in row)
                        return <DateSeparator key={row.key} date={row.separator} />;
                      const msg = row as ChatMessageDto;
                      const idx = activeMessages.indexOf(msg);
                      const prev = activeMessages[idx - 1];
                      const showAvatar = !prev || prev.senderId !== msg.senderId;

                      return (
                        <MessageBubble
                          key={msg.id}
                          msg={msg}
                          isMe={msg.senderId === myId}
                          showAvatar={showAvatar}
                          myId={myId}
                          onReply={setReplyTo}
                          onEdit={startEdit}
                          onDelete={deleteMessage}
                          onReact={toggleReaction}
                        />
                      );
                    })}

                    <AnimatePresence>
                      {typingNames.length > 0 && <GroupTypingBubble names={typingNames} />}
                    </AnimatePresence>
                  </>
                )}
              </div>

              {/* Scroll-to-bottom */}
              <AnimatePresence>
                {showScrollBtn && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight)}
                    className="absolute bottom-24 right-6 p-2 bg-accent text-accent-foreground rounded-full shadow-lg z-10"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Input area */}
              <div className="border-t bg-background">
                <input ref={imgRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => handleFileSelect(e, "image")} />
                <input ref={fileRef} type="file" className="hidden"
                  onChange={(e) => handleFileSelect(e, "file")} />

                <AnimatePresence>
                  {editingMsg && <EditPreview msg={editingMsg} onCancel={cancelEdit} />}
                </AnimatePresence>
                <AnimatePresence>
                  {!editingMsg && replyTo && (
                    <ReplyPreview reply={replyTo} onCancel={() => setReplyTo(null)} />
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {!editingMsg && attached && (
                    <FilePreview
                      attached={attached}
                      onRemove={() => setAttached(null)}
                      uploading={isUploading}
                    />
                  )}
                </AnimatePresence>

                {/* @mention suggestions */}
                <AnimatePresence>
                  {!editingMsg && filteredMentions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="border-t bg-background px-3 py-2 max-h-36 overflow-y-auto space-y-0.5"
                    >
                      {filteredMentions.map((m) => (
                        <button
                          key={m.userId}
                          onClick={() => insertMention(m.userName)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted text-sm text-left"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={m.userAvatar} />
                            <AvatarFallback className="text-xs">{initials(m.userName)}</AvatarFallback>
                          </Avatar>
                          <span>{m.userName}</span>
                          <Badge variant="outline" className="text-[10px] ml-auto capitalize">{m.role}</Badge>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-2 px-3 py-3 relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={isUploading || !!editingMsg}>
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="top">
                      <DropdownMenuItem onClick={() => imgRef.current?.click()}>
                        <ImageIcon className="h-4 w-4 mr-2 text-blue-500" /> Image
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => fileRef.current?.click()}>
                        <FileIcon className="h-4 w-4 mr-2 text-orange-500" /> File
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                    onClick={() => { setInput((v) => v + "@"); inputRef.current?.focus(); }}
                    title="Mention someone"
                    disabled={!!editingMsg}
                  >
                    <AtSign className="h-4 w-4" />
                  </Button>

                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={editingMsg ? "Edit message…" : "Message group… (@ to mention)"}
                    className={cn("flex-1 h-9 text-sm", editingMsg && "ring-1 ring-amber-400/60")}
                  />

                  <div className="relative">
                    <Button
                      variant="ghost" size="icon"
                      className={cn("h-8 w-8 shrink-0", showEmoji && "bg-muted")}
                      onClick={() => setShowEmoji((v) => !v)}
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                    <AnimatePresence>
                      {showEmoji && (
                        <EmojiPicker
                          onSelect={(e) => { setInput((v) => v + e); inputRef.current?.focus(); }}
                          onClose={() => setShowEmoji(false)}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  <Button
                    size="icon" className="h-8 w-8 shrink-0"
                    onClick={handleSend}
                    disabled={(!input.trim() && !attached) || isUploading}
                  >
                    {isUploading
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : editingMsg
                      ? <Check className="h-3.5 w-3.5" />
                      : <Send className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* ── Members panel ──────────────────────────────────────────────── */}
            <AnimatePresence>
              {showMembers && (
                <motion.aside
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 224, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: "spring", damping: 26, stiffness: 280 }}
                  className="border-l overflow-hidden"
                >
                  <div className="w-56 h-full flex flex-col">
                    <div className="p-3 border-b flex items-center justify-between">
                      <p className="text-sm font-semibold">
                        Members
                        <span className="text-muted-foreground font-normal ml-1">
                          ({members.length})
                        </span>
                      </p>
                      <div className="flex items-center gap-1">
                        {canModerate && (
                          <Button variant="ghost" size="icon" className="h-6 w-6"
                            onClick={() => setShowAddMembers(true)} title="Add members">
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-6 w-6"
                          onClick={() => setShowMembers(false)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                      {[...members]
                        .sort((a, b) => {
                          const order = { owner: 0, admin: 1, member: 2 };
                          const ro = order[a.role as keyof typeof order] ?? 2;
                          const rb = order[b.role as keyof typeof order] ?? 2;
                          if (ro !== rb) return ro - rb;
                          return Number(b.isOnline) - Number(a.isOnline);
                        })
                        .map((m) => (
                          <div key={m.userId}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 group/member">
                            <div className="relative shrink-0">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={m.userAvatar} />
                                <AvatarFallback className="text-xs">{initials(m.userName)}</AvatarFallback>
                              </Avatar>
                              <span className={cn(
                                "absolute bottom-0 right-0 w-2 h-2 rounded-full border border-background",
                                m.isOnline ? "bg-emerald-500" : "bg-muted-foreground/30"
                              )} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                {m.userId === myId ? (
                                  <p className="text-xs font-medium truncate">You</p>
                                ) : (
                                  <Link
                                    to={`/profile/${m.userId}`}
                                    className="text-xs font-medium truncate hover:underline hover:text-accent transition-colors"
                                  >
                                    {m.userName}
                                  </Link>
                                )}
                                {roleIcon(m.role)}
                              </div>
                              <p className="text-[10px] text-muted-foreground capitalize">{m.role}</p>
                            </div>
                            {canModerate && m.userId !== myId && (
                              <button
                                onClick={() => chatApi.removeGroupMember(activeId!, m.userId)}
                                className="opacity-0 group-hover/member:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                                title="Remove"
                              >
                                <UserMinus className="h-3.5 w-3.5 text-destructive" />
                              </button>
                            )}
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <CreateGroupModal
        open={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreated={loadGroups}
      />

      {activeGroup && (
        <>
          <GroupSettingsModal
            groupId={activeGroup.id}
            open={showSettings}
            onClose={() => setShowSettings(false)}
          />
          <InviteAndAddMembersModal
            groupId={activeGroup.id}
            open={showAddMembers}
            onClose={() => setShowAddMembers(false)}
            canInvite={canModerate}
            canAdd={canModerate}
          />
        </>
      )}
    </DashboardLayout>
  );
}