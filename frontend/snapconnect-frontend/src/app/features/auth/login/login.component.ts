import {
  Component, signal, inject, AfterViewInit, ElementRef, ViewChild, NgZone, OnInit
} from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="auth-page">
      <div class="auth-glow"></div>

      <!-- ═══════════════════════════════════════════════════════
           PAGE LOGIN SÉPARÉE (STYLE UPWORK)
           ═══════════════════════════════════════════════════════ -->
      <div class="login-card card-glass animate-scale-in">
        <div class="auth-header">
          <h1 class="auth-title">Se connecter à SnapConnect</h1>
          <p class="auth-subtitle">Entrez vos identifiants pour accéder à votre espace</p>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-error animate-scale-in">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        @if (successMessage()) {
          <div class="alert alert-success animate-scale-in">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>{{ successMessage() }}</span>
          </div>
        }

        <!-- Formulaire de Connexion -->
        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="email">Adresse e-mail</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              required
              class="form-input"
              placeholder="vous@exemple.com"
            />
          </div>

          <div class="form-group">
            <div class="form-label-row">
              <label class="form-label" for="password">Mot de passe</label>
              <a routerLink="/auth/forgot-password" class="forgot-link">Mot de passe oublié ?</a>
            </div>
            <div class="password-input-box">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                id="password"
                [(ngModel)]="password"
                name="password"
                required
                class="form-input"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="password-toggle-btn"
                (click)="showPassword.set(!showPassword())"
                tabindex="-1"
                [title]="showPassword() ? 'Masquer' : 'Afficher'"
              >
                @if (showPassword()) {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                } @else {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                }
              </button>
            </div>
          </div>

          <button type="submit" [disabled]="isLoading()" class="btn btn-primary btn-block btn-lg submit-btn">
            @if (isLoading()) {
              <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: middle; margin-right: 6px;">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"/>
              </svg>
              <span>Connexion en cours...</span>
            } @else {
              <span>Se connecter</span>
            }
          </button>
        </form>

        <!-- Divider « ou » -->
        <div class="auth-divider">
          <span class="divider-line"></span>
          <span class="divider-text">ou</span>
          <span class="divider-line"></span>
        </div>

        <!-- Google Sign-In Button (GIS + 1-Click Demo) -->
        <div class="google-btn-section">
          @if (isClientIdConfigured()) {
            <div #googleBtnContainer id="google-signin-btn" class="google-btn-container"></div>
          } @else {
            <button
              type="button"
              (click)="loginWithGoogleDemo('CLIENT')"
              class="btn-social google-btn-demo"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" style="flex-shrink:0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continuer avec Google</span>
            </button>

            <div class="google-sub-links">
              <a href="javascript:void(0)" (click)="showSetupGuide.set(!showSetupGuide())" class="link-subtle">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 4px;">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                <span>Configurer Google Client ID</span>
              </a>
            </div>

            @if (showSetupGuide()) {
              <div class="setup-guide animate-scale-in">
                <p class="guide-title">Configuration Google Client ID</p>
                <ol class="guide-steps">
                  <li>Google Cloud Console → "OAuth 2.0 Client IDs"</li>
                  <li>Origine autorisée : <code>http://localhost:4200</code></li>
                </ol>
                <div class="client-id-input-row">
                  <input
                    type="text"
                    [(ngModel)]="clientIdInput"
                    name="clientId"
                    placeholder="123456.apps.googleusercontent.com"
                    class="form-input form-input-sm"
                  />
                  <button type="button" (click)="saveClientId()" class="btn btn-primary btn-sm">
                    Sauvegarder
                  </button>
                </div>
              </div>
            }
          }
        </div>


        <!-- Footer : « Pas encore de compte ? Créer un compte » -->
        <div class="auth-footer">
          <span>Pas encore de compte ?</span>
          <a routerLink="/auth/register" class="register-link">Créer un compte</a>
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
      padding-bottom: var(--space-16);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding-inline: var(--space-4);
    }

    .auth-glow {
      position: absolute;
      width: 580px;
      height: 460px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, rgba(236, 72, 153, 0.08) 50%, transparent 80%);
      filter: blur(80px);
      z-index: 0;
      pointer-events: none;
    }

    .login-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 460px;
      padding: var(--space-8);
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-border-focus);
    }

    .auth-header {
      text-align: center;
      margin-bottom: var(--space-6);
    }

    .auth-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-extrabold);
      letter-spacing: -0.02em;
      color: var(--color-text-primary);
      margin-bottom: var(--space-1);
    }

    .auth-subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: 1.45;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .form-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-1);
    }

    .forgot-link {
      font-size: var(--font-size-xs);
      color: var(--color-primary-400);
      text-decoration: underline;
      text-underline-offset: 2px;
      transition: color var(--transition-fast);
    }

    .forgot-link:hover {
      color: var(--color-primary-300);
    }

    .password-input-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-input-box .form-input {
      width: 100%;
      padding-right: 44px;
    }

    .password-toggle-btn {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      transition: color var(--transition-fast);
    }

    .password-toggle-btn:hover {
      color: var(--color-text-primary);
    }

    .submit-btn {
      border-radius: var(--radius-full);
      padding-block: 12px;
      font-weight: var(--font-weight-bold);
      margin-top: var(--space-1);
    }

    .auth-divider {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin: var(--space-5) 0;
    }

    .divider-line {
      flex: 1;
      height: 1px;
      background: var(--color-border-subtle);
    }

    .divider-text {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      text-transform: lowercase;
      letter-spacing: 0.05em;
    }

    .google-btn-section {
      margin-bottom: var(--space-2);
    }

    .google-btn-container {
      display: flex;
      justify-content: center;
      width: 100%;
      min-height: 44px;
    }

    .btn-social, .google-btn-demo {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      padding: 11px var(--space-4);
      border-radius: var(--radius-full);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all var(--transition-fast);
      border: 1px solid var(--color-border);
      background: rgba(255, 255, 255, 0.05);
      color: var(--color-text-primary);
    }

    .btn-social:hover, .google-btn-demo:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-1px);
    }

    .google-sub-links {
      text-align: center;
      margin-top: 6px;
    }

    .link-subtle {
      font-size: 11px;
      color: var(--color-text-muted);
      text-decoration: underline;
    }

    .link-subtle:hover {
      color: var(--color-primary-400);
    }

    .setup-guide {
      margin-top: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid var(--color-border-focus);
      border-radius: var(--radius-md);
      font-size: var(--font-size-xs);
    }

    .guide-title {
      font-weight: var(--font-weight-bold);
      color: var(--color-primary-400);
      margin-bottom: var(--space-1);
    }

    .guide-steps {
      padding-left: var(--space-4);
      color: var(--color-text-secondary);
      line-height: 1.6;
      margin-bottom: var(--space-2);
    }

    .client-id-input-row {
      display: flex;
      gap: var(--space-2);
    }

    .form-input-sm {
      padding: 6px 10px;
      font-size: 12px;
    }

    /* Demo Quick Access */
    .demo-box {
      margin-top: var(--space-5);
      padding: var(--space-3) var(--space-4);
      background: rgba(15, 23, 42, 0.5);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-md);
      text-align: center;
    }

    .demo-title {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-bottom: var(--space-2);
    }

    .demo-buttons {
      display: flex;
      gap: var(--space-2);
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn-demo-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      padding: 5px 12px;
      font-size: 11px;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }

    .btn-demo-pill:hover {
      background: var(--color-primary-light);
      border-color: var(--color-primary-400);
      color: var(--color-text-primary);
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
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .register-link:hover {
      color: var(--color-primary-300);
    }
  `]
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('googleBtnContainer') googleBtnContainer?: ElementRef<HTMLElement>;

  private auth        = inject(AuthService);
  private googleAuth  = inject(GoogleAuthService);
  private router      = inject(Router);
  private route       = inject(ActivatedRoute);
  private ngZone      = inject(NgZone);

  email         = '';
  password      = '';
  clientIdInput = '';
  showPassword  = signal(false);
  isLoading     = signal(false);
  errorMessage  = signal('');
  successMessage = signal('');
  showSetupGuide = signal(false);
  isClientIdConfigured = signal(false);

  ngOnInit(): void {
    this.isClientIdConfigured.set(this.googleAuth.isClientIdConfigured());
  }

  ngAfterViewInit(): void {
    if (this.isClientIdConfigured() && this.googleBtnContainer?.nativeElement) {
      this.googleAuth.initializeAndRender(this.googleBtnContainer.nativeElement, 'signin_with', (idToken: string) => {
        this.ngZone.run(() => this.handleGoogleToken(idToken, 'CLIENT'));
      });
    }
  }

  loginWithGoogleDemo(role: UserRole = 'CLIENT'): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.googleAuth.loginWithGoogleDemo(role, 'chaima.gadhgadhi@gmail.com').subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.requiresVerification || !res.user?.isVerified) {
          this.router.navigate(['/auth/verify-email'], {
            queryParams: {
              email: res.user?.email || 'chaima.gadhgadhi@gmail.com',
              testOtp: res.testOtp || '123456'
            }
          });
          return;
        }
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        returnUrl ? this.router.navigateByUrl(returnUrl) : this.auth.redirectToDashboard();
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Connexion Google échouée.');
      }
    });
  }

  saveClientId(): void {
    if (!this.clientIdInput || !this.clientIdInput.includes('.apps.googleusercontent.com')) {
      this.errorMessage.set('Client ID invalide. Format attendu: XXXX.apps.googleusercontent.com');
      return;
    }
    localStorage.setItem('snapconnect_google_client_id', this.clientIdInput.trim());
    this.successMessage.set('Client ID Google sauvegardé avec succès');
    this.showSetupGuide.set(false);
    this.isClientIdConfigured.set(true);
    setTimeout(() => {
      if (this.googleBtnContainer?.nativeElement) {
        this.googleAuth.initializeAndRender(this.googleBtnContainer.nativeElement, 'signin_with', (idToken: string) => {
          this.ngZone.run(() => this.handleGoogleToken(idToken, 'CLIENT'));
        });
      }
    }, 200);
  }

  handleGoogleToken(idToken: string, role: UserRole): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.googleAuth.loginWithGoogleToken(idToken, role).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.requiresVerification || !res.user?.isVerified) {
          this.router.navigate(['/auth/verify-email'], {
            queryParams: {
              email: res.user?.email || '',
              testOtp: res.testOtp || '123456'
            }
          });
          return;
        }
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        returnUrl ? this.router.navigateByUrl(returnUrl) : this.auth.redirectToDashboard();
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Connexion Google échouée. Vérifiez votre Client ID Google Cloud Console.');
      }
    });
  }

  fillDemo(email: string): void {
    this.email = email;
    this.password = (email === 'gh@gmail.com') ? '123456' : 'password123';
    this.onSubmit();
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage.set('Veuillez remplir l\'email et le mot de passe.');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        returnUrl ? this.router.navigateByUrl(returnUrl) : this.auth.redirectToDashboard();
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Connexion échouée. Vérifiez vos identifiants.');
      }
    });
  }
}
