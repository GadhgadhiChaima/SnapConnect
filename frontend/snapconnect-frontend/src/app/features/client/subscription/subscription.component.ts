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
          <span class="badge badge-primary">Formules & Abonnements</span>
          <h1>Propulsez votre marque avec du contenu mobile</h1>
          <p>Publications illimitées de briefs, visibilité prioritaire, filtres de matériel avancés et facturation centralisée avec TVA.</p>

          <!-- Billing Cycle Toggle -->
          <div class="billing-toggle card">
            <span [class.active]="!isYearly()" (click)="isYearly.set(false)">Facturation mensuelle</span>
            <button class="switch-pill" (click)="isYearly.set(!isYearly())" [class.on]="isYearly()">
              <span class="dot"></span>
            </button>
            <span [class.active]="isYearly()" (click)="isYearly.set(true)">
              Facturation annuelle <span class="discount-tag">-20% d'économie</span>
            </span>
          </div>
        </div>

        <!-- Plans Grid -->
        <div class="plans-grid">
          @for (plan of plans(); track plan.id) {
            <div
              class="plan-card card-glass animate-fade-in"
              [class.popular]="plan.badgeLabel === 'POUR MARQUES'"
            >
              @if (plan.badgeLabel) {
                <span class="popular-ribbon">{{ plan.badgeLabel }}</span>
              }

              <div class="plan-header">
                <h3>{{ plan.title }}</h3>
                <div class="plan-price">
                  <span class="amount">{{ getPrice(plan.priceMonthly) }} DT</span>
                  <span class="period">/ mois</span>
                </div>
                <span class="fee-pill">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 4px;">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Garantie Séquestre 100% Incluse
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
                  {{ plan.code === 'FREE' ? 'Formule Gratuite Actuelle' : 'Passer à la formule Premium' }}
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
    const price = this.isYearly() ? Math.round(plan.priceMonthly * 0.8 * 12) : plan.priceMonthly;
    if (confirm(`Passer à la formule ${plan.title} pour ${price} DT ?`)) {
      this.subService.upgradePlan(plan.id, plan.code);
      alert(`Félicitations ! Vous bénéficiez désormais de la formule ${plan.title}. Briefs illimités débloqués.`);
    }
  }
}
