import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="auth-page">
      <div class="auth-glow"></div>

      <div class="auth-card card-glass animate-scale-in">
        <div class="auth-header">
          <div class="auth-logo">📸</div>
          <h2>Welcome back</h2>
          <p>Sign in to your SnapConnect account</p>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-error">
            <span>⚠️</span>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              required
              class="form-input"
              placeholder="you@example.com"
            />
          </div>

          <div class="form-group">
            <div class="flex-between">
              <label class="form-label" for="password">Password</label>
              <a routerLink="/auth/forgot-password" class="forgot-link">Forgot?</a>
            </div>
            <input
              type="password"
              id="password"
              [(ngModel)]="password"
              name="password"
              required
              class="form-input"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" [disabled]="isLoading()" class="btn btn-primary btn-block btn-lg">
            @if (isLoading()) {
              <span class="animate-spin">🌀</span> Signing in...
            } @else {
              Sign In
            }
          </button>
        </form>

        <!-- Quick Demo Switcher for fast testing -->
        <div class="demo-box">
          <p class="demo-title">⚡ Quick Demo Logins (Click to test):</p>
          <div class="demo-buttons">
            <button type="button" (click)="fillDemo('client@snapconnect.com', 'CLIENT')" class="btn btn-outline btn-xs">
              👤 Client Account
            </button>
            <button type="button" (click)="fillDemo('creator@snapconnect.com', 'CREATOR')" class="btn btn-outline btn-xs">
              📱 Creator Account
            </button>
            <button type="button" (click)="fillDemo('admin@snapconnect.com', 'ADMIN')" class="btn btn-outline btn-xs">
              🛡️ Admin Account
            </button>
          </div>
        </div>

        <div class="auth-footer">
          <span>Don't have an account?</span>
          <a routerLink="/auth/register" class="register-link">Create Account</a>
        </div>
      </div>
    </div>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .auth-page {
      min-height: calc(100vh - var(--navbar-height));
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-12);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding-inline: var(--space-4);
    }

    .auth-glow {
      position: absolute;
      width: 500px;
      height: 400px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.1) 50%, transparent 80%);
      filter: blur(70px);
      z-index: 0;
      pointer-events: none;
    }

    .auth-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 440px;
      padding: var(--space-8);
      border-radius: var(--radius-xl);
      border-color: var(--color-border-focus);
    }

    .auth-header {
      text-align: center;
      margin-bottom: var(--space-6);
    }

    .auth-logo {
      font-size: 2.5rem;
      margin-bottom: var(--space-2);
    }

    .auth-header h2 {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-extrabold);
      color: var(--color-text-primary);
      margin-bottom: var(--space-1);
    }

    .auth-header p {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .forgot-link {
      font-size: var(--font-size-xs);
      color: var(--color-primary-400);
      text-decoration: none;
    }

    .forgot-link:hover {
      text-decoration: underline;
    }

    .demo-box {
      margin-top: var(--space-6);
      padding: var(--space-3) var(--space-4);
      background: rgba(15, 23, 42, 0.6);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-md);
      text-align: center;
    }

    .demo-title {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-bottom: var(--space-2);
      font-weight: var(--font-weight-medium);
    }

    .demo-buttons {
      display: flex;
      gap: var(--space-2);
      justify-content: center;
      flex-wrap: wrap;
    }

    .auth-footer {
      margin-top: var(--space-6);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border-subtle);
      text-align: center;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
    }

    .register-link {
      color: var(--color-primary-400);
      font-weight: var(--font-weight-semibold);
      text-decoration: none;
    }

    .register-link:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  isLoading = signal(false);
  errorMessage = signal('');

  fillDemo(email: string, role: string) {
    this.email = email;
    this.password = 'password123';
    this.onSubmit();
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Please provide both email and password.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else {
          this.auth.redirectToDashboard();
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Login failed. Please check your credentials.');
      }
    });
  }
}
