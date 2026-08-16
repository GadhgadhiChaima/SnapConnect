import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  link: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="notif-page">
      <div class="container-narrow">
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-primary">Updates</span>
            <h1>Notifications</h1>
            <p>Stay updated on contract milestones, file uploads, and messages.</p>
          </div>
          <button (click)="markAllRead()" class="btn btn-outline btn-sm">Mark All as Read</button>
        </div>

        <div class="notif-list">
          @for (n of notifs(); track n.id) {
            <a [routerLink]="n.link" class="notif-item card-glass" [class.unread]="!n.isRead">
              <div class="notif-icon">{{ getIcon(n.type) }}</div>
              <div class="notif-content">
                <div class="notif-top flex-between">
                  <h4>{{ n.title }}</h4>
                  <span class="notif-time">{{ n.time }}</span>
                </div>
                <p>{{ n.body }}</p>
              </div>
              @if (!n.isRead) {
                <div class="unread-dot"></div>
              }
            </a>
          }
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }
    .notif-page { padding-top: calc(var(--navbar-height) + var(--space-8)); padding-bottom: var(--space-20); }
    .page-header { margin-bottom: var(--space-8); flex-wrap: wrap; gap: var(--space-3); }
    .page-header h1 { font-size: var(--font-size-3xl); font-weight: var(--font-weight-black); margin: var(--space-2) 0; }
    .page-header p { color: var(--color-text-secondary); font-size: var(--font-size-base); }
    .notif-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .notif-item {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4) var(--space-5);
      border-radius: var(--radius-xl);
      text-decoration: none;
      transition: all var(--transition-fast);
      position: relative;
    }
    .notif-item:hover { transform: translateX(4px); border-color: var(--color-primary-500); }
    .notif-item.unread { border-color: var(--color-primary-400); background: var(--color-primary-light); }
    .notif-icon { font-size: 1.8rem; flex-shrink: 0; }
    .notif-content { flex-grow: 1; display: flex; flex-direction: column; gap: 2px; }
    .notif-content h4 { font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0; }
    .notif-time { font-size: 11px; color: var(--color-text-muted); }
    .notif-content p { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin: 0; }
    .unread-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-accent-500); flex-shrink: 0; }
  `]
})
export class NotificationsComponent {
  notifs = signal<AppNotification[]>([
    {
      id: 'n-1',
      type: 'DELIVERY',
      title: 'Sarah Jenkins uploaded 2 4K video files for review',
      body: 'Contract #ct-1: 5 Aesthetic Unboxing Reels for Skincare Brand',
      time: '10m ago',
      isRead: false,
      link: '/client/contracts/ct-1'
    },
    {
      id: 'n-2',
      type: 'MESSAGE',
      title: 'New message from Marc Dupont',
      body: 'Confirming Friday 19:00 for the bistro shoot.',
      time: '1h ago',
      isRead: false,
      link: '/client/messages'
    },
    {
      id: 'n-3',
      type: 'ESCROW',
      title: 'Payment of $250 secured in Escrow',
      body: 'Your project brief is now active and protected by SnapConnect Guarantee.',
      time: '1 day ago',
      isRead: true,
      link: '/client/contracts/ct-1'
    }
  ]);

  getIcon(type: string): string {
    if (type === 'DELIVERY') return '🎬';
    if (type === 'MESSAGE') return '💬';
    if (type === 'ESCROW') return '🔒';
    return '🔔';
  }

  markAllRead(): void {
    this.notifs.update(prev => prev.map(n => ({ ...n, isRead: true })));
  }
}
