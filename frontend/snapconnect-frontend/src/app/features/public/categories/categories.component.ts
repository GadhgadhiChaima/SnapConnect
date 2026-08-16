import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CategoryCardComponent } from '../../../shared/components/category-card/category-card.component';
import { PLATFORM_CATEGORIES } from '../../../core/services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent, CategoryCardComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="categories-page">
      <div class="container">
        <div class="page-header text-center">
          <span class="badge badge-primary">Marketplace Directory</span>
          <h1>Smartphone Photo & Video Categories</h1>
          <p>Browse mobile creators and services tailored specifically to your industry niche.</p>
        </div>

        <div class="categories-grid">
          @for (cat of categories; track cat.id) {
            <app-category-card [category]="cat"></app-category-card>
          }
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .categories-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }

    .text-center { text-align: center; }

    .page-header {
      margin-bottom: var(--space-12);
    }

    .page-header h1 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      margin: var(--space-2) 0;
    }

    .page-header p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-6);
    }
  `]
})
export class CategoriesComponent {
  categories = PLATFORM_CATEGORIES;
}
