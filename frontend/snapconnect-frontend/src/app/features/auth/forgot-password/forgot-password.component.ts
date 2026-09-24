import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="auth-page">
      <div class="auth-glow"></div>

      <div class="auth-card card-glass animate-scale-in">
        <div class="auth-header">
          <div class="auth-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2>Mot de passe oublié ?</h2>
          <p>
            @if (!submitted()) {
              Entrez votre adresse e-mail pour recevoir un lien de réinitialisation sécurisé.
            } @else {
              Vérifiez vos instructions de réinitialisation ci-dessous.
            }
          </p>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-error animate-scale-in">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        @if (!submitted()) {
          <!-- Request Form -->
          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label class="form-label" for="email">Adresse e-mail</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  type="email"
                  id="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  class="form-input with-icon"
                  placeholder="votre-email@exemple.com"
                  [disabled]="isLoading()"
                  autofocus
                />
              </div>
            </div>

            <button type="submit" [disabled]="isLoading() || !email.trim()" class="btn btn-primary btn-block btn-lg">
              @if (isLoading()) {
                <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: middle; margin-right: 6px;">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"/>
                </svg>
                <span>Envoi en cours...</span>
              } @else {
                <span>Envoyer le lien de réinitialisation</span>
              }
            </button>
          </form>

          <div class="quick-demo-tips">
            <p class="tip-title">Comptes démo disponibles :</p>
            <div class="demo-chips">
              <button type="button" (click)="fillEmail('client@snapconnect.com')" class="chip-btn">
                client&#64;snapconnect.com
              </button>
              <button type="button" (click)="fillEmail('creator@snapconnect.com')" class="chip-btn">
                creator&#64;snapconnect.com
              </button>
            </div>
          </div>
        } @else {
          <!-- Success / Sent state -->
          <div class="success-box animate-scale-in">
            <div class="success-icon-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3>Lien généré avec succès !</h3>
            <p class="success-desc">
              Une demande de réinitialisation a été créée pour <strong>{{ email }}</strong>.
            </p>

            @if (generatedToken()) {
              <div class="token-action-card">
                <div class="token-header">
                  <span class="badge-dev">Mode Développeur / Démo</span>
                </div>
                <p class="token-info">Cliquez sur le bouton ci-dessous pour procéder immédiatement au changement de votre mot de passe :</p>
                <button
                  type="button"
                  (click)="goToResetPage()"
                  class="btn btn-gradient btn-block btn-lg"
                >
                  Réinitialiser mon mot de passe maintenant →
                </button>
              </div>
            }

            <div class="resend-section">
              <p>Vous n'avez rien reçu ?</p>
              <button
                type="button"
                [disabled]="resendCountdown() > 0 || isLoading()"
                (click)="resendEmail()"
                class="btn btn-outline btn-sm"
              >
                @if (resendCountdown() > 0) {
                  Renvoyer dans {{ resendCountdown() }}s
                } @else {
                  Renvoyer la demande
                }
              </button>
            </div>
          </div>
        }

        <div class="auth-footer">
          <a routerLink="/auth/login" class="back-link">
            <span>←</span> Retour à la connexion
          </a>
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
      background: radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(236, 72, 153, 0.12) 50%, transparent 80%);
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

    .auth-logo { font-size: 2.5rem; margin-bottom: var(--space-2); }
    .auth-header h2 {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-extrabold);
      margin-bottom: var(--space-2);
      background: linear-gradient(135deg, #fff 40%, var(--color-primary-300));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .auth-header p {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: 1.5;
    }

    .auth-form { display: flex; flex-direction: column; gap: var(--space-4); }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: var(--space-3);
      font-size: 1.1rem;
      pointer-events: none;
      opacity: 0.7;
    }
    .form-input.with-icon {
      padding-left: 2.6rem;
    }

    .quick-demo-tips {
      margin-top: var(--space-5);
      padding: var(--space-3) var(--space-4);
      background: rgba(15, 23, 42, 0.6);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-md);
      text-align: center;
    }
    .tip-title {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-bottom: var(--space-2);
    }
    .demo-chips {
      display: flex;
      gap: var(--space-2);
      justify-content: center;
      flex-wrap: wrap;
    }
    .chip-btn {
      background: rgba(139, 92, 246, 0.12);
      color: var(--color-primary-300);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: var(--radius-full);
      padding: 3px 10px;
      font-size: var(--font-size-xs);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .chip-btn:hover {
      background: rgba(139, 92, 246, 0.25);
      border-color: var(--color-primary-400);
      color: #fff;
    }

    .success-box {
      text-align: center;
      padding: var(--space-2) 0;
    }
    .success-icon-badge {
      width: 56px;
      height: 56px;
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      margin: 0 auto var(--space-3);
    }
    .success-box h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-1);
    }
    .success-desc {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-5);
    }
    .success-desc strong {
      color: var(--color-primary-300);
    }

    .token-action-card {
      background: rgba(139, 92, 246, 0.08);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      margin-bottom: var(--space-5);
      text-align: left;
    }
    .token-header {
      margin-bottom: var(--space-2);
    }
    .badge-dev {
      background: rgba(139, 92, 246, 0.25);
      color: var(--color-primary-300);
      font-size: 11px;
      font-weight: var(--font-weight-bold);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .token-info {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-3);
      line-height: 1.5;
    }

    .btn-gradient {
      background: linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500));
      color: #fff;
      font-weight: var(--font-weight-semibold);
      box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);
      border: none;
      transition: all var(--transition-fast);
    }
    .btn-gradient:hover {
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
      transform: translateY(-1px);
    }

    .resend-section {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      margin-top: var(--space-4);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border-subtle);
    }

    .auth-footer {
      margin-top: var(--space-6);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border-subtle);
      text-align: center;
      font-size: var(--font-size-sm);
    }
    .back-link {
      color: var(--color-text-secondary);
      text-decoration: none;
      font-weight: var(--font-weight-medium);
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      transition: color var(--transition-fast);
    }
    .back-link:hover {
      color: var(--color-primary-400);
      text-decoration: underline;
    }
  `]
})
export class ForgotPasswordComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  isLoading = signal(false);
  errorMessage = signal('');
  submitted = signal(false);
  generatedToken = signal('');
  resendCountdown = signal(0);
  private timerInterval?: any;

  fillEmail(email: string): void {
    this.email = email;
  }

  onSubmit(): void {
    if (!this.email || !this.email.trim()) {
      this.errorMessage.set('Veuillez renseigner votre adresse email.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.auth.forgotPassword(this.email.trim()).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.submitted.set(true);
        if (res?.resetToken) {
          this.generatedToken.set(res.resetToken);
        }
        this.startCountdown();
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Impossible de traiter la demande. Vérifiez votre adresse email.'
        );
      }
    });
  }

  goToResetPage(): void {
    if (this.generatedToken()) {
      this.router.navigate(['/auth/reset-password'], {
        queryParams: { token: this.generatedToken() }
      });
    } else {
      this.router.navigate(['/auth/reset-password']);
    }
  }

  resendEmail(): void {
    if (this.resendCountdown() > 0) return;
    this.onSubmit();
  }

  private startCountdown(): void {
    this.resendCountdown.set(30);
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      const current = this.resendCountdown();
      if (current <= 1) {
        clearInterval(this.timerInterval);
        this.resendCountdown.set(0);
      } else {
        this.resendCountdown.set(current - 1);
      }
    }, 1000);
  }
}
