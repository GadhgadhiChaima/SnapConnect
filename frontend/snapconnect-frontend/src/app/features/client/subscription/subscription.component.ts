import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { SubscriptionPlan } from '../../../core/models/subscription.model';

@Component({
  selector: 'app-client-subscription',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="sub-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header text-center">
          <span class="badge badge-primary">Brand & Business Plans</span>
          <h1>Scale Your Brand with Mobile Content</h1>
          <p>Unlimited brief postings, prioritized placement, advanced smartphone camera filters, and consolidated VAT billing.</p>

          <!-- Billing Cycle Toggle -->
          <div class="billing-toggle card">
            <span [class.active]="!isYearly()" (click)="isYearly.set(false)">Monthly Billing</span>
            <button class="switch-pill" (click)="isYearly.set(!isYearly())" [class.on]="isYearly()">
              <span class="dot"></span>
            </button>
            <span [class.active]="isYearly()" (click)="isYearly.set(true)">
              Annual Billing <span class="discount-tag">Save 20% 🎉</span>
            </span>
          </div>
        </div>

        <!-- Plans Grid -->
        <div class="plans-grid">
          @for (plan of plans(); track plan.id) {
            <div
              class="plan-card card-glass animate-fade-in"
              [class.popular]="plan.badgeLabel === 'FOR BRANDS'"
            >
              @if (plan.badgeLabel) {
                <span class="popular-ribbon">{{ plan.badgeLabel }}</span>
              }

              <div class="plan-header">
                <h3>{{ plan.title }}</h3>
                <div class="plan-price">
                  <span class="currency">$</span>
                  <span class="amount">{{ getPrice(plan.priceMonthly) }}</span>
                  <span class="period">/ month</span>
                </div>
                <span class="fee-pill">
                  🔒 100% Escrow Buyer Guarantee Included
                </span>
              </div>

              <ul class="features-list">
                @for (f of plan.features; track f.text) {
                  <li [class.dimmed]="!f.included" [class.highlighted]="f.highlight">
                    <span class="check-icon">{{ f.included ? '✓' : '✕' }}</span>
                    <span>{{ f.text }}</span>
                  </li>
                }
              </ul>

              <div class="plan-cta">
                <button
                  (click)="choosePlan(plan)"
                  class="btn btn-block"
                  [class.btn-primary]="plan.code === 'BUSINESS'"
                  [class.btn-outline]="plan.code === 'FREE'"
                >
                  {{ plan.code === 'FREE' ? 'Current Free Plan' : 'Upgrade to Business Growth' }}
                </button>
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

    .sub-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }

    .text-center { text-align: center; }

    .page-header {
      margin-bottom: var(--space-12);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .page-header h1 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      margin: var(--space-2) 0;
    }

    .page-header p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
      max-width: 580px;
    }

    .billing-toggle {
      margin-top: var(--space-6);
      display: inline-flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      cursor: pointer;
    }

    .billing-toggle span.active {
      font-weight: bold;
      color: var(--color-primary-300);
    }

    .switch-pill {
      width: 44px;
      height: 24px;
      border-radius: 24px;
      background: var(--color-surface-hover);
      border: 1px solid var(--color-border);
      position: relative;
      cursor: pointer;
    }

    .switch-pill.on {
      background: var(--color-primary-500);
    }

    .switch-pill .dot {
      width: 16px;
      height: 16px;
      background: white;
      border-radius: 50%;
      position: absolute;
      top: 3px;
      left: 3px;
      transition: .3s;
    }

    .switch-pill.on .dot {
      left: 23px;
    }

    .discount-tag {
      background: rgba(34, 197, 94, 0.2);
      color: var(--color-success);
      padding: 2px 6px;
      border-radius: 12px;
      font-weight: bold;
    }

    /* Grid */
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      max-width: 800px;
      margin: 0 auto;
      gap: var(--space-6);
      align-items: stretch;
    }

    .plan-card {
      position: relative;
      padding: var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--space-6);
    }

    .plan-card.popular {
      border: 2px solid var(--color-primary-400);
    }

    .popular-ribbon {
      position: absolute;
      top: -12px;
      right: 24px;
      background: var(--color-primary-500);
      color: white;
      font-size: 10px;
      font-weight: bold;
      padding: 4px 10px;
      border-radius: 12px;
      letter-spacing: var(--letter-spacing-wide);
    }

    .plan-header h3 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-2);
    }

    .plan-price {
      display: flex;
      align-items: baseline;
      gap: 2px;
      margin-bottom: var(--space-3);
    }

    .plan-price .currency { font-size: 1.5rem; font-weight: bold; color: var(--color-text-secondary); }
    .plan-price .amount { font-size: 2.8rem; font-weight: var(--font-weight-black); color: var(--color-text-primary); }
    .plan-price .period { font-size: var(--font-size-xs); color: var(--color-text-muted); }

    .fee-pill {
      display: inline-block;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-md);
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      font-size: var(--font-size-xs);
      color: var(--color-success);
    }

    .features-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      flex-grow: 1;
    }

    .features-list li {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      line-height: var(--line-height-normal);
    }

    .features-list li.dimmed {
      opacity: 0.4;
      text-decoration: line-through;
    }

    .features-list li.highlighted {
      color: var(--color-text-primary);
      font-weight: bold;
    }

    .check-icon {
      font-weight: bold;
      color: var(--color-success);
    }
  `]
})
export class ClientSubscriptionComponent {
  subService = inject(SubscriptionService);

  plans = this.subService.clientPlans;
  isYearly = signal(false);

  getPrice(monthlyPrice: number): number {
    return this.isYearly() ? Math.round(monthlyPrice * 0.8) : monthlyPrice;
  }

  choosePlan(plan: SubscriptionPlan): void {
    if (plan.code === 'FREE') return;
    if (confirm(`Upgrade to ${plan.title} for $${this.isYearly() ? plan.priceMonthly * 0.8 * 12 : plan.priceMonthly}?`)) {
      this.subService.upgradePlan(plan.id, plan.code);
      alert(`Success! You are now on the ${plan.title} plan. Unlimited briefs unlocked.`);
    }
  }
}
