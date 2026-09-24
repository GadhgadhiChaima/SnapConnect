import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-recommendation-match',
  standalone: true,
  imports: [],
  template: `
    <div class="match-widget card-glass" [class.high-match]="score >= 90">
      <div class="widget-header flex-between" (click)="toggleExpand()">
        <div class="score-badge">
          <svg class="sparkle-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span class="score-val">{{ score }}%</span>
          <span class="match-text">Correspondance IA</span>
        </div>

        <button type="button" class="expand-btn">
          {{ expanded() ? 'Masquer les détails ▲' : 'Pourquoi ce profil ? ▼' }}
        </button>
      </div>

      @if (expanded()) {
        <div class="reasons-list animate-scale-in">
          <span class="breakdown-title">Critères de correspondance algorithmique :</span>
          @for (reason of reasons; track reason) {
            <div class="reason-row">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>{{ reason }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .match-widget {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-xl);
      border: 1px solid rgba(139, 92, 246, 0.4);
      background: rgba(139, 92, 246, 0.08);
      transition: all 0.2s ease;
    }

    .match-widget.high-match {
      border-color: rgba(34, 197, 94, 0.5);
      background: rgba(34, 197, 94, 0.08);
    }

    .widget-header {
      cursor: pointer;
      user-select: none;
      align-items: center;
    }

    .score-badge {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .sparkle-icon {
      font-size: 1.1rem;
    }

    .score-val {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-black);
      color: var(--color-success);
    }

    .match-text {
      font-size: var(--font-size-xs);
      font-weight: bold;
      color: var(--color-text-primary);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
    }

    .expand-btn {
      background: none;
      border: none;
      font-size: 11px;
      color: var(--color-primary-300);
      cursor: pointer;
      padding: 0;
    }

    .expand-btn:hover {
      text-decoration: underline;
    }

    .reasons-list {
      margin-top: var(--space-3);
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border-subtle);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .breakdown-title {
      font-size: 10px;
      text-transform: uppercase;
      color: var(--color-text-muted);
      letter-spacing: var(--letter-spacing-wide);
      margin-bottom: 2px;
      display: block;
    }

    .reason-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .chk {
      color: var(--color-success);
      font-weight: bold;
      font-size: 12px;
    }
  `]
})
export class RecommendationMatchComponent {
  @Input({ required: true }) score = 95;
  @Input() reasons: string[] = [
    'Smartphone hardware matches project requirement (iPhone 16 Pro 4K)',
    'Top rated in video creation niche',
    'Fast turnaround velocity (< 48h)'
  ];

  expanded = signal(false);

  toggleExpand(): void {
    this.expanded.set(!this.expanded());
  }
}
