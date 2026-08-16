import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-client-orders',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="orders-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-accent">Model B — Gigs</span>
            <h1>My Purchased Mobile Packages</h1>
            <p>Direct orders purchased from creator gig packages with fixed turnaround and escrow protection.</p>
          </div>
          <a routerLink="/services" class="btn btn-outline btn-md">
            Browse More Packages
          </a>
        </div>

        <!-- Orders List -->
        <div class="orders-list">
          @for (ord of orders(); track ord.id) {
            <div class="order-card card-glass animate-fade-in">
              <div class="card-head flex-between">
                <div>
                  <span class="badge badge-accent">{{ ord.packageTier }} PACKAGE</span>
                  <h3 class="order-title">{{ ord.serviceTitle }}</h3>
                </div>
                <span class="order-price">\${{ ord.amount }} USD</span>
              </div>

              <div class="order-details">
                <span>Creator: <strong>{{ ord.creatorName }}</strong></span>
                <span>Order Ref: <strong>#{{ ord.id }}</strong></span>
                <span>Status: <strong class="text-success">● {{ ord.status }}</strong></span>
              </div>

              <div class="card-actions flex-between">
                <span class="date">Ordered: {{ ord.createdAt }}</span>
                <a [routerLink]="['/client/contracts', ord.contractId]" class="btn btn-primary btn-sm">
                  View Contract & Deliverables →
                </a>
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

    .orders-page {
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

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .order-card {
      padding: var(--space-6) var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .order-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      margin: var(--space-1) 0 0;
    }

    .order-price {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-black);
      color: var(--color-success);
    }

    .order-details {
      display: flex;
      gap: var(--space-6);
      flex-wrap: wrap;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .order-details strong {
      color: var(--color-text-primary);
    }

    .card-actions {
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border-subtle);
    }

    .date {
      font-size: 11px;
      color: var(--color-text-muted);
    }
  `]
})
export class ClientOrdersComponent {
  orders = signal<Order[]>([
    {
      id: 'ord-101',
      contractId: 'ct-2',
      serviceId: 'srv-1',
      serviceTitle: '3 Viral UGC TikToks shot on iPhone 16 Pro with Voiceover',
      packageTier: 'STANDARD',
      clientId: 'cl-1',
      creatorId: 'cr-1',
      creatorName: 'Sarah Jenkins',
      amount: 180,
      status: 'ACTIVE',
      createdAt: '2026-08-13'
    }
  ]);
}
