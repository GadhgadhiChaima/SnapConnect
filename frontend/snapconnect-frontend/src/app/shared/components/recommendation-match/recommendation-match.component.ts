import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-recommendation-match',
  standalone: true,
  imports: [],
  template: `
    <div class="match-widget card-glass" [class.high-match]="score >= 90">
      <div class="widget-header flex-between" (click)="toggleExpand()">
        <div class="score-badge">
          <span class="sparkle-icon">✨</span>
          <span class="score-val">{{ score }}%</span>
          <span class="match-text">Smart Match</span>
        </div>

        <button type="button" class="expand-btn">
          {{ expanded() ? 'Hide Breakdown ▲' : 'Why this Match? ▼' }}
        </button>
      </div>

      @if (expanded()) {
        <div class="reasons-list animate-scale-in">
          <span class="breakdown-title">Transparent Algorithmic Matching:</span>
          @for (reason of reasons; track reason) {
            <div class="reason-row">
              <span class="chk">✓</span>
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
