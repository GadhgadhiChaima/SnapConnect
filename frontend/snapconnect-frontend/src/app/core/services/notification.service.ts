import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, interval, Subscription } from 'rxjs';
import { Notification, NotificationListResponse } from '../models/notification.model';

const API = 'http://localhost:8080/api/notifications';
const POLL_INTERVAL_MS = 20000;

@Injectable({ providedIn: 'root' })
export class NotificationService {

  readonly notifications        = signal<Notification[]>([]);
  readonly unreadNotifications  = signal<number>(0);
  readonly isLoading            = signal<boolean>(false);

  private pollSub?: Subscription;

  constructor(private http: HttpClient) {}

  getAll(page = 1): Observable<NotificationListResponse> {
    this.isLoading.set(true);
    return this.http.get<NotificationListResponse>(`${API}?page=${page}`).pipe(
      tap(res => {
        this.notifications.set(res.notifications);
        this.unreadNotifications.set(res.unreadCount);
        this.isLoading.set(false);
      })
    );
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${API}/unread-count`).pipe(
      tap(res => this.unreadNotifications.set(res.count))
    );
  }

  markRead(id: string): Observable<void> {
    return this.http.patch<void>(`${API}/${id}/read`, {}).pipe(
      tap(() => {
        this.notifications.update(prev =>
          prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        this.unreadNotifications.update(c => Math.max(0, c - 1));
      })
    );
  }

  markAllRead(): Observable<void> {
    return this.http.patch<void>(`${API}/read-all`, {}).pipe(
      tap(() => {
        this.notifications.update(prev => prev.map(n => ({ ...n, isRead: true })));
        this.unreadNotifications.set(0);
      })
    );
  }

  startPolling(): void {
    this.pollSub = interval(POLL_INTERVAL_MS).subscribe(() => this.getUnreadCount().subscribe());
  }

  stopPolling(): void {
    this.pollSub?.unsubscribe();
  }
}
