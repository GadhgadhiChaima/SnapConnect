import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="admin-payments-page">
      <div class="container">
        <div class="page-header flex-between">
          <div>
            <a routerLink="/admin/dashboard" class="back-link">← Back to Admin Hub</a>
            <h1>Platform Financial Ledger & Commission Audit</h1>
            <p>Full audit trail of platform 10% fee receipts, escrow movements, and creator payout withdrawals.</p>
          </div>
        </div>

        <div class="payments-table-card card-glass">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Tx Ref</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Contract / Project</th>
                  <th>Gross Amount</th>
                  <th>Platform Fee (10%)</th>
                  <th>Net Payout</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (tx of transactions(); track tx.id) {
                  <tr>
                    <td><span class="tx-ref">{{ tx.ref }}</span></td>
                    <td class="text-muted">{{ tx.date }}</td>
                    <td><span class="badge badge-primary">{{ tx.type }}</span></td>
                    <td>{{ tx.contract }}</td>
                    <td><strong>\${{ tx.gross }} USD</strong></td>
                    <td class="text-success"><strong>+\${{ tx.fee }} USD</strong></td>
                    <td>\${{ tx.net }} USD</td>
                    <td><span class="badge badge-success">● {{ tx.status }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }
    .admin-payments-page { padding-top: calc(var(--navbar-height) + var(--space-8)); padding-bottom: var(--space-20); }
    .back-link { font-size: var(--font-size-xs); color: var(--color-primary-400); text-decoration: none; margin-bottom: var(--space-2); display: inline-block; }
    .page-header { margin-bottom: var(--space-8); }
    .page-header h1 { font-size: var(--font-size-3xl); font-weight: var(--font-weight-black); margin: 0 0 var(--space-1); }
    .page-header p { color: var(--color-text-secondary); font-size: var(--font-size-base); }
    .payments-table-card { padding: var(--space-6) var(--space-8); border-radius: var(--radius-2xl); }
    .table-responsive { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
    .admin-table th { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); color: var(--color-text-muted); font-size: 11px; text-transform: uppercase; text-align: left; }
    .admin-table td { padding: var(--space-4); border-bottom: 1px solid var(--color-border-subtle); vertical-align: middle; }
    .tx-ref { font-family: monospace; font-weight: bold; color: var(--color-primary-300); }
  `]
})
export class AdminPaymentsComponent {
  transactions = signal([
    { id: '1', ref: 'TX-2026-0091', date: '2026-08-12 14:30', type: 'ESCROW_RELEASE', contract: '5 Aesthetic Unboxing Reels', gross: 250, fee: 25, net: 225, status: 'COMPLETED' },
    { id: '2', ref: 'TX-2026-0085', date: '2026-08-01 11:15', type: 'ESCROW_RELEASE', contract: 'Restaurant 15 Macro Photos', gross: 180, fee: 18, net: 162, status: 'COMPLETED' }
  ]);
}
