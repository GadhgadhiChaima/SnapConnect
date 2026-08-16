import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (category(); as cat) {
      <a [routerLink]="['/services']" [queryParams]="{ categoryId: cat.id }" class="category-card card-glass card-glass-interactive">
        <div class="category-icon-box">
          <span class="category-emoji">{{ cat.emoji || '📸' }}</span>
        </div>
        <div class="category-info">
          <h4 class="category-name">{{ cat.name }}</h4>
          <p class="category-count">{{ cat.servicesCount || 24 }}+ Services • {{ cat.creatorsCount || 18 }}+ Creators</p>
        </div>
        <span class="category-arrow">→</span>
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
      transition: all var(--transition-base);
    }

    .category-card:hover {
      transform: translateY(-3px);
      border-color: var(--color-primary-500);
      box-shadow: 0 8px 24px var(--color-primary-glow);
    }

    .category-icon-box {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15));
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .category-emoji {
      font-size: 1.5rem;
    }

    .category-info {
      flex-grow: 1;
      overflow: hidden;
    }

    .category-name {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .category-count {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .category-arrow {
      color: var(--color-text-muted);
      font-size: 1.2rem;
      transition: transform var(--transition-fast), color var(--transition-fast);
    }

    .category-card:hover .category-arrow {
      color: var(--color-primary-400);
      transform: translateX(4px);
    }
  `]
})
export class CategoryCardComponent {
  category = input<Category | null>(null);
}
