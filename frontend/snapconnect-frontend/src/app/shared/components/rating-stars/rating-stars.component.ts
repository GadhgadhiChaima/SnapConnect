import { Component, input } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  template: `
    <div class="rating-container">
      <span class="stars-row">
        @for (star of fullStars(); track $index) {
          <span class="star filled">★</span>
        }
        @if (hasHalfStar()) {
          <span class="star half">★</span>
        }
        @for (star of emptyStars(); track $index) {
          <span class="star empty">★</span>
        }
      </span>
      <span class="rating-number">{{ rating().toFixed(1) }}</span>
      @if (reviewsCount() !== undefined) {
        <span class="reviews-count">({{ reviewsCount() }})</span>
      }
    </div>
  `,
  styles: [`
    :host { display: inline-block; }

    .rating-container {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: var(--font-size-sm);
      line-height: 1;
    }

    .stars-row {
      display: inline-flex;
      align-items: center;
      gap: 1px;
    }

    .star {
      font-size: 0.95rem;
      transition: transform var(--transition-fast);
    }

    .star.filled {
      color: var(--color-gold-400);
      text-shadow: 0 0 8px rgba(251, 191, 36, 0.4);
    }

    .star.half {
      color: var(--color-gold-400);
      opacity: 0.75;
    }

    .star.empty {
      color: rgba(148, 163, 184, 0.3);
    }

    .rating-number {
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      margin-left: 2px;
      font-size: var(--font-size-xs);
    }

    .reviews-count {
      color: var(--color-text-muted);
      font-size: var(--font-size-xs);
    }
  `]
})
export class RatingStarsComponent {
  rating = input<number>(5.0);
  reviewsCount = input<number | undefined>(undefined);

  fullStars = () => Array(Math.floor(Math.min(5, Math.max(0, this.rating())))).fill(0);
  hasHalfStar = () => (this.rating() % 1) >= 0.5 && this.rating() < 5;
  emptyStars = () => {
    const full = Math.floor(Math.min(5, Math.max(0, this.rating())));
    const half = this.hasHalfStar() ? 1 : 0;
    return Array(Math.max(0, 5 - full - half)).fill(0);
  };
}
