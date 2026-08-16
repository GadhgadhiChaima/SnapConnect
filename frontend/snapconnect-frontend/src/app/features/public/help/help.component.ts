import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="help-page">
      <div class="container-narrow">
        <div class="page-header text-center">
          <span class="badge badge-primary">Support & FAQ</span>
          <h1>Help Center</h1>
          <p>Everything you need to know about hiring mobile creators and selling smartphone content.</p>
        </div>

        <div class="faq-list">
          <div class="faq-card card-glass">
            <h3>How does Escrow Protection work?</h3>
            <p>
              When a client accepts a proposal or orders a package, the payment is deposited into SnapConnect's secure escrow. The creator films, edits, and uploads the deliverables. The client reviews the files and only when the client approves the work is the payout released to the creator.
            </p>
          </div>

          <div class="faq-card card-glass">
            <h3>What hardware qualifies as a "Mobile Creator"?</h3>
            <p>
              Creators must shoot on modern flagship smartphones capable of at least 4K 30/60fps (e.g., iPhone 13 Pro or newer, Samsung Galaxy S22 Ultra or newer, Google Pixel 7 Pro or newer). We encourage accessories like mobile gimbals (DJI OM series) and wireless microphones.
            </p>
          </div>

          <div class="faq-card card-glass">
            <h3>How are revisions handled?</h3>
            <p>
              Each job or package specifies an agreed number of revisions (typically 2-3). Clients can submit timestamped feedback directly within the contract workspace.
            </p>
          </div>

          <div class="faq-card card-glass">
            <h3>What is the difference between Model A and Model B?</h3>
            <p>
              <strong>Model A (Jobs):</strong> The client posts a custom brief and creators bid with custom proposals.<br/>
              <strong>Model B (Services):</strong> Creators post predefined gig packages with fixed pricing and turnaround, and clients can order directly.
            </p>
          </div>
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .help-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }

    .text-center { text-align: center; }

    .page-header {
      margin-bottom: var(--space-10);
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

    .faq-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .faq-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
    }

    .faq-card h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-3);
      color: var(--color-text-primary);
    }

    .faq-card p {
      color: var(--color-text-secondary);
      line-height: var(--line-height-relaxed);
      font-size: var(--font-size-sm);
    }
  `]
})
export class HelpComponent {}
