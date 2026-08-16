import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, interval, Subscription } from 'rxjs';
import { Conversation, Message, MessageSendRequest, ConversationListResponse, MessageListResponse } from '../models/message.model';

const API = 'http://localhost:8080/api';
const POLL_INTERVAL_MS = 15000;

@Injectable({ providedIn: 'root' })
export class MessageService {

  readonly conversations     = signal<Conversation[]>([]);
  readonly messages          = signal<Message[]>([]);
  readonly activeConversation = signal<Conversation | null>(null);
  readonly unreadMessages    = signal<number>(0);
  readonly isLoading         = signal<boolean>(false);

  private pollSub?: Subscription;

  constructor(private http: HttpClient) {}

  /* ── Conversations ───────────────────────── */
  getConversations(): Observable<ConversationListResponse> {
    return this.http.get<ConversationListResponse>(`${API}/conversations`).pipe(
      tap(res => this.conversations.set(res.conversations))
    );
  }

  startConversation(participantId: string, contextType: string, contextId?: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${API}/conversations`, { participantId, contextType, contextId });
  }

  /* ── Messages ────────────────────────────── */
  getMessages(conversationId: string, page = 1): Observable<MessageListResponse> {
    this.isLoading.set(true);
    return this.http.get<MessageListResponse>(`${API}/conversations/${conversationId}/messages?page=${page}`).pipe(
      tap(res => {
        this.messages.set(res.messages);
        this.isLoading.set(false);
      })
    );
  }

  send(data: MessageSendRequest): Observable<Message> {
    return this.http.post<Message>(`${API}/messages`, data).pipe(
      tap(msg => this.messages.update(prev => [...prev, msg]))
    );
  }

  markRead(conversationId: string): Observable<void> {
    return this.http.patch<void>(`${API}/conversations/${conversationId}/read`, {});
  }

  /* ── Unread count (polled) ───────────────── */
  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${API}/messages/unread-count`).pipe(
      tap(res => this.unreadMessages.set(res.count))
    );
  }

  startPolling(): void {
    this.pollSub = interval(POLL_INTERVAL_MS).subscribe(() => this.getUnreadCount().subscribe());
  }

  stopPolling(): void {
    this.pollSub?.unsubscribe();
  }
}
