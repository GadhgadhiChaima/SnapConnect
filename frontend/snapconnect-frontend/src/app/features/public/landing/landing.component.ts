import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CreatorCardComponent } from '../../../shared/components/creator-card/creator-card.component';
import { ServiceCardComponent } from '../../../shared/components/service-card/service-card.component';
import { JobCardComponent } from '../../../shared/components/job-card/job-card.component';
import { CategoryCardComponent } from '../../../shared/components/category-card/category-card.component';
import { CategoryService, PLATFORM_CATEGORIES } from '../../../core/services/category.service';
import { CreatorProfile } from '../../../core/models/creator.model';
import { Service } from '../../../core/models/service.model';
import { Job } from '../../../core/models/job.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    NavbarComponent,
    FooterComponent,
    CreatorCardComponent,
    ServiceCardComponent,
    JobCardComponent,
    CategoryCardComponent
  ],
  template: `
    <app-navbar></app-navbar>

    <main class="landing-page">
      <!-- ══════════════════════════════════════════════════════
           HERO SECTION
           ══════════════════════════════════════════════════════ -->
      <section class="hero-section">
        <div class="hero-glow"></div>
        <div class="container hero-container">
          <!-- Left Content -->
          <div class="hero-content animate-fade-in">
            <div class="pill-badge">
              <span class="pulse-dot"></span>
              <span>The #1 Mobile Smartphone Creators Marketplace</span>
            </div>

            <h1 class="hero-title">
              Professional Photo & Video.
              <span class="text-gradient">Shot 100% on Smartphone.</span>
            </h1>

            <p class="hero-subtitle">
              Connect with vetted mobile videographers and photographers. High-converting TikToks, 4K Reels, UGC, and product content produced natively for social media at a fraction of traditional production costs.
            </p>

            <!-- Search Widget with Switcher -->
            <div class="hero-search-box card-glass">
              <div class="search-tabs">
                <button
                  class="search-tab"
                  [class.active]="activeSearchTab() === 'CREATORS'"
                  (click)="activeSearchTab.set('CREATORS')">
                  👥 Creators
                </button>
                <button
                  class="search-tab"
                  [class.active]="activeSearchTab() === 'SERVICES'"
                  (click)="activeSearchTab.set('SERVICES')">
                  ⚡ Services
                </button>
                <button
                  class="search-tab"
                  [class.active]="activeSearchTab() === 'JOBS'"
                  (click)="activeSearchTab.set('JOBS')">
                  💼 Jobs
                </button>
              </div>

              <div class="search-input-row">
                <div class="input-with-icon">
                  <span class="search-icon">🔍</span>
                  <input
                    type="text"
                    [(ngModel)]="searchQuery"
                    (keyup.enter)="executeHeroSearch()"
                    [placeholder]="getSearchPlaceholder()"
                    class="hero-input"
                  />
                </div>
                <button (click)="executeHeroSearch()" class="btn btn-primary btn-md search-btn">
                  Search Now
                </button>
              </div>

              <!-- Quick tags -->
              <div class="popular-searches">
                <span class="popular-label">Popular:</span>
                <button (click)="quickSearch('TikTok Reels')" class="chip">🎬 TikTok Reels</button>
                <button (click)="quickSearch('iPhone 16 Pro')" class="chip">📱 iPhone 16 Pro</button>
                <button (click)="quickSearch('UGC Ads')" class="chip">🔥 UGC Ads</button>
                <button (click)="quickSearch('Food & Resto')" class="chip">🍽️ Food & Resto</button>
              </div>
            </div>

            <!-- Stats strip -->
            <div class="hero-stats">
              <div class="stat-item">
                <span class="stat-num">2,400+</span>
                <span class="stat-lbl">Vetted Mobile Creators</span>
              </div>
              <div class="stat-sep"></div>
              <div class="stat-item">
                <span class="stat-num">4.9 ★</span>
                <span class="stat-lbl">Average Rating</span>
              </div>
              <div class="stat-sep"></div>
              <div class="stat-item">
                <span class="stat-num">24h - 48h</span>
                <span class="stat-lbl">Avg. Turnaround</span>
              </div>
            </div>
          </div>

          <!-- Right Showcase Hero Visual -->
          <div class="hero-visual animate-slide-in">
            <div class="phone-mockup-wrapper">
              <!-- Smartphone Frame Mockup -->
              <div class="phone-mockup">
                <div class="phone-notch"></div>
                <div class="phone-screen">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                    alt="Smartphone creator sample"
                    class="screen-media"
                  />
                  <div class="screen-overlay">
                    <div class="screen-top-badge">
                      <span class="rec-dot"></span> 4K 60fps ProRes
                    </div>
                    <div class="screen-bottom-info">
                      <p class="sample-title">Fashion Lookbook • iPhone 15 Pro</p>
                      <p class="sample-creator">By Alex Rivera • ⭐ 5.0 (42)</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Floating badge 1 -->
              <div class="floating-badge badge-left card-glass">
                <div class="fb-icon">⚡</div>
                <div class="fb-text">
                  <strong>70% Faster</strong>
                  <span>Delivered in 48h</span>
                </div>
              </div>

              <!-- Floating badge 2 -->
              <div class="floating-badge badge-right card-glass">
                <div class="fb-icon">💰</div>
                <div class="fb-text">
                  <strong>Escrow Protected</strong>
                  <span>100% Secure Payments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════
           POPULAR CATEGORIES
           ══════════════════════════════════════════════════════ -->
      <section class="section categories-section">
        <div class="container">
          <div class="section-header">
            <span class="badge badge-primary">Mobile Content Specialties</span>
            <h2>Explore by Category</h2>
            <p>Every style of smartphone photo and video tailored for your brand's digital presence.</p>
          </div>

          <div class="categories-grid">
            @for (cat of categories; track cat.id) {
              <app-category-card [category]="cat"></app-category-card>
            }
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════
           WHY SMARTPHONE CONTENT (Comparison)
           ══════════════════════════════════════════════════════ -->
      <section class="section comparison-section">
        <div class="container">
          <div class="section-header">
            <span class="badge badge-accent">The Mobile Advantage</span>
            <h2>Why Choose Smartphone Content?</h2>
            <p>Modern social media algorithms favor native, authentic mobile formats over heavy studio productions.</p>
          </div>

          <div class="comparison-grid">
            <div class="comp-card old card">
              <div class="comp-header">
                <h3>Traditional Production Agency</h3>
                <span class="comp-tag bad">Heavy & Costly</span>
              </div>
              <ul class="comp-list">
                <li><span class="x-mark">✕</span> Expensive heavy DSLR rigs ($3,000+ per day)</li>
                <li><span class="x-mark">✕</span> 2-4 weeks editing & revision turnaround</li>
                <li><span class="x-mark">✕</span> Feels like a sterile TV commercial (low engagement)</li>
                <li><span class="x-mark">✕</span> Complex contracts and licensing headaches</li>
              </ul>
            </div>

            <div class="comp-card new card-glass">
              <div class="comp-header">
                <h3>SnapConnect Mobile Creators</h3>
                <span class="comp-tag good">Native & High-ROI</span>
              </div>
              <ul class="comp-list">
                <li><span class="check-mark">✓</span> Affordable mobile rates (from $35/hr or $50/pkg)</li>
                <li><span class="check-mark">✓</span> Lightning-fast 24h-48h delivery to catch trends</li>
                <li><span class="check-mark">✓</span> 9:16 vertical 4K HDR ProRes native format</li>
                <li><span class="check-mark">✓</span> 3x higher TikTok & Reels conversion rate</li>
                <li><span class="check-mark">✓</span> Milestone escrow protection & gear verification</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════
           FEATURED MOBILE CREATORS
           ══════════════════════════════════════════════════════ -->
      <section class="section creators-section">
        <div class="container">
          <div class="section-header-row">
            <div>
              <span class="badge badge-primary">Top Talent</span>
              <h2>Featured Mobile Creators</h2>
              <p>Verified mobile videographers and photographers ready to shoot your brief.</p>
            </div>
            <a routerLink="/creators" class="btn btn-outline">View All Creators →</a>
          </div>

          <div class="cards-grid">
            @for (c of featuredCreators; track c.id) {
              <app-creator-card [creator]="c"></app-creator-card>
            }
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════
           POPULAR SERVICES (Model B Showcase)
           ══════════════════════════════════════════════════════ -->
      <section class="section services-section">
        <div class="container">
          <div class="section-header-row">
            <div>
              <span class="badge badge-accent">Ready-to-Order</span>
              <h2>Trending Mobile Packages</h2>
              <p>Fixed-price smartphone services with guaranteed delivery dates and clear deliverables.</p>
            </div>
            <a routerLink="/services" class="btn btn-outline">Explore All Services →</a>
          </div>

          <div class="cards-grid">
            @for (s of featuredServices; track s.id) {
              <app-service-card [service]="s"></app-service-card>
            }
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════
           OPEN CLIENT JOBS (Model A Showcase)
           ══════════════════════════════════════════════════════ -->
      <section class="section jobs-section">
        <div class="container">
          <div class="section-header-row">
            <div>
              <span class="badge badge-gold">Active Briefs</span>
              <h2>Latest Mobile Opportunities</h2>
              <p>Businesses looking for mobile shooters for restaurant shoots, events, and brand campaigns.</p>
            </div>
            <a routerLink="/jobs" class="btn btn-outline">Browse Job Board →</a>
          </div>

          <div class="cards-grid">
            @for (j of recentJobs; track j.id) {
              <app-job-card [job]="j"></app-job-card>
            }
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════
           CALL TO ACTION BANNER
           ══════════════════════════════════════════════════════ -->
      <section class="section cta-section">
        <div class="container">
          <div class="cta-card card-glass">
            <div class="cta-glow"></div>
            <div class="cta-content">
              <h2>Ready to Level Up Your Visual Content?</h2>
              <p>Join thousands of brands getting authentic, high-converting smartphone photos and videos created daily.</p>
              <div class="cta-actions">
                <a routerLink="/client/jobs/create" class="btn btn-primary btn-lg">
                  Post a Mobile Brief
                </a>
                <a routerLink="/auth/register" class="btn btn-outline btn-lg">
                  Become a Creator
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    /* ─── Hero Section ─── */
    .hero-section {
      position: relative;
      padding-top: calc(var(--navbar-height) + var(--space-12));
      padding-bottom: var(--space-20);
      overflow: hidden;
    }

    .hero-glow {
      position: absolute;
      top: 10%;
      left: 50%;
      transform: translateX(-50%);
      width: 700px;
      height: 500px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, rgba(236, 72, 153, 0.1) 40%, transparent 70%);
      filter: blur(80px);
      z-index: -1;
      pointer-events: none;
    }

    .hero-container {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: var(--space-12);
      align-items: center;
    }

    .hero-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .pill-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-4);
      background: rgba(139, 92, 246, 0.12);
      border: 1px solid rgba(139, 92, 246, 0.35);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-primary-300);
      width: fit-content;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-accent-500);
      box-shadow: 0 0 10px var(--color-accent-500);
      animation: pulse 2s infinite;
    }

    .hero-title {
      font-size: clamp(2.2rem, 4.5vw, 3.8rem);
      font-weight: var(--font-weight-black);
      line-height: 1.15;
      letter-spacing: -0.03em;
      color: var(--color-text-primary);
    }

    .hero-subtitle {
      font-size: var(--font-size-lg);
      color: var(--color-text-secondary);
      line-height: var(--line-height-relaxed);
      max-width: 620px;
    }

    /* ─── Search Widget ─── */
    .hero-search-box {
      padding: var(--space-5);
      border-radius: var(--radius-xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      box-shadow: var(--shadow-xl);
    }

    .search-tabs {
      display: flex;
      gap: var(--space-2);
      background: rgba(15, 23, 42, 0.6);
      padding: 4px;
      border-radius: var(--radius-md);
      width: fit-content;
    }

    .search-tab {
      padding: 6px 14px;
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      background: transparent;
      transition: all var(--transition-fast);
    }

    .search-tab.active {
      background: var(--color-primary-500);
      color: #fff;
      box-shadow: 0 2px 8px var(--color-primary-glow);
    }

    .search-input-row {
      display: flex;
      gap: var(--space-3);
    }

    .input-with-icon {
      position: relative;
      flex-grow: 1;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: var(--space-4);
      font-size: 1rem;
      opacity: 0.6;
      pointer-events: none;
    }

    .hero-input {
      width: 100%;
      padding: 0.85rem 1rem 0.85rem 2.8rem;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-size: var(--font-size-base);
      outline: none;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }

    .hero-input:focus {
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }

    .search-btn {
      flex-shrink: 0;
    }

    .popular-searches {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .popular-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .chip {
      padding: 3px 10px;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--color-border);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .chip:hover {
      background: var(--color-primary-light);
      border-color: var(--color-primary-400);
      color: var(--color-text-primary);
    }

    /* ─── Hero Stats ─── */
    .hero-stats {
      display: flex;
      align-items: center;
      gap: var(--space-6);
      padding-top: var(--space-4);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
    }

    .stat-num {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-black);
      color: var(--color-text-primary);
    }

    .stat-lbl {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .stat-sep {
      width: 1px;
      height: 36px;
      background: var(--color-border);
    }

    /* ─── Hero Visual & Phone Mockup ─── */
    .hero-visual {
      display: flex;
      justify-content: center;
      position: relative;
    }

    .phone-mockup-wrapper {
      position: relative;
      width: 320px;
    }

    .phone-mockup {
      width: 300px;
      height: 580px;
      background: #000;
      border: 10px solid #2d3748;
      border-radius: 44px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7), 0 0 35px var(--color-primary-glow);
    }

    .phone-notch {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 90px;
      height: 22px;
      background: #000;
      border-radius: 12px;
      z-index: 10;
    }

    .phone-screen {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .screen-media {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .screen-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.85) 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: var(--space-6) var(--space-4) var(--space-5);
    }

    .screen-top-badge {
      align-self: flex-end;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 12px;
    }

    .rec-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--color-error);
      animation: pulse 1.5s infinite;
    }

    .screen-bottom-info {
      color: #fff;
    }

    .sample-title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
      margin-bottom: 2px;
    }

    .sample-creator {
      font-size: var(--font-size-xs);
      opacity: 0.8;
    }

    .floating-badge {
      position: absolute;
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      z-index: 15;
    }

    .badge-left {
      bottom: 60px;
      left: -40px;
    }

    .badge-right {
      top: 100px;
      right: -35px;
    }

    .fb-icon {
      font-size: 1.5rem;
    }

    .fb-text {
      display: flex;
      flex-direction: column;
    }

    .fb-text strong {
      font-size: var(--font-size-xs);
      color: var(--color-text-primary);
    }

    .fb-text span {
      font-size: 10px;
      color: var(--color-text-muted);
    }

    /* ─── Categories Section ─── */
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-4);
    }

    /* ─── Comparison Section ─── */
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      gap: var(--space-8);
      max-width: 960px;
      margin: 0 auto;
    }

    .comp-card {
      padding: var(--space-8);
      border-radius: var(--radius-xl);
    }

    .comp-card.new {
      border-color: var(--color-primary-500);
      box-shadow: 0 0 40px var(--color-primary-glow);
    }

    .comp-header {
      margin-bottom: var(--space-6);
    }

    .comp-header h3 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-2);
    }

    .comp-tag {
      display: inline-block;
      padding: 2px 10px;
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
    }

    .comp-tag.bad {
      background: rgba(239, 68, 68, 0.15);
      color: var(--color-error);
    }

    .comp-tag.good {
      background: var(--color-success-light);
      color: var(--color-success);
    }

    .comp-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .comp-list li {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      font-size: var(--font-size-sm);
      line-height: var(--line-height-normal);
      color: var(--color-text-secondary);
    }

    .x-mark {
      color: var(--color-error);
      font-weight: bold;
      font-size: 1.1rem;
    }

    .check-mark {
      color: var(--color-success);
      font-weight: bold;
      font-size: 1.1rem;
    }

    /* ─── Section Header Row (with "View All" link) ─── */
    .section-header-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--space-4);
      margin-bottom: var(--space-8);
      flex-wrap: wrap;
    }

    .section-header-row h2 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-extrabold);
      margin: var(--space-2) 0;
    }

    .section-header-row p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
    }

    /* ─── Cards Grid ─── */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-6);
    }

    /* ─── CTA Banner ─── */
    .cta-section {
      padding-bottom: var(--space-24);
    }

    .cta-card {
      position: relative;
      padding: var(--space-16) var(--space-8);
      border-radius: var(--radius-2xl);
      text-align: center;
      overflow: hidden;
      border-color: rgba(139, 92, 246, 0.4);
    }

    .cta-glow {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, rgba(139, 92, 246, 0.25) 0%, rgba(236, 72, 153, 0.15) 50%, transparent 80%);
      pointer-events: none;
    }

    .cta-content {
      position: relative;
      max-width: 680px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-5);
    }

    .cta-content h2 {
      font-size: var(--font-size-4xl);
      font-weight: var(--font-weight-black);
      line-height: var(--line-height-tight);
    }

    .cta-content p {
      font-size: var(--font-size-lg);
      color: var(--color-text-secondary);
    }

    .cta-actions {
      display: flex;
      gap: var(--space-4);
      flex-wrap: wrap;
      justify-content: center;
      margin-top: var(--space-4);
    }

    /* ─── Responsive Media Queries ─── */
    @media (max-width: 1024px) {
      .hero-container {
        grid-template-columns: 1fr;
        text-align: center;
      }
      .hero-content {
        align-items: center;
      }
      .hero-stats {
        justify-content: center;
      }
      .hero-visual {
        margin-top: var(--space-8);
      }
      .comparison-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .search-input-row {
        flex-direction: column;
      }
      .search-btn {
        width: 100%;
      }
      .floating-badge {
        display: none;
      }
      .hero-stats {
        flex-direction: column;
        gap: var(--space-3);
      }
      .stat-sep {
        display: none;
      }
    }
  `]
})
export class LandingComponent {
  private router = inject(Router);

  activeSearchTab = signal<'CREATORS' | 'SERVICES' | 'JOBS'>('CREATORS');
  searchQuery = '';

  categories = PLATFORM_CATEGORIES.slice(0, 8);

  /* Sample Featured Creators with Real Smartphone Gear */
  featuredCreators: CreatorProfile[] = [
    {
      id: 'cr-1',
      userId: 'u-1',
      fullName: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      title: 'TikTok & Reels Viral Specialist',
      bio: 'Mobile videographer with 400K+ views on client TikToks. Specializing in fast-paced cuts, trendy transitions, and hook psychology.',
      location: 'Paris, France',
      hourlyRate: 45,
      rating: 4.95,
      reviewsCount: 38,
      completedProjectsCount: 47,
      availabilityStatus: 'AVAILABLE',
      isVerified: true,
      specializations: ['Reels & TikTok', 'UGC Content', 'Fashion'],
      equipment: {
        smartphoneModel: 'iPhone 16 Pro Max',
        gimbal: 'DJI Osmo Mobile 6',
        audioGear: 'Rode Wireless Pro',
        lighting: 'Aputure Amaran MC'
      }
    },
    {
      id: 'cr-2',
      userId: 'u-2',
      fullName: 'Marc Dupont',
      email: 'marc.d@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      title: 'Food & Restaurant Mobile Storyteller',
      bio: 'Creating mouthwatering 4K 60fps reels for upscale bistros and cafes. Shot on Samsung Galaxy S24 Ultra with macro lenses.',
      location: 'Lyon, France',
      hourlyRate: 50,
      rating: 5.0,
      reviewsCount: 29,
      completedProjectsCount: 34,
      availabilityStatus: 'AVAILABLE',
      isVerified: true,
      specializations: ['Food & Restaurant', 'Product Photo', 'Promo Video'],
      equipment: {
        smartphoneModel: 'Samsung Galaxy S24 Ultra',
        gimbal: 'Zhiyun Smooth 5S',
        audioGear: 'DJI Mic 2',
        lighting: 'Godox LED'
      }
    },
    {
      id: 'cr-3',
      userId: 'u-3',
      fullName: 'Elena Rostova',
      email: 'elena.r@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      title: 'Real Estate & Interior Mobile Tours',
      bio: 'Ultra-wide smooth architectural walk-throughs using gimbal stabilization and HDR bracketed smartphone capture.',
      location: 'Nice, France',
      hourlyRate: 60,
      rating: 4.88,
      reviewsCount: 22,
      completedProjectsCount: 28,
      availabilityStatus: 'AVAILABLE',
      isVerified: true,
      specializations: ['Real Estate', 'Commercials', 'Events'],
      equipment: {
        smartphoneModel: 'iPhone 15 Pro Max',
        gimbal: 'Insta360 Flow',
        audioGear: 'Hollyland Lark M2'
      }
    }
  ];

  /* Sample Trending Services (Model B) */
  featuredServices: Service[] = [
    {
      id: 'srv-1',
      creatorId: 'cr-1',
      creatorName: 'Sarah Jenkins',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      title: '3 Viral UGC TikToks shot on iPhone 16 Pro with Voiceover',
      description: 'I will write the script, shoot 4K vertical footage on iPhone 16 Pro Max, add trending captions and deliver in 48h.',
      categoryName: 'Reels & TikTok',
      rating: 5.0,
      reviewsCount: 31,
      status: 'ACTIVE',
      mediaGallery: [
        {
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
          mediaType: 'IMAGE'
        }
      ],
      packages: [
        {
          tier: 'BASIC',
          title: 'Starter UGC Reel',
          description: '1 vertical video (15-30s), hook testing, color graded',
          price: 75,
          deliveryDays: 2,
          revisionsIncluded: 2,
          deliverables: ['1x 4K Video', 'Subtitles/Captions', 'Hook variations']
        }
      ]
    },
    {
      id: 'srv-2',
      creatorId: 'cr-2',
      creatorName: 'Marc Dupont',
      creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      title: 'Restaurant Menu Refresh — 15 High-End Smartphone Photos + 2 Reels',
      description: 'Full on-site mobile photo & video session for restaurants and cafes. High-resolution food macro photography.',
      categoryName: 'Food & Restaurant',
      rating: 4.9,
      reviewsCount: 18,
      status: 'ACTIVE',
      mediaGallery: [
        {
          url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
          mediaType: 'IMAGE'
        }
      ],
      packages: [
        {
          tier: 'STANDARD',
          title: 'Full Resto Package',
          description: '15 edited photos + 2 reels with background royalty-free music',
          price: 180,
          deliveryDays: 3,
          revisionsIncluded: 3,
          deliverables: ['15 Retouched Photos', '2 Instagram Reels', 'Commercial Rights']
        }
      ]
    },
    {
      id: 'srv-3',
      creatorId: 'cr-3',
      creatorName: 'Elena Rostova',
      creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      title: 'Luxury Property Video Tour — Smooth Gimbal 4K 60fps',
      description: 'Highlight your Airbnb or real estate listing with an immersive mobile walkthrough with smooth gimbal moves.',
      categoryName: 'Real Estate',
      rating: 4.95,
      reviewsCount: 15,
      status: 'ACTIVE',
      mediaGallery: [
        {
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
          mediaType: 'IMAGE'
        }
      ],
      packages: [
        {
          tier: 'BASIC',
          title: 'Property Tour Highlight',
          description: '60s cinematic walkthrough with text callouts of room dimensions',
          price: 120,
          deliveryDays: 2,
          revisionsIncluded: 2,
          deliverables: ['1x 60s Tour Video', 'Color Grade', 'Speed Ramps']
        }
      ]
    }
  ];

  /* Sample Active Jobs (Model A) */
  recentJobs: Job[] = [
    {
      id: 'jb-1',
      clientId: 'cl-1',
      clientName: 'Bloom Cosmetics',
      categoryName: 'Product Photography',
      title: 'Need 10 Aesthetic Product Photos & 3 Unboxing Reels (iPhone 15/16)',
      description: 'Looking for a female mobile creator to shoot aesthetic unboxing and texture application shots for our new skincare line.',
      budgetType: 'FIXED',
      budgetAmount: 250,
      location: 'Remote (Products shipped to you)',
      isRemote: true,
      requiredGear: 'iPhone 15/16 Pro with Ring Light',
      requiredSkills: ['Skincare UGC', 'Unboxing', 'Aesthetic Lighting'],
      proposalsCount: 7,
      status: 'OPEN',
      postedDate: new Date().toISOString()
    },
    {
      id: 'jb-2',
      clientId: 'cl-2',
      clientName: 'Le Bistro Gourmet',
      categoryName: 'Food & Restaurant',
      title: 'Evening Dinner Service & Chef Prep Mobile Videographer',
      description: 'Need a creator on-site for 2 hours on Friday evening to capture sizzling dishes, cocktail pours, and ambient restaurant vibes.',
      budgetType: 'HOURLY',
      budgetMin: 40,
      budgetMax: 65,
      location: 'Paris (11e Arrondissement)',
      isRemote: false,
      requiredGear: 'Gimbal + Smartphone 4K 60fps',
      requiredSkills: ['Food Videography', 'Low Light Mobile', 'Speed Ramping'],
      proposalsCount: 4,
      status: 'OPEN',
      postedDate: new Date().toISOString()
    },
    {
      id: 'jb-3',
      clientId: 'cl-3',
      clientName: 'Urban Sneaker Vault',
      categoryName: 'Reels & TikTok',
      title: 'Streetwear Sneaker Drop Content — 5 Quick Hit TikToks',
      description: 'Looking for a mobile shooter with sneaker culture knowledge to create dynamic on-foot reels and transition videos.',
      budgetType: 'FIXED',
      budgetAmount: 300,
      location: 'Lyon, France',
      isRemote: false,
      requiredGear: 'iPhone / Galaxy Ultra with Wide Angle',
      requiredSkills: ['Sneaker Transitions', 'Fast Motion', 'Trending Audio'],
      proposalsCount: 9,
      status: 'OPEN',
      postedDate: new Date().toISOString()
    }
  ];

  getSearchPlaceholder(): string {
    const tab = this.activeSearchTab();
    if (tab === 'CREATORS') return 'Search creators by smartphone model, city, skill (e.g. iPhone 16 Pro, Paris)...';
    if (tab === 'SERVICES') return 'Search mobile packages (e.g. TikTok unboxing, Restaurant reel)...';
    return 'Search jobs by keyword, budget, or location...';
  }

  executeHeroSearch(): void {
    const tab = this.activeSearchTab();
    const q   = this.searchQuery.trim();

    if (tab === 'CREATORS') {
      this.router.navigate(['/creators'], { queryParams: q ? { query: q } : {} });
    } else if (tab === 'SERVICES') {
      this.router.navigate(['/services'], { queryParams: q ? { query: q } : {} });
    } else {
      this.router.navigate(['/jobs'], { queryParams: q ? { query: q } : {} });
    }
  }

  quickSearch(query: string): void {
    this.searchQuery = query;
    this.executeHeroSearch();
  }
}
