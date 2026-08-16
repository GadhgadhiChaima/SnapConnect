import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { RecommendationMatchComponent } from '../../../shared/components/recommendation-match/recommendation-match.component';
import { AuthService } from '../../../core/services/auth.service';
import { RecommendationService } from '../../../core/services/recommendation.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent, RecommendationMatchComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="dashboard-page">
      <div class="container">
        <!-- Top Greeting Bar -->
        <div class="dashboard-header flex-between">
          <div>
            <h1>Hello, {{ auth.currentUser()?.fullName || 'Client' }} 👋</h1>
            <p>Manage your mobile photo & video briefs, active contracts, and hired creators.</p>
          </div>
          <div class="header-actions">
            <a routerLink="/client/jobs/create" class="btn btn-primary btn-md">
              + Post a Mobile Job
            </a>
            <a routerLink="/services" class="btn btn-outline btn-md">
              Browse Packages
            </a>
          </div>
        </div>

        <!-- Metrics Overview Grid -->
        <div class="metrics-grid">
          <div class="metric-card card-glass">
            <div class="metric-icon purple">💼</div>
            <div class="metric-info">
              <span class="metric-label">Active Briefs</span>
              <span class="metric-val">3</span>
            </div>
          </div>

          <div class="metric-card card-glass">
            <div class="metric-icon pink">📬</div>
            <div class="metric-info">
              <span class="metric-label">New Proposals</span>
              <span class="metric-val">12</span>
            </div>
          </div>

          <div class="metric-card card-glass">
            <div class="metric-icon green">⚡</div>
            <div class="metric-info">
              <span class="metric-label">Active Contracts</span>
              <span class="metric-val">2</span>
            </div>
          </div>

          <div class="metric-card card-glass">
            <div class="metric-icon gold">💰</div>
            <div class="metric-info">
              <span class="metric-label">Total Invested</span>
              <span class="metric-val">$840</span>
            </div>
          </div>
        </div>

        <!-- Dashboard Two Columns -->
        <div class="dashboard-columns">
          <!-- Left: Active Contracts in Progress -->
          <div class="col-main">
            <div class="section-card card-glass">
              <div class="section-top flex-between">
                <h3>Ongoing Mobile Shoots & Contracts</h3>
                <a routerLink="/client/contracts" class="view-link">View All →</a>
              </div>

              <div class="contracts-list">
                <!-- Contract 1 -->
                <div class="contract-item card">
                  <div class="contract-header flex-between">
                    <div>
                      <span class="badge badge-primary">Model A (Job)</span>
                      <h4 class="contract-title">Cosmetics Aesthetic Unboxing Reels</h4>
                    </div>
                    <span class="badge status-active">● In Production</span>
                  </div>

                  <div class="contract-creator">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Sarah" class="avatar avatar-sm avatar-ring" />
                    <span>Creator: <strong>Sarah Jenkins</strong> (iPhone 16 Pro Max)</span>
                  </div>

                  <div class="contract-footer flex-between">
                    <div class="c-info">
                      <span>Delivery Deadline: <strong>In 2 days</strong></span>
                      <span>Amount: <strong>$250 in Escrow</strong></span>
                    </div>
                    <a routerLink="/client/contracts/ct-1" class="btn btn-outline btn-xs">View Contract & Files</a>
                  </div>
                </div>

                <!-- Contract 2 -->
                <div class="contract-item card">
                  <div class="contract-header flex-between">
                    <div>
                      <span class="badge badge-accent">Model B (Package)</span>
                      <h4 class="contract-title">Restaurant 15 Macro Photos + 2 Reels</h4>
                    </div>
                    <span class="badge status-review">● Ready for Review</span>
                  </div>

                  <div class="contract-creator">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" alt="Marc" class="avatar avatar-sm avatar-ring" />
                    <span>Creator: <strong>Marc Dupont</strong> (Galaxy S24 Ultra)</span>
                  </div>

                  <div class="contract-footer flex-between">
                    <div class="c-info">
                      <span>Status: <strong>Files Submitted for Approval</strong></span>
                      <span>Amount: <strong>$180 in Escrow</strong></span>
                    </div>
                    <a routerLink="/client/contracts/ct-2" class="btn btn-primary btn-xs">Review & Approve Files</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Quick Actions & Saved Creators -->
          <div class="col-sidebar">
            <div class="section-card card-glass">
              <h3>Quick Actions</h3>
              <div class="quick-nav-list">
                <a routerLink="/client/jobs/create" class="quick-nav-item">
                  <span>📝 Post a Mobile Brief</span>
                  <span class="arrow">→</span>
                </a>
                <a routerLink="/client/jobs" class="quick-nav-item">
                  <span>💼 Manage My Jobs (3)</span>
                  <span class="arrow">→</span>
                </a>
                <a routerLink="/client/messages" class="quick-nav-item">
                  <span>💬 Direct Messages</span>
                  <span class="arrow">→</span>
                </a>
                <a routerLink="/creators" class="quick-nav-item">
                  <span>🔍 Explore Mobile Creators</span>
                  <span class="arrow">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Recommended Smartphone Creators (AI Matching Engine) -->
        <div class="recommended-section card-glass">
          <div class="section-top flex-between">
            <div>
              <span class="badge badge-accent">✨ Algorithmic Match</span>
              <h3>Recommended Smartphone Creators for Your Active Briefs</h3>
            </div>
            <a routerLink="/creators" class="view-link">Explore All Creators →</a>
          </div>

          <div class="rec-creators-grid">
            @for (rec of recommendationService.recommendedCreatorsForClient(); track rec.creator.id) {
              <div class="rec-card card">
                <div class="rec-top flex-between">
                  <div class="rec-creator-info">
                    <img [src]="rec.creator.avatarUrl" [alt]="rec.creator.fullName" class="avatar avatar-md avatar-ring" />
                    <div>
                      <strong>{{ rec.creator.fullName }}</strong>
                      <span class="rec-title">{{ rec.creator.title }}</span>
                    </div>
                  </div>
                  <span class="rec-rate">\${{ rec.creator.hourlyRate }}/hr</span>
                </div>

                <app-recommendation-match [score]="rec.matchScore" [reasons]="rec.matchReasons"></app-recommendation-match>

                <div class="rec-actions flex-between">
                  <span class="gear-tag">📱 {{ rec.creator.equipment?.smartphoneModel }}</span>
                  <a [routerLink]="['/creators', rec.creator.id]" class="btn btn-primary btn-xs">
                    View Portfolio & Hire →
                  </a>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .dashboard-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }

    .dashboard-header {
      margin-bottom: var(--space-8);
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .dashboard-header h1 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      margin-bottom: var(--space-1);
    }

    .dashboard-header p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    .header-actions {
      display: flex;
      gap: var(--space-3);
    }

    /* Metrics */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-8);
    }

    .metric-card {
      padding: var(--space-5);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
    }

    .metric-icon.purple { background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.3); }
    .metric-icon.pink   { background: rgba(236, 72, 153, 0.15); border: 1px solid rgba(236, 72, 153, 0.3); }
    .metric-icon.green  { background: rgba(34, 197, 94, 0.15);  border: 1px solid rgba(34, 197, 94, 0.3); }
    .metric-icon.gold   { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); }

    .metric-info {
      display: flex;
      flex-direction: column;
    }

    .metric-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .metric-val {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-black);
      color: var(--color-text-primary);
    }

    /* Columns */
    .dashboard-columns {
      display: grid;
      grid-template-columns: 2.2fr 1fr;
      gap: var(--space-8);
      align-items: start;
    }

    .section-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
    }

    .section-top {
      margin-bottom: var(--space-5);
    }

    .section-top h3, .section-card h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      margin: 0;
    }

    .view-link {
      font-size: var(--font-size-xs);
      color: var(--color-primary-400);
      text-decoration: none;
    }

    .contracts-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .contract-item {
      padding: var(--space-4);
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .contract-title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      margin-top: 4px;
    }

    .contract-creator {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .contract-footer {
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border-subtle);
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .c-info {
      display: flex;
      gap: var(--space-4);
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .c-info strong {
      color: var(--color-text-primary);
    }

    /* Quick nav */
    .quick-nav-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-top: var(--space-4);
    }

    .quick-nav-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3) var(--space-4);
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: all var(--transition-fast);
    }

    .quick-nav-item:hover {
      background: var(--color-primary-light);
      border-color: var(--color-primary-500);
      color: var(--color-text-primary);
      transform: translateX(4px);
    }

    .recommended-section {
      margin-top: var(--space-8);
      padding: var(--space-6) var(--space-8);
      border-radius: var(--radius-2xl);
    }

    .rec-creators-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: var(--space-5);
      margin-top: var(--space-4);
    }

    .rec-card {
      padding: var(--space-5);
      border-radius: var(--radius-xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .rec-top {
      align-items: center;
    }

    .rec-creator-info {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .rec-creator-info strong {
      font-size: var(--font-size-sm);
      display: block;
    }

    .rec-title {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .rec-rate {
      font-weight: bold;
      color: var(--color-success);
      font-size: var(--font-size-sm);
    }

    .gear-tag {
      font-size: 11px;
      color: var(--color-primary-300);
    }

    @media (max-width: 900px) {
      .dashboard-columns {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ClientDashboardComponent {
  auth = inject(AuthService);
  recommendationService = inject(RecommendationService);
}
