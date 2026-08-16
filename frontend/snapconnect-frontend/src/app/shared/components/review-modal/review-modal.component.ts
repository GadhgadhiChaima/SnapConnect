import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReviewSubmitRequest, TwoSidedReview } from '../../../core/models/reputation.model';

@Component({
  selector: 'app-review-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
        <button class="close-btn" (click)="close.emit()">✕</button>

        <div class="modal-header text-center">
          <span class="badge badge-accent">⭐ Two-Sided Review System</span>
          <h2>{{ isClientReviewingCreator ? 'Rate Creator Deliverables' : 'Rate Client Collaboration' }}</h2>
          <p class="modal-sub">
            Your honest rating powers the SnapConnect Reputation Algorithm and helps ensure high mobile standards.
          </p>
        </div>

        <form (ngSubmit)="submitReview()" class="review-form">
          <!-- Overall Star Rating -->
          <div class="rating-box-main text-center card">
            <span class="lbl">Overall Rating</span>
            <div class="stars-picker">
              @for (star of [1, 2, 3, 4, 5]; track star) {
                <button
                  type="button"
                  class="star-btn"
                  [class.active]="overallRating() >= star"
                  (click)="overallRating.set(star)"
                >
                  ★
                </button>
              }
            </div>
            <strong class="rating-desc">{{ getRatingLabel(overallRating()) }}</strong>
          </div>

          <!-- Multi-criteria Breakdown -->
          <div class="criteria-grid">
            @if (isClientReviewingCreator) {
              <!-- Client reviewing Creator -->
              <div class="criterion-item">
                <label class="crit-label">🎥 4K Video/Photo Visual Quality</label>
                <input type="range" min="1" max="5" [(ngModel)]="criterion1" name="c1" class="form-range" />
                <span class="range-val">{{ criterion1 }}/5</span>
              </div>

              <div class="criterion-item">
                <label class="crit-label">⏱️ On-Time Delivery & Deadlines</label>
                <input type="range" min="1" max="5" [(ngModel)]="criterion2" name="c2" class="form-range" />
                <span class="range-val">{{ criterion2 }}/5</span>
              </div>

              <div class="criterion-item">
                <label class="crit-label">💬 Communication & Responsiveness</label>
                <input type="range" min="1" max="5" [(ngModel)]="criterion3" name="c3" class="form-range" />
                <span class="range-val">{{ criterion3 }}/5</span>
              </div>

              <div class="criterion-item">
                <label class="crit-label">📱 Mobile Camera Rig & Sound Mastery</label>
                <input type="range" min="1" max="5" [(ngModel)]="criterion4" name="c4" class="form-range" />
                <span class="range-val">{{ criterion4 }}/5</span>
              </div>
            } @else {
              <!-- Creator reviewing Client -->
              <div class="criterion-item">
                <label class="crit-label">📋 Brief Clarity & Clear Requirements</label>
                <input type="range" min="1" max="5" [(ngModel)]="criterion1" name="c1" class="form-range" />
                <span class="range-val">{{ criterion1 }}/5</span>
              </div>

              <div class="criterion-item">
                <label class="crit-label">⚡ Payment Approval & Escrow Release Speed</label>
                <input type="range" min="1" max="5" [(ngModel)]="criterion2" name="c2" class="form-range" />
                <span class="range-val">{{ criterion2 }}/5</span>
              </div>

              <div class="criterion-item">
                <label class="crit-label">💬 Professionalism & Respect</label>
                <input type="range" min="1" max="5" [(ngModel)]="criterion3" name="c3" class="form-range" />
                <span class="range-val">{{ criterion3 }}/5</span>
              </div>
            }
          </div>

          <!-- Comment -->
          <div class="form-group">
            <label class="form-label">Written Feedback</label>
            <textarea
              [(ngModel)]="comment"
              name="comment"
              rows="3"
              class="form-textarea"
              placeholder="Share specific highlights regarding colors, angles, responsiveness, or project collaboration..."
              required
            ></textarea>
          </div>

          <!-- Recommendation Toggle -->
          <div class="recommend-toggle card flex-between">
            <div>
              <strong>Would you recommend this {{ isClientReviewingCreator ? 'Creator' : 'Client' }}?</strong>
              <p class="rec-sub">Contributes positively to their marketplace trust badge</p>
            </div>
            <label class="switch">
              <input type="checkbox" [(ngModel)]="recommended" name="rec" />
              <span class="slider"></span>
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" (click)="close.emit()" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="!comment.trim()">
              Publish Verified Review ⭐
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

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
      max-width: 580px;
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

    .text-center { text-align: center; }

    .modal-header h2 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-black);
      margin: var(--space-2) 0 var(--space-1);
    }

    .modal-sub {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-5);
    }

    .review-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .rating-box-main {
      padding: var(--space-4);
      background: rgba(139, 92, 246, 0.08);
      border-color: rgba(139, 92, 246, 0.3);
      border-radius: var(--radius-xl);
    }

    .rating-box-main .lbl {
      font-size: 10px;
      text-transform: uppercase;
      color: var(--color-text-muted);
      display: block;
      margin-bottom: var(--space-2);
    }

    .stars-picker {
      display: flex;
      justify-content: center;
      gap: var(--space-2);
      margin-bottom: var(--space-2);
    }

    .star-btn {
      background: none;
      border: none;
      font-size: 2.2rem;
      color: var(--color-border);
      cursor: pointer;
      transition: color 0.15s, transform 0.15s;
      padding: 0;
    }

    .star-btn:hover, .star-btn.active {
      color: #fbbf24;
      transform: scale(1.15);
    }

    .rating-desc {
      font-size: var(--font-size-sm);
      color: var(--color-primary-300);
    }

    /* Criteria */
    .criteria-grid {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .criterion-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--font-size-xs);
    }

    .crit-label {
      flex: 1;
      color: var(--color-text-secondary);
      margin: 0;
    }

    .form-range {
      width: 130px;
      accent-color: var(--color-primary-500);
      cursor: pointer;
    }

    .range-val {
      font-weight: bold;
      color: var(--color-text-primary);
      width: 28px;
      text-align: right;
    }

    /* Recommend */
    .recommend-toggle {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      background: rgba(15, 23, 42, 0.5);
      border-color: var(--color-border);
    }

    .recommend-toggle strong { font-size: var(--font-size-xs); display: block; }
    .rec-sub { font-size: 10px; color: var(--color-text-muted); margin: 0; }

    /* Switch */
    .switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
      flex-shrink: 0;
    }

    .switch input { opacity: 0; width: 0; height: 0; }

    .slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background-color: var(--color-surface-hover);
      border-radius: 24px;
      transition: .3s;
      border: 1px solid var(--color-border);
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      border-radius: 50%;
      transition: .3s;
    }

    input:checked + .slider {
      background-color: var(--color-primary-500);
    }

    input:checked + .slider:before {
      transform: translateX(20px);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      margin-top: var(--space-4);
    }
  `]
})
export class ReviewModalComponent {
  @Input({ required: true }) contractId!: string;
  @Input({ required: true }) reviewerId!: string;
  @Input({ required: true }) reviewerName!: string;
  @Input({ required: true }) revieweeId!: string;
  @Input({ required: true }) isClientReviewingCreator = true;

  @Output() close = new EventEmitter<void>();
  @Output() reviewSubmitted = new EventEmitter<ReviewSubmitRequest>();

  overallRating = signal<number>(5);
  criterion1 = 5;
  criterion2 = 5;
  criterion3 = 5;
  criterion4 = 5;
  comment = '';
  recommended = true;

  getRatingLabel(stars: number): string {
    switch (stars) {
      case 5: return '⭐⭐⭐⭐⭐ Exceptional (5.0)';
      case 4: return '⭐⭐⭐⭐ Very Good (4.0)';
      case 3: return '⭐⭐⭐ Average (3.0)';
      case 2: return '⭐⭐ Below Expectations (2.0)';
      case 1: return '⭐ Poor (1.0)';
      default: return '';
    }
  }

  submitReview(): void {
    const payload: ReviewSubmitRequest = {
      contractId: this.contractId,
      reviewerId: this.reviewerId,
      reviewerName: this.reviewerName,
      reviewerRole: this.isClientReviewingCreator ? 'CLIENT' : 'CREATOR',
      revieweeId: this.revieweeId,
      overallRating: this.overallRating(),
      qualityRating: this.criterion1,
      communicationRating: this.isClientReviewingCreator ? this.criterion3 : this.criterion3,
      deadlinesRating: this.isClientReviewingCreator ? this.criterion2 : this.criterion2,
      equipmentMasteryRating: this.isClientReviewingCreator ? this.criterion4 : undefined,
      comment: this.comment,
      recommended: this.recommended
    };

    this.reviewSubmitted.emit(payload);
  }
}
