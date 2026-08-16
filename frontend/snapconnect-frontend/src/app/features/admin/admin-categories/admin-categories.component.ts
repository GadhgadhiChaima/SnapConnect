import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="admin-categories-page">
      <div class="container">
        <div class="page-header flex-between">
          <div>
            <a routerLink="/admin/dashboard" class="back-link">← Back to Admin Hub</a>
            <h1>Smartphone Content Niches & Categories</h1>
            <p>Configure and manage specialized mobile photography & videography categories.</p>
          </div>
        </div>

        <div class="categories-table-card card-glass">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Required Tech Specs</th>
                  <th>Active Services</th>
                </tr>
              </thead>
              <tbody>
                @for (c of categories(); track c.slug) {
                  <tr>
                    <td class="cat-icon">{{ c.icon }}</td>
                    <td><strong>{{ c.name }}</strong></td>
                    <td class="text-muted">/category/{{ c.slug }}</td>
                    <td><span class="badge badge-accent">{{ c.specs }}</span></td>
                    <td><strong>{{ c.count }}</strong></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }
    .admin-categories-page { padding-top: calc(var(--navbar-height) + var(--space-8)); padding-bottom: var(--space-20); }
    .back-link { font-size: var(--font-size-xs); color: var(--color-primary-400); text-decoration: none; margin-bottom: var(--space-2); display: inline-block; }
    .page-header { margin-bottom: var(--space-8); }
    .page-header h1 { font-size: var(--font-size-3xl); font-weight: var(--font-weight-black); margin: 0 0 var(--space-1); }
    .page-header p { color: var(--color-text-secondary); font-size: var(--font-size-base); }
    .categories-table-card { padding: var(--space-6) var(--space-8); border-radius: var(--radius-2xl); }
    .table-responsive { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
    .admin-table th { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); color: var(--color-text-muted); font-size: 11px; text-transform: uppercase; text-align: left; }
    .admin-table td { padding: var(--space-4); border-bottom: 1px solid var(--color-border-subtle); vertical-align: middle; }
    .cat-icon { font-size: 1.5rem; }
  `]
})
export class AdminCategoriesComponent {
  categories = signal([
    { icon: '🎬', name: 'Reels & TikTok', slug: 'reels-tiktok', specs: '9:16 Vertical • 4K 60fps', count: 18 },
    { icon: '📱', name: 'UGC Content', slug: 'ugc-content', specs: 'Smartphone Selfie/Front Camera • Natural Tone', count: 24 },
    { icon: '📦', name: 'Product Photography', slug: 'product-photography', specs: 'Macro Lens • 5x Optical Telephoto', count: 14 },
    { icon: '🍽️', name: 'Food & Restaurants', slug: 'food-restaurants', specs: '4K Cinematic 24fps • Warm Grading', count: 12 },
    { icon: '🏠', name: 'Real Estate Tours', slug: 'real-estate', specs: '0.5x Ultra-Wide • Gimbal 3-Axis', count: 9 },
    { icon: '👗', name: 'Fashion & Lookbooks', slug: 'fashion-apparel', specs: 'Portraits • Natural Daylight', count: 15 }
  ]);
}
