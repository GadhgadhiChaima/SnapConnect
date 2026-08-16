import { Component, input } from '@angular/core';

export type EscrowStep = 'PAYMENT' | 'ESCROW_HELD' | 'PRODUCTION' | 'REVIEW' | 'RELEASED';

@Component({
  selector: 'app-escrow-stepper',
  standalone: true,
  template: `
    <div class="escrow-stepper card-glass">
      <div class="stepper-header flex-between">
        <div class="header-title">
          <span class="shield-icon">🔒</span>
          <div>
            <h4>SnapConnect Escrow Protection</h4>
            <span class="sub-text">Funds are locked safely until final deliverable approval</span>
          </div>
        </div>
        <div class="escrow-amount-badge">
          <span class="lbl">Secured Amount:</span>
          <strong>\${{ amount() }} {{ currency() }}</strong>
        </div>
      </div>

      <!-- 5-Step Process Bar -->
      <div class="steps-track">
        <!-- Step 1 -->
        <div class="step-item" [class.active]="currentStep() === 'PAYMENT'" [class.completed]="isPast('PAYMENT')">
          <div class="step-circle">1</div>
          <div class="step-content">
            <span class="step-name">Deposit</span>
            <span class="step-status">{{ isPast('PAYMENT') ? 'Paid' : 'Pending' }}</span>
          </div>
        </div>

        <div class="step-connector" [class.filled]="isPast('PAYMENT')"></div>

        <!-- Step 2 -->
        <div class="step-item" [class.active]="currentStep() === 'ESCROW_HELD'" [class.completed]="isPast('ESCROW_HELD')">
          <div class="step-circle">2</div>
          <div class="step-content">
            <span class="step-name">Escrow Locked</span>
            <span class="step-status">{{ isPast('ESCROW_HELD') || currentStep() === 'ESCROW_HELD' ? 'Protected 🔒' : 'Waiting' }}</span>
          </div>
        </div>

        <div class="step-connector" [class.filled]="isPast('ESCROW_HELD')"></div>

        <!-- Step 3 -->
        <div class="step-item" [class.active]="currentStep() === 'PRODUCTION'" [class.completed]="isPast('PRODUCTION')">
          <div class="step-circle">3</div>
          <div class="step-content">
            <span class="step-name">4K Mobile Shoot</span>
            <span class="step-status">{{ isPast('PRODUCTION') ? 'Delivered' : currentStep() === 'PRODUCTION' ? 'Filming 🎬' : 'Queued' }}</span>
          </div>
        </div>

        <div class="step-connector" [class.filled]="isPast('PRODUCTION')"></div>

        <!-- Step 4 -->
        <div class="step-item" [class.active]="currentStep() === 'REVIEW'" [class.completed]="isPast('REVIEW')">
          <div class="step-circle">4</div>
          <div class="step-content">
            <span class="step-name">Client Review</span>
            <span class="step-status">{{ isPast('REVIEW') ? 'Approved' : currentStep() === 'REVIEW' ? 'Inspection ⏳' : 'Waiting' }}</span>
          </div>
        </div>

        <div class="step-connector" [class.filled]="isPast('REVIEW')"></div>

        <!-- Step 5 -->
        <div class="step-item" [class.active]="currentStep() === 'RELEASED'" [class.completed]="currentStep() === 'RELEASED'">
          <div class="step-circle">5</div>
          <div class="step-content">
            <span class="step-name">Funds Released</span>
            <span class="step-status">{{ currentStep() === 'RELEASED' ? 'Paid Out 💰' : 'Locked' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .escrow-stepper {
      padding: var(--space-5) var(--space-6);
      border-radius: var(--radius-xl);
      border: 1px solid rgba(139, 92, 246, 0.3);
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 27, 75, 0.4) 100%);
    }

    .stepper-header {
      margin-bottom: var(--space-6);
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .shield-icon {
      font-size: 1.8rem;
    }

    .header-title h4 {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      margin: 0;
      color: var(--color-primary-300);
    }

    .sub-text {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .escrow-amount-badge {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .escrow-amount-badge .lbl {
      font-size: 10px;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }

    .escrow-amount-badge strong {
      font-size: var(--font-size-lg);
      color: var(--color-success);
    }

    /* Steps track */
    .steps-track {
      display: flex;
      align-items: center;
      justify-content: space-between;
      overflow-x: auto;
      padding: var(--space-2) 0;
    }

    .step-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-shrink: 0;
    }

    .step-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      border: 2px solid var(--color-border);
      color: var(--color-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-xs);
      font-weight: bold;
      transition: all var(--transition-base);
    }

    .step-item.active .step-circle {
      background: var(--color-primary-500);
      border-color: var(--color-primary-300);
      color: #fff;
      box-shadow: var(--shadow-glow);
    }

    .step-item.completed .step-circle {
      background: var(--color-success);
      border-color: var(--color-success);
      color: #fff;
    }

    .step-content {
      display: flex;
      flex-direction: column;
    }

    .step-name {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
    }

    .step-status {
      font-size: 10px;
      color: var(--color-text-muted);
    }

    .step-item.active .step-name {
      color: var(--color-primary-300);
    }

    .step-item.completed .step-name {
      color: var(--color-text-primary);
    }

    .step-connector {
      flex-grow: 1;
      height: 2px;
      background: rgba(255, 255, 255, 0.1);
      margin: 0 var(--space-2);
      min-width: 20px;
      transition: background var(--transition-base);
    }

    .step-connector.filled {
      background: var(--color-success);
    }

    @media (max-width: 768px) {
      .steps-track {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-3);
      }
      .step-connector {
        display: none;
      }
    }
  `]
})
export class EscrowStepperComponent {
  amount = input<number>(250);
  currency = input<string>('USD');
  currentStep = input<EscrowStep>('REVIEW');

  private stepOrder: EscrowStep[] = ['PAYMENT', 'ESCROW_HELD', 'PRODUCTION', 'REVIEW', 'RELEASED'];

  isPast(step: EscrowStep): boolean {
    const currentIndex = this.stepOrder.indexOf(this.currentStep());
    const stepIndex = this.stepOrder.indexOf(step);
    return stepIndex < currentIndex;
  }
}
