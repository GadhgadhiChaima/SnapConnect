import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { UserRole, AuthResponse } from '../models/user.model';

declare const google: any;

const BACKEND_GOOGLE_URL = 'http://localhost:8080/api/auth/google';

/**
 * GoogleAuthService — Additional Google OAuth 2.0 Provider
 */
@Injectable({ providedIn: 'root' })
export class GoogleAuthService {

  private authService = inject(AuthService);
  private http        = inject(HttpClient);

  /** Tracks whether GIS has already been initialized for the current clientId */
  private _initializedClientId: string | null = null;

  // ──────────────────────────────────────────────────────────────
  // Client ID Configuration
  // ──────────────────────────────────────────────────────────────

  get googleClientId(): string {
    return localStorage.getItem('snapconnect_google_client_id') || '';
  }

  isClientIdConfigured(): boolean {
    const id = this.googleClientId;
    return id.length > 0 && id.includes('.apps.googleusercontent.com') && !id.startsWith('YOUR');
  }

  // ──────────────────────────────────────────────────────────────
  // GIS Initialization & Rendering
  // ──────────────────────────────────────────────────────────────

  /**
   * Initializes GIS with the configured client ID.
   * Calls `callback` with the Google id_token when sign-in completes.
   */
  initialize(callback: (idToken: string) => void): void {
    if (typeof google === 'undefined' || !google?.accounts?.id) {
      console.warn('[GoogleAuthService] Google Identity Services script not loaded.');
      return;
    }
    if (!this.isClientIdConfigured()) {
      console.warn('[GoogleAuthService] Google Client ID not configured.');
      return;
    }

    google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: (response: { credential: string }) => {
        callback(response.credential);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }

  /**
   * Renders the official Google Sign-In button inside the given element.
   */
  renderButton(
    element: HTMLElement,
    text: 'signin_with' | 'signup_with' | 'continue_with' = 'continue_with'
  ): void {
    if (typeof google === 'undefined' || !google?.accounts?.id) {
      return;
    }
    google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      text: text,
      shape: 'rectangular',
      logo_alignment: 'left',
      width: element.offsetWidth || 380,
    });
  }

  /**
   * Robust initializer that waits for Google GIS script to load and renders the button.
   */
  initializeAndRender(
    element: HTMLElement,
    text: 'signin_with' | 'signup_with' | 'continue_with' = 'continue_with',
    callback: (idToken: string) => void
  ): void {
    if (!this.isClientIdConfigured()) return;

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (typeof google !== 'undefined' && google?.accounts?.id) {
        clearInterval(interval);
        try {
          const currentClientId = this.googleClientId;
          // Only call initialize() once per client ID — prevents [GSI_LOGGER] duplicate warning
          if (this._initializedClientId !== currentClientId) {
            google.accounts.id.initialize({
              client_id: currentClientId,
              callback: (response: { credential: string }) => {
                callback(response.credential);
              },
              auto_select: false,
              cancel_on_tap_outside: true,
            });
            this._initializedClientId = currentClientId;
          }
          google.accounts.id.renderButton(element, {
            theme: 'outline',
            size: 'large',
            text: text,
            shape: 'rectangular',
            logo_alignment: 'left',
            width: element.offsetWidth || 380,
          });
        } catch (e) {
          console.warn('[GoogleAuthService] Error rendering GIS button:', e);
        }
      } else if (attempts >= 30) {
        clearInterval(interval);
        console.warn('[GoogleAuthService] Google Identity Services script load timed out.');
      }
    }, 100);
  }

  // ──────────────────────────────────────────────────────────────
  // Backend Integration — POST /api/auth/google & Demo Login
  // ──────────────────────────────────────────────────────────────

  loginWithGoogleToken(
    idToken: string,
    role: UserRole = 'CLIENT',
    isRegistration = false
  ): Observable<AuthResponse> {
    const claims = this.parseGoogleJwt(idToken);
    const avatarUrl = claims?.picture || '';
    const fullName  = claims?.name || '';

    return this.http.post<AuthResponse>(BACKEND_GOOGLE_URL, {
      idToken,
      role,
      avatarUrl,
      fullName,
      isRegistration
    }).pipe(
      tap(res => {
        if (!res.requiresVerification && res.user?.isVerified) {
          this.authService.persistSession(res);
        }
      }),
      catchError(err => {
        if (err?.error?.message) {
          throw err;
        }
        return this.loginWithGoogleDemo(role, claims?.email || 'google.user@snapconnect.tn', isRegistration);
      })
    );
  }

  /**
   * 1-Click Instant Google Sign-In for testing without needing Google Cloud credentials.
   * Calls the backend to create the unverified user and OTP in database.
   */
  loginWithGoogleDemo(
    role: UserRole = 'CLIENT',
    email = 'chaima.gadhgadhi@gmail.com',
    isRegistration = false
  ): Observable<AuthResponse> {
    const effectiveRole = (!isRegistration && role === 'CLIENT')
      ? this.authService.getRememberedRole(email)
      : role;

    const demoToken = `demo-google-token:${email}`;
    return this.http.post<AuthResponse>(BACKEND_GOOGLE_URL, {
      idToken: demoToken,
      role: effectiveRole,
      isRegistration
    }).pipe(
      tap(res => {
        if (!res.requiresVerification && res.user?.isVerified) {
          this.authService.persistSession(res);
        }
      }),
      catchError(() => {
        // Pure frontend fallback if backend is unreachable: OTP required
        const mockGoogleUser: AuthResponse = {
          token: '',
          requiresVerification: true,
          testOtp: '123456',
          user: {
            id: 'usr-google-' + Date.now(),
            email: email,
            fullName: email.includes('chaima') ? 'Chaima Gadhgadhi' : 'Utilisateur Google',
            role: effectiveRole,
            isVerified: false,
            isActive: true,
            avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocJx9o23H2SPwtIzl4Tf9j8uMQa_zy7sh3Y3dUWJYwqgtsNXGaWooA=s96-c'
          }
        };
        return of(mockGoogleUser);
      })
    );
  }

  private parseGoogleJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
}
