import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { RatingStarsComponent } from '../../../../shared/components/rating-stars/rating-stars.component';
import { MediaModalComponent } from '../../../../shared/components/media-modal/media-modal.component';
import { ServiceCardComponent } from '../../../../shared/components/service-card/service-card.component';
import { RecommendationMatchComponent } from '../../../../shared/components/recommendation-match/recommendation-match.component';
import { CreatorBadgeComponent } from '../../../../shared/components/creator-badge/creator-badge.component';
import { CreatorProfile } from '../../../../core/models/creator.model';
import { PortfolioItem } from '../../../../core/models/portfolio.model';
import { Service } from '../../../../core/models/service.model';

@Component({
  selector: 'app-creator-profile',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    NavbarComponent,
    FooterComponent,
    RatingStarsComponent,
    MediaModalComponent,
    ServiceCardComponent,
    RecommendationMatchComponent,
    CreatorBadgeComponent
  ],
  template: `
    <app-navbar></app-navbar>

    @if (creator(); as c) {
      <main class="creator-profile-page">
        <div class="container">
          <!-- Profile Banner / Header -->
          <div class="profile-header-card card-glass animate-fade-in">
            <div class="header-main">
              <div class="avatar-col">
                <img
                  [src]="c.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'"
                  [alt]="c.fullName"
                  class="profile-avatar avatar-2xl"
                />
                @if (c.isVerified) {
                  <span class="verified-badge-large" title="Verified Smartphone Creator">✓</span>
                }
              </div>

              <div class="info-col">
                <div class="name-status-row">
                  <h1>{{ c.fullName }}</h1>
                  <span class="badge badge-success">● Available for Shoots</span>
                </div>

                <p class="creator-title">{{ c.title }}</p>

                <div class="meta-pills">
                  <span class="meta-pill">📍 {{ c.location }}</span>
                  <span class="meta-pill">⚡ {{ c.responseTimeHours || 1 }}h avg. response</span>
                  <span class="meta-pill">🚀 {{ c.completedProjectsCount }} Projects Done</span>
                </div>

                <div class="rating-strip">
                  <app-rating-stars [rating]="c.rating" [reviewsCount]="c.reviewsCount"></app-rating-stars>
                </div>
              </div>
            </div>

            <!-- Action column (Pricing & Hire button) -->
            <div class="header-actions">
              <div class="rate-card">
                <span class="rate-label">Hourly Rate</span>
                <span class="rate-amount">\${{ c.hourlyRate || 45 }}<span class="rate-unit">/hr</span></span>
              </div>
              <a routerLink="/client/jobs/create" class="btn btn-primary btn-lg hire-btn">
                💼 Hire for a Job
              </a>
              <button (click)="openContactModal()" class="btn btn-outline btn-md">
                💬 Send Message
              </button>
            </div>
          </div>

          <!-- Main Layout Grid (Content + Equipment Sidebar) -->
          <div class="profile-layout">
            <!-- Left: Tabs & Content -->
            <div class="profile-content">
              <!-- Navigation Tabs -->
              <div class="tab-bar">
                <button
                  class="tab-btn"
                  [class.active]="activeTab() === 'PORTFOLIO'"
                  (click)="activeTab.set('PORTFOLIO')">
                  🖼️ Portfolio Gallery ({{ portfolioItems.length }})
                </button>
                <button
                  class="tab-btn"
                  [class.active]="activeTab() === 'SERVICES'"
                  (click)="activeTab.set('SERVICES')">
                  ⚡ Mobile Packages ({{ services.length }})
                </button>
                <button
                  class="tab-btn"
                  [class.active]="activeTab() === 'ABOUT'"
                  (click)="activeTab.set('ABOUT')">
                  ℹ️ About & Skills
                </button>
                <button
                  class="tab-btn"
                  [class.active]="activeTab() === 'REVIEWS'"
                  (click)="activeTab.set('REVIEWS')">
                  ⭐ Client Reviews ({{ c.reviewsCount }})
                </button>
              </div>

              <!-- Tab Content: Portfolio -->
              @if (activeTab() === 'PORTFOLIO') {
                <div class="tab-section animate-fade-in">
                  <div class="portfolio-grid">
                    @for (item of portfolioItems; track item.id) {
                      <div class="portfolio-card card-glass" (click)="selectedMedia.set(item)">
                        <div class="portfolio-media-wrap">
                          <img [src]="item.thumbnailUrl || item.mediaUrl" [alt]="item.title" class="port-img" />
                          <div class="media-type-badge">
                            {{ item.mediaType === 'VIDEO' ? '▶ Video' : '📷 Photo' }}
                          </div>
                        </div>
                        <div class="portfolio-info">
                          <h4>{{ item.title }}</h4>
                          @if (item.equipmentUsed) {
                            <span class="gear-sub">📱 {{ item.equipmentUsed }}</span>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Tab Content: Services -->
              @if (activeTab() === 'SERVICES') {
                <div class="tab-section animate-fade-in">
                  <div class="services-grid">
                    @for (s of services; track s.id) {
                      <app-service-card [service]="s"></app-service-card>
                    }
                  </div>
                </div>
              }

              <!-- Tab Content: About -->
              @if (activeTab() === 'ABOUT') {
                <div class="tab-section animate-fade-in card-glass about-card">
                  <h3>About {{ c.fullName }}</h3>
                  <p class="bio-full">{{ c.bio }}</p>

                  <h4 class="sub-h">Specializations</h4>
                  <div class="tags-wrap">
                    @for (spec of c.specializations; track spec) {
                      <span class="badge badge-primary">{{ spec }}</span>
                    }
                  </div>
                </div>
              }

              <!-- Tab Content: Reviews -->
              @if (activeTab() === 'REVIEWS') {
                <div class="tab-section animate-fade-in reviews-list">
                  @for (rev of sampleReviews; track rev.id) {
                    <div class="review-card card-glass">
                      <div class="rev-header">
                        <div class="rev-author">
                          <span class="rev-avatar">👤</span>
                          <div>
                            <strong>{{ rev.authorName }}</strong>
                            <span class="rev-date">{{ rev.date }}</span>
                          </div>
                        </div>
                        <app-rating-stars [rating]="rev.rating"></app-rating-stars>
                      </div>
                      <p class="rev-comment">{{ rev.comment }}</p>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Right: Equipment Sidebar & AI Recommendation Match -->
            <aside class="profile-sidebar">
              <!-- Smart Match Widget -->
              <app-recommendation-match
                [score]="98"
                [reasons]="[
                  'Hardware match: ' + (c.equipment?.smartphoneModel || 'iPhone 16 Pro Max 4K ProRes'),
                  'Category expert with 4.95+ average rating in Reels & TikTok',
                  'Fast delivery turnaround (avg. 48h)'
                ]"
              ></app-recommendation-match>

              <!-- Verified Mobile Studio Hardware -->
              <div class="equipment-card card-glass">
                <div class="eq-head flex-between">
                  <h3>📱 Mobile Gear Rig</h3>
                  <span class="badge badge-primary">Verified Setup</span>
                </div>
                <p class="eq-desc">Verified hardware used to produce 4K HDR deliverables.</p>

                <div class="eq-list">
                  <div class="eq-item">
                    <span class="eq-label">Primary Smartphone:</span>
                    <strong class="eq-val">{{ c.equipment?.smartphoneModel || 'iPhone 16 Pro Max' }}</strong>
                  </div>

                  @if (c.equipment?.gimbal) {
                    <div class="eq-item">
                      <span class="eq-label">Stabilization:</span>
                      <strong class="eq-val">{{ c.equipment?.gimbal }}</strong>
                    </div>
                  }

                  @if (c.equipment?.audioGear) {
                    <div class="eq-item">
                      <span class="eq-label">Audio & Mics:</span>
                      <strong class="eq-val">{{ c.equipment?.audioGear }}</strong>
                    </div>
                  }

                  @if (c.equipment?.lighting) {
                    <div class="eq-item">
                      <span class="eq-label">Portable Lighting:</span>
                      <strong class="eq-val">{{ c.equipment?.lighting }}</strong>
                    </div>
                  }
                </div>

                <div class="escrow-notice">
                  <span class="shield-icon">🛡️</span>
                  <div>
                    <strong>SnapConnect Escrow Protection</strong>
                    <p>Funds are held safely until you approve final video/photo delivery.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <!-- Lightbox Media Modal -->
      @if (selectedMedia()) {
        <app-media-modal [item]="selectedMedia()" (close)="selectedMedia.set(null)"></app-media-modal>
      }
    }

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .creator-profile-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }

    .profile-header-card {
      padding: var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-8);
      margin-bottom: var(--space-8);
      flex-wrap: wrap;
    }

    .header-main {
      display: flex;
      align-items: center;
      gap: var(--space-6);
      flex-wrap: wrap;
    }

    .avatar-col {
      position: relative;
    }

    .profile-avatar {
      width: 112px;
      height: 112px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--color-primary-500);
      box-shadow: var(--shadow-glow);
    }

    .verified-badge-large {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 28px;
      height: 28px;
      background: var(--color-primary-500);
      color: #fff;
      font-size: 14px;
      font-weight: 900;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid var(--color-bg-surface);
    }

    .info-col {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .name-status-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .name-status-row h1 {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-black);
      margin: 0;
    }

    .creator-title {
      font-size: var(--font-size-base);
      color: var(--color-primary-400);
      font-weight: var(--font-weight-medium);
    }

    .meta-pills {
      display: flex;
      gap: var(--space-3);
      flex-wrap: wrap;
      margin-top: var(--space-1);
    }

    .meta-pill {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      background: rgba(255, 255, 255, 0.05);
      padding: 3px 10px;
      border-radius: var(--radius-full);
      border: 1px solid var(--color-border);
    }

    .header-actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      min-width: 220px;
    }

    .rate-card {
      text-align: center;
      padding: var(--space-2);
      background: rgba(15, 23, 42, 0.5);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
    }

    .rate-label {
      font-size: 10px;
      text-transform: uppercase;
      color: var(--color-text-muted);
      display: block;
    }

    .rate-amount {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-black);
      color: var(--color-text-primary);
    }

    .rate-unit {
      font-size: var(--font-size-xs);
      font-weight: normal;
      color: var(--color-text-muted);
    }

    .profile-layout {
      display: grid;
      grid-template-columns: 2.2fr 1fr;
      gap: var(--space-8);
      align-items: start;
    }

    /* Tab Bar */
    .tab-bar {
      display: flex;
      gap: var(--space-2);
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--space-3);
      margin-bottom: var(--space-6);
      overflow-x: auto;
    }

    .tab-btn {
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      background: transparent;
      white-space: nowrap;
      transition: all var(--transition-fast);
    }

    .tab-btn:hover, .tab-btn.active {
      color: var(--color-text-primary);
      background: rgba(255, 255, 255, 0.06);
    }

    .tab-btn.active {
      color: var(--color-primary-400);
      background: var(--color-primary-light);
    }

    /* Portfolio grid */
    .portfolio-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--space-4);
    }

    .portfolio-card {
      border-radius: var(--radius-lg);
      overflow: hidden;
      cursor: pointer;
      transition: transform var(--transition-base), border-color var(--transition-fast);
    }

    .portfolio-card:hover {
      transform: translateY(-4px);
      border-color: var(--color-primary-500);
    }

    .portfolio-media-wrap {
      position: relative;
      height: 240px;
      background: #000;
    }

    .port-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .media-type-badge {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(6px);
      color: #fff;
      font-size: 10px;
      font-weight: bold;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
    }

    .portfolio-info {
      padding: var(--space-3);
    }

    .portfolio-info h4 {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .gear-sub {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    /* Services grid inside profile */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: var(--space-4);
    }

    /* About section */
    .about-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
    }

    .bio-full {
      font-size: var(--font-size-base);
      color: var(--color-text-secondary);
      line-height: var(--line-height-relaxed);
      margin: var(--space-3) 0 var(--space-6);
    }

    .sub-h {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      margin-bottom: var(--space-3);
    }

    .tags-wrap {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    /* Reviews section */
    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .review-card {
      padding: var(--space-5);
      border-radius: var(--radius-lg);
    }

    .rev-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
    }

    .rev-author {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .rev-avatar {
      font-size: 1.5rem;
    }

    .rev-author strong {
      display: block;
      font-size: var(--font-size-sm);
    }

    .rev-date {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .rev-comment {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: var(--line-height-normal);
    }

    /* Equipment Sidebar */
    .equipment-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      position: sticky;
      top: calc(var(--navbar-height) + var(--space-6));
    }

    .eq-header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .eq-icon {
      font-size: 1.8rem;
    }

    .eq-header h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
    }

    .eq-desc {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .eq-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      padding: var(--space-4);
      background: rgba(15, 23, 42, 0.6);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
    }

    .eq-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .eq-label {
      font-size: 11px;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
    }

    .eq-val {
      font-size: var(--font-size-sm);
      color: var(--color-primary-300);
    }

    .escrow-notice {
      display: flex;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: var(--color-success-light);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: var(--radius-md);
      font-size: var(--font-size-xs);
    }

    .shield-icon {
      font-size: 1.4rem;
    }

    .escrow-notice strong {
      color: var(--color-success);
      display: block;
      margin-bottom: 2px;
    }

    .escrow-notice p {
      color: var(--color-text-secondary);
      margin: 0;
    }

    @media (max-width: 960px) {
      .profile-layout {
        grid-template-columns: 1fr;
      }
      .profile-header-card {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class CreatorProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);

  creator = signal<CreatorProfile | null>(null);
  activeTab = signal<'PORTFOLIO' | 'SERVICES' | 'ABOUT' | 'REVIEWS'>('PORTFOLIO');
  selectedMedia = signal<PortfolioItem | null>(null);

  portfolioItems: PortfolioItem[] = [
    {
      id: 'p-1',
      creatorId: 'cr-1',
      title: 'Neon Streetwear 4K 60fps',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      equipmentUsed: 'iPhone 16 Pro Max • DJI OM 6',
      createdAt: '2026-08-01'
    },
    {
      id: 'p-2',
      creatorId: 'cr-1',
      title: 'Cosmetics Texture Macro',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      equipmentUsed: 'iPhone 16 Pro 5x Telephoto',
      createdAt: '2026-08-05'
    },
    {
      id: 'p-3',
      creatorId: 'cr-1',
      title: 'Coffee Latte Art Pour',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      equipmentUsed: 'iPhone 16 Pro 4K 120fps',
      createdAt: '2026-08-10'
    },
    {
      id: 'p-4',
      creatorId: 'cr-1',
      title: 'Sunset Roof Lookbook',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
      equipmentUsed: 'iPhone 16 Pro ProRes Log',
      createdAt: '2026-08-12'
    }
  ];

  services: Service[] = [
    {
      id: 'srv-1',
      creatorId: 'cr-1',
      creatorName: 'Sarah Jenkins',
      title: '3 Viral UGC TikToks shot on iPhone 16 Pro with Voiceover',
      description: 'I will shoot 4K vertical footage, add trending subtitles and deliver in 48h.',
      categoryName: 'Reels & TikTok',
      rating: 5.0,
      reviewsCount: 31,
      status: 'ACTIVE',
      packages: [{ tier: 'BASIC', title: 'Starter', description: '1x UGC Video', price: 75, deliveryDays: 2, revisionsIncluded: 2, deliverables: ['1x 4K Video'] }]
    }
  ];

  sampleReviews = [
    { id: 'r-1', authorName: 'Alex M. (Bloom Cosmetics)', rating: 5.0, date: '2 days ago', comment: 'Amazing 4K footage! Her iPhone 16 Pro shots look even better than our previous studio DSLR camera crew, and delivered in 36 hours!' },
    { id: 'r-2', authorName: 'Julien T. (Burger Lab)', rating: 5.0, date: '1 week ago', comment: 'Our TikTok engagement blew up 400% after posting her food reels. Highly recommended mobile creator.' }
  ];

  ngOnInit(): void {
    const creatorId = this.route.snapshot.params['id'];
    this.creator.set({
      id: creatorId || 'cr-1',
      userId: 'u-1',
      fullName: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      title: 'TikTok & Reels Viral Specialist',
      bio: 'Professional mobile videographer with 400K+ views on client TikToks. Specializing in fast-paced cuts, trendy transitions, and hook psychology. All content shot natively in 4K 60fps ProRes Log on iPhone 16 Pro Max.',
      location: 'Paris, France',
      hourlyRate: 45,
      rating: 4.95,
      reviewsCount: 38,
      completedProjectsCount: 47,
      availabilityStatus: 'AVAILABLE',
      isVerified: true,
      specializations: ['Reels & TikTok', 'UGC Content', 'Fashion', 'Product Photography'],
      equipment: {
        smartphoneModel: 'iPhone 16 Pro Max (4K ProRes)',
        gimbal: 'DJI Osmo Mobile 6',
        audioGear: 'Rode Wireless Pro 32-bit float',
        lighting: 'Aputure Amaran MC RGB'
      }
    });
  }

  openContactModal(): void {
    alert('Message conversation opened with Sarah Jenkins!');
  }
}
