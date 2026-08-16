import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="error-page">
      <div class="error-content animate-fade-in">
        <div class="error-code">403</div>
        <h1>Access Denied</h1>
        <p>You don't have permission to view this page.</p>
        <div class="error-actions">
          <a routerLink="/" class="btn btn-primary btn-lg">Go Home</a>
          <button (click)="goBack()" class="btn btn-outline btn-lg">Go Back</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-8);
      text-align: center;
    }
    .error-content { max-width: 480px; }
    .error-code {
      font-size: 8rem;
      font-weight: var(--font-weight-black);
      line-height: 1;
      background: linear-gradient(135deg, var(--color-error), var(--color-accent-500));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: var(--space-4);
    }
    h1 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-3);
    }
    p { color: var(--color-text-secondary); margin-bottom: var(--space-8); font-size: var(--font-size-lg); }
    .error-actions { display: flex; gap: var(--space-4); justify-content: center; }
  `]
})
export class ForbiddenComponent {
  constructor(private router: Router) {}
  goBack() { history.back(); }
}
