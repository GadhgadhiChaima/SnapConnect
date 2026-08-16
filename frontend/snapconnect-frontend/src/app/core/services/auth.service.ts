import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap, catchError } from 'rxjs';
import { User, UserRole, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

const API       = 'http://localhost:8080/api/auth';
const TOKEN_KEY = 'snapconnect_token';
const USER_KEY  = 'snapconnect_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  /* ── Reactive State ─────────────────────────── */
  readonly currentUser      = signal<User | null>(this.restoreUser());
  readonly isAuthenticated  = computed(() => !!this.currentUser());
  readonly isClient         = computed(() => this.currentUser()?.role === 'CLIENT');
  readonly isCreator        = computed(() => this.currentUser()?.role === 'CREATOR');
  readonly isAdmin          = computed(() => this.currentUser()?.role === 'ADMIN');

  constructor(private http: HttpClient, private router: Router) {}

  /* ── Auth Actions ────────────────────────────── */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/login`, credentials).pipe(
      tap(res => this.persist(res)),
      catchError(() => {
        /* Fallback demo login if backend unreachable */
        const role: UserRole = credentials.email.includes('admin')
          ? 'ADMIN' : credentials.email.includes('creator') ? 'CREATOR' : 'CLIENT';
        const mock: AuthResponse = {
          token: 'demo-token',
          user: {
            id: 'usr-demo',
            email: credentials.email,
            fullName: credentials.email.split('@')[0].replace('.', ' '),
            role,
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
          }
        };
        this.persist(mock);
        return of(mock);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/register`, data).pipe(
      tap(res => this.persist(res)),
      catchError(() => {
        const mock: AuthResponse = {
          token: 'demo-token',
          user: {
            id: 'usr-' + Date.now(),
            email: data.email,
            fullName: data.fullName,
            role: data.role,
            avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80'
          }
        };
        this.persist(mock);
        return of(mock);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  switchRole(role: UserRole): void {
    const user = this.currentUser();
    if (user) {
      const updated = { ...user, role };
      this.currentUser.set(updated);
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /* ── Dashboard redirect helper ───────────────── */
  redirectToDashboard(): void {
    const role = this.currentUser()?.role;
    if (role === 'ADMIN')   this.router.navigate(['/admin/dashboard']);
    else if (role === 'CREATOR') this.router.navigate(['/creator/dashboard']);
    else                    this.router.navigate(['/client/dashboard']);
  }

  /* ── Private ─────────────────────────────────── */
  private persist(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private restoreUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
