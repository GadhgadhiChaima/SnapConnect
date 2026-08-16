import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { DisputeService } from '../../../core/services/dispute.service';
import { WalletService } from '../../../core/services/wallet.service';
import { Dispute, DisputeResolution } from '../../../core/models/dispute.model';

@Component({
  selector: 'app-admin-contracts',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="arbitration-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-warning">Mediation & Governance</span>
            <h1>Dispute Arbitration & Contract Console</h1>
            <p>Review contested escrow contracts, inspect evidentiary timelines, and execute binding financial settlements.</p>
          </div>
          <a routerLink="/admin/dashboard" class="btn btn-outline btn-sm">
            ← Back to Admin Hub
          </a>
        </div>

        <!-- Active Disputes List -->
        <div class="disputes-list">
          @for (d of disputes(); track d.id) {
            <div class="dispute-card card-glass animate-fade-in">
              <div class="dispute-top flex-between">
                <div>
                  <span class="badge badge-warning">DISPUTE #{{ d.id }}</span>
                  <span class="badge" [class]="getStatusClass(d.status)">● {{ d.status }}</span>
                  <h3 class="dispute-title">{{ d.contractTitle }}</h3>
                </div>

                <div class="disputed-amount-box">
                  <span class="lbl">Locked in Dispute:</span>
                  <strong class="amt">\${{ d.amountDisputed }} {{ d.currency }}</strong>
                </div>
              </div>

              <!-- Parties Involved -->
              <div class="parties-involved card">
                <div class="p-party">
                  <span class="p-role">Claimant (Opened by)</span>
                  <strong>{{ d.openedByName }} ({{ d.openedByRole }})</strong>
                </div>
                <div class="p-sep">VS</div>
                <div class="p-party">
                  <span class="p-role">Respondent</span>
                  <strong>{{ d.respondentName }}</strong>
                </div>
              </div>

              <!-- Dispute Reason & Claim Description -->
              <div class="claim-details">
                <div class="reason-tag">
                  <span>Grounds for Dispute:</span>
                  <strong>{{ d.reason }}</strong>
                </div>
                <p class="claim-text">"{{ d.description }}"</p>
              </div>

              <!-- Evidence Files -->
              @if (d.evidence.length > 0) {
                <div class="evidence-section">
                  <h4>Submitted Evidence Files ({{ d.evidence.length }}):</h4>
                  <div class="evidence-grid">
                    @for (ev of d.evidence; track ev.id) {
                      <div class="evidence-item card">
                        <span class="ev-icon">📎</span>
                        <div class="ev-meta">
                          <strong>{{ ev.fileName }}</strong>
                          <span>{{ ev.note }} (by {{ ev.uploaderName }})</span>
                        </div>
                        <button (click)="inspectEvidence(ev.fileName)" class="btn btn-outline btn-xs">Inspect</button>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Chronological Timeline -->
              <div class="timeline-section">
                <h4>Audit & Chronological Timeline:</h4>
                <div class="timeline-track">
                  @for (t of d.timeline; track t.id) {
                    <div class="tl-item">
                      <div class="tl-dot"></div>
                      <div class="tl-content">
                        <span class="tl-time">{{ t.timestamp }} • {{ t.actorName }}</span>
                        <strong>{{ t.title }}</strong>
                        <p>{{ t.description }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Arbitration Decision Actions (if not closed) -->
              @if (d.status !== 'CLOSED' && d.status !== 'RESOLVED_CLIENT' && d.status !== 'RESOLVED_CREATOR' && d.status !== 'PARTIAL_RESOLUTION') {
                <div class="arbitration-panel">
                  <div class="arb-text">
                    <strong>Execute Binding Administrator Ruling:</strong>
                    <p>Select the financial settlement. Funds will be transferred immediately and the dispute archived.</p>
                  </div>

                  <div class="arb-actions">
                    <button (click)="openDecisionModal(d, 'FULL_REFUND_CLIENT')" class="btn btn-outline btn-sm text-warning">
                      ↩️ 100% Refund to Client (\${{ d.amountDisputed }})
                    </button>
                    <button (click)="openDecisionModal(d, 'FULL_PAYMENT_CREATOR')" class="btn btn-outline btn-sm text-success">
                      💰 100% Payout to Creator (\${{ d.amountDisputed * 0.9 }})
                    </button>
                    <button (click)="openDecisionModal(d, 'PARTIAL_SPLIT')" class="btn btn-primary btn-sm">
                      ⚖️ Partial Financial Split
                    </button>
                  </div>
                </div>
              } @else {
                <div class="resolution-summary card">
                  <span class="res-icon">✅</span>
                  <div>
                    <strong>Arbitration Closed & Settled: {{ d.resolution?.decision }}</strong>
                    <p>{{ d.resolution?.adminNotes }}</p>
                    <span class="res-date">Settled on {{ d.resolution?.resolvedAt }} by {{ d.resolution?.resolvedBy }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </main>

    <!-- Arbitration Ruling Modal -->
    @if (selectedDispute() && rulingType()) {
      <div class="modal-backdrop" (click)="selectedDispute.set(null)">
        <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="selectedDispute.set(null)">✕</button>

          <h2>Confirm Arbitration Ruling</h2>
          <p class="modal-sub">Dispute #{{ selectedDispute()?.id }} — {{ selectedDispute()?.contractTitle }}</p>

          <form (ngSubmit)="executeRuling()" class="modal-form">
            @if (rulingType() === 'PARTIAL_SPLIT') {
              <div class="split-inputs">
                <div class="form-group">
                  <label class="form-label">Client Refund Amount ($ USD)</label>
                  <input type="number" [(ngModel)]="splitClient" name="clientAmt" class="form-input" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Creator Payout Amount ($ USD)</label>
                  <input type="number" [(ngModel)]="splitCreator" name="creatorAmt" class="form-input" required />
                </div>
              </div>
            }

            <div class="form-group">
              <label class="form-label">Administrator Justification / Ruling Notes</label>
              <textarea
                [(ngModel)]="rulingNotes"
                name="notes"
                rows="4"
                class="form-textarea"
                placeholder="State the findings from chat logs, 4K video inspection, and contractual terms..."
                required
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" (click)="selectedDispute.set(null)" class="btn btn-outline">Cancel</button>
              <button type="submit" class="btn btn-warning">Execute Settlement Ruling ⚖️</button>
            </div>
          </form>
        </div>
      </div>
    }

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .arbitration-page {
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

    .disputes-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
    }

    .dispute-card {
      padding: var(--space-6) var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .dispute-top {
      align-items: flex-start;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .dispute-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      margin: var(--space-2) 0 0;
    }

    .disputed-amount-box {
      text-align: right;
      padding: var(--space-3) var(--space-5);
      background: rgba(15, 23, 42, 0.6);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    }

    .disputed-amount-box .lbl {
      font-size: 10px;
      text-transform: uppercase;
      color: var(--color-text-muted);
      display: block;
    }

    .disputed-amount-box .amt {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-black);
      color: #fbbf24;
    }

    .parties-involved {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: var(--space-4);
      border-radius: var(--radius-lg);
      background: rgba(15, 23, 42, 0.4);
    }

    .p-party {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .p-role {
      font-size: 10px;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }

    .p-sep {
      font-size: 1.2rem;
      font-weight: bold;
      color: var(--color-border);
    }

    .claim-details {
      padding: var(--space-4);
      background: rgba(245, 158, 11, 0.05);
      border-left: 3px solid #fbbf24;
      border-radius: 0 var(--radius-md) var(--radius-md) 0;
    }

    .reason-tag {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-bottom: var(--space-1);
    }

    .reason-tag strong {
      color: #fbbf24;
      margin-left: 4px;
    }

    .claim-text {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      font-style: italic;
      margin: 0;
    }

    .evidence-section h4, .timeline-section h4 {
      font-size: var(--font-size-xs);
      text-transform: uppercase;
      color: var(--color-text-muted);
      margin-bottom: var(--space-3);
    }

    .evidence-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-3);
    }

    .evidence-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      border-radius: var(--radius-md);
    }

    .ev-meta {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ev-meta strong { font-size: var(--font-size-xs); }
    .ev-meta span { font-size: 10px; color: var(--color-text-muted); }

    /* Timeline */
    .timeline-track {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      padding-left: var(--space-4);
      border-left: 2px solid var(--color-border);
    }

    .tl-item {
      position: relative;
    }

    .tl-dot {
      position: absolute;
      left: calc(-1 * var(--space-4) - 5px);
      top: 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-primary-400);
    }

    .tl-time {
      font-size: 10px;
      color: var(--color-text-muted);
      display: block;
    }

    .tl-content strong {
      font-size: var(--font-size-xs);
    }

    .tl-content p {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin: 2px 0 0;
    }

    /* Arbitration Panel */
    .arbitration-panel {
      padding: var(--space-5);
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .arb-text strong { font-size: var(--font-size-sm); color: #fbbf24; display: block; }
    .arb-text p { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin: 0; }

    .arb-actions {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .resolution-summary {
      padding: var(--space-4) var(--space-5);
      background: rgba(34, 197, 94, 0.08);
      border: 1px solid var(--color-success);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .res-icon { font-size: 1.8rem; }
    .resolution-summary strong { color: var(--color-success); font-size: var(--font-size-sm); display: block; }
    .resolution-summary p { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin: 2px 0; }
    .res-date { font-size: 10px; color: var(--color-text-muted); }

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
      max-width: 540px;
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

    .split-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .modal-actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-4); }
  `]
})
export class AdminContractsComponent {
  disputeService = inject(DisputeService);
  walletService = inject(WalletService);

  disputes = this.disputeService.disputes;
  selectedDispute = signal<Dispute | null>(null);
  rulingType = signal<DisputeResolution['decision'] | null>(null);

  rulingNotes = '';
  splitClient = 150;
  splitCreator = 150;

  getStatusClass(status: string): string {
    switch (status) {
      case 'UNDER_REVIEW': return 'badge-warning';
      case 'OPEN': return 'badge-primary';
      case 'RESOLVED_CLIENT': case 'RESOLVED_CREATOR': case 'PARTIAL_RESOLUTION': case 'CLOSED': return 'badge-success';
      default: return 'badge-neutral';
    }
  }

  inspectEvidence(fileName: string): void {
    alert(`Opening evidentiary file viewer for: ${fileName}`);
  }

  openDecisionModal(d: Dispute, decision: DisputeResolution['decision']): void {
    this.selectedDispute.set(d);
    this.rulingType.set(decision);
    this.rulingNotes = `Arbitration finding: Ruling based on review of project brief requirements, verified timestamps, and submitted 4K ProRes deliverables.`;

    if (decision === 'PARTIAL_SPLIT') {
      this.splitClient = Math.round(d.amountDisputed * 0.5);
      this.splitCreator = Math.round(d.amountDisputed * 0.4);
    }
  }

  executeRuling(): void {
    const d = this.selectedDispute();
    const decision = this.rulingType();
    if (!d || !decision) return;

    let clientAmt = 0;
    let creatorAmt = 0;
    let feeAmt = 0;

    if (decision === 'FULL_REFUND_CLIENT') {
      clientAmt = d.amountDisputed;
    } else if (decision === 'FULL_PAYMENT_CREATOR') {
      creatorAmt = d.amountDisputed * 0.9;
      feeAmt = d.amountDisputed * 0.1;
    } else if (decision === 'PARTIAL_SPLIT') {
      clientAmt = this.splitClient;
      creatorAmt = this.splitCreator;
      feeAmt = d.amountDisputed - (clientAmt + creatorAmt);
    }

    const resolution: DisputeResolution = {
      decision,
      clientRefundAmount: clientAmt,
      creatorPayoutAmount: creatorAmt,
      platformFeeAmount: feeAmt,
      adminNotes: this.rulingNotes,
      resolvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      resolvedBy: 'Admin (Mediation Lead)'
    };

    this.disputeService.resolveDispute(d.id, resolution);
    this.selectedDispute.set(null);
    this.rulingType.set(null);

    alert(`Ruling executed! Dispute #${d.id} has been settled. Financial accounts updated in Ledger.`);
  }
}
