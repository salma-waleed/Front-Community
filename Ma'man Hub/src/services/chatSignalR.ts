// src/services/chatSignalR.ts
// ─────────────────────────────────────────────────────────────────────────────
// Wraps @microsoft/signalr — install with:
//   npm install @microsoft/signalr
// ─────────────────────────────────────────────────────────────────────────────

import * as signalR from "@microsoft/signalr";

const HUB_URL =
  (import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
    "https://localhost:7220") + "/hubs/chat";

export type SignalREvent =
  | "NewMessage"
  | "MessageEdited"
  | "MessageDeleted"
  | "ReactionsUpdated"
  | "TypingIndicator"
  | "GroupTyping"
  | "MessagesRead"
  | "UserOnline"
  | "UserOffline"
  | "AddedToGroup"
  | "RemovedFromGroup";

class ChatSignalRService {
  private connection: signalR.HubConnection | null = null;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  async connect(token: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(
        import.meta.env.DEV
          ? signalR.LogLevel.Information
          : signalR.LogLevel.Warning
      )
      .build();

    // Forward all known server events to registered listeners
    const events: SignalREvent[] = [
      "NewMessage",
      "MessageEdited",
      "MessageDeleted",
      "ReactionsUpdated",
      "TypingIndicator",
      "GroupTyping",
      "MessagesRead",
      "UserOnline",
      "UserOffline",
      "AddedToGroup",
      "RemovedFromGroup",
    ];

    for (const event of events) {
      this.connection.on(event, (...args) => {
        const handlers = this.listeners.get(event);
        handlers?.forEach((h) => h(...args));
      });
    }

    this.connection.onreconnecting(() => {
      console.warn("[SignalR] Reconnecting…");
      const handlers = this.listeners.get("__reconnecting");
      handlers?.forEach((h) => h());
    });

    this.connection.onreconnected(() => {
      console.info("[SignalR] Reconnected");
      const handlers = this.listeners.get("__reconnected");
      handlers?.forEach((h) => h());
    });

    this.connection.onclose(() => {
      console.warn("[SignalR] Connection closed");
      const handlers = this.listeners.get("__closed");
      handlers?.forEach((h) => h());
    });

    await this.connection.start();
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    await this.connection?.stop();
    this.connection = null;
  }

  on(event: SignalREvent | string, handler: (...args: unknown[]) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
  }

  off(event: SignalREvent | string, handler: (...args: unknown[]) => void): void {
    this.listeners.get(event)?.delete(handler);
  }

  // ── Hub method invocations ─────────────────────────────────────────────────

  async markConversationRead(conversationId: string): Promise<void> {
    await this.invoke("MarkConversationRead", conversationId);
  }

  async sendTyping(conversationId: string, isTyping: boolean): Promise<void> {
    await this.invoke("SendTyping", conversationId, isTyping);
  }

  async joinGroup(groupId: string): Promise<void> {
    await this.invoke("JoinGroup", groupId);
  }

  async leaveGroup(groupId: string): Promise<void> {
    await this.invoke("LeaveGroup", groupId);
  }

  async sendGroupTyping(groupId: string, isTyping: boolean): Promise<void> {
    await this.invoke("SendGroupTyping", groupId, isTyping);
  }

  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  private async invoke(method: string, ...args: unknown[]): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.connection!.invoke(method, ...args);
    } catch (err) {
      console.error(`[SignalR] invoke ${method} failed:`, err);
    }
  }
}

export const chatSignalR = new ChatSignalRService();