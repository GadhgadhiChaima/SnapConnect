import { Component } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="legal-page">
      <div class="container-narrow">
        <div class="page-header text-center">
          <span class="badge badge-neutral">Legal</span>
          <h1>Terms of Service</h1>
          <p>Last updated: August 2026</p>
        </div>

        <div class="legal-content card-glass">
          <h3>1. Platform Scope</h3>
          <p>SnapConnect provides a specialized marketplace connecting clients seeking mobile photography and videography with independent creators who produce content using smartphone equipment.</p>

          <h3>2. Escrow & Payments</h3>
          <p>All transactions on SnapConnect are processed via our secure escrow framework. Payment is secured prior to project commencement and released upon client deliverable approval or milestone resolution.</p>

          <h3>3. Content Rights & Licensing</h3>
          <p>Upon final payment release, full commercial usage rights for the created photos and video files are transferred to the client unless otherwise specified in custom project terms.</p>
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }
    .legal-page { padding-top: calc(var(--navbar-height) + var(--space-8)); padding-bottom: var(--space-20); }
    .text-center { text-align: center; }
    .page-header { margin-bottom: var(--space-8); }
    .page-header h1 { font-size: var(--font-size-3xl); font-weight: var(--font-weight-black); margin: var(--space-2) 0; }
    .page-header p { color: var(--color-text-muted); font-size: var(--font-size-sm); }
    .legal-content { padding: var(--space-8); border-radius: var(--radius-2xl); display: flex; flex-direction: column; gap: var(--space-4); }
    .legal-content h3 { font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); }
    .legal-content p { color: var(--color-text-secondary); line-height: var(--line-height-relaxed); font-size: var(--font-size-sm); }
  `]
})
export class TermsComponent {}
