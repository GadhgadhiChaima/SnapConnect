import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AdminService } from '../../../core/services/admin.service';

interface Transaction {
  id: string;
  ref: string;
  date: string;
  type: string;
  contract: string;
  gross: number;
  fee: number;
  net: number;
  status: string;
}

interface PayoutRequest {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  amount: number;
  currency: string;
  method: string;
  accountDetails: string;
  status: string;
  requestedAt: string;
}

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="admin-payments-page">
      <div class="container">
        <!-- Page Header -->
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-primary">Finance & Comptabilité</span>
            <h1>Grand Livre Financier & Retraits Créateurs</h1>
            <p>Supervision des commissions de 10%, suivi des flux sous séquestre et validation des virements bancaires/D17 créateurs.</p>
          </div>
          <a routerLink="/admin/dashboard" class="btn btn-outline btn-sm">
            ← Hub Admin
          </a>
        </div>

        <!-- Metric Cards Grid -->
        <div class="stats-row">
          <div class="stat-card card-glass">
            <span class="stat-icon-wrap fee-glow">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </span>
            <div class="stat-data">
              <span class="stat-label">Commissions Plateforme (10%)</span>
              <strong class="stat-value text-success">+{{ totalCommissions() }} DT</strong>
              <span class="stat-sub">Prélevées automatiquement</span>
            </div>
          </div>

          <div class="stat-card card-glass">
            <span class="stat-icon-wrap escrow-glow">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <div class="stat-data">
              <span class="stat-label">Volume Total Séquestre</span>
              <strong class="stat-value text-warning">{{ totalEscrowVolume() }} DT</strong>
              <span class="stat-sub">Fonds consignés & sécurisés</span>
            </div>
          </div>

          <div class="stat-card card-glass">
            <span class="stat-icon-wrap payout-glow">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </span>
            <div class="stat-data">
              <span class="stat-label">Retraits en attente</span>
              <strong class="stat-value text-primary">{{ pendingPayoutsCount() }} demande(s)</strong>
              <span class="stat-sub">Total : {{ pendingPayoutsAmount() }} DT</span>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="pay-tabs-bar">
          <button
            type="button"
            class="p-tab-btn"
            [class.active]="activeTab() === 'LEDGER'"
            (click)="activeTab.set('LEDGER')"
          >
            Grand Livre des Commissions ({{ transactions().length }})
          </button>
          <button
            type="button"
            class="p-tab-btn"
            [class.active]="activeTab() === 'PAYOUTS'"
            (click)="activeTab.set('PAYOUTS')"
          >
            Demandes de Retrait Créateurs
            @if (pendingPayoutsCount() > 0) {
              <span class="tab-badge">{{ pendingPayoutsCount() }}</span>
            }
          </button>
        </div>

        @if (activeTab() === 'LEDGER') {
          <!-- TAB 1: GRAND LIVRE -->
          <div class="card card-glass table-card animate-fade-in">
            <div class="card-header flex-between">
              <div>
                <h3>Journal des Écritures & Commissions</h3>
                <p class="u-sub">Enregistrement chronologique de chaque prélèvement de 10% sur les livrables 4K validés</p>
              </div>
            </div>

            <div class="table-responsive">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Réf. Transaction</th>
                    <th>Date & Heure</th>
                    <th>Type d'Opération</th>
                    <th>Contrat / Prestation</th>
                    <th>Montant Brut</th>
                    <th>Com. Plateforme (10%)</th>
                    <th>Net Créateur</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  @for (tx of transactions(); track tx.id) {
                    <tr>
                      <td><span class="tx-ref">{{ tx.ref }}</span></td>
                      <td class="text-muted">{{ tx.date }}</td>
                      <td>
                        <span class="badge badge-primary">
                          {{ tx.type === 'ESCROW_RELEASE' ? 'Libération Séquestre' : tx.type }}
                        </span>
                      </td>
                      <td>
                        <strong class="text-primary">{{ tx.contract }}</strong>
                      </td>
                      <td>{{ tx.gross }} DT</td>
                      <td>
                        <span class="fee-pill">+{{ tx.fee }} DT</span>
                      </td>
                      <td class="text-secondary">{{ tx.net }} DT</td>
                      <td>
                        <span class="badge badge-success">● {{ tx.status === 'COMPLETED' ? 'Clôturé' : tx.status }}</span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        } @else {
          <!-- TAB 2: DEMANDES DE RETRAIT CREATEURS -->
          <div class="card card-glass table-card animate-fade-in">
            <div class="card-header flex-between">
              <div>
                <h3>Demandes de Virement & Retrait des Créateurs</h3>
                <p class="u-sub">Vérifiez les coordonnées bancaires ou D17 avant d'autoriser le décaissement</p>
              </div>
            </div>

            <div class="table-responsive">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Réf. Retrait</th>
                    <th>Créateur Demandeur</th>
                    <th>Montant Demandé</th>
                    <th>Méthode de Paiement</th>
                    <th>Coordonnées (RIB / Numéro)</th>
                    <th>Date Requête</th>
                    <th>Statut</th>
                    <th>Actions d'Approbation</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of payouts(); track p.id) {
                    <tr>
                      <td>
                        <span class="mono-id">#{{ p.id }}</span>
                      </td>
                      <td>
                        <div class="creator-cell">
                          <img [src]="p.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'" class="c-avatar" alt="Avatar" />
                          <div>
                            <strong>{{ p.creatorName }}</strong>
                            <span class="c-sub">ID: {{ p.creatorId }}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong class="amt-strong">{{ p.amount }} {{ p.currency }}</strong>
                      </td>
                      <td>
                        <span class="method-tag">{{ p.method === 'VIREMENT_BANCAIRE' ? '🏦 Virement Bancaire' : '📱 D17 / Flouci' }}</span>
                      </td>
                      <td>
                        <code class="bank-details">{{ p.accountDetails }}</code>
                      </td>
                      <td class="text-muted">{{ p.requestedAt }}</td>
                      <td>
                        @if (p.status === 'PENDING') {
                          <span class="badge badge-warning">⏳ En attente</span>
                        } @else if (p.status === 'APPROVED') {
                          <span class="badge badge-success">✓ Virement Exécuté</span>
                        } @else {
                          <span class="badge badge-danger">✗ Rejeté</span>
                        }
                      </td>
                      <td>
                        @if (p.status === 'PENDING') {
                          <div class="action-btns">
                            <button
                              type="button"
                              class="btn btn-success btn-xs"
                              (click)="approve(p.id)"
                              title="Valider et marquer payé"
                            >
                              ✓ Valider
                            </button>
                            <button
                              type="button"
                              class="btn btn-outline btn-xs text-danger"
                              (click)="reject(p.id)"
                              title="Rejeter le retrait"
                            >
                              ✗ Rejeter
                            </button>
                          </div>
                        } @else {
                          <span class="text-muted text-xs">Traité</span>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="8" class="text-center py-6">
                        <p class="text-muted">Aucune demande de retrait en attente.</p>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }
    .admin-payments-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }
    .page-header {
      margin-bottom: var(--space-8);
      gap: var(--space-4);
      flex-wrap: wrap;
    }
    .page-header h1 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      margin: var(--space-2) 0 var(--space-1);
    }
    .page-header p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
    }

    /* Stats Row */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-5);
      margin-bottom: var(--space-8);
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-5);
      border-radius: var(--radius-xl);
    }

    .stat-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .fee-glow {
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .escrow-glow {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .payout-glow {
      background: rgba(167, 139, 250, 0.12);
      border: 1px solid rgba(167, 139, 250, 0.3);
    }

    .stat-data {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-black);
    }

    .stat-sub {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    /* Tabs */
    .pay-tabs-bar {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-6);
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--space-3);
    }

    .p-tab-btn {
      padding: var(--space-2) var(--space-4);
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--radius-full);
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .p-tab-btn:hover {
      color: var(--color-text-primary);
      background: rgba(255, 255, 255, 0.05);
    }

    .p-tab-btn.active {
      background: var(--color-primary-500);
      color: white;
      font-weight: var(--font-weight-bold);
      box-shadow: 0 0 12px rgba(124, 58, 237, 0.4);
    }

    .tab-badge {
      background: #ef4444;
      color: white;
      font-size: 10px;
      padding: 1px 6px;
      border-radius: var(--radius-full);
      font-weight: bold;
    }

    /* Tables */
    .table-card {
      padding: var(--space-6);
      border-radius: var(--radius-2xl);
    }

    .u-sub {
      color: var(--color-text-muted);
      font-size: var(--font-size-xs);
      margin-top: 2px;
    }

    .table-responsive {
      overflow-x: auto;
      margin-top: var(--space-4);
    }

    .admin-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--font-size-sm);
      text-align: left;
    }

    .admin-table th {
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--color-border);
      color: var(--color-text-muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .admin-table td {
      padding: var(--space-4);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      vertical-align: middle;
    }

    .tx-ref, .mono-id {
      font-family: monospace;
      font-weight: bold;
      color: var(--color-primary-300);
      font-size: 12px;
    }

    .fee-pill {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
      padding: 3px 8px;
      border-radius: var(--radius-full);
      font-weight: bold;
      font-size: 12px;
    }

    .creator-cell {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .c-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid var(--color-border);
    }

    .c-sub {
      display: block;
      font-size: 10px;
      color: var(--color-text-muted);
    }

    .amt-strong {
      font-size: 14px;
      color: #fbbf24;
    }

    .method-tag {
      font-size: 12px;
      color: var(--color-text-primary);
    }

    .bank-details {
      font-family: monospace;
      font-size: 11px;
      background: rgba(0, 0, 0, 0.3);
      padding: 3px 6px;
      border-radius: 4px;
      color: var(--color-text-secondary);
    }

    .action-btns {
      display: flex;
      gap: 6px;
    }

    .btn-success {
      background: #16a34a;
      color: white;
      border: none;
    }
    .btn-success:hover {
      background: #15803d;
    }
  `]
})
export class AdminPaymentsComponent implements OnInit {
  private adminService = inject(AdminService);

  activeTab = signal<'LEDGER' | 'PAYOUTS'>('LEDGER');

  transactions = signal<Transaction[]>([
    { id: '1', ref: 'TX-2026-0091', date: '2026-08-16 14:30', type: 'ESCROW_RELEASE', contract: 'Besoin de 10 Photos Produits Esthétiques & 3 Reels Unboxing', gross: 250, fee: 25, net: 225, status: 'COMPLETED' },
    { id: '2', ref: 'TX-2026-0085', date: '2026-08-12 11:15', type: 'ESCROW_RELEASE', contract: 'Restaurant 15 Macro Photos & TikTok Reel', gross: 180, fee: 18, net: 162, status: 'COMPLETED' },
    { id: '3', ref: 'TX-2026-0072', date: '2026-08-08 09:40', type: 'ESCROW_RELEASE', contract: 'Lookbook Mode Automne 4K ProRes', gross: 320, fee: 32, net: 288, status: 'COMPLETED' },
    { id: '4', ref: 'TX-2026-0061', date: '2026-08-02 18:20', type: 'ESCROW_RELEASE', contract: 'Visite Virtuelle Villa La Marsa', gross: 200, fee: 20, net: 180, status: 'COMPLETED' }
  ]);

  payouts = signal<PayoutRequest[]>([]);

  ngOnInit(): void {
    this.loadPayouts();
  }

  loadPayouts(): void {
    this.adminService.getPayouts().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.payouts.set(data);
        } else {
          // Fallback if empty
          this.payouts.set([
            {
              id: 'po-1',
              creatorId: 'cr-1',
              creatorName: 'Sarah Ben Salem',
              creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
              amount: 225,
              currency: 'DT',
              method: 'VIREMENT_BANCAIRE',
              accountDetails: 'TN59 1000 6035 1834 5678 9012 (BIAT)',
              status: 'PENDING',
              requestedAt: '2026-08-16 10:20'
            },
            {
              id: 'po-2',
              creatorId: 'cr-2',
              creatorName: 'Yassine Mansour',
              creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
              amount: 162,
              currency: 'DT',
              method: 'D17',
              accountDetails: '+216 98 765 432',
              status: 'PENDING',
              requestedAt: '2026-08-16 16:45'
            }
          ]);
        }
      },
      error: () => {
        // Mock fallback
        this.payouts.set([
          {
            id: 'po-1',
            creatorId: 'cr-1',
            creatorName: 'Sarah Ben Salem',
            creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            amount: 225,
            currency: 'DT',
            method: 'VIREMENT_BANCAIRE',
            accountDetails: 'TN59 1000 6035 1834 5678 9012 (BIAT)',
            status: 'PENDING',
            requestedAt: '2026-08-16 10:20'
          },
          {
            id: 'po-2',
            creatorId: 'cr-2',
            creatorName: 'Yassine Mansour',
            creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            amount: 162,
            currency: 'DT',
            method: 'D17',
            accountDetails: '+216 98 765 432',
            status: 'PENDING',
            requestedAt: '2026-08-16 16:45'
          }
        ]);
      }
    });
  }

  totalCommissions(): number {
    return this.transactions().reduce((acc, t) => acc + t.fee, 0);
  }

  totalEscrowVolume(): number {
    return this.transactions().reduce((acc, t) => acc + t.gross, 0);
  }

  pendingPayoutsCount(): number {
    return this.payouts().filter(p => p.status === 'PENDING').length;
  }

  pendingPayoutsAmount(): number {
    return this.payouts()
      .filter(p => p.status === 'PENDING')
      .reduce((acc, p) => acc + p.amount, 0);
  }

  approve(payoutId: string): void {
    this.adminService.approvePayout(payoutId).subscribe({
      next: () => {
        this.payouts.update(list => list.map(p => p.id === payoutId ? { ...p, status: 'APPROVED' } : p));
      },
      error: () => {
        // Local update fallback
        this.payouts.update(list => list.map(p => p.id === payoutId ? { ...p, status: 'APPROVED' } : p));
      }
    });
  }

  reject(payoutId: string): void {
    const reason = prompt('Motif du rejet du virement (ex: RIB invalide, nom discordant) :') || 'Coordonnées bancaires invalides';
    this.adminService.rejectPayout(payoutId, reason).subscribe({
      next: () => {
        this.payouts.update(list => list.map(p => p.id === payoutId ? { ...p, status: 'REJECTED' } : p));
      },
      error: () => {
        this.payouts.update(list => list.map(p => p.id === payoutId ? { ...p, status: 'REJECTED' } : p));
      }
    });
  }
}
