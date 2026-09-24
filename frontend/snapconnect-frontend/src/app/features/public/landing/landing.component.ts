import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CreatorCardComponent } from '../../../shared/components/creator-card/creator-card.component';
import { CategoryCardComponent } from '../../../shared/components/category-card/category-card.component';
import { PLATFORM_CATEGORIES } from '../../../core/services/category.service';
import { CreatorProfile } from '../../../core/models/creator.model';
import { CreatorService } from '../../../core/services/creator.service';
import { AuthService } from '../../../core/services/auth.service';

interface ServicePackage {
  id: string;
  title: string;
  creatorId?: string;
  creatorName: string;
  creatorAvatar: string;
  creatorCity: string;
  price: number;
  deliveryDays: number;
  rating: number;
  reviewsCount: number;
  thumbnailUrl: string;
  badge: string;
  smartphone: string;
}

interface PricingOption {
  id: number;
  name: string;
  description: string;
  priceMin: number;
  priceMax: number;
  typicalDelivery: string;
  deliverables: string[];
}

interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  companyName: string;
  location: string;
  avatarUrl: string;
  type: 'CLIENT' | 'CREATOR';
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    NavbarComponent,
    FooterComponent,
    CreatorCardComponent,
    CategoryCardComponent
  ],
  template: `
    <app-navbar></app-navbar>

    <main class="landing-page">
      <!-- ══════════════════════════════════════════════════════
           1. HERO SECTION (UPWORK-INSPIRED QUALITY)
           ══════════════════════════════════════════════════════ -->
      <section class="hero-section">
        <div class="hero-glow"></div>
        <div class="container hero-container">
          <!-- Left Hero Content -->
          <div class="hero-content animate-fade-in">
            <div class="hero-pill-badge">
              <span class="pulse-dot"></span>
              <span>N°1 Marketplace Créateurs Smartphone en Tunisie</span>
            </div>

            <h1 class="hero-title">
              Boostez vos réseaux sociaux avec les meilleurs
              <span class="text-gradient">créateurs mobiles en Tunisie</span>
            </h1>

            <p class="hero-subtitle">
              Connectez-vous à des vidéastes et photographes smartphone vérifiés à Tunis, Sousse, Sfax et partout en Tunisie. Reels 4K, TikToks, UGC et shootings produits livrés en 48h au juste prix.
            </p>

            <!-- Search Switcher Widget (Upwork Style) -->
            <div class="hero-search-box card-glass">
              <div class="search-tabs">
                <button
                  type="button"
                  class="search-tab"
                  [class.active]="activeSearchTab() === 'CREATORS'"
                  (click)="activeSearchTab.set('CREATORS')">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span>Trouver un créateur</span>
                </button>
                <button
                  type="button"
                  class="search-tab"
                  [class.active]="activeSearchTab() === 'SERVICES'"
                  (click)="activeSearchTab.set('SERVICES')">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  <span>Packages de services</span>
                </button>
                <button
                  type="button"
                  class="search-tab"
                  [class.active]="activeSearchTab() === 'JOBS'"
                  (click)="activeSearchTab.set('JOBS')">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  <span>Briefs & Missions</span>
                </button>
              </div>

              <div class="search-input-row">
                <div class="input-with-icon">
                  <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    [(ngModel)]="searchQuery"
                    (keyup.enter)="executeHeroSearch()"
                    [placeholder]="getSearchPlaceholder()"
                    class="hero-input"
                  />
                </div>
                <button type="button" (click)="executeHeroSearch()" class="btn btn-primary btn-md search-btn">
                  <span>Rechercher</span>
                </button>
              </div>

              <!-- Popular Quick Filter Chips -->
              <div class="popular-searches">
                <span class="popular-label">Recherches fréquentes :</span>
                <button type="button" (click)="quickSearch('Reels TikTok')" class="chip">Reels & TikTok</button>
                <button type="button" (click)="quickSearch('Café & Restaurant')" class="chip">Cafés & Restos</button>
                <button type="button" (click)="quickSearch('Photos Produits')" class="chip">Photos Produits</button>
                <button type="button" (click)="quickSearch('Mode')" class="chip">Mode</button>
                <button type="button" (click)="quickSearch('La Marsa')" class="chip">Tunis • Marsa</button>
                <button type="button" (click)="quickSearch('Sousse')" class="chip">Sousse</button>
              </div>
            </div>

            <!-- Hero Trust Badges Row -->
            <div class="hero-stats">
              <div class="stat-item">
                <span class="stat-num">500+</span>
                <span class="stat-lbl">Créateurs vérifiés en Tunisie</span>
              </div>
              <div class="stat-sep"></div>
              <div class="stat-item">
                <span class="stat-num">4.95 ★</span>
                <span class="stat-lbl">Note moyenne d'évaluation</span>
              </div>
              <div class="stat-sep"></div>
              <div class="stat-item">
                <span class="stat-num">24h - 48h</span>
                <span class="stat-lbl">Délai de livraison express</span>
              </div>
            </div>
          </div>

          <!-- Right Showcase Hero Visual -->
          <div class="hero-visual animate-slide-in">
            <div class="phone-mockup-wrapper">
              <div class="phone-mockup">
                <div class="phone-notch"></div>
                <div class="phone-screen">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                    alt="Créatrice smartphone tunisienne"
                    class="screen-media"
                  />
                  <div class="screen-overlay">
                    <div class="screen-top-badge">
                      <span class="rec-dot"></span> 4K 60fps ProRes Log
                    </div>
                    <div class="screen-bottom-info">
                      <p class="sample-title">Lookbook Streetwear Tunis • iPhone 16 Pro</p>
                      <p class="sample-creator">
                        Par Sarah B. • 
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="1" style="vertical-align: -1px; margin-right: 2px;">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        4.98 (47 avis)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Floating badge Left -->
              <div class="floating-badge badge-left card-glass">
                <div class="fb-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <div class="fb-text">
                  <strong>3x Plus Rapide</strong>
                  <span>Livraison en 24h-48h</span>
                </div>
              </div>

              <!-- Floating badge Right -->
              <div class="floating-badge badge-right card-glass">
                <div class="fb-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div class="fb-text">
                  <strong>Séquestre Bancaire</strong>
                  <span>Paiement 100% protégé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════
           2. SOCIAL PROOF : BUSINESSES IN TUNISIA
           ══════════════════════════════════════════════════════ -->
      <section class="social-proof-section">
        <div class="container">
          <p class="social-proof-title">
            Fait confiance par des centaines de marques, restaurants & boutiques partout en Tunisie
          </p>
          <div class="brand-logos-row">
            <span class="brand-item">Gourmandise Pâtisserie</span>
            <span class="brand-sep">•</span>
            <span class="brand-item">Alyssa Bio Skincare</span>
            <span class="brand-sep">•</span>
            <span class="brand-item">Carthage Concept Store</span>
            <span class="brand-sep">•</span>
            <span class="brand-item">Café Journal La Marsa</span>
            <span class="brand-sep">•</span>
            <span class="brand-item">Médina Craft Tunisia</span>
            <span class="brand-sep">•</span>
            <span class="brand-item">Baya Fashion Sousse</span>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════
           3. POPULAR CATEGORIES (UPWORK 8-CARD GRID)
           ══════════════════════════════════════════════════════ -->
      <section class="section categories-section">
        <div class="container">
          <div class="section-header">
            <span class="badge badge-primary">Spécialités Smartphone</span>
            <h2>Explorez par format & catégorie</h2>
            <p>Des contenus photos et vidéos pensés nativement au format vertical 9:16 pour convertir sur Instagram et TikTok.</p>
          </div>

          <div class="categories-grid">
            @for (cat of platformCategories; track cat.id) {
              <app-category-card [category]="cat"></app-category-card>
            }
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════
           4. HOW IT WORKS (UPWORK-STYLE INTERACTIVE TABS)
           ══════════════════════════════════════════════════════ -->
      <section class="section how-section">
        <div class="container">
          <div class="section-header">
            <span class="badge badge-accent">Simple & Sécurisé</span>
            <h2>Comment fonctionne SnapConnect</h2>
            <p>Une collaboration fluide, rapide et garantie du brief jusqu'à la livraison finale de vos contenus 4K.</p>
          </div>

          <!-- Switcher Tab -->
          <div class="role-switch-container">
            <div class="role-switcher">
              <button
                type="button"
                class="role-switch-btn"
                [class.active]="howItWorksRole() === 'CLIENT'"
                (click)="howItWorksRole.set('CLIENT')"
              >
                Pour les Clients
              </button>
              <button
                type="button"
                class="role-switch-btn"
                [class.active]="howItWorksRole() === 'CREATOR'"
                (click)="howItWorksRole.set('CREATOR')"
              >
                Pour les Créateurs
              </button>
            </div>
          </div>

          <!-- Steps Grid -->
          <div class="steps-grid">
            @if (howItWorksRole() === 'CLIENT') {
              <div class="step-card card-glass">
                <div class="step-num">01</div>
                <div class="step-icon-wrap">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <h3>Publiez votre brief</h3>
                <p>Décrivez vos besoins (Reels, photos de plats, lookbook mode), précisez votre ville en Tunisie et votre budget en Dinars Tunisiens.</p>
              </div>

              <div class="step-card card-glass">
                <div class="step-num">02</div>
                <div class="step-icon-wrap">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <h3>Sélectionnez votre créateur</h3>
                <p>Consultez les propositions, le smartphone utilisé (iPhone 16 Pro, Galaxy Ultra) et les portfolios des vidéastes mobiles locaux.</p>
              </div>

              <div class="step-card card-glass">
                <div class="step-num">03</div>
                <div class="step-icon-wrap">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                </div>
                <h3>Shootez & recevez vos visuels</h3>
                <p>Le créateur réalise le tournage sur place ou avec vos produits envoyés, puis vous livre les vidéos 4K montées sous 48h.</p>
              </div>

              <div class="step-card card-glass">
                <div class="step-num">04</div>
                <div class="step-icon-wrap">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h3>Paiement protégé par séquestre</h3>
                <p>Vos fonds sont retenus en toute sécurité et ne sont libérés au créateur qu'après votre entière satisfaction des livrables.</p>
              </div>
            } @else {
              <div class="step-card card-glass">
                <div class="step-num">01</div>
                <div class="step-icon-wrap">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                </div>
                <h3>Créez votre profil mobile</h3>
                <p>Indiquez votre modèle de smartphone (iPhone 15/16 Pro, S24 Ultra), vos stabilisateurs et téléversez vos meilleurs Reels.</p>
              </div>

              <div class="step-card card-glass">
                <div class="step-num">02</div>
                <div class="step-icon-wrap">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <h3>Trouvez des briefs ou vendez vos packs</h3>
                <p>Postulez aux demandes quotidiennes des restaurants et marques tunisiennes ou proposez vos packages fixes en DT.</p>
              </div>

              <div class="step-card card-glass">
                <div class="step-num">03</div>
                <div class="step-icon-wrap">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <h3>Livrez vos contenus 4K</h3>
                <p>Envoyez vos fichiers vidéo montés et étalonnés directement via notre interface de livraison sécurisée intégrée.</p>
              </div>

              <div class="step-card card-glass">
                <div class="step-num">04</div>
                <div class="step-icon-wrap">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                </div>
                <h3>Encaissez vos gains garantis</h3>
                <p>Votre rémunération est garantie dès le lancement du contrat et virée directement sur votre compte bancaire ou wallet.</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════
           5. PRICING TRANSPARENCY WIDGET (GET INSIGHTS INTO PRICING)
           ══════════════════════════════════════════════════════ -->
      <section class="section pricing-widget-section">
        <div class="container">
          <div class="pricing-widget-card card-glass">
            <div class="pricing-widget-header">
              <div>
                <span class="badge badge-primary">Transparence des Tarifs</span>
                <h2>Estimez le coût de vos contenus smartphone</h2>
                <p>Découvrez les tarifs moyens pratiqués par nos créateurs mobiles en Tunisie selon vos besoins.</p>
              </div>
            </div>

            <div class="pricing-interactive-grid">
              <!-- Select content type buttons -->
              <div class="pricing-options-list">
                @for (opt of pricingOptions; track opt.id) {
                  <div
                    class="pricing-opt-item"
                    [class.selected]="selectedPricingPlan() === opt.id"
                    (click)="selectedPricingPlan.set(opt.id)"
                  >
                    <div class="opt-indicator"></div>
                    <div class="opt-details">
                      <strong>{{ opt.name }}</strong>
                      <span>{{ opt.description }}</span>
                    </div>
                    <div class="opt-price-range">
                      {{ opt.priceMin }} - {{ opt.priceMax }} DT
                    </div>
                  </div>
                }
              </div>

              <!-- Live Estimate Display Card -->
              <div class="pricing-display-card">
                @if (getCurrentPricingOption(); as currentOpt) {
                  <div class="cost-estimate-box">
                    <span class="estimate-tag">Tarif Moyen Recommandé</span>
                    <div class="estimate-number">
                      {{ (currentOpt.priceMin + currentOpt.priceMax) / 2 }} <span class="currency">DT</span>
                    </div>
                    <p class="estimate-range">Fourchette observée : {{ currentOpt.priceMin }} DT à {{ currentOpt.priceMax }} DT</p>

                    <div class="estimate-details">
                      <div class="detail-row">
                        <span>Délai moyen de livraison :</span>
                        <strong>{{ currentOpt.typicalDelivery }}</strong>
                      </div>
                      <div class="detail-row">
                        <span>Format :</span>
                        <strong>9:16 Vertical 4K HDR ProRes</strong>
                      </div>
                    </div>

                    <div class="estimate-checklist">
                      <p class="checklist-title">Ce qui est inclus :</p>
                      @for (item of currentOpt.deliverables; track item) {
                        <div class="check-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          <span>{{ item }}</span>
                        </div>
                      }
                    </div>

                    <a routerLink="/client/jobs/create" class="btn btn-primary btn-block btn-md">
                      Publier un brief avec ce budget
                    </a>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════
           6. STATS BAR — Upwork Trust Metrics
           ══════════════════════════════════════════════════════ -->
      <section class="stats-trust-section">
        <div class="container">
          <div class="stats-trust-grid">
            <div class="stats-trust-item">
              <span class="stats-trust-num">1 200+</span>
              <span class="stats-trust-lbl">Créateurs smartphone vérifiés</span>
            </div>
            <div class="stats-trust-divider"></div>
            <div class="stats-trust-item">
              <span class="stats-trust-num">3 800+</span>
              <span class="stats-trust-lbl">Missions complétées avec succès</span>
            </div>
            <div class="stats-trust-divider"></div>
            <div class="stats-trust-item">
              <span class="stats-trust-num">99.4%</span>
              <span class="stats-trust-lbl">Taux de satisfaction client</span>
            </div>
            <div class="stats-trust-divider"></div>
            <div class="stats-trust-item">
              <span class="stats-trust-num">48h</span>
              <span class="stats-trust-lbl">Délai moyen de livraison</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════
           6b. TESTIMONIALS — Upwork Social Proof
           ══════════════════════════════════════════════════════ -->
      <section class="section testimonials-section">
        <div class="container">
          <div class="section-header">
            <span class="badge badge-primary">Ils nous font confiance</span>
            <h2>Ce que disent nos utilisateurs</h2>
            <p>Des milliers de missions réalisées avec succès en Tunisie et au Maghreb.</p>
          </div>
          <div class="testimonials-grid">
            <div class="testi-card card-glass">
              <div class="testi-quote-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
              </div>
              <p class="testi-text">SnapConnect a transformé notre stratégie contenu. Les créateurs sont ultra-professionnels et les Reels qu'ils produisent ont doublé notre engagement Instagram en 3 semaines.</p>
              <div class="testi-author">
                <div class="testi-avatar" style="background: linear-gradient(135deg, #a855f7, #ec4899)">S</div>
                <div class="testi-info">
                  <span class="testi-name">Sana Ben Ali</span>
                  <span class="testi-role">Directrice Marketing · Alyssa Bio Skincare</span>
                </div>
                <div class="testi-stars">★★★★★</div>
              </div>
            </div>
            <div class="testi-card card-glass">
              <div class="testi-quote-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
              </div>
              <p class="testi-text">J'ai trouvé mes 3 premières missions dès la semaine de mon inscription. Le système escrow me rassure et les clients sont sérieux. Enfin une vraie marketplace pour les créateurs mobiles !</p>
              <div class="testi-author">
                <div class="testi-avatar" style="background: linear-gradient(135deg, #3b82f6, #06b6d4)">M</div>
                <div class="testi-info">
                  <span class="testi-name">Mehdi Trabelsi</span>
                  <span class="testi-role">Vidéaste Mobile · iPhone 16 Pro Max</span>
                </div>
                <div class="testi-stars">★★★★★</div>
              </div>
            </div>
            <div class="testi-card card-glass">
              <div class="testi-quote-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
              </div>
              <p class="testi-text">Pour nos campagnes UGC, SnapConnect est la référence en Tunisie. La qualité ProRes Log des créateurs rivalise avec des productions studio classiques à fraction du prix.</p>
              <div class="testi-author">
                <div class="testi-avatar" style="background: linear-gradient(135deg, #f59e0b, #ef4444)">K</div>
                <div class="testi-info">
                  <span class="testi-name">Karim Jebali</span>
                  <span class="testi-role">Fondateur · Carthage Concept Agency</span>
                </div>
                <div class="testi-stars">★★★★★</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════
           7. FEATURED SERVICE PACKAGES
           ══════════════════════════════════════════════════════ -->
      <section class="section services-section">
        <div class="container">
          <div class="section-header-row">
            <div>
              <span class="badge badge-accent">Offres Prêtes à l'Emploi</span>
              <h2>Packages populaires clés en main</h2>
              <p>Commandez directement un livrable précis à tarif fixe sans phase de négociation.</p>
            </div>
            <a routerLink="/services" class="btn btn-outline">
              <span>Explorer le catalogue</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>

          <div class="packages-grid">
            @for (pkg of featuredPackages; track pkg.id) {
              <div class="package-card card-glass">
                <div class="pkg-image-wrapper">
                  <img [src]="pkg.thumbnailUrl" [alt]="pkg.title" class="pkg-thumbnail" />
                  <span class="pkg-badge">{{ pkg.badge }}</span>
                  <span class="pkg-gear">{{ pkg.smartphone }}</span>
                </div>

                <div class="pkg-body">
                  <a [routerLink]="['/creators', pkg.creatorId || 'cr-1']" class="pkg-creator-row-link" title="Voir le profil du créateur">
                    <img [src]="pkg.creatorAvatar" [alt]="pkg.creatorName" class="pkg-creator-avatar" />
                    <div>
                      <strong class="pkg-creator-name">{{ pkg.creatorName }}</strong>
                      <span class="pkg-creator-city">{{ pkg.creatorCity }}</span>
                    </div>
                  </a>

                  <h3 class="pkg-title">{{ pkg.title }}</h3>

                  <div class="pkg-rating-row">
                    <span class="pkg-star">★</span>
                    <strong>{{ pkg.rating }}</strong>
                    <span class="pkg-reviews">({{ pkg.reviewsCount }} avis)</span>
                    <span class="pkg-sep">•</span>
                    <span class="pkg-delivery">Livré en {{ pkg.deliveryDays }}j</span>
                  </div>

                  <div class="pkg-footer">
                    <div class="pkg-price-wrap">
                      <span class="pkg-price-label">À partir de</span>
                      <strong class="pkg-price">{{ pkg.price }} DT</strong>
                    </div>
                    <a routerLink="/services" [queryParams]="{ serviceId: pkg.id }" class="btn btn-primary btn-sm">
                      Commander
                    </a>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════
           8. USE CASES & BUSINESS CONTEXTS IN TUNISIA
           ══════════════════════════════════════════════════════ -->
      <section class="section use-cases-section">
        <div class="container">
          <div class="section-header">
            <span class="badge badge-gold">Adapté à votre Métier</span>
            <h2>Conçu pour les commerces & marques en Tunisie</h2>
            <p>Du café branché de La Marsa à la boutique e-commerce de Sousse, des visuels adaptés à votre audience locale.</p>
          </div>

          <div class="use-cases-grid">
            <div class="use-case-card card-glass">
              <div class="uc-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>
              </div>
              <h3>Restaurants & Salons de thé</h3>
              <p>Reels gourmands montrant les plats signatures, mocktails, cafés de spécialité et l'ambiance chaleureuse de votre établissement.</p>
              <span class="uc-tag">Idéal Instagram & TikTok</span>
            </div>

            <div class="use-case-card card-glass">
              <div class="uc-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>
              </div>
              <h3>Boutiques de Mode & Streetwear</h3>
              <p>Transitions dynamiques, vidéos portées et lookbooks esthétiques pour présenter chaque nouvelle collection et déclencher l'achat.</p>
              <span class="uc-tag">Fort engagement jeune</span>
            </div>

            <div class="use-case-card card-glass">
              <div class="uc-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <h3>Marques E-commerce & Cosmétiques</h3>
              <p>Packshots esthétiques sur fond épuré, unboxings détaillés et démos de textures en très haute définition 4K ProRes.</p>
              <span class="uc-tag">Conversion publicitaire max</span>
            </div>

            <div class="use-case-card card-glass">
              <div class="uc-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
              </div>
              <h3>Événements, Pop-ups & Soirées</h3>
              <p>Couverture mobile en direct pour alimenter vos stories en temps réel pendant vos inaugurations et lancements de produits.</p>
              <span class="uc-tag">Instantané & immersif</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════
           9. PROVEN RESULTS & TESTIMONIALS (UPWORK 6-CARD GRID)
           ══════════════════════════════════════════════════════ -->
      <section class="section testimonials-section">
        <div class="container">
          <div class="section-header">
            <span class="badge badge-primary">Retours d'Expérience</span>
            <h2>Résultats prouvés sur SnapConnect</h2>
            <p>Découvrez comment les marques et créateurs tunisiens collaborent avec succès au quotidien.</p>
          </div>

          <div class="testimonials-grid">
            @for (t of testimonials; track t.id) {
              <div class="testimonial-card card-glass">
                <div class="t-quote-mark">“</div>
                <p class="t-quote">{{ t.quote }}</p>

                <div class="t-author-row">
                  <img [src]="t.avatarUrl" [alt]="t.authorName" class="t-avatar" />
                  <div class="t-author-info">
                    <strong class="t-author-name">{{ t.authorName }}</strong>
                    <span class="t-author-role">{{ t.authorRole }}</span>
                    <span class="t-author-company">{{ t.companyName }} • {{ t.location }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════
           10. TRUST STATS & METRICS
           ══════════════════════════════════════════════════════ -->
      <section class="section trust-stats-section">
        <div class="container">
          <div class="trust-stats-grid card-glass">
            <div class="t-stat">
              <span class="t-stat-num">500+</span>
              <span class="t-stat-label">Créateurs mobiles vérifiés</span>
              <span class="t-stat-sub">Sélectionnés sur portfolio 4K</span>
            </div>
            <div class="t-stat-sep"></div>
            <div class="t-stat">
              <span class="t-stat-num">1,200+</span>
              <span class="t-stat-label">Contenus créés & livrés</span>
              <span class="t-stat-sub">Reels, TikToks & packshots</span>
            </div>
            <div class="t-stat-sep"></div>
            <div class="t-stat">
              <span class="t-stat-num">350+</span>
              <span class="t-stat-label">Clients accompagnés</span>
              <span class="t-stat-sub">Partout en Tunisie</span>
            </div>
            <div class="t-stat-sep"></div>
            <div class="t-stat">
              <span class="t-stat-num">98.4%</span>
              <span class="t-stat-label">Taux de satisfaction</span>
              <span class="t-stat-sub">Paiements 100% sécurisés</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════
           11. FINAL IMPACTFUL CTA BANNER
           ══════════════════════════════════════════════════════ -->
      <section class="section final-cta-section">
        <div class="container">
          <div class="cta-card">
            <div class="cta-glow-bg"></div>
            <div class="cta-inner-content">
              <h2>Prêt à transformer l'image de votre marque sur les réseaux ?</h2>
              <p>Rejoignez la première communauté tunisienne de créateurs mobiles et recevez des contenus visuels percutants livrés sous 48h.</p>
              <div class="cta-buttons-row">
                <a routerLink="/client/jobs/create" class="btn btn-light-cta btn-lg">
                  Publier un brief gratuit
                </a>
                <a routerLink="/auth/register" [queryParams]="{ role: 'CREATOR' }" class="btn btn-outline-white btn-lg">
                  Devenir créateur mobile
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
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-16);
      overflow: hidden;
    }

    .hero-glow {
      position: absolute;
      top: 5%;
      left: 50%;
      transform: translateX(-50%);
      width: 800px;
      height: 500px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.16) 0%, rgba(236, 72, 153, 0.08) 40%, transparent 70%);
      filter: blur(90px);
      z-index: -1;
      pointer-events: none;
    }

    .hero-container {
      display: grid;
      grid-template-columns: 1.2fr 0.95fr;
      gap: var(--space-12);
      align-items: center;
    }

    .hero-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .hero-pill-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 6px 14px;
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.3);
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
      font-size: clamp(2.2rem, 4.2vw, 3.6rem);
      font-weight: var(--font-weight-extrabold);
      line-height: 1.16;
      letter-spacing: -0.03em;
      color: var(--color-text-primary);
    }

    .text-gradient {
      background: linear-gradient(135deg, var(--color-primary-300) 0%, var(--color-accent-400) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: var(--font-size-base);
      color: var(--color-text-secondary);
      line-height: var(--line-height-relaxed);
      max-width: 600px;
    }

    /* ─── Search Box Widget ─── */
    .hero-search-box {
      padding: var(--space-5);
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-border-focus);
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(16px);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
    }

    .search-tabs {
      display: flex;
      gap: var(--space-2);
      background: rgba(15, 23, 42, 0.8);
      padding: 4px;
      border-radius: var(--radius-md);
      width: fit-content;
      flex-wrap: wrap;
    }

    .search-tab {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .search-tab:hover {
      color: var(--color-text-primary);
    }

    .search-tab.active {
      background: var(--color-primary-500);
      color: #ffffff;
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
      color: var(--color-text-muted);
      pointer-events: none;
    }

    .hero-input {
      width: 100%;
      padding: 0.85rem 1rem 0.85rem 2.8rem;
      background: rgba(15, 23, 42, 0.8);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-full);
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
      outline: none;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }

    .hero-input:focus {
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }

    .search-btn {
      flex-shrink: 0;
      border-radius: var(--radius-full);
      padding-inline: var(--space-6);
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
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      padding: 4px 10px;
      font-size: 11px;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .chip:hover {
      background: var(--color-primary-light);
      border-color: var(--color-primary-400);
      color: var(--color-primary-300);
      transform: translateY(-1px);
    }

    /* ─── Hero Stats ─── */
    .hero-stats {
      display: flex;
      align-items: center;
      gap: var(--space-6);
      padding-top: var(--space-2);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
    }

    .stat-num {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-extrabold);
      color: var(--color-text-primary);
    }

    .stat-lbl {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .stat-sep {
      width: 1px;
      height: 32px;
      background: var(--color-border);
    }

    /* ─── Right Hero Visual ─── */
    .hero-visual {
      display: flex;
      justify-content: center;
      position: relative;
    }

    .phone-mockup-wrapper {
      position: relative;
      width: 290px;
    }

    .phone-mockup {
      width: 290px;
      height: 520px;
      background: #0f172a;
      border: 6px solid #2d3748;
      border-radius: 40px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(139, 92, 246, 0.2);
      overflow: hidden;
      position: relative;
    }

    .phone-notch {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 18px;
      background: #1a202c;
      border-radius: var(--radius-full);
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
      background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.1) 60%, rgba(15, 23, 42, 0.6) 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: var(--space-6) var(--space-4) var(--space-5);
    }

    .screen-top-badge {
      align-self: flex-end;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 10px;
      color: #fff;
      font-weight: var(--font-weight-medium);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .rec-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #ef4444;
      box-shadow: 0 0 6px #ef4444;
    }

    .screen-bottom-info .sample-title {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      color: #ffffff;
      margin: 0 0 2px 0;
    }

    .screen-bottom-info .sample-creator {
      font-size: 11px;
      color: var(--color-primary-300);
      margin: 0;
    }

    .floating-badge {
      position: absolute;
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
      z-index: 20;
    }

    .badge-left {
      bottom: 60px;
      left: -60px;
    }

    .badge-right {
      top: 100px;
      right: -60px;
    }

    .fb-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: var(--color-primary-light);
      border: 1px solid var(--color-primary-glow);
      color: var(--color-primary-300);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
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
      color: var(--color-text-secondary);
    }

    /* ─── Social Proof Section ─── */
    .social-proof-section {
      padding: var(--space-8) 0;
      border-top: 1px solid var(--color-border);
      border-bottom: 1px solid var(--color-border);
      background: rgba(15, 23, 42, 0.4);
    }

    .social-proof-title {
      text-align: center;
      font-size: var(--font-size-xs);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-text-muted);
      margin-bottom: var(--space-4);
    }

    .brand-logos-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-4);
      flex-wrap: wrap;
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    .brand-item {
      opacity: 0.85;
      transition: opacity var(--transition-fast);
    }

    .brand-item:hover {
      opacity: 1;
      color: var(--color-text-primary);
    }

    .brand-sep {
      color: var(--color-border);
    }

    /* ─── Shared Section Header ─── */
    .section-header {
      text-align: center;
      max-width: 680px;
      margin: 0 auto var(--space-12);
    }

    .section-header h2 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-extrabold);
      letter-spacing: -0.02em;
      margin-top: var(--space-2);
      margin-bottom: var(--space-2);
    }

    .section-header p {
      font-size: var(--font-size-base);
      color: var(--color-text-secondary);
      line-height: var(--line-height-relaxed);
    }

    .section-header-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: var(--space-10);
      gap: var(--space-4);
    }

    .section-header-row h2 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-extrabold);
      letter-spacing: -0.02em;
      margin-top: var(--space-2);
      margin-bottom: var(--space-1);
    }

    .section-header-row p {
      font-size: var(--font-size-base);
      color: var(--color-text-secondary);
      margin: 0;
    }

    /* ─── Categories Grid (Upwork 8-card) ─── */
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-4);
    }

    /* ─── How it Works (Tabs & Steps) ─── */
    .role-switch-container {
      display: flex;
      justify-content: center;
      margin-bottom: var(--space-10);
    }

    .role-switcher {
      display: inline-flex;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--color-border);
      padding: 4px;
      border-radius: var(--radius-full);
    }

    .role-switch-btn {
      padding: 8px 24px;
      border-radius: var(--radius-full);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .role-switch-btn.active {
      background: var(--color-primary-500);
      color: #ffffff;
      box-shadow: 0 4px 14px var(--color-primary-glow);
    }

    .steps-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-6);
    }

    .step-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
      position: relative;
      transition: all var(--transition-base);
    }

    .step-card:hover {
      transform: translateY(-4px);
      border-color: var(--color-primary-400);
    }

    .step-num {
      position: absolute;
      top: var(--space-4);
      right: var(--space-5);
      font-size: 1.5rem;
      font-weight: var(--font-weight-black);
      color: rgba(255, 255, 255, 0.08);
    }

    .step-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: var(--color-primary-light);
      border: 1px solid var(--color-primary-glow);
      color: var(--color-primary-300);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-4);
    }

    .step-card h3 {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-2);
      color: var(--color-text-primary);
    }

    .step-card p {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: 1.5;
      margin: 0;
    }

    /* ─── Pricing Transparency Widget ─── */
    .pricing-widget-card {
      padding: var(--space-10);
      border-radius: var(--radius-2xl);
      border: 1px solid var(--color-border-focus);
    }

    .pricing-widget-header {
      margin-bottom: var(--space-8);
    }

    .pricing-widget-header h2 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-extrabold);
      margin-top: var(--space-2);
      margin-bottom: var(--space-1);
    }

    .pricing-widget-header p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
      margin: 0;
    }

    .pricing-interactive-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: var(--space-8);
      align-items: stretch;
    }

    .pricing-options-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .pricing-opt-item {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4) var(--space-5);
      border-radius: var(--radius-lg);
      border: 1.5px solid var(--color-border);
      background: rgba(15, 23, 42, 0.5);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .pricing-opt-item:hover {
      border-color: var(--color-primary-400);
      background: rgba(139, 92, 246, 0.05);
    }

    .pricing-opt-item.selected {
      border-color: var(--color-primary-500);
      background: rgba(139, 92, 246, 0.1);
      box-shadow: 0 0 20px var(--color-primary-glow);
    }

    .opt-indicator {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid var(--color-text-muted);
      flex-shrink: 0;
      position: relative;
    }

    .pricing-opt-item.selected .opt-indicator {
      border-color: var(--color-primary-500);
      background: var(--color-primary-500);
    }

    .pricing-opt-item.selected .opt-indicator::after {
      content: '';
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #ffffff;
    }

    .opt-details {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .opt-details strong {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
    }

    .opt-details span {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .opt-price-range {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
      color: var(--color-primary-300);
      flex-shrink: 0;
    }

    .pricing-display-card {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .cost-estimate-box {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .estimate-tag {
      font-size: var(--font-size-xs);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-primary-400);
      font-weight: var(--font-weight-bold);
    }

    .estimate-number {
      font-size: 2.8rem;
      font-weight: var(--font-weight-black);
      color: var(--color-text-primary);
      line-height: 1;
    }

    .estimate-number .currency {
      font-size: 1.5rem;
      color: var(--color-accent-400);
    }

    .estimate-range {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin: 0;
    }

    .estimate-details {
      border-top: 1px solid var(--color-border-subtle);
      border-bottom: 1px solid var(--color-border-subtle);
      padding: var(--space-3) 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      color: var(--color-text-secondary);
    }

    .detail-row strong {
      color: var(--color-text-primary);
    }

    .estimate-checklist {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .checklist-title {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      margin: 0;
    }

    .check-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .check-item svg {
      color: var(--color-success);
      flex-shrink: 0;
    }

    /* ─── Packages Grid ─── */
    .packages-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-6);
    }

    .package-card {
      border-radius: var(--radius-xl);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all var(--transition-base);
    }

    .package-card:hover {
      transform: translateY(-4px);
      border-color: var(--color-primary-400);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
    }

    .pkg-image-wrapper {
      position: relative;
      height: 180px;
      overflow: hidden;
    }

    .pkg-thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-slow);
    }

    .package-card:hover .pkg-thumbnail {
      transform: scale(1.05);
    }

    .pkg-badge {
      position: absolute;
      top: 10px; left: 10px;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(6px);
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      font-size: 10px;
      font-weight: var(--font-weight-bold);
      color: #fff;
    }

    .pkg-gear {
      position: absolute;
      bottom: 10px; right: 10px;
      background: rgba(139, 92, 246, 0.85);
      padding: 2px 8px;
      border-radius: var(--radius-full);
      font-size: 10px;
      color: #fff;
      font-weight: var(--font-weight-semibold);
    }

    .pkg-body {
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: var(--space-3);
    }

    .pkg-creator-row, .pkg-creator-row-link {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }

    .pkg-creator-row-link:hover .pkg-creator-name {
      color: var(--color-primary-300);
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .pkg-creator-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 1.5px solid var(--color-primary-500);
    }

    .pkg-creator-name {
      display: block;
      font-size: var(--font-size-xs);
      color: var(--color-text-primary);
    }

    .pkg-creator-city {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .pkg-title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      line-height: 1.4;
      margin: 0;
    }

    .pkg-rating-row {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .pkg-star {
      color: var(--color-warning);
    }

    .pkg-sep {
      color: var(--color-border);
    }

    .pkg-footer {
      margin-top: auto;
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .pkg-price-wrap {
      display: flex;
      flex-direction: column;
    }

    .pkg-price-label {
      font-size: 10px;
      color: var(--color-text-muted);
    }

    .pkg-price {
      font-size: var(--font-size-base);
      color: var(--color-primary-400);
      font-weight: var(--font-weight-black);
    }

    /* ─── Stats Trust Bar ─── */
    .stats-trust-section {
      margin: var(--space-16) 0;
      background: linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.06));
      border: 1px solid rgba(139,92,246,0.18);
      border-radius: var(--radius-2xl);
      padding: var(--space-10) var(--space-8);
    }

    .stats-trust-grid {
      display: flex;
      align-items: center;
      justify-content: space-around;
      gap: var(--space-6);
    }

    .stats-trust-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-1);
    }

    .stats-trust-num {
      font-size: 2.6rem;
      font-weight: 800;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
    }

    .stats-trust-lbl {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      text-align: center;
      max-width: 140px;
    }

    .stats-trust-divider {
      width: 1px;
      height: 50px;
      background: rgba(255,255,255,0.08);
      flex-shrink: 0;
    }

    /* ─── Testimonials ─── */
    .testimonials-section { margin-top: var(--space-20); }

    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-6);
    }

    .testi-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      transition: all var(--transition-base);
    }

    .testi-card:hover {
      border-color: rgba(139,92,246,0.3);
      transform: translateY(-3px);
      box-shadow: 0 16px 40px rgba(139,92,246,0.1);
    }

    .testi-quote-icon {
      color: rgba(139,92,246,0.4);
      width: 24px;
    }

    .testi-text {
      font-size: 0.92rem;
      color: rgba(255,255,255,0.8);
      line-height: 1.7;
      font-style: italic;
      flex: 1;
    }

    .testi-author {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .testi-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      color: white;
      flex-shrink: 0;
    }

    .testi-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .testi-name {
      font-size: 0.88rem;
      font-weight: 700;
    }

    .testi-role {
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }

    .testi-stars {
      color: #fbbf24;
      font-size: 0.85rem;
      letter-spacing: 0.05em;
      margin-left: auto;
    }

    /* ─── Use Cases Grid ─── */
    .use-cases-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-6);
    }

    .use-case-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      transition: all var(--transition-base);
    }

    .use-case-card:hover {
      transform: translateY(-4px);
      border-color: var(--color-primary-400);
    }

    .uc-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: var(--color-primary-light);
      color: var(--color-primary-300);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .use-case-card h3 {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      margin: 0;
    }

    .use-case-card p {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: 1.5;
      margin: 0;
    }

    .uc-tag {
      font-size: 11px;
      color: var(--color-primary-300);
      font-weight: var(--font-weight-semibold);
      margin-top: auto;
    }

    /* ─── Testimonials Grid (Upwork 6-Card) ─── */
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-6);
    }

    .testimonial-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }

    .t-quote-mark {
      font-size: 3rem;
      line-height: 1;
      color: rgba(139, 92, 246, 0.25);
      font-family: Georgia, serif;
      margin-bottom: -15px;
    }

    .t-quote {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      line-height: 1.6;
      margin-bottom: var(--space-5);
      font-style: italic;
    }

    .t-author-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border-subtle);
    }

    .t-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--color-primary-500);
    }

    .t-author-info {
      display: flex;
      flex-direction: column;
    }

    .t-author-name {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
    }

    .t-author-role {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .t-author-company {
      font-size: 11px;
      color: var(--color-primary-400);
    }

    /* ─── Trust Stats Grid ─── */
    .trust-stats-grid {
      display: grid;
      grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
      padding: var(--space-8);
      border-radius: var(--radius-2xl);
      align-items: center;
    }

    .t-stat {
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .t-stat-num {
      font-size: clamp(2rem, 3.5vw, 2.75rem);
      font-weight: var(--font-weight-black);
      color: var(--color-text-primary);
      line-height: 1;
    }

    .t-stat-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
      color: var(--color-primary-300);
    }

    .t-stat-sub {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .t-stat-sep {
      width: 1px;
      height: 50px;
      background: var(--color-border);
    }

    /* ─── Final CTA Banner ─── */
    .final-cta-section {
      padding-bottom: var(--space-12);
    }

    .cta-card {
      position: relative;
      background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #db2777 100%);
      border-radius: var(--radius-2xl);
      padding: var(--space-14) var(--space-8);
      overflow: hidden;
      text-align: center;
      box-shadow: 0 20px 50px rgba(124, 58, 237, 0.4);
    }

    .cta-glow-bg {
      position: absolute;
      top: -50%;
      left: -20%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 60%);
      pointer-events: none;
    }

    .cta-inner-content {
      position: relative;
      z-index: 1;
      max-width: 680px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-5);
    }

    .cta-inner-content h2 {
      font-size: clamp(1.8rem, 3.5vw, 2.75rem);
      font-weight: var(--font-weight-black);
      color: #ffffff;
      line-height: 1.2;
      margin: 0;
    }

    .cta-inner-content p {
      font-size: var(--font-size-base);
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6;
      margin: 0;
    }

    .cta-buttons-row {
      display: flex;
      gap: var(--space-4);
      margin-top: var(--space-3);
      flex-wrap: wrap;
      justify-content: center;
    }

    .btn-light-cta {
      background: #ffffff;
      color: #0f172a;
      font-weight: var(--font-weight-bold);
      border-radius: var(--radius-full);
      padding: 12px 28px;
      text-decoration: none;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      transition: all var(--transition-fast);
    }

    .btn-light-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      background: #f8fafc;
    }

    .btn-outline-white {
      background: rgba(255, 255, 255, 0.12);
      border: 1.5px solid rgba(255, 255, 255, 0.5);
      color: #ffffff;
      font-weight: var(--font-weight-bold);
      border-radius: var(--radius-full);
      padding: 12px 28px;
      text-decoration: none;
      transition: all var(--transition-fast);
    }

    .btn-outline-white:hover {
      background: rgba(255, 255, 255, 0.25);
      border-color: #ffffff;
      transform: translateY(-2px);
    }

    /* ─── Responsive Queries ─── */
    @media (max-width: 1200px) {
      .categories-grid, .packages-grid, .use-cases-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .steps-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .testimonials-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

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
        margin-top: var(--space-6);
      }
      .pricing-interactive-grid {
        grid-template-columns: 1fr;
      }
      .trust-stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-6);
      }
      .t-stat-sep {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .categories-grid, .packages-grid, .steps-grid, .use-cases-grid, .testimonials-grid {
        grid-template-columns: 1fr;
      }
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
      .section-header-row {
        flex-direction: column;
        align-items: flex-start;
      }
      .trust-stats-grid {
        grid-template-columns: 1fr;
        gap: var(--space-6);
      }
    }
  `]
})
export class LandingComponent implements OnInit {
  private router = inject(Router);
  private creatorService = inject(CreatorService);
  private auth = inject(AuthService);

  activeSearchTab   = signal<'CREATORS' | 'SERVICES' | 'JOBS'>('CREATORS');
  howItWorksRole    = signal<'CLIENT' | 'CREATOR'>('CLIENT');
  selectedPricingPlan = signal<number>(2); // Default to Pack 3 Reels
  searchQuery       = '';

  platformCategories = PLATFORM_CATEGORIES.slice(0, 8);

  /* Pricing Estimator Plans (In DT) */
  pricingOptions: PricingOption[] = [
    {
      id: 1,
      name: '1 Reel / TikTok Unitaire',
      description: 'Format court dynamique & tendance (15s à 60s)',
      priceMin: 45,
      priceMax: 65,
      typicalDelivery: '24h - 48h',
      deliverables: [
        'Prise de vue mobile 4K 60fps',
        'Montage dynamique & étalonnage couleur',
        'Audio tendance et sous-titres animés',
        '1 session de retouches incluse'
      ]
    },
    {
      id: 2,
      name: 'Pack 3 Reels Mensuel',
      description: 'L\'offre la plus prisée pour animer vos réseaux',
      priceMin: 120,
      priceMax: 160,
      typicalDelivery: '48h',
      deliverables: [
        '3 Reels distincts au format 9:16 natif',
        'Prise de vue sur place ou avec produits',
        'Storytelling adapté à votre marque',
        'Optimisation hashtags et sons viraux'
      ]
    },
    {
      id: 3,
      name: 'Pack 15 Photos Produits Studio',
      description: 'Packshots haute fidélité pour site e-commerce',
      priceMin: 100,
      priceMax: 140,
      typicalDelivery: '48h',
      deliverables: [
        '15 photos retouchées en ultra haute résolution',
        'Fond neutre + mises en situation esthétiques',
        'Éclairage studio mobile pro',
        'Fichiers livrés prêts pour votre boutique en ligne'
      ]
    },
    {
      id: 4,
      name: 'Pack Restaurant & Café Signature',
      description: 'Mise en valeur gastronomique de vos plats',
      priceMin: 150,
      priceMax: 220,
      typicalDelivery: '48h',
      deliverables: [
        '10 photos culinaires alléchantes',
        '2 Reels d\'ambiance et préparation chef',
        'Prises de vue macro au stabilisateur',
        'Couverture service du midi ou soir'
      ]
    },
    {
      id: 5,
      name: 'Couverture Événement Demi-Journée (3h-4h)',
      description: 'Stories en direct et aftermovie pour événements',
      priceMin: 180,
      priceMax: 260,
      typicalDelivery: '24h (Stories live le jour J)',
      deliverables: [
        'Présence sur place avec iPhone 16 Pro + Gimbal',
        'Alimentation des Stories en temps réel',
        '1 Reel récapitulatif dynamique post-événement',
        'Accès à tous les rushs bruts 4K'
      ]
    }
  ];

  /* Authentic Tunisian Mobile Creators */
  featuredCreators: CreatorProfile[] = [
    {
      id: 'cr-1',
      userId: 'u-1',
      fullName: 'Sarah Ben Salem',
      email: 'sarah.bensalem@snapconnect.tn',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80',
      title: 'Spécialiste TikTok, UGC & Mode Urbaine',
      bio: 'Vidéaste mobile basée à La Marsa avec plus de 500K vues cumulées. Spécialisée dans les montages dynamiques, les transitions tendances et le storytelling pour marques tunisiennes.',
      location: 'Tunis (La Marsa), Tunisie',
      hourlyRate: 45,
      rating: 4.98,
      reviewsCount: 47,
      completedProjectsCount: 52,
      availabilityStatus: 'AVAILABLE',
      isVerified: true,
      specializations: ['Reels & TikTok', 'UGC Ads', 'Mode & Prêt-à-porter'],
      equipment: {
        smartphoneModel: 'iPhone 16 Pro Max 4K',
        gimbal: 'DJI Osmo Mobile 6',
        audioGear: 'Rode Wireless Pro',
        lighting: 'Aputure Amaran MC'
      }
    },
    {
      id: 'cr-2',
      userId: 'u-2',
      fullName: 'Mehdi Trabelsi',
      email: 'mehdi.trabelsi@snapconnect.tn',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=350&q=80',
      title: 'Storyteller Food & Gastronomie Tunisienne',
      bio: 'Création de Reels 4K 60fps appétissants pour restaurants gastronomiques, cafés branchés et hôtels de charme à Sousse, Port El Kantaoui et Tunis.',
      location: 'Sousse / Port El Kantaoui, Tunisie',
      hourlyRate: 50,
      rating: 5.0,
      reviewsCount: 38,
      completedProjectsCount: 41,
      availabilityStatus: 'AVAILABLE',
      isVerified: true,
      specializations: ['Restaurants & Cafés', 'Photos Produits', 'Stories Live'],
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
      fullName: 'Yassine Gharbi',
      email: 'yassine.gharbi@snapconnect.tn',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=350&q=80',
      title: 'Visites Immobilières 4K & Architecture',
      bio: 'Prises de vue ultra-stabilisées au stabilisateur pour villas haut standing, maisons d\'hôtes et appartements à Gammarth, Hammamet et Tunis.',
      location: 'Hammamet / Gammarth, Tunisie',
      hourlyRate: 60,
      rating: 4.92,
      reviewsCount: 29,
      completedProjectsCount: 35,
      availabilityStatus: 'AVAILABLE',
      isVerified: true,
      specializations: ['Immobilier & Déco', 'Événements', 'Publicité'],
      equipment: {
        smartphoneModel: 'iPhone 15 Pro Max ProRes',
        gimbal: 'Insta360 Flow',
        audioGear: 'Hollyland Lark M2'
      }
    },
    {
      id: 'cr-4',
      userId: 'u-4',
      fullName: 'Nourhene Trabelsi',
      email: 'nourhene.trabelsi@snapconnect.tn',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=350&q=80',
      title: 'Créatrice Beauté, Cosmétiques & Packshots Studio',
      bio: 'Mise en valeur esthétique des textures de crèmes, sérums et soins cosmétiques pour marques tunisiennes. Prises de vue macro 4K et unboxings immersifs.',
      location: 'Tunis (Lac 2 / Ariana), Tunisie',
      hourlyRate: 40,
      rating: 4.96,
      reviewsCount: 33,
      completedProjectsCount: 44,
      availabilityStatus: 'AVAILABLE',
      isVerified: true,
      specializations: ['Beauté & Cosmétique', 'Photos Produits', 'Reels UGC'],
      equipment: {
        smartphoneModel: 'iPhone 16 Pro 4K',
        gimbal: 'DJI OM 5',
        audioGear: 'Rode VideoMic Me-C'
      }
    }
  ];

  /* Featured Service Packages */
  featuredPackages: ServicePackage[] = [
    {
      id: 'pkg-1',
      title: 'Pack 3 Reels Gourmands Food & Ambiance Restaurant',
      creatorId: 'cr-2',
      creatorName: 'Mehdi Trabelsi',
      creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      creatorCity: 'Sousse',
      price: 150,
      deliveryDays: 2,
      rating: 5.0,
      reviewsCount: 28,
      thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      badge: 'Bestseller Food',
      smartphone: 'Galaxy S24 Ultra'
    },
    {
      id: 'pkg-2',
      title: 'Shooting Mode & Streetwear — 12 Photos Studio + 1 Reel',
      creatorId: 'cr-1',
      creatorName: 'Sarah Ben Salem',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      creatorCity: 'Tunis (La Marsa)',
      price: 180,
      deliveryDays: 2,
      rating: 4.98,
      reviewsCount: 42,
      thumbnailUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
      badge: 'Mode & Lookbook',
      smartphone: 'iPhone 16 Pro'
    },
    {
      id: 'pkg-3',
      title: 'Pack 15 Packshots Produits & Soins Bio E-commerce',
      creatorId: 'cr-5',
      creatorName: 'Mariem Mansour',
      creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      creatorCity: 'Ariana (Ennasr)',
      price: 130,
      deliveryDays: 2,
      rating: 4.96,
      reviewsCount: 31,
      thumbnailUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
      badge: 'Packshots Studio',
      smartphone: 'iPhone 15 Pro Max'
    },
    {
      id: 'pkg-4',
      title: 'Visite Immersive 4K d\'un Bien Immobilier ou Maison d\'Hôtes',
      creatorId: 'cr-3',
      creatorName: 'Yassine Gharbi',
      creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      creatorCity: 'Hammamet',
      price: 210,
      deliveryDays: 3,
      rating: 4.92,
      reviewsCount: 19,
      thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
      badge: 'Immobilier & Villa',
      smartphone: 'iPhone 15 Pro Max'
    }
  ];

  /* Realistic Tunisian Testimonials (Upwork 6-Card Grid) */
  testimonials: Testimonial[] = [
    {
      id: 't-1',
      quote: 'SnapConnect nous a permis de trouver Sarah en moins de deux heures pour notre salon de thé à La Marsa. Les 3 Reels TikTok qu’elle a livrés ont généré plus de 90 000 vues en une semaine !',
      authorName: 'Amine Ben Romdhane',
      authorRole: 'Co-fondateur',
      companyName: 'Café Journal',
      location: 'La Marsa, Tunis',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
      type: 'CLIENT'
    },
    {
      id: 't-2',
      quote: 'Faire appel à une agence de tournage traditionnelle nous coûtait plus de 2 500 DT par journée. Avec SnapConnect, nous commandons nos photos de cosmétiques mensuelles pour 140 DT avec une qualité 4K bluffante.',
      authorName: 'Yasmine Khemir',
      authorRole: 'Fondatrice',
      companyName: 'Alyssa Bio Skincare',
      location: 'Tunis',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      type: 'CLIENT'
    },
    {
      id: 't-3',
      quote: 'En tant que créateur sur iPhone 16 Pro, SnapConnect a transformé ma passion en un revenu régulier de plus de 2 200 DT par mois. La garantie de séquestre nous donne une sécurité totale sur les paiements.',
      authorName: 'Mehdi Trabelsi',
      authorRole: 'Vidéaste Mobile Certifié',
      companyName: 'Créateur Indépendant',
      location: 'Sousse',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      type: 'CREATOR'
    },
    {
      id: 't-4',
      quote: 'La rapidité d’exécution est impressionnante. Nous avions un drop streetwear urgent pour le week-end, et le vidéaste était sur place le lendemain matin avec son stabilisateur. Visuels impeccables.',
      authorName: 'Karim Bouaziz',
      authorRole: 'Directeur Marketing',
      companyName: 'Carthage Concept',
      location: 'Tunis (Lac 2)',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      type: 'CLIENT'
    },
    {
      id: 't-5',
      quote: 'Nos clients à Sidi Bou Saïd veulent voir l’ambiance en direct sur Instagram. Les stories et vidéos immersives livrées par les créateurs SnapConnect reflètent exactement l’authenticité de notre maison d’hôtes.',
      authorName: 'Tarek Mansour',
      authorRole: 'Gérant',
      companyName: 'Dar Zarrouk',
      location: 'Sidi Bou Saïd',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
      type: 'CLIENT'
    },
    {
      id: 't-6',
      quote: 'Plateforme très intuitive. J\'ai pu valider les livrables directement sur mon téléphone et les fonds ont été transférés instantanément. C\'est l\'outil indispensable pour le marketing digital en Tunisie.',
      authorName: 'Ines Jaziri',
      authorRole: 'Fondatrice',
      companyName: 'Baya Boutique',
      location: 'Sousse',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      type: 'CLIENT'
    }
  ];

  ngOnInit(): void {
    const currentUser = this.auth.currentUser();
    if (currentUser && (currentUser.role === 'CREATOR' || currentUser.email?.includes('creator'))) {
      const p = this.creatorService.mapUserToCreatorProfile(currentUser);
      if (!this.featuredCreators.some(c => c.id === p.id || c.email === p.email)) {
        this.featuredCreators.unshift(p);
      }
    }

    this.creatorService.getRegisteredCreators().subscribe({
      next: (creators) => {
        if (creators && creators.length > 0) {
          for (const c of creators) {
            if (!this.featuredCreators.some(f => f.id === c.id || f.email === c.email)) {
              this.featuredCreators.unshift(c);
            }
          }
        }
      },
      error: () => {}
    });
  }

  getCurrentPricingOption(): PricingOption | undefined {
    return this.pricingOptions.find(p => p.id === this.selectedPricingPlan());
  }

  getSearchPlaceholder(): string {
    const tab = this.activeSearchTab();
    if (tab === 'CREATORS') return 'Rechercher un créateur par smartphone, ville (La Marsa, Sousse...), spécialité...';
    if (tab === 'SERVICES') return 'Rechercher des packages clés en main (ex. Pack Reels Restaurant, Photos Produits)...';
    return 'Rechercher des briefs par mot-clé, budget (DT) ou ville...';
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
