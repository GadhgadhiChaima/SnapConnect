import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, NgClass } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AdminService, PlatformStats, RecentActivity } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, NgClass, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="admin-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header flex-between">
          <div>
            <div class="badge-row">
              <span class="badge badge-warning">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px;">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Administration SnapConnect
              </span>
              <span class="live-pill">
                <span class="pulse-dot"></span>
                Temps Réel
              </span>
            </div>
            <h1>Tableau de Bord Administrateur</h1>
            <p>Vue d'ensemble opérationnelle, métriques de la plateforme et historique des activités récentes.</p>
          </div>
          <div class="header-actions">
            <button (click)="refreshData()" class="btn btn-outline btn-md" [disabled]="loading()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [class.spin]="loading()" style="vertical-align: -2px; margin-right: 6px;">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              Actualiser
            </button>
          </div>
        </div>

        <!-- 4 Cartes Principales (KPI Cards) -->
        <div class="metrics-grid">
          <!-- 1. Utilisateurs -->
          <div class="metric-card card-glass">
            <div class="metric-icon purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="metric-info">
              <span class="metric-label">Utilisateurs</span>
              <span class="metric-val">{{ stats().totalUsers }}</span>
              <span class="sub-hint">
                {{ stats().totalCreators }} créateurs &bull; {{ stats().totalClients }} clients
              </span>
            </div>
          </div>

          <!-- 2. Missions actives -->
          <div class="metric-card card-glass">
            <div class="metric-icon gold">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div class="metric-info">
              <span class="metric-label">Missions Actives</span>
              <span class="metric-val">{{ stats().activeContracts }}</span>
              <span class="sub-hint">
                {{ stats().activeContracts }} contrats en cours &bull; {{ stats().activeJobs }} briefs ouverts
              </span>
            </div>
          </div>

          <!-- 3. Paiements -->
          <div class="metric-card card-glass">
            <div class="metric-icon green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div class="metric-info">
              <span class="metric-label">Paiements / Séquestre</span>
              <span class="metric-val">{{ stats().escrowInTransit | number:'1.0-0' }} <span class="cur">DT</span></span>
              <span class="sub-hint">
                Commissions : {{ stats().platformRevenue | number:'1.0-0' }} DT (10%)
              </span>
            </div>
          </div>

          <!-- 4. Réclamations -->
          <div class="metric-card card-glass">
            <div class="metric-icon red">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
                <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
                <path d="M7 21h10"></path>
                <path d="M12 3v18"></path>
                <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path>
              </svg>
            </div>
            <div class="metric-info">
              <span class="metric-label">Réclamations</span>
              <span class="metric-val" [class.val-alert]="stats().activeDisputes > 0">{{ stats().activeDisputes }}</span>
              <span class="sub-hint">
                @if (stats().activeDisputes > 0) {
                  {{ stats().activeDisputes }} dossier(s) en attente d'arbitrage
                } @else {
                  Aucun litige en attente
                }
              </span>
            </div>
          </div>
        </div>

        <!-- Section Activité Récente -->
        <div class="recent-activity-section card-glass">
          <div class="section-top flex-between">
            <div class="section-title-box">
              <div class="title-with-icon">
                <span class="section-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </span>
                <h2>Activité Récente</h2>
              </div>
              <p class="section-subtitle">Historique des derniers flux et événements majeurs sur la marketplace.</p>
            </div>
            <span class="activity-counter badge badge-neutral">
              {{ recentActivities().length }} événement(s)
            </span>
          </div>

          <!-- Liste des activités -->
          @if (loading()) {
            <div class="loading-state">
              <div class="spinner-small"></div>
              <span>Chargement des activités...</span>
            </div>
          } @else if (recentActivities().length === 0) {
            <div class="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>Aucune activité récente enregistrée pour le moment.</p>
            </div>
          } @else {
            <div class="activities-timeline">
              @for (act of recentActivities(); track act.id) {
                <div class="timeline-item">
                  <div class="timeline-icon" [ngClass]="getActivityIconColor(act.type)">
                    <!-- Icône selon le type -->
                    @switch (act.type) {
                      @case ('USER_REGISTRATION') {
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <line x1="19" y1="8" x2="19" y2="14"></line>
                          <line x1="22" y1="11" x2="16" y2="11"></line>
                        </svg>
                      }
                      @case ('NEW_JOB') {
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                      }
                      @case ('CONTRACT_CREATED') {
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="12" y1="18" x2="12" y2="12"></line>
                          <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                      }
                      @case ('DELIVERED') {
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polygon points="23 7 16 12 23 17 23 7"></polygon>
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                      }
                      @case ('REVISION_REQUESTED') {
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                        </svg>
                      }
                      @case ('CONTRACT_COMPLETED') {
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      }
                      @case ('DISPUTE') {
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
                          <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
                          <path d="M7 21h10"></path>
                          <path d="M12 3v18"></path>
                        </svg>
                      }
                      @default {
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      }
                    }
                  </div>

                  <div class="timeline-content">
                    <div class="timeline-header flex-between">
                      <div class="timeline-meta">
                        <span class="timeline-title">{{ act.title }}</span>
                        <span class="badge {{ act.badgeClass }} badge-sm">{{ getActivityTypeLabel(act.type) }}</span>
                      </div>
                      <span class="timeline-time">{{ formatTime(act.timestamp) }}</span>
                    </div>
                    <p class="timeline-desc">{{ act.description }}</p>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Navigation d'accès rapide (Raccourcis sobres) -->
        <div class="quick-nav-box card-glass">
          <div class="quick-nav-header">
            <h3>Accès Rapide aux Modules</h3>
            <span class="quick-hint">Navigation administrative</span>
          </div>
          <div class="quick-nav-links">
            <a routerLink="/admin/users" class="nav-shortcut">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              <span>Utilisateurs & Badges</span>
            </a>
            <a routerLink="/admin/jobs" class="nav-shortcut">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              <span>Missions & Briefs</span>
            </a>
            <a routerLink="/admin/payments" class="nav-shortcut">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              <span>Séquestre & Finances</span>
            </a>
            <a routerLink="/admin/contracts" class="nav-shortcut">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
                <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
                <path d="M7 21h10"></path>
                <path d="M12 3v18"></path>
              </svg>
              <span>Litiges & Arbitrage</span>
            </a>
          </div>
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .admin-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
      min-height: 80vh;
    }

    .page-header {
      margin-bottom: var(--space-8);
      flex-wrap: wrap;
      gap: var(--space-4);
      align-items: flex-end;
    }

    .badge-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-2);
    }

    .live-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      color: #34d399;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      padding: 2px 8px;
      border-radius: var(--radius-full);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #34d399;
      box-shadow: 0 0 8px #34d399;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.2); }
      100% { opacity: 1; transform: scale(1); }
    }

    .page-header h1 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      margin: var(--space-2) 0 var(--space-1);
      color: var(--color-text-primary);
    }

    .page-header p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
      margin: 0;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    /* 4 Cartes KPI */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-5);
      margin-bottom: var(--space-8);
    }

    @media (max-width: 1024px) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }

    .metric-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
      transition: var(--transition-normal);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .metric-card:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.15);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: var(--transition-normal);
    }

    .metric-icon.purple { background: rgba(139, 92, 246, 0.12); border: 1px solid rgba(139, 92, 246, 0.35); color: #c084fc; }
    .metric-icon.gold   { background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); color: #fbbf24; }
    .metric-icon.green  { background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.35); color: #4ade80; }
    .metric-icon.red    { background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); color: #f87171; }
    .metric-icon.blue   { background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.35); color: #60a5fa; }

    .metric-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
      overflow: hidden;
    }

    .metric-label {
      font-size: 11px;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
      font-weight: 600;
    }

    .metric-val {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      color: var(--color-text-primary);
      line-height: 1.1;
    }

    .metric-val.val-alert {
      color: #f87171;
    }

    .metric-val .cur {
      font-size: var(--font-size-sm);
      font-weight: normal;
      color: var(--color-text-muted);
    }

    .sub-hint {
      font-size: 12px;
      color: var(--color-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Section Activité Récente */
    .recent-activity-section {
      padding: var(--space-6) var(--space-8);
      border-radius: var(--radius-2xl);
      margin-bottom: var(--space-8);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .section-top {
      align-items: center;
      margin-bottom: var(--space-6);
      padding-bottom: var(--space-4);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .title-with-icon {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .section-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      background: rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-primary-400);
    }

    .section-title-box h2 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      margin: 0;
      color: var(--color-text-primary);
    }

    .section-subtitle {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin: 2px 0 0;
    }

    .activity-counter {
      font-size: 12px;
      font-weight: 500;
    }

    .loading-state, .empty-state {
      padding: var(--space-12) 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
    }

    .spinner-small {
      width: 24px;
      height: 24px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-top-color: var(--color-primary-400);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    /* Timeline d'activités */
    .activities-timeline {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .timeline-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
      padding: var(--space-4);
      border-radius: var(--radius-lg);
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      transition: var(--transition-fast);
    }

    .timeline-item:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.09);
    }

    .timeline-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .timeline-icon.icon-purple { background: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.3); }
    .timeline-icon.icon-blue   { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .timeline-icon.icon-green  { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
    .timeline-icon.icon-amber  { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .timeline-icon.icon-red    { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .timeline-icon.icon-gray   { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3); }

    .timeline-content {
      flex: 1;
      min-width: 0;
    }

    .timeline-header {
      margin-bottom: var(--space-1);
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .timeline-meta {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .timeline-title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }

    .badge-sm {
      font-size: 10px;
      padding: 1px 6px;
      border-radius: var(--radius-sm);
    }

    .timeline-time {
      font-size: 11px;
      color: var(--color-text-muted);
      white-space: nowrap;
    }

    .timeline-desc {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.4;
    }

    /* Raccourcis sobres */
    .quick-nav-box {
      padding: var(--space-5) var(--space-8);
      border-radius: var(--radius-xl);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .quick-nav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-4);
    }

    .quick-nav-header h3 {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }

    .quick-hint {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .quick-nav-links {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-4);
    }

    @media (max-width: 768px) {
      .quick-nav-links {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .nav-shortcut {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: var(--color-text-secondary);
      text-decoration: none;
      font-size: var(--font-size-xs);
      font-weight: 500;
      transition: var(--transition-fast);
    }

    .nav-shortcut:hover {
      background: rgba(255, 255, 255, 0.08);
      color: var(--color-text-primary);
      border-color: rgba(255, 255, 255, 0.12);
      transform: translateY(-1px);
    }

    .nav-shortcut svg {
      color: var(--color-primary-400);
      flex-shrink: 0;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  loading = signal<boolean>(false);

  stats = signal<PlatformStats>({
    totalUsers: 0,
    totalCreators: 0,
    totalClients: 0,
    totalJobs: 0,
    totalContracts: 0,
    activeContracts: 0,
    activeJobs: 0,
    verifiedCreators: 0,
    escrowInTransit: 0,
    platformRevenue: 0,
    totalPaymentsVolume: 0,
    activeDisputes: 0
  });

  recentActivities = signal<RecentActivity[]>([]);

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.loading.set(true);

    this.adminService.getStats().subscribe({
      next: (data) => {
        if (data) {
          this.stats.set(data);
        }
      },
      error: (err) => console.warn('Erreur stats admin:', err)
    });

    this.adminService.getRecentActivities().subscribe({
      next: (acts) => {
        if (acts) {
          this.recentActivities.set(acts);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.warn('Erreur recent activities:', err);
        this.loading.set(false);
      }
    });
  }

  getActivityIconColor(type: string): string {
    switch (type) {
      case 'USER_REGISTRATION':
        return 'icon-purple';
      case 'NEW_JOB':
        return 'icon-amber';
      case 'CONTRACT_CREATED':
      case 'DELIVERED':
        return 'icon-blue';
      case 'REVISION_REQUESTED':
        return 'icon-amber';
      case 'CONTRACT_COMPLETED':
        return 'icon-green';
      case 'DISPUTE':
        return 'icon-red';
      default:
        return 'icon-gray';
    }
  }

  getActivityTypeLabel(type: string): string {
    switch (type) {
      case 'USER_REGISTRATION':
        return 'Inscription';
      case 'NEW_JOB':
        return 'Brief';
      case 'CONTRACT_CREATED':
        return 'Contrat';
      case 'DELIVERED':
        return 'Livrable 4K';
      case 'REVISION_REQUESTED':
        return 'Révision';
      case 'CONTRACT_COMPLETED':
        return 'Finalisé';
      case 'DISPUTE':
        return 'Litige';
      case 'DISPUTE_RESOLVED':
        return 'Résolu';
      default:
        return 'Activité';
    }
  }

  formatTime(isoString: string): string {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMin < 1) return "À l'instant";
      if (diffMin < 60) return `Il y a ${diffMin} min`;
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      if (diffDays === 1) return "Hier";
      if (diffDays < 7) return `Il y a ${diffDays} j`;

      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  }
}
