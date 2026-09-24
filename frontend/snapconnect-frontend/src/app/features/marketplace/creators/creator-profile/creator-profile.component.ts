import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { RatingStarsComponent } from '../../../../shared/components/rating-stars/rating-stars.component';
import { MediaModalComponent } from '../../../../shared/components/media-modal/media-modal.component';
import { RecommendationMatchComponent } from '../../../../shared/components/recommendation-match/recommendation-match.component';
import { CreatorBadgeComponent } from '../../../../shared/components/creator-badge/creator-badge.component';
import { AuthService } from '../../../../core/services/auth.service';
import { CreatorProfile } from '../../../../core/models/creator.model';
import { PortfolioItem } from '../../../../core/models/portfolio.model';

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
    RecommendationMatchComponent,
    CreatorBadgeComponent
  ],
  template: `
    <app-navbar></app-navbar>

    @if (creator(); as c) {
      <main class="creator-profile-page">
        <div class="container">
          @if (isOwnProfile()) {
            <div class="public-preview-banner animate-fade-in">
              <div class="preview-banner-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>Vous prévisualisez votre <strong>profil public</strong> tel que les clients et marques le voient sur SnapConnect.</span>
              </div>
              <a routerLink="/creator/dashboard" class="preview-back-btn">
                ← Retourner au profil
              </a>
            </div>
          }

          <!-- Profile Banner / Header -->
          <div class="profile-header-card card-glass animate-fade-in">
            <div class="header-main">
              <div class="avatar-col">
                @if (displayAvatarUrl()) {
                  <img
                    [src]="displayAvatarUrl()"
                    [alt]="c.fullName"
                    class="profile-avatar avatar-2xl"
                    referrerpolicy="no-referrer"
                  />
                } @else {
                  <div class="profile-avatar avatar-2xl empty-avatar-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                }
                @if (c.isVerified) {
                  <span class="verified-badge-large" title="Créateur mobile certifié">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                }
              </div>

              <div class="info-col">
                <div class="name-status-row">
                  <h1>{{ c.fullName }}</h1>
                  <span class="badge badge-success">● Disponible pour tournages</span>
                </div>

                <p class="creator-title">{{ c.title }}</p>

                <div class="meta-pills">
                  <span class="meta-pill">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 3px;">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {{ c.location }}
                  </span>
                  <span class="meta-pill">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 3px;">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    {{ c.responseTimeHours || 1 }}h réponse moy.
                  </span>
                  <span class="meta-pill">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 3px;">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {{ c.completedProjectsCount }} missions réalisées
                  </span>
                </div>

                <div class="rating-strip">
                  <app-rating-stars [rating]="c.rating" [reviewsCount]="c.reviewsCount"></app-rating-stars>
                </div>
              </div>
            </div>

            <!-- Action column (Pricing & Hire button) -->
            <div class="header-actions">
              <div class="rate-card">
                <span class="rate-label">Tarif Horaire</span>
                <span class="rate-amount">{{ c.hourlyRate || 45 }} DT<span class="rate-unit">/h</span></span>
              </div>
              @if (isOwnProfile()) {
                <a routerLink="/creator/dashboard" class="btn btn-primary btn-lg hire-btn" style="background: #14a800; border-color: #14a800;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 6px; vertical-align: -2px;">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                  Modifier mon profil
                </a>
                <a routerLink="/creator/dashboard" class="btn btn-outline btn-md contact-btn" style="border-color: rgba(255,255,255,0.2);">
                  ← Retour au Workspace
                </a>
              } @else {
                <a [routerLink]="['/client/jobs/create']" [queryParams]="{ creatorId: c.id, creatorName: c.fullName }" class="btn btn-primary btn-lg hire-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="margin-right: 6px; vertical-align: -2px;">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  Embaucher ce créateur
                </a>
                <button (click)="contactCreator()" class="btn btn-outline btn-md contact-btn" id="contact-creator-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; vertical-align: -2px;">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Contacter le créateur
                </button>
              }
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
                  Portfolio ({{ portfolioItems.length }})
                </button>

                <button
                  class="tab-btn"
                  [class.active]="activeTab() === 'ABOUT'"
                  (click)="activeTab.set('ABOUT')">
                  À propos & Compétences
                </button>
                <button
                  class="tab-btn"
                  [class.active]="activeTab() === 'REVIEWS'"
                  (click)="activeTab.set('REVIEWS')">
                  Avis clients ({{ c.reviewsCount }})
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
                            {{ item.mediaType === 'VIDEO' ? 'Vidéo' : 'Photo' }}
                          </div>
                        </div>
                        <div class="portfolio-info">
                          <h4>{{ item.title }}</h4>
                          @if (item.equipmentUsed) {
                            <span class="gear-sub">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 2px;">
                                <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5"></rect>
                                <line x1="12" y1="18" x2="12.01" y2="18"></line>
                              </svg>
                              {{ item.equipmentUsed }}
                            </span>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Tab Content: About -->
              @if (activeTab() === 'ABOUT') {
                <div class="tab-section animate-fade-in card-glass about-card">
                  <h3>À propos de {{ c.fullName }}</h3>
                  <p class="bio-full">{{ c.bio }}</p>

                  <h4 class="sub-h">Spécialisations</h4>
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
                          <span class="rev-avatar">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                          </span>
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
                  'Équipement certifié : ' + (c.equipment?.smartphoneModel || 'iPhone 16 Pro Max 4K ProRes'),
                  'Experte de catégorie avec note moyenne de 4.95+ en Reels & TikTok',
                  'Délai de livraison rapide (moy. 48h)'
                ]"
              ></app-recommendation-match>

              <!-- Verified Mobile Studio Hardware -->
              <div class="equipment-card card-glass">
                <div class="eq-head flex-between">
                  <h3>Équipement Mobile</h3>
                  <span class="badge badge-primary">Équipement vérifié</span>
                </div>
                <p class="eq-desc">Matériel vérifié utilisé pour produire des livrables 4K HDR.</p>

                <div class="eq-list">
                  <div class="eq-item">
                    <span class="eq-label">Smartphone principal :</span>
                    <strong class="eq-val">{{ c.equipment?.smartphoneModel || 'iPhone 16 Pro Max' }}</strong>
                  </div>

                  @if (c.equipment?.gimbal) {
                    <div class="eq-item">
                      <span class="eq-label">Stabilisation :</span>
                      <strong class="eq-val">{{ c.equipment?.gimbal }}</strong>
                    </div>
                  }

                  @if (c.equipment?.audioGear) {
                    <div class="eq-item">
                      <span class="eq-label">Audio & Micros :</span>
                      <strong class="eq-val">{{ c.equipment?.audioGear }}</strong>
                    </div>
                  }

                  @if (c.equipment?.lighting) {
                    <div class="eq-item">
                      <span class="eq-label">Éclairage portable :</span>
                      <strong class="eq-val">{{ c.equipment?.lighting }}</strong>
                    </div>
                  }
                </div>

                <div class="escrow-notice">
                  <span class="shield-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </span>
                  <div>
                    <strong>Garantie Séquestre SnapConnect</strong>
                    <p>Vos fonds sont sécurisés jusqu'à votre validation finale des médias 4K.</p>
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

    .public-preview-banner {
      background: rgba(20, 168, 0, 0.12);
      border: 1px solid rgba(20, 168, 0, 0.35);
      border-radius: var(--radius-lg);
      padding: 0.75rem 1.25rem;
      margin-bottom: var(--space-6);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      color: #e2e8f0;
      font-size: var(--font-size-sm);
    }
    .preview-banner-left {
      display: flex;
      align-items: center;
      color: #86efac;
    }
    .preview-banner-left strong {
      color: #22c55e;
      margin: 0 4px;
    }
    .preview-back-btn {
      white-space: nowrap;
      background: #14a800;
      color: #ffffff;
      border: none;
      padding: 6px 14px;
      font-weight: 600;
      border-radius: 9999px;
      text-decoration: none;
      transition: background 0.2s;
    }
    .preview-back-btn:hover {
      background: #108a00;
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

    .empty-avatar-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.04);
      color: rgba(255, 255, 255, 0.35);
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
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  readonly auth  = inject(AuthService);
  private http   = inject(HttpClient);

  creator = signal<CreatorProfile | null>(null);
  activeTab = signal<'PORTFOLIO' | 'SERVICES' | 'ABOUT' | 'REVIEWS'>('PORTFOLIO');
  selectedMedia = signal<PortfolioItem | null>(null);

  isOwnProfile = computed(() => {
    const user = this.auth.currentUser();
    const c = this.creator();
    if (!user) return false;
    if (!c) return true;
    return String(user.id) === String(c.id) ||
           String(user.id) === String(c.userId) ||
           String(c.id) === 'me' ||
           (!!user.email && user.email.toLowerCase() === (c.email || '').toLowerCase());
  });

  displayAvatarUrl = computed(() => {
    const c = this.creator();
    const user = this.auth.currentUser();
    const isOwn = this.isOwnProfile();

    const clean = (url?: string | null) => {
      if (!url) return '';
      const s = String(url).trim();
      if (s.includes('photo-1534528741775') || s.includes('photo-1535713875002') || s.includes('placeholder')) return '';
      return s;
    };

    // 1. If viewing own profile, prioritize dedicated avatar and currentUser avatar
    if (isOwn && user) {
      const dedicated = clean(this.auth.getDedicatedAvatar(user.id, user.email));
      if (dedicated) return dedicated;

      const userAvatar = clean(user.avatarUrl);
      if (userAvatar) return userAvatar;

      try {
        const raw = localStorage.getItem(`snapconnect_creator_profile_${user.id}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          const cached = clean(parsed?.avatarUrl);
          if (cached) return cached;
        }
      } catch {}
    }

    // 2. Creator avatar from loaded profile
    const cAvatar = clean(c?.avatarUrl);
    if (cAvatar) return cAvatar;

    // 3. Dedicated storage for creator ID
    if (c?.id || c?.userId) {
      const dedicated = clean(this.auth.getDedicatedAvatar(c.id || c.userId, c.email));
      if (dedicated) return dedicated;
    }

    return '';
  });

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

  sampleReviews = [
    { id: 'r-1', authorName: 'Amine B. (Maison Alyssa Cosmétiques)', rating: 5.0, date: 'Il y a 2 jours', comment: 'Qualité 4K exceptionnelle ! Ses vidéos sur iPhone 16 Pro ont donné un rendu supérieur à notre ancienne équipe DSLR, livré en moins de 36 heures.' },
    { id: 'r-2', authorName: 'Karim T. (Gourmandise & Co Tunis)', rating: 5.0, date: 'Il y a 1 semaine', comment: 'L\'engagement sur notre page Instagram a bondi de 300% après la publication de ses Reels culinaires. Créatrice très pro.' }
  ];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const creatorId = params.get('id') || 'cr-1';
      this.loadCreator(creatorId);
    });
  }

  loadCreator(creatorId: string): void {
    const CREATORS_DIRECTORY: Record<string, CreatorProfile> = {
      'cr-1': {
        id: 'cr-1',
        userId: 'u-1',
        fullName: 'Sarah Ben Salem',
        email: 'sarah.bensalem@snapconnect.tn',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        title: 'Spécialiste TikTok & Reels UGC Viral',
        bio: 'Vidéaste mobile professionnelle basée à Tunis avec plus de 500K vues cumulées. Spécialisée dans les montages dynamiques, les accroches virales et les transitions tendances. Tout le contenu est capturé en 4K 60fps ProRes Log sur iPhone 16 Pro Max.',
        location: 'Tunis (La Marsa), Tunisie',
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
      },
      'cr-2': {
        id: 'cr-2',
        userId: 'u-2',
        fullName: 'Mehdi Trabelsi',
        email: 'mehdi.trabelsi@snapconnect.tn',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        title: 'Storyteller Mobile Food & Gastronomie',
        bio: 'Création de Reels 4K 60fps alléchants pour restaurants gastronomiques, salons de thé et hôtels de charme en Tunisie. Tournage sur Galaxy S24 Ultra avec objectifs macro et étalonnage cinéma.',
        location: 'Sousse, Tunisie',
        hourlyRate: 50,
        rating: 5.0,
        reviewsCount: 29,
        completedProjectsCount: 34,
        availabilityStatus: 'AVAILABLE',
        isVerified: true,
        specializations: ['Food & Restaurant', 'Product Photo', 'Promo Video'],
        equipment: {
          smartphoneModel: 'Samsung Galaxy S24 Ultra (8K/4K HDR)',
          gimbal: 'Zhiyun Smooth 5S',
          audioGear: 'DJI Mic 2',
          lighting: 'Nanlite LitoLite 5C'
        }
      },
      'cr-3': {
        id: 'cr-3',
        userId: 'u-3',
        fullName: 'Yassine Gharbi',
        email: 'yassine.gharbi@snapconnect.tn',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        title: 'Visites Immobilières & Architecture Mobile 4K',
        bio: 'Prises de vue ultra-stabilisées au stabilisateur pour villas haut standing, maisons d\'hôtes et appartements à Tunis, Gammarth et Hammamet.',
        location: 'Hammamet / Tunis, Tunisie',
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
          audioGear: 'Hollyland Lark M2',
          lighting: 'Aputure Amaran MC'
        }
      },
      'cr-4': {
        id: 'cr-4',
        userId: 'u-4',
        fullName: 'Khalil Jaziri',
        email: 'khalil.jaziri@snapconnect.tn',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
        title: 'Reels Événementiels & Soirées en Direct',
        bio: 'Couverture dynamique d\'événements, mariages modernes, concerts et festivals en Tunisie. Prises de vue en basse lumière avec livraison express en 24h.',
        location: 'Sfax / Tunis, Tunisie',
        hourlyRate: 40,
        rating: 4.85,
        reviewsCount: 16,
        completedProjectsCount: 20,
        availabilityStatus: 'AVAILABLE',
        isVerified: true,
        specializations: ['Events & Moments', 'Reels & TikTok', 'Nightlife'],
        equipment: {
          smartphoneModel: 'iPhone 16 Pro (4K 60fps)',
          gimbal: 'DJI OM 5',
          audioGear: 'Shure MV88+',
          lighting: 'Godox LED6R'
        }
      },
      'cr-5': {
        id: 'cr-5',
        userId: 'u-5',
        fullName: 'Mariem Mansour',
        email: 'mariem.mansour@snapconnect.tn',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        title: 'Styliste Produit E-commerce & Créatrice UGC',
        bio: 'Mise en scène studio et packshots macro pour cosmétiques bio, bijoux artisanaux tunisiens et marques D2C locales. Haute conversion e-commerce garantie.',
        location: 'Ariana (Ennasr), Tunisie',
        hourlyRate: 55,
        rating: 4.98,
        reviewsCount: 45,
        completedProjectsCount: 52,
        availabilityStatus: 'AVAILABLE',
        isVerified: true,
        specializations: ['Product Photography', 'UGC Content', 'Fashion'],
        equipment: {
          smartphoneModel: 'iPhone 15 Pro Max (ProRes)',
          gimbal: 'DJI OM 6',
          audioGear: 'Rode Wireless ME',
          lighting: 'Neewer 660 LED Panel Kit'
        }
      },
      'cr-6': {
        id: 'cr-6',
        userId: 'u-6',
        fullName: 'Aziz Khemir',
        email: 'aziz.khemir@snapconnect.tn',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        title: 'Vidéaste Mobile Automobile & Streetwear',
        bio: 'Plans dynamiques de véhicules, mode urbaine et séquences cinématographiques 4K 120fps au smartphone pour marques de mode et concessionnaires en Tunisie.',
        location: 'Bizerte / Tunis, Tunisie',
        hourlyRate: 65,
        rating: 4.92,
        reviewsCount: 27,
        completedProjectsCount: 31,
        availabilityStatus: 'AVAILABLE',
        isVerified: true,
        specializations: ['Promo Video', 'Fashion', 'Automotive'],
        equipment: {
          smartphoneModel: 'Samsung Galaxy S24 Ultra (8K/4K 120fps)',
          gimbal: 'Zhiyun Smooth 5S',
          audioGear: 'DJI Mic 2',
          lighting: 'Aputure Amaran 60x'
        }
      }
    };

    // Flexible resolution by id, alias or name
    const normalizedKey = String(creatorId || '').trim().toLowerCase();
    const current = this.auth.currentUser();
    let baseCreator: CreatorProfile | undefined;

    // 1. Prioritize current logged in creator (no override by mock cr-1)
    const isCurrent = !!current && (
      String(current.id) === String(creatorId) ||
      (!!current.email && current.email.toLowerCase() === normalizedKey) ||
      creatorId === 'me'
    );

    const cleanPhoto = (p?: string | null) => (!p || p.includes('photo-1534528741775') || p.includes('photo-1535713875002') || p.includes('placeholder')) ? '' : p.trim();

    if (isCurrent && current) {
      let customCache: any = {};
      try {
        const raw = localStorage.getItem(`snapconnect_creator_profile_${current.id}`);
        if (raw) customCache = JSON.parse(raw);
      } catch {}

      const dedicated = cleanPhoto(this.auth.getDedicatedAvatar(current.id, current.email));
      const userAvatar = dedicated || cleanPhoto(current.avatarUrl) || cleanPhoto(customCache.avatarUrl) || '';

      baseCreator = {
        id: String(current.id),
        userId: String(current.id),
        fullName: current.fullName || customCache.fullName || 'Mon Profil Créateur',
        email: current.email,
        avatarUrl: userAvatar,
        title: current.title || customCache.title || 'Vidéaste Mobile 4K & UGC',
        bio: current.bio || customCache.bio || 'Créateur certifié de contenu smartphone sur SnapConnect.',
        location: current.location || customCache.location || 'Tunis, Tunisie',
        hourlyRate: current.hourlyRate || customCache.hourlyRate || 45,
        rating: 5.0,
        reviewsCount: 1,
        completedProjectsCount: 1,
        availabilityStatus: 'AVAILABLE',
        isVerified: true,
        specializations: customCache.skills || ['Reels & TikTok', 'UGC Content', 'Fashion'],
        equipment: {
          smartphoneModel: current.smartphoneModel || customCache.smartphoneModel || 'iPhone 16 Pro Max (4K ProRes)',
          gimbal: customCache.gimbal || 'DJI Osmo Mobile 6',
          audioGear: customCache.audioGear || 'Micro Sans Fil 48kHz',
          lighting: 'LED RGB'
        }
      };
    } else if (CREATORS_DIRECTORY[creatorId]) {
      baseCreator = CREATORS_DIRECTORY[creatorId];
    } else if (normalizedKey === 'cr-1' || normalizedKey.includes('sarah')) {
      baseCreator = CREATORS_DIRECTORY['cr-1'];
    } else if (normalizedKey === 'cr-2' || normalizedKey.includes('mehdi')) {
      baseCreator = CREATORS_DIRECTORY['cr-2'];
    } else if (normalizedKey === 'cr-3' || normalizedKey.includes('yassine')) {
      baseCreator = CREATORS_DIRECTORY['cr-3'];
    } else if (normalizedKey === 'cr-4' || normalizedKey.includes('khalil')) {
      baseCreator = CREATORS_DIRECTORY['cr-4'];
    } else if (normalizedKey === 'cr-5' || normalizedKey.includes('mariem')) {
      baseCreator = CREATORS_DIRECTORY['cr-5'];
    } else if (normalizedKey === 'cr-6' || normalizedKey.includes('aziz')) {
      baseCreator = CREATORS_DIRECTORY['cr-6'];
    } else if (normalizedKey === 'sondes' || normalizedKey.includes('sondes')) {
      baseCreator = {
        id: 'sondes',
        userId: 'u-sondes',
        fullName: 'Sondes',
        email: 'sondes@snapconnect.tn',
        avatarUrl: this.auth.getDedicatedAvatar('sondes', 'sondes@snapconnect.tn') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        title: 'Créatrice Vidéo UGC & Contenu Smartphone 4K',
        bio: 'Spécialiste de la création de contenu mobile authentique, dynamique et engageant pour marques e-commerce et lifestyle en Tunisie. Prises de vue soignées en 4K 60fps.',
        location: 'Ain Draham / Jendouba, Tunisie',
        hourlyRate: 50,
        rating: 5.0,
        reviewsCount: 38,
        completedProjectsCount: 42,
        availabilityStatus: 'AVAILABLE',
        isVerified: true,
        specializations: ['UGC Content', 'Reels & TikTok', 'Mode & Hijab', 'Shooting Produit'],
        equipment: {
          smartphoneModel: 'iPhone 13 Pro (4K 60fps ProRes)',
          gimbal: 'DJI Osmo Mobile 6',
          audioGear: 'Micro HF Sans Fil',
          lighting: 'Anneau LED & Bicolore'
        }
      };
    } else {
      let customCache: any = {};
      try {
        const raw = localStorage.getItem(`snapconnect_creator_profile_${creatorId}`);
        if (raw) customCache = JSON.parse(raw);
      } catch {}

      const dedicated = cleanPhoto(this.auth.getDedicatedAvatar(creatorId));
      const rawPhoto = dedicated || customCache.avatarUrl || '';
      const fallbackAvatar = cleanPhoto(rawPhoto);

      baseCreator = {
        id: creatorId || 'cr-custom',
        userId: creatorId || 'cr-custom',
        fullName: customCache.fullName || 'Créateur SnapConnect',
        email: customCache.email || 'creator@snapconnect.tn',
        avatarUrl: fallbackAvatar,
        title: customCache.title || 'Créateur de Contenu Mobile 4K',
        bio: customCache.bio || 'Créateur certifié SnapConnect spécialisé dans les tournages smartphone haute définition.',
        location: customCache.location || 'Tunis, Tunisie',
        hourlyRate: customCache.hourlyRate || 45,
        rating: 5.0,
        reviewsCount: 1,
        completedProjectsCount: 1,
        availabilityStatus: 'AVAILABLE',
        isVerified: true,
        specializations: customCache.skills || ['Reels & TikTok', 'Photos Produits', 'Vidéographie Smartphone'],
        equipment: {
          smartphoneModel: customCache.smartphoneModel || 'iPhone 16 Pro Max (4K ProRes)',
          gimbal: customCache.gimbal || 'DJI Osmo Mobile 6',
          audioGear: customCache.audioGear || 'Rode Wireless Pro',
          lighting: 'LED RGB'
        }
      };
    }

    // Check cached custom profile
    try {
      const cached = localStorage.getItem(`snapconnect_creator_profile_${creatorId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.fullName) {
          const parsedAvatar = cleanPhoto(parsed.avatarUrl);
          baseCreator = {
            ...baseCreator,
            id: String(parsed.id || creatorId),
            userId: String(parsed.id || creatorId),
            fullName: parsed.fullName,
            email: parsed.email || baseCreator.email,
            avatarUrl: parsedAvatar || baseCreator.avatarUrl,
            title: parsed.title || baseCreator.title,
            bio: parsed.bio || baseCreator.bio,
            location: parsed.location || baseCreator.location,
            hourlyRate: parsed.hourlyRate || baseCreator.hourlyRate,
            equipment: {
              ...baseCreator.equipment,
              smartphoneModel: parsed.smartphoneModel || baseCreator.equipment?.smartphoneModel || 'iPhone 16 Pro Max (4K ProRes)'
            }
          };
        }
      }
    } catch {}

    this.creator.set(baseCreator);

    // Load contextual portfolio items for this creator
    const ALL_PORTFOLIO_ITEMS: Record<string, PortfolioItem[]> = {
      'cr-1': [
        { id: 'p-1', creatorId: 'cr-1', title: 'Neon Streetwear 4K 60fps', mediaType: 'IMAGE', mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80', equipmentUsed: 'iPhone 16 Pro Max • DJI OM 6', createdAt: '2026-08-01' },
        { id: 'p-2', creatorId: 'cr-1', title: 'Cosmetics Texture Macro', mediaType: 'IMAGE', mediaUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', equipmentUsed: 'iPhone 16 Pro 5x Telephoto', createdAt: '2026-08-05' },
        { id: 'p-3', creatorId: 'cr-1', title: 'Coffee Latte Art Pour', mediaType: 'IMAGE', mediaUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', equipmentUsed: 'iPhone 16 Pro 4K 120fps', createdAt: '2026-08-10' },
        { id: 'p-4', creatorId: 'cr-1', title: 'Sunset Roof Lookbook', mediaType: 'IMAGE', mediaUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80', equipmentUsed: 'iPhone 16 Pro ProRes Log', createdAt: '2026-08-12' }
      ],
      'cr-2': [
        { id: 'p-21', creatorId: 'cr-2', title: 'Brioche Dorée & Chocolat Chaud 8K', mediaType: 'IMAGE', mediaUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', equipmentUsed: 'Galaxy S24 Ultra • Macro 200MP', createdAt: '2026-08-02' },
        { id: 'p-22', creatorId: 'cr-2', title: 'Restaurant Gastronomique Sousse', mediaType: 'IMAGE', mediaUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', equipmentUsed: 'Galaxy S24 Ultra • Zhiyun Smooth 5S', createdAt: '2026-08-06' },
        { id: 'p-23', creatorId: 'cr-2', title: 'Cocktail Signature Glacé', mediaType: 'IMAGE', mediaUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', equipmentUsed: 'Galaxy S24 Ultra • 4K 60fps HDR', createdAt: '2026-08-11' }
      ],
      'cr-3': [
        { id: 'p-31', creatorId: 'cr-3', title: 'Villa Contemporaine Gammarth', mediaType: 'IMAGE', mediaUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80', equipmentUsed: 'iPhone 15 Pro Max • Ultra Grand-Angle 4K', createdAt: '2026-08-03' },
        { id: 'p-32', creatorId: 'cr-3', title: 'Piscine Miroir au Crépuscule', mediaType: 'IMAGE', mediaUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', equipmentUsed: 'iPhone 15 Pro Max • Insta360 Flow', createdAt: '2026-08-07' }
      ],
      'cr-4': [
        { id: 'p-41', creatorId: 'cr-4', title: 'Concert Live Festival Carthage', mediaType: 'IMAGE', mediaUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80', equipmentUsed: 'iPhone 16 Pro • Basse lumière 4K', createdAt: '2026-08-04' },
        { id: 'p-42', creatorId: 'cr-4', title: 'Soirée Gala Hôtel 5*', mediaType: 'IMAGE', mediaUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80', equipmentUsed: 'iPhone 16 Pro • DJI OM 5', createdAt: '2026-08-08' }
      ],
      'cr-5': [
        { id: 'p-51', creatorId: 'cr-5', title: 'Flacon Sérum Bio & Gouttes d\'Eau', mediaType: 'IMAGE', mediaUrl: 'https://images.unsplash.com/photo-1608248597359-0524458319f3?auto=format&fit=crop&w=800&q=80', equipmentUsed: 'iPhone 15 Pro Max • Neewer LED Panel Kit', createdAt: '2026-08-05' },
        { id: 'p-52', creatorId: 'cr-5', title: 'Bijoux Traditionnels Écrin Velours', mediaType: 'IMAGE', mediaUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', equipmentUsed: 'iPhone 15 Pro Max • Macro Studio', createdAt: '2026-08-09' }
      ],
      'cr-6': [
        { id: 'p-61', creatorId: 'cr-6', title: 'Supercar & Reflets Néon Nuit', mediaType: 'IMAGE', mediaUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', equipmentUsed: 'Galaxy S24 Ultra • 4K 120fps Rolling Shot', createdAt: '2026-08-06' },
        { id: 'p-62', creatorId: 'cr-6', title: 'Streetwear Lookbook Médina Tunis', mediaType: 'IMAGE', mediaUrl: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=800&q=80', equipmentUsed: 'Galaxy S24 Ultra • Zhiyun Smooth 5S', createdAt: '2026-08-10' }
      ],
      'sondes': [
        { id: 'p-s1', creatorId: 'sondes', title: 'Hijabi Brand Fashion Lookbook 4K', mediaType: 'VIDEO', mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', equipmentUsed: 'iPhone 13 Pro • 4K 60fps', createdAt: '2026-09-15' },
        { id: 'p-s2', creatorId: 'sondes', title: 'Cosmetics & Skincare UGC Reel', mediaType: 'VIDEO', mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', equipmentUsed: 'iPhone 13 Pro • Macro', createdAt: '2026-09-18' }
      ]
    };

    this.portfolioItems = ALL_PORTFOLIO_ITEMS[baseCreator.id] || ALL_PORTFOLIO_ITEMS['cr-1'];

    // Also check local portfolio uploads
    try {
      const cachedPortfolio = localStorage.getItem(`snapconnect_creator_portfolio_${creatorId}`);
      if (cachedPortfolio) {
        const parsedPort = JSON.parse(cachedPortfolio);
        if (Array.isArray(parsedPort) && parsedPort.length > 0) {
          this.portfolioItems = [...parsedPort, ...this.portfolioItems];
        }
      }
    } catch {}

    // If ID is not in seed directory, fetch real user profile from MySQL
    if (creatorId && !CREATORS_DIRECTORY[creatorId]) {
      this.http.get<any>('http://localhost:8080/api/creators/' + creatorId).subscribe({
        next: (u) => {
          if (u) {
            const cleanServerAvatar = cleanPhoto(u.avatarUrl);
            const dedicated = cleanPhoto(this.auth.getDedicatedAvatar(u.id, u.email));
            const resolved = cleanServerAvatar || dedicated || baseCreator!.avatarUrl || '';
            this.creator.set({
              id: String(u.id),
              userId: String(u.id),
              fullName: u.fullName || baseCreator!.fullName,
              email: u.email || baseCreator!.email,
              avatarUrl: resolved,
              title: u.title || baseCreator!.title,
              bio: u.bio || baseCreator!.bio,
              location: u.location || baseCreator!.location,
              hourlyRate: u.hourlyRate || baseCreator!.hourlyRate,
              rating: baseCreator!.rating,
              reviewsCount: baseCreator!.reviewsCount,
              completedProjectsCount: baseCreator!.completedProjectsCount,
              availabilityStatus: 'AVAILABLE',
              isVerified: u.isVerified ?? true,
              specializations: baseCreator!.specializations,
              equipment: {
                smartphoneModel: u.smartphoneModel || baseCreator!.equipment?.smartphoneModel || 'iPhone 16 Pro Max (4K ProRes)',
                gimbal: 'DJI Osmo Mobile 6',
                audioGear: 'Rode Wireless Pro 32-bit float',
                lighting: 'Aputure Amaran MC RGB'
              }
            });
          }
        },
        error: () => {}
      });
    }
  }

  contactCreator(): void {
    const c = this.creator();
    if (!c) return;

    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: `/creators/${c.id}` } });
      return;
    }

    const targetRoute = this.auth.isCreator() ? '/creator/messages' : '/client/messages';
    const targetUserId = !isNaN(Number(c.userId)) ? Number(c.userId) : (!isNaN(Number(c.id)) ? Number(c.id) : null);

    this.router.navigate([targetRoute], {
      queryParams: {
        creatorId: targetUserId,
        creatorName: c.fullName,
        creatorAvatar: this.displayAvatarUrl() || c.avatarUrl,
        creatorEmail: c.email,
        contextType: 'CREATOR_PROFILE',
        contextTitle: c.title
      }
    });
  }
}
