import {
  Component, signal, inject, AfterViewInit, ElementRef, ViewChild, NgZone, OnInit
} from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
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

      <!-- ═══════════════════════════════════════════════════════
           ÉTAPE 1 : WELCOME & CHOIX DU RÔLE (STYLE UPWORK)
           ═══════════════════════════════════════════════════════ -->
      @if (step() === 1) {
        <div class="step1-container animate-fade-in">
          <div class="step1-header">
            <h1 class="step1-title">Bienvenue sur SnapConnect</h1>
            <p class="step1-subtitle">Comment souhaitez-vous utiliser SnapConnect ?</p>
          </div>

          <div class="role-cards-grid">
            <!-- CARTE 1 : CLIENT -->
            <div
              class="upwork-card"
              [class.selected]="selectedRole() === 'CLIENT'"
              (click)="selectRole('CLIENT')"
              role="button"
              tabindex="0"
            >
              <div class="card-radio">
                <div class="radio-indicator"></div>
              </div>

              <div class="card-icon-wrapper client-icon-box">
                <svg width="68" height="68" viewBox="0 0 48 48" fill="none" class="role-svg">
                  <!-- Person head -->
                  <circle cx="19" cy="13" r="5.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
                  <!-- Person torso/shoulders -->
                  <path d="M9 33c0-5.5 4.5-10 10-10 2.2 0 4.2 0.7 5.8 2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
                  <!-- Briefcase -->
                  <rect x="23" y="24" width="18" height="14" rx="2.5" stroke="currentColor" stroke-width="2.2"/>
                  <path d="M29 24v-3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
                  <line x1="23" y1="30" x2="41" y2="30" stroke="currentColor" stroke-width="1.8"/>
                  <rect x="30.5" y="28.5" width="3" height="3" rx="0.5" fill="currentColor"/>
                </svg>
              </div>

              <div class="card-body">
                <h2 class="card-title">
                  Client <span class="arrow">→</span>
                </h2>
                <p class="card-desc">Trouvez des créateurs pour vos besoins en contenu</p>
              </div>
            </div>

            <!-- CARTE 2 : CRÉATEUR -->
            <div
              class="upwork-card"
              [class.selected]="selectedRole() === 'CREATOR'"
              (click)="selectRole('CREATOR')"
              role="button"
              tabindex="0"
            >
              <div class="card-radio">
                <div class="radio-indicator"></div>
              </div>

              <div class="card-icon-wrapper creator-icon-box">
                <svg width="68" height="68" viewBox="0 0 48 48" fill="none" class="role-svg">
                  <!-- Person head -->
                  <circle cx="24" cy="13" r="5.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
                  <!-- Person torso -->
                  <path d="M12 33c0-4.5 3-8.2 7.2-9.4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
                  <path d="M36 33c0-4.5-3-8.2-7.2-9.4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
                  <!-- Laptop/device in front -->
                  <rect x="16" y="24" width="16" height="11" rx="2" stroke="currentColor" stroke-width="2.2"/>
                  <line x1="11" y1="37" x2="37" y2="37" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                  <circle cx="24" cy="29.5" r="1.5" fill="currentColor"/>
                </svg>
              </div>

              <div class="card-body">
                <h2 class="card-title">
                  Créateur <span class="arrow">→</span>
                </h2>
                <p class="card-desc">Proposez vos services et développez votre activité</p>
              </div>
            </div>
          </div>

          <!-- Bouton CTA Étape 1 -->
          <div class="step1-action">
            <button
              type="button"
              (click)="proceedToSignup()"
              class="btn btn-primary btn-lg cta-btn"
            >
              @if (selectedRole() === 'CLIENT') {
                Créer un compte Client
              } @else {
                Postuler en tant que Créateur
              }
            </button>
          </div>

          <!-- Footer Étape 1 -->
          <div class="step1-footer">
            <span>Vous avez déjà un compte ?</span>
            <a routerLink="/auth/login" class="link-primary-bold">Se connecter</a>
          </div>
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════
           ÉTAPE 2 : FORMULAIRE SIGNUP DÉDIÉ (STYLE UPWORK)
           ═══════════════════════════════════════════════════════ -->
      @if (step() === 2) {
        <div class="step2-card card-glass animate-scale-in">
          <!-- Back button to role selection -->
          <button type="button" class="back-link-btn" (click)="goBackToRoleSelection()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Choisir un autre rôle</span>
          </button>

          <div class="auth-header">
            <div class="role-badge">
              @if (selectedRole() === 'CLIENT') {
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                <span>Compte Client</span>
              } @else {
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <circle cx="12" cy="18" r="1"/>
                </svg>
                <span>Compte Créateur</span>
              }
            </div>
            <h2>Créer votre compte</h2>
            <p>
              {{ selectedRole() === 'CLIENT'
                ? 'Trouvez des créateurs pour vos besoins en contenu'
                : 'Proposez vos services et développez votre activité' }}
            </p>
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

          <!-- Google Sign-Up Button (GIS + 1-Click Demo Google Auth) -->
          <div class="google-btn-section">
            @if (isClientIdConfigured()) {
              <div #googleBtnContainer id="google-signup-btn" class="google-btn-container"></div>
            } @else {
              <button
                type="button"
                (click)="signUpWithGoogleDemo()"
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

          <!-- Divider -->
          <div class="auth-divider">
            <span class="divider-line"></span>
            <span class="divider-text">ou</span>
            <span class="divider-line"></span>
          </div>

          <!-- Email Signup Form -->
          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label class="form-label" for="fullName">Prénom et nom</label>
              <input
                type="text"
                id="fullName"
                [(ngModel)]="fullName"
                name="fullName"
                required
                class="form-input"
                placeholder="ex. Alex Dupont"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="email">Adresse e-mail</label>
              <input
                type="email"
                id="email"
                [(ngModel)]="email"
                name="email"
                required
                class="form-input"
                placeholder="alex@exemple.com"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Mot de passe</label>
              <div class="password-input-box">
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  id="password"
                  [(ngModel)]="password"
                  name="password"
                  required
                  minlength="6"
                  class="form-input"
                  placeholder="Minimum 6 caractères"
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

            <div class="checkbox-group">
              <label class="checkbox-label" for="acceptTerms">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  [(ngModel)]="acceptTerms"
                  name="acceptTerms"
                />
                <span>J'accepte les conditions générales et la politique de confidentialité</span>
              </label>
            </div>

            <button type="submit" [disabled]="isLoading()" class="btn btn-primary btn-block btn-lg submit-btn">
              @if (isLoading()) {
                <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: middle; margin-right: 6px;">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"/>
                </svg>
                <span>Création du compte...</span>
              } @else {
                <span>Créer mon compte</span>
              }
            </button>
          </form>

          <div class="auth-footer">
            <span>Déjà un compte ?</span>
            <a routerLink="/auth/login" class="login-link">Se connecter</a>
          </div>
        </div>
      }
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
      width: 600px;
      height: 480px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, rgba(236, 72, 153, 0.08) 50%, transparent 80%);
      filter: blur(80px);
      z-index: 0;
      pointer-events: none;
    }

    /* ── ÉTAPE 1 : WELCOME / CHOIX DU RÔLE (STYLE UPWORK) ── */
    .step1-container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 820px;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-4);
    }

    .step1-header {
      text-align: center;
      margin-bottom: var(--space-8);
    }

    .step1-title {
      font-size: clamp(2rem, 4vw, 2.75rem);
      font-weight: var(--font-weight-extrabold);
      letter-spacing: -0.03em;
      color: var(--color-text-primary);
      margin-bottom: var(--space-2);
    }

    .step1-subtitle {
      font-size: var(--font-size-base);
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-regular);
    }

    .role-cards-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-6);
      width: 100%;
      max-width: 720px;
      margin-bottom: var(--space-8);
    }

    @media (max-width: 640px) {
      .role-cards-grid {
        grid-template-columns: 1fr;
        gap: var(--space-4);
      }
    }

    .upwork-card {
      background: rgba(30, 41, 59, 0.6);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-8) var(--space-6);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      cursor: pointer;
      position: relative;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
    }

    .upwork-card:hover {
      border-color: var(--color-primary-400);
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
    }

    .upwork-card.selected {
      border-color: var(--color-primary-500);
      background: rgba(139, 92, 246, 0.09);
      box-shadow: 0 0 30px var(--color-primary-glow), 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    /* Radio button in top-right of Upwork card */
    .card-radio {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
    }

    .radio-indicator {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid var(--color-text-muted);
      position: relative;
      transition: all var(--transition-fast);
    }

    .upwork-card.selected .radio-indicator {
      border-color: var(--color-primary-500);
      background: var(--color-primary-500);
    }

    .upwork-card.selected .radio-indicator::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #ffffff;
    }

    /* Card Icon Wrapper with subtle tinted gradient */
    .card-icon-wrapper {
      width: 130px;
      height: 130px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-6);
      transition: all var(--transition-base);
    }

    .client-icon-box {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.16) 0%, rgba(99, 102, 241, 0.08) 100%);
      border: 1px solid rgba(139, 92, 246, 0.22);
      color: var(--color-primary-300);
    }

    .creator-icon-box {
      background: linear-gradient(135deg, rgba(236, 72, 153, 0.14) 0%, rgba(139, 92, 246, 0.1) 100%);
      border: 1px solid rgba(236, 72, 153, 0.22);
      color: var(--color-accent-300);
    }

    .upwork-card:hover .card-icon-wrapper {
      transform: scale(1.04);
    }

    .upwork-card.selected .client-icon-box {
      border-color: var(--color-primary-400);
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
    }

    .upwork-card.selected .creator-icon-box {
      border-color: var(--color-accent-400);
      box-shadow: 0 0 20px rgba(236, 72, 153, 0.3);
    }

    .card-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
    }

    .card-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 0;
    }

    .card-title .arrow {
      font-size: 1.1rem;
      transition: transform var(--transition-fast);
      color: var(--color-primary-400);
    }

    .upwork-card:hover .card-title .arrow {
      transform: translateX(4px);
    }

    .card-desc {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: 1.45;
      margin: 0;
      max-width: 240px;
    }

    .step1-action {
      margin-bottom: var(--space-6);
      width: 100%;
      max-width: 320px;
      display: flex;
      justify-content: center;
    }

    .cta-btn {
      width: 100%;
      padding-block: var(--space-3);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      border-radius: var(--radius-full);
      box-shadow: 0 4px 20px var(--color-primary-glow);
    }

    .step1-footer {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .link-primary-bold {
      color: var(--color-primary-400);
      font-weight: var(--font-weight-semibold);
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .link-primary-bold:hover {
      color: var(--color-primary-300);
    }

    /* ── ÉTAPE 2 : FORMULAIRE SIGNUP DÉDIÉ ── */
    .step2-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 480px;
      padding: var(--space-8);
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-border-focus);
    }

    .back-link-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      color: var(--color-text-secondary);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      margin-bottom: var(--space-4);
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
    }

    .back-link-btn:hover {
      color: var(--color-text-primary);
      background: rgba(255, 255, 255, 0.06);
    }

    .auth-header {
      text-align: center;
      margin-bottom: var(--space-6);
    }

    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      background: rgba(139, 92, 246, 0.08);
      border: 1px solid rgba(139, 92, 246, 0.25);
      color: var(--color-primary-300);
      margin-bottom: var(--space-4);
      letter-spacing: 0.02em;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }

    .auth-header h2 {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-extrabold);
      letter-spacing: -0.02em;
      margin-bottom: var(--space-1);
    }

    .auth-header p {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: 1.4;
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

    .guide-steps code {
      background: rgba(139, 92, 246, 0.2);
      padding: 1px 4px;
      border-radius: 4px;
      font-family: monospace;
    }

    .client-id-input-row {
      display: flex;
      gap: var(--space-2);
    }

    .form-input-sm {
      padding: 6px 10px;
      font-size: 12px;
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

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
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

    .checkbox-group {
      margin-top: calc(var(--space-1) * -1);
      margin-bottom: var(--space-1);
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      cursor: pointer;
      line-height: 1.45;
      user-select: none;
    }

    .checkbox-label input[type="checkbox"] {
      width: 16px;
      height: 16px;
      margin-top: 1px;
      accent-color: var(--color-primary-500);
      cursor: pointer;
      flex-shrink: 0;
    }

    .legal-link {
      color: var(--color-primary-400);
      text-decoration: underline;
    }

    .submit-btn {
      border-radius: var(--radius-full);
      padding-block: 12px;
      font-weight: var(--font-weight-bold);
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
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .login-link:hover {
      color: var(--color-primary-300);
    }
  `]
})
export class RegisterComponent implements OnInit, AfterViewInit {
  @ViewChild('googleBtnContainer') googleBtnContainer?: ElementRef<HTMLElement>;

  private auth        = inject(AuthService);
  private googleAuth  = inject(GoogleAuthService);
  private router      = inject(Router);
  private route       = inject(ActivatedRoute);
  private ngZone      = inject(NgZone);

  step          = signal<1 | 2>(1);
  selectedRole  = signal<UserRole>('CLIENT');
  showPassword  = signal(false);

  fullName      = '';
  email         = '';
  password      = '';
  acceptTerms   = false;
  clientIdInput = '';
  isLoading     = signal(false);
  errorMessage  = signal('');
  successMessage = signal('');
  showSetupGuide = signal(false);
  isClientIdConfigured = signal(false);

  ngOnInit(): void {
    this.isClientIdConfigured.set(this.googleAuth.isClientIdConfigured());

    // Check if role is pre-passed in URL (e.g. /auth/register?role=CREATOR)
    const roleParam = this.route.snapshot.queryParams['role'];
    if (roleParam === 'CLIENT' || roleParam === 'CREATOR') {
      this.selectedRole.set(roleParam);
      this.step.set(2);
    }
  }

  ngAfterViewInit(): void {
    if (this.step() === 2) {
      this.initGoogleGIS();
    }
  }

  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
  }

  proceedToSignup(): void {
    this.step.set(2);
    this.errorMessage.set('');
    // Reflect in URL without page reload
    this.router.navigate([], {
      queryParams: { role: this.selectedRole() },
      queryParamsHandling: 'merge'
    });
    setTimeout(() => this.initGoogleGIS(), 100);
  }

  goBackToRoleSelection(): void {
    this.step.set(1);
    this.errorMessage.set('');
    this.router.navigate([], {
      queryParams: { role: null },
      queryParamsHandling: 'merge'
    });
  }

  private initGoogleGIS(): void {
    if (this.isClientIdConfigured() && this.googleBtnContainer?.nativeElement) {
      this.googleAuth.initializeAndRender(this.googleBtnContainer.nativeElement, 'signup_with', (idToken: string) => {
        this.ngZone.run(() => this.handleGoogleToken(idToken));
      });
    }
  }

  signUpWithGoogleDemo(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.googleAuth.loginWithGoogleDemo(this.selectedRole(), 'chaima.gadhgadhi@gmail.com', true).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.requiresVerification || !res.user?.isVerified) {
          this.router.navigate(['/auth/verify-email'], {
            queryParams: {
              email: res.user?.email || 'chaima.gadhgadhi@gmail.com',
              testOtp: res.testOtp || '123456'
            }
          });
        } else {
          this.auth.redirectToDashboard();
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Inscription Google échouée.');
      }
    });
  }

  saveClientId(): void {
    if (!this.clientIdInput || !this.clientIdInput.includes('.apps.googleusercontent.com')) {
      this.errorMessage.set('Client ID invalide. Format: XXXX.apps.googleusercontent.com');
      return;
    }
    localStorage.setItem('snapconnect_google_client_id', this.clientIdInput.trim());
    this.successMessage.set('Client ID sauvegardé avec succès');
    this.showSetupGuide.set(false);
    this.isClientIdConfigured.set(true);
    setTimeout(() => this.initGoogleGIS(), 200);
  }

  handleGoogleToken(idToken: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.googleAuth.loginWithGoogleToken(idToken, this.selectedRole(), true).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.requiresVerification || !res.user?.isVerified) {
          this.router.navigate(['/auth/verify-email'], {
            queryParams: {
              email: res.user?.email || '',
              testOtp: res.testOtp || '123456'
            }
          });
        } else {
          this.auth.redirectToDashboard();
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Inscription Google échouée.');
      }
    });
  }

  onSubmit(): void {
    if (!this.fullName || !this.email || !this.password) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage.set('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (!this.acceptTerms) {
      this.errorMessage.set("Vous devez accepter les Conditions générales d'utilisation et la Politique de confidentialité.");
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
      next: (res) => {
        this.isLoading.set(false);
        if (res.requiresVerification) {
          this.router.navigate(['/auth/verify-email'], {
            queryParams: {
              email: this.email,
              testOtp: res.testOtp || '123456'
            }
          });
        } else {
          this.auth.redirectToDashboard();
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Inscription échouée. Réessayez.');
      }
    });
  }
}
