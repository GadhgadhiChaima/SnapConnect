import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { Contract } from '../../../core/models/contract.model';

@Component({
  selector: 'app-creator-contracts',
  standalone: true,
  imports: [RouterLink, SlicePipe, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="contracts-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-success">Creator Studio</span>
            <h1>My Active Shoots & Contracts</h1>
            <p>Shoots in progress, pending deliverable reviews, and released earnings.</p>
          </div>
          <a routerLink="/creator/earnings" class="btn btn-outline btn-md">
            💰 View Earnings & Payouts
          </a>
        </div>

        <!-- Contracts List -->
        <div class="contracts-list">
          @for (c of contracts(); track c.id) {
            <div class="contract-card card-glass animate-fade-in">
              <div class="card-top flex-between">
                <div class="type-badge-group">
                  <span class="badge badge-primary">{{ c.type === 'JOB' ? 'Model A (Job Brief)' : 'Model B (Service Package)' }}</span>
                  <span class="badge" [class]="getStatusClass(c.status)">● {{ c.status }}</span>
                </div>
                <div class="payout-badge">
                  <span class="lbl">Net Payout:</span>
                  <strong>\${{ c.amount * 0.9 }} USD</strong>
                </div>
              </div>

              <h3 class="contract-title">{{ c.title }}</h3>

              <div class="parties-strip">
                <span>Client: <strong>{{ c.clientName }}</strong></span>
                <span class="dot">•</span>
                <span>Deadline: <strong>{{ c.deadline }}</strong></span>
                <span class="dot">•</span>
                <span>Escrow State: <strong class="text-success">Funded 🔒</strong></span>
              </div>

              <div class="card-footer flex-between">
                <span class="contract-id">ID: #{{ c.id }} • Created {{ c.createdAt | slice:0:10 }}</span>
                <a [routerLink]="['/creator/contracts', c.id]" class="btn btn-primary btn-sm">
                  Upload Deliverables & Chat 📤 →
                </a>
              </div>
            </div>
          }
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .contracts-page {
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

    .contracts-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .contract-card {
      padding: var(--space-6) var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .type-badge-group {
      display: flex;
      gap: var(--space-2);
    }

    .payout-badge {
      text-align: right;
    }

    .payout-badge .lbl {
      font-size: 10px;
      text-transform: uppercase;
      color: var(--color-text-muted);
      display: block;
    }

    .payout-badge strong {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-black);
      color: var(--color-success);
    }

    .contract-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      margin: 0;
    }

    .parties-strip {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      flex-wrap: wrap;
    }

    .parties-strip strong {
      color: var(--color-text-primary);
    }

    .dot {
      color: var(--color-text-muted);
    }

    .card-footer {
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border-subtle);
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .contract-id {
      font-size: 11px;
      color: var(--color-text-muted);
    }
  `]
})
export class CreatorContractsComponent {
  contracts = signal<Contract[]>([
    {
      id: 'ct-1',
      type: 'JOB',
      clientId: 'cl-1',
      clientName: 'Bloom Cosmetics',
      creatorId: 'cr-1',
      creatorName: 'Sarah Jenkins',
      title: '5 Aesthetic Unboxing Reels for Skincare Brand',
      amount: 250,
      status: 'DELIVERY',
      deadline: '2026-08-16',
      createdAt: '2026-08-12'
    }
  ]);

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'badge-success';
      case 'ACTIVE': return 'badge-primary';
      case 'DELIVERY': return 'badge-accent';
      default: return 'badge-neutral';
    }
  }
}
