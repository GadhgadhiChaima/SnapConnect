import { Component } from '@angular/core';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [],
  template: `
    <div class="stub-page">
      <div class="stub-content">
        <div class="stub-icon">🚧</div>
        <h2>Verify Email</h2>
        <p>This page is being implemented in the upcoming phases.</p>
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
export class VerifyEmailComponent {}
