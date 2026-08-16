import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Service } from '../../../core/models/service.model';
import { RatingStarsComponent } from '../rating-stars/rating-stars.component';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [RouterLink, RatingStarsComponent],
  template: `
    @if (service(); as s) {
      <div class="service-card card-glass card-glass-interactive">
        <!-- Media Preview -->
        <div class="media-preview">
          <img
            [src]="s.mediaGallery?.[0]?.thumbnailUrl || s.mediaGallery?.[0]?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'"
            [alt]="s.title"
            class="cover-img"
            onerror="this.src='https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80'"
          />
          <div class="category-chip">{{ s.categoryName || 'Mobile Shoot' }}</div>
          @if (s.packages?.[0]?.deliveryDays) {
            <div class="delivery-chip">⚡ {{ s.packages?.[0]?.deliveryDays }}d Delivery</div>
          }
        </div>

        <!-- Creator Header -->
        <div class="creator-strip">
          <img
            [src]="s.creatorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'"
            [alt]="s.creatorName"
            class="creator-thumb"
            onerror="this.src='https://ui-avatars.com/api/?background=8b5cf6&color=fff&name=' + s.creatorName"
          />
          <span class="creator-name">{{ s.creatorName }}</span>
        </div>

        <!-- Service Title -->
        <h3 class="service-title">
          <a [routerLink]="['/services', s.id]">{{ s.title }}</a>
        </h3>

        <!-- Rating -->
        <div class="rating-strip">
          <app-rating-stars [rating]="s.rating" [reviewsCount]="s.reviewsCount"></app-rating-stars>
        </div>

        <!-- Card Footer (Starting Price & Action) -->
        <div class="card-footer">
          <div class="price-block">
            <span class="price-label">Starting at</span>
            <span class="price-val">\${{ s.packages?.[0]?.price || 50 }}</span>
          </div>
          <a [routerLink]="['/services', s.id]" class="btn btn-primary btn-sm">Order Now</a>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; height: 100%; }

    .service-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--color-bg-card);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .media-preview {
      position: relative;
      width: 100%;
      height: 180px;
      overflow: hidden;
      background: var(--color-bg-surface);
    }

    .cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-slow);
    }

    .service-card:hover .cover-img {
      transform: scale(1.05);
    }

    .category-chip {
      position: absolute;
      top: var(--space-3);
      left: var(--space-3);
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: var(--font-weight-semibold);
      color: var(--color-primary-300);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .delivery-chip {
      position: absolute;
      bottom: var(--space-3);
      right: var(--space-3);
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      font-size: 10px;
      font-weight: var(--font-weight-bold);
      color: var(--color-gold-400);
      border: 1px solid rgba(251, 191, 36, 0.3);
    }

    .creator-strip {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-4) var(--space-4) 0;
    }

    .creator-thumb {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
      border: 1.5px solid var(--color-primary-500);
    }

    .creator-name {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
    }

    .service-title {
      padding: var(--space-2) var(--space-4);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      line-height: var(--line-height-snug);
      margin: 0;
      flex-grow: 1;
    }

    .service-title a {
      color: var(--color-text-primary);
      text-decoration: none;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color var(--transition-fast);
    }

    .service-title a:hover {
      color: var(--color-primary-400);
    }

    .rating-strip {
      padding: 0 var(--space-4) var(--space-3);
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) var(--space-4) var(--space-4);
      border-top: 1px solid var(--color-border-subtle);
      margin-top: auto;
    }

    .price-block {
      display: flex;
      flex-direction: column;
    }

    .price-label {
      font-size: 10px;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wider);
    }

    .price-val {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-black);
      color: var(--color-text-primary);
    }
  `]
})
export class ServiceCardComponent {
  service = input<Service | null>(null);
}
