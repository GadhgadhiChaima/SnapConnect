import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { Notification, NotificationType } from '../../../core/models/notification.model';

type FilterCategory = 'ALL' | 'UNREAD' | 'PROPOSALS' | 'CONTRACTS' | 'REVIEWS';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="notif-page">
      <div class="container-narrow">

        <!-- Page Header -->
        <header class="page-header">
          <div class="header-main">
            <div class="header-badge">
              <span class="pulse-dot"></span>
              <span>Centre d'activités</span>
            </div>
            <h1>Notifications</h1>
            <p class="header-desc">
              @if (auth.isCreator()) {
                Suivez vos candidatures, validations de livrables 4K, fonds sous séquestre et nouveaux avis.
              } @else {
                Restez informé de l'avancement de vos briefs, livraisons de vidéos et validations de séquestre.
              }
            </p>
          </div>

          <div class="header-actions">
            @if (notifSvc.unreadNotifications() > 0) {
              <button (click)="markAllRead()" class="btn btn-outline btn-sm action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Tout marquer comme lu</span>
              </button>
            }
            <button (click)="refresh()" class="btn btn-ghost btn-sm refresh-btn" [class.spinning]="isRefreshing()" title="Actualiser">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
            </button>
          </div>
        </header>

        <!-- Filter Tabs -->
        <div class="filter-bar">
          <button
            class="filter-tab"
            [class.active]="activeFilter() === 'ALL'"
            (click)="setFilter('ALL')"
          >
            Toutes
            <span class="tab-badge">{{ notifSvc.notifications().length }}</span>
          </button>

          <button
            class="filter-tab"
            [class.active]="activeFilter() === 'UNREAD'"
            (click)="setFilter('UNREAD')"
          >
            Non lues
            @if (notifSvc.unreadNotifications() > 0) {
              <span class="tab-badge highlight">{{ notifSvc.unreadNotifications() }}</span>
            }
          </button>

          <button
            class="filter-tab"
            [class.active]="activeFilter() === 'PROPOSALS'"
            (click)="setFilter('PROPOSALS')"
          >
            Missions & Candidatures
          </button>

          <button
            class="filter-tab"
            [class.active]="activeFilter() === 'CONTRACTS'"
            (click)="setFilter('CONTRACTS')"
          >
            Contrats & Séquestre
          </button>

          <button
            class="filter-tab"
            [class.active]="activeFilter() === 'REVIEWS'"
            (click)="setFilter('REVIEWS')"
          >
            Avis & Messages
          </button>
        </div>

        <!-- Notification List -->
        <div class="notif-list">
          @if (filteredNotifs().length === 0) {
            <div class="empty-state card-glass">
              <div class="empty-icon-box">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <h3>Aucune notification</h3>
              <p>
                @if (activeFilter() === 'UNREAD') {
                  Vous avez lu toutes vos notifications ! Tout est à jour.
                } @else {
                  Vous n'avez aucune notification dans cette catégorie pour le moment.
                }
              </p>
              @if (auth.isCreator()) {
                <a routerLink="/jobs" class="btn btn-primary btn-sm mt-3">Trouver des missions</a>
              } @else {
                <a routerLink="/client/jobs/create" class="btn btn-primary btn-sm mt-3">Publier un brief</a>
              }
            </div>
          } @else {
            @for (n of filteredNotifs(); track n.id) {
              <div
                class="notif-item card-glass"
                [class.unread]="!n.isRead"
                (click)="onNotificationClick(n)"
              >
                <!-- Icon with tailored background -->
                <div class="notif-icon-wrapper" [attr.data-type]="getNormalizedType(n.type)">
                  @switch (getNormalizedType(n.type)) {
                    @case ('PROPOSAL_ACCEPTED') {
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    }
                    @case ('PROPOSAL_REJECTED') {
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                    }
                    @case ('ESCROW') {
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <path d="M9 12l2 2 4-4"/>
                      </svg>
                    }
                    @case ('DELIVERY') {
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="23 7 16 12 23 17 23 7"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                      </svg>
                    }
                    @case ('NEW_JOB') {
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                    }
                    @case ('NEW_REVIEW') {
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    }
                    @case ('MESSAGE') {
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    }
                    @default {
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                      </svg>
                    }
                  }
                </div>

                <!-- Notification Content -->
                <div class="notif-body">
                  <div class="notif-header-row">
                    <div class="title-with-tag">
                      <span class="type-pill" [attr.data-type]="getNormalizedType(n.type)">
                        {{ getTypeLabel(n.type) }}
                      </span>
                      <h4 class="notif-title">{{ n.title }}</h4>
                    </div>
                    <span class="notif-time">{{ formatTime(n.createdAt) }}</span>
                  </div>

                  <p class="notif-text">{{ n.body }}</p>

                  @if (n.link) {
                    <div class="notif-action-hint">
                      <span>Voir le détail</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  }
                </div>

                <!-- Unread status / Mark read action -->
                <div class="notif-status-col">
                  @if (!n.isRead) {
                    <span class="status-indicator" title="Non lu"></span>
                    <button
                      class="mark-read-btn"
                      (click)="onSingleMarkRead($event, n.id)"
                      title="Marquer comme lu"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </button>
                  }
                </div>
              </div>
            }
          }
        </div>

      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .notif-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
      background: radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.08), transparent 70%);
    }

    .container-narrow {
      max-width: 860px;
      margin: 0 auto;
      padding: 0 var(--space-4);
    }

    /* ─── Header ─── */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-6);
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .header-main {
      flex: 1;
      min-width: 280px;
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-primary-300);
      background: rgba(139, 92, 246, 0.12);
      border: 1px solid rgba(139, 92, 246, 0.25);
      padding: 3px 10px;
      border-radius: var(--radius-full);
      margin-bottom: var(--space-2);
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-primary-400);
      box-shadow: 0 0 8px var(--color-primary-400);
    }

    .page-header h1 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      color: var(--color-text-primary);
      margin: 0 0 var(--space-2) 0;
      letter-spacing: -0.02em;
    }

    .header-desc {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      line-height: 1.5;
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding-top: var(--space-2);
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-color: rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.03);
      font-weight: 500;
      transition: all var(--transition-fast);
    }

    .action-btn:hover {
      background: rgba(139, 92, 246, 0.15);
      border-color: var(--color-primary-500);
      color: #fff;
    }

    .refresh-btn {
      width: 36px;
      height: 36px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-lg);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--color-text-muted);
      transition: all var(--transition-fast);
    }

    .refresh-btn:hover {
      color: #fff;
      border-color: rgba(255, 255, 255, 0.25);
    }

    .refresh-btn.spinning svg {
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ─── Filter Tabs Bar ─── */
    .filter-bar {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: 4px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-xl);
      margin-bottom: var(--space-6);
      overflow-x: auto;
      scrollbar-width: none;
    }

    .filter-bar::-webkit-scrollbar {
      display: none;
    }

    .filter-tab {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: var(--radius-lg);
      background: transparent;
      border: none;
      color: var(--color-text-secondary);
      font-size: var(--font-size-xs);
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--transition-fast);
    }

    .filter-tab:hover {
      color: var(--color-text-primary);
      background: rgba(255, 255, 255, 0.04);
    }

    .filter-tab.active {
      background: var(--color-primary-600);
      color: #ffffff;
      box-shadow: 0 2px 10px rgba(139, 92, 246, 0.35);
      font-weight: 600;
    }

    .tab-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.15);
      color: inherit;
    }

    .tab-badge.highlight {
      background: #ec4899;
      color: #ffffff;
    }

    /* ─── Notification List ─── */
    .notif-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
      padding: var(--space-4) var(--space-5);
      border-radius: var(--radius-xl);
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(16px);
      cursor: pointer;
      position: relative;
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .notif-item:hover {
      transform: translateY(-2px);
      border-color: rgba(139, 92, 246, 0.4);
      background: rgba(255, 255, 255, 0.04);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    }

    .notif-item.unread {
      border-color: rgba(139, 92, 246, 0.45);
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(236, 72, 153, 0.03));
      box-shadow: 0 4px 18px rgba(139, 92, 246, 0.12);
    }

    /* ─── Icon wrapper ─── */
    .notif-icon-wrapper {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--color-text-secondary);
      transition: all var(--transition-fast);
    }

    .notif-icon-wrapper[data-type="PROPOSAL_ACCEPTED"] {
      background: rgba(16, 185, 129, 0.15);
      border-color: rgba(16, 185, 129, 0.3);
      color: #34d399;
    }

    .notif-icon-wrapper[data-type="ESCROW"] {
      background: rgba(245, 158, 11, 0.15);
      border-color: rgba(245, 158, 11, 0.3);
      color: #fbbf24;
    }

    .notif-icon-wrapper[data-type="NEW_JOB"] {
      background: rgba(139, 92, 246, 0.18);
      border-color: rgba(139, 92, 246, 0.35);
      color: #c084fc;
    }

    .notif-icon-wrapper[data-type="NEW_REVIEW"] {
      background: rgba(251, 191, 36, 0.18);
      border-color: rgba(251, 191, 36, 0.35);
      color: #f59e0b;
    }

    .notif-icon-wrapper[data-type="DELIVERY"] {
      background: rgba(59, 130, 246, 0.15);
      border-color: rgba(59, 130, 246, 0.3);
      color: #60a5fa;
    }

    .notif-icon-wrapper[data-type="MESSAGE"] {
      background: rgba(236, 72, 153, 0.15);
      border-color: rgba(236, 72, 153, 0.3);
      color: #f472b6;
    }

    .notif-icon-wrapper[data-type="PROPOSAL_REJECTED"] {
      background: rgba(239, 68, 68, 0.12);
      border-color: rgba(239, 68, 68, 0.25);
      color: #f87171;
    }

    /* ─── Body ─── */
    .notif-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .notif-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
    }

    .title-with-tag {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .type-pill {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 1px 7px;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.08);
      color: var(--color-text-secondary);
    }

    .type-pill[data-type="PROPOSAL_ACCEPTED"] { background: rgba(16, 185, 129, 0.18); color: #34d399; }
    .type-pill[data-type="ESCROW"]            { background: rgba(245, 158, 11, 0.18); color: #fbbf24; }
    .type-pill[data-type="NEW_JOB"]           { background: rgba(139, 92, 246, 0.2); color: #c084fc; }
    .type-pill[data-type="NEW_REVIEW"]        { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
    .type-pill[data-type="DELIVERY"]          { background: rgba(59, 130, 246, 0.18); color: #60a5fa; }
    .type-pill[data-type="MESSAGE"]           { background: rgba(236, 72, 153, 0.18); color: #f472b6; }
    .type-pill[data-type="PROPOSAL_REJECTED"] { background: rgba(239, 68, 68, 0.15); color: #f87171; }

    .notif-title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      margin: 0;
      line-height: 1.3;
    }

    .notif-time {
      font-size: 11px;
      color: var(--color-text-muted);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .notif-text {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      line-height: 1.5;
      margin: 2px 0 0 0;
    }

    .notif-action-hint {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      color: var(--color-primary-400);
      margin-top: 6px;
      transition: transform var(--transition-fast);
    }

    .notif-item:hover .notif-action-hint {
      transform: translateX(3px);
      color: var(--color-primary-300);
    }

    /* ─── Status & Actions ─── */
    .notif-status-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      padding-top: 4px;
      flex-shrink: 0;
    }

    .status-indicator {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #ec4899;
      box-shadow: 0 0 8px rgba(236, 72, 153, 0.8);
    }

    .mark-read-btn {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: var(--color-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: all var(--transition-fast);
    }

    .notif-item:hover .mark-read-btn {
      opacity: 1;
    }

    .mark-read-btn:hover {
      background: rgba(16, 185, 129, 0.2);
      border-color: rgba(16, 185, 129, 0.4);
      color: #34d399;
      transform: scale(1.1);
    }

    /* ─── Empty state ─── */
    .empty-state {
      padding: var(--space-12) var(--space-6);
      text-align: center;
      border-radius: var(--radius-2xl);
      border: 1px dashed rgba(255, 255, 255, 0.12);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .empty-icon-box {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(139, 92, 246, 0.12);
      border: 1px solid rgba(139, 92, 246, 0.25);
      color: var(--color-primary-400);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-4);
    }

    .empty-state h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      margin: 0 0 var(--space-1) 0;
    }

    .empty-state p {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      max-width: 420px;
      margin: 0 auto;
    }

    .mt-3 {
      margin-top: var(--space-4);
    }

    @media (max-width: 640px) {
      .page-header {
        flex-direction: column;
      }
      .header-actions {
        width: 100%;
        justify-content: space-between;
      }
      .notif-item {
        padding: var(--space-3) var(--space-4);
        gap: var(--space-3);
      }
      .notif-icon-wrapper {
        width: 38px;
        height: 38px;
      }
      .mark-read-btn {
        opacity: 1;
      }
    }
  `]
})
export class NotificationsComponent {
  readonly notifSvc = inject(NotificationService);
  readonly auth     = inject(AuthService);
  private readonly router = inject(Router);

  activeFilter = signal<FilterCategory>('ALL');
  isRefreshing = signal<boolean>(false);

  filteredNotifs = computed(() => {
    const list = this.notifSvc.notifications();
    const filter = this.activeFilter();

    switch (filter) {
      case 'UNREAD':
        return list.filter(n => !n.isRead);
      case 'PROPOSALS':
        return list.filter(n => {
          const t = this.getNormalizedType(n.type);
          return t === 'PROPOSAL_ACCEPTED' || t === 'PROPOSAL_REJECTED' || t === 'NEW_PROPOSAL' || t === 'NEW_JOB';
        });
      case 'CONTRACTS':
        return list.filter(n => {
          const t = this.getNormalizedType(n.type);
          return t === 'ESCROW' || t === 'DELIVERY' || t === 'CONTRACT_COMPLETED' || t === 'PAYMENT';
        });
      case 'REVIEWS':
        return list.filter(n => {
          const t = this.getNormalizedType(n.type);
          return t === 'NEW_REVIEW' || t === 'MESSAGE';
        });
      default:
        return list;
    }
  });

  setFilter(filter: FilterCategory): void {
    this.activeFilter.set(filter);
  }

  refresh(): void {
    this.isRefreshing.set(true);
    this.notifSvc.fetchNotifications().subscribe({
      next: () => this.isRefreshing.set(false),
      error: () => this.isRefreshing.set(false)
    });
  }

  markAllRead(): void {
    this.notifSvc.markAllRead().subscribe();
  }

  onSingleMarkRead(event: MouseEvent, id: string | number): void {
    event.stopPropagation();
    this.notifSvc.markRead(id).subscribe();
  }

  onNotificationClick(n: Notification): void {
    if (!n.isRead) {
      this.notifSvc.markRead(n.id).subscribe();
    }

    if (n.link) {
      this.router.navigateByUrl(n.link);
    }
  }

  getNormalizedType(rawType: string): string {
    const t = (rawType || '').toUpperCase();
    if (t.includes('PROPOSAL_ACCEPT') || t.includes('ACCEPTED')) return 'PROPOSAL_ACCEPTED';
    if (t.includes('PROPOSAL_REJECT') || t.includes('REJECTED')) return 'PROPOSAL_REJECTED';
    if (t.includes('PROPOSAL')) return 'NEW_PROPOSAL';
    if (t.includes('ESCROW') || t.includes('SEQUESTRE') || t.includes('PAYMENT')) return 'ESCROW';
    if (t.includes('DELIVER') || t.includes('LIVRABLE')) return 'DELIVERY';
    if (t.includes('REVIEW') || t.includes('AVIS') || t.includes('RATING')) return 'NEW_REVIEW';
    if (t.includes('JOB') || t.includes('BRIEF') || t.includes('MISSION')) return 'NEW_JOB';
    if (t.includes('MSG') || t.includes('MESSAGE')) return 'MESSAGE';
    return 'SYSTEM';
  }

  getTypeLabel(rawType: string): string {
    const t = this.getNormalizedType(rawType);
    switch (t) {
      case 'PROPOSAL_ACCEPTED': return 'Candidature retenue';
      case 'PROPOSAL_REJECTED': return 'Mise à jour';
      case 'NEW_PROPOSAL':     return 'Nouvelle proposition';
      case 'ESCROW':           return 'Séquestre Garanti';
      case 'DELIVERY':         return 'Livrable 4K';
      case 'NEW_JOB':          return 'Opportunité';
      case 'NEW_REVIEW':       return 'Évaluation client';
      case 'MESSAGE':          return 'Message';
      default:                 return 'Plateforme';
    }
  }

  formatTime(dateString?: string): string {
    if (!dateString) return 'Récemment';
    try {
      const now = Date.now();
      const time = new Date(dateString).getTime();
      const diffMs = now - time;
      const diffMin = Math.floor(diffMs / 60000);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffMin < 2) return 'À l\'instant';
      if (diffMin < 60) return `Il y a ${diffMin} min`;
      if (diffHour < 24) return `Il y a ${diffHour} h`;
      if (diffDay === 1) return 'Hier';
      if (diffDay < 7) return `Il y a ${diffDay} jours`;

      return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } catch {
      return 'Récemment';
    }
  }
}
