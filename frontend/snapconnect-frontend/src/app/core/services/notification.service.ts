import { Injectable, signal, inject, effect } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, interval, Subscription } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Notification, NotificationListResponse } from '../models/notification.model';
import { AuthService } from './auth.service';

const API = 'http://localhost:8080/api/notifications';
const POLL_INTERVAL_MS = 20000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  readonly notifications       = signal<Notification[]>([]);
  readonly unreadNotifications = signal<number>(0);
  readonly isLoading           = signal<boolean>(false);

  private pollSub?: Subscription;
  private currentUserId?: string | number;

  constructor() {
    // Synchronize notifications automatically whenever currentUser changes
    effect(() => {
      const user = this.auth.currentUser();
      if (user && user.id) {
        if (this.currentUserId !== user.id) {
          this.currentUserId = user.id;
          this.loadFromCache(user.id);
          this.fetchNotifications().subscribe();
          this.startPolling();
        }
      } else {
        this.currentUserId = undefined;
        this.notifications.set([]);
        this.unreadNotifications.set(0);
        this.stopPolling();
      }
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  /**
   * Charge les notifications de l'utilisateur connecté depuis le backend
   * avec réconciliation du cache local.
   */
  fetchNotifications(): Observable<Notification[]> {
    const user = this.auth.currentUser();
    if (!user || !user.id) {
      return of([]);
    }

    this.isLoading.set(true);
    const url = `${API}?userId=${user.id}`;
    const headers = this.getAuthHeaders();

    return this.http.get<any>(url, { headers }).pipe(
      map(res => {
        let list: Notification[] = [];
        let unread = 0;

        if (Array.isArray(res)) {
          list = res;
          unread = list.filter(n => !n.isRead).length;
        } else if (res && Array.isArray(res.notifications)) {
          list = res.notifications;
          unread = typeof res.unreadCount === 'number' ? res.unreadCount : list.filter(n => !n.isRead).length;
        }

        // Si la liste est vide pour un créateur, générer les notifications démo initiales
        if (list.length === 0 && user.role === 'CREATOR') {
          list = this.getInitialCreatorSeed(user.id);
          unread = list.filter(n => !n.isRead).length;
        }

        return { list, unread };
      }),
      tap(({ list, unread }) => {
        this.notifications.set(list);
        this.unreadNotifications.set(unread);
        this.isLoading.set(false);
        this.saveToCache(user.id, list);
      }),
      map(({ list }) => list),
      catchError(err => {
        console.warn('[NotificationService] Fallback to cache due to backend error:', err);
        this.isLoading.set(false);
        const cached = this.loadFromCache(user.id);
        return of(cached);
      })
    );
  }

  /**
   * Récupère le compteur de notifications non lues
   */
  getUnreadCount(): Observable<number> {
    const user = this.auth.currentUser();
    if (!user || !user.id) return of(0);

    const url = `${API}/unread-count?userId=${user.id}`;
    const headers = this.getAuthHeaders();

    return this.http.get<{ count: number }>(url, { headers }).pipe(
      map(res => res?.count ?? 0),
      tap(count => this.unreadNotifications.set(count)),
      catchError(() => {
        const count = this.notifications().filter(n => !n.isRead).length;
        this.unreadNotifications.set(count);
        return of(count);
      })
    );
  }

  /**
   * Marquer une notification comme lue
   */
  markRead(id: string | number): Observable<void> {
    const user = this.auth.currentUser();
    // Optimistic UI update
    this.notifications.update(prev =>
      prev.map(n => String(n.id) === String(id) ? { ...n, isRead: true } : n)
    );
    this.unreadNotifications.update(c => Math.max(0, c - 1));

    if (user?.id) {
      this.saveToCache(user.id, this.notifications());
    }

    const headers = this.getAuthHeaders();
    const query = user?.id ? `?userId=${user.id}` : '';
    return this.http.patch<void>(`${API}/${id}/read${query}`, {}, { headers }).pipe(
      catchError(err => {
        console.warn('[NotificationService] Could not persist markRead to server:', err);
        return of(void 0);
      })
    );
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllRead(): Observable<void> {
    const user = this.auth.currentUser();
    this.notifications.update(prev => prev.map(n => ({ ...n, isRead: true })));
    this.unreadNotifications.set(0);

    if (user?.id) {
      this.saveToCache(user.id, this.notifications());
    }

    const headers = this.getAuthHeaders();
    const query = user?.id ? `?userId=${user.id}` : '';
    return this.http.patch<void>(`${API}/read-all${query}`, {}, { headers }).pipe(
      catchError(err => {
        console.warn('[NotificationService] Could not persist markAllRead to server:', err);
        return of(void 0);
      })
    );
  }

  /**
   * Ajouter dynamiquement une notification pour un utilisateur
   */
  /**
   * Ajouter dynamiquement une notification pour un utilisateur
   */
  notify(notification: Partial<Notification>): void {
    const user = this.auth.currentUser();
    const targetUserId = notification.userId || user?.id || 'unknown';
    const newNotif: Notification = {
      id: notification.id || 'notif-' + Date.now(),
      userId: targetUserId,
      type: notification.type || 'SYSTEM',
      title: notification.title || 'Nouvelle notification',
      body: notification.body || notification.title || 'Notification SnapConnect',
      link: notification.link || (user?.role === 'CREATOR' ? '/creator/dashboard' : '/client/dashboard'),
      isRead: false,
      createdAt: notification.createdAt || new Date().toISOString()
    };

    if (user && String(user.id) === String(newNotif.userId)) {
      this.notifications.update(prev => [newNotif, ...prev]);
      this.unreadNotifications.update(c => c + 1);
      this.saveToCache(user.id, this.notifications());
    }

    // Ensure recipient user cache has this notification immediately
    this.appendNotificationToUserCache(newNotif.userId, newNotif);

    // Persist to backend if reachable and valid numeric ID
    const rawId = String(newNotif.userId || '');
    const digits = rawId.replace(/\D/g, '');
    if (digits) {
      const payload = {
        ...newNotif,
        userId: Number(digits),
        body: newNotif.body || newNotif.title
      };
      this.http.post<any>(API, payload, { headers: this.getAuthHeaders() }).pipe(
        catchError(() => of(null))
      ).subscribe();
    }
  }

  appendNotificationToUserCache(targetUserId: string | number, notif: Notification): void {
    try {
      const key = this.getCacheKey(targetUserId);
      const raw = localStorage.getItem(key);
      let list: Notification[] = raw ? JSON.parse(raw) : [];
      list = [notif, ...list.filter(n => n.id !== notif.id)];
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {
      console.warn('[NotificationService] Error writing target user cache:', e);
    }
  }

  /* ── Polling ────────────────────────────────── */
  startPolling(): void {
    this.stopPolling();
    this.pollSub = interval(POLL_INTERVAL_MS).subscribe(() => {
      if (this.auth.isAuthenticated()) {
        this.getUnreadCount().subscribe();
      }
    });
  }

  stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
  }

  /* ── Local Storage Cache ───────────────────── */
  private getCacheKey(userId: string | number): string {
    return `snapconnect_notifications_${userId}`;
  }

  private loadFromCache(userId: string | number): Notification[] {
    try {
      const raw = localStorage.getItem(this.getCacheKey(userId));
      if (raw) {
        const parsed: Notification[] = JSON.parse(raw);
        this.notifications.set(parsed);
        this.unreadNotifications.set(parsed.filter(n => !n.isRead).length);
        return parsed;
      }
    } catch (e) {
      console.warn('[NotificationService] Error reading cache:', e);
    }

    const user = this.auth.currentUser();
    if (user?.role === 'CREATOR') {
      const initial = this.getInitialCreatorSeed(userId);
      this.notifications.set(initial);
      this.unreadNotifications.set(initial.filter(n => !n.isRead).length);
      this.saveToCache(userId, initial);
      return initial;
    }

    return [];
  }

  private saveToCache(userId: string | number, items: Notification[]): void {
    try {
      localStorage.setItem(this.getCacheKey(userId), JSON.stringify(items));
    } catch (e) {
      console.warn('[NotificationService] Error writing cache:', e);
    }
  }

  /**
   * Seed réaliste et contextualisé pour un créateur mobile
   */
  private getInitialCreatorSeed(userId: string | number): Notification[] {
    return [
      {
        id: 'seed-1',
        userId: userId,
        type: 'PROPOSAL_ACCEPTED',
        title: 'Candidature acceptée ! Tournage 5 Reels Gourmandise',
        body: 'Gourmandise a validé votre proposition pour la mission "5 Reels Pâtisserie & Brunch". Le contrat est actif et 450 DT sont sécurisés sous séquestre.',
        link: '/creator/contracts',
        isRead: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        id: 'seed-2',
        userId: userId,
        type: 'ESCROW',
        title: 'Fonds bloqués en Séquestre : 450 DT',
        body: 'Le client a consigné l\'intégralité des fonds. Vous pouvez entamer le tournage en toute sérénité selon le brief convenu.',
        link: '/creator/earnings',
        isRead: false,
        createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString()
      },
      {
        id: 'seed-3',
        userId: userId,
        type: 'NEW_JOB',
        title: 'Nouvelle mission recommandée à La Marsa 📍',
        body: 'Alyssa Bio Skincare recherche un vidéaste iPhone 15/16 Pro pour 3 vidéos UGC cosmétiques. Budget : 320 DT.',
        link: '/jobs',
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
      },
      {
        id: 'seed-4',
        userId: userId,
        type: 'NEW_REVIEW',
        title: 'Nouvel avis 5 étoiles reçu ! ⭐⭐⭐⭐⭐',
        body: 'Carthage Concept vous a attribué la note maximale : "Qualité vidéo 4K impeccable, plans nets et livraison en 24h. Je recommande !"',
        link: '/creator/reviews',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'seed-5',
        userId: userId,
        type: 'SYSTEM',
        title: 'Bienvenue sur SnapConnect Studio Mobile 📱',
        body: 'Votre profil créateur smartphone est opérationnel. Complétez votre portfolio pour maximiser vos chances d\'être sélectionné.',
        link: '/creator/portfolio',
        isRead: true,
        createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
      }
    ];
  }
}
