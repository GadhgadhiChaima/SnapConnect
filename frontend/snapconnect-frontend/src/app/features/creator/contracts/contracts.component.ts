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
            <span class="badge badge-success">Studio Créateur</span>
            <h1>Mes tournages & Contrats actifs</h1>
            <p>Tournages en cours, revue des livrables et gains libérés.</p>
          </div>
          <a routerLink="/creator/earnings" class="btn btn-outline btn-md">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 6px;">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
            Voir mes revenus & portefeuille
          </a>
        </div>

        <!-- Contracts List -->
        <div class="contracts-list">
          @for (c of contracts(); track c.id) {
            <div class="contract-card card-glass animate-fade-in">
              <div class="card-top flex-between">
                <div class="type-badge-group">
                  <span class="badge badge-primary">{{ c.type === 'JOB' ? 'Brief Sur Mesure' : 'Package Service' }}</span>
                  <span class="badge" [class]="getStatusClass(c.status)">● {{ getStatusLabel(c.status) }}</span>
                </div>
                <div class="payout-badge">
                  <span class="lbl">Paiement net :</span>
                  <strong>{{ c.amount * 0.9 }} DT</strong>
                </div>
              </div>

              <h3 class="contract-title">{{ c.title }}</h3>

              <div class="parties-strip">
                <span>Client : <strong>{{ c.clientName }}</strong></span>
                <span class="dot">•</span>
                <span>Date limite : <strong>{{ c.deadline }}</strong></span>
                <span class="dot">•</span>
                <span>Séquestre : <strong class="text-success">Séquestre Garanti</strong></span>
              </div>

              <div class="card-footer flex-between">
                <span class="contract-id">ID : #{{ c.id }} • Créé le {{ c.createdAt | slice:0:10 }}</span>
                <a [routerLink]="['/creator/contracts', c.id]" class="btn btn-primary btn-sm">
                  Déposer les livrables & Discussion →
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
      clientName: 'Maison Alyssa Cosmétiques Bio',
      creatorId: 'cr-1',
      creatorName: 'Sarah Ben Salem',
      title: '5 Reels Unboxing Esthétiques Soins Bio',
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

  getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'Terminé';
      case 'ACTIVE': return 'En tournage';
      case 'DELIVERY': return 'Livrables déposés';
      case 'REVISION': return 'En révision';
      case 'DISPUTED': return 'En litige';
      default: return status;
    }
  }
}
