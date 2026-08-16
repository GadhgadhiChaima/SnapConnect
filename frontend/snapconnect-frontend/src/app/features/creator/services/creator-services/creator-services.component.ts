import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { Service } from '../../../../core/models/service.model';

@Component({
  selector: 'app-creator-services',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="creator-services-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-accent">Creator Studio</span>
            <h1>Manage My Mobile Services</h1>
            <p>Your predefined smartphone video & photo packages available for direct client ordering.</p>
          </div>
          <a routerLink="/creator/services/create" class="btn btn-primary btn-md">
            + Create New Mobile Gig
          </a>
        </div>

        <!-- Services Grid -->
        <div class="services-list">
          @for (s of services(); track s.id) {
            <div class="service-row card-glass animate-fade-in">
              <div class="srv-main">
                <div class="badge-row">
                  <span class="badge badge-accent">{{ s.categoryName }}</span>
                  <span class="badge status-active">● {{ s.status }}</span>
                </div>
                <h3>{{ s.title }}</h3>
                <p>{{ s.description }}</p>

                <div class="packages-chips">
                  @for (pkg of s.packages; track pkg.tier) {
                    <div class="pkg-chip">
                      <span class="tier">{{ pkg.tier }}:</span>
                      <strong>\${{ pkg.price }} USD</strong>
                      <span class="days">({{ pkg.deliveryDays }}d turnaround)</span>
                    </div>
                  }
                </div>
              </div>

              <div class="srv-actions">
                <div class="rating-box">
                  <span class="stars">★ {{ s.rating }}</span>
                  <span class="rev-count">({{ s.reviewsCount }} reviews)</span>
                </div>
                <a [routerLink]="['/services', s.id]" class="btn btn-outline btn-sm">
                  View Public Page 👁️
                </a>
                <button (click)="toggleService(s.id)" class="btn btn-ghost btn-xs text-muted">
                  {{ s.status === 'ACTIVE' ? 'Pause Service ⏸️' : 'Activate ▶️' }}
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .creator-services-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }

    .page-header {
      margin-bottom: var(--space-8);
      flex-wrap: wrap;
      gap: var(--space-4);
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

    .services-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .service-row {
      padding: var(--space-6) var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-6);
      flex-wrap: wrap;
    }

    .srv-main {
      flex: 1;
      min-width: 300px;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .badge-row {
      display: flex;
      gap: var(--space-2);
    }

    .srv-main h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      margin: 0;
    }

    .srv-main p {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: 0;
    }

    .packages-chips {
      display: flex;
      gap: var(--space-3);
      flex-wrap: wrap;
      margin-top: var(--space-1);
    }

    .pkg-chip {
      padding: var(--space-2) var(--space-3);
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-xs);
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .pkg-chip .tier { color: var(--color-primary-300); font-weight: bold; }
    .pkg-chip strong { color: var(--color-text-primary); }
    .pkg-chip .days { color: var(--color-text-muted); font-size: 11px; }

    .srv-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--space-3);
      min-width: 160px;
    }

    .rating-box {
      text-align: right;
    }

    .stars {
      color: #fbbf24;
      font-weight: bold;
      font-size: var(--font-size-sm);
    }

    .rev-count {
      color: var(--color-text-muted);
      font-size: var(--font-size-xs);
      margin-left: 4px;
    }
  `]
})
export class CreatorServicesComponent {
  services = signal<Service[]>([
    {
      id: 'srv-1',
      creatorId: 'cr-1',
      creatorName: 'Sarah Jenkins',
      title: '3 Viral UGC TikToks shot on iPhone 16 Pro with Voiceover',
      description: 'I will shoot 4K vertical footage, add trending subtitles and deliver ready-to-post clips in 48h.',
      categoryName: 'Reels & TikTok',
      rating: 5.0,
      reviewsCount: 31,
      status: 'ACTIVE',
      packages: [
        { tier: 'BASIC', title: 'Starter Clip', description: '1x 4K UGC Video', price: 75, deliveryDays: 2, revisionsIncluded: 1, deliverables: ['1x 4K 60fps Video'] },
        { tier: 'STANDARD', title: 'Viral Pack', description: '3x 4K UGC Videos + Subtitles', price: 180, deliveryDays: 3, revisionsIncluded: 2, deliverables: ['3x 4K Videos', 'Captions'] },
        { tier: 'PREMIUM', title: 'Full Campaign', description: '5x 4K Videos + Hooks', price: 280, deliveryDays: 4, revisionsIncluded: 3, deliverables: ['5x 4K Videos', 'Hook variations', 'Audio mix'] }
      ]
    }
  ]);

  toggleService(id: string): void {
    this.services.update(prev =>
      prev.map(s => (s.id === id ? { ...s, status: s.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : s))
    );
  }
}
