import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { WalletService } from '../../../core/services/wallet.service';
import { TransactionType } from '../../../core/models/wallet.model';

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [FormsModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="earnings-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-success">Creator Financial Studio</span>
            <h1>My Earnings & Payouts</h1>
            <p>Track released milestone payments, pending escrow balances, and withdraw earnings to your bank account.</p>
          </div>
          <div class="header-actions">
            <button (click)="openWithdrawModal.set(true)" class="btn btn-primary btn-md">
              💳 Request Bank Payout
            </button>
            <a routerLink="/creator/contracts" class="btn btn-outline btn-md">
              Active Shoots & Escrow
            </a>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="metrics-grid">
          <div class="metric-card card-glass">
            <div class="metric-icon green">💰</div>
            <div class="metric-info">
              <span class="metric-label">Available for Payout</span>
              <span class="metric-val">\${{ wallet().availableBalance }} <span class="cur">{{ wallet().currency }}</span></span>
              <span class="sub-hint">Cleared & ready for withdrawal</span>
            </div>
          </div>

          <div class="metric-card card-glass">
            <div class="metric-icon purple">🔒</div>
            <div class="metric-info">
              <span class="metric-label">Pending in Escrow</span>
              <span class="metric-val">\${{ wallet().pendingEscrow }} <span class="cur">{{ wallet().currency }}</span></span>
              <span class="sub-hint">Awaiting client deliverable approval</span>
            </div>
          </div>

          <div class="metric-card card-glass">
            <div class="metric-icon pink">📈</div>
            <div class="metric-info">
              <span class="metric-label">Total Gross Earnings</span>
              <span class="metric-val">\${{ wallet().totalEarnings }} <span class="cur">{{ wallet().currency }}</span></span>
              <span class="sub-hint">Lifetime content revenue</span>
            </div>
          </div>

          <div class="metric-card card-glass">
            <div class="metric-icon gold">🏦</div>
            <div class="metric-info">
              <span class="metric-label">Total Withdrawn</span>
              <span class="metric-val">\${{ wallet().totalWithdrawn }} <span class="cur">{{ wallet().currency }}</span></span>
              <span class="sub-hint">Successfully transferred to bank</span>
            </div>
          </div>
        </div>

        <!-- Payout Ledger Table -->
        <div class="ledger-card card-glass">
          <div class="ledger-header flex-between">
            <div>
              <h3>Earnings & Payout Ledger</h3>
              <p class="ledger-sub">Traceable record of all escrow releases, platform fees, and bank transfers</p>
            </div>

            <!-- Filter -->
            <div class="filter-group">
              <select [(ngModel)]="selectedType" class="form-select select-sm">
                <option value="ALL">All Transactions</option>
                <option value="ESCROW_RELEASE">Released Payouts (💰)</option>
                <option value="ESCROW_HOLD">Incoming Escrow (🔒)</option>
                <option value="WITHDRAWAL">Bank Withdrawals (🏦)</option>
              </select>
            </div>
          </div>

          <div class="table-responsive">
            <table class="ledger-table">
              <thead>
                <tr>
                  <th>Tx ID</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Description / Client</th>
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
                          <span class="counterparty">Client: {{ tx.counterpartyName }}</span>
                        }
                        @if (tx.platformFee) {
                          <span class="fee-note">(SnapConnect fee: -\${{ tx.platformFee }})</span>
                        }
                      </div>
                    </td>
                    <td>
                      <strong class="tx-amount" [class.positive]="tx.type === 'ESCROW_RELEASE'" [class.negative]="tx.type === 'WITHDRAWAL'">
                        {{ tx.type === 'ESCROW_RELEASE' ? '+' : tx.type === 'WITHDRAWAL' ? '-' : '' }}\${{ tx.amount }} {{ tx.currency }}
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
                      No payout records found matching this filter.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Withdrawal Modal -->
    @if (openWithdrawModal()) {
      <div class="modal-backdrop" (click)="openWithdrawModal.set(false)">
        <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="openWithdrawModal.set(false)">✕</button>

          <h2>Request Bank Transfer Payout</h2>
          <p class="modal-sub">Transfer your cleared earnings directly to your bank account or payment provider.</p>

          <form (ngSubmit)="confirmWithdrawal()" class="modal-form">
            <div class="available-box card">
              <span class="lbl">Available to Withdraw:</span>
              <strong class="val">\${{ wallet().availableBalance }} USD</strong>
            </div>

            <div class="form-group">
              <label class="form-label">Withdrawal Amount ($ USD)</label>
              <input
                type="number"
                [(ngModel)]="withdrawAmount"
                name="amount"
                [max]="wallet().availableBalance"
                min="20"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Payout Method / Bank Account</label>
              <select [(ngModel)]="payoutMethod" name="method" class="form-select">
                <option value="BANK_FR">BNP Paribas — IBAN: FR76 **** **** 4891</option>
                <option value="BANK_TN">BIAT Tunisia — IBAN: TN59 **** **** 8920</option>
                <option value="PAYONEER">Payoneer USD Account (sarah.j&#64;example.com)</option>
              </select>
            </div>

            <div class="payout-note">
              <span>⚡ Standard processing time: <strong>1 to 2 business days</strong>. Zero transfer fees.</span>
            </div>

            <div class="modal-actions">
              <button type="button" (click)="openWithdrawModal.set(false)" class="btn btn-outline">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="withdrawAmount <= 0 || withdrawAmount > wallet().availableBalance">
                Confirm Withdrawal of \${{ withdrawAmount }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .earnings-page {
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
      margin-right: var(--space-2);
    }

    .fee-note {
      font-size: 11px;
      color: var(--color-text-muted);
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
    .modal-form { display: flex; flex-direction: column; gap: var(--space-4); }

    .available-box {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(34, 197, 94, 0.08);
      border-color: rgba(34, 197, 94, 0.3);
    }

    .available-box .lbl { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
    .available-box .val { font-size: var(--font-size-lg); color: var(--color-success); }

    .payout-note {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      padding: var(--space-2) 0;
    }

    .payout-note strong {
      color: var(--color-primary-300);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      margin-top: var(--space-4);
    }
  `]
})
export class EarningsComponent {
  walletService = inject(WalletService);

  wallet = this.walletService.creatorWallet;
  selectedType = 'ALL';
  openWithdrawModal = signal(false);
  withdrawAmount = 500;
  payoutMethod = 'BANK_FR';

  filteredTransactions = computed(() => {
    const list = this.wallet().transactions;
    if (this.selectedType === 'ALL') return list;
    return list.filter(t => t.type === this.selectedType);
  });

  getBadgeClass(type: TransactionType): string {
    switch (type) {
      case 'ESCROW_RELEASE': return 'badge-success';
      case 'ESCROW_HOLD': return 'badge-accent';
      case 'WITHDRAWAL': return 'badge-primary';
      default: return 'badge-neutral';
    }
  }

  getBadgeLabel(type: TransactionType): string {
    switch (type) {
      case 'ESCROW_RELEASE': return '💰 Payout Released';
      case 'ESCROW_HOLD': return '🔒 Incoming Escrow';
      case 'WITHDRAWAL': return '🏦 Bank Transfer';
      default: return type;
    }
  }

  confirmWithdrawal(): void {
    const success = this.walletService.requestWithdrawal(this.withdrawAmount);
    if (success) {
      alert(`Withdrawal request of $${this.withdrawAmount} submitted! Funds will arrive in your bank account in 1-2 business days.`);
      this.openWithdrawModal.set(false);
    } else {
      alert('Invalid withdrawal amount.');
    }
  }
}
