import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { WalletService } from '../../../core/services/wallet.service';
import { TransactionType, WalletTransaction } from '../../../core/models/wallet.model';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [FormsModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="wallet-page">
      <div class="container">
        <!-- Page Header -->
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-primary">Espace Financier</span>
            <h1>Portefeuille Client & Registre du Séquestre</h1>
            <p>Gérez votre solde disponible, suivez vos fonds protégés en séquestre et consultez l'historique complet de vos transactions.</p>
          </div>
          <div class="header-actions">
            <button (click)="openDepositModal.set(true)" class="btn btn-primary btn-md">
              + Approvisionner mon compte
            </button>
            <a routerLink="/client/contracts" class="btn btn-outline btn-md">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Voir les contrats sous séquestre
            </a>
          </div>
        </div>

        <!-- Metric Balance Cards Grid -->
        <div class="metrics-grid">
          <div class="metric-card card-glass">
            <div class="metric-icon green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
            </div>
            <div class="metric-info">
              <span class="metric-label">Solde Disponible</span>
              <span class="metric-val">{{ wallet().balance }} <span class="cur">{{ wallet().currency }}</span></span>
              <span class="sub-hint">Prêt pour commandes et briefs</span>
            </div>
          </div>

          <div class="metric-card card-glass">
            <div class="metric-icon purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div class="metric-info">
              <span class="metric-label">Sécurisé en Séquestre</span>
              <span class="metric-val">{{ wallet().fundsInEscrow }} <span class="cur">{{ wallet().currency }}</span></span>
              <span class="sub-hint">Bloqué jusqu'à validation finale</span>
            </div>
          </div>

          <div class="metric-card card-glass">
            <div class="metric-icon pink">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
            <div class="metric-info">
              <span class="metric-label">Total Investi</span>
              <span class="metric-val">{{ wallet().totalSpent }} <span class="cur">{{ wallet().currency }}</span></span>
              <span class="sub-hint">Projets réalisés à ce jour</span>
            </div>
          </div>

          <div class="metric-card card-glass">
            <div class="metric-icon gold">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div class="metric-info">
              <span class="metric-label">Total Remboursé</span>
              <span class="metric-val">{{ wallet().totalRefunded }} <span class="cur">{{ wallet().currency }}</span></span>
              <span class="sub-hint">Garantie 100% remboursement</span>
            </div>
          </div>
        </div>

        <!-- Ledger Table Section -->
        <div class="ledger-card card-glass">
          <div class="ledger-header flex-between">
            <div>
              <h3>Journal auditable des transactions</h3>
              <p class="ledger-sub">Historique certifié des mouvements financiers sous garantie de séquestre SnapConnect</p>
            </div>
            
            <!-- Filters -->
            <div class="filter-group">
              <select [(ngModel)]="selectedType" class="form-select select-sm">
                <option value="ALL">Tous les types de transaction</option>
                <option value="ESCROW_HOLD">Fonds bloqués en séquestre</option>
                <option value="ESCROW_RELEASE">Fonds libérés au créateur</option>
                <option value="DEPOSIT">Dépôts & Recharges</option>
                <option value="REFUND">Remboursements</option>
              </select>
            </div>
          </div>

          <div class="table-responsive">
            <table class="ledger-table">
              <thead>
                <tr>
                  <th>Réf. Transaction</th>
                  <th>Date & Heure</th>
                  <th>Type</th>
                  <th>Description & Contrepartie</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                @for (tx of filteredTransactions(); track tx.id) {
                  <tr>
                    <td>
                      <span class="tx-ref">{{ tx.txRef }}</span>
                    </td>
                    <td class="tx-date">{{ tx.date }}</td>
                    <td>
                      <span class="badge" [class]="getBadgeClass(tx.type)">
                        {{ getBadgeLabel(tx.type) }}
                      </span>
                    </td>
                    <td>
                      <div class="tx-desc">
                        <strong>{{ tx.description }}</strong>
                        @if (tx.counterpartyName) {
                          <span class="counterparty">Créateur : {{ tx.counterpartyName }}</span>
                        }
                      </div>
                    </td>
                    <td>
                      <strong class="tx-amount" [class.positive]="tx.type === 'DEPOSIT' || tx.type === 'REFUND'" [class.negative]="tx.type === 'ESCROW_HOLD'">
                        {{ tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '+' : '-' }}{{ tx.amount }} {{ tx.currency }}
                      </strong>
                    </td>
                    <td>
                      <span class="status-pill" [class]="'st-' + tx.status.toLowerCase()">
                        ● {{ tx.status }}
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="text-center py-6 text-muted">
                      Aucune transaction ne correspond au filtre sélectionné.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Deposit Modal -->
    @if (openDepositModal()) {
      <div class="modal-backdrop" (click)="openDepositModal.set(false)">
        <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="openDepositModal.set(false)">✕</button>

          <h2>Approvisionner mon portefeuille</h2>
          <p class="modal-sub">Les fonds ajoutés à votre portefeuille sont disponibles immédiatement pour réserver des briefs et packages de services.</p>

          <form (ngSubmit)="confirmDeposit()" class="deposit-form">
            <div class="form-group">
              <label class="form-label">Montant du Dépôt (DT)</label>
              <div class="input-with-cur">
                <span class="cur-symbol">DT</span>
                <input type="number" [(ngModel)]="depositAmount" name="amount" min="10" max="5000" class="form-input with-prefix" required />
              </div>
            </div>

            <div class="quick-amounts">
              <button type="button" (click)="depositAmount = 100" class="btn btn-outline btn-xs" [class.active]="depositAmount === 100">100 DT</button>
              <button type="button" (click)="depositAmount = 250" class="btn btn-outline btn-xs" [class.active]="depositAmount === 250">250 DT</button>
              <button type="button" (click)="depositAmount = 500" class="btn btn-outline btn-xs" [class.active]="depositAmount === 500">500 DT</button>
            </div>

            <div class="escrow-badge-note">
              <span class="shield">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-success);">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </span>
              <div>
                <strong>Garantie Séquestre 100% SnapConnect</strong>
                <p>Les fonds déposés restent sous votre contrôle jusqu'à validation des livrables finaux.</p>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" (click)="openDepositModal.set(false)" class="btn btn-outline">Annuler</button>
              <button type="submit" class="btn btn-primary">Confirmer le Dépôt de {{ depositAmount }} DT</button>
            </div>
          </form>
        </div>
      </div>
    }

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .wallet-page {
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

    .header-actions {
      display: flex;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    /* Metrics */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: var(--space-5);
      margin-bottom: var(--space-8);
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

    /* Ledger Card */
    .ledger-card {
      padding: var(--space-6) var(--space-8);
      border-radius: var(--radius-2xl);
    }

    .ledger-header {
      margin-bottom: var(--space-6);
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .ledger-header h3 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      margin: 0 0 var(--space-1);
    }

    .ledger-sub {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin: 0;
    }

    .select-sm {
      padding: var(--space-2) var(--space-4);
      font-size: var(--font-size-xs);
    }

    /* Table */
    .table-responsive {
      overflow-x: auto;
    }

    .ledger-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: var(--font-size-sm);
    }

    .ledger-table th {
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--color-border);
      color: var(--color-text-muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
    }

    .ledger-table td {
      padding: var(--space-4);
      border-bottom: 1px solid var(--color-border-subtle);
      vertical-align: middle;
    }

    .tx-ref {
      font-family: monospace;
      font-weight: bold;
      color: var(--color-primary-300);
      font-size: var(--font-size-xs);
    }

    .tx-date {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      white-space: nowrap;
    }

    .tx-desc strong {
      display: block;
      font-size: var(--font-size-sm);
    }

    .counterparty {
      font-size: 11px;
      color: var(--color-primary-400);
    }

    .tx-amount {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-black);
      white-space: nowrap;
    }

    .tx-amount.positive { color: var(--color-success); }
    .tx-amount.negative { color: var(--color-accent-300); }

    .status-pill {
      font-size: 11px;
      font-weight: bold;
    }

    .st-held { color: #fbbf24; }
    .st-succeeded, .st-released { color: var(--color-success); }
    .st-processing { color: var(--color-primary-400); }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: var(--z-modal);
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
    }

    .modal-card {
      position: relative;
      max-width: 500px;
      width: 100%;
      padding: var(--space-8);
      border-radius: var(--radius-2xl);
    }

    .close-btn {
      position: absolute;
      top: var(--space-4);
      right: var(--space-4);
      background: none;
      border: none;
      color: var(--color-text-muted);
      font-size: 1.2rem;
      cursor: pointer;
    }

    .modal-card h2 { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); margin-bottom: var(--space-1); }
    .modal-sub { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-bottom: var(--space-5); }
    .deposit-form { display: flex; flex-direction: column; gap: var(--space-4); }

    .input-with-cur {
      position: relative;
      display: flex;
      align-items: center;
    }

    .cur-symbol {
      position: absolute;
      left: var(--space-4);
      font-weight: bold;
      color: var(--color-text-muted);
    }

    .with-prefix {
      padding-left: var(--space-8);
      font-size: var(--font-size-lg);
      font-weight: bold;
    }

    .quick-amounts {
      display: flex;
      gap: var(--space-2);
    }

    .quick-amounts button.active {
      background: var(--color-primary-light);
      border-color: var(--color-primary-400);
      color: var(--color-primary-300);
    }

    .escrow-badge-note {
      display: flex;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: rgba(34, 197, 94, 0.08);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: var(--radius-lg);
      font-size: var(--font-size-xs);
    }

    .escrow-badge-note strong {
      color: var(--color-success);
      display: block;
      margin-bottom: 2px;
    }

    .escrow-badge-note p {
      color: var(--color-text-secondary);
      margin: 0;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      margin-top: var(--space-4);
    }
  `]
})
export class PaymentsComponent {
  walletService = inject(WalletService);

  wallet = this.walletService.clientWallet;
  selectedType = 'ALL';
  openDepositModal = signal(false);
  depositAmount = 250;

  filteredTransactions = computed(() => {
    const list = this.wallet().transactions;
    if (this.selectedType === 'ALL') return list;
    return list.filter(t => t.type === this.selectedType);
  });

  getBadgeClass(type: TransactionType): string {
    switch (type) {
      case 'ESCROW_HOLD': return 'badge-accent';
      case 'ESCROW_RELEASE': return 'badge-success';
      case 'DEPOSIT': return 'badge-primary';
      case 'REFUND': return 'badge-warning';
      default: return 'badge-neutral';
    }
  }

  getBadgeLabel(type: TransactionType): string {
    switch (type) {
      case 'ESCROW_HOLD': return 'Séquestre bloqué';
      case 'ESCROW_RELEASE': return 'Séquestre libéré';
      case 'DEPOSIT': return 'Recharge carte';
      case 'REFUND': return 'Remboursement';
      default: return type;
    }
  }

  confirmDeposit(): void {
    if (this.depositAmount < 10) return;

    this.walletService.clientWallet.update(w => ({
      ...w,
      balance: w.balance + this.depositAmount,
      transactions: [
        {
          id: 'tx-' + Date.now(),
          txRef: 'TX-' + Math.floor(1000 + Math.random() * 9000),
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          type: 'DEPOSIT',
          amount: this.depositAmount,
          currency: w.currency,
          status: 'SUCCEEDED',
          description: `Recharge du portefeuille client par carte bancaire`
        },
        ...w.transactions
      ]
    }));

    alert(`Dépôt de ${this.depositAmount} DT effectué avec succès ! Votre solde a été mis à jour.`);
    this.openDepositModal.set(false);
  }
}
