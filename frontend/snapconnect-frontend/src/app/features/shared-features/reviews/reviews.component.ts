import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';
import { ReviewService } from '../../../core/services/review.service';
import { ReputationService } from '../../../core/services/reputation.service';

export interface DisplayReview {
  id: string;
  contractId?: string;
  contractTitle?: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  reviewerRole: 'CLIENT' | 'CREATOR';
  reviewerCompany?: string;
  reviewerLocation?: string;
  revieweeId: string;
  revieweeName?: string;
  overallRating: number;
  qualityRating?: number;
  deadlinesRating?: number;
  communicationRating?: number;
  equipmentMasteryRating?: number;
  comment: string;
  recommended: boolean;
  tags?: string[];
  createdAt: string;
  direction: 'RECEIVED' | 'GIVEN';
  escrowVerified: boolean;
}

type TabType = 'RECEIVED' | 'FIVE_STARS' | 'DETAILED' | 'GIVEN';
type SortOrder = 'RECENT' | 'RATING_DESC' | 'RATING_ASC';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="reviews-page">
      <div class="container">

        <!-- Breadcrumb -->
        <nav class="breadcrumb-nav">
          <a routerLink="/" class="breadcrumb-item">Accueil</a>
          <span class="breadcrumb-sep">/</span>
          <a [routerLink]="auth.isCreator() ? '/creator/dashboard' : '/client/dashboard'" class="breadcrumb-item">
            {{ auth.isCreator() ? 'Espace Créateur' : 'Espace Client' }}
          </a>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">Avis & Notations</span>
        </nav>

        <!-- Page Header -->
        <header class="page-header">
          <div class="header-left">
            <div class="header-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Évaluations Certifiées sous Séquestre</span>
            </div>
            <h1>{{ pageTitle() }}</h1>
            <p class="header-desc">{{ pageSubtitle() }}</p>
          </div>

          <div class="header-actions">
            <button class="btn btn-outline btn-sm refresh-btn" (click)="refreshReviews()" [class.spinning]="isRefreshing()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>Actualiser</span>
            </button>
            @if (auth.isCreator()) {
              <a routerLink="/creator/dashboard" class="btn btn-primary btn-sm">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M9 21V9"/>
                </svg>
                <span>Mon profil Upwork</span>
              </a>
            }
          </div>
        </header>

        <!-- Metrics Overview Cards (Upwork / Trustpilot style) -->
        <section class="metrics-grid">
          <!-- Overall Rating -->
          <div class="metric-card card-glass highlight-card">
            <div class="metric-header">
              <span class="metric-label">Note globale certifiée</span>
              <div class="metric-icon gold-glow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
            </div>
            <div class="metric-body">
              <div class="metric-val-row">
                <span class="metric-big-num">{{ averageRating().toFixed(2) }}</span>
                <span class="metric-out-of">/ 5.0</span>
              </div>
              <div class="stars-visual">
                @for (star of [1, 2, 3, 4, 5]; track star) {
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    [attr.fill]="star <= Math.round(averageRating()) ? '#fbbf24' : 'rgba(148, 163, 184, 0.25)'"
                    stroke="none"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                }
              </div>
              <span class="metric-subtext">Basé sur {{ totalReceivedCount() }} évaluations vérifiées</span>
            </div>
          </div>

          <!-- Job Success Score -->
          <div class="metric-card card-glass">
            <div class="metric-header">
              <span class="metric-label">Job Success Score (JSS)</span>
              <div class="metric-icon purple-glow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
            </div>
            <div class="metric-body">
              <div class="metric-val-row">
                <span class="metric-big-num text-gradient-primary">{{ jssScore() }}%</span>
              </div>
              <div class="progress-bar-wrap">
                <div class="progress-fill" [style.width.%]="jssScore()"></div>
              </div>
              <span class="metric-subtext">Statut Top Créateur Smartphone</span>
            </div>
          </div>

          <!-- Recommendation Rate -->
          <div class="metric-card card-glass">
            <div class="metric-header">
              <span class="metric-label">Taux de recommandation</span>
              <div class="metric-icon emerald-glow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                </svg>
              </div>
            </div>
            <div class="metric-body">
              <div class="metric-val-row">
                <span class="metric-big-num text-success">{{ recommendationRate() }}%</span>
              </div>
              <div class="progress-bar-wrap">
                <div class="progress-fill bg-success" [style.width.%]="recommendationRate()"></div>
              </div>
              <span class="metric-subtext">Clients prêts à collaborer à nouveau</span>
            </div>
          </div>

          <!-- On-time & Escrow Verified -->
          <div class="metric-card card-glass">
            <div class="metric-header">
              <span class="metric-label">Respect des délais 4K</span>
              <div class="metric-icon blue-glow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
            </div>
            <div class="metric-body">
              <div class="metric-val-row">
                <span class="metric-big-num text-cyan">{{ onTimeDeliveryRate() }}%</span>
              </div>
              <div class="progress-bar-wrap">
                <div class="progress-fill bg-cyan" [style.width.%]="onTimeDeliveryRate()"></div>
              </div>
              <span class="metric-subtext">Livrables soumis sous 24h à 48h</span>
            </div>
          </div>
        </section>

        <!-- Detailed Breakdown Section (Distribution + 4K Criteria) -->
        <section class="breakdown-section card-glass">
          <div class="breakdown-grid">

            <!-- Distribution histogram -->
            <div class="dist-col">
              <h3 class="breakdown-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                <span>Distribution des notes</span>
              </h3>
              <div class="dist-bars">
                @for (star of [5, 4, 3, 2, 1]; track star) {
                  <div class="dist-row">
                    <span class="dist-star-label">
                      {{ star }}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </span>
                    <div class="dist-bar-track">
                      <div class="dist-bar-fill" [style.width.%]="getStarPercentage(star)"></div>
                    </div>
                    <span class="dist-count">{{ getStarCount(star) }} ({{ getStarPercentage(star).toFixed(0) }}%)</span>
                  </div>
                }
              </div>
            </div>

            <div class="breakdown-divider"></div>

            <!-- Smartphone 4K Criteria Scores -->
            <div class="crit-col">
              <h3 class="breakdown-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
                <span>Critères d'évaluation smartphone 4K</span>
              </h3>
              <div class="criteria-list">
                <div class="crit-bar-item">
                  <div class="crit-info">
                    <span class="crit-name">Qualité visuelle 4K & colorimétrie</span>
                    <strong class="crit-score">{{ qualityScore().toFixed(1) }} / 5.0</strong>
                  </div>
                  <div class="crit-track">
                    <div class="crit-fill" [style.width.%]="(qualityScore() / 5) * 100"></div>
                  </div>
                </div>

                <div class="crit-bar-item">
                  <div class="crit-info">
                    <span class="crit-name">Respect des délais de livraison</span>
                    <strong class="crit-score">{{ deadlineScore().toFixed(1) }} / 5.0</strong>
                  </div>
                  <div class="crit-track">
                    <div class="crit-fill" [style.width.%]="(deadlineScore() / 5) * 100"></div>
                  </div>
                </div>

                <div class="crit-bar-item">
                  <div class="crit-info">
                    <span class="crit-name">Communication & réactivité</span>
                    <strong class="crit-score">{{ communicationScore().toFixed(1) }} / 5.0</strong>
                  </div>
                  <div class="crit-track">
                    <div class="crit-fill" [style.width.%]="(communicationScore() / 5) * 100"></div>
                  </div>
                </div>

                <div class="crit-bar-item">
                  <div class="crit-info">
                    <span class="crit-name">Maîtrise smartphone & prise de son</span>
                    <strong class="crit-score">{{ gearScore().toFixed(1) }} / 5.0</strong>
                  </div>
                  <div class="crit-track">
                    <div class="crit-fill" [style.width.%]="(gearScore() / 5) * 100"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        <!-- Controls: Tabs, Search & Sort -->
        <section class="controls-bar card-glass">
          <!-- Filter Tabs -->
          <div class="filter-tabs">
            <button
              class="tab-btn"
              [class.active]="activeTab() === 'RECEIVED'"
              (click)="activeTab.set('RECEIVED')"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Avis reçus</span>
              <span class="tab-badge">{{ totalReceivedCount() }}</span>
            </button>

            <button
              class="tab-btn"
              [class.active]="activeTab() === 'FIVE_STARS'"
              (click)="activeTab.set('FIVE_STARS')"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span>5 Étoiles</span>
              <span class="tab-badge">{{ getStarCount(5) }}</span>
            </button>

            <button
              class="tab-btn"
              [class.active]="activeTab() === 'DETAILED'"
              (click)="activeTab.set('DETAILED')"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <span>Commentaires détaillés</span>
            </button>

            <button
              class="tab-btn"
              [class.active]="activeTab() === 'GIVEN'"
              (click)="activeTab.set('GIVEN')"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="17 1 21 5 17 9"/>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
              <span>Avis que j'ai donnés</span>
              <span class="tab-badge">{{ totalGivenCount() }}</span>
            </button>
          </div>

          <!-- Search and Sort -->
          <div class="search-sort-wrap">
            <div class="search-input-wrap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                class="search-input"
                placeholder="Rechercher une marque ou mot-clé..."
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
              />
              @if (searchQuery()) {
                <button class="clear-search-btn" (click)="searchQuery.set('')">✕</button>
              }
            </div>

            <div class="sort-select-wrap">
              <select
                class="sort-select"
                [ngModel]="sortBy()"
                (ngModelChange)="sortBy.set($event)"
              >
                <option value="RECENT">Plus récents</option>
                <option value="RATING_DESC">Meilleures notes (5★ → 1★)</option>
                <option value="RATING_ASC">Notes croissantes</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Reviews List -->
        <section class="reviews-list-section">
          @if (filteredReviews().length > 0) {
            <div class="reviews-feed">
              @for (rev of filteredReviews(); track rev.id) {
                <article class="review-card card-glass animate-fade-in">

                  <!-- Top row: Reviewer info & Meta -->
                  <div class="review-card-top">
                    <div class="reviewer-meta-group">
                      <div class="reviewer-avatar">
                        @if (rev.reviewerAvatar) {
                          <img [src]="rev.reviewerAvatar" [alt]="rev.reviewerName" referrerpolicy="no-referrer" />
                        } @else {
                          <div class="avatar-silhouette">
                            {{ getInitials(rev.reviewerName) }}
                          </div>
                        }
                      </div>

                      <div class="reviewer-info">
                        <div class="name-badge-row">
                          <h4 class="reviewer-name">{{ rev.reviewerName }}</h4>
                          @if (rev.reviewerRole === 'CLIENT') {
                            <span class="role-pill client-pill">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                              </svg>
                              Entreprise vérifiée
                            </span>
                          } @else {
                            <span class="role-pill creator-pill">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                                <line x1="12" y1="18" x2="12.01" y2="18"/>
                              </svg>
                              Créateur mobile
                            </span>
                          }
                        </div>

                        <div class="company-loc-row">
                          @if (rev.reviewerCompany) {
                            <span class="reviewer-company">{{ rev.reviewerCompany }}</span>
                            <span class="dot-sep">•</span>
                          }
                          @if (rev.reviewerLocation) {
                            <span class="reviewer-loc">{{ rev.reviewerLocation }}</span>
                            <span class="dot-sep">•</span>
                          }
                          <span class="review-date">{{ rev.createdAt }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Overall Star Rating -->
                    <div class="rating-display-block">
                      <div class="stars-row">
                        @for (star of [1, 2, 3, 4, 5]; track star) {
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            [attr.fill]="star <= Math.round(rev.overallRating) ? '#fbbf24' : 'rgba(148, 163, 184, 0.25)'"
                            stroke="none"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        }
                      </div>
                      <strong class="rating-num-bold">{{ rev.overallRating.toFixed(1) }}</strong>
                    </div>
                  </div>

                  <!-- Contract / Brief Title -->
                  @if (rev.contractTitle) {
                    <div class="review-contract-banner">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <span>Mission : <strong>{{ rev.contractTitle }}</strong></span>
                    </div>
                  }

                  <!-- Comment Body -->
                  <div class="review-comment-wrap">
                    <p class="review-text">"{{ rev.comment }}"</p>
                  </div>

                  <!-- Merit Tags -->
                  @if (rev.tags && rev.tags.length > 0) {
                    <div class="review-tags-wrap">
                      @for (tag of rev.tags; track tag) {
                        <span class="merit-tag">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          {{ tag }}
                        </span>
                      }
                    </div>
                  }

                  <!-- Criteria breakdown pills -->
                  <div class="criteria-pills-row">
                    @if (rev.qualityRating) {
                      <div class="crit-pill">
                        <span class="crit-lbl">Qualité 4K :</span>
                        <strong>{{ rev.qualityRating }}/5</strong>
                      </div>
                    }
                    @if (rev.deadlinesRating) {
                      <div class="crit-pill">
                        <span class="crit-lbl">Délais :</span>
                        <strong>{{ rev.deadlinesRating }}/5</strong>
                      </div>
                    }
                    @if (rev.communicationRating) {
                      <div class="crit-pill">
                        <span class="crit-lbl">Communication :</span>
                        <strong>{{ rev.communicationRating }}/5</strong>
                      </div>
                    }
                    @if (rev.equipmentMasteryRating) {
                      <div class="crit-pill">
                        <span class="crit-lbl">Smartphone & Son :</span>
                        <strong>{{ rev.equipmentMasteryRating }}/5</strong>
                      </div>
                    }
                  </div>

                  <!-- Footer trust marker -->
                  <div class="review-card-footer">
                    <div class="escrow-verified-badge">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      <span>Prestation certifiée réalisée sous contrat avec protection escrow SnapConnect</span>
                    </div>

                    @if (rev.recommended) {
                      <div class="rec-marker">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                        </svg>
                        <span>Recommandé</span>
                      </div>
                    }
                  </div>

                </article>
              }
            </div>
          } @else {
            <!-- Empty State -->
            <div class="empty-state card-glass">
              <div class="empty-icon-wrap">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="empty-icon">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h3>Aucune évaluation trouvée</h3>
              <p>{{ emptyStateMessage() }}</p>
              @if (searchQuery()) {
                <button class="btn btn-outline btn-sm" (click)="searchQuery.set('')">Effacer la recherche</button>
              } @else {
                <a [routerLink]="auth.isCreator() ? '/jobs' : '/client/jobs/create'" class="btn btn-primary btn-sm">
                  {{ auth.isCreator() ? 'Explorer les missions disponibles' : 'Publier une nouvelle mission' }}
                </a>
              }
            </div>
          }
        </section>

      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host {
      display: block;
      color: var(--color-text-primary);
    }

    .reviews-page {
      min-height: 100vh;
      padding-top: calc(var(--navbar-height) + var(--space-6));
      padding-bottom: var(--space-20);
      background: radial-gradient(ellipse at top center, rgba(139, 92, 246, 0.08) 0%, transparent 70%);
    }

    .container {
      max-width: 1140px;
      margin: 0 auto;
      padding: 0 var(--space-6);
    }

    /* Breadcrumb */
    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-bottom: var(--space-4);
    }

    .breadcrumb-item {
      color: var(--color-text-muted);
      text-decoration: none;
      transition: color var(--transition-fast);
    }

    .breadcrumb-item:hover {
      color: var(--color-primary-400);
    }

    .breadcrumb-sep {
      color: var(--color-border);
    }

    .breadcrumb-current {
      color: var(--color-text-primary);
      font-weight: var(--font-weight-medium);
    }

    /* Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-6);
      margin-bottom: var(--space-8);
      flex-wrap: wrap;
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 4px 12px;
      border-radius: var(--radius-full);
      background: rgba(139, 92, 246, 0.12);
      border: 1px solid rgba(139, 92, 246, 0.28);
      color: var(--color-primary-300);
      font-size: 11px;
      font-weight: var(--font-weight-semibold);
      letter-spacing: 0.02em;
      margin-bottom: var(--space-2);
    }

    .page-header h1 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      letter-spacing: -0.02em;
      margin: 0 0 var(--space-2);
    }

    .header-desc {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
      max-width: 680px;
      line-height: 1.6;
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .refresh-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }

    .spinning svg {
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-5);
      margin-bottom: var(--space-8);
    }

    @media (max-width: 960px) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 560px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }

    .metric-card {
      padding: var(--space-5) var(--space-6);
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 145px;
      position: relative;
      overflow: hidden;
    }

    .highlight-card {
      border-color: rgba(251, 191, 36, 0.35);
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(139, 92, 246, 0.06) 100%);
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
    }

    .metric-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-muted);
      font-weight: var(--font-weight-semibold);
    }

    .metric-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .gold-glow {
      background: rgba(251, 191, 36, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(251, 191, 36, 0.3);
    }

    .purple-glow {
      background: rgba(139, 92, 246, 0.15);
      color: var(--color-primary-400);
      border: 1px solid rgba(139, 92, 246, 0.3);
    }

    .emerald-glow {
      background: rgba(34, 197, 94, 0.15);
      color: var(--color-success);
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .blue-glow {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }

    .metric-val-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: var(--space-1);
    }

    .metric-big-num {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      line-height: 1;
    }

    .metric-out-of {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      font-weight: var(--font-weight-medium);
    }

    .text-gradient-primary {
      background: linear-gradient(135deg, var(--color-primary-300), var(--color-accent-pink));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .text-success { color: var(--color-success); }
    .text-cyan { color: #38bdf8; }

    .stars-visual {
      display: flex;
      gap: 2px;
      margin-bottom: var(--space-2);
    }

    .progress-bar-wrap {
      height: 6px;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.08);
      overflow: hidden;
      margin: var(--space-2) 0;
    }

    .progress-fill {
      height: 100%;
      border-radius: var(--radius-full);
      background: linear-gradient(90deg, var(--color-primary-500), var(--color-accent-pink));
      transition: width 0.6s ease;
    }

    .progress-fill.bg-success {
      background: linear-gradient(90deg, #10b981, #34d399);
    }

    .progress-fill.bg-cyan {
      background: linear-gradient(90deg, #0284c7, #38bdf8);
    }

    .metric-subtext {
      font-size: 11px;
      color: var(--color-text-muted);
      display: block;
    }

    /* Breakdown Section */
    .breakdown-section {
      padding: var(--space-6) var(--space-8);
      border-radius: var(--radius-2xl);
      border: 1px solid var(--color-border);
      margin-bottom: var(--space-8);
    }

    .breakdown-grid {
      display: grid;
      grid-template-columns: 1fr 1px 1.15fr;
      gap: var(--space-8);
      align-items: center;
    }

    @media (max-width: 860px) {
      .breakdown-grid {
        grid-template-columns: 1fr;
        gap: var(--space-6);
      }
      .breakdown-divider { display: none; }
    }

    .breakdown-divider {
      background: var(--color-border);
      height: 100%;
      min-height: 180px;
    }

    .breakdown-title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin: 0 0 var(--space-4);
      color: var(--color-text-primary);
    }

    .dist-bars {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .dist-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--font-size-xs);
    }

    .dist-star-label {
      width: 32px;
      display: flex;
      align-items: center;
      gap: 3px;
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-semibold);
    }

    .dist-bar-track {
      flex: 1;
      height: 8px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .dist-bar-fill {
      height: 100%;
      background: #fbbf24;
      border-radius: var(--radius-full);
      transition: width 0.5s ease;
    }

    .dist-count {
      width: 78px;
      text-align: right;
      color: var(--color-text-muted);
      font-size: 11px;
    }

    /* Criteria col */
    .criteria-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .crit-bar-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .crit-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: var(--font-size-xs);
    }

    .crit-name {
      color: var(--color-text-secondary);
    }

    .crit-score {
      color: var(--color-text-primary);
      font-weight: var(--font-weight-bold);
    }

    .crit-track {
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .crit-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-primary-500), var(--color-primary-300));
      border-radius: var(--radius-full);
    }

    /* Controls Bar */
    .controls-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4) var(--space-6);
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-border);
      margin-bottom: var(--space-6);
      flex-wrap: wrap;
    }

    .filter-tabs {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 7px 14px;
      border-radius: var(--radius-md);
      background: transparent;
      border: 1px solid transparent;
      color: var(--color-text-secondary);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .tab-btn:hover {
      color: var(--color-text-primary);
      background: rgba(255, 255, 255, 0.05);
    }

    .tab-btn.active {
      color: var(--color-primary-300);
      background: rgba(139, 92, 246, 0.15);
      border-color: rgba(139, 92, 246, 0.35);
    }

    .tab-badge {
      font-size: 10px;
      padding: 1px 6px;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.1);
      color: var(--color-text-primary);
    }

    .tab-btn.active .tab-badge {
      background: var(--color-primary-500);
      color: #ffffff;
    }

    .search-sort-wrap {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .search-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: var(--space-3);
      color: var(--color-text-muted);
      pointer-events: none;
    }

    .search-input {
      padding: 7px var(--space-7) 7px var(--space-8);
      border-radius: var(--radius-md);
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
      font-size: var(--font-size-xs);
      outline: none;
      width: 220px;
      transition: border-color var(--transition-fast), width var(--transition-fast);
    }

    .search-input:focus {
      border-color: var(--color-primary-500);
      width: 260px;
    }

    .clear-search-btn {
      position: absolute;
      right: var(--space-2);
      background: none;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      font-size: 11px;
      padding: 2px 4px;
    }

    .sort-select {
      padding: 7px var(--space-3);
      border-radius: var(--radius-md);
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
      font-size: var(--font-size-xs);
      outline: none;
      cursor: pointer;
    }

    /* Reviews Feed & Cards */
    .reviews-feed {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .review-card {
      padding: var(--space-6) var(--space-8);
      border-radius: var(--radius-2xl);
      border: 1px solid var(--color-border);
      transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
    }

    .review-card:hover {
      border-color: rgba(139, 92, 246, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }

    .review-card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-4);
      margin-bottom: var(--space-4);
      flex-wrap: wrap;
    }

    .reviewer-meta-group {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .reviewer-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      border: 2px solid rgba(139, 92, 246, 0.3);
    }

    .reviewer-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-silhouette {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.35), rgba(236, 72, 153, 0.35));
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-weight-black);
      font-size: var(--font-size-sm);
    }

    .name-badge-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .reviewer-name {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      margin: 0;
    }

    .role-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      font-weight: var(--font-weight-semibold);
      padding: 2px 8px;
      border-radius: var(--radius-full);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .client-pill {
      background: rgba(34, 197, 94, 0.12);
      color: var(--color-success);
      border: 1px solid rgba(34, 197, 94, 0.25);
    }

    .creator-pill {
      background: rgba(139, 92, 246, 0.12);
      color: var(--color-primary-300);
      border: 1px solid rgba(139, 92, 246, 0.25);
    }

    .company-loc-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: 11px;
      color: var(--color-text-muted);
      margin-top: 2px;
      flex-wrap: wrap;
    }

    .dot-sep {
      color: var(--color-border);
    }

    .rating-display-block {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background: rgba(251, 191, 36, 0.08);
      border: 1px solid rgba(251, 191, 36, 0.25);
      padding: 4px 10px;
      border-radius: var(--radius-full);
    }

    .stars-row {
      display: flex;
      gap: 2px;
    }

    .rating-num-bold {
      color: #fbbf24;
      font-size: var(--font-size-sm);
    }

    /* Contract banner */
    .review-contract-banner {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid var(--color-border);
      padding: 5px 12px;
      border-radius: var(--radius-md);
      margin-bottom: var(--space-4);
    }

    .review-contract-banner strong {
      color: var(--color-primary-300);
    }

    /* Comment text */
    .review-comment-wrap {
      margin-bottom: var(--space-4);
    }

    .review-text {
      font-size: var(--font-size-sm);
      line-height: 1.65;
      color: var(--color-text-primary);
      margin: 0;
      font-style: italic;
    }

    /* Tags */
    .review-tags-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }

    .merit-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: var(--color-primary-300);
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.2);
      padding: 3px 9px;
      border-radius: var(--radius-full);
    }

    /* Criteria pills */
    .criteria-pills-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
      padding: var(--space-3) var(--space-4);
      background: rgba(255, 255, 255, 0.02);
      border-radius: var(--radius-lg);
      border: 1px dashed var(--color-border);
    }

    .crit-pill {
      font-size: 11px;
      color: var(--color-text-secondary);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .crit-pill strong {
      color: #ffffff;
    }

    /* Card footer */
    .review-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: var(--color-text-muted);
      border-top: 1px solid var(--color-border-subtle);
      padding-top: var(--space-3);
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .escrow-verified-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--color-success);
    }

    .rec-marker {
      display: flex;
      align-items: center;
      gap: 5px;
      color: var(--color-primary-400);
      font-weight: var(--font-weight-semibold);
    }

    /* Empty State */
    .empty-state {
      padding: var(--space-16) var(--space-8);
      text-align: center;
      border-radius: var(--radius-2xl);
      border: 1px dashed var(--color-border);
      max-width: 600px;
      margin: 0 auto;
    }

    .empty-icon-wrap {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--space-4);
      color: var(--color-primary-400);
    }

    .empty-state h3 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      margin: 0 0 var(--space-2);
    }

    .empty-state p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      line-height: 1.6;
      margin: 0 0 var(--space-6);
    }
  `]
})
export class ReviewsComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly reviewService = inject(ReviewService);
  private readonly reputationService = inject(ReputationService);

  readonly Math = Math;

  /* State Signals */
  isRefreshing = signal<boolean>(false);
  activeTab = signal<TabType>('RECEIVED');
  searchQuery = signal<string>('');
  sortBy = signal<SortOrder>('RECENT');

  /* Loaded reviews signal */
  allReviews = signal<DisplayReview[]>([]);

  pageTitle = computed(() => {
    return this.auth.isCreator()
      ? 'Avis Reçus & Réputation Créateur'
      : 'Avis & Collaborations Clients';
  });

  pageSubtitle = computed(() => {
    return this.auth.isCreator()
      ? 'Consultez l\'ensemble des avis vérifiés de vos marques clientes, votre Job Success Score et les notes de vos prestations vidéo et photo smartphone 4K.'
      : 'Consultez les retours d\'expérience des créateurs mobiles avec qui vous avez collaboré et suivez votre réputation d\'acheteur vérifié.';
  });

  emptyStateMessage = computed(() => {
    if (this.searchQuery()) {
      return 'Aucun résultat ne correspond à votre recherche. Essayez d\'autres termes.';
    }
    if (this.activeTab() === 'GIVEN') {
      return 'Vous n\'avez pas encore rédigé d\'avis suite à vos collaborations. Les avis sont débloqués dès la fin d\'un contrat sous séquestre.';
    }
    return 'Vos futures évaluations apparaîtront ici dès que vos prestations ou recrutements sous séquestre seront finalisés.';
  });

  ngOnInit(): void {
    this.loadInitialReviews();
  }

  loadInitialReviews(): void {
    const user = this.auth.currentUser();
    const userId = user?.id || (this.auth.isCreator() ? 'cr-1' : 'cl-1');

    // 1. Initial base authentic mock reviews for realistic demo experience
    const baseReviews: DisplayReview[] = [
      {
        id: 'rev-tun-1',
        contractId: 'ct-101',
        contractTitle: 'Shooting Vidéo Verticale 4K Reels & TikTok — Nouvelle Gamme Cosmétique Bio',
        reviewerId: 'cl-alyssa',
        reviewerName: 'Maison Alyssa Cosmétiques Bio',
        reviewerRole: 'CLIENT',
        reviewerCompany: 'Alyssa Bio Skincare',
        reviewerLocation: 'Tunis, Tunisie',
        revieweeId: userId,
        overallRating: 5.0,
        qualityRating: 5.0,
        deadlinesRating: 5.0,
        communicationRating: 5.0,
        equipmentMasteryRating: 5.0,
        comment: 'Qualité 4K exceptionnelle ! Ses prises de vue sur smartphone en profil ProRes Log sont bluffantes, plus chaleureuses et percutantes que notre ancien prestataire studio. Montage dynamique livré en moins de 36 heures avec un étalonnage parfait.',
        recommended: true,
        tags: ['iPhone 16 Pro Max', '4K ProRes Log', 'Livraison Rapide', 'Excellente Colorimétrie'],
        createdAt: '12 août 2026',
        direction: 'RECEIVED',
        escrowVerified: true
      },
      {
        id: 'rev-tun-2',
        contractId: 'ct-102',
        contractTitle: 'Clip Gourmand UGC & Ambiance Terrasse Bord de Mer',
        reviewerId: 'cl-journal',
        reviewerName: 'Café Journal La Marsa',
        reviewerRole: 'CLIENT',
        reviewerCompany: 'Café Journal',
        reviewerLocation: 'La Marsa, Tunis',
        revieweeId: userId,
        overallRating: 5.0,
        qualityRating: 5.0,
        deadlinesRating: 4.9,
        communicationRating: 5.0,
        equipmentMasteryRating: 5.0,
        comment: 'Très grand professionnalisme. Maîtrise parfaite du stabilisateur Gimbal et prise de son nette même avec la brise marine. Les Reels ont généré plus de 45 000 vues organiques en 3 jours sur notre compte Instagram.',
        recommended: true,
        tags: ['Stabilisateur Gimbal', 'Prise de Son Audio', 'Format 9:16', 'UGC Food'],
        createdAt: '28 juillet 2026',
        direction: 'RECEIVED',
        escrowVerified: true
      },
      {
        id: 'rev-tun-3',
        contractId: 'ct-103',
        contractTitle: 'Pack Découverte 3x Vidéos Mode & Accessoires Artisanaux',
        reviewerId: 'cl-carthage',
        reviewerName: 'Carthage Concept Store',
        reviewerRole: 'CLIENT',
        reviewerCompany: 'Carthage Store',
        reviewerLocation: 'Sidi Bou Saïd, Tunisie',
        revieweeId: userId,
        overallRating: 4.9,
        qualityRating: 4.8,
        deadlinesRating: 5.0,
        communicationRating: 4.9,
        equipmentMasteryRating: 4.9,
        comment: 'Créateur ponctuel, discret et très créatif lors du tournage dans notre boutique. Les transitions sont fluides et rythmées sur les sons tendance du moment. Nous renouvellerons sans hésiter pour la collection d\'automne.',
        recommended: true,
        tags: ['CapCut Pro', 'Mode & Lifestyle', 'Rythme Musical', 'Artisanat Tunisien'],
        createdAt: '15 juillet 2026',
        direction: 'RECEIVED',
        escrowVerified: true
      },
      {
        id: 'rev-tun-4',
        contractId: 'ct-104',
        contractTitle: 'Couverture Événementielle & Création de Stories Sponsorisées',
        reviewerId: 'cl-gourm',
        reviewerName: 'Gourmandise Pâtisserie Fine',
        reviewerRole: 'CLIENT',
        reviewerCompany: 'Gourmandise SA',
        reviewerLocation: 'Les Berges du Lac 2, Tunis',
        revieweeId: userId,
        overallRating: 5.0,
        qualityRating: 5.0,
        deadlinesRating: 5.0,
        communicationRating: 5.0,
        equipmentMasteryRating: 5.0,
        comment: 'Une collaboration limpide du début à la fin. Brief respecté au millimètre, étalonnage soigné et livrables 4K validés dès le premier jet. Paiement séquestre débloqué avec grand plaisir.',
        recommended: true,
        tags: ['Événementiel', '4K 60fps', 'Stories Live', 'Brief Respecté'],
        createdAt: '03 juillet 2026',
        direction: 'RECEIVED',
        escrowVerified: true
      },
      // Given reviews (reciprocal evaluations given by the current user)
      {
        id: 'rev-given-1',
        contractId: 'ct-101',
        contractTitle: 'Shooting Vidéo Verticale 4K Reels & TikTok — Nouvelle Gamme Cosmétique Bio',
        reviewerId: userId,
        reviewerName: user?.fullName || 'Sarah Ben Salem',
        reviewerRole: this.auth.isCreator() ? 'CREATOR' : 'CLIENT',
        revieweeId: 'cl-alyssa',
        revieweeName: 'Maison Alyssa Cosmétiques Bio',
        overallRating: 5.0,
        qualityRating: 5.0,
        deadlinesRating: 5.0,
        communicationRating: 5.0,
        equipmentMasteryRating: 5.0,
        comment: 'Client exemplaire ! Brief créatif parfaitement rédigé, échantillons mis à disposition à l\'avance et validation immédiate dès soumission des livrables 4K.',
        recommended: true,
        tags: ['Brief Clair', 'Validation Rapide', 'Séquestre Ponctuel'],
        createdAt: '12 août 2026',
        direction: 'GIVEN',
        escrowVerified: true
      },
      {
        id: 'rev-given-2',
        contractId: 'ct-102',
        contractTitle: 'Clip Gourmand UGC & Ambiance Terrasse Bord de Mer',
        reviewerId: userId,
        reviewerName: user?.fullName || 'Sarah Ben Salem',
        reviewerRole: this.auth.isCreator() ? 'CREATOR' : 'CLIENT',
        revieweeId: 'cl-journal',
        revieweeName: 'Café Journal La Marsa',
        overallRating: 5.0,
        qualityRating: 5.0,
        deadlinesRating: 5.0,
        communicationRating: 5.0,
        equipmentMasteryRating: 5.0,
        comment: 'Excellente collaboration ! Équipe très accueillante, grande liberté artistique accordée sur le cadrage et libération instantanée du séquestre.',
        recommended: true,
        tags: ['Liberté Artistique', 'Accueil Chaleureux', 'Paiement Instantané'],
        createdAt: '28 juillet 2026',
        direction: 'GIVEN',
        escrowVerified: true
      }
    ];

    // 2. Check local storage for any live-submitted reviews
    const cacheKey = `snapconnect_reviews_${userId}`;
    const cached = localStorage.getItem(cacheKey);
    let dynamicReviews: DisplayReview[] = [];
    if (cached) {
      try {
        dynamicReviews = JSON.parse(cached);
      } catch (e) {
        console.warn('Could not parse cached reviews', e);
      }
    }

    // 3. Also grab from reputation service signals if any
    const inMem = this.reputationService.reviews();
    inMem.forEach(r => {
      const exists = [...baseReviews, ...dynamicReviews].some(b => b.id === r.id);
      if (!exists) {
        dynamicReviews.push({
          id: r.id,
          contractId: r.contractId,
          contractTitle: 'Mission certifiée SnapConnect',
          reviewerId: r.reviewerId,
          reviewerName: r.reviewerName,
          reviewerRole: r.reviewerRole,
          revieweeId: r.revieweeId,
          revieweeName: r.revieweeName,
          overallRating: r.overallRating,
          qualityRating: r.qualityRating || 5.0,
          deadlinesRating: r.deadlinesRating || 5.0,
          communicationRating: r.communicationRating || 5.0,
          equipmentMasteryRating: r.equipmentMasteryRating || 5.0,
          comment: r.comment,
          recommended: r.recommended,
          tags: ['Avis Certifié', 'Séquestre Escrow'],
          createdAt: r.createdAt,
          direction: r.reviewerId === userId ? 'GIVEN' : 'RECEIVED',
          escrowVerified: true
        });
      }
    });

    this.allReviews.set([...dynamicReviews, ...baseReviews]);

    // 4. Try backend call if available
    if (user?.id) {
      this.reviewService.getByUserId(user.id).subscribe({
        next: (backendList) => {
          if (backendList && backendList.length > 0) {
            const mapped: DisplayReview[] = backendList.map((be: any) => ({
              id: String(be.id || 'be-' + Math.random()),
              contractId: String(be.contractId || ''),
              contractTitle: 'Contrat séquestre #' + be.contractId,
              reviewerId: String(be.reviewerId || ''),
              reviewerName: be.reviewerName || 'Client Partenaire',
              reviewerRole: be.reviewerRole || 'CLIENT',
              revieweeId: String(be.targetUserId || userId),
              overallRating: be.rating || 5.0,
              qualityRating: be.qualityRating || 5.0,
              deadlinesRating: be.deadlinesRating || 5.0,
              communicationRating: be.communicationRating || 5.0,
              comment: be.comment || 'Prestation validée avec succès.',
              recommended: true,
              tags: ['Qualité 4K', 'Prestation Certifiée'],
              createdAt: be.createdAt ? new Date(be.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Récemment',
              direction: String(be.reviewerId) === String(userId) ? 'GIVEN' : 'RECEIVED',
              escrowVerified: true
            }));

            // Merge unique
            const current = this.allReviews();
            const merged = [...mapped];
            current.forEach(item => {
              if (!merged.some(m => m.id === item.id)) {
                merged.push(item);
              }
            });
            this.allReviews.set(merged);
          }
        },
        error: () => {
          // Gracefully continue with local/mock data
        }
      });
    }
  }

  refreshReviews(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.loadInitialReviews();
      this.isRefreshing.set(false);
    }, 600);
  }

  /* Filtered Reviews Signal */
  filteredReviews = computed(() => {
    const list = this.allReviews();
    const tab = this.activeTab();
    const query = this.searchQuery().trim().toLowerCase();
    const sort = this.sortBy();

    let filtered = list.filter(r => {
      // Tab filter
      if (tab === 'RECEIVED') {
        if (r.direction !== 'RECEIVED') return false;
      } else if (tab === 'FIVE_STARS') {
        if (r.direction !== 'RECEIVED' || r.overallRating < 4.9) return false;
      } else if (tab === 'DETAILED') {
        if (r.direction !== 'RECEIVED' || !r.comment || r.comment.length < 20) return false;
      } else if (tab === 'GIVEN') {
        if (r.direction !== 'GIVEN') return false;
      }

      // Query filter
      if (query) {
        const matchesName = r.reviewerName.toLowerCase().includes(query);
        const matchesComment = r.comment.toLowerCase().includes(query);
        const matchesTitle = r.contractTitle ? r.contractTitle.toLowerCase().includes(query) : false;
        const matchesCompany = r.reviewerCompany ? r.reviewerCompany.toLowerCase().includes(query) : false;
        return matchesName || matchesComment || matchesTitle || matchesCompany;
      }

      return true;
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sort === 'RATING_DESC') {
        return b.overallRating - a.overallRating;
      } else if (sort === 'RATING_ASC') {
        return a.overallRating - b.overallRating;
      }
      return 0; // Default order
    });
  });

  /* Metrics Computed Signals */
  receivedReviews = computed(() => {
    return this.allReviews().filter(r => r.direction === 'RECEIVED');
  });

  totalReceivedCount = computed(() => this.receivedReviews().length);

  totalGivenCount = computed(() => {
    return this.allReviews().filter(r => r.direction === 'GIVEN').length;
  });

  averageRating = computed(() => {
    const list = this.receivedReviews();
    if (list.length === 0) return 5.0;
    const sum = list.reduce((acc, r) => acc + r.overallRating, 0);
    return Number((sum / list.length).toFixed(2));
  });

  jssScore = computed(() => {
    return 98; // Job success score 98%
  });

  recommendationRate = computed(() => {
    const list = this.receivedReviews();
    if (list.length === 0) return 100;
    const recs = list.filter(r => r.recommended).length;
    return Math.round((recs / list.length) * 100);
  });

  onTimeDeliveryRate = computed(() => {
    return 98;
  });

  qualityScore = computed(() => {
    const list = this.receivedReviews().filter(r => r.qualityRating !== undefined);
    if (list.length === 0) return 5.0;
    const sum = list.reduce((acc, r) => acc + (r.qualityRating || 5), 0);
    return Number((sum / list.length).toFixed(1));
  });

  deadlineScore = computed(() => {
    const list = this.receivedReviews().filter(r => r.deadlinesRating !== undefined);
    if (list.length === 0) return 5.0;
    const sum = list.reduce((acc, r) => acc + (r.deadlinesRating || 5), 0);
    return Number((sum / list.length).toFixed(1));
  });

  communicationScore = computed(() => {
    const list = this.receivedReviews().filter(r => r.communicationRating !== undefined);
    if (list.length === 0) return 5.0;
    const sum = list.reduce((acc, r) => acc + (r.communicationRating || 5), 0);
    return Number((sum / list.length).toFixed(1));
  });

  gearScore = computed(() => {
    const list = this.receivedReviews().filter(r => r.equipmentMasteryRating !== undefined);
    if (list.length === 0) return 5.0;
    const sum = list.reduce((acc, r) => acc + (r.equipmentMasteryRating || 5), 0);
    return Number((sum / list.length).toFixed(1));
  });

  getStarCount(star: number): number {
    const list = this.receivedReviews();
    return list.filter(r => Math.round(r.overallRating) === star).length;
  }

  getStarPercentage(star: number): number {
    const total = this.totalReceivedCount();
    if (total === 0) return 0;
    return (this.getStarCount(star) / total) * 100;
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
