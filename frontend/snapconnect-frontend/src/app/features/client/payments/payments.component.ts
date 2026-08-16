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
            <span class="badge badge-primary">Financial Hub</span>
            <h1>Client Wallet & Escrow Ledger</h1>
            <p>Manage your spending balance, review funds held in Escrow, and track all auditable transactions.</p>
          </div>
          <div class="header-actions">
            <button (click)="openDepositModal.set(true)" class="btn btn-primary btn-md">
              + Deposit Funds
            </button>
            <a routerLink="/client/contracts" class="btn btn-outline btn-md">
              🔒 View Active Escrow Contracts
            </a>
          </div>
        </div>

        <!-- Metric Balance Cards Grid -->
        <div class="metrics-grid">
          <div class="metric-card card-glass">
            <div class="metric-icon green">💳</div>
            <div class="metric-info">
              <span class="metric-label">Available Balance</span>
              <span class="metric-val">\${{ wallet().balance }} <span class="cur">{{ wallet().currency }}</span></span>
              <span class="sub-hint">Ready for instant orders & bids</span>
            </div>
          </div>

          <div class="metric-card card-glass">
            <div class="metric-icon purple">🔒</div>
            <div class="metric-info">
              <span class="metric-label">Secured in Escrow</span>
              <span class="metric-val">\${{ wallet().fundsInEscrow }} <span class="cur">{{ wallet().currency }}</span></span>
              <span class="sub-hint">Locked until deliverable approval</span>
            </div>
          </div>

          <div class="metric-card card-glass">
            <div class="metric-icon pink">📈</div>
            <div class="metric-info">
              <span class="metric-label">Total Invested</span>
              <span class="metric-val">\${{ wallet().totalSpent }} <span class="cur">{{ wallet().currency }}</span></span>
              <span class="sub-hint">Lifetime completed content shoots</span>
            </div>
          </div>

          <div class="metric-card card-glass">
            <div class="metric-icon gold">🛡️</div>
            <div class="metric-info">
              <span class="metric-label">Total Refunded</span>
              <span class="metric-val">\${{ wallet().totalRefunded }} <span class="cur">{{ wallet().currency }}</span></span>
              <span class="sub-hint">100% money-back protection</span>
            </div>
          </div>
        </div>

        <!-- Ledger Table Section -->
        <div class="ledger-card card-glass">
          <div class="ledger-header flex-between">
            <div>
              <h3>Auditable Transaction Ledger</h3>
              <p class="ledger-sub">Immutable transaction history powered by SnapConnect Double-Entry Accounting</p>
            </div>
            
            <!-- Filters -->
            <div class="filter-group">
              <select [(ngModel)]="selectedType" class="form-select select-sm">
                <option value="ALL">All Transaction Types</option>
                <option value="ESCROW_HOLD">Escrow Holds (🔒)</option>
                <option value="ESCROW_RELEASE">Escrow Releases (💰)</option>
                <option value="DEPOSIT">Deposits (💳)</option>
                <option value="REFUND">Refunds (↩️)</option>
              </select>
            </div>
          </div>

          <div class="table-responsive">
            <table class="ledger-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Description & Counterparty</th>
                  <th>Amount</th>
                  <th>Status</th>
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
                          <span class="counterparty">Creator: {{ tx.counterpartyName }}</span>
                        }
                      </div>
                    </td>
                    <td>
                      <strong class="tx-amount" [class.positive]="tx.type === 'DEPOSIT' || tx.type === 'REFUND'" [class.negative]="tx.type === 'ESCROW_HOLD'">
                        {{ tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '+' : '-' }}\${{ tx.amount }} {{ tx.currency }}
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
                      No transactions found matching the selected filter.
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

          <h2>Deposit Funds to Wallet</h2>
          <p class="modal-sub">Funds added to your wallet are ready for instant checkout on mobile briefs and gig packages.</p>

          <form (ngSubmit)="confirmDeposit()" class="deposit-form">
            <div class="form-group">
              <label class="form-label">Deposit Amount ($ USD)</label>
              <div class="input-with-cur">
                <span class="cur-symbol">$</span>
                <input type="number" [(ngModel)]="depositAmount" name="amount" min="10" max="5000" class="form-input with-prefix" required />
              </div>
            </div>

            <div class="quick-amounts">
              <button type="button" (click)="depositAmount = 100" class="btn btn-outline btn-xs" [class.active]="depositAmount === 100">$100</button>
              <button type="button" (click)="depositAmount = 250" class="btn btn-outline btn-xs" [class.active]="depositAmount === 250">$250</button>
              <button type="button" (click)="depositAmount = 500" class="btn btn-outline btn-xs" [class.active]="depositAmount === 500">$500</button>
            </div>

            <div class="escrow-badge-note">
              <span class="shield">🛡️</span>
              <div>
                <strong>SnapConnect 100% Escrow Guarantee</strong>
                <p>Deposited funds remain in your control until you hire a creator and approve their final deliverables.</p>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" (click)="openDepositModal.set(false)" class="btn btn-outline">Cancel</button>
              <button type="submit" class="btn btn-primary">Confirm Deposit of \${{ depositAmount }}</button>
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
      case 'ESCROW_HOLD': return '🔒 Escrow Hold';
      case 'ESCROW_RELEASE': return '💰 Escrow Release';
      case 'DEPOSIT': return '💳 Card Deposit';
      case 'REFUND': return '↩️ Refund';
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
          description: `Card deposit to client wallet via mock checkout`
        },
        ...w.transactions
      ]
    }));

    alert(`Deposit of $${this.depositAmount} completed! Your wallet balance has been updated.`);
    this.openDepositModal.set(false);
  }
}
