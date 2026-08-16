import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-creator-dashboard',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="dashboard-page">
      <div class="container">
        <!-- Top Greeting Bar -->
        <div class="dashboard-header flex-between">
          <div>
            <h1>Creator Studio — {{ auth.currentUser()?.fullName || 'Creator' }} 🎬</h1>
            <p>Track your shoot requests, manage active mobile contracts, and upload client deliverables.</p>
          </div>
          <div class="header-actions">
            <a routerLink="/creator/services/create" class="btn btn-primary btn-md">
              + Add Mobile Service
            </a>
            <a routerLink="/jobs" class="btn btn-outline btn-md">
              Find Client Jobs
            </a>
          </div>
        </div>

        <!-- Metrics Overview Grid -->
        <div class="metrics-grid">
          <div class="metric-card card-glass">
            <div class="metric-icon green">💰</div>
            <div class="metric-info">
              <span class="metric-label">Earnings this Month</span>
              <span class="metric-val">$1,420</span>
            </div>
          </div>

          <div class="metric-card card-glass">
            <div class="metric-icon purple">⚡</div>
            <div class="metric-info">
              <span class="metric-label">Active Orders & Shoots</span>
              <span class="metric-val">3</span>
            </div>
          </div>

          <div class="metric-card card-glass">
            <div class="metric-icon pink">⭐</div>
            <div class="metric-info">
              <span class="metric-label">Creator Rating</span>
              <span class="metric-val">4.95 ★</span>
            </div>
          </div>

          <div class="metric-card card-glass">
            <div class="metric-icon gold">📱</div>
            <div class="metric-info">
              <span class="metric-label">Verified Setup</span>
              <span class="metric-val">iPhone 16 Pro</span>
            </div>
          </div>
        </div>

        <!-- Two Columns -->
        <div class="dashboard-columns">
          <!-- Left: Active Shoots to Deliver -->
          <div class="col-main">
            <div class="section-card card-glass">
              <div class="section-top flex-between">
                <h3>Current Mobile Orders to Shoot & Deliver</h3>
                <a routerLink="/creator/contracts" class="view-link">View All Contracts →</a>
              </div>

              <div class="orders-list">
                <!-- Order 1 -->
                <div class="order-item card">
                  <div class="order-header flex-between">
                    <div>
                      <span class="badge badge-accent">⚡ Delivery due in 24h</span>
                      <h4 class="order-title">3 Viral UGC TikToks for Skincare Line</h4>
                    </div>
                    <span class="order-payout">$225 Payout</span>
                  </div>

                  <p class="order-client">Client: <strong>Bloom Cosmetics</strong> • Deliver 3x 4K ProRes vertical videos</p>

                  <div class="order-footer flex-between">
                    <span class="gear-rem">📱 Shoot on: <strong>iPhone 16 Pro Max (4K 60fps)</strong></span>
                    <a routerLink="/creator/contracts/ct-1" class="btn btn-primary btn-xs">Upload Deliverables 📤</a>
                  </div>
                </div>

                <!-- Order 2 -->
                <div class="order-item card">
                  <div class="order-header flex-between">
                    <div>
                      <span class="badge badge-primary">Model A Accepted Proposal</span>
                      <h4 class="order-title">Restaurant Friday Dinner Service Shoot</h4>
                    </div>
                    <span class="order-payout">$180 Payout</span>
                  </div>

                  <p class="order-client">Client: <strong>Le Bistro Gourmet</strong> • On-site filming in Paris</p>

                  <div class="order-footer flex-between">
                    <span class="gear-rem">📍 Paris 11e • Date: <strong>Friday 19:00</strong></span>
                    <a routerLink="/creator/contracts/ct-2" class="btn btn-outline btn-xs">View Brief Details</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Creator Quick Controls -->
          <div class="col-sidebar">
            <div class="section-card card-glass">
              <h3>Creator Controls</h3>
              <div class="quick-nav-list">
                <a routerLink="/creator/portfolio" class="quick-nav-item">
                  <span>🖼️ Manage Portfolio Gallery</span>
                  <span class="arrow">→</span>
                </a>
                <a routerLink="/creator/services" class="quick-nav-item">
                  <span>⚡ Manage My Services (2)</span>
                  <span class="arrow">→</span>
                </a>
                <a routerLink="/creator/proposals" class="quick-nav-item">
                  <span>📬 My Submitted Proposals (4)</span>
                  <span class="arrow">→</span>
                </a>
                <a routerLink="/creator/earnings" class="quick-nav-item">
                  <span>💳 Payouts & Earnings</span>
                  <span class="arrow">→</span>
                </a>
                <a routerLink="/creator/profile" class="quick-nav-item">
                  <span>📱 Update Mobile Gear Specs</span>
                  <span class="arrow">→</span>
                </a>
              </div>
            </div>
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

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .order-item {
      padding: var(--space-4);
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .order-title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      margin-top: 4px;
    }

    .order-payout {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-black);
      color: var(--color-success);
    }

    .order-client {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .order-footer {
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border-subtle);
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .gear-rem {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .gear-rem strong {
      color: var(--color-accent-300);
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

    .arrow {
      color: var(--color-text-muted);
    }

    @media (max-width: 900px) {
      .dashboard-columns {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CreatorDashboardComponent {
  auth = inject(AuthService);
}
