import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { RecommendationMatchComponent } from '../../../shared/components/recommendation-match/recommendation-match.component';
import { AuthService } from '../../../core/services/auth.service';
import { RecommendationService } from '../../../core/services/recommendation.service';
import { JobService } from '../../../core/services/job.service';
import { ProposalService } from '../../../core/services/proposal.service';
import { ContractService } from '../../../core/services/contract.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [FormsModule, RouterLink, SlicePipe, NavbarComponent, FooterComponent, RecommendationMatchComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="upwork-client-dashboard">
      <div class="uw-client-container">

        <!-- ══ TOP GREETING & HERO CTA BAR ══ -->
        <header class="uw-client-hero card-glass">
          <div class="hero-text-block">
            <div class="client-badge-row">
              <span class="client-type-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 4px;">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                Espace Client Entreprise
              </span>
              <span class="escrow-verified-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Paiements Sécurisés Escrow
              </span>
            </div>
            <h1 class="hero-greeting">Bonjour, {{ clientDisplayName() }}</h1>
            <p class="hero-description">
              Pilotez vos briefs de tournage smartphone, examinez les candidatures des créateurs certifiés et validez vos livrables 4K sous séquestre sécurisé.
            </p>
          </div>

          <div class="hero-actions-block">
            <a routerLink="/client/jobs/create" class="uw-btn-primary-green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Publier un brief mobile
            </a>
            <a routerLink="/services" class="uw-btn-outline-catalog">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              Project Catalog (Services)
            </a>
          </div>
        </header>

        <!-- ══ TALENT & BRIEF SEARCH BAR ══ -->
        <div class="uw-client-search-bar card-glass">
          <div class="search-input-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Rechercher parmi vos briefs (titre, matériel requis, catégorie 9:16...)"
              class="uw-search-input"
            />
            @if (searchQuery) {
              <button type="button" class="clear-search-btn" (click)="searchQuery = ''" title="Effacer la recherche">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            }
          </div>
          <a routerLink="/creators" class="uw-btn-search-talent">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Explorer les créateurs
          </a>
        </div>

        <!-- ══ METRICS OVERVIEW STRIP ══ -->
        <section class="uw-metrics-strip">
          <div class="metric-box">
            <div class="metric-icon-wrap violet">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div class="metric-data">
              <span class="metric-title">Briefs Actifs</span>
              <strong class="metric-number">{{ activeJobsCount() }}</strong>
            </div>
          </div>

          <div class="metric-box">
            <div class="metric-icon-wrap pink">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div class="metric-data">
              <span class="metric-title">Candidatures</span>
              <strong class="metric-number">{{ totalProposalsCount() }}</strong>
            </div>
          </div>

          <div class="metric-box">
            <div class="metric-icon-wrap emerald">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <div class="metric-data">
              <span class="metric-title">Contrats en Cours</span>
              <strong class="metric-number">{{ activeContractsCount() }}</strong>
            </div>
          </div>

          <div class="metric-box">
            <div class="metric-icon-wrap gold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div class="metric-data">
              <span class="metric-title">Sous Séquestre</span>
              <strong class="metric-number">{{ activeEscrowAmount() }} DT</strong>
            </div>
          </div>
        </section>

        <!-- ══ TWO-COLUMN WORKSPACE LAYOUT (Upwork 70% / 30%) ══ -->
        <div class="uw-workspace-grid">

          <!-- ───────────────────────────────────────────
               LEFT MAIN COLUMN (70%)
               ─────────────────────────────────────────── -->
          <div class="uw-main-col">

            <!-- ── SECTION 1: YOUR POSTINGS (Gestionnaire de Missions) ── -->
            <section class="uw-card-panel">
              <div class="panel-header-row flex-between">
                <div>
                  <h2 class="panel-title">Vos missions & briefs de tournage</h2>
                  <p class="panel-sub">Suivez en temps réel les propositions reçues et échangez avec les créateurs mobiles.</p>
                </div>
                <a routerLink="/client/jobs/create" class="action-text-link">+ Nouveau brief</a>
              </div>

              <!-- Filter Tabs -->
              <div class="uw-tabs-row">
                <button
                  type="button"
                  class="uw-tab-btn"
                  [class.active]="jobTab() === 'ACTIVE'"
                  (click)="jobTab.set('ACTIVE')"
                >
                  Actives ({{ activeJobsCount() }})
                </button>
                <button
                  type="button"
                  class="uw-tab-btn"
                  [class.active]="jobTab() === 'ALL'"
                  (click)="jobTab.set('ALL')"
                >
                  Toutes les missions ({{ myJobs().length }})
                </button>
                <button
                  type="button"
                  class="uw-tab-btn"
                  [class.active]="jobTab() === 'DRAFTS'"
                  (click)="jobTab.set('DRAFTS')"
                >
                  Brouillons (0)
                </button>
              </div>

              <!-- Jobs List -->
              @if (filteredJobs().length > 0) {
                <div class="uw-postings-list">
                  @for (j of filteredJobs(); track j.id) {
                    <article class="uw-posting-card">
                      <div class="posting-top flex-between">
                        <div class="posting-heading">
                          <span class="posting-date">Publié {{ j.postedDate || 'Récemment' }}</span>
                          <h3 class="posting-title">
                            <a [routerLink]="['/client/jobs', j.id, 'proposals']" class="title-link">
                              {{ j.title }}
                            </a>
                          </h3>
                        </div>

                        <span class="status-pill" [class.open]="j.status === 'OPEN'">
                          ● {{ j.status === 'OPEN' ? 'Ouvert aux candidatures' : 'En production' }}
                        </span>
                      </div>

                      <p class="posting-desc-snippet">
                        {{ (j.description | slice:0:150) || 'Brief de tournage smartphone professionnel haute qualité.' }}...
                      </p>

                      <!-- Specs Chips -->
                      <div class="posting-chips-wrap">
                        <span class="posting-chip budget-chip">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 4px;">
                            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                            <line x1="2" y1="10" x2="22" y2="10"></line>
                          </svg>
                          {{ j.budgetAmount || j.budgetMin || 150 }} DT • Prix fixe (Séquestre)
                        </span>
                        <span class="posting-chip category-chip">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 4px;">
                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                          </svg>
                          {{ j.category || j.categoryName || 'Reels & Vidéos 9:16' }}
                        </span>
                        <span class="posting-chip gear-chip">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 4px;">
                            <rect x="5" y="2" width="14" height="20" rx="3"></rect>
                            <line x1="12" y1="18" x2="12.01" y2="18"></line>
                          </svg>
                          {{ j.requiredGear || 'iPhone 16 Pro Max • 4K ProRes' }}
                        </span>
                        @if (j.location) {
                          <span class="posting-chip loc-chip">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 4px;">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            {{ j.location }}
                          </span>
                        }
                      </div>

                      <!-- Upwork Action Metrics Row -->
                      <div class="posting-metrics-bar flex-between">
                        <div class="metrics-counters">
                          <div class="count-item" [class.highlight]="getProposalsForJob(j.id).length > 0">
                            <strong>{{ getProposalsForJob(j.id).length }}</strong>
                            <span>Propositions</span>
                          </div>
                          <span class="count-sep">•</span>
                          <div class="count-item">
                            <strong>{{ getMessagedCountForJob(j.id) }}</strong>
                            <span>Entretiens</span>
                          </div>
                          <span class="count-sep">•</span>
                          <div class="count-item">
                            <strong>{{ getHiredForJob(j.id) }}</strong>
                            <span>Embauché</span>
                          </div>
                        </div>

                        <div class="posting-actions">
                          <a
                            [routerLink]="['/client/jobs', j.id, 'proposals']"
                            class="uw-btn-proposals"
                            title="Consulter les candidatures"
                          >
                            Examiner les candidatures ({{ getProposalsForJob(j.id).length }}) →
                          </a>
                        </div>
                      </div>
                    </article>
                  }
                </div>
              } @else {
                <div class="uw-empty-state">
                  <div class="empty-icon-circle">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                  </div>
                  <h4>Aucun brief dans cette catégorie</h4>
                  <p>Publiez un nouveau brief pour recevoir des propositions de créateurs smartphone qualifiés sous 24h.</p>
                  <a routerLink="/client/jobs/create" class="uw-btn-primary-green">
                    + Publier un brief mobile
                  </a>
                </div>
              }
            </section>

            <!-- ── SECTION 2: TOURNAGES & CONTRATS ACTIFS (Séquestre Escrow) ── -->
            <section class="uw-card-panel">
              <div class="panel-header-row flex-between">
                <div>
                  <h2 class="panel-title">Tournages & Contrats en cours</h2>
                  <p class="panel-sub">Gestion des jalons, inspection des livrables 4K et validation des paiements sous séquestre.</p>
                </div>
                <a routerLink="/client/contracts" class="action-text-link">
                  Voir tous les contrats ({{ activeContractsCount() }}) →
                </a>
              </div>

              @if (activeContracts().length > 0) {
                <div class="uw-contracts-list">
                  @for (c of activeContracts(); track c.id) {
                    <article class="uw-contract-card">
                      <div class="contract-top-row flex-between">
                        <div class="contract-meta-left">
                          <span class="contract-type-pill">{{ c.type === 'JOB' ? 'Mission Brief' : 'Package Service' }}</span>
                          <h3 class="contract-title">{{ c.title }}</h3>
                        </div>
                        <span class="contract-status-badge" [class]="getStatusClass(c.status)">
                          ● {{ getStatusLabel(c.status) }}
                        </span>
                      </div>

                      <!-- Creator Info Row -->
                      <div class="contract-creator-strip">
                        <div class="creator-avatar-wrap">
                          @if (getCreatorAvatar(c.creatorId, c.creatorAvatar)) {
                            <img
                              [src]="getCreatorAvatar(c.creatorId, c.creatorAvatar)"
                              [alt]="c.creatorName"
                              class="creator-img"
                              referrerpolicy="no-referrer"
                            />
                          } @else {
                            <div class="creator-avatar-placeholder">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                            </div>
                          }
                          <span class="creator-online-pip"></span>
                        </div>
                        <div class="creator-details">
                          <span class="creator-label">Créateur mobile assigné :</span>
                          <a [routerLink]="['/creators', c.creatorId || 'cr-1']" class="creator-link">
                            {{ c.creatorName }}
                          </a>
                        </div>
                      </div>

                      <!-- Escrow Protection Guarantee Banner -->
                      <div class="escrow-guarantee-box flex-between">
                        <div class="escrow-text-side">
                          <div class="escrow-amount-tag">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            <strong>{{ c.amount }} DT</strong> consignés sous séquestre sécurisé
                          </div>
                          <span class="escrow-note">Les fonds sont protégés jusqu'à votre approbation finale des rushs ou montages.</span>
                        </div>

                        <div class="contract-action-btn-wrap">
                          @if (c.status === 'DELIVERY') {
                            <a [routerLink]="['/client/contracts', c.id]" class="uw-btn-validate-escrow">
                              Examiner livrables 4K & Payer →
                            </a>
                          } @else {
                            <a [routerLink]="['/client/contracts', c.id]" class="uw-btn-contract-details">
                              Suivi du contrat & Fichiers →
                            </a>
                          }
                        </div>
                      </div>
                    </article>
                  }
                </div>
              } @else {
                <div class="uw-empty-state">
                  <div class="empty-icon-circle">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <h4>Aucun tournage actif actuellement</h4>
                  <p>Embauchez un créateur depuis vos propositions pour lancer votre production vidéo ou photo smartphone.</p>
                  <div class="empty-actions-row">
                    <a routerLink="/client/jobs" class="uw-btn-primary-green">Gérer mes briefs</a>
                    <a routerLink="/creators" class="uw-btn-outline-catalog">Explorer les créateurs</a>
                  </div>
                </div>
              }
            </section>

            <!-- ── SECTION 3: TALENT YOU MAY LIKE (Recommandations IA) ── -->
            <section class="uw-card-panel">
              <div class="panel-header-row flex-between">
                <div>
                  <span class="ia-engine-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align: -1px; margin-right: 4px;">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                    Match Engine SnapConnect
                  </span>
                  <h2 class="panel-title">Créateurs smartphone recommandés pour vous</h2>
                  <p class="panel-sub">Sélectionnés d'après vos briefs et vos exigences de matériel 4K ProRes.</p>
                </div>
                <a routerLink="/creators" class="action-text-link">Explorer tout le catalogue →</a>
              </div>

              <div class="uw-rec-grid">
                @for (rec of recommendationService.recommendedCreatorsForClient().slice(0, 3); track rec.creator.id) {
                  <article class="uw-rec-card">
                    <div class="rec-card-top flex-between">
                      <div class="rec-creator-profile">
                        @if (getCreatorAvatar(rec.creator.id, rec.creator.avatarUrl)) {
                          <img [src]="getCreatorAvatar(rec.creator.id, rec.creator.avatarUrl)" [alt]="rec.creator.fullName" class="rec-avatar" referrerpolicy="no-referrer" />
                        } @else {
                          <div class="creator-avatar-placeholder" style="width: 44px; height: 44px; min-width: 44px; border-radius: 50%;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                          </div>
                        }
                        <div>
                          <a [routerLink]="['/creators', rec.creator.id]" class="rec-creator-name">
                            {{ rec.creator.fullName }}
                          </a>
                          <span class="rec-creator-title">{{ rec.creator.title | slice:0:30 }}...</span>
                        </div>
                      </div>
                      <span class="rec-price-badge">{{ rec.creator.hourlyRate }} DT/h</span>
                    </div>

                    <app-recommendation-match [score]="rec.matchScore" [reasons]="rec.matchReasons"></app-recommendation-match>

                    <div class="rec-card-bottom flex-between">
                      <span class="rec-gear-pill">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="5" y="2" width="14" height="20" rx="3"></rect>
                          <line x1="12" y1="18" x2="12.01" y2="18"></line>
                        </svg>
                        {{ rec.creator.equipment?.smartphoneModel || 'iPhone 16 Pro Max' }}
                      </span>

                      <div class="rec-btn-group">
                        <button
                          type="button"
                          class="uw-btn-invite"
                          (click)="inviteCreator(rec.creator.fullName)"
                          title="Inviter ce créateur sur un brief"
                        >
                          Inviter
                        </button>
                        <a [routerLink]="['/creators', rec.creator.id]" class="uw-btn-view-profile">
                          Profil →
                        </a>
                      </div>
                    </div>
                  </article>
                }
              </div>
            </section>

          </div>

          <!-- ───────────────────────────────────────────
               RIGHT SIDEBAR (30% - Upwork Client Hub)
               ─────────────────────────────────────────── -->
          <aside class="uw-sidebar-col">

            <!-- Card 1: Company Profile & Verification -->
            <div class="uw-side-card company-card">
              <div class="company-header flex-between">
                <div class="company-identity">
                  @if (clientAvatar()) {
                    <img [src]="clientAvatar()" [alt]="clientDisplayName()" class="company-logo-img" referrerpolicy="no-referrer" />
                  } @else {
                    <div class="company-logo-circle">
                      {{ clientInitials() }}
                    </div>
                  }
                  <div>
                    <h3 class="company-name">{{ clientDisplayName() }}</h3>
                    <span class="company-tag">Compte Client</span>
                  </div>
                </div>
                <a routerLink="/client/profile" class="edit-icon-btn" title="Modifier le profil">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </a>
              </div>

              <div class="side-divider"></div>

              <!-- Verification badge -->
              <div class="verification-badge-box">
                <div class="verified-icon-check">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div class="verified-info">
                  <strong>Moyen de paiement vérifié</strong>
                  <span>Garantie de séquestre bancaire activée</span>
                </div>
              </div>

              <!-- Profile Completion -->
              <div class="side-progress-block">
                <div class="prog-top flex-between">
                  <span class="prog-title">Profil client</span>
                  <span class="prog-val">100%</span>
                </div>
                <div class="prog-track">
                  <div class="prog-fill" style="width: 100%;"></div>
                </div>
              </div>
            </div>

            <!-- Card 2: Financial Spend & Escrow Overview -->
            <div class="uw-side-card finance-card">
              <h3 class="side-card-title">Synthèse Financière & Séquestre</h3>

              <div class="finance-stat-row">
                <span class="fin-label">Fonds sous séquestre actif</span>
                <strong class="fin-value green">{{ activeEscrowAmount() }} DT</strong>
              </div>
              <p class="fin-help-text">Consignés en sécurité chez SnapConnect pour vos contrats en cours.</p>

              <div class="side-divider"></div>

              <div class="finance-stat-row">
                <span class="fin-label">Total investi</span>
                <strong class="fin-value">{{ totalInvested() }} DT</strong>
              </div>

              <a routerLink="/client/payments" class="side-action-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
                Gérer les paiements & factures
              </a>
            </div>

            <!-- Card 3: Action Needed (Alertes prioritaires) -->
            <div class="uw-side-card alerts-card">
              <h3 class="side-card-title">Actions requises</h3>

              <ul class="alerts-list">
                @if (deliveryPendingCount() > 0) {
                  <li class="alert-item urgent">
                    <span class="alert-dot red"></span>
                    <div>
                      <strong>{{ deliveryPendingCount() }} livrable(s) 4K à valider</strong>
                      <p>Vérifiez les rushs et vidéos déposés pour libérer les fonds.</p>
                      <a routerLink="/client/contracts" class="alert-link">Examiner maintenant →</a>
                    </div>
                  </li>
                }

                @if (totalProposalsCount() > 0) {
                  <li class="alert-item">
                    <span class="alert-dot violet"></span>
                    <div>
                      <strong>{{ totalProposalsCount() }} candidatures reçues</strong>
                      <p>Des créateurs smartphone ont postulé sur vos briefs récents.</p>
                      <a routerLink="/client/jobs" class="alert-link">Voir les candidats →</a>
                    </div>
                  </li>
                }

                <li class="alert-item neutral">
                  <span class="alert-dot green"></span>
                  <div>
                    <strong>Protection séquestre active</strong>
                    <p>Tous vos tournages bénéficient de la garantie de remboursement 100%.</p>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Card 4: Quick Navigation Links -->
            <div class="uw-side-card nav-shortcuts-card">
              <h3 class="side-card-title">Raccourcis rapides</h3>

              <nav class="shortcuts-nav">
                <a routerLink="/client/jobs/create" class="shortcut-link">
                  <span>+ Publier une nouvelle mission</span>
                  <span class="arrow">→</span>
                </a>
                <a routerLink="/client/jobs" class="shortcut-link">
                  <span>Mes briefs en cours ({{ activeJobsCount() }})</span>
                  <span class="arrow">→</span>
                </a>
                <a routerLink="/client/contracts" class="shortcut-link">
                  <span>Mes contrats actifs ({{ activeContractsCount() }})</span>
                  <span class="arrow">→</span>
                </a>
                <a routerLink="/services" class="shortcut-link">
                  <span>Project Catalog (Packages)</span>
                  <span class="arrow">→</span>
                </a>
                <a routerLink="/messages" class="shortcut-link">
                  <span>Messagerie & Entretiens</span>
                  <span class="arrow">→</span>
                </a>
                <a routerLink="/client/favorites" class="shortcut-link">
                  <span>Créateurs sauvegardés / Favoris</span>
                  <span class="arrow">→</span>
                </a>
              </nav>
            </div>

          </aside>

        </div>

      </div>

      <!-- Toast Feedback -->
      @if (toastMessage()) {
        <div class="uw-floating-toast animate-slide-up">
          <span>{{ toastMessage() }}</span>
        </div>
      }
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host {
      display: block;
      color: #f1f5f9;
      background: #070b14;
    }

    .upwork-client-dashboard {
      padding-top: calc(var(--navbar-height, 72px) + 1.5rem);
      padding-bottom: 5rem;
      min-height: 100vh;
      background: radial-gradient(circle at 15% 10%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
                  radial-gradient(circle at 85% 60%, rgba(16, 185, 129, 0.05) 0%, transparent 45%),
                  #070b14;
    }

    .uw-client-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    .flex-between {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* ══════════════════════════════════════════
       TOP GREETING & HERO CTA BAR
       ══════════════════════════════════════════ */
    .uw-client-hero {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 18px;
      padding: 2rem 2.2rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
      backdrop-filter: blur(14px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }

    .hero-text-block {
      max-width: 680px;
    }

    .client-badge-row {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }

    .client-type-badge {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      background: rgba(139, 92, 246, 0.15);
      border: 1px solid rgba(139, 92, 246, 0.35);
      color: #c4b5fd;
    }

    .escrow-verified-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #6ee7b7;
    }

    .hero-greeting {
      font-size: 2rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.02em;
    }

    .hero-description {
      font-size: 0.95rem;
      color: #94a3b8;
      line-height: 1.5;
      margin: 0;
    }

    .hero-actions-block {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .uw-btn-primary-green {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: #10b981;
      color: #ffffff;
      font-size: 0.92rem;
      font-weight: 700;
      padding: 0.85rem 1.6rem;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
      cursor: pointer;
      border: none;
    }

    .uw-btn-primary-green:hover {
      background: #059669;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
    }

    .uw-btn-outline-catalog {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #e2e8f0;
      font-size: 0.88rem;
      font-weight: 600;
      padding: 0.75rem 1.4rem;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .uw-btn-outline-catalog:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
      color: #ffffff;
    }

    /* ══════════════════════════════════════════
       TALENT & BRIEF SEARCH BAR
       ══════════════════════════════════════════ */
    .uw-client-search-bar {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 0.75rem 1.25rem;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      backdrop-filter: blur(12px);
    }

    .search-input-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      position: relative;
    }

    .search-icon {
      color: #94a3b8;
      flex-shrink: 0;
    }

    .uw-search-input {
      width: 100%;
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 0.92rem;
      outline: none;
    }

    .uw-search-input::placeholder {
      color: #64748b;
    }

    .clear-search-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #94a3b8;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 11px;
      transition: background 0.15s;
    }

    .clear-search-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }

    .uw-btn-search-talent {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(139, 92, 246, 0.15);
      border: 1px solid rgba(139, 92, 246, 0.35);
      color: #c4b5fd;
      font-size: 0.85rem;
      font-weight: 700;
      padding: 0.55rem 1.2rem;
      border-radius: 10px;
      text-decoration: none;
      white-space: nowrap;
      transition: all 0.2s ease;
    }

    .uw-btn-search-talent:hover {
      background: #8b5cf6;
      color: #ffffff;
      transform: translateY(-1px);
    }

    /* ══════════════════════════════════════════
       METRICS OVERVIEW STRIP
       ══════════════════════════════════════════ */
    .uw-metrics-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .metric-box {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 1.15rem 1.3rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.25s ease;
    }

    .metric-box:hover {
      background: rgba(30, 41, 59, 0.65);
      border-color: rgba(255, 255, 255, 0.12);
      transform: translateY(-2px);
    }

    .metric-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .metric-icon-wrap.violet {
      background: rgba(139, 92, 246, 0.15);
      border: 1px solid rgba(139, 92, 246, 0.3);
      color: #a78bfa;
    }

    .metric-icon-wrap.pink {
      background: rgba(236, 72, 153, 0.15);
      border: 1px solid rgba(236, 72, 153, 0.3);
      color: #f472b6;
    }

    .metric-icon-wrap.emerald {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
    }

    .metric-icon-wrap.gold {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24;
    }

    .metric-data {
      display: flex;
      flex-direction: column;
    }

    .metric-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-number {
      font-size: 1.45rem;
      font-weight: 800;
      color: #ffffff;
      margin-top: 2px;
    }

    /* ══════════════════════════════════════════
       WORKSPACE 2-COLUMN GRID (70% / 30%)
       ══════════════════════════════════════════ */
    .uw-workspace-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 1.75rem;
      align-items: start;
    }

    .uw-main-col {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .uw-sidebar-col {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Standard Card Panel */
    .uw-card-panel {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 1.6rem 1.8rem;
      backdrop-filter: blur(12px);
    }

    .panel-header-row {
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .panel-title {
      font-size: 1.22rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.3rem 0;
    }

    .panel-sub {
      font-size: 0.84rem;
      color: #94a3b8;
      margin: 0;
    }

    .action-text-link {
      font-size: 0.85rem;
      font-weight: 600;
      color: #10b981;
      text-decoration: none;
      transition: color 0.15s;
    }

    .action-text-link:hover {
      color: #34d399;
      text-decoration: underline;
    }

    /* Filter Tabs */
    .uw-tabs-row {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 0.6rem;
      margin-bottom: 1.25rem;
    }

    .uw-tab-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 0.88rem;
      font-weight: 600;
      padding: 0.4rem 0.9rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .uw-tab-btn:hover {
      color: #f1f5f9;
      background: rgba(255, 255, 255, 0.04);
    }

    .uw-tab-btn.active {
      color: #ffffff;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    /* ══════════════════════════════════════════
       POSTINGS CARDS (Your Postings)
       ══════════════════════════════════════════ */
    .uw-postings-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .uw-posting-card {
      background: rgba(11, 15, 25, 0.55);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 1.35rem 1.5rem;
      transition: all 0.2s ease;
    }

    .uw-posting-card:hover {
      border-color: rgba(16, 185, 129, 0.3);
      background: rgba(15, 23, 42, 0.7);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    }

    .posting-date {
      font-size: 0.74rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
      display: block;
      margin-bottom: 0.3rem;
    }

    .posting-title {
      margin: 0;
      font-size: 1.12rem;
      font-weight: 700;
    }

    .title-link {
      color: #f8fafc;
      text-decoration: none;
      transition: color 0.15s;
    }

    .title-link:hover {
      color: #34d399;
    }

    .status-pill {
      font-size: 0.74rem;
      font-weight: 700;
      padding: 0.28rem 0.7rem;
      border-radius: 100px;
      background: rgba(100, 116, 139, 0.2);
      color: #94a3b8;
    }

    .status-pill.open {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
    }

    .posting-desc-snippet {
      font-size: 0.88rem;
      color: #cbd5e1;
      line-height: 1.5;
      margin: 0.75rem 0;
    }

    .posting-chips-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .posting-chip {
      font-size: 0.76rem;
      font-weight: 600;
      padding: 0.25rem 0.65rem;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
    }

    .budget-chip {
      color: #38bdf8;
      border-color: rgba(56, 189, 248, 0.25);
    }

    .gear-chip {
      color: #c084fc;
      border-color: rgba(192, 132, 252, 0.25);
    }

    .posting-metrics-bar {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 0.9rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .metrics-counters {
      display: flex;
      align-items: center;
      gap: 0.9rem;
    }

    .count-item {
      display: flex;
      align-items: baseline;
      gap: 0.35rem;
      font-size: 0.82rem;
      color: #94a3b8;
    }

    .count-item strong {
      font-size: 1.05rem;
      font-weight: 700;
      color: #e2e8f0;
    }

    .count-item.highlight strong {
      color: #f43f5e;
    }

    .count-sep {
      color: #475569;
    }

    .uw-btn-proposals {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34d399;
      font-size: 0.84rem;
      font-weight: 700;
      padding: 0.5rem 1rem;
      border-radius: 10px;
      text-decoration: none;
      transition: all 0.2s;
    }

    .uw-btn-proposals:hover {
      background: #10b981;
      color: #ffffff;
      transform: translateX(2px);
    }

    /* Empty States */
    .uw-empty-state {
      padding: 3rem 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .empty-icon-circle {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      margin-bottom: 0.5rem;
    }

    .uw-empty-state h4 {
      font-size: 1.1rem;
      color: #f1f5f9;
      margin: 0;
    }

    .uw-empty-state p {
      font-size: 0.88rem;
      color: #94a3b8;
      max-width: 440px;
      margin: 0 0 0.5rem 0;
    }

    .empty-actions-row {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    /* ══════════════════════════════════════════
       CONTRACTS CARDS (Active Contracts)
       ══════════════════════════════════════════ */
    .uw-contracts-list {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .uw-contract-card {
      background: rgba(11, 15, 25, 0.55);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 1.4rem 1.6rem;
      transition: all 0.2s;
    }

    .uw-contract-card:hover {
      border-color: rgba(59, 130, 246, 0.3);
      background: rgba(15, 23, 42, 0.7);
    }

    .contract-type-pill {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #a78bfa;
      background: rgba(139, 92, 246, 0.12);
      border: 1px solid rgba(139, 92, 246, 0.25);
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 0.35rem;
    }

    .contract-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
    }

    .contract-status-badge {
      font-size: 0.76rem;
      font-weight: 700;
      padding: 0.3rem 0.75rem;
      border-radius: 100px;
    }

    .contract-status-badge.badge-primary {
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #60a5fa;
    }

    .contract-status-badge.badge-accent {
      background: rgba(236, 72, 153, 0.15);
      border: 1px solid rgba(236, 72, 153, 0.35);
      color: #f472b6;
    }

    .contract-status-badge.badge-success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
    }

    .contract-status-badge.badge-warning {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24;
    }

    .contract-creator-strip {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 1rem 0;
    }

    .creator-avatar-wrap {
      position: relative;
      width: 38px;
      height: 38px;
    }

    .creator-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255, 255, 255, 0.1);
    }

    .creator-avatar-placeholder {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.15));
      border: 1px solid rgba(139, 92, 246, 0.35);
      color: #c4b5fd;
    }

    .creator-online-pip {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 10px;
      height: 10px;
      background: #10b981;
      border: 2px solid #0b0f19;
      border-radius: 50%;
    }

    .creator-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .creator-label {
      font-size: 0.72rem;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
    }

    .creator-link {
      color: #f1f5f9;
      font-size: 0.92rem;
      font-weight: 700;
      text-decoration: none;
      transition: color 0.15s;
    }

    .creator-link:hover {
      color: #34d399;
      text-decoration: underline;
    }

    .escrow-guarantee-box {
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 12px;
      padding: 0.9rem 1.2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .escrow-text-side {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .escrow-amount-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      color: #34d399;
      font-size: 0.88rem;
    }

    .escrow-note {
      display: block;
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 3px;
    }

    .uw-btn-validate-escrow {
      display: inline-flex;
      align-items: center;
      background: #10b981;
      color: #ffffff;
      font-size: 0.84rem;
      font-weight: 700;
      padding: 0.55rem 1.1rem;
      border-radius: 10px;
      text-decoration: none;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
    }

    .uw-btn-validate-escrow:hover {
      background: #059669;
      transform: translateY(-2px);
    }

    .uw-btn-contract-details {
      display: inline-flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #f1f5f9;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 0.55rem 1rem;
      border-radius: 10px;
      text-decoration: none;
      transition: all 0.2s;
    }

    .uw-btn-contract-details:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
    }

    /* ══════════════════════════════════════════
       TALENT YOU MAY LIKE (Recommandations IA)
       ══════════════════════════════════════════ */
    .ia-engine-badge {
      font-size: 0.72rem;
      font-weight: 700;
      color: #f43f5e;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: block;
      margin-bottom: 0.25rem;
    }

    .uw-rec-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
      margin-top: 1rem;
    }

    .uw-rec-card {
      background: rgba(11, 15, 25, 0.55);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      transition: all 0.2s;
    }

    .uw-rec-card:hover {
      border-color: rgba(139, 92, 246, 0.35);
      transform: translateY(-2px);
    }

    .rec-card-top {
      align-items: center;
    }

    .rec-creator-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .rec-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(139, 92, 246, 0.3);
    }

    .rec-creator-name {
      display: block;
      font-size: 0.92rem;
      font-weight: 700;
      color: #f8fafc;
      text-decoration: none;
    }

    .rec-creator-name:hover {
      color: #34d399;
      text-decoration: underline;
    }

    .rec-creator-title {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .rec-price-badge {
      font-size: 0.88rem;
      font-weight: 800;
      color: #10b981;
    }

    .rec-card-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 0.75rem;
      align-items: center;
    }

    .rec-gear-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.72rem;
      color: #c084fc;
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.2);
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
    }

    .rec-btn-group {
      display: flex;
      gap: 0.45rem;
    }

    .uw-btn-invite {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      font-size: 0.76rem;
      font-weight: 700;
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .uw-btn-invite:hover {
      background: #10b981;
      color: #ffffff;
    }

    .uw-btn-view-profile {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
      font-size: 0.76rem;
      font-weight: 600;
      padding: 0.35rem 0.65rem;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.15s;
    }

    .uw-btn-view-profile:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    /* ══════════════════════════════════════════
       RIGHT SIDEBAR (Upwork Client Hub)
       ══════════════════════════════════════════ */
    .uw-side-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 1.4rem;
      backdrop-filter: blur(12px);
    }

    .side-card-title {
      font-size: 0.98rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 1rem 0;
    }

    .side-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.06);
      margin: 1rem 0;
    }

    /* Company Card */
    .company-identity {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .company-logo-circle {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.1rem;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
    }

    .company-logo-img {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      object-fit: cover;
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
    }

    .company-name {
      font-size: 1rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
    }

    .company-tag {
      font-size: 0.74rem;
      color: #94a3b8;
    }

    .edit-icon-btn {
      color: #94a3b8;
      text-decoration: none;
      font-size: 1rem;
      padding: 4px 8px;
      border-radius: 6px;
      transition: all 0.15s;
    }

    .edit-icon-btn:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.08);
    }

    .verification-badge-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 10px;
      padding: 0.75rem 0.9rem;
      margin-bottom: 1rem;
    }

    .verified-icon-check {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #10b981;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 800;
      flex-shrink: 0;
    }

    .verified-info strong {
      display: block;
      font-size: 0.8rem;
      color: #f1f5f9;
    }

    .verified-info span {
      font-size: 0.72rem;
      color: #6ee7b7;
    }

    .side-progress-block {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .prog-title {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .prog-val {
      font-size: 0.78rem;
      font-weight: 700;
      color: #10b981;
    }

    .prog-track {
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      overflow: hidden;
    }

    .prog-fill {
      height: 100%;
      background: #10b981;
      border-radius: 10px;
    }

    /* Financial Card */
    .finance-stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.35rem;
    }

    .fin-label {
      font-size: 0.82rem;
      color: #94a3b8;
    }

    .fin-value {
      font-size: 1.15rem;
      font-weight: 800;
      color: #ffffff;
    }

    .fin-value.green {
      color: #34d399;
    }

    .fin-help-text {
      font-size: 0.72rem;
      color: #64748b;
      margin: 0;
    }

    .side-action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 0.65rem;
      border-radius: 10px;
      text-decoration: none;
      transition: all 0.2s;
      margin-top: 1rem;
    }

    .side-action-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }

    /* Alerts Card */
    .alerts-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .alert-item {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      font-size: 0.8rem;
    }

    .alert-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 6px;
      flex-shrink: 0;
    }

    .alert-dot.red {
      background: #f43f5e;
      box-shadow: 0 0 8px rgba(244, 63, 94, 0.6);
    }

    .alert-dot.violet {
      background: #a855f7;
      box-shadow: 0 0 8px rgba(168, 85, 247, 0.6);
    }

    .alert-dot.green {
      background: #10b981;
    }

    .alert-item strong {
      display: block;
      color: #f1f5f9;
      font-size: 0.82rem;
    }

    .alert-item p {
      font-size: 0.75rem;
      color: #94a3b8;
      margin: 2px 0 4px 0;
      line-height: 1.4;
    }

    .alert-link {
      font-size: 0.75rem;
      font-weight: 700;
      color: #38bdf8;
      text-decoration: none;
    }

    .alert-link:hover {
      text-decoration: underline;
    }

    /* Shortcuts Nav */
    .shortcuts-nav {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .shortcut-link {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.65rem 0.85rem;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 600;
      transition: all 0.15s ease;
    }

    .shortcut-link:hover {
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.3);
      color: #ffffff;
      transform: translateX(3px);
    }

    .shortcut-link .arrow {
      color: #64748b;
      transition: color 0.15s;
    }

    .shortcut-link:hover .arrow {
      color: #34d399;
    }

    /* Toast */
    .uw-floating-toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #10b981;
      color: #ffffff;
      font-size: 0.9rem;
      font-weight: 700;
      padding: 0.85rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      z-index: 1000;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .uw-workspace-grid {
        grid-template-columns: 1fr;
      }
      .uw-metrics-strip {
        grid-template-columns: repeat(2, 1fr);
      }
      .uw-client-hero {
        flex-direction: column;
        align-items: flex-start;
      }
      .hero-actions-block {
        width: 100%;
        flex-direction: row;
      }
    }

    @media (max-width: 640px) {
      .uw-metrics-strip {
        grid-template-columns: 1fr;
      }
      .hero-actions-block {
        flex-direction: column;
      }
    }
  `]
})
export class ClientDashboardComponent implements OnInit {
  auth = inject(AuthService);
  recommendationService = inject(RecommendationService);
  private jobService = inject(JobService);
  private proposalService = inject(ProposalService);
  private contractService = inject(ContractService);

  jobTab = signal<'ACTIVE' | 'ALL' | 'DRAFTS'>('ACTIVE');
  toastMessage = signal<string | null>(null);

  private _searchQuery = signal<string>('');
  get searchQuery(): string {
    return this._searchQuery();
  }
  set searchQuery(value: string) {
    this._searchQuery.set(value);
  }

  ngOnInit(): void {
    this.jobService.refresh();
    this.proposalService.refresh();
    this.contractService.refresh();
  }

  clientDisplayName = computed(() => {
    const user = this.auth.currentUser();
    return user?.fullName || 'Client SnapConnect';
  });

  clientAvatar = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return '';
    const dedicated = this.auth.getDedicatedAvatar(user.id, user.email);
    if (dedicated) return dedicated;
    return this.auth.cleanAvatar(user.avatarUrl) || '';
  });

  clientInitials = computed(() => {
    const name = this.clientDisplayName().trim();
    if (!name) return 'C';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  });

  // Jobs belonging to current client
  myJobs = computed(() => {
    const user = this.auth.currentUser();
    const all = this.jobService.jobs();
    if (!user) return all;
    const isDemoClient = String(user.id) === '1' || user.id === 'cl-1' || user.email?.toLowerCase().includes('client');
    return all.filter(j =>
      j.clientId === user.id ||
      j.clientName === user.fullName ||
      (isDemoClient && (j.clientId === 'cl-1' || !j.clientId || j.clientName?.includes('Maison Alyssa') || j.clientId === '1')) ||
      !j.clientId
    );
  });

  filteredJobs = computed(() => {
    const tab = this.jobTab();
    let jobs = this.myJobs();
    if (tab === 'ACTIVE') {
      jobs = jobs.filter(j => j.status === 'OPEN' || j.status === 'IN_PROGRESS');
    } else if (tab === 'DRAFTS') {
      jobs = jobs.filter(j => j.status === 'DRAFT');
    }

    const q = this.searchQuery?.trim().toLowerCase();
    if (q) {
      jobs = jobs.filter(j =>
        (j.title && j.title.toLowerCase().includes(q)) ||
        (j.description && j.description.toLowerCase().includes(q)) ||
        (j.category && j.category.toLowerCase().includes(q)) ||
        (j.requiredGear && j.requiredGear.toLowerCase().includes(q)) ||
        (j.location && j.location.toLowerCase().includes(q))
      );
    }
    return jobs;
  });

  activeJobsCount = computed(() => this.myJobs().filter(j => j.status === 'OPEN' || j.status === 'IN_PROGRESS').length);

  totalProposalsCount = computed(() => {
    const jobIds = new Set(this.myJobs().map(j => j.id));
    const allProps = this.proposalService.proposals();
    const matchCount = allProps.filter(p => jobIds.has(p.jobId)).length;
    return matchCount > 0 ? matchCount : allProps.length;
  });

  // Contracts belonging to current client
  clientContracts = computed(() => {
    const user = this.auth.currentUser();
    const all = this.contractService.contracts();
    if (!user) return all;
    const isDemoClient = String(user.id) === '1' || user.id === 'cl-1' || user.email?.toLowerCase().includes('client');
    return all.filter(c =>
      c.clientId === user.id ||
      c.clientName === user.fullName ||
      c.clientId === 'cl-current' ||
      (isDemoClient && (c.clientId === 'cl-1' || c.clientName?.includes('Maison Alyssa') || c.clientId === '1')) ||
      !c.clientId
    );
  });

  activeContracts = computed(() =>
    this.clientContracts().filter(c => c.status === 'ACTIVE' || c.status === 'DELIVERY' || c.status === 'REVISION')
  );

  activeContractsCount = computed(() => this.activeContracts().length);

  activeEscrowAmount = computed(() => {
    return this.activeContracts().reduce((sum, c) => sum + (c.amount || 0), 0);
  });

  deliveryPendingCount = computed(() => {
    return this.clientContracts().filter(c => c.status === 'DELIVERY').length;
  });

  totalInvested = computed(() => {
    const contracts = this.clientContracts();
    return contracts.reduce((sum, c) => sum + (c.amount || 0), 0);
  });

  getProposalsForJob(jobId: string) {
    return this.proposalService.proposals().filter(p => p.jobId === jobId);
  }

  getMessagedCountForJob(jobId: string): number {
    return this.proposalService.proposals().filter(p => p.jobId === jobId && (p.status === 'SHORTLISTED' || p.status === 'VIEWED')).length;
  }

  getHiredForJob(jobId: string): number {
    return this.clientContracts().filter(c => c.jobId === jobId).length;
  }

  inviteCreator(creatorName: string): void {
    this.toastMessage.set(`Invitation envoyée avec succès à ${creatorName} !`);
    setTimeout(() => this.toastMessage.set(null), 3200);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'badge-success';
      case 'ACTIVE': return 'badge-primary';
      case 'DELIVERY': return 'badge-accent';
      case 'REVISION': return 'badge-warning';
      case 'DISPUTED': return 'badge-danger';
      default: return 'badge-neutral';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'Terminé';
      case 'ACTIVE': return 'En tournage';
      case 'DELIVERY': return 'Livrables 4K déposés';
      case 'REVISION': return 'En révision';
      case 'DISPUTED': return 'En litige';
      default: return status;
    }
  }

  getCreatorAvatar(creatorId?: string | number | null, fallbackAvatar?: string | null): string {
    if (creatorId) {
      const dedicated = this.auth.getDedicatedAvatar(creatorId);
      if (dedicated) return dedicated;
      try {
        const raw = localStorage.getItem(`snapconnect_creator_profile_${creatorId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          const clean = this.auth.cleanAvatar(parsed?.avatarUrl);
          if (clean) return clean;
        }
      } catch {}
    }
    const clean = this.auth.cleanAvatar(fallbackAvatar);
    if (clean) return clean;
    return '';
  }
}
