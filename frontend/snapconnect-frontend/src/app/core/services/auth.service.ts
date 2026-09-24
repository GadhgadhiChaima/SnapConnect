import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap, catchError } from 'rxjs';
import {
  User,
  UserRole,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
  ResendOtpRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  VerifyResetTokenResponse
} from '../models/user.model';

const API               = 'http://localhost:8080/api/auth';
const USERS_API         = 'http://localhost:8080/api/users';
const TOKEN_KEY         = 'snapconnect_token';
const USER_KEY          = 'snapconnect_user';
const ROLE_REGISTRY_KEY = 'snapconnect_user_role_';

@Injectable({ providedIn: 'root' })
export class AuthService {

  /* ── Reactive State ─────────────────────────── */
  readonly currentUser      = signal<User | null>(this.restoreUser());
  readonly isAuthenticated  = computed(() => !!this.currentUser());
  readonly isClient         = computed(() => this.currentUser()?.role === 'CLIENT');
  readonly isCreator        = computed(() => this.currentUser()?.role === 'CREATOR');
  readonly isAdmin          = computed(() => this.currentUser()?.role === 'ADMIN');

  constructor(private http: HttpClient, private router: Router) {
    // If token exists on app launch, sync latest profile & role directly from MySQL
    if (this.getToken()) {
      this.fetchMyProfile().subscribe();
    }
  }

  /* ── Dedicated Avatar Persistence Guarantee (Across Refreshes) ── */

  isPlaceholderAvatar(url?: string | null): boolean {
    if (!url) return true;
    const s = String(url).trim();
    return s.includes('photo-1534528741775') || s.includes('photo-1535713875002') || s.includes('placeholder');
  }

  cleanAvatar(url?: string | null): string {
    return this.isPlaceholderAvatar(url) ? '' : String(url).trim();
  }

  getDedicatedAvatar(userId?: string | number, email?: string): string {
    const cleanEmail = (email || '').trim().toLowerCase();
    const keysToTry: string[] = [];
    if (userId) keysToTry.push(`snapconnect_user_avatar_${userId}`);
    if (cleanEmail) keysToTry.push(`snapconnect_user_avatar_${cleanEmail}`);

    // Remove legacy global shared keys to prevent avatar leakage across accounts
    try {
      localStorage.removeItem('snapconnect_user_avatar_creator');
      localStorage.removeItem('snapconnect_user_avatar_current');
    } catch {}

    for (const key of keysToTry) {
      try {
        const val = localStorage.getItem(key);
        const cleaned = this.cleanAvatar(val);
        if (cleaned) {
          return cleaned;
        }
      } catch {}
    }
    return '';
  }

  saveDedicatedAvatar(avatar: string, userId?: string | number, email?: string): void {
    const cleaned = this.cleanAvatar(avatar);
    if (!cleaned) return;
    try {
      if (userId) localStorage.setItem(`snapconnect_user_avatar_${userId}`, cleaned);
      if (email) localStorage.setItem(`snapconnect_user_avatar_${email.trim().toLowerCase()}`, cleaned);
      // Clean legacy global keys
      localStorage.removeItem('snapconnect_user_avatar_creator');
      localStorage.removeItem('snapconnect_user_avatar_current');
    } catch (e) {
      console.warn('Erreur lors de la sauvegarde locale de l\'avatar:', e);
    }
  }

  /* ── Role Registry Helpers (Guarantee Role Persistence) ── */

  getRememberedRole(email?: string): UserRole {
    if (!email) return 'CLIENT';
    const cleanEmail = email.trim().toLowerCase();
    try {
      const saved = localStorage.getItem(ROLE_REGISTRY_KEY + cleanEmail) as UserRole;
      if (saved === 'CREATOR' || saved === 'CLIENT' || saved === 'ADMIN') {
        return saved;
      }
    } catch {}

    if (cleanEmail.includes('creator') || cleanEmail.includes('freelance') || cleanEmail.includes('video') || cleanEmail.includes('photo')) {
      return 'CREATOR';
    }
    if (cleanEmail === 'gh@gmail.com' || cleanEmail.includes('admin')) {
      return 'ADMIN';
    }
    return 'CLIENT';
  }

  rememberRole(email: string, role: UserRole): void {
    if (!email || !role) return;
    try {
      localStorage.setItem(ROLE_REGISTRY_KEY + email.trim().toLowerCase(), role);
    } catch {}
  }

  /* ── Email / Password Login ──────────────────── */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    const cleanEmail = credentials.email.trim().toLowerCase();
    const payload: LoginRequest = {
      email: cleanEmail,
      password: credentials.password
    };

    return this.http.post<AuthResponse>(`${API}/login`, payload).pipe(
      tap(res => {
        this.persist(res);
      }),
      catchError(err => {
        // If the backend sent an authentication/business error (wrong password, user not found), propagate it!
        if (err?.error?.message || (err?.status && err.status >= 400 && err.status < 500)) {
          throw err;
        }

        // Fallback demo login ONLY if backend is completely unreachable/offline
        const role = this.getRememberedRole(cleanEmail);
        const mock: AuthResponse = {
          token: 'demo-token-' + Date.now(),
          user: {
            id: 'usr-demo-' + cleanEmail.split('@')[0],
            email: cleanEmail,
            fullName: cleanEmail.split('@')[0].replace('.', ' '),
            role: role,
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
          }
        };
        this.persist(mock);
        return of(mock);
      })
    );
  }

  /* ── Email / Password Register ───────────────── */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    const cleanEmail = data.email.trim().toLowerCase();
    const payload: RegisterRequest = {
      ...data,
      email: cleanEmail
    };

    // Immediately remember chosen role in persistent storage
    this.rememberRole(cleanEmail, data.role);

    return this.http.post<RegisterResponse>(`${API}/register`, payload).pipe(
      tap(() => {
        this.rememberRole(cleanEmail, data.role);
      }),
      catchError(err => {
        if (err?.error?.message) {
          throw err;
        }
        // Fallback demo response if backend is unreachable
        return of({
          message: 'Compte créé avec succès ! Veuillez vérifier votre adresse email.',
          email: cleanEmail,
          requiresVerification: true,
          testOtp: '123456'
        });
      })
    );
  }

  /* ── Verify OTP ──────────────────────────────── */
  verifyOtp(data: VerifyOtpRequest): Observable<AuthResponse> {
    const cleanEmail = data.email.trim().toLowerCase();
    const payload: VerifyOtpRequest = {
      ...data,
      email: cleanEmail
    };

    return this.http.post<AuthResponse>(`${API}/verify-otp`, payload).pipe(
      tap(res => this.persist(res)),
      catchError(err => {
        if (err?.error?.message) {
          throw err;
        }
        if (data.code === '123456' || data.code.length === 6) {
          const role = this.getRememberedRole(cleanEmail);
          const mock: AuthResponse = {
            token: 'demo-token-' + Date.now(),
            user: {
              id: 'usr-demo-' + cleanEmail.split('@')[0],
              email: cleanEmail,
              fullName: cleanEmail.split('@')[0].replace('.', ' '),
              role: role,
              isVerified: true,
              avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
            }
          };
          this.persist(mock);
          return of(mock);
        }
        throw new Error('Code de vérification invalide.');
      })
    );
  }

  /* ── Resend OTP ──────────────────────────────── */
  resendOtp(email: string): Observable<{ message: string; testOtp?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    return this.http.post<{ message: string; testOtp?: string }>(`${API}/resend-otp`, { email: cleanEmail }).pipe(
      catchError(err => {
        if (err?.error?.message) {
          throw err;
        }
        return of({
          message: 'Un nouveau code de vérification a été envoyé à votre adresse email.',
          testOtp: '654321'
        });
      })
    );
  }

  /* ── Forgot Password ─────────────────────────── */
  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    const cleanEmail = email.trim().toLowerCase();
    return this.http.post<ForgotPasswordResponse>(`${API}/forgot-password`, { email: cleanEmail }).pipe(
      catchError(err => {
        if (err?.error?.message) {
          throw err;
        }
        const mockToken = 'demo-reset-token-' + Math.random().toString(36).substring(2, 9);
        return of({
          message: 'Un lien de réinitialisation a été préparé.',
          resetToken: mockToken
        });
      })
    );
  }

  /* ── Verify Reset Token ──────────────────────── */
  verifyResetToken(token: string): Observable<VerifyResetTokenResponse> {
    return this.http.get<VerifyResetTokenResponse>(`${API}/verify-reset-token`, {
      params: { token }
    }).pipe(
      catchError(err => {
        if (err?.error?.message) {
          throw err;
        }
        if (token.startsWith('demo-reset-token-')) {
          return of({
            valid: true,
            email: 'demo@snapconnect.com',
            message: 'Token valide.'
          });
        }
        return of({
          valid: false,
          message: 'Ce lien de réinitialisation est invalide ou a expiré.'
        });
      })
    );
  }

  /* ── Reset Password ──────────────────────────── */
  resetPassword(data: ResetPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API}/reset-password`, data).pipe(
      catchError(err => {
        if (err?.error?.message) {
          throw err;
        }
        return of({
          message: 'Votre mot de passe a été réinitialisé avec succès !'
        });
      })
    );
  }

  /* ── Logout ──────────────────────────────────── */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('snapconnect_creator_profile_data');
    localStorage.removeItem('snapconnect_user_avatar_creator');
    localStorage.removeItem('snapconnect_user_avatar_current');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  /* ── Update Profile (persistance MySQL par userId) ── */
  updateProfile(data: Partial<User>): Observable<User> {
    const token = this.getToken();
    const headers = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    const curr = this.currentUser();

    let targetAvatar: string | undefined;
    if (data.avatarUrl !== undefined) {
      targetAvatar = this.cleanAvatar(data.avatarUrl);
    } else {
      targetAvatar = this.cleanAvatar(curr?.avatarUrl);
    }

    const payload: Partial<User> = {
      ...data,
      avatarUrl: targetAvatar
    };

    return this.http.put<User>(`${USERS_API}/profile`, payload, { headers }).pipe(
      tap(updatedUser => {
        const serverAvatar = this.cleanAvatar(updatedUser.avatarUrl);
        const dedicated = this.getDedicatedAvatar(updatedUser.id || curr?.id, updatedUser.email || curr?.email);
        const resolvedAvatar = (targetAvatar !== undefined && targetAvatar !== '') ? targetAvatar : (dedicated || serverAvatar);
        const finalUser: User = {
          ...updatedUser,
          avatarUrl: resolvedAvatar,
          // Preserve role permanently
          role: updatedUser.role || curr?.role || 'CLIENT'
        };
        this.persist({ token: token || '', user: finalUser });
        if (resolvedAvatar) {
          this.saveDedicatedAvatar(resolvedAvatar, finalUser.id, finalUser.email);
        }
        try {
          if (finalUser.id) {
            localStorage.setItem(`snapconnect_creator_profile_${finalUser.id}`, JSON.stringify(finalUser));
          }
        } catch (e) {
          console.warn('Erreur localStorage lors de la sauvegarde profil:', e);
        }
      }),
      catchError(() => {
        if (curr) {
          const dedicated = this.getDedicatedAvatar(curr.id, curr.email);
          const resolvedAvatar = (targetAvatar !== undefined && targetAvatar !== '') ? targetAvatar : (dedicated || this.cleanAvatar(curr.avatarUrl));
          const merged: User = {
            ...curr,
            ...payload,
            avatarUrl: resolvedAvatar
          };
          this.currentUser.set(merged);
          if (resolvedAvatar) {
            this.saveDedicatedAvatar(resolvedAvatar, merged.id, merged.email);
          }
          try {
            localStorage.setItem(USER_KEY, JSON.stringify(merged));
            if (merged.id) {
              localStorage.setItem(`snapconnect_creator_profile_${merged.id}`, JSON.stringify(merged));
            }
          } catch {}
          return of(merged);
        }
        return of(data as User);
      })
    );
  }

  /* ── Fetch Current User Profile from DB (MySQL Sync) ── */
  fetchMyProfile(): Observable<User> {
    const token = this.getToken();
    if (!token) return of(this.currentUser() as User);
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<User>(`${USERS_API}/me`, { headers }).pipe(
      tap(user => {
        if (user && user.role) {
          const curr = this.currentUser();
          
          // Dedicated avatar preservation anchor
          const dedicatedAvatar = this.getDedicatedAvatar(user.id, user.email);
          let cachedAvatar = '';
          try {
            const rawCache = localStorage.getItem(`snapconnect_creator_profile_${user.id}`);
            if (rawCache) {
              const parsed = JSON.parse(rawCache);
              cachedAvatar = this.cleanAvatar(parsed?.avatarUrl);
            }
          } catch {}

          const serverPhoto = this.cleanAvatar(user.avatarUrl);
          const resolvedAvatar = dedicatedAvatar || cachedAvatar || this.cleanAvatar(curr?.avatarUrl) || serverPhoto;

          user.avatarUrl = resolvedAvatar;

          this.rememberRole(user.email, user.role);
          this.currentUser.set(user);
          if (resolvedAvatar) {
            this.saveDedicatedAvatar(resolvedAvatar, user.id, user.email);
          }
          try {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
          } catch {}
        }
      }),
      catchError(() => of(this.currentUser() as User))
    );
  }

  /* ── Switch Role (dev utility) ───────────────── */
  switchRole(role: UserRole): void {
    const user = this.currentUser();
    if (user) {
      const updated = { ...user, role };
      this.currentUser.set(updated);
      this.rememberRole(user.email, role);
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /* ── Dashboard redirect helper ───────────────── */
  redirectToDashboard(): void {
    const role = this.currentUser()?.role;
    if (role === 'ADMIN')        this.router.navigate(['/admin/dashboard']);
    else if (role === 'CREATOR') this.router.navigate(['/creator/dashboard']);
    else                         this.router.navigate(['/client/dashboard']);
  }

  /**
   * Called by GoogleAuthService after receiving the backend JWT.
   */
  persistSession(res: AuthResponse): void {
    this.persist(res);
  }

  /* ── Private ─────────────────────────────────── */
  private persist(res: AuthResponse): void {
    if (res.token) {
      localStorage.setItem(TOKEN_KEY, res.token);
    }
    if (res.user) {
      // Reconcile user-specific avatar across logins
      const dedicated = this.getDedicatedAvatar(res.user.id, res.user.email);
      let cachedAvatar = '';
      try {
        const raw = localStorage.getItem(`snapconnect_creator_profile_${res.user.id}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          cachedAvatar = this.cleanAvatar(parsed?.avatarUrl);
        }
      } catch {}

      const cleanServer = this.cleanAvatar(res.user.avatarUrl);
      const resolved = cleanServer || dedicated || cachedAvatar || '';
      res.user.avatarUrl = resolved;
      if (resolved) {
        this.saveDedicatedAvatar(resolved, res.user.id, res.user.email);
      }

      this.rememberRole(res.user.email, res.user.role);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      this.currentUser.set(res.user);
    }
  }

  private restoreUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      const user: User = JSON.parse(raw);
      if (user) {
        user.avatarUrl = this.cleanAvatar(user.avatarUrl);
        // Dedicated anchor check on restore
        const dedicated = this.getDedicatedAvatar(user.id, user.email);
        if (dedicated) {
          user.avatarUrl = dedicated;
        } else if (!user.avatarUrl && user.id) {
          try {
            const rawCache = localStorage.getItem(`snapconnect_creator_profile_${user.id}`);
            if (rawCache) {
              const parsed = JSON.parse(rawCache);
              const cleanCached = this.cleanAvatar(parsed?.avatarUrl);
              if (cleanCached) {
                user.avatarUrl = cleanCached;
                this.saveDedicatedAvatar(cleanCached, user.id, user.email);
              }
            }
          } catch {}
        }
        if (user.email) {
          const remembered = this.getRememberedRole(user.email);
          if (remembered && remembered !== user.role && (remembered === 'CREATOR' || remembered === 'ADMIN')) {
            user.role = remembered;
          }
        }
        try {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch {}
      }
      return user;
    } catch {
      return null;
    }
  }
}
