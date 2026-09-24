import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (category(); as cat) {
      <a [routerLink]="['/services']" [queryParams]="{ categoryId: cat.id }" class="category-card card-glass">
        <div class="category-icon-box" [attr.data-cat]="cat.slug || cat.id">
          @switch (cat.slug || cat.id) {
            @case ('reels-tiktok') {
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="3" ry="3"/>
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" fill-opacity="0.3"/>
              </svg>
            }
            @case ('product-photo') {
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            }
            @case ('food-resto') {
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                <line x1="6" y1="1" x2="6" y2="4"/>
                <line x1="10" y1="1" x2="10" y2="4"/>
                <line x1="14" y1="1" x2="14" y2="4"/>
              </svg>
            }
            @case ('fashion') {
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
              </svg>
            }
            @case ('ugc') {
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            }
            @case ('events') {
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <polygon points="12 14 13.5 17 17 17.5 14.5 20 15 23 12 21.5 9 23 9.5 20 7 17.5 10.5 17 12 14" fill="currentColor" fill-opacity="0.3"/>
              </svg>
            }
            @case ('real-estate') {
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            }
            @default {
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            }
          }
        </div>
        <div class="category-info">
          <h3 class="category-name">{{ cat.name }}</h3>
          <p class="category-count">Créateurs mobiles vérifiés • 4K ProRes</p>
        </div>
        <span class="category-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </span>
      </a>
    }
  `,
  styles: [`
    :host { display: block; }

    .category-card {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4) var(--space-5);
      border-radius: var(--radius-lg);
      text-decoration: none;
      border: 1px solid var(--color-border);
      background: rgba(30, 41, 59, 0.5);
      transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .category-card:hover {
      transform: translateY(-3px);
      border-color: var(--color-primary-400);
      background: rgba(139, 92, 246, 0.08);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25), 0 0 15px var(--color-primary-glow);
    }

    .category-icon-box {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.1));
      border: 1px solid rgba(139, 92, 246, 0.25);
      color: var(--color-primary-300);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all var(--transition-fast);
    }

    .category-card:hover .category-icon-box {
      transform: scale(1.06);
      border-color: var(--color-primary-400);
      color: var(--color-primary-200);
    }

    .category-info {
      flex-grow: 1;
      overflow: hidden;
    }

    .category-name {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      margin: 0 0 3px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .category-count {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin: 0;
    }

    .category-arrow {
      color: var(--color-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }

    .category-card:hover .category-arrow {
      color: var(--color-primary-400);
      transform: translateX(4px);
    }
  `]
})
export class CategoryCardComponent {
  category = input<Category>();
}
