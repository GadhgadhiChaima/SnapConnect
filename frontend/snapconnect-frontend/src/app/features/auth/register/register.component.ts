import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="auth-page">
      <div class="auth-glow"></div>

      <div class="auth-card card-glass animate-scale-in">
        <div class="auth-header">
          <div class="auth-logo">✨</div>
          <h2>Join SnapConnect</h2>
          <p>Choose how you want to use the platform</p>
        </div>

        <!-- Role Selector Cards -->
        <div class="role-selector">
          <div
            class="role-card"
            [class.selected]="selectedRole() === 'CLIENT'"
            (click)="selectedRole.set('CLIENT')">
            <div class="role-icon">💼</div>
            <div class="role-info">
              <strong>I am a Client</strong>
              <span>Hire mobile shooters for photos, reels & UGC</span>
            </div>
            <div class="radio-dot"></div>
          </div>

          <div
            class="role-card"
            [class.selected]="selectedRole() === 'CREATOR'"
            (click)="selectedRole.set('CREATOR')">
            <div class="role-icon">📱</div>
            <div class="role-info">
              <strong>I am a Creator</strong>
              <span>Shoot content on smartphone & earn money</span>
            </div>
            <div class="radio-dot"></div>
          </div>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-error">
            <span>⚠️</span>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              [(ngModel)]="fullName"
              name="fullName"
              required
              class="form-input"
              placeholder="e.g. Alex Rivera"
            />
          </div>

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
            <label class="form-label" for="password">Password</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="password"
              name="password"
              required
              class="form-input"
              placeholder="At least 6 characters"
            />
          </div>

          <button type="submit" [disabled]="isLoading()" class="btn btn-primary btn-block btn-lg">
            @if (isLoading()) {
              <span class="animate-spin">🌀</span> Creating account...
            } @else {
              Create Account as {{ selectedRole() === 'CLIENT' ? 'Client' : 'Mobile Creator' }}
            }
          </button>
        </form>

        <div class="auth-footer">
          <span>Already have an account?</span>
          <a routerLink="/auth/login" class="login-link">Sign In</a>
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
      max-width: 480px;
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

    /* Role Selector */
    .role-selector {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-bottom: var(--space-6);
    }

    .role-card {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: rgba(15, 23, 42, 0.6);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .role-card:hover {
      border-color: var(--color-primary-400);
    }

    .role-card.selected {
      border-color: var(--color-primary-500);
      background: var(--color-primary-light);
      box-shadow: 0 0 15px var(--color-primary-glow);
    }

    .role-icon {
      font-size: 1.5rem;
    }

    .role-info {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .role-info strong {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
    }

    .role-info span {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .radio-dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid var(--color-text-muted);
      position: relative;
    }

    .role-card.selected .radio-dot {
      border-color: var(--color-primary-500);
      background: var(--color-primary-500);
    }

    .role-card.selected .radio-dot::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #fff;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
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

    .login-link {
      color: var(--color-primary-400);
      font-weight: var(--font-weight-semibold);
      text-decoration: none;
    }

    .login-link:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  fullName = '';
  email = '';
  password = '';
  selectedRole = signal<UserRole>('CLIENT');
  isLoading = signal(false);
  errorMessage = signal('');

  onSubmit() {
    if (!this.fullName || !this.email || !this.password) {
      this.errorMessage.set('Please fill out all fields.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.auth.register({
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      role: this.selectedRole()
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.auth.redirectToDashboard();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Registration failed. Please try again.');
      }
    });
  }
}
