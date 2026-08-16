import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { RatingStarsComponent } from '../../../../shared/components/rating-stars/rating-stars.component';
import { Service, ServicePackage } from '../../../../core/models/service.model';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, FooterComponent, RatingStarsComponent],
  template: `
    <app-navbar></app-navbar>

    @if (service(); as s) {
      <main class="service-detail-page">
        <div class="container">
          <div class="breadcrumb">
            <a routerLink="/services">Services</a>
            <span>/</span>
            <span class="curr">{{ s.categoryName }}</span>
          </div>

          <div class="service-layout">
            <!-- Left Column: Media & Description -->
            <div class="service-main">
              <h1 class="service-title">{{ s.title }}</h1>

              <!-- Creator Strip -->
              <div class="creator-strip card-glass">
                <img
                  [src]="s.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'"
                  [alt]="s.creatorName"
                  class="avatar avatar-md"
                />
                <div>
                  <a [routerLink]="['/creators', s.creatorId]" class="creator-name">{{ s.creatorName }}</a>
                  <app-rating-stars [rating]="s.rating" [reviewsCount]="s.reviewsCount"></app-rating-stars>
                </div>
              </div>

              <!-- Main Media Preview -->
              <div class="media-gallery card-glass">
                <img
                  [src]="s.mediaGallery?.[0]?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80'"
                  [alt]="s.title"
                  class="main-image"
                />
              </div>

              <!-- Description -->
              <div class="desc-card card-glass">
                <h3>About This Mobile Service</h3>
                <p class="desc-text">{{ s.description }}</p>

                <h4>What You'll Get</h4>
                <ul class="deliverables-list">
                  @for (d of selectedPkg().deliverables; track d) {
                    <li><span class="check">✓</span> {{ d }}</li>
                  }
                </ul>
              </div>

              <!-- FAQ Section -->
              <div class="faq-card card-glass">
                <h3>Frequently Asked Questions</h3>
                <div class="faq-item">
                  <strong>What smartphone model do you shoot with?</strong>
                  <p>All videos are captured on iPhone 16 Pro Max in 4K ProRes at 60fps, stabilized with a DJI OM 6 gimbal.</p>
                </div>
                <div class="faq-item">
                  <strong>How do revisions work?</strong>
                  <p>Each package includes {{ selectedPkg().revisionsIncluded }} rounds of revisions. You can request text, music, or cut adjustments via the contract screen.</p>
                </div>
              </div>
            </div>

            <!-- Right Column: Package Pricing Card (Sticky) -->
            <aside class="service-sidebar">
              <div class="pricing-card card-glass">
                <!-- Package Tier Selector -->
                <div class="tier-tabs">
                  @for (pkg of packages; track pkg.tier) {
                    <button
                      class="tier-tab"
                      [class.active]="selectedTier() === pkg.tier"
                      (click)="selectTier(pkg.tier)">
                      {{ pkg.tier }}
                    </button>
                  }
                </div>

                <!-- Package Details -->
                <div class="pkg-header">
                  <div class="pkg-title-price">
                    <h4>{{ selectedPkg().title }}</h4>
                    <span class="pkg-price">\${{ selectedPkg().price }}</span>
                  </div>
                  <p class="pkg-desc">{{ selectedPkg().description }}</p>
                </div>

                <div class="pkg-meta">
                  <div class="meta-row">
                    <span>⚡ Delivery Time:</span>
                    <strong>{{ selectedPkg().deliveryDays }} Days</strong>
                  </div>
                  <div class="meta-row">
                    <span>🔄 Revisions:</span>
                    <strong>{{ selectedPkg().revisionsIncluded }} Included</strong>
                  </div>
                </div>

                <div class="pkg-deliverables">
                  <span class="deliv-title">Included in this tier:</span>
                  @for (item of selectedPkg().deliverables; track item) {
                    <div class="deliv-item">
                      <span class="check">✓</span> {{ item }}
                    </div>
                  }
                </div>

                <button (click)="orderService()" class="btn btn-primary btn-block btn-lg order-btn">
                  Continue (\${{ selectedPkg().price }})
                </button>

                <div class="escrow-badge">
                  <span>🛡️ 100% Escrow Payment Protection</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    }

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .service-detail-page {
      padding-top: calc(var(--navbar-height) + var(--space-6));
      padding-bottom: var(--space-20);
    }

    .breadcrumb {
      display: flex;
      gap: var(--space-2);
      align-items: center;
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-bottom: var(--space-4);
    }

    .breadcrumb a {
      color: var(--color-text-secondary);
      text-decoration: none;
    }

    .breadcrumb .curr {
      color: var(--color-primary-400);
    }

    .service-layout {
      display: grid;
      grid-template-columns: 1.8fr 1fr;
      gap: var(--space-8);
      align-items: start;
    }

    .service-main {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .service-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-extrabold);
      line-height: var(--line-height-tight);
    }

    .creator-strip {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
    }

    .creator-name {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      text-decoration: none;
      display: block;
      margin-bottom: 2px;
    }

    .creator-name:hover {
      color: var(--color-primary-400);
    }

    .media-gallery {
      border-radius: var(--radius-xl);
      overflow: hidden;
      max-height: 440px;
      background: #000;
    }

    .main-image {
      width: 100%;
      height: 100%;
      max-height: 440px;
      object-fit: cover;
    }

    .desc-card, .faq-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
    }

    .desc-card h3, .faq-card h3 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-4);
    }

    .desc-text {
      color: var(--color-text-secondary);
      line-height: var(--line-height-relaxed);
      margin-bottom: var(--space-4);
    }

    .desc-card h4 {
      font-size: var(--font-size-base);
      margin-bottom: var(--space-3);
    }

    .deliverables-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .deliverables-list li, .deliv-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .check {
      color: var(--color-success);
      font-weight: bold;
    }

    .faq-item {
      margin-bottom: var(--space-4);
    }

    .faq-item strong {
      display: block;
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      margin-bottom: 4px;
    }

    .faq-item p {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: var(--line-height-normal);
    }

    /* Sidebar Pricing Card */
    .pricing-card {
      padding: var(--space-6);
      border-radius: var(--radius-2xl);
      position: sticky;
      top: calc(var(--navbar-height) + var(--space-6));
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      border-color: var(--color-primary-500);
      box-shadow: var(--shadow-xl), 0 0 25px var(--color-primary-glow);
    }

    .tier-tabs {
      display: flex;
      background: rgba(15, 23, 42, 0.7);
      padding: 4px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
    }

    .tier-tab {
      flex: 1;
      padding: var(--space-2);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-secondary);
      background: transparent;
      transition: all var(--transition-fast);
    }

    .tier-tab.active {
      background: var(--color-primary-500);
      color: #fff;
      box-shadow: 0 2px 8px var(--color-primary-glow);
    }

    .pkg-title-price {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-2);
    }

    .pkg-title-price h4 {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
    }

    .pkg-price {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      color: var(--color-text-primary);
    }

    .pkg-desc {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .pkg-meta {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      padding: var(--space-3) 0;
      border-top: 1px solid var(--color-border-subtle);
      border-bottom: 1px solid var(--color-border-subtle);
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .meta-row strong {
      color: var(--color-text-primary);
    }

    .deliv-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wider);
      color: var(--color-text-muted);
      display: block;
      margin-bottom: var(--space-2);
    }

    .pkg-deliverables {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .escrow-badge {
      text-align: center;
      font-size: var(--font-size-xs);
      color: var(--color-success);
      font-weight: var(--font-weight-semibold);
    }

    @media (max-width: 900px) {
      .service-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ServiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  service = signal<Service | null>(null);
  selectedTier = signal<'BASIC' | 'STANDARD' | 'PREMIUM'>('BASIC');

  packages: ServicePackage[] = [
    {
      tier: 'BASIC',
      title: 'Starter UGC Reel',
      description: '1 vertical video (15-30s), hook testing, color graded',
      price: 75,
      deliveryDays: 2,
      revisionsIncluded: 2,
      deliverables: ['1x 4K Vertical Video (9:16)', 'Trending Subtitles & Captions', '2 Hook Variations', 'iPhone 16 Pro ProRes']
    },
    {
      tier: 'STANDARD',
      title: 'Growth Pack (3 Reels)',
      description: '3 high-converting TikTok/Reels videos with sound design and voiceover',
      price: 190,
      deliveryDays: 4,
      revisionsIncluded: 3,
      deliverables: ['3x 4K Vertical Videos (9:16)', 'Script Writing & Voiceover', 'Commercial Rights', 'Raw B-Roll Clips Included']
    },
    {
      tier: 'PREMIUM',
      title: 'Full Monthly Viral Retainer',
      description: '8 ready-to-publish reels optimized for TikTok Ads & Organic feed',
      price: 450,
      deliveryDays: 7,
      revisionsIncluded: 5,
      deliverables: ['8x 4K Master Videos', 'A/B Test Hooks (16 hooks total)', 'Custom Sound FX & Motion Graphics', 'Dedicated Slack/WhatsApp comms']
    }
  ];

  selectedPkg = signal<ServicePackage>(this.packages[0]);

  ngOnInit(): void {
    const srvId = this.route.snapshot.params['id'];
    this.service.set({
      id: srvId || 'srv-1',
      creatorId: 'cr-1',
      creatorName: 'Sarah Jenkins',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      title: '3 Viral UGC TikToks shot on iPhone 16 Pro with Voiceover',
      description: 'I produce high-retention TikTok, Reels, and UGC ads shot natively on the iPhone 16 Pro Max in 4K ProRes Log. I handle everything from creative concept, scriptwriting, voiceover, mobile filming with gimbal motion, and dynamic fast-paced editing.',
      categoryName: 'Reels & TikTok',
      rating: 5.0,
      reviewsCount: 31,
      status: 'ACTIVE',
      packages: this.packages,
      mediaGallery: [
        {
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80',
          mediaType: 'IMAGE'
        }
      ]
    });
  }

  selectTier(tier: 'BASIC' | 'STANDARD' | 'PREMIUM'): void {
    this.selectedTier.set(tier);
    const p = this.packages.find(pkg => pkg.tier === tier) || this.packages[0];
    this.selectedPkg.set(p);
  }

  orderService(): void {
    alert(`Order initiated for tier: ${this.selectedPkg().title} ($${this.selectedPkg().price})! Redirecting to contract checkout...`);
    this.router.navigate(['/client/contracts']);
  }
}
