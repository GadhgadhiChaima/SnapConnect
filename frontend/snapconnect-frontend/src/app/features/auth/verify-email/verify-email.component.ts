import {
  Component, signal, inject, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList
} from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="auth-page">
      <div class="auth-glow"></div>

      <div class="auth-card card-glass animate-scale-in">
        <div class="auth-header">
          <div class="auth-logo-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="auth-mail-svg">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <h2>Vérification de votre adresse e-mail</h2>
          <p class="auth-subtitle">
            Un code de vérification a été envoyé à votre adresse e-mail.
          </p>
          <div class="email-badge">
            <strong>{{ email() || 'votre adresse e-mail' }}</strong>
          </div>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-error animate-scale-in">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="alert-svg">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        @if (successMessage()) {
          <div class="alert alert-success animate-scale-in">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="alert-svg">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{{ successMessage() }}</span>
          </div>
        }

        <p class="otp-instruction-label">Saisissez le code</p>

        <!-- OTP 6-Digit Interactive Inputs -->
        <div class="otp-container">
          @for (digit of otpDigits; track $index) {
            <input
              #otpInput
              type="text"
              inputmode="numeric"
              maxlength="1"
              autocomplete="one-time-code"
              class="otp-cell"
              [class.filled]="digit.length > 0"
              [class.error]="errorMessage().length > 0"
              [value]="digit"
              (input)="onInput($index, $event)"
              (keydown)="onKeyDown($index, $event)"
              (paste)="onPaste($event)"
            />
          }
        </div>

        <!-- Verify Button -->
        <button
          type="button"
          (click)="onVerify()"
          [disabled]="isLoading() || !isOtpComplete()"
          class="btn btn-primary btn-block btn-lg verify-btn"
        >
          @if (isLoading()) {
            <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: middle; margin-right: 6px;">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"/>
            </svg>
            <span>Vérification en cours...</span>
          } @else {
            <span>Vérifier</span>
          }
        </button>

        <!-- Resend Code Section -->
        <div class="resend-section">
          <p class="resend-text">Vous n'avez pas reçu le code ?</p>
          @if (cooldownSeconds() > 0) {
            <button type="button" class="btn-resend disabled" disabled>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px;">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Renvoyer le code ({{ cooldownSeconds() }}s)
            </button>
          } @else {
            <button
              type="button"
              (click)="onResend()"
              [disabled]="isResending()"
              class="btn-resend active"
            >
              @if (isResending()) {
                <span>Envoi...</span>
              } @else {
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px;">
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Renvoyer le code
              }
            </button>
          }
        </div>

        <!-- Sandbox Helper Banner -->
        @if (testOtp()) {
          <div class="demo-otp-banner animate-scale-in">
            <div class="demo-otp-info">
              <span class="demo-tag">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: -1px; margin-right: 4px;">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l1.06-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Environnement de test
              </span>
              <span>Code envoyé à l'email — Pour les tests : <strong>{{ testOtp() }}</strong></span>
            </div>
            <button type="button" (click)="fillTestOtp()" class="btn btn-secondary btn-xs">
              Utiliser ce code
            </button>
          </div>
        }

        <div class="auth-footer">
          <span>Mauvaise adresse e-mail ?</span>
          <a routerLink="/auth/register" class="register-link">Recommencer l'inscription</a>
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
      max-width: 490px;
      padding: var(--space-8);
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-border-focus);
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
    }

    .auth-header {
      text-align: center;
      margin-bottom: var(--space-6);
    }

    .auth-logo-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(139, 92, 246, 0.15);
      border: 1px solid rgba(139, 92, 246, 0.3);
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
      margin-bottom: var(--space-3);
    }
    .auth-mail-svg {
      color: var(--color-primary-400);
    }
    .alert-svg {
      flex-shrink: 0;
    }

    .auth-header h2 {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-extrabold);
      color: var(--color-text-primary);
      margin-bottom: var(--space-2);
    }

    .auth-subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-2);
    }

    .email-badge {
      display: inline-block;
      background: rgba(139, 92, 246, 0.12);
      border: 1px solid rgba(139, 92, 246, 0.25);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--font-size-sm);
      color: var(--color-primary-400);
      word-break: break-all;
    }

    /* OTP Cells */
    .otp-container {
      display: flex;
      justify-content: center;
      gap: var(--space-2);
      margin: var(--space-6) 0 var(--space-5);
    }

    .otp-cell {
      width: 52px;
      height: 60px;
      border-radius: var(--radius-lg);
      background: rgba(15, 23, 42, 0.7);
      border: 2px solid var(--color-border);
      color: var(--color-text-primary);
      font-size: 1.5rem;
      font-weight: var(--font-weight-bold);
      text-align: center;
      outline: none;
      transition: all var(--transition-fast);
      caret-color: var(--color-primary-400);
    }

    .otp-cell:focus {
      border-color: var(--color-primary-500);
      box-shadow: 0 0 16px var(--color-primary-glow);
      transform: translateY(-2px);
    }

    .otp-cell.filled {
      border-color: rgba(139, 92, 246, 0.5);
      background: rgba(139, 92, 246, 0.08);
    }

    .otp-cell.error {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.05);
    }

    .verify-btn {
      margin-top: var(--space-2);
      font-weight: var(--font-weight-bold);
    }

    /* Resend Section */
    .resend-section {
      text-align: center;
      margin-top: var(--space-5);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-1);
    }

    .resend-text {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .btn-resend {
      background: none;
      border: none;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
    }

    .btn-resend.active {
      color: var(--color-primary-400);
    }
    .btn-resend.active:hover {
      text-decoration: underline;
      color: var(--color-primary-300);
    }

    .btn-resend.disabled {
      color: var(--color-text-muted);
      cursor: not-allowed;
    }

    /* Demo OTP Banner */
    .demo-otp-banner {
      margin-top: var(--space-5);
      padding: var(--space-3) var(--space-4);
      background: rgba(139, 92, 246, 0.1);
      border: 1px dashed rgba(139, 92, 246, 0.35);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
    }

    .demo-otp-info {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .demo-tag {
      font-weight: var(--font-weight-bold);
      color: var(--color-primary-400);
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

    @media (max-width: 480px) {
      .otp-container { gap: 6px; }
      .otp-cell { width: 44px; height: 52px; font-size: 1.25rem; }
    }
  `]
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  @ViewChildren('otpInput') otpInputElements!: QueryList<ElementRef<HTMLInputElement>>;

  private auth   = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  email           = signal('');
  otpDigits       = ['', '', '', '', '', ''];
  isLoading       = signal(false);
  isResending     = signal(false);
  errorMessage    = signal('');
  successMessage  = signal('');
  testOtp         = signal('');
  cooldownSeconds = signal(0);

  private timerInterval: any = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email.set(params['email']);
      }
      if (params['testOtp']) {
        this.testOtp.set(params['testOtp']);
      } else {
        // Fallback test OTP for dev testing
        this.testOtp.set('123456');
      }
    });

    // Auto-focus first input after render
    setTimeout(() => this.focusInput(0), 150);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  isOtpComplete(): boolean {
    return this.otpDigits.every(d => d.trim().length === 1);
  }

  getOtpCode(): string {
    return this.otpDigits.join('');
  }

  onInput(index: number, event: any): void {
    this.errorMessage.set('');
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '');

    if (val.length === 0) {
      this.otpDigits[index] = '';
      input.value = '';
      return;
    }

    if (val.length === 1) {
      this.otpDigits[index] = val;
      input.value = val;
      if (index < 5) {
        this.focusInput(index + 1);
      }
    } else {
      // Multiple chars typed or auto-filled
      this.distributeDigits(val, index);
    }

    if (this.isOtpComplete()) {
      this.onVerify();
    }
  }

  onKeyDown(index: number, event: KeyboardEvent): void {
    const inputs = this.otpInputElements?.toArray();
    if (event.key === 'Backspace') {
      if (!this.otpDigits[index] && index > 0) {
        this.otpDigits[index - 1] = '';
        if (inputs && inputs[index - 1]) {
          inputs[index - 1].nativeElement.value = '';
        }
        this.focusInput(index - 1);
        event.preventDefault();
      } else {
        this.otpDigits[index] = '';
        if (inputs && inputs[index]) {
          inputs[index].nativeElement.value = '';
        }
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.focusInput(index - 1);
    } else if (event.key === 'ArrowRight' && index < 5) {
      this.focusInput(index + 1);
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') || '';
    const digitsOnly = pasted.replace(/\D/g, '').slice(0, 6);
    if (digitsOnly.length > 0) {
      this.distributeDigits(digitsOnly, 0);
      if (this.isOtpComplete()) {
        this.onVerify();
      }
    }
  }

  distributeDigits(str: string, startIndex = 0): void {
    const chars = str.split('');
    const newDigits = [...this.otpDigits];
    const inputs = this.otpInputElements?.toArray();

    for (let i = 0; i < chars.length && startIndex + i < 6; i++) {
      newDigits[startIndex + i] = chars[i];
      if (inputs && inputs[startIndex + i]) {
        inputs[startIndex + i].nativeElement.value = chars[i];
      }
    }
    this.otpDigits = newDigits;
    const nextIdx = Math.min(startIndex + chars.length, 5);
    this.focusInput(nextIdx);
  }

  focusInput(index: number): void {
    const arr = this.otpInputElements?.toArray();
    if (arr && arr[index]) {
      arr[index].nativeElement.focus();
      arr[index].nativeElement.select();
    }
  }

  fillTestOtp(): void {
    const code = this.testOtp();
    if (code && code.length === 6) {
      this.distributeDigits(code, 0);
      setTimeout(() => this.onVerify(), 100);
    }
  }

  onVerify(): void {
    const code = this.getOtpCode();
    const email = this.email();

    if (!email) {
      this.errorMessage.set('Adresse email introuvable. Veuillez recommencer.');
      return;
    }

    if (code.length !== 6) {
      this.errorMessage.set('Veuillez saisir les 6 chiffres du code de vérification.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.auth.verifyOtp({ email, code }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set('Email vérifié avec succès ! Redirection en cours...');
        setTimeout(() => {
          if (res.user?.role === 'CREATOR') {
            this.router.navigate(['/onboarding/creator']);
          } else {
            this.auth.redirectToDashboard();
          }
        }, 600);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Code de vérification invalide ou expiré.');
      }
    });
  }

  onResend(): void {
    const email = this.email();
    if (!email) {
      this.errorMessage.set('Adresse email introuvable.');
      return;
    }

    this.isResending.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.auth.resendOtp(email).subscribe({
      next: (res) => {
        this.isResending.set(false);
        this.successMessage.set(res.message || 'Un nouveau code a été envoyé !');
        if (res.testOtp) {
          this.testOtp.set(res.testOtp);
        }
        this.startCooldown(60);
      },
      error: (err: any) => {
        this.isResending.set(false);
        this.errorMessage.set(err?.error?.message || 'Impossible de renvoyer le code pour le moment.');
      }
    });
  }

  startCooldown(seconds: number): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.cooldownSeconds.set(seconds);
    this.timerInterval = setInterval(() => {
      const curr = this.cooldownSeconds();
      if (curr <= 1) {
        clearInterval(this.timerInterval);
        this.cooldownSeconds.set(0);
      } else {
        this.cooldownSeconds.set(curr - 1);
      }
    }, 1000);
  }
}
