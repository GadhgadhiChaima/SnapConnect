import { Component, computed, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { catchError, of } from 'rxjs';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MediaModalComponent } from '../../../shared/components/media-modal/media-modal.component';
import { AuthService } from '../../../core/services/auth.service';
import { PortfolioItem } from '../../../core/models/portfolio.model';

export interface CreatorStats {
  totalContracts: number;
  completedContracts: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  expiredContracts: number;
  disputedContracts: number;
  completionRate: number;
  onTimeRate: number;
  averageDeliveryDays: number;
  totalReviews: number;
  averageRating: number;
}

export interface UpworkJobFeedItem {
  id: string;
  title: string;
  rate: string;
  budgetType: 'HOURLY' | 'FIXED';
  level: string;
  estTime: string;
  deliverable?: string;
  description: string;
  tags: string[];
  postedAgo: string;
  proposalsCount: string;
  client: {
    name: string;
    location: string;
    rating: number;
    reviewsCount: number;
    verified: boolean;
  };
  isSaved?: boolean;
}

@Component({
  selector: 'app-creator-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    SlicePipe,
    NavbarComponent,
    FooterComponent,
    MediaModalComponent
  ],
  template: `
    <app-navbar></app-navbar>

    <main class="upwork-dashboard-page">
      <div class="uw-app-shell">

        <!-- ═══ LEFT NAV SIDEBAR (Upwork vertical nav) ═══ -->
        <nav class="uw-left-nav">
          <!-- User Mini Profile -->
          <div class="uw-nav-user-mini" routerLink="/creator/profile" title="Voir mon profil complet">
            @if (avatarUrl() && !avatarUrl().includes('photo-1534528741775')) {
              <img
                [src]="avatarUrl()"
                [alt]="displayName()"
                class="uw-nav-avatar"
                referrerpolicy="no-referrer"
              />
            } @else {
              <div class="uw-nav-avatar empty-avatar-placeholder">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            }
            <div class="uw-nav-user-info">
              <span class="uw-nav-name">{{ displayName() }}</span>
              <span class="uw-nav-role">Créateur Vidéo Mobile</span>
            </div>
            <svg class="uw-nav-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>

          <ul class="uw-nav-list">
            <li class="uw-nav-item">
              <a routerLink="/jobs" class="uw-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <span>Rechercher</span>
              </a>
            </li>
            <li class="uw-nav-item active">
              <a routerLink="/creator/dashboard" class="uw-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span>Accueil</span>
              </a>
            </li>
            <li class="uw-nav-item">
              <a routerLink="/creator/notifications" class="uw-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <span>Notifications</span>
                <span class="uw-nav-badge">8</span>
              </a>
            </li>

            <li class="uw-nav-group-label">Opportunités</li>
            <li class="uw-nav-item">
              <a routerLink="/jobs" class="uw-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                <span>Trouver missions</span>
                <svg class="uw-nav-sub-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
            </li>
            <li class="uw-nav-item">
              <a routerLink="/creator/proposals" class="uw-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <span>Propositions</span>
              </a>
            </li>

            <li class="uw-nav-group-label">Activité</li>
            <li class="uw-nav-item">
              <a routerLink="/creator/contracts" class="uw-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                <span>Contrats</span>
                <svg class="uw-nav-sub-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
            </li>
            <li class="uw-nav-item">
              <a routerLink="/creator/earnings" class="uw-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                <span>Finances</span>
                <svg class="uw-nav-sub-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
            </li>
            <li class="uw-nav-item">
              <a routerLink="/messages" class="uw-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span>Messages</span>
              </a>
            </li>
            <li class="uw-nav-item">
              <a routerLink="/creator/profile" class="uw-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                <span>Mon profil</span>
              </a>
            </li>
          </ul>

          <div class="uw-nav-help" (click)="triggerHelpToast()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span>Aide</span>
          </div>
        </nav>

        <!-- ═══ MAIN SHELL (2 COLUMNS: FEED + RIGHT SIDEBAR) ═══ -->
        <div class="uw-main-shell">

          <!-- ─── COLUMN 1: JOB FEED (CENTER/LEFT) ─── -->
          <div class="uw-feed-column">

            <!-- 1. Direct Contracts Promo Banner (Matching Upwork Screenshot) -->
            <div class="uw-promo-banner">
              <div class="uw-promo-text">
                <span class="uw-promo-badge">Direct Contracts</span>
                <h2 class="uw-promo-headline">
                  Maximize your earnings with a low 5% service fee when you bring new clients to SnapConnect.
                </h2>
                <div class="uw-promo-btn-wrap">
                  <button type="button" class="uw-btn-create-contract" (click)="openCreateContract()">
                    Create contract
                  </button>
                </div>
              </div>
              <div class="uw-promo-art">
                <svg class="uw-promo-art-svg" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Smartphone Body -->
                  <rect x="18" y="24" width="58" height="102" rx="10" fill="#131d2e" stroke="#38bdf8" stroke-width="2.5"/>
                  <rect x="25" y="38" width="44" height="74" rx="4" fill="#0b1120"/>
                  <!-- Smartphone Screen UI -->
                  <rect x="30" y="46" width="34" height="6" rx="3" fill="#38bdf8" opacity="0.8"/>
                  <rect x="30" y="58" width="26" height="4" rx="2" fill="#94a3b8" opacity="0.6"/>
                  <rect x="30" y="66" width="30" height="4" rx="2" fill="#94a3b8" opacity="0.6"/>
                  <circle cx="47" cy="88" r="10" fill="#10b981" opacity="0.2"/>
                  <path d="M43 88l3 3 6-6" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <!-- Official Document Sheet with Wax Seal -->
                  <g filter="drop-shadow(0 12px 20px rgba(0,0,0,0.6))">
                    <rect x="76" y="12" width="86" height="114" rx="8" fill="#f8fafc"/>
                    <line x1="90" y1="28" x2="148" y2="28" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
                    <line x1="90" y1="42" x2="142" y2="42" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
                    <line x1="90" y1="54" x2="136" y2="54" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
                    <line x1="90" y1="66" x2="144" y2="66" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
                    <line x1="90" y1="78" x2="128" y2="78" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
                    <!-- Stamp Wax Seal -->
                    <circle cx="136" cy="102" r="14" fill="#f59e0b"/>
                    <circle cx="136" cy="102" r="10" stroke="#fef3c7" stroke-width="1.5" stroke-dasharray="2 2"/>
                    <path d="M132 102l3 3 6-6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </g>
                </svg>
              </div>
            </div>

            <!-- 2. Search for jobs (Input Bar) -->
            <div class="uw-search-wrap">
              <div class="uw-search-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.2" class="uw-search-icon">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  [(ngModel)]="homeJobSearch"
                  placeholder="Search for jobs (ex: Reels 4K, UGC, CapCut, iPhone 16 Pro...)"
                  class="uw-search-input"
                />
                @if (homeJobSearch) {
                  <button type="button" class="uw-search-clear-btn" (click)="homeJobSearch = ''">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                }
              </div>
            </div>

            <!-- 3. Tabs & Filters Bar (Matching Screenshot) -->
            <div class="uw-tabs-bar">
              <div class="uw-tabs-list">
                <button
                  type="button"
                  class="uw-tab-item"
                  [class.active]="activeFeedTab === 'best_matches'"
                  (click)="activeFeedTab = 'best_matches'"
                >
                  Best matches
                </button>
                <button
                  type="button"
                  class="uw-tab-item"
                  [class.active]="activeFeedTab === 'recent'"
                  (click)="activeFeedTab = 'recent'"
                >
                  Most recent
                </button>
                <button
                  type="button"
                  class="uw-tab-item"
                  [class.active]="activeFeedTab === 'saved'"
                  (click)="activeFeedTab = 'saved'"
                >
                  Saved jobs
                  @if (savedJobsCount() > 0) {
                    <span class="uw-tab-counter">({{ savedJobsCount() }})</span>
                  }
                </button>
                <button
                  type="button"
                  class="uw-tab-item"
                  [class.active]="activeFeedTab === 'invites'"
                  (click)="activeFeedTab = 'invites'"
                >
                  Invites
                  <span class="uw-tab-badge">1</span>
                </button>
              </div>

              <button type="button" class="uw-filters-btn" (click)="toggleFilters()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#108a00" stroke-width="2">
                  <line x1="4" y1="21" x2="4" y2="14"></line>
                  <line x1="4" y1="10" x2="4" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="3"></line>
                  <line x1="20" y1="21" x2="20" y2="16"></line>
                  <line x1="20" y1="12" x2="20" y2="3"></line>
                  <line x1="1" y1="14" x2="7" y2="14"></line>
                  <line x1="9" y1="8" x2="15" y2="8"></line>
                  <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
                <span>Filters</span>
              </button>
            </div>

            <!-- Feed Sub-Header Info -->
            <div class="uw-feed-sub-info">
              <span>Missions smartphone recommandées selon vos compétences et votre équipement 4K</span>
            </div>

            <!-- 4. Job Cards Feed -->
            <div class="uw-feed-list">
              @for (job of filteredJobs(); track job.id) {
                <article class="uw-job-card">
                  <!-- Top Row: Time, proposals & Actions -->
                  <div class="uw-card-top-row">
                    <span class="uw-card-post-meta">
                      {{ job.postedAgo }} &bull; Proposals: {{ job.proposalsCount }}
                    </span>
                    <div class="uw-card-actions">
                      <!-- Dislike -->
                      <button
                        type="button"
                        class="uw-action-icon-btn"
                        title="Masquer cette offre"
                        (click)="dismissJob(job.id)"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                        </svg>
                      </button>
                      <!-- Heart / Save -->
                      <button
                        type="button"
                        class="uw-action-icon-btn"
                        [class.saved]="job.isSaved"
                        [title]="job.isSaved ? 'Retirer des favoris' : 'Enregistrer cette mission'"
                        (click)="toggleSaveJob(job.id)"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" [attr.fill]="job.isSaved ? '#108a00' : 'none'" [attr.stroke]="job.isSaved ? '#108a00' : 'currentColor'" stroke-width="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Job Title -->
                  <h3 class="uw-card-title">
                    <a [routerLink]="['/jobs', job.id]" class="uw-card-title-link">{{ job.title }}</a>
                  </h3>

                  <!-- Terms & Rate -->
                  <p class="uw-card-terms">
                    <strong>{{ job.rate }}</strong>
                    <span class="uw-sep">-</span>
                    <span>{{ job.level }}</span>
                    <span class="uw-sep">-</span>
                    <span>Est. Time: {{ job.estTime }}</span>
                    @if (job.deliverable) {
                      <span class="uw-sep">-</span>
                      <span class="uw-deliverable-badge">{{ job.deliverable }}</span>
                    }
                  </p>

                  <!-- Description -->
                  <p class="uw-card-desc">
                    {{ job.description }}
                    <a [routerLink]="['/jobs', job.id]" class="uw-more-link"> more</a>
                  </p>

                  <!-- Skill Tags -->
                  <div class="uw-card-tags">
                    @for (tag of job.tags; track tag) {
                      <span class="uw-card-tag">{{ tag }}</span>
                    }
                  </div>

                  <!-- Client Details & Quick Apply -->
                  <div class="uw-card-footer">
                    <div class="uw-client-meta">
                      @if (job.client.verified) {
                        <span class="uw-client-verified" title="Paiement vérifié par SnapConnect">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="#108a00" stroke="#108a00" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01" stroke="#fff" stroke-width="2.5"></polyline></svg>
                          Paiement vérifié
                        </span>
                      }
                      <span class="uw-client-rating">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#eab308" stroke="#eab308" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        {{ job.client.rating }} ({{ job.client.reviewsCount }})
                      </span>
                      <span class="uw-client-loc">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {{ job.client.location }}
                      </span>
                    </div>

                    <a [routerLink]="['/jobs', job.id]" class="uw-apply-btn">
                      Postuler
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </a>
                  </div>
                </article>
              } @empty {
                <div class="uw-empty-feed">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <h4>Aucune mission trouvée</h4>
                  <p>Modifiez votre recherche ou explorez l'ensemble des missions publiées.</p>
                  <a routerLink="/jobs" class="uw-btn-create-contract" style="margin-top: 1rem;">Voir le Job Board complet</a>
                </div>
              }
            </div>

          </div><!-- /.uw-feed-column -->

          <!-- ─── COLUMN 2: RIGHT SIDEBAR (30%) - IDENTICAL TO SCREENSHOT ─── -->
          <aside class="uw-right-sidebar">

            <!-- Card 1: Profile Mini Card -->
            <div class="uw-rs-card">
              <div class="uw-rs-avatar-row">
                @if (avatarUrl() && !avatarUrl().includes('photo-1534528741775')) {
                  <img
                    [src]="avatarUrl()"
                    [alt]="displayName()"
                    class="uw-rs-avatar"
                    referrerpolicy="no-referrer"
                    routerLink="/creator/profile"
                    title="Voir mon profil"
                  />
                } @else {
                  <div class="uw-rs-avatar empty-avatar-placeholder" routerLink="/creator/profile" title="Voir mon profil">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                }
                <div class="uw-rs-user-info">
                  <a routerLink="/creator/profile" class="uw-rs-name">{{ displayName() }}</a>
                  <span class="uw-rs-title">{{ title() }}</span>
                </div>
              </div>

              <div class="uw-rs-divider"></div>

              <!-- Profile Visibility -->
              <div class="uw-rs-visibility-box">
                <div class="flex-between">
                  <span class="uw-rs-label">Profile Visibility</span>
                  <button type="button" class="uw-rs-pencil-btn" (click)="openVisibilityModal()" title="Modifier la visibilité">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                  </button>
                </div>
                <div class="uw-rs-val-row" (click)="openVisibilityModal()" style="cursor: pointer;">
                  <span class="uw-rs-val" [class.green]="profileVisibility() === 'PUBLIC'">
                    {{ visibilityLabel() }}
                  </span>
                </div>
              </div>

              <!-- Complete your profile -->
              <div class="uw-rs-completeness-box" routerLink="/onboarding/creator" title="Compléter mon profil">
                <div class="flex-between">
                  <span class="uw-rs-label">Complete your profile</span>
                  <span class="uw-rs-pct">{{ profileCompletion() }}%</span>
                </div>
                <div class="uw-rs-progress-track">
                  <div class="uw-rs-progress-fill" [style.width.%]="profileCompletion()"></div>
                </div>
              </div>
            </div>


            <!-- Card 3: Reach more clients (Exact match to Upwork) -->
            <div class="uw-rs-card">
              <div class="flex-between uw-rs-accordion-header">
                <h4 class="uw-rs-card-title">Reach more clients</h4>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </div>

              <!-- Open for work -->
              <div class="uw-rs-row-item">
                <div class="uw-rs-row-left">
                  <span class="uw-rs-row-label">
                    Open for work
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="uw-info-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  </span>
                  <span class="uw-rs-status-tag" [class.active]="isOpenForWork">{{ isOpenForWork ? 'Disponible' : 'Off' }}</span>
                </div>
                <button type="button" class="uw-rs-pencil-btn" (click)="openAvailabilityModal()" title="Modifier la disponibilité">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
              </div>

              <!-- Boost your profile -->
              <div class="uw-rs-row-item">
                <div class="uw-rs-row-left">
                  <span class="uw-rs-row-label">
                    Boost your profile
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="uw-info-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  </span>
                  <span class="uw-rs-status-tag" [class.active]="isBoosted">{{ isBoosted ? 'Activé' : 'Off' }}</span>
                </div>
                <button type="button" class="uw-rs-pencil-btn" (click)="toggleProfileBoost()" title="Booster le profil">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
              </div>


              <!-- Hours per week -->
              <div class="uw-rs-row-item">
                <div class="uw-rs-row-left">
                  <span class="uw-rs-row-label">Hours per week</span>
                  <span class="uw-rs-sub-val">{{ hoursPerWeek }}</span>
                </div>
                <button type="button" class="uw-rs-pencil-btn" (click)="openHoursModal()" title="Modifier les heures">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
              </div>

              <!-- Certified Gear -->
              <div class="uw-rs-row-item">
                <div class="uw-rs-row-left">
                  <span class="uw-rs-row-label">Matériel certifié 4K</span>
                  <span class="uw-rs-sub-val">{{ smartphoneModel }}</span>
                </div>
                <button type="button" class="uw-rs-pencil-btn" (click)="openGearModal()" title="Modifier l'équipement certifié">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
              </div>
            </div>

            <!-- Card 4: Quick Stats -->
            <div class="uw-rs-card">
              <h4 class="uw-rs-card-title">Statistiques d'activité</h4>
              <div class="uw-rs-stat-line">
                <span>Missions réalisées</span>
                <strong>{{ creatorStats() ? creatorStats()!.completedContracts : 0 }}</strong>
              </div>
              <div class="uw-rs-stat-line">
                <span>Livraison à temps</span>
                <strong class="uw-green">{{ creatorStats() ? (creatorStats()!.onTimeRate + '%') : '100%' }}</strong>
              </div>
              <div class="uw-rs-stat-line">
                <span>Avis clients</span>
                <span class="uw-stars">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#eab308" stroke="#eab308"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  <strong> {{ getFormattedRating() }}</strong> ({{ creatorStats()?.totalReviews ?? 0 }} avis)
                </span>
              </div>
            </div>

          </aside>

        </div><!-- /.uw-main-shell -->

      </div><!-- /.uw-app-shell -->
    </main>
<!-- 1. Modal : Modifier Titre & Tarif Horaire -->
    @if (titleRateModalOpen) {
      <div class="upwork-modal-backdrop" (click)="titleRateModalOpen = false">
        <div class="upwork-modal-card" (click)="$event.stopPropagation()">
          <button class="modal-close-x" (click)="titleRateModalOpen = false">Ã¢Å“â€¢</button>
          
          <h3 class="modal-title">Modifier le titre & tarif horaire</h3>
          <p class="modal-sub">DÃƒÂ©finissez l'intitulÃƒÂ© de votre spÃƒÂ©cialitÃƒÂ© smartphone et votre taux horaire en Dinars Tunisiens.</p>

          <form (ngSubmit)="saveTitleRate()" class="modal-form">
            <div class="form-group">
              <label class="modal-label">Titre professionnel</label>
              <input
                type="text"
                [(ngModel)]="editTitleValue"
                name="title"
                class="modal-input"
                placeholder="ex. VidÃƒÂ©aste SpÃƒÂ©cialiste Reels & TikTok UGC (4K 60fps)"
                required
              />
            </div>

            <div class="form-group">
              <label class="modal-label">Tarif horaire (DT / heure)</label>
              <div class="input-with-suffix">
                <input
                  type="number"
                  [(ngModel)]="editRateValue"
                  name="rate"
                  class="modal-input"
                  placeholder="45"
                  min="10"
                  max="1000"
                  required
                />
                <span class="suffix">DT/hr</span>
              </div>
            </div>

            <div class="modal-actions-row flex-between">
              <button type="button" class="upwork-btn upwork-btn-outline" (click)="titleRateModalOpen = false">
                Annuler
              </button>
              <button type="submit" class="upwork-btn upwork-btn-solid">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- 2. Modal : Modifier PrÃƒÂ©sentation (Bio) -->
    @if (bioModalOpen) {
      <div class="upwork-modal-backdrop" (click)="bioModalOpen = false">
        <div class="upwork-modal-card" (click)="$event.stopPropagation()">
          <button class="modal-close-x" (click)="bioModalOpen = false">Ã¢Å“â€¢</button>
          
          <h3 class="modal-title">Modifier votre prÃƒÂ©sentation</h3>
          <p class="modal-sub">Mettez en avant votre style de tournage mobile, votre storytelling et votre valeur ajoutÃƒÂ©e pour les marques.</p>

          <form (ngSubmit)="saveBio()" class="modal-form">
            <div class="form-group">
              <label class="modal-label">PrÃƒÂ©sentation & Biographie</label>
              <textarea
                [(ngModel)]="editBioValue"
                name="bio"
                rows="6"
                class="modal-textarea"
                placeholder="Expliquez votre expertise en tournage smartphone 4K, votre maÃƒÂ®trise des hooks TikTok..."
                required
              ></textarea>
              <div class="char-count">{{ editBioValue.length }} caractÃƒÂ¨res</div>
            </div>

            <div class="modal-actions-row flex-between">
              <button type="button" class="upwork-btn upwork-btn-outline" (click)="bioModalOpen = false">
                Annuler
              </button>
              <button type="submit" class="upwork-btn upwork-btn-solid">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal : VidÃƒÂ©o de prÃƒÂ©sentation (Video Introduction) -->
    @if (videoIntroModalOpen) {
      <div class="upwork-modal-backdrop" (click)="videoIntroModalOpen = false">
        <div class="upwork-modal-card" (click)="$event.stopPropagation()">
          <button class="modal-close-x" (click)="videoIntroModalOpen = false">Ã¢Å“â€¢</button>
          
          <h3 class="modal-title">VidÃƒÂ©o de prÃƒÂ©sentation (Showreel)</h3>
          <p class="modal-sub">TÃƒÂ©lÃƒÂ©versez ou liez votre vidÃƒÂ©o smartphone face camÃƒÂ©ra (30 ÃƒÂ  60s) pour dÃƒÂ©montrer votre savoir-faire aux clients.</p>

          <div class="port-mode-tabs flex-between" style="margin-bottom: 1.2rem;">
            <button
              type="button"
              class="switch-mode-btn"
              [class.active]="videoIntroMode === 'FILE'"
              (click)="videoIntroMode = 'FILE'"
            >
              Importer un fichier vidÃƒÂ©o
            </button>
            <button
              type="button"
              class="switch-mode-btn"
              [class.active]="videoIntroMode === 'URL'"
              (click)="videoIntroMode = 'URL'"
            >
              Lien web direct
            </button>
          </div>

          <form (ngSubmit)="saveVideoIntro()" class="modal-form">
            @if (videoIntroMode === 'FILE') {
              <input
                #videoIntroFilePicker
                type="file"
                accept="video/*"
                (change)="onVideoIntroFileSelected($event)"
                style="display: none;"
              />
              @if (!editVideoIntroUrl) {
                <div
                  class="dropzone-box"
                  (click)="videoIntroFilePicker.click()"
                >
                  <div class="dropzone-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="23 7 16 12 23 17 23 7"></polygon>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                  </div>
                  <strong>Cliquez pour choisir une vidÃƒÂ©o smartphone</strong>
                  <span>Supports : MP4, MOV, WEBM</span>
                </div>
              } @else {
                <div class="media-live-preview">
                  <video [src]="editVideoIntroUrl" controls class="preview-media"></video>
                  <button type="button" class="replace-btn" (click)="videoIntroFilePicker.click()">Changer de vidÃƒÂ©o</button>
                </div>
              }
            } @else {
              <div class="form-group">
                <label class="modal-label">Lien direct de la vidÃƒÂ©o (MP4, Cloud, etc.)</label>
                <input
                  type="url"
                  [(ngModel)]="editVideoIntroUrl"
                  name="introVideoUrl"
                  class="modal-input"
                  placeholder="https://..."
                  required
                />
              </div>
            }

            <div class="form-group">
              <label class="modal-label">Titre ou lÃƒÂ©gende de la vidÃƒÂ©o</label>
              <input
                type="text"
                [(ngModel)]="editVideoIntroCaption"
                name="introCaption"
                class="modal-input"
                placeholder="ex. Tournage Smartphone & DÃƒÂ©mos 4K"
              />
            </div>

            <div class="form-group">
              <label class="modal-label">Image de couverture / Miniature (URL optionnelle)</label>
              <input
                type="url"
                [(ngModel)]="editVideoIntroThumbnail"
                name="introThumbnail"
                class="modal-input"
                placeholder="https://... (ou laissez vide pour miniature automatique)"
              />
            </div>

            <div class="modal-actions-row flex-between">
              <button type="button" class="upwork-btn upwork-btn-outline" (click)="videoIntroModalOpen = false">
                Annuler
              </button>
              <button type="submit" class="upwork-btn upwork-btn-solid">
                Enregistrer la vidÃƒÂ©o
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- 3. Modal : Modifier Heures par semaine (DisponibilitÃƒÂ©) -->
    @if (hoursModalOpen) {
      <div class="upwork-modal-backdrop" (click)="hoursModalOpen = false">
        <div class="upwork-modal-card" (click)="$event.stopPropagation()">
          <button class="modal-close-x" (click)="hoursModalOpen = false">Ã¢Å“â€¢</button>
          
          <h3 class="modal-title">DisponibilitÃƒÂ© hebdomadaire</h3>
          <p class="modal-sub">Indiquez le volume d'heures par semaine que vous pouvez consacrer aux projets clients.</p>

          <form (ngSubmit)="saveHours()" class="modal-form">
            <div class="form-group">
              <label class="modal-label">SÃƒÂ©lection rapide</label>
              <select
                [(ngModel)]="editHoursValue"
                name="hoursSelection"
                class="modal-select"
              >
                <option value="More than 30 hrs/week">More than 30 hrs/week (Temps plein)</option>
                <option value="Less than 30 hrs/week">Less than 30 hrs/week (Temps partiel)</option>
                <option value="As needed - open to offers">As needed - open to offers (Selon les besoins)</option>
                <option value="None (Pas disponible)">None (Pas disponible actuellement)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="modal-label">Ou personnalisez votre texte d'affichage</label>
              <input
                type="text"
                [(ngModel)]="editHoursValue"
                name="customHours"
                class="modal-input"
                placeholder="ex. More than 30 hrs/week"
                required
              />
            </div>

            <div class="modal-actions-row flex-between">
              <button type="button" class="upwork-btn upwork-btn-outline" (click)="hoursModalOpen = false">
                Annuler
              </button>
              <button type="submit" class="upwork-btn upwork-btn-solid">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- 4. Modal : Modifier Ãƒâ€°quipement Smartphone CertifiÃƒÂ© -->
    @if (gearModalOpen) {
      <div class="upwork-modal-backdrop" (click)="gearModalOpen = false">
        <div class="upwork-modal-card" (click)="$event.stopPropagation()">
          <button class="modal-close-x" (click)="gearModalOpen = false">Ã¢Å“â€¢</button>
          
          <h3 class="modal-title">Ãƒâ€°quipement smartphone certifiÃƒÂ© 4K</h3>
          <p class="modal-sub">Actualisez les caractÃƒÂ©ristiques techniques de votre matÃƒÂ©riel de tournage mobile certifiÃƒÂ©.</p>

          <form (ngSubmit)="saveGear()" class="modal-form">
            <div class="form-group">
              <label class="modal-label">ModÃƒÂ¨le smartphone principal</label>
              <input
                type="text"
                [(ngModel)]="editSmartphone"
                name="phone"
                class="modal-input"
                placeholder="iPhone 16 Pro Max Ã¢â‚¬Â¢ ProRes Log"
                required
              />
            </div>

            <div class="form-group">
              <label class="modal-label">Stabilisateur / Gimbal</label>
              <input
                type="text"
                [(ngModel)]="editGimbal"
                name="gimbal"
                class="modal-input"
                placeholder="DJI Osmo Mobile 6"
              />
            </div>

            <div class="form-group">
              <label class="modal-label">Microphone & Audio</label>
              <input
                type="text"
                [(ngModel)]="editAudio"
                name="audio"
                class="modal-input"
                placeholder="Rode Wireless Pro 32-bit float"
              />
            </div>

            <div class="modal-actions-row flex-between">
              <button type="button" class="upwork-btn upwork-btn-outline" (click)="gearModalOpen = false">
                Annuler
              </button>
              <button type="submit" class="upwork-btn upwork-btn-solid">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal : Modifier les Langues -->
    @if (languagesModalOpen) {
      <div class="upwork-modal-backdrop" (click)="languagesModalOpen = false">
        <div class="upwork-modal-card" (click)="$event.stopPropagation()">
          <button class="modal-close-x" (click)="languagesModalOpen = false">Ã¢Å“â€¢</button>
          
          <h3 class="modal-title">Langues maÃƒÂ®trisÃƒÂ©es</h3>
          <p class="modal-sub">Indiquez les langues que vous parlez et votre niveau de maÃƒÂ®trise pour vos clients.</p>

          <form (ngSubmit)="saveLanguages()" class="modal-form">
            <div class="lang-edit-list">
              @for (lang of editLanguages; track $index) {
                <div class="lang-edit-row">
                  <div class="form-group flex-1">
                    <label class="modal-label">Langue</label>
                    <input
                      type="text"
                      [(ngModel)]="lang.name"
                      [name]="'langName_' + $index"
                      class="modal-input"
                      placeholder="ex. Arabe, FranÃƒÂ§ais..."
                      required
                    />
                  </div>
                  <div class="form-group flex-1">
                    <label class="modal-label">Niveau</label>
                    <select
                      [(ngModel)]="lang.level"
                      [name]="'langLevel_' + $index"
                      class="modal-select"
                    >
                      <option value="Langue maternelle">Langue maternelle</option>
                      <option value="Bilingue">Bilingue</option>
                      <option value="Courant / Professionnel">Courant / Professionnel</option>
                      <option value="IntermÃƒÂ©diaire">IntermÃƒÂ©diaire</option>
                      <option value="Notions de base">Notions de base</option>
                    </select>
                  </div>
                  @if (editLanguages.length > 1) {
                    <button
                      type="button"
                      class="lang-remove-btn"
                      (click)="removeLanguage($index)"
                      title="Supprimer cette langue"
                    >
                      Ã¢Å“â€¢
                    </button>
                  }
                </div>
              }
            </div>

            <button type="button" class="add-lang-btn" (click)="addLanguage()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Ajouter une langue</span>
            </button>

            <div class="modal-actions-row flex-between">
              <button type="button" class="upwork-btn upwork-btn-outline" (click)="languagesModalOpen = false">
                Annuler
              </button>
              <button type="submit" class="upwork-btn upwork-btn-solid">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    }


    <!-- 5. Modal : Ajouter une RÃƒÂ©alisation Portfolio Upwork -->
    @if (addPortfolioModalOpen) {
      <div class="upwork-modal-backdrop" (click)="closePortfolioModal()">
        <div class="upwork-modal-card wide-card" (click)="$event.stopPropagation()">
          <button class="modal-close-x" (click)="closePortfolioModal()">Ã¢Å“â€¢</button>
          
          <h3 class="modal-title">Ajouter une rÃƒÂ©alisation au Portfolio</h3>
          <p class="modal-sub">TÃƒÂ©lÃƒÂ©versez directement un visuel ou une vidÃƒÂ©o tournÃƒÂ©e sur smartphone, ou insÃƒÂ©rez un lien.</p>

          <!-- Upload mode tabs -->
          <div class="upload-mode-switcher">
            <button
              type="button"
              class="switch-mode-btn"
              [class.active]="portUploadMode === 'FILE'"
              (click)="portUploadMode = 'FILE'"
            >
              Importer un fichier (PC / Smartphone)
            </button>
            <button
              type="button"
              class="switch-mode-btn"
              [class.active]="portUploadMode === 'URL'"
              (click)="portUploadMode = 'URL'"
            >
              Lien web direct
            </button>
          </div>

          <form (ngSubmit)="savePortfolioItem()" class="modal-form">
            @if (portUploadMode === 'FILE') {
              <input
                #portFilePicker
                type="file"
                accept="image/*,video/*"
                (change)="onPortFileSelected($event)"
                style="display: none;"
              />
              @if (!newPortMediaUrl) {
                <div
                  class="dropzone-box"
                  (click)="portFilePicker.click()"
                >
                  <div class="dropzone-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>
                  <strong>Cliquez ou glissez-dÃƒÂ©posez votre photo ou vidÃƒÂ©o 4K</strong>
                  <span>Supports : MP4, MOV, JPG, PNG, WEBP</span>
                </div>
              } @else {
                <div class="media-live-preview">
                  @if (newPortMediaType === 'VIDEO') {
                    <video [src]="newPortMediaUrl" controls class="preview-media"></video>
                  } @else {
                    <img [src]="newPortMediaUrl" alt="AperÃƒÂ§u" class="preview-media" />
                  }
                  <button type="button" class="replace-btn" (click)="portFilePicker.click()">Remplacer le mÃƒÂ©dia</button>
                </div>
              }
            } @else {
              <div class="form-group">
                <label class="modal-label">URL directe du mÃƒÂ©dia (Image ou VidÃƒÂ©o)</label>
                <input
                  type="url"
                  [(ngModel)]="newPortMediaUrl"
                  name="mediaUrl"
                  class="modal-input"
                  placeholder="https://..."
                  required
                />
              </div>
            }

            <div class="form-group">
              <label class="modal-label">Titre du projet / LÃƒÂ©gende</label>
              <input
                type="text"
                [(ngModel)]="newPortTitle"
                name="title"
                class="modal-input"
                placeholder="ex. Reel UGC Viral pour Gamme CosmÃƒÂ©tique"
                required
              />
            </div>

            <div class="form-group">
              <label class="modal-label">Smartphone & MatÃƒÂ©riel utilisÃƒÂ©</label>
              <input
                type="text"
                [(ngModel)]="newPortGear"
                name="gear"
                class="modal-input"
                placeholder="iPhone 16 Pro Max Ã¢â‚¬Â¢ 4K ProRes Log"
              />
            </div>

            <div class="form-group">
              <label class="modal-label">Type de mÃƒÂ©dia</label>
              <select [(ngModel)]="newPortMediaType" name="type" class="modal-select">
                <option value="VIDEO">VidÃƒÂ©o 4K / Reel Vertical</option>
                <option value="IMAGE">Photo smartphone haute rÃƒÂ©solution</option>
              </select>
            </div>

            <div class="modal-actions-row flex-between">
              <button type="button" class="upwork-btn upwork-btn-outline" (click)="closePortfolioModal()">
                Annuler
              </button>
              <button
                type="submit"
                [disabled]="!newPortTitle.trim() || !newPortMediaUrl"
                class="upwork-btn upwork-btn-solid"
              >
                Publier dans mon portfolio
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- 6. Lightbox Preview Modal -->
    @if (selectedMedia()) {
      <app-media-modal [item]="selectedMedia()" (close)="selectedMedia.set(null)"></app-media-modal>
    }

    <!-- 7. Modal : Edit Profile Visibility (Upwork Official) -->
    @if (visibilityModalOpen) {
      <div class="upwork-modal-backdrop" (click)="visibilityModalOpen = false">
        <div class="upwork-modal-card visibility-modal-card" (click)="$event.stopPropagation()">
          <button class="modal-close-x" (click)="visibilityModalOpen = false">Ã¢Å“â€¢</button>
          
          <h3 class="modal-title">Edit Profile Visibility</h3>
          <p class="modal-sub">
            Who do you want to see your profile? Simply select an option to control your visibility and searchability. Market your profile when and where you want.
          </p>

          <div class="visibility-options-list">
            <!-- Option 1: Public -->
            <div
              class="visibility-option-item"
              [class.selected]="tempVisibility === 'PUBLIC'"
              (click)="tempVisibility = 'PUBLIC'"
            >
              <div class="radio-indicator">
                <span class="custom-radio-circle" [class.checked]="tempVisibility === 'PUBLIC'"></span>
              </div>
              <div class="option-text-wrap">
                <strong class="option-title">Public</strong>
                <p class="option-desc">
                  Your profile is visible to the general public and will show up in search engine results
                </p>
              </div>
            </div>

            <!-- Option 2: SnapConnect Users Only -->
            <div
              class="visibility-option-item"
              [class.selected]="tempVisibility === 'USERS_ONLY'"
              (click)="tempVisibility = 'USERS_ONLY'"
            >
              <div class="radio-indicator">
                <span class="custom-radio-circle" [class.checked]="tempVisibility === 'USERS_ONLY'"></span>
              </div>
              <div class="option-text-wrap">
                <strong class="option-title">SnapConnect Users Only</strong>
                <p class="option-desc">
                  Only logged in SnapConnect users will see your profile
                </p>
              </div>
            </div>

            <!-- Option 3: Private -->
            <div
              class="visibility-option-item"
              [class.selected]="tempVisibility === 'PRIVATE'"
              (click)="tempVisibility = 'PRIVATE'"
            >
              <div class="radio-indicator">
                <span class="custom-radio-circle" [class.checked]="tempVisibility === 'PRIVATE'"></span>
              </div>
              <div class="option-text-wrap">
                <strong class="option-title">Private</strong>
                <p class="option-desc">
                  Your profile won't appear in any search results, not even on SnapConnect. To view your profile, users must have a direct link and be logged in.
                </p>
              </div>
            </div>
          </div>

          <div class="modal-actions-row flex-between mt-4">
            <button
              type="button"
              class="upwork-btn upwork-btn-outline"
              (click)="visibilityModalOpen = false"
            >
              Cancel
            </button>
            <button
              type="button"
              class="upwork-btn upwork-btn-solid upwork-save-green"
              (click)="saveProfileVisibility()"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Floating Toast Notification -->
    @if (toastMessage()) {
      <div class="upwork-toast animate-scale-in">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>{{ toastMessage() }}</span>
      </div>
    }

    <app-footer></app-footer>
  `,
  styles: [`
    :host {
      display: block;
      color: #f1f5f9;
      background-color: #0b0f19;
      font-family: 'Outfit', sans-serif;
    }

    .flex-between {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .flex-1 {
      flex: 1;
    }

    .mt-4 {
      margin-top: 1rem;
    }

    .upwork-dashboard-page {
      padding-top: var(--navbar-height, 70px);
      min-height: 100vh;
    }

    .empty-avatar-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.04);
      color: rgba(255, 255, 255, 0.35);
    }

    /* ════ APP SHELL ════ */
    .uw-app-shell {
      display: grid;
      grid-template-columns: 240px 1fr;
      min-height: calc(100vh - var(--navbar-height, 70px));
      background: #0b0e14;
    }

    /* LEFT NAV */
    .uw-left-nav {
      position: sticky;
      top: var(--navbar-height, 70px);
      height: calc(100vh - var(--navbar-height, 70px));
      overflow-y: auto;
      background: #0f141c;
      border-right: 1px solid rgba(255,255,255,0.06);
      display: flex;
      flex-direction: column;
      padding: 1.25rem 0;
      gap: 0;
    }

    .uw-nav-user-mini {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 1rem;
      margin: 0 0.5rem 0.75rem;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.02);
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .uw-nav-user-mini:hover {
      background: rgba(255,255,255,0.05);
      border-color: rgba(255,255,255,0.12);
    }
    .uw-nav-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #108a00;
      flex-shrink: 0;
    }
    .uw-nav-user-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      flex: 1;
    }
    .uw-nav-name {
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .uw-nav-role {
      font-size: 11px;
      color: rgba(255,255,255,0.45);
    }
    .uw-nav-arrow {
      color: rgba(255,255,255,0.3);
      flex-shrink: 0;
    }

    .uw-nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
      flex: 1;
    }
    .uw-nav-group-label {
      font-size: 11px;
      font-weight: 700;
      color: rgba(255,255,255,0.3);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 1rem 1.25rem 0.4rem;
    }
    .uw-nav-item {
      list-style: none;
    }
    .uw-nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 1.25rem;
      font-size: 13px;
      font-weight: 500;
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      transition: all 0.18s;
      position: relative;
    }
    .uw-nav-link:hover {
      color: #fff;
      background: rgba(255,255,255,0.04);
    }
    .uw-nav-item.active .uw-nav-link {
      color: #fff;
      background: rgba(255,255,255,0.08);
      font-weight: 600;
    }
    .uw-nav-item.active .uw-nav-link::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #108a00;
      border-radius: 0 4px 4px 0;
    }
    .uw-nav-sub-arrow {
      margin-left: auto;
      color: rgba(255,255,255,0.3);
    }
    .uw-nav-badge {
      margin-left: auto;
      background: #ec4899;
      color: white;
      font-size: 10px;
      font-weight: 700;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .uw-nav-help {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.8rem 1.25rem;
      color: rgba(255,255,255,0.4);
      font-size: 13px;
      cursor: pointer;
      border-top: 1px solid rgba(255,255,255,0.06);
      margin-top: auto;
      transition: color 0.2s;
    }
    .uw-nav-help:hover {
      color: #fff;
    }

    /* ════ MAIN SHELL: TWO COLUMNS ════ */
    .uw-main-shell {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 340px;
      gap: 2rem;
      padding: 1.75rem 2rem 5rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }

    /* FEED COLUMN */
    .uw-feed-column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      min-width: 0;
    }

    /* DIRECT CONTRACTS PROMO BANNER */
    .uw-promo-banner {
      background: #141a24;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 2rem 2.2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      position: relative;
      overflow: hidden;
    }
    .uw-promo-text {
      flex: 1;
      max-width: 600px;
    }
    .uw-promo-badge {
      font-size: 14px;
      font-weight: 700;
      color: #e2e8f0;
      display: inline-block;
      margin-bottom: 0.5rem;
      letter-spacing: 0.02em;
    }
    .uw-promo-headline {
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.35;
      margin: 0 0 1.25rem;
    }
    .uw-promo-btn-wrap {
      display: flex;
      align-items: center;
    }
    .uw-btn-create-contract {
      background: #ffffff;
      color: #0d1117;
      border: none;
      border-radius: 9999px;
      padding: 0.65rem 1.4rem;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .uw-btn-create-contract:hover {
      background: #f1f5f9;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255,255,255,0.15);
    }
    .uw-promo-art {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .uw-promo-art-svg {
      width: 170px;
      height: 130px;
    }

    /* SEARCH INPUT BOX */
    .uw-search-wrap {
      width: 100%;
    }
    .uw-search-box {
      position: relative;
      display: flex;
      align-items: center;
      background: #141a24;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 9999px;
      padding: 0.4rem 1.2rem;
      transition: all 0.2s ease;
    }
    .uw-search-box:focus-within {
      border-color: #108a00;
      background: #17202c;
      box-shadow: 0 0 0 3px rgba(16,138,0,0.15);
    }
    .uw-search-icon {
      flex-shrink: 0;
      margin-right: 0.75rem;
    }
    .uw-search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #fff;
      font-size: 14px;
      font-family: inherit;
      padding: 0.4rem 0;
    }
    .uw-search-input::placeholder {
      color: #94a3b8;
    }
    .uw-search-clear-btn {
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.4);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s;
    }
    .uw-search-clear-btn:hover {
      color: #fff;
    }

    /* TABS & FILTERS BAR */
    .uw-tabs-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      gap: 1rem;
      padding-bottom: 0;
      margin-top: 0.25rem;
    }
    .uw-tabs-list {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      overflow-x: auto;
    }
    .uw-tab-item {
      background: transparent;
      border: none;
      outline: none;
      color: #94a3b8;
      font-size: 15px;
      font-weight: 600;
      font-family: inherit;
      padding: 0.75rem 0.25rem 1rem;
      cursor: pointer;
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      white-space: nowrap;
      transition: color 0.18s;
    }
    .uw-tab-item:hover {
      color: #e2e8f0;
    }
    .uw-tab-item.active {
      color: #ffffff;
      font-weight: 700;
    }
    .uw-tab-item.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 3px;
      background: #108a00;
      border-radius: 3px 3px 0 0;
    }
    .uw-tab-counter {
      font-size: 13px;
      color: #94a3b8;
      font-weight: 500;
    }
    .uw-tab-badge {
      background: #ec4899;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      border-radius: 10px;
      padding: 1px 6px;
      line-height: 1.4;
    }
    .uw-filters-btn {
      background: transparent;
      border: 1px solid #108a00;
      border-radius: 9999px;
      color: #108a00;
      font-size: 14px;
      font-weight: 600;
      font-family: inherit;
      padding: 0.45rem 1rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    .uw-filters-btn:hover {
      background: rgba(16,138,0,0.1);
    }
    .uw-feed-sub-info {
      font-size: 12px;
      color: #64748b;
      margin-top: -0.5rem;
    }

    /* FEED JOB CARDS */
    .uw-feed-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .uw-job-card {
      background: #141a24;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 14px;
      padding: 1.6rem 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .uw-job-card:hover {
      border-color: rgba(255,255,255,0.15);
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }
    .uw-card-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .uw-card-post-meta {
      font-size: 13px;
      color: #8c919d;
    }
    .uw-card-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .uw-action-icon-btn {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.6);
      cursor: pointer;
      transition: all 0.2s;
    }
    .uw-action-icon-btn:hover {
      background: rgba(255,255,255,0.06);
      color: #fff;
      border-color: rgba(255,255,255,0.16);
    }
    .uw-action-icon-btn.saved {
      color: #108a00;
      border-color: rgba(16,138,0,0.4);
      background: rgba(16,138,0,0.1);
    }

    .uw-card-title {
      font-size: 17px;
      font-weight: 700;
      margin: 0;
      line-height: 1.4;
    }
    .uw-card-title-link {
      color: #ffffff;
      text-decoration: none;
      transition: color 0.15s;
    }
    .uw-card-title-link:hover {
      color: #108a00;
      text-decoration: underline;
    }
    .uw-card-terms {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.4rem;
    }
    .uw-card-terms strong {
      color: #e2e8f0;
      font-weight: 600;
    }
    .uw-sep {
      color: rgba(255,255,255,0.25);
    }
    .uw-deliverable-badge {
      background: rgba(56,189,248,0.12);
      color: #38bdf8;
      border-radius: 4px;
      padding: 1px 6px;
      font-size: 11px;
      font-weight: 600;
    }
    .uw-card-desc {
      font-size: 14px;
      color: #cbd5e1;
      line-height: 1.55;
      margin: 0;
    }
    .uw-more-link {
      color: #108a00;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
    }
    .uw-more-link:hover {
      text-decoration: underline;
    }
    .uw-card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }
    .uw-card-tag {
      background: rgba(255,255,255,0.06);
      color: #e2e8f0;
      border-radius: 9999px;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 500;
      transition: background 0.15s;
    }
    .uw-card-tag:hover {
      background: rgba(255,255,255,0.1);
    }
    .uw-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .uw-client-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 12px;
      color: #94a3b8;
      flex-wrap: wrap;
    }
    .uw-client-verified {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: #108a00;
      font-weight: 600;
    }
    .uw-client-rating {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      color: #f1f5f9;
      font-weight: 600;
    }
    .uw-client-loc {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      color: #94a3b8;
    }
    .uw-apply-btn {
      background: #108a00;
      color: #ffffff;
      border: none;
      border-radius: 9999px;
      padding: 0.45rem 1.25rem;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      cursor: pointer;
      transition: background 0.18s, transform 0.18s;
      flex-shrink: 0;
    }
    .uw-apply-btn:hover {
      background: #14a800;
      transform: translateY(-1px);
    }

    .uw-empty-feed {
      background: #141a24;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 3rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
    .uw-empty-feed h4 {
      font-size: 16px;
      font-weight: 700;
      color: #fff;
      margin: 0;
    }
    .uw-empty-feed p {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
      max-width: 400px;
    }

    /* ════ RIGHT SIDEBAR (UPWORK EXACT) ════ */
    .uw-right-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      position: sticky;
      top: calc(var(--navbar-height, 70px) + 1rem);
      height: fit-content;
    }
    .uw-rs-card {
      background: #141a24;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    }
    .uw-rs-avatar-row {
      display: flex;
      align-items: center;
      gap: 0.9rem;
    }
    .uw-rs-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255,255,255,0.15);
      cursor: pointer;
      flex-shrink: 0;
    }
    .uw-rs-user-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .uw-rs-name {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      text-decoration: none;
      transition: color 0.15s;
    }
    .uw-rs-name:hover {
      color: #108a00;
    }
    .uw-rs-title {
      font-size: 13px;
      color: #94a3b8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }
    .uw-rs-divider {
      height: 1px;
      background: rgba(255,255,255,0.08);
      margin: 0.2rem 0;
    }
    .uw-rs-visibility-box {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .uw-rs-label {
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
    }
    .uw-rs-pencil-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s;
    }
    .uw-rs-pencil-btn:hover {
      color: #ffffff;
    }
    .uw-rs-val-row {
      display: flex;
      align-items: center;
    }
    .uw-rs-val {
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
    }
    .uw-rs-val.green {
      color: #108a00;
    }
    .uw-rs-completeness-box {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      cursor: pointer;
      margin-top: 0.2rem;
    }
    .uw-rs-pct {
      font-size: 12px;
      font-weight: 700;
      color: #ffffff;
    }
    .uw-rs-progress-track {
      height: 6px;
      background: rgba(255,255,255,0.08);
      border-radius: 9999px;
      overflow: hidden;
    }
    .uw-rs-progress-fill {
      height: 100%;
      background: #108a00;
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    /* REACH MORE CLIENTS */
    .uw-rs-accordion-header {
      cursor: pointer;
      color: #94a3b8;
    }
    .uw-rs-row-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.2rem 0;
    }
    .uw-rs-row-left {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      flex: 1;
      overflow: hidden;
    }
    .uw-rs-row-label {
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .uw-info-icon {
      color: rgba(255,255,255,0.3);
    }
    .uw-rs-status-tag {
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
    }
    .uw-rs-status-tag.active {
      color: #108a00;
    }
    .uw-rs-sub-val {
      font-size: 12px;
      color: #e2e8f0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* STATS CARD */
    .uw-rs-card-title {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }
    .uw-rs-stat-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      color: #94a3b8;
    }
    .uw-rs-stat-line strong {
      color: #ffffff;
      font-weight: 700;
    }
    .uw-green {
      color: #108a00 !important;
    }
    .uw-stars {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      color: #94a3b8;
      font-size: 12px;
    }
    .uw-stars strong {
      color: #ffffff;
    }

    /* Buttons */
    .upwork-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.88rem;
      font-weight: 600;
      padding: 0.55rem 1.3rem;
      border-radius: 9999px;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .upwork-btn-outline {
      border: 1.5px solid #14a800;
      color: #14a800;
      background: transparent;
    }

    .upwork-btn-outline:hover {
      background: rgba(20, 168, 0, 0.1);
      color: #22c55e;
    }

    .upwork-btn-solid {
      background: #14a800;
      color: #ffffff;
      border: none;
    }

    .upwork-btn-solid:hover {
      background: #108a00;
      box-shadow: 0 4px 14px rgba(20, 168, 0, 0.35);
    }

    /* ════ MODALS ════ */
    .upwork-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.78);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .upwork-modal-card {
      position: relative;
      width: 100%;
      max-width: 520px;
      background: #141b2b;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      padding: 2.2rem;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
      max-height: 90vh;
      overflow-y: auto;
    }

    .wide-card {
      max-width: 620px;
    }

    .modal-close-x {
      position: absolute;
      top: 1.2rem;
      right: 1.2rem;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.2rem;
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .modal-close-x:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }

    .modal-title {
      font-size: 1.35rem;
      font-weight: 800;
      margin: 0 0 0.3rem 0;
      color: #ffffff;
    }

    .modal-sub {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0 0 1.5rem 0;
      line-height: 1.45;
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .modal-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #e2e8f0;
    }

    .modal-input, .modal-textarea, .modal-select {
      background: #0b0f19;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      padding: 0.65rem 0.9rem;
      color: #ffffff;
      font-family: inherit;
      font-size: 0.9rem;
      transition: border-color 0.2s;
    }

    .modal-input:focus, .modal-textarea:focus, .modal-select:focus {
      outline: none;
      border-color: #14a800;
      box-shadow: 0 0 0 2px rgba(20, 168, 0, 0.2);
    }

    .input-with-suffix {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-with-suffix .modal-input {
      width: 100%;
      padding-right: 4rem;
    }

    .suffix {
      position: absolute;
      right: 0.9rem;
      font-size: 0.82rem;
      font-weight: 600;
      color: #64748b;
    }

    .char-count {
      font-size: 0.75rem;
      color: #64748b;
      text-align: right;
    }

    /* Video Intro & Portfolio Upload Tabs & Dropzone */
    .port-mode-tabs,
    .upload-mode-switcher {
      display: flex;
      background: #090d16;
      border-radius: 10px;
      padding: 4px;
      gap: 4px;
      margin-bottom: 1.2rem;
    }

    .switch-mode-btn {
      flex: 1;
      padding: 0.5rem;
      font-size: 0.82rem;
      font-weight: 600;
      color: #94a3b8;
      background: transparent;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s, color 0.15s;
    }

    .switch-mode-btn.active {
      background: #141b2b;
      color: #ffffff;
    }

    .dropzone-box {
      border: 2px dashed rgba(20, 168, 0, 0.4);
      background: rgba(20, 168, 0, 0.03);
      border-radius: 14px;
      padding: 2.5rem 1.5rem;
      text-align: center;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      transition: background 0.2s;
    }

    .dropzone-box:hover {
      background: rgba(20, 168, 0, 0.08);
    }

    .dropzone-icon {
      font-size: 2.2rem;
    }

    .dropzone-box strong {
      font-size: 0.95rem;
      color: #ffffff;
    }

    .dropzone-box span {
      font-size: 0.78rem;
      color: #64748b;
    }

    .media-live-preview {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      max-height: 240px;
      background: #000;
      text-align: center;
    }

    .preview-media {
      max-height: 240px;
      width: auto;
      max-width: 100%;
      object-fit: contain;
    }

    .replace-btn {
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #ffffff;
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: 6px;
      cursor: pointer;
    }

    /* Floating Toast */
    .upwork-toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #14a800;
      color: #ffffff;
      padding: 0.8rem 1.4rem;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      gap: 0.6rem;
      z-index: 2000;
    }

    /* Visibility Modal Styles */
    .visibility-modal-card {
      max-width: 520px;
      background: #14171f;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      padding: 24px 28px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }

    .visibility-options-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin: 20px 0;
    }

    .visibility-option-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 14px 16px;
      border-radius: 12px;
      cursor: pointer;
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.02);
      transition: all 0.2s ease;
    }

    .visibility-option-item:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .visibility-option-item.selected {
      border-color: #22c55e;
      background: rgba(34, 197, 94, 0.06);
    }

    .custom-radio-circle {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.4);
      display: inline-block;
      position: relative;
      margin-top: 2px;
      flex-shrink: 0;
      transition: all 0.2s;
    }

    .custom-radio-circle.checked {
      border-color: #22c55e;
    }

    .custom-radio-circle.checked::after {
      content: '';
      position: absolute;
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .option-text-wrap {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .option-title {
      font-size: 15px;
      font-weight: 600;
      color: #ffffff;
    }

    .option-desc {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.65);
      margin: 0;
      line-height: 1.45;
    }

    .upwork-save-green {
      background: #14a800 !important;
      border-color: #14a800 !important;
      color: #ffffff !important;
      font-weight: 700 !important;
      padding: 8px 24px !important;
      border-radius: 9999px !important;
    }
    .upwork-save-green:hover {
      background: #108a00 !important;
    }

    /* Languages Modal Styles */
    .lang-edit-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3, 0.75rem);
      margin-bottom: var(--space-4, 1rem);
    }

    .lang-edit-row {
      display: flex;
      align-items: flex-end;
      gap: var(--space-3, 0.75rem);
    }

    .modal-select option {
      background-color: #14171f;
      color: #f8fafc;
      padding: 10px;
    }

    .lang-remove-btn {
      width: 38px;
      height: 42px;
      border-radius: var(--radius-md, 8px);
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 14px;
      flex-shrink: 0;
      margin-bottom: 2px;
      transition: all var(--transition-fast, 0.15s);
    }

    .lang-remove-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: #ef4444;
    }

    .add-lang-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2, 0.5rem);
      background: none;
      border: 1px dashed var(--color-primary-400, #a855f7);
      color: var(--color-primary-300, #c084fc);
      padding: 8px 14px;
      border-radius: var(--radius-lg, 12px);
      font-size: var(--font-size-xs, 0.75rem);
      font-weight: var(--font-weight-medium, 500);
      cursor: pointer;
      margin-bottom: var(--space-5, 1.25rem);
      transition: all var(--transition-fast, 0.15s);
    }

    .add-lang-btn:hover {
      background: rgba(139, 92, 246, 0.1);
      border-color: var(--color-primary-300, #c084fc);
      color: #fff;
    }

    /* RESPONSIVE */
    @media (max-width: 1100px) {
      .uw-main-shell {
        grid-template-columns: 1fr;
      }
      .uw-right-sidebar {
        position: static;
      }
    }
    @media (max-width: 768px) {
      .uw-app-shell {
        grid-template-columns: 1fr;
      }
      .uw-left-nav {
        display: none;
      }
      .uw-main-shell {
        padding: 1rem;
      }
      .uw-promo-banner {
        flex-direction: column;
        align-items: flex-start;
      }
      .uw-promo-art {
        display: none;
      }
    }

  `]
})
export class CreatorDashboardComponent implements OnInit, OnDestroy {
  activeFeedTab: 'best_matches' | 'recent' | 'saved' | 'invites' = 'best_matches';
  dismissedJobIds = new Set<string>();
  savedJobIds = new Set<string>(['j-2']);
  
  creatorFeedJobs = signal<UpworkJobFeedItem[]>([
    {
      id: 'j-1',
      title: 'Tournage 5 Reels Instagram 4K / ProRes – Marque Cosmétique Tunisienne',
      rate: 'Hourly: 40-60 DT/h',
      budgetType: 'HOURLY',
      level: 'Intermédiaire',
      estTime: 'Moins d\'une semaine, <30 hrs/semaine',
      deliverable: 'Format 9:16 vertical 4K',
      description: 'Nous recherchons un créateur smartphone talentueux pour réaliser 5 capsules vidéo UGC promotionnelles (textures de soins, application produit, routine skincare). Tournage avec iPhone 15/16 Pro ou Galaxy S24 Ultra avec micro cravate sans fil obligatoire.',
      tags: ['iPhone 16 Pro', 'Format 9:16', 'Montage CapCut', 'Micro HF', 'Étalonnage ProRes'],
      postedAgo: 'Publié il y a 2h',
      proposalsCount: '5 à 10 propositions',
      client: {
        name: 'BioNatura Tunisie',
        location: 'Tunis, Tunisie',
        rating: 5.0,
        reviewsCount: 18,
        verified: true
      }
    },
    {
      id: 'j-2',
      title: 'Vidéo cinématique stabilisée au Gimbal – Inauguration Showroom Automobile',
      rate: 'Budget: 500 DT (Fixe)',
      budgetType: 'FIXED',
      level: 'Expert',
      estTime: '1 jour de tournage, livraison 48h',
      deliverable: 'Reel 60s + version horizontale',
      description: 'Recherche vidéaste mobile expérimenté équipé d\'un stabilisateur DJI Osmo Mobile et smartphone haut de gamme pour filmer l\'inauguration de notre nouvel espace à La Marsa. Effet drone-style et transitions cinématiques requises.',
      tags: ['DJI Osmo', 'Événementiel', '4K 60fps', 'Mode Action', 'LUT Cinématique'],
      postedAgo: 'Publié il y a 5h',
      proposalsCount: '20 à 50 propositions',
      client: {
        name: 'AutoPrestige Marsa',
        location: 'La Marsa, Tunisie',
        rating: 4.9,
        reviewsCount: 12,
        verified: true
      }
    },
    {
      id: 'j-3',
      title: 'Campagne Vidéo Culinaire & Storytelling pour Restaurant Gastronomique',
      rate: 'Hourly: 35-50 DT/h',
      budgetType: 'HOURLY',
      level: 'Intermédiaire',
      estTime: '2 semaines, ~15 hrs/semaine',
      deliverable: '8 vidéos courtes 9:16',
      description: 'Création de 8 Reels immersifs en cuisine et en salle : dressages en macro, slow-motion vapeur et ambiance du service. Montage rythmé avec sound design soigné.',
      tags: ['Culinaire', 'Macro 4K', 'Slow-motion', 'Storytelling', 'Sound Design'],
      postedAgo: 'Publié il y a 8h',
      proposalsCount: '10 à 15 propositions',
      client: {
        name: 'Le Jasmin Gourmand',
        location: 'Hammamet, Tunisie',
        rating: 5.0,
        reviewsCount: 24,
        verified: true
      }
    },
    {
      id: 'j-4',
      title: 'Témoignages Clients UGC & Démo Produit Tech Mobile (3 Capsules)',
      rate: 'Budget: 320 DT (Fixe)',
      budgetType: 'FIXED',
      level: 'Débutant accepté',
      estTime: '3 jours',
      deliverable: '3 vidéos UGC 30-45s',
      description: 'Tournage de 3 avis clients authentiques face caméra avec smartphone récent (bonne luminosité naturelle ou ring light) et micro sans fil. Sous-titres dynamiques inclus.',
      tags: ['UGC', 'Face Caméra', 'Sous-titres animés', 'Micro HF', 'TikTok'],
      postedAgo: 'Publié hier',
      proposalsCount: 'Moins de 5 propositions',
      client: {
        name: 'TechFlow Africa',
        location: 'Sousse, Tunisie',
        rating: 4.8,
        reviewsCount: 7,
        verified: true
      }
    },
    {
      id: 'j-5',
      title: 'Shooting Mode Streetwear & Vidéos Lookbook Automne',
      rate: 'Budget: 450 DT (Fixe)',
      budgetType: 'FIXED',
      level: 'Intermédiaire',
      estTime: '1 journée de tournage',
      deliverable: '10 photos HD + 4 Reels dynamiques',
      description: 'Tournage en extérieur dans le centre-ville de Tunis. Modèle fourni par la marque. Nous cherchons un créateur avec un œil moderne, colorimétrie contrastée et plans créatifs.',
      tags: ['Streetwear', 'Photo Portrait', 'Reels 9:16', 'iPhone 15 Pro', 'Tunis'],
      postedAgo: 'Publié il y a 1j',
      proposalsCount: '12 propositions',
      client: {
        name: 'UrbanStyle DZ/TN',
        location: 'Tunis, Tunisie',
        rating: 5.0,
        reviewsCount: 31,
        verified: true
      }
    }
  ]);

  filteredJobs = computed(() => {
    const query = (this.homeJobSearch || '').toLowerCase().trim();
    let list = this.creatorFeedJobs().filter(j => !this.dismissedJobIds.has(j.id));

    if (this.activeFeedTab === 'saved') {
      list = list.filter(j => this.savedJobIds.has(j.id));
    } else if (this.activeFeedTab === 'recent') {
      list = [...list].reverse();
    } else if (this.activeFeedTab === 'invites') {
      list = list.slice(0, 1);
    }

    if (query) {
      list = list.filter(j =>
        j.title.toLowerCase().includes(query) ||
        j.description.toLowerCase().includes(query) ||
        j.tags.some(t => t.toLowerCase().includes(query)) ||
        j.client.location.toLowerCase().includes(query)
      );
    }

    return list.map(j => ({
      ...j,
      isSaved: this.savedJobIds.has(j.id)
    }));
  });

  savedJobsCount = computed(() => this.savedJobIds.size);

  toggleSaveJob(id: string): void {
    if (this.savedJobIds.has(id)) {
      this.savedJobIds.delete(id);
      this.showToast('Offre retirée de vos favoris');
    } else {
      this.savedJobIds.add(id);
      this.showToast('Offre enregistrée dans vos favoris');
    }
    this.creatorFeedJobs.update(jobs => [...jobs]);
  }

  dismissJob(id: string): void {
    this.dismissedJobIds.add(id);
    this.showToast('Offre masquée de votre fil');
    this.creatorFeedJobs.update(jobs => [...jobs]);
  }

  toggleFilters(): void {
    this.showToast('Filtres : toutes les missions smartphone actives sont affichées.');
  }

  openCreateContract(): void {
    this.router.navigate(['/creator/contracts']);
  }

  triggerHelpToast(): void {
    this.showToast('Centre d\'aide SnapConnect disponible 24/7 pour les créateurs.');
  }

  auth = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);
  creatorStats = signal<CreatorStats | null>(null);

  // Time ticker
  private timeInterval: any;
  formattedLocalTime = signal<string>('13:00 heure locale');

  // Profile data signals
  displayName = computed(() => {
    const user = this.auth.currentUser();
    return user?.fullName || (user?.email ? user.email.split('@')[0] : 'Chayma G.');
  });

  currentUserId = computed(() => {
    return this.auth.currentUser()?.id || 'me';
  });

  isVerified = computed(() => {
    return !!this.auth.currentUser()?.isVerified;
  });

  profileCompletion = computed(() => {
    let score = 0;
    const user = this.auth.currentUser();
    if (user?.avatarUrl) score += 25;
    if (this.title() && this.title() !== 'software engineering') score += 25;
    if (this.bio() && this.bio().length > 50) score += 25;
    if (this.location() && this.location() !== 'Fernana, Tunisia') score += 25;
    return score || 40; // baseline 40%
  });

  // Visibility status & modal (Upwork Official)
  profileVisibility = signal<'PUBLIC' | 'USERS_ONLY' | 'PRIVATE'>('PUBLIC');
  tempVisibility: 'PUBLIC' | 'USERS_ONLY' | 'PRIVATE' = 'PUBLIC';
  visibilityModalOpen = false;

  visibilityLabel = computed(() => {
    switch (this.profileVisibility()) {
      case 'PUBLIC': return 'Public';
      case 'USERS_ONLY': return 'SnapConnect Users Only';
      case 'PRIVATE': return 'Private';
      default: return 'Public';
    }
  });

  avatarUrl = signal<string>('');
  location = signal<string>('Fernana, Tunisia');
  title = signal<string>('software engineering');
  hourlyRate = signal<number>(10);
  bio = signal<string>(
    "Hello, I'm a passionate computer engineering student hailing from Tunisia, with a keen interest in freelance opportunities. At 25 years old, I bring a blend of youthfulness and dedication to every project I undertake. Being proficient in three languagesÃ¢â‚¬â€Arabic, English, and FrenchÃ¢â‚¬â€allows me to communicate effectively with clients from diverse backgrounds, ensuring clarity and smooth collaboration. My academic background in computer engineering equips me with the technical skills necessary to tackle a wide array of projects, ranging from smartphone video production to web design. With ample time dedicated to freelance work, I'm committed to delivering top quality results."
  );

  // Expanded bio toggle
  bioExpanded = false;

  // ── Home Discovery (Accueil) ──
  homeJobSearch = '';
  homeJobFilter: 'all' | 'video' | 'ugc' | 'reels' | 'photo' | 'remote' = 'all';

  // Sidebar Settings
  isOpenForWork = true;
  isBoosted = false;
  connectsCount = 24;
  hoursPerWeek = 'More than 30 hrs/week';
  smartphoneModel = 'iPhone 16 Pro Max Ã¢â‚¬Â¢ 4K ProRes Log';
  gimbalModel = 'DJI Osmo Mobile 6';
  audioModel = 'Rode Wireless Pro 32-bit float';

  // Portfolio items & tabs
  activePortfolioTab: 'published' | 'drafts' = 'published';
  defaultPortfolioItems: PortfolioItem[] = [
    {
      id: 'p-1',
      creatorId: 'cr-1',
      title: 'Reel UGC Soin du Visage Bio',
      mediaType: 'VIDEO',
      mediaUrl: '/videos/intro-sample.mp4',
      thumbnailUrl: '',
      equipmentUsed: 'iPhone 16 Pro Max 4K 60fps',
      createdAt: '2026-08-15'
    },
    {
      id: 'p-2',
      creatorId: 'cr-1',
      title: 'Textures CrÃƒÂ¨me & Macro CosmÃƒÂ©tique',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      equipmentUsed: 'iPhone 16 Pro Telephoto Macro',
      createdAt: '2026-08-20'
    },
    {
      id: 'p-3',
      creatorId: 'cr-1',
      title: 'Art Latte & Ambiance CafÃƒÂ© Restaurant',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      equipmentUsed: 'iPhone 16 Pro ProRes Log',
      createdAt: '2026-08-25'
    },
    {
      id: 'p-4',
      creatorId: 'cr-1',
      title: 'Lookbook Mode & Coucher de Soleil',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
      equipmentUsed: 'iPhone 16 Pro 4K 120fps',
      createdAt: '2026-08-28'
    }
  ];

  portfolioItems = signal<PortfolioItem[]>(this.defaultPortfolioItems);
  publishedItems = computed(() => this.portfolioItems());
  draftItems = computed(() => [] as PortfolioItem[]);
  selectedMedia = signal<PortfolioItem | null>(null);

  // Skills
  skillsList: string[] = [
    'iPhone 16 Pro Max 4K',
    'ProRes Log & Ãƒâ€°talonnage',
    'Reels & TikTok UGC',
    'Montage CapCut Pro',
    'Prise de son 32-bit float',
    'Format 9:16 Vertical',
    'Stabilisation Gimbal',
    'Photographie Packshot Produit'
  ];

  // Modals state
  titleRateModalOpen = false;
  editTitleValue = '';
  editRateValue = 10;

  bioModalOpen = false;
  editBioValue = '';

  gearModalOpen = false;
  editSmartphone = '';
  editGimbal = '';
  editAudio = '';
  editHours = '';

  hoursModalOpen = false;
  editHoursValue = '';

  // Video Intro state
  introVideoUrl = '/videos/intro-sample.mp4';
  introVideoThumbnail = '';
  introVideoCaption = 'Tournage Smartphone & DÃƒÂ©mos';
  videoIntroModalOpen = false;
  videoIntroMode: 'FILE' | 'URL' = 'FILE';
  editVideoIntroUrl = '';
  editVideoIntroThumbnail = '';
  editVideoIntroCaption = '';

  languagesModalOpen = false;
  userLanguages = signal<Array<{ name: string; level: string }>>([
    { name: 'Arabe', level: 'Langue maternelle' },
    { name: 'FranÃƒÂ§ais', level: 'Bilingue' },
    { name: 'Anglais', level: 'Courant / Professionnel' }
  ]);
  editLanguages: Array<{ name: string; level: string }> = [];

  connectsModalOpen = false;

  // Add Portfolio Modal state
  addPortfolioModalOpen = false;
  portUploadMode: 'FILE' | 'URL' = 'FILE';
  newPortTitle = '';
  newPortMediaUrl = '';
  newPortGear = 'iPhone 16 Pro Max Ã¢â‚¬Â¢ 4K ProRes Log';
  newPortMediaType: 'IMAGE' | 'VIDEO' = 'VIDEO';

  // Toast
  toastMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.initClock();
    this.loadCreatorProfile();
    this.loadPortfolio();
    this.loadCreatorStats();
    if (!this.introVideoThumbnail && this.introVideoUrl) {
      this.extractRealVideoFrame(this.introVideoUrl);
    }
  }

  private loadCreatorStats(): void {
    const user = this.auth.currentUser();
    if (!user || !user.id) return;
    const numericId = String(user.id).replace(/\D/g, '');
    if (!numericId) return;
    this.http.get<CreatorStats>(`http://localhost:8080/api/creators/${numericId}/stats`).pipe(
      catchError(() => of(null))
    ).subscribe(stats => {
      if (stats) {
        this.creatorStats.set(stats);
      }
    });
  }

  getFormattedRating(): string {
    const s = this.creatorStats();
    if (!s || !s.averageRating) return '5.0';
    return s.averageRating.toFixed(1);
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  private initClock(): void {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      this.formattedLocalTime.set(`${hours}:${minutes} heure locale`);
    };
    updateTime();
    this.timeInterval = setInterval(updateTime, 30000);
  }

  private loadCreatorProfile(): void {
    const user = this.auth.currentUser();
    if (!user) return;

    let extra: any = {};
    try {
      const raw = localStorage.getItem(`snapconnect_creator_profile_${user.id}`);
      if (raw) extra = JSON.parse(raw);
    } catch {}

    const dedicated = this.auth.getDedicatedAvatar(user.id, user.email);
    const rawPhoto = dedicated || user.avatarUrl || extra.avatarUrl || '';
    const cleanPhoto = (!rawPhoto || rawPhoto.includes('photo-1534528741775') || rawPhoto.includes('photo-1535713875002')) ? '' : rawPhoto;
    this.avatarUrl.set(cleanPhoto);
    if (cleanPhoto) {
      this.auth.saveDedicatedAvatar(cleanPhoto, user.id, user.email);
    }

    if (user.location || extra.location) this.location.set(user.location || extra.location);
    if (user.title || extra.title) this.title.set(user.title || extra.title);
    if (user.hourlyRate || extra.hourlyRate) this.hourlyRate.set(Number(user.hourlyRate || extra.hourlyRate));
    if (user.bio || extra.bio) this.bio.set(user.bio || extra.bio);
    if (extra.smartphoneModel) this.smartphoneModel = extra.smartphoneModel;
    if (extra.gimbal) this.gimbalModel = extra.gimbal;
    if (extra.audioGear) this.audioModel = extra.audioGear;
    if (extra.hoursPerWeek) this.hoursPerWeek = extra.hoursPerWeek;
    if (extra.introVideoUrl && !extra.introVideoUrl.includes('commondatastorage.googleapis.com')) {
      this.introVideoUrl = extra.introVideoUrl;
    } else {
      this.introVideoUrl = '/videos/intro-sample.mp4';
    }
    if (extra.introVideoThumbnail && !extra.introVideoThumbnail.includes('unsplash.com')) {
      this.introVideoThumbnail = extra.introVideoThumbnail;
    } else {
      this.introVideoThumbnail = '';
    }
    if (extra.introVideoCaption) this.introVideoCaption = extra.introVideoCaption;
    if (extra.connects) this.connectsCount = Number(extra.connects);
    if (Array.isArray(extra.languages) && extra.languages.length > 0) {
      this.userLanguages.set(extra.languages);
    }

    const savedVis = extra.profileVisibility || (user.id ? localStorage.getItem(`snapconnect_profile_visibility_${user.id}`) : null);
    if (savedVis && (savedVis === 'PUBLIC' || savedVis === 'USERS_ONLY' || savedVis === 'PRIVATE')) {
      this.profileVisibility.set(savedVis);
    }
  }

  private loadPortfolio(): void {
    const user = this.auth.currentUser();
    const key = user?.id ? `snapconnect_creator_portfolio_${user.id}` : 'snapconnect_creator_portfolio';
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Deduplicate by ID to prevent NG0955 duplicate key errors
          const seen = new Set<string>();
          const unique = parsed.filter((item: any) => {
            if (!item?.id || seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
          this.portfolioItems.set(unique);
        }
      }
    } catch {}
  }


  private persistPortfolio(): void {
    const user = this.auth.currentUser();
    const key = user?.id ? `snapconnect_creator_portfolio_${user.id}` : 'snapconnect_creator_portfolio';
    try {
      localStorage.setItem(key, JSON.stringify(this.portfolioItems()));
    } catch {}
  }

  private persistExtra(): void {
    const user = this.auth.currentUser();
    if (!user?.id) return;
    const currentPhoto = this.avatarUrl();
    if (currentPhoto) {
      this.auth.saveDedicatedAvatar(currentPhoto, user.id, user.email);
    }
    const key = `snapconnect_creator_profile_${user.id}`;
    const extra = {
      title: this.title(),
      hourlyRate: this.hourlyRate(),
      bio: this.bio(),
      location: this.location(),
      smartphoneModel: this.smartphoneModel,
      gimbal: this.gimbalModel,
      audioGear: this.audioModel,
      hoursPerWeek: this.hoursPerWeek,
      introVideoUrl: this.introVideoUrl,
      introVideoThumbnail: this.introVideoThumbnail,
      introVideoCaption: this.introVideoCaption,
      connects: this.connectsCount,
      avatarUrl: currentPhoto,
      profileVisibility: this.profileVisibility(),
      languages: this.userLanguages()
    };
    try {
      localStorage.setItem(key, JSON.stringify(extra));
    } catch {}
  }

  onAvatarError(event: any): void {
    this.avatarUrl.set('');
  }

  onAvatarFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const rawDataUrl = e.target.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 280;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        let compressed = rawDataUrl;
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          compressed = canvas.toDataURL('image/jpeg', 0.78);
        }
        this.applyDashboardAvatar(compressed);
      };
      img.onerror = () => {
        this.applyDashboardAvatar(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  }

  private applyDashboardAvatar(base64: string): void {
    if (!base64) return;
    this.avatarUrl.set(base64);
    const user = this.auth.currentUser();
    this.auth.saveDedicatedAvatar(base64, user?.id, user?.email);
    this.persistExtra();
    if (user) {
      const updated = { ...user, avatarUrl: base64 };
      this.auth.currentUser.set(updated);
      try {
        localStorage.setItem('snapconnect_user', JSON.stringify(updated));
      } catch {}
    }
    this.auth.updateProfile({ avatarUrl: base64 }).subscribe({
      next: () => {
        this.showToast('Photo de profil mise ÃƒÂ  jour avec succÃƒÂ¨s !');
      },
      error: () => {
        this.showToast('Photo mise ÃƒÂ  jour localement.');
      }
    });
  }

  // Modals actions
  openTitleRateModal(): void {
    this.editTitleValue = this.title();
    this.editRateValue = this.hourlyRate();
    this.titleRateModalOpen = true;
  }

  saveTitleRate(): void {
    if (!this.editTitleValue.trim()) return;
    this.title.set(this.editTitleValue.trim());
    this.hourlyRate.set(Number(this.editRateValue) || 10);
    this.titleRateModalOpen = false;

    this.auth.updateProfile({
      title: this.title(),
      hourlyRate: this.hourlyRate()
    }).subscribe({
      next: () => {
        this.persistExtra();
        this.showToast('Titre et tarif horaire enregistrÃƒÂ©s !');
      },
      error: () => {
        this.persistExtra();
        this.showToast('Modifications enregistrÃƒÂ©es.');
      }
    });
  }

  openBioModal(): void {
    this.editBioValue = this.bio();
    this.bioModalOpen = true;
  }

  saveBio(): void {
    if (!this.editBioValue.trim()) return;
    this.bio.set(this.editBioValue.trim());
    this.bioModalOpen = false;

    this.auth.updateProfile({
      bio: this.bio()
    }).subscribe({
      next: () => {
        this.persistExtra();
        this.showToast('PrÃƒÂ©sentation enregistrÃƒÂ©e !');
      },
      error: () => {
        this.persistExtra();
        this.showToast('PrÃƒÂ©sentation enregistrÃƒÂ©e.');
      }
    });
  }

  openAvailabilityModal(): void {
    this.isOpenForWork = !this.isOpenForWork;
    this.showToast(this.isOpenForWork ? 'Statut : Ouvert aux nouvelles missions' : 'Statut : Indisponible');
  }

  toggleProfileBoost(): void {
    this.isBoosted = !this.isBoosted;
    this.showToast(this.isBoosted ? 'Boost profil activÃƒÂ© (+3x visibilitÃƒÂ©) !' : 'Boost dÃƒÂ©sactivÃƒÂ©.');
  }

  openConnectsModal(): void {
    this.connectsModalOpen = true;
  }

  buyConnects(count: number, price: number): void {
    this.connectsCount += count;
    this.persistExtra();
    this.connectsModalOpen = false;
    this.showToast(`+${count} Connects ajoutÃƒÂ©s avec succÃƒÂ¨s (${price} DT) !`);
  }

  get introVideoDisplayUrl(): string {
    if (!this.introVideoUrl) return '';
    if (this.introVideoUrl.startsWith('blob:') || this.introVideoUrl.includes('#t=')) {
      return this.introVideoUrl;
    }
    return `${this.introVideoUrl}#t=2.0`;
  }

  onIntroVideoMeta(event: Event): void {
    const video = event.target as HTMLVideoElement;
    if (video && video.duration > 0) {
      video.currentTime = Math.min(2.0, video.duration > 2 ? 2.0 : 0.5);
    }
  }

  onIntroVideoCanPlay(event: Event): void {
    const video = event.target as HTMLVideoElement;
    if (video && video.currentTime < 0.5 && video.duration > 1.0) {
      video.currentTime = Math.min(2.0, video.duration / 2);
    }
  }

  private extractRealVideoFrame(videoUrl: string): void {
    if (!videoUrl) return;
    try {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(2.0, video.duration > 2 ? 2.0 : 0.5);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const captured = canvas.toDataURL('image/jpeg', 0.85);
            if (captured && captured.length > 200) {
              this.introVideoThumbnail = captured;
              this.persistExtra();
            }
          }
        } catch {}
      };
    } catch {}
  }

  openVideoIntroModal(): void {
    this.editVideoIntroUrl = this.introVideoUrl;
    this.editVideoIntroThumbnail = this.introVideoThumbnail && !this.introVideoThumbnail.includes('unsplash.com') ? this.introVideoThumbnail : '';
    this.editVideoIntroCaption = this.introVideoCaption;
    this.videoIntroModalOpen = true;
  }

  playVideoIntro(): void {
    if (this.introVideoUrl) {
      this.selectedMedia.set({
        id: 'intro-video',
        creatorId: this.auth.currentUser()?.id || 'cr-1',
        title: this.introVideoCaption || 'VidÃƒÂ©o de prÃƒÂ©sentation - Tournage Smartphone 4K',
        mediaType: 'VIDEO',
        mediaUrl: this.introVideoUrl,
        equipmentUsed: this.smartphoneModel,
        createdAt: '2026'
      });
    } else {
      this.openVideoIntroModal();
    }
  }

  onVideoIntroFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    this.editVideoIntroUrl = objectUrl;

    const tempVideo = document.createElement('video');
    tempVideo.src = objectUrl;
    tempVideo.muted = true;
    tempVideo.playsInline = true;
    tempVideo.preload = 'auto';
    tempVideo.onloadedmetadata = () => {
      tempVideo.currentTime = Math.min(1.5, tempVideo.duration > 1 ? 1.5 : 0.2);
    };
    tempVideo.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = tempVideo.videoWidth || 640;
        canvas.height = tempVideo.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
          this.editVideoIntroThumbnail = canvas.toDataURL('image/jpeg', 0.85);
        }
      } catch {}
    };
  }

  saveVideoIntro(): void {
    if (this.editVideoIntroUrl && this.editVideoIntroUrl.trim()) {
      this.introVideoUrl = this.editVideoIntroUrl.trim();
    }
    if (this.editVideoIntroThumbnail && !this.editVideoIntroThumbnail.includes('unsplash.com')) {
      this.introVideoThumbnail = this.editVideoIntroThumbnail.trim();
    } else if (this.introVideoUrl) {
      this.extractRealVideoFrame(this.introVideoUrl);
    }
    if (this.editVideoIntroCaption && this.editVideoIntroCaption.trim()) {
      this.introVideoCaption = this.editVideoIntroCaption.trim();
    }
    this.videoIntroModalOpen = false;
    this.persistExtra();
    this.showToast('VidÃƒÂ©o de prÃƒÂ©sentation enregistrÃƒÂ©e avec succÃƒÂ¨s !');
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬ Hours per week Controls Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  openHoursModal(): void {
    this.editHoursValue = this.hoursPerWeek;
    this.hoursModalOpen = true;
  }

  saveHours(): void {
    if (this.editHoursValue && this.editHoursValue.trim()) {
      this.hoursPerWeek = this.editHoursValue.trim();
    }
    this.hoursModalOpen = false;
    this.persistExtra();
    this.showToast('DisponibilitÃƒÂ© hebdomadaire mise ÃƒÂ  jour !');
  }

  openGearModal(): void {
    this.editSmartphone = this.smartphoneModel;
    this.editGimbal = this.gimbalModel;
    this.editAudio = this.audioModel;
    this.gearModalOpen = true;
  }

  saveGear(): void {
    this.smartphoneModel = this.editSmartphone;
    this.gimbalModel = this.editGimbal;
    this.audioModel = this.editAudio;
    this.gearModalOpen = false;
    this.persistExtra();
    this.showToast('Ãƒâ€°quipement certifiÃƒÂ© 4K actualisÃƒÂ© !');
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬ Languages Controls Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  openLanguagesModal(): void {
    this.editLanguages = this.userLanguages().map(l => ({ ...l }));
    this.languagesModalOpen = true;
  }

  addLanguage(): void {
    this.editLanguages.push({ name: '', level: 'Courant / Professionnel' });
  }

  removeLanguage(index: number): void {
    if (this.editLanguages.length > 1) {
      this.editLanguages.splice(index, 1);
    }
  }

  saveLanguages(): void {
    const valid = this.editLanguages
      .filter(l => l.name.trim().length > 0)
      .map(l => ({ name: l.name.trim(), level: l.level }));

    if (valid.length > 0) {
      this.userLanguages.set(valid);
    }
    this.languagesModalOpen = false;
    this.persistExtra();
    this.showToast('Langues mises ÃƒÂ  jour avec succÃƒÂ¨s !');
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬ Profile Visibility Controls Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  openVisibilityModal(): void {
    this.tempVisibility = this.profileVisibility();
    this.visibilityModalOpen = true;
  }

  saveProfileVisibility(): void {
    this.profileVisibility.set(this.tempVisibility);
    const user = this.auth.currentUser();
    if (user?.id) {
      localStorage.setItem(`snapconnect_profile_visibility_${user.id}`, this.tempVisibility);
    }
    this.persistExtra();
    this.visibilityModalOpen = false;
    this.showToast(`VisibilitÃƒÂ© du profil mise ÃƒÂ  jour : ${this.visibilityLabel()}`);
  }

  openAddPortfolioModal(): void {
    this.newPortTitle = '';
    this.newPortMediaUrl = '';
    this.newPortGear = this.smartphoneModel;
    this.newPortMediaType = 'VIDEO';
    this.portUploadMode = 'FILE';
    this.addPortfolioModalOpen = true;
  }

  closePortfolioModal(): void {
    this.addPortfolioModalOpen = false;
  }

  onPortFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      this.newPortMediaType = 'VIDEO';
      this.newPortMediaUrl = URL.createObjectURL(file);
    } else {
      this.newPortMediaType = 'IMAGE';
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newPortMediaUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  savePortfolioItem(): void {
    if (!this.newPortTitle.trim() || !this.newPortMediaUrl) return;

    const newItem: PortfolioItem = {
      id: 'p-' + Date.now(),
      creatorId: this.currentUserId(),
      title: this.newPortTitle.trim(),
      mediaType: this.newPortMediaType,
      mediaUrl: this.newPortMediaUrl,
      thumbnailUrl: this.newPortMediaType === 'IMAGE' ? this.newPortMediaUrl : undefined,
      equipmentUsed: this.newPortGear || this.smartphoneModel,
      createdAt: new Date().toISOString().slice(0, 10)
    };

    this.portfolioItems.update(list => [newItem, ...list]);
    this.persistPortfolio();
    this.addPortfolioModalOpen = false;
    this.showToast('RÃƒÂ©alisation ajoutÃƒÂ©e au portfolio !');
  }

  openAddSkillModal(): void {
    const newSkill = prompt('Entrez une compÃƒÂ©tence smartphone (ex. Ãƒâ€°talonnage DaVinci, Format 9:16...) :');
    if (newSkill && newSkill.trim()) {
      this.skillsList.push(newSkill.trim());
      this.showToast('CompÃƒÂ©tence ajoutÃƒÂ©e !');
    }
  }

  removeSkill(skill: string): void {
    this.skillsList = this.skillsList.filter(s => s !== skill);
  }

  copyProfileShareLink(): void {
    const url = `${window.location.origin}/creators/${this.currentUserId()}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        this.showToast('Lien du profil copiÃƒÂ© dans le presse-papier !');
      });
    } else {
      this.showToast(`Lien public : ${url}`);
    }
  }

  triggerVerifyToast(): void {
    this.showToast('VÃƒÂ©rification dÃ¢â‚¬â„¢identitÃƒÂ© certifiÃƒÂ©e SnapConnect');
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3200);
  }
}
