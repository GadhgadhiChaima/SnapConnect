import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Client, IFrame, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AuthService } from './auth.service';

const REST_API = 'http://localhost:8080/api';
const WS_URL   = 'http://localhost:8080/ws';

export interface ConversationItem {
  id: number;
  otherUserId: number;
  otherUserName: string;
  otherUserAvatar: string;
  contextType: string;
  contextTitle: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
}

export interface ChatMsg {
  id: number | null;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  type: 'CHAT' | 'TYPING' | 'READ';
  isRead: boolean;
  sentAt: string;
}

export interface TypingUserInfo {
  senderId: number | string;
  senderName: string;
}

/**
 * MessageService — Real-Time Chat via WebSocket STOMP + REST
 *
 * WebSocket flow:
 *   1. connect()  — Connect to Spring Boot WebSocket (SockJS + STOMP)
 *   2. subscribeToConversation(convId) — Receive real-time messages
 *   3. sendMessage(convId, senderId, content) — Send via STOMP
 *   4. sendTyping(convId, senderId, name, isTyping) — Typing indicator
 *   5. disconnect() — Clean up on component destroy
 *
 * REST flow (initial data):
 *   - getConversations() — Load conversation list on init
 *   - getMessages(convId) — Load message history on conversation open
 */
@Injectable({ providedIn: 'root' })
export class MessageService {
  private authService = inject(AuthService);
  private http        = inject(HttpClient);

  // ── Reactive State ────────────────────────────────────────────────
  readonly conversations     = signal<ConversationItem[]>([]);
  readonly messages          = signal<ChatMsg[]>([]);
  readonly unreadMessages    = signal<number>(0);
  readonly isConnected       = signal<boolean>(false);
  readonly isLoading         = signal<boolean>(false);

  // Typing indicators: conversationId → TypingUserInfo
  readonly typingUsers = signal<Map<number, TypingUserInfo>>(new Map());

  // ── STOMP Client ──────────────────────────────────────────────────
  private stompClient: Client | null = null;
  private convSubscription: StompSubscription | null = null;
  private currentConvId: number | null = null;

  // ── WebSocket Management ──────────────────────────────────────────

  /**
   * Connect to the WebSocket broker.
   * Call this when the messages page initializes.
   */
  connect(onConnected?: () => void): void {
    if (this.stompClient?.connected) {
      onConnected?.();
      return;
    }

    const token = this.authService.getToken() || '';

    this.stompClient = new Client({
      // SockJS factory instead of native WebSocket
      webSocketFactory: () => new SockJS(WS_URL) as any,

      // Pass JWT in STOMP CONNECT frame headers
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },

      reconnectDelay: 3000,   // Auto-reconnect after 3s
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: (_frame: IFrame) => {
        this.isConnected.set(true);
        onConnected?.();
      },

      onDisconnect: () => {
        this.isConnected.set(false);
      },

      onStompError: (frame: IFrame) => {
        console.error('[MessageService] STOMP error:', frame.headers['message']);
        this.isConnected.set(false);
      },

      // Silent in production — uncomment for debugging:
      // debug: (msg: string) => console.log('[STOMP]', msg),
    });

    this.stompClient.activate();
  }

  /**
   * Subscribe to a specific conversation topic for real-time messages.
   * Unsubscribes from previous conversation automatically.
   */
  subscribeToConversation(convId: number): void {
    if (!this.stompClient?.connected) return;

    // Unsubscribe from previous conversation
    this.convSubscription?.unsubscribe();
    this.currentConvId = convId;

    this.convSubscription = this.stompClient.subscribe(
      `/topic/conv/${convId}`,
      (stompMsg: IMessage) => {
        try {
          const payload: ChatMsg = JSON.parse(stompMsg.body);
          this.handleIncomingMessage(payload);
        } catch (e) {
          console.error('[MessageService] Failed to parse STOMP message:', e);
        }
      }
    );
  }

  isCurrentUser(senderId: number | string | undefined | null): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser || currentUser.id == null || senderId == null) return false;
    return String(currentUser.id).trim() === String(senderId).trim();
  }

  /**
   * Process incoming WebSocket message based on type.
   */
  private handleIncomingMessage(payload: ChatMsg): void {
    switch (payload.type) {
      case 'CHAT': {
        // Add to messages list
        this.messages.update(prev => [...prev, payload]);

        const isFromOther = !this.isCurrentUser(payload.senderId);

        // Update conversation list preview
        this.conversations.update(convs =>
          convs.map(c => c.id === payload.conversationId
            ? { ...c, lastMessage: payload.content, lastMessageAt: payload.sentAt,
                unreadCount: isFromOther ? c.unreadCount + 1 : c.unreadCount }
            : c
          )
        );

        // Update global unread if from someone else
        if (isFromOther) {
          this.unreadMessages.update(n => n + 1);
        }
        break;
      }

      case 'TYPING': {
        const isFromCurrentUser = this.isCurrentUser(payload.senderId);

        // If this typing event originated from the current user (echoed back by broker),
        // we must never display it on the current user's screen.
        if (isFromCurrentUser) {
          this.typingUsers.update(map => {
            if (!map.has(payload.conversationId)) return map;
            const newMap = new Map(map);
            newMap.delete(payload.conversationId);
            return newMap;
          });
          break;
        }

        // It is from the other participant
        if (payload.content === 'typing') {
          this.typingUsers.update(map => {
            const newMap = new Map(map);
            newMap.set(payload.conversationId, {
              senderId: payload.senderId,
              senderName: payload.senderName || 'Autre utilisateur'
            });
            return newMap;
          });

          // Auto-clear typing after 3 seconds
          setTimeout(() => {
            this.typingUsers.update(map => {
              const current = map.get(payload.conversationId);
              if (current && String(current.senderId) === String(payload.senderId)) {
                const newMap = new Map(map);
                newMap.delete(payload.conversationId);
                return newMap;
              }
              return map;
            });
          }, 3000);
        } else {
          // 'stopped' typing
          this.typingUsers.update(map => {
            const current = map.get(payload.conversationId);
            if (current && String(current.senderId) === String(payload.senderId)) {
              const newMap = new Map(map);
              newMap.delete(payload.conversationId);
              return newMap;
            }
            return map;
          });
        }
        break;
      }

      case 'READ':
        // Mark messages as read in the UI
        this.messages.update(msgs =>
          msgs.map(m => m.conversationId === payload.conversationId
            ? { ...m, isRead: true }
            : m
          )
        );
        break;
    }
  }

  /** Send a chat message via STOMP */
  sendMessage(conversationId: number, senderId: number | string, content: string): void {
    if (!this.stompClient?.connected || !content.trim()) return;

    this.stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ conversationId, senderId: Number(senderId), content })
    });
  }

  /** Send typing indicator via STOMP */
  sendTyping(conversationId: number, senderId: number | string, senderName: string, isTyping: boolean): void {
    if (!this.stompClient?.connected) return;

    const numericSenderId = Number(senderId);
    const validSenderId = !isNaN(numericSenderId) ? numericSenderId : senderId;

    this.stompClient.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({ conversationId, senderId: validSenderId, senderName, isTyping })
    });
  }

  /** Send read receipt via STOMP */
  sendReadReceipt(conversationId: number, readerId: number | string): void {
    if (!this.stompClient?.connected) return;

    this.stompClient.publish({
      destination: '/app/chat.read',
      body: JSON.stringify({ conversationId, readerId: Number(readerId) })
    });
  }

  /** Disconnect and clean up STOMP client */
  disconnect(): void {
    this.convSubscription?.unsubscribe();
    this.stompClient?.deactivate();
    this.isConnected.set(false);
  }

  // ── REST API ──────────────────────────────────────────────────────

  /** Load conversations list (initial REST load) */
  getConversations(): Observable<{ conversations: ConversationItem[]; total: number }> {
    this.isLoading.set(true);
    return this.http.get<{ conversations: ConversationItem[]; total: number }>(`${REST_API}/conversations`).pipe(
      tap(res => {
        this.conversations.set(res.conversations || []);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Start or get existing conversation with another user.
   * Supports either an options object or positional parameters.
   */
  startConversation(
    target: number | string | {
      otherUserId?: number | string | null;
      otherUserEmail?: string;
      otherUserName?: string;
      otherUserAvatar?: string;
      contextType?: string;
      contextId?: string;
      contextTitle?: string;
    } | null,
    contextType = 'GENERAL',
    contextTitle?: string,
    otherUserName?: string,
    otherUserEmail?: string,
    otherUserAvatar?: string
  ): Observable<ConversationItem> {
    let payload: any;
    if (typeof target === 'object' && target !== null) {
      payload = {
        otherUserId: target.otherUserId && !isNaN(Number(target.otherUserId)) ? Number(target.otherUserId) : null,
        otherUserEmail: target.otherUserEmail,
        otherUserName: target.otherUserName,
        otherUserAvatar: target.otherUserAvatar,
        contextType: target.contextType || 'GENERAL',
        contextId: target.contextId,
        contextTitle: target.contextTitle
      };
    } else {
      payload = {
        otherUserId: target && !isNaN(Number(target)) ? Number(target) : null,
        otherUserEmail,
        otherUserName,
        otherUserAvatar,
        contextType: contextType || 'GENERAL',
        contextTitle
      };
    }

    return this.http.post<ConversationItem>(`${REST_API}/conversations`, payload).pipe(
      tap(conv => {
        this.conversations.update(list => {
          if (list.some(c => c.id === conv.id)) return list;
          return [conv, ...list];
        });
      })
    );
  }

  /** Send message via REST with immediate MySQL persistence & WebSocket broadcast */
  sendChatMessage(conversationId: number, content: string): Observable<ChatMsg> {
    return this.http.post<ChatMsg>(`${REST_API}/conversations/${conversationId}/messages`, { content: content.trim() }).pipe(
      tap(msg => {
        // Append to local messages signal if not already present
        this.messages.update(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        // Update lastMessage and lastMessageAt in conversation list
        this.conversations.update(convs =>
          convs.map(c => c.id === conversationId
            ? { ...c, lastMessage: msg.content, lastMessageAt: msg.sentAt }
            : c
          )
        );
      })
    );
  }

  /** Load message history for a conversation (REST) */
  getMessages(conversationId: number): Observable<{ messages: ChatMsg[]; total: number }> {
    this.isLoading.set(true);
    return this.http.get<{ messages: ChatMsg[]; total: number }>(
      `${REST_API}/conversations/${conversationId}/messages`
    ).pipe(
      tap(res => {
        this.messages.set(res.messages);
        this.isLoading.set(false);
      })
    );
  }

  /** Mark conversation as read (REST) */
  markRead(conversationId: number): Observable<void> {
    return this.http.post<void>(`${REST_API}/conversations/${conversationId}/read`, {});
  }

  /** Get unread count (REST) */
  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${REST_API}/messages/unread-count`).pipe(
      tap(res => this.unreadMessages.set(res.count))
    );
  }
}
