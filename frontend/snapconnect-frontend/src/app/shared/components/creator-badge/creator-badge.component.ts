import { Component, input } from '@angular/core';
import { BadgeType } from '../../../core/models/reputation.model';

@Component({
  selector: 'app-creator-badge',
  standalone: true,
  template: `
    <div class="creator-badge" [class]="'badge-' + type()">
      <span class="badge-icon">{{ getIcon() }}</span>
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

  getIcon(): string {
    switch (this.type()) {
      case 'VERIFIED_CREATOR': return '✓';
      case 'TOP_CREATOR': return '👑';
      case 'FAST_RESPONDER': return '⚡';
      case 'IPHONE_PRO_EXPERT': return '📱';
      default: return '⭐';
    }
  }

  getLabel(): string {
    switch (this.type()) {
      case 'VERIFIED_CREATOR': return 'Verified Creator';
      case 'TOP_CREATOR': return 'Top Rated';
      case 'FAST_RESPONDER': return 'Fast Responder';
      case 'IPHONE_PRO_EXPERT': return 'iPhone 16 Pro Expert';
      default: return 'Pro Talent';
    }
  }
}
