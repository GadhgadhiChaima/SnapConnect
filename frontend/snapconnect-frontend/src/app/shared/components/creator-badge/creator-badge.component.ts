import { Component, input } from '@angular/core';
import { BadgeType } from '../../../core/models/reputation.model';

@Component({
  selector: 'app-creator-badge',
  standalone: true,
  template: `
    <div class="creator-badge" [class]="'badge-' + type()">
      @switch (type()) {
        @case ('VERIFIED_CREATOR') {
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        }
        @case ('TOP_CREATOR') {
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="1">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        }
        @case ('FAST_RESPONDER') {
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        }
        @case ('IPHONE_PRO_EXPERT') {
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
        }
        @default {
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        }
      }
      <span class="badge-text">{{ getLabel() }}</span>
    </div>
  `,
  styles: [`
    :host { display: inline-block; }

    .creator-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: var(--font-weight-semibold);
      border: 1px solid var(--color-border);
      background: rgba(255, 255, 255, 0.05);
      white-space: nowrap;
    }

    .badge-VERIFIED_CREATOR {
      background: rgba(139, 92, 246, 0.12);
      border-color: rgba(139, 92, 246, 0.4);
      color: var(--color-primary-300);
    }

    .badge-TOP_CREATOR {
      background: rgba(245, 158, 11, 0.15);
      border-color: rgba(245, 158, 11, 0.5);
      color: #fbbf24;
    }

    .badge-FAST_RESPONDER {
      background: rgba(34, 197, 94, 0.12);
      border-color: rgba(34, 197, 94, 0.4);
      color: var(--color-success);
    }

    .badge-IPHONE_PRO_EXPERT {
      background: rgba(236, 72, 153, 0.12);
      border-color: rgba(236, 72, 153, 0.4);
      color: var(--color-accent-300);
    }
  `]
})
export class CreatorBadgeComponent {
  type = input<BadgeType>('VERIFIED_CREATOR');

  getLabel(): string {
    switch (this.type()) {
      case 'VERIFIED_CREATOR': return 'Créateur Vérifié';
      case 'TOP_CREATOR': return 'Top Créateur';
      case 'FAST_RESPONDER': return 'Réponse Rapide';
      case 'IPHONE_PRO_EXPERT': return 'Expert iPhone Pro';
      default: return 'Talent Certifié';
    }
  }
}
