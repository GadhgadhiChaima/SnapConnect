import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-reset-password',
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h2>Nouveau mot de passe</h2>
          <p>
            @if (isSuccess()) {
              Votre mot de passe a été mis à jour avec succès !
            } @else if (userEmail()) {
              Définissez un nouveau mot de passe pour <strong>{{ userEmail() }}</strong>
            } @else {
              Sécurisez l'accès à votre compte SnapConnect
            }
          </p>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-error animate-scale-in">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        @if (isCheckingToken()) {
          <div class="token-verifying animate-pulse">
            <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"/>
            </svg>
            <span>Vérification de la validité du lien...</span>
          </div>
        } @else if (tokenInvalid()) {
          <!-- Invalid / Expired Token State -->
          <div class="token-invalid-box animate-scale-in">
            <div class="invalid-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3>Lien expiré ou invalide</h3>
            <p>{{ invalidReason() || "Ce lien de réinitialisation n'est plus valide ou a déjà été utilisé." }}</p>
            
            <div class="invalid-actions">
              <a routerLink="/auth/forgot-password" class="btn btn-primary btn-block">
                Demander un nouveau lien
              </a>
              <a routerLink="/auth/login" class="btn btn-outline btn-block">
                Retour à la connexion
              </a>
            </div>
          </div>
        } @else if (isSuccess()) {
          <!-- Success State -->
          <div class="success-box animate-scale-in">
            <div class="success-icon-badge">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3>Mot de passe modifié !</h3>
            <p class="success-desc">
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec vos nouveaux identifiants.
            </p>

            <div class="redirect-counter">
              <span>Redirection automatique vers la connexion dans {{ countdown() }}s...</span>
            </div>

            <button type="button" (click)="goToLogin()" class="btn btn-primary btn-block btn-lg">
              Se connecter maintenant →
            </button>
          </div>
        } @else {
          <!-- Reset Password Form -->
          <form (ngSubmit)="onSubmit()" class="auth-form">

            @if (!tokenFromUrl) {
              <div class="form-group">
                <label class="form-label" for="tokenInput">Code de réinitialisation</label>
                <input
                  type="text"
                  id="tokenInput"
                  [(ngModel)]="token"
                  name="token"
                  required
                  class="form-input"
                  placeholder="Collez votre code de réinitialisation"
                />
              </div>
            }

            <div class="form-group">
              <label class="form-label" for="password">Nouveau mot de passe</label>
              <div class="input-wrapper">
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  id="password"
                  [(ngModel)]="newPassword"
                  (ngModelChange)="evaluateStrength()"
                  name="password"
                  required
                  minlength="6"
                  class="form-input"
                  placeholder="Minimum 6 caractères"
                  [disabled]="isLoading()"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="btn-toggle-eye"
                  tabindex="-1"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    @if (showPassword()) {
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    } @else {
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    }
                  </svg>
                </button>
              </div>

              <!-- Password Strength Meter -->
              @if (newPassword) {
                <div class="strength-meter animate-fade-in">
                  <div class="strength-bars">
                    <div class="bar" [class.active]="strengthScore() >= 1" [style.background]="getBarColor(1)"></div>
                    <div class="bar" [class.active]="strengthScore() >= 2" [style.background]="getBarColor(2)"></div>
                    <div class="bar" [class.active]="strengthScore() >= 3" [style.background]="getBarColor(3)"></div>
                    <div class="bar" [class.active]="strengthScore() >= 4" [style.background]="getBarColor(4)"></div>
                  </div>
                  <span class="strength-label" [style.color]="strengthLabelColor()">
                    Force : {{ strengthLabel() }}
                  </span>
                </div>
              }
            </div>

            <div class="form-group">
              <label class="form-label" for="confirmPassword">Confirmer le mot de passe</label>
              <div class="input-wrapper">
                <input
                  [type]="showConfirmPassword() ? 'text' : 'password'"
                  id="confirmPassword"
                  [(ngModel)]="confirmPassword"
                  name="confirmPassword"
                  required
                  class="form-input"
                  placeholder="Répétez votre nouveau mot de passe"
                  [disabled]="isLoading()"
                />
                <button
                  type="button"
                  (click)="showConfirmPassword.set(!showConfirmPassword())"
                  class="btn-toggle-eye"
                  tabindex="-1"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    @if (showConfirmPassword()) {
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    } @else {
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    }
                  </svg>
                </button>
              </div>

              @if (confirmPassword && newPassword !== confirmPassword) {
                <span class="input-hint hint-error animate-fade-in">
                  Les mots de passe ne correspondent pas
                </span>
              } @else if (confirmPassword && newPassword === confirmPassword) {
                <span class="input-hint hint-success animate-fade-in">
                  Les mots de passe correspondent
                </span>
              }
            </div>

            <button
              type="submit"
              [disabled]="isLoading() || !isFormValid()"
              class="btn btn-primary btn-block btn-lg"
            >
              @if (isLoading()) {
                <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: middle; margin-right: 6px;">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"/>
                </svg>
                <span>Enregistrement...</span>
              } @else {
                <span>Enregistrer le nouveau mot de passe</span>
              }
            </button>
          </form>
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
    .auth-header p strong {
      color: var(--color-primary-300);
    }

    .auth-form { display: flex; flex-direction: column; gap: var(--space-4); }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .btn-toggle-eye {
      position: absolute;
      right: var(--space-3);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: var(--space-1);
      opacity: 0.7;
      transition: opacity var(--transition-fast);
    }
    .btn-toggle-eye:hover { opacity: 1; }

    /* Strength Meter */
    .strength-meter {
      margin-top: var(--space-2);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
    }
    .strength-bars {
      flex: 1;
      display: flex;
      gap: 4px;
      height: 4px;
    }
    .bar {
      flex: 1;
      height: 100%;
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-full);
      transition: background-color var(--transition-fast);
    }
    .strength-label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      white-space: nowrap;
    }

    .input-hint {
      font-size: var(--font-size-xs);
      margin-top: var(--space-1);
      display: block;
    }
    .hint-error { color: var(--color-error); }
    .hint-success { color: var(--color-success); }

    .token-verifying {
      text-align: center;
      padding: var(--space-8) 0;
      color: var(--color-primary-300);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--font-size-sm);
    }

    .token-invalid-box {
      text-align: center;
      padding: var(--space-4) 0;
    }
    .invalid-icon {
      font-size: 2.5rem;
      margin-bottom: var(--space-2);
    }
    .token-invalid-box h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      color: var(--color-error);
      margin-bottom: var(--space-2);
    }
    .token-invalid-box p {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-6);
      line-height: 1.5;
    }
    .invalid-actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .success-box {
      text-align: center;
      padding: var(--space-4) 0;
    }
    .success-icon-badge {
      width: 60px;
      height: 60px;
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin: 0 auto var(--space-4);
    }
    .success-box h3 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-success);
      margin-bottom: var(--space-2);
    }
    .success-desc {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-5);
      line-height: 1.5;
    }
    .redirect-counter {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-bottom: var(--space-4);
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
export class ResetPasswordComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  token = '';
  tokenFromUrl = false;
  userEmail = signal('');
  newPassword = '';
  confirmPassword = '';

  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  isCheckingToken = signal(false);
  tokenInvalid = signal(false);
  invalidReason = signal('');
  isSuccess = signal(false);
  errorMessage = signal('');

  strengthScore = signal(0);
  countdown = signal(5);
  private countdownTimer?: any;

  ngOnInit(): void {
    const urlToken = this.route.snapshot.queryParams['token'];
    if (urlToken) {
      this.token = urlToken.trim();
      this.tokenFromUrl = true;
      this.verifyToken(this.token);
    }
  }

  verifyToken(tok: string): void {
    this.isCheckingToken.set(true);
    this.tokenInvalid.set(false);
    this.errorMessage.set('');

    this.auth.verifyResetToken(tok).subscribe({
      next: (res) => {
        this.isCheckingToken.set(false);
        if (res.valid) {
          if (res.email) this.userEmail.set(res.email);
        } else {
          this.tokenInvalid.set(true);
          this.invalidReason.set(res.message || 'Le lien de réinitialisation est invalide ou a expiré.');
        }
      },
      error: (err: any) => {
        this.isCheckingToken.set(false);
        this.tokenInvalid.set(true);
        this.invalidReason.set(
          err?.error?.message || 'Le lien de réinitialisation est invalide ou a expiré.'
        );
      }
    });
  }

  evaluateStrength(): void {
    const p = this.newPassword;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p)) score++;
    this.strengthScore.set(score);
  }

  strengthLabel(): string {
    const s = this.strengthScore();
    if (s <= 1) return 'Faible';
    if (s === 2) return 'Moyen';
    if (s === 3) return 'Bon';
    return 'Très fort';
  }

  strengthLabelColor(): string {
    const s = this.strengthScore();
    if (s <= 1) return '#ef4444';
    if (s === 2) return '#f59e0b';
    if (s === 3) return '#06b6d4';
    return '#22c55e';
  }

  getBarColor(index: number): string {
    if (this.strengthScore() < index) return 'rgba(255, 255, 255, 0.1)';
    return this.strengthLabelColor();
  }

  isFormValid(): boolean {
    return (
      this.token.trim().length > 0 &&
      this.newPassword.length >= 6 &&
      this.newPassword === this.confirmPassword
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMessage.set('Veuillez vérifier les informations saisies.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.auth.resetPassword({
      token: this.token.trim(),
      newPassword: this.newPassword.trim()
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
        this.startRedirectCountdown();
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Erreur lors de la réinitialisation du mot de passe.'
        );
      }
    });
  }

  startRedirectCountdown(): void {
    this.countdown.set(5);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.countdownTimer = setInterval(() => {
      const c = this.countdown();
      if (c <= 1) {
        clearInterval(this.countdownTimer);
        this.goToLogin();
      } else {
        this.countdown.set(c - 1);
      }
    }, 1000);
  }

  goToLogin(): void {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.router.navigate(['/auth/login']);
  }
}
