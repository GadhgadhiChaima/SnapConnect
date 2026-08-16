import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { DisputeService } from '../../../core/services/dispute.service';
import { WalletService } from '../../../core/services/wallet.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="admin-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-warning">Administrator Control Center</span>
            <h1>SnapConnect Operations & Governance</h1>
            <p>Supervise marketplace escrow transactions, mediate claims, verify mobile creators, and monitor platform health.</p>
          </div>
          <div class="header-actions">
            <a routerLink="/admin/contracts" class="btn btn-warning btn-md">
              ⚖️ Arbitration Console ({{ disputeService.disputes().length }})
            </a>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="metrics-grid">
          <div class="metric-card card-glass">
            <div class="metric-icon purple">🔒</div>
            <div class="metric-info">
              <span class="metric-label">Total Escrow in Transit</span>
              <span class="metric-val">$18,450 <span class="cur">USD</span></span>
              <span class="sub-hint">100% secured in holding</span>
            </div>
          </div>

          <div class="metric-card card-glass">
            <div class="metric-icon green">💰</div>
            <div class="metric-info">
              <span class="metric-label">Platform 10% Revenue</span>
              <span class="metric-val">$3,840 <span class="cur">USD</span></span>
              <span class="sub-hint">Gross fee revenue</span>
            </div>
          </div>

          <div class="metric-card card-glass">
            <div class="metric-icon pink">👥</div>
            <div class="metric-info">
              <span class="metric-label">Verified Mobile Creators</span>
              <span class="metric-val">128</span>
              <span class="sub-hint">Flagship smartphone verified</span>
            </div>
          </div>

          <div class="metric-card card-glass">
            <div class="metric-icon gold">⚖️</div>
            <div class="metric-info">
              <span class="metric-label">Active Disputes</span>
              <span class="metric-val">{{ disputeService.disputes().length }}</span>
              <span class="sub-hint">Requiring admin mediation</span>
            </div>
          </div>
        </div>

        <!-- Admin Control Hub Grid -->
        <div class="admin-modules-grid">
          <!-- 1. Dispute & Arbitration -->
          <div class="module-card card-glass">
            <div class="module-top flex-between">
              <span class="m-icon">⚖️</span>
              <span class="badge badge-warning">{{ disputeService.disputes().length }} Active Case</span>
            </div>
            <h3>Dispute Arbitration Center</h3>
            <p>Review timeline evidence, inspected 4K deliveries, and execute financial resolutions (Refund, Payout, or Partial Split).</p>
            <a routerLink="/admin/contracts" class="btn btn-outline btn-sm btn-block">
              Open Arbitration Console →
            </a>
          </div>

          <!-- 2. Users & Badge Verification -->
          <div class="module-card card-glass">
            <div class="module-top flex-between">
              <span class="m-icon">👥</span>
              <span class="badge badge-primary">128 Creators</span>
            </div>
            <h3>User & Hardware Verification</h3>
            <p>Validate creator smartphone rigs (iPhone 16 Pro, S24 Ultra), assign verified badges, and moderate account standing.</p>
            <a routerLink="/admin/users" class="btn btn-outline btn-sm btn-block">
              Manage Users & Badges →
            </a>
          </div>

          <!-- 3. Job & Service Moderation -->
          <div class="module-card card-glass">
            <div class="module-top flex-between">
              <span class="m-icon">💼</span>
              <span class="badge badge-accent">Marketplace</span>
            </div>
            <h3>Job & Package Moderation</h3>
            <p>Ensure client briefs and creator packages respect community guidelines and mobile-only content standards.</p>
            <div class="mod-links">
              <a routerLink="/admin/jobs" class="mod-link">Manage Briefs →</a>
              <a routerLink="/admin/services" class="mod-link">Manage Packages →</a>
            </div>
          </div>

          <!-- 4. Financial Ledger & Commissions -->
          <div class="module-card card-glass">
            <div class="module-top flex-between">
              <span class="m-icon">💳</span>
              <span class="badge badge-success">Audited</span>
            </div>
            <h3>Financial Ledger & Payouts</h3>
            <p>Inspect double-entry transactions, monitor bank withdrawal queues, and audit platform commission receipts.</p>
            <a routerLink="/admin/payments" class="btn btn-outline btn-sm btn-block">
              View Financial Ledger →
            </a>
          </div>

          <!-- 5. Categories & Niches -->
          <div class="module-card card-glass">
            <div class="module-top flex-between">
              <span class="m-icon">🏷️</span>
              <span class="badge badge-neutral">8 Categories</span>
            </div>
            <h3>Categories & Specializations</h3>
            <p>Configure smartphone content niches (Reels & TikTok, UGC, Product Photography, Real Estate Mobile Tours).</p>
            <a routerLink="/admin/categories" class="btn btn-outline btn-sm btn-block">
              Configure Categories →
            </a>
          </div>

          <!-- 6. Trust, Safety & Reports -->
          <div class="module-card card-glass">
            <div class="module-top flex-between">
              <span class="m-icon">🚩</span>
              <span class="badge badge-neutral">Risk & Safety</span>
            </div>
            <h3>Trust, Safety & Reports</h3>
            <p>Handle user-submitted reports regarding off-platform payment attempts, spam, or copyright violations.</p>
            <a routerLink="/admin/reports" class="btn btn-outline btn-sm btn-block">
              View Flagged Reports →
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
    }

    .page-header {
      margin-bottom: var(--space-8);
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .page-header h1 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      margin: var(--space-2) 0;
    }

    .page-header p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
    }

    /* Metrics */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: var(--space-5);
      margin-bottom: var(--space-10);
    }

    .metric-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
    }

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .metric-icon.green  { background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); }
    .metric-icon.purple { background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.3); }
    .metric-icon.pink   { background: rgba(236, 72, 153, 0.15); border: 1px solid rgba(236, 72, 153, 0.3); }
    .metric-icon.gold   { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); }

    .metric-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .metric-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
    }

    .metric-val {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-black);
      color: var(--color-text-primary);
    }

    .metric-val .cur {
      font-size: var(--font-size-xs);
      font-weight: normal;
      color: var(--color-text-muted);
    }

    .sub-hint {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    /* Modules Grid */
    .admin-modules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-6);
    }

    .module-card {
      padding: var(--space-6);
      border-radius: var(--radius-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .module-top {
      align-items: center;
    }

    .m-icon {
      font-size: 2rem;
    }

    .module-card h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      margin: var(--space-1) 0 0;
    }

    .module-card p {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      line-height: var(--line-height-normal);
      flex-grow: 1;
      margin: 0 0 var(--space-4);
    }

    .mod-links {
      display: flex;
      justify-content: space-between;
      gap: var(--space-2);
    }

    .mod-link {
      font-size: var(--font-size-xs);
      color: var(--color-primary-400);
      text-decoration: none;
      font-weight: bold;
    }
  `]
})
export class AdminDashboardComponent {
  disputeService = inject(DisputeService);
  walletService = inject(WalletService);
}
