import { Component } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="legal-page">
      <div class="container-narrow">
        <div class="page-header text-center">
          <span class="badge badge-neutral">Privacy & GDPR</span>
          <h1>Privacy Policy</h1>
          <p>Last updated: August 2026</p>
        </div>

        <div class="legal-content card-glass">
          <h3>1. Data Protection</h3>
          <p>SnapConnect is committed to protecting your personal information and complying with applicable GDPR regulations. We collect only the data necessary to facilitate marketplace matchmaking, payment security, and communication between clients and mobile creators.</p>

          <h3>2. Uploaded Media & Storage</h3>
          <p>Photos and video deliverables uploaded to contract rooms are encrypted in transit and securely hosted. You retain control over your uploaded media.</p>
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
export class PrivacyComponent {}
