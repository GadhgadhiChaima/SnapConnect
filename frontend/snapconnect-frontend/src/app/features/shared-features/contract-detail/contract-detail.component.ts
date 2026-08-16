import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { EscrowStepperComponent, EscrowStep } from '../../../shared/components/escrow-stepper/escrow-stepper.component';
import { ReviewModalComponent } from '../../../shared/components/review-modal/review-modal.component';
import { AuthService } from '../../../core/services/auth.service';
import { WalletService } from '../../../core/services/wallet.service';
import { DisputeService } from '../../../core/services/dispute.service';
import { ReputationService } from '../../../core/services/reputation.service';
import { ReviewSubmitRequest } from '../../../core/models/reputation.model';
import { Contract } from '../../../core/models/contract.model';

@Component({
  selector: 'app-contract-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, SlicePipe, NavbarComponent, FooterComponent, EscrowStepperComponent, ReviewModalComponent],
  template: `
    <app-navbar></app-navbar>

    @if (contract(); as c) {
      <main class="contract-page">
        <div class="container">
          <!-- Top Header -->
          <div class="contract-header card-glass">
            <div class="header-left">
              <div class="status-tags">
                <span class="badge badge-primary">{{ c.type === 'JOB' ? 'Model A (Job Brief)' : 'Model B (Service Package)' }}</span>
                <span class="badge" [class]="getStatusBadgeClass(c.status)">● {{ c.status }}</span>
              </div>
              <h1>{{ c.title }}</h1>
              <p class="contract-dates">Contract ID: #{{ c.id }} • Started: {{ c.createdAt | slice:0:10 }} • Deadline: {{ c.deadline || 'In 2 days' }}</p>
            </div>

            <div class="header-right">
              <div class="escrow-box">
                <span class="escrow-lbl">Escrow Locked Amount</span>
                <span class="escrow-val">\${{ c.amount }}</span>
                <span class="escrow-status">🔒 Protected by SnapConnect</span>
              </div>
            </div>
          </div>

          <!-- Escrow Stepper "Where is my money?" -->
          <div class="stepper-wrap">
            <app-escrow-stepper
              [amount]="c.amount"
              [currency]="'USD'"
              [currentStep]="getEscrowStep(c.status)"
            ></app-escrow-stepper>
          </div>

          <!-- Main Workspace Layout -->
          <div class="contract-layout">
            <!-- Left Column: Parties, Deliverables, Actions & Chat -->
            <div class="contract-main">
              <!-- Parties Card -->
              <div class="parties-card card-glass">
                <div class="party-col">
                  <span class="party-role">Client</span>
                  <div class="party-info">
                    <span class="party-avatar">👤</span>
                    <div>
                      <strong>{{ c.clientName || 'Bloom Cosmetics' }}</strong>
                      <span class="sub">Verified Client</span>
                    </div>
                  </div>
                </div>

                <div class="party-sep">⇄</div>

                <div class="party-col">
                  <span class="party-role">Mobile Creator</span>
                  <div class="party-info">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Creator" class="party-img" />
                    <div>
                      <strong>{{ c.creatorName || 'Sarah Jenkins' }}</strong>
                      <span class="sub">iPhone 16 Pro Max (4K ProRes)</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Deliverables & Inspection Section -->
              <div class="deliverables-card card-glass">
                <div class="section-head flex-between">
                  <div>
                    <h3>📦 Submitted 4K Video Deliverables</h3>
                    <p class="section-sub">Inspect full-resolution files before releasing escrow funds.</p>
                  </div>
                  @if (auth.isCreator() && c.status !== 'COMPLETED') {
                    <button (click)="openUploadModal.set(true)" class="btn btn-primary btn-sm">
                      + Submit New 4K Files
                    </button>
                  }
                </div>

                <div class="files-list">
                  <div class="file-item card">
                    <div class="file-icon">🎬</div>
                    <div class="file-meta">
                      <strong>Reel_1_Unboxing_4K_ProRes.mov</strong>
                      <span>9:16 Vertical Video • 4K 60fps • 185 MB • Shot on iPhone 16 Pro Max</span>
                    </div>
                    <div class="file-actions">
                      <button (click)="previewFile('Reel_1_Unboxing_4K_ProRes.mov')" class="btn btn-outline btn-xs">Preview 4K Player</button>
                    </div>
                  </div>

                  <div class="file-item card">
                    <div class="file-icon">🎬</div>
                    <div class="file-meta">
                      <strong>Reel_2_Texture_Application_Macro.mov</strong>
                      <span>9:16 Vertical Video • 4K 60fps • 210 MB • Shot on iPhone 16 Pro Max</span>
                    </div>
                    <div class="file-actions">
                      <button (click)="previewFile('Reel_2_Texture_Application_Macro.mov')" class="btn btn-outline btn-xs">Preview 4K Player</button>
                    </div>
                  </div>
                </div>

                <!-- Client Double Confirmation / Revision / Dispute Panel -->
                @if (auth.isClient() && c.status !== 'COMPLETED') {
                  <div class="client-actions-box">
                    <div class="action-text">
                      <strong>Double-Confirmation Acceptance:</strong>
                      <p>If the 4K videos meet your brief requirements, release the funds. Otherwise, request a revision or open a mediation dispute.</p>
                    </div>
                    <div class="action-buttons">
                      <button (click)="openDisputeModal.set(true)" class="btn btn-ghost btn-sm text-warning">
                        ⚖️ Open Dispute
                      </button>
                      <button (click)="openRevisionModal.set(true)" class="btn btn-outline btn-md">
                        🔄 Request Revision ({{ (c.revisionsAllowed || 2) - (c.revisionsUsed || 0) }} left)
                      </button>
                      <button (click)="openApproveModal.set(true)" class="btn btn-success btn-md">
                        ✅ Approve & Release \${{ c.amount }}
                      </button>
                    </div>
                  </div>
                }

                @if (c.status === 'COMPLETED') {
                  <div class="completed-banner flex-between">
                    <div class="completed-info">
                      <span class="chk">✓</span>
                      <div>
                        <strong>Contract Successfully Completed & Settled!</strong>
                        <p>Escrow payment of \${{ c.amount }} was released to the creator. Both parties can now leave reviews.</p>
                      </div>
                    </div>
                    @if (!hasReviewed()) {
                      <button (click)="openReviewModal.set(true)" class="btn btn-warning btn-sm">
                        ⭐ Leave Verified Review
                      </button>
                    } @else {
                      <span class="badge badge-success">⭐ Review Published</span>
                    }
                  </div>
                }
              </div>

              <!-- Message / Discussion Thread -->
              <div class="chat-card card-glass">
                <div class="chat-head flex-between">
                  <h3>💬 Project Discussion & File Notes</h3>
                  <span class="chat-hint">End-to-End Encrypted</span>
                </div>
                <div class="chat-messages">
                  <div class="chat-msg from-creator">
                    <span class="chat-author">Sarah Jenkins (Creator):</span>
                    <p>Hi! I just uploaded the first 2 reels shot in 4K ProRes with the gimbal speed ramps. Let me know what you think of the color grading!</p>
                    <span class="chat-time">Today 11:20</span>
                  </div>

                  <div class="chat-msg from-client">
                    <span class="chat-author">Bloom Cosmetics (You):</span>
                    <p>The lighting looks gorgeous on the macro shot! Reviewing the second clip now.</p>
                    <span class="chat-time">Today 11:45</span>
                  </div>
                </div>

                <div class="chat-input-row">
                  <input type="text" [(ngModel)]="newMessage" (keyup.enter)="sendMessage()" placeholder="Type a message regarding this shoot..." class="form-input" />
                  <button (click)="sendMessage()" class="btn btn-primary btn-sm">Send</button>
                </div>
              </div>
            </div>

            <!-- Right Sidebar: Scope, Financial Breakdown & Escrow Guarantee -->
            <aside class="contract-sidebar">
              <div class="summary-card card-glass">
                <h4>Financial Summary</h4>
                <div class="summary-list">
                  <div class="s-item">
                    <span>Origin Model:</span>
                    <strong>{{ c.type === 'JOB' ? 'Model A (Job Brief)' : 'Model B (Service)' }}</strong>
                  </div>
                  <div class="s-item">
                    <span>Gross Project Price:</span>
                    <strong>\${{ c.amount }} USD</strong>
                  </div>
                  <div class="s-item">
                    <span>Platform Commission:</span>
                    <span class="text-muted">10% (\${{ c.amount * 0.1 }})</span>
                  </div>
                  <div class="s-item">
                    <span>Net Creator Payout:</span>
                    <strong class="text-success">\${{ c.amount * 0.9 }} USD</strong>
                  </div>
                  <div class="s-item">
                    <span>Revisions:</span>
                    <strong>{{ c.revisionsUsed || 0 }} / {{ c.revisionsAllowed || 2 }} Used</strong>
                  </div>
                  <div class="s-item">
                    <span>Escrow State:</span>
                    <span class="badge" [class]="c.status === 'COMPLETED' ? 'badge-success' : 'badge-accent'">
                      {{ c.status === 'COMPLETED' ? 'Released' : 'Locked & Protected' }}
                    </span>
                  </div>
                </div>

                <div class="support-box">
                  <span class="sup-title">🛡️ SnapConnect Escrow Guarantee</span>
                  <p>Funds remain safe in escrow. If work is not delivered, you are entitled to a 100% refund.</p>
                  <button (click)="openDisputeModal.set(true)" class="support-link-btn">
                    Need Help? Open Mediation Dispute →
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <!-- 1. Double-Confirmation Approval Modal -->
      @if (openApproveModal()) {
        <div class="modal-backdrop" (click)="openApproveModal.set(false)">
          <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
            <button class="close-btn" (click)="openApproveModal.set(false)">✕</button>

            <h2>Confirm Deliverable Approval & Payment Release</h2>
            <p class="modal-sub">Please review the financial release details carefully before confirming.</p>

            <div class="confirm-breakdown card">
              <div class="cb-row">
                <span>Contract:</span>
                <strong>{{ c.title }}</strong>
              </div>
              <div class="cb-row">
                <span>Creator:</span>
                <strong>{{ c.creatorName }}</strong>
              </div>
              <div class="cb-row">
                <span>Escrow Total Released:</span>
                <strong class="text-lg">\${{ c.amount }} USD</strong>
              </div>
              <div class="cb-row">
                <span>Creator Receives:</span>
                <strong class="text-success">\${{ c.amount * 0.9 }} USD (Net)</strong>
              </div>
            </div>

            <div class="warning-box">
              <span>⚠️ <strong>Irreversible Action:</strong> Clicking confirm will immediately release funds from escrow to the creator's wallet.</span>
            </div>

            <div class="modal-actions">
              <button type="button" (click)="openApproveModal.set(false)" class="btn btn-outline">Cancel</button>
              <button type="button" (click)="confirmApproval()" class="btn btn-success">
                ✅ Yes, Release \${{ c.amount }} Now
              </button>
            </div>
          </div>
        </div>
      }

      <!-- 2. Request Revision Modal -->
      @if (openRevisionModal()) {
        <div class="modal-backdrop" (click)="openRevisionModal.set(false)">
          <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
            <button class="close-btn" (click)="openRevisionModal.set(false)">✕</button>

            <h2>Request a Video/Photo Revision</h2>
            <p class="modal-sub">Explain what needs adjusting so the creator can reshoot or modify the edit.</p>

            <form (ngSubmit)="submitRevision()" class="modal-form">
              <div class="form-group">
                <label class="form-label">Revision Category</label>
                <select [(ngModel)]="revisionCategory" name="cat" class="form-select" required>
                  <option value="COLOR">Color Grading / LUT adjustment</option>
                  <option value="AUDIO">Audio levels / Music / Voiceover</option>
                  <option value="PACING">Pacing / Trimming transitions</option>
                  <option value="FRAMING">Framing / Vertical 9:16 crop</option>
                  <option value="OTHER">Other specific adjustment</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Timestamped Instructions & Feedback</label>
                <textarea
                  [(ngModel)]="revisionNote"
                  name="note"
                  rows="4"
                  class="form-textarea"
                  placeholder="e.g. At 0:05, speed up the transition into the product unboxing clip..."
                  required
                ></textarea>
              </div>

              <div class="modal-actions">
                <button type="button" (click)="openRevisionModal.set(false)" class="btn btn-outline">Cancel</button>
                <button type="submit" class="btn btn-primary">Submit Revision Request</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- 3. Open Dispute Modal -->
      @if (openDisputeModal()) {
        <div class="modal-backdrop" (click)="openDisputeModal.set(false)">
          <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
            <button class="close-btn" (click)="openDisputeModal.set(false)">✕</button>

            <h2>Open a Mediation Claim</h2>
            <p class="modal-sub">Funds will remain locked in Escrow while SnapConnect mediation reviews the case.</p>

            <form (ngSubmit)="submitDispute()" class="modal-form">
              <div class="form-group">
                <label class="form-label">Reason for Dispute</label>
                <select [(ngModel)]="disputeReason" name="reason" class="form-select" required>
                  <option value="WORK_DIFFERS_FROM_BRIEF">Work differs from original brief</option>
                  <option value="POOR_QUALITY">Poor video/audio quality</option>
                  <option value="DEADLINE_EXCEEDED">Deadline exceeded / Creator unresponsive</option>
                  <option value="MISSING_FILES">Missing required deliverable files</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Detailed Explanation</label>
                <textarea
                  [(ngModel)]="disputeDescription"
                  name="desc"
                  rows="4"
                  class="form-textarea"
                  placeholder="Provide all facts and context for our mediation team..."
                  required
                ></textarea>
              </div>

              <div class="modal-actions">
                <button type="button" (click)="openDisputeModal.set(false)" class="btn btn-outline">Cancel</button>
                <button type="submit" class="btn btn-warning">Submit Dispute for Review</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- 4. Upload Deliverables Modal -->
      @if (openUploadModal()) {
        <div class="modal-backdrop" (click)="openUploadModal.set(false)">
          <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
            <button class="close-btn" (click)="openUploadModal.set(false)">✕</button>

            <h2>Upload 4K Mobile Deliverables</h2>
            <p class="modal-sub">Submit your 4K ProRes vertical video files or cloud download links.</p>

            <form (ngSubmit)="submitUpload()" class="modal-form">
              <div class="form-group">
                <label class="form-label">Cloud / Drive Link or File URL</label>
                <input type="url" [(ngModel)]="uploadUrl" name="url" class="form-input" placeholder="https://drive.google.com/... or WeTransfer link" required />
              </div>

              <div class="form-group">
                <label class="form-label">Filming & Gear Notes</label>
                <textarea [(ngModel)]="uploadNote" name="note" class="form-textarea" placeholder="Shot on iPhone 16 Pro Max in 4K 60fps ProRes Log. Color graded in Rec.709..." rows="3"></textarea>
              </div>

              <div class="modal-actions">
                <button type="button" (click)="openUploadModal.set(false)" class="btn btn-outline">Cancel</button>
                <button type="submit" class="btn btn-primary">Submit for Client Review</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- 5. Two-Sided Review Modal -->
      @if (openReviewModal()) {
        <app-review-modal
          [contractId]="c.id"
          [reviewerId]="'cl-1'"
          [reviewerName]="c.clientName || 'Bloom Cosmetics'"
          [revieweeId]="c.creatorId"
          [isClientReviewingCreator]="true"
          (close)="openReviewModal.set(false)"
          (reviewSubmitted)="onReviewSubmitted($event)"
        ></app-review-modal>
      }
    }

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .contract-page {
      padding-top: calc(var(--navbar-height) + var(--space-6));
      padding-bottom: var(--space-20);
    }

    .contract-header {
      padding: var(--space-6) var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-6);
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .status-tags {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-2);
    }

    .contract-header h1 {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-black);
      margin: 0 0 var(--space-1);
    }

    .contract-dates {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .escrow-box {
      background: rgba(15, 23, 42, 0.6);
      padding: var(--space-4) var(--space-6);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      text-align: center;
      display: flex;
      flex-direction: column;
    }

    .escrow-lbl {
      font-size: 10px;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }

    .escrow-val {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      color: var(--color-success);
    }

    .escrow-status {
      font-size: 11px;
      color: var(--color-primary-300);
      font-weight: bold;
    }

    .stepper-wrap {
      margin-bottom: var(--space-6);
    }

    .contract-layout {
      display: grid;
      grid-template-columns: 2.2fr 1fr;
      gap: var(--space-8);
      align-items: start;
    }

    .contract-main {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .parties-card {
      padding: var(--space-5) var(--space-6);
      border-radius: var(--radius-xl);
      display: flex;
      justify-content: space-around;
      align-items: center;
    }

    .party-col {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .party-role {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wider);
      color: var(--color-text-muted);
    }

    .party-info {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .party-avatar { font-size: 2rem; }
    .party-img {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--color-primary-500);
    }

    .party-info strong { display: block; font-size: var(--font-size-sm); }
    .party-info .sub { font-size: 11px; color: var(--color-primary-400); }

    .party-sep {
      font-size: 1.5rem;
      color: var(--color-border);
    }

    .deliverables-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
    }

    .deliverables-card h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      margin: 0;
    }

    .section-sub {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-top: 2px;
    }

    .files-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin: var(--space-5) 0;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4);
      border-radius: var(--radius-md);
    }

    .file-icon { font-size: 1.8rem; }
    .file-meta { flex-grow: 1; display: flex; flex-direction: column; gap: 2px; }
    .file-meta strong { font-size: var(--font-size-sm); }
    .file-meta span { font-size: 11px; color: var(--color-text-muted); }

    .client-actions-box {
      margin-top: var(--space-5);
      padding: var(--space-5);
      background: rgba(34, 197, 94, 0.08);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: var(--radius-xl);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .action-text strong { display: block; color: var(--color-success); font-size: var(--font-size-sm); }
    .action-text p { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin: 0; }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .completed-banner {
      margin-top: var(--space-4);
      padding: var(--space-4) var(--space-5);
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid var(--color-success);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .completed-banner .chk {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--color-success);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
    }

    .completed-banner strong { color: var(--color-success); font-size: var(--font-size-sm); display: block; }
    .completed-banner p { color: var(--color-text-secondary); font-size: var(--font-size-xs); margin: 0; }

    /* Chat card */
    .chat-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
    }

    .chat-head {
      margin-bottom: var(--space-4);
    }

    .chat-head h3 {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      margin: 0;
    }

    .chat-hint {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .chat-messages {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      max-height: 220px;
      overflow-y: auto;
      margin-bottom: var(--space-4);
    }

    .chat-msg {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      max-width: 80%;
    }

    .chat-msg.from-creator {
      align-self: flex-start;
      background: rgba(139, 92, 246, 0.12);
      border: 1px solid rgba(139, 92, 246, 0.3);
    }

    .chat-msg.from-client {
      align-self: flex-end;
      background: rgba(236, 72, 153, 0.12);
      border: 1px solid rgba(236, 72, 153, 0.3);
    }

    .chat-author { font-size: 11px; font-weight: bold; display: block; margin-bottom: 2px; }
    .chat-msg p { font-size: var(--font-size-sm); margin: 0 0 4px; }
    .chat-time { font-size: 10px; color: var(--color-text-muted); float: right; }

    .chat-input-row {
      display: flex;
      gap: var(--space-2);
    }

    /* Sidebar */
    .summary-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
      position: sticky;
      top: calc(var(--navbar-height) + var(--space-6));
    }

    .summary-card h4 {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-4);
    }

    .summary-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .s-item {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .support-box {
      margin-top: var(--space-6);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border-subtle);
      font-size: var(--font-size-xs);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sup-title {
      font-weight: bold;
      color: var(--color-primary-300);
    }

    .support-box p {
      color: var(--color-text-muted);
      margin: 0;
      line-height: var(--line-height-normal);
    }

    .support-link-btn {
      background: none;
      border: none;
      padding: 0;
      color: var(--color-accent-300);
      cursor: pointer;
      font-size: var(--font-size-xs);
      text-align: left;
      text-decoration: underline;
    }

    /* Modals */
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

    .confirm-breakdown {
      padding: var(--space-4);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }

    .cb-row {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-sm);
    }

    .warning-box {
      padding: var(--space-3) var(--space-4);
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: var(--radius-md);
      font-size: var(--font-size-xs);
      color: #fbbf24;
      margin-bottom: var(--space-5);
    }

    .modal-actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-4); }

    @media (max-width: 900px) {
      .contract-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class ContractDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);
  walletService = inject(WalletService);
  disputeService = inject(DisputeService);
  reputationService = inject(ReputationService);

  contract = signal<Contract | null>(null);

  openApproveModal = signal(false);
  openRevisionModal = signal(false);
  openDisputeModal = signal(false);
  openUploadModal = signal(false);
  openReviewModal = signal(false);
  hasReviewed = signal(false);

  newMessage = '';
  uploadUrl = '';
  uploadNote = '';

  revisionCategory = 'COLOR';
  revisionNote = '';

  disputeReason = 'WORK_DIFFERS_FROM_BRIEF';
  disputeDescription = '';

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.contract.set({
      id: id || 'ct-1',
      type: 'JOB',
      clientId: 'cl-1',
      clientName: 'Bloom Cosmetics',
      creatorId: 'cr-1',
      creatorName: 'Sarah Jenkins',
      title: '5 Aesthetic Unboxing Reels for Skincare Brand',
      amount: 250,
      status: 'DELIVERY',
      revisionsAllowed: 2,
      revisionsUsed: 0,
      createdAt: '2026-08-12',
      deadline: '2026-08-16'
    });
  }

  getEscrowStep(status: string): EscrowStep {
    switch (status) {
      case 'PENDING': return 'PAYMENT';
      case 'ACTIVE': return 'PRODUCTION';
      case 'DELIVERY': case 'REVISION': return 'REVIEW';
      case 'COMPLETED': return 'RELEASED';
      default: return 'REVIEW';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'badge-success';
      case 'ACTIVE': return 'badge-primary';
      case 'DELIVERY': return 'badge-accent';
      case 'DISPUTED': return 'badge-warning';
      default: return 'badge-neutral';
    }
  }

  previewFile(filename: string): void {
    alert(`Opening 4K ProRes mobile video player for: ${filename}`);
  }

  confirmApproval(): void {
    const c = this.contract();
    if (!c) return;

    // Release Escrow via WalletService
    this.walletService.releaseEscrow(c.id, c.amount);

    this.contract.update(prev => (prev ? { ...prev, status: 'COMPLETED' } : null));
    this.openApproveModal.set(false);
    alert(`Success! $${c.amount} has been released to ${c.creatorName}. The contract is completed.`);
  }

  submitRevision(): void {
    if (!this.revisionNote) return;

    this.contract.update(prev =>
      prev
        ? {
            ...prev,
            status: 'REVISION',
            revisionsUsed: (prev.revisionsUsed || 0) + 1
          }
        : null
    );

    this.openRevisionModal.set(false);
    this.revisionNote = '';
    alert('Revision request sent to the creator with your timestamped feedback.');
  }

  submitDispute(): void {
    if (!this.disputeDescription) return;

    const c = this.contract();
    if (c) {
      this.disputeService.openDispute(
        c.id,
        c.title,
        this.disputeReason,
        this.disputeDescription,
        c.amount
      );

      this.contract.update(prev => (prev ? { ...prev, status: 'DISPUTED' } : null));
    }

    this.openDisputeModal.set(false);
    this.disputeDescription = '';
    alert('Dispute submitted! Funds are frozen in Escrow and a mediation specialist has been assigned.');
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;
    this.newMessage = '';
  }

  submitUpload(): void {
    if (!this.uploadUrl) return;
    this.openUploadModal.set(false);
    this.contract.update(prev => (prev ? { ...prev, status: 'DELIVERY' } : null));
    alert('New 4K deliverables submitted for client approval!');
  }

  onReviewSubmitted(req: ReviewSubmitRequest): void {
    this.reputationService.submitReview(req);
    this.hasReviewed.set(true);
    this.openReviewModal.set(false);
    alert('Thank you! Your verified review has updated the creator reputation metrics and marketplace ranking.');
  }
}
