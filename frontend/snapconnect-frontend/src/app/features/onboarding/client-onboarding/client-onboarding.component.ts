import { Component } from '@angular/core';

@Component({
  selector: 'app-client-onboarding',
  standalone: true,
  imports: [],
  template: `
    <div class="stub-page">
      <div class="stub-content">
        <div class="stub-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-primary-400);">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h2>Intégration Client</h2>
        <p>Cet écran d'onboarding est en cours de synchronisation.</p>
      </div>
    </div>
  `,
  styles: [`
    .stub-page {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .stub-content { max-width: 400px; }
    .stub-icon { font-size: 3rem; margin-bottom: var(--space-4); }
    h2 {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-2);
    }
    p { color: var(--color-text-secondary); }
  `]
})
export class ClientOnboardingComponent {}
