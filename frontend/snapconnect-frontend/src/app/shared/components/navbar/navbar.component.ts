import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LowerCasePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MessageService } from '../../../core/services/message.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LowerCasePipe],
  template: `
    <nav class="navbar" [class.scrolled]="isScrolled()">
      <div class="navbar-inner container">

        <!-- Logo -->
        <a routerLink="/" class="navbar-logo">
          <div class="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="brand-glyph">
              <defs>
                <linearGradient id="scNavGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#c084fc"/>
                  <stop offset="50%" stop-color="#8b5cf6"/>
                  <stop offset="100%" stop-color="#ec4899"/>
                </linearGradient>
                <linearGradient id="scNavGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#f472b6"/>
                  <stop offset="100%" stop-color="#8b5cf6"/>
                </linearGradient>
              </defs>
              <!-- Outer Precision Shutter Ring -->
              <circle cx="12" cy="12" r="9" stroke="url(#scNavGrad)" stroke-width="1.8"/>
              <!-- Dynamic Aperture Blades -->
              <path d="M12 3C15 6 17 9 17 12" stroke="url(#scNavGrad)" stroke-width="1.6" stroke-linecap="round"/>
              <path d="M21 12C18 15 15 17 12 17" stroke="url(#scNavGrad)" stroke-width="1.6" stroke-linecap="round"/>
              <path d="M12 21C9 18 7 15 7 12" stroke="url(#scNavGrad)" stroke-width="1.6" stroke-linecap="round"/>
              <path d="M3 12C6 9 9 7 12 7" stroke="url(#scNavGrad)" stroke-width="1.6" stroke-linecap="round"/>
              <!-- Central Optical Lens Sensor -->
              <circle cx="12" cy="12" r="2.8" fill="url(#scNavGrad2)"/>
              <!-- Micro Flare Sparkle -->
              <circle cx="15.5" cy="8.5" r="0.9" fill="#ffffff" opacity="0.95"/>
            </svg>
          </div>
          <span class="logo-text">Snap<span class="logo-accent">Connect</span></span>
        </a>

        <!-- Center Nav Links -->
        <div class="navbar-links" [class.open]="menuOpen()">
          @if (auth.isAdmin()) {
            <!-- Dedicated Admin Navigation -->
            <a routerLink="/admin/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="closeMenus()" class="nav-link">Tableau de bord</a>
            <a routerLink="/admin/users" routerLinkActive="active" (click)="closeMenus()" class="nav-link">Utilisateurs</a>
            <a routerLink="/admin/jobs" routerLinkActive="active" (click)="closeMenus()" class="nav-link">Briefs</a>
            <a routerLink="/admin/contracts" routerLinkActive="active" (click)="closeMenus()" class="nav-link">Contrats</a>
            <a routerLink="/admin/payments" routerLinkActive="active" (click)="closeMenus()" class="nav-link">Séquestre</a>
            <a routerLink="/admin/reports" routerLinkActive="active" (click)="closeMenus()" class="nav-link">Litiges</a>
          } @else if (auth.isCreator()) {
            <!-- Dedicated Creator Navigation -->
            <a routerLink="/creator/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="closeMenus()" class="nav-link">Accueil</a>
            <a routerLink="/jobs" routerLinkActive="active" (click)="closeMenus()" class="nav-link">Trouver des missions</a>
            <a routerLink="/creator/contracts" routerLinkActive="active" (click)="closeMenus()" class="nav-link">Mes missions</a>
            <a routerLink="/creator/portfolio" routerLinkActive="active" (click)="closeMenus()" class="nav-link">Mon portfolio</a>
            <a routerLink="/creator/messages" routerLinkActive="active" (click)="closeMenus()" class="nav-link nav-link-with-badge">
              <span>Messages</span>
              @if (msgSvc.unreadMessages() > 0) {
                <span class="nav-badge-pill">{{ msgSvc.unreadMessages() }}</span>
              }
            </a>
            <a routerLink="/creator/notifications" routerLinkActive="active" (click)="closeMenus()" class="nav-link nav-link-with-badge">
              <span>Notifications</span>
              @if (notifSvc.unreadNotifications() > 0) {
                <span class="nav-badge-pill">{{ notifSvc.unreadNotifications() }}</span>
              }
            </a>
            <a routerLink="/creator/profile" routerLinkActive="active" (click)="closeMenus()" class="nav-link">Mon profil</a>
          } @else if (auth.isClient()) {
            <!-- Dedicated Client Navigation -->
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="closeMenus()" class="nav-link">Accueil</a>
            <a routerLink="/creators" routerLinkActive="active" (click)="closeMenus()" class="nav-link">Trouver des créateurs</a>
            <a routerLink="/services" routerLinkActive="active" (click)="closeMenus()" class="nav-link">Services</a>
            <a routerLink="/client/jobs" routerLinkActive="active" (click)="closeMenus()" class="nav-link">Mes briefs</a>
            <a routerLink="/client/contracts" routerLinkActive="active" (click)="closeMenus()" class="nav-link">Mes contrats</a>
            <a routerLink="/client/jobs/create" (click)="closeMenus()" class="nav-link nav-link-role">+ Publier une mission</a>
          } @else {
            <!-- Guest / Visitor Navigation -->
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="closeMenus()" class="nav-link">Accueil</a>
            <a routerLink="/creators" routerLinkActive="active" (click)="closeMenus()" class="nav-link">Créateurs</a>
            <a routerLink="/services" routerLinkActive="active" (click)="closeMenus()" class="nav-link">Services</a>
            <a routerLink="/jobs" routerLinkActive="active" (click)="closeMenus()" class="nav-link">Missions</a>
            <a routerLink="/how-it-works" routerLinkActive="active" (click)="closeMenus()" class="nav-link">Comment ça marche</a>
            <a routerLink="/client/jobs/create" (click)="closeMenus()" class="nav-link nav-link-role">Pour les Clients</a>
            <a routerLink="/auth/register" [queryParams]="{ role: 'CREATOR' }" (click)="closeMenus()" class="nav-link nav-link-role">Pour Créateurs</a>
          }
        </div>

        <!-- Right Actions -->
        <div class="navbar-actions">

          @if (auth.isAuthenticated()) {
            @if (!auth.isCreator() && !auth.isAdmin()) {
              <!-- Notifications Bell (pour clients) -->
              <button class="icon-btn" routerLink="/client/notifications" title="Notifications">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                @if (notifSvc.unreadNotifications() > 0) {
                  <span class="badge-dot">{{ notifSvc.unreadNotifications() }}</span>
                }
              </button>

              <!-- Messages (pour clients) -->
              <button class="icon-btn" routerLink="/client/messages" title="Messages">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                @if (msgSvc.unreadMessages() > 0) {
                  <span class="badge-dot">{{ msgSvc.unreadMessages() }}</span>
                }
              </button>
            }

            <!-- User Menu -->
            <div class="user-menu-wrap">
              <button class="user-btn" (click)="toggleUserMenu()">
                <img
                  [src]="getUserAvatar()"
                  [alt]="auth.currentUser()?.fullName || 'User'"
                  class="user-avatar"
                  referrerpolicy="no-referrer"
                  onerror="this.src='https://ui-avatars.com/api/?background=8b5cf6&color=fff&name=U'"
                />
                <span class="user-name hide-mobile">{{ getFirstName() }}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="chevron" [class.rotated]="userMenuOpen()">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              @if (userMenuOpen()) {
                <div class="user-dropdown animate-scale-in">
                  <div class="dropdown-header">
                    <p class="dropdown-name">{{ auth.currentUser()?.fullName }}</p>
                    <p class="dropdown-role">{{ (auth.currentUser()?.role || 'user') | lowercase }}</p>
                  </div>
                  <div class="dropdown-divider"></div>
                  <a [routerLink]="dashboardLink()" class="dropdown-item" (click)="closeMenus()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    Tableau de bord
                  </a>
                  @if (auth.isAdmin()) {
                    <a routerLink="/admin/users" class="dropdown-item" (click)="closeMenus()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      Gestion Utilisateurs
                    </a>
                    <a routerLink="/admin/settings" class="dropdown-item" (click)="closeMenus()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                      Paramètres Plateforme
                    </a>
                  }
                  @if (auth.isCreator()) {
                    <a routerLink="/creator/profile" class="dropdown-item" (click)="closeMenus()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Mon profil
                    </a>
                    <a routerLink="/creator/portfolio" class="dropdown-item" (click)="closeMenus()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                      Mon portfolio
                    </a>
                    <a routerLink="/creator/services" class="dropdown-item" (click)="closeMenus()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      Mes services
                    </a>
                    <a routerLink="/creator/reviews" class="dropdown-item" (click)="closeMenus()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      Avis & Notations
                    </a>
                  }
                  @if (auth.isClient()) {
                    <a routerLink="/client/profile" class="dropdown-item" (click)="closeMenus()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Mon profil
                    </a>
                    <a routerLink="/client/jobs/create" class="dropdown-item" (click)="closeMenus()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                      Publier une mission
                    </a>
                    <a routerLink="/client/reviews" class="dropdown-item" (click)="closeMenus()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      Avis & Notations
                    </a>
                  }
                  <div class="dropdown-divider"></div>
                  <a [routerLink]="auth.isAdmin() ? '/admin/settings' : (auth.isCreator() ? '/creator/settings' : '/client/settings')" class="dropdown-item" (click)="closeMenus()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Paramètres
                  </a>
                  <button class="dropdown-item danger" (click)="logout()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Se déconnecter
                  </button>
                </div>
              }
            </div>

          } @else {
            <!-- Guest Actions -->
            <a routerLink="/auth/login" class="btn btn-ghost btn-sm hide-mobile">Se connecter</a>
            <a routerLink="/auth/register" class="btn btn-primary btn-sm">Commencer</a>
          }

          <!-- Mobile Hamburger -->
          <button class="hamburger" (click)="toggleMenu()" [class.active]="menuOpen()">
            <span></span><span></span><span></span>
          </button>
        </div>

      </div>
    </nav>

    <!-- Backdrop for dropdown -->
    @if (userMenuOpen()) {
      <div class="backdrop" (click)="closeMenus()"></div>
    }
  `,
  styles: [`
    :host { display: block; }

    /* ─── Navbar shell ─── */
    .navbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: var(--z-sticky);
      height: var(--navbar-height);
      background: transparent;
      transition: background var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
      border-bottom: 1px solid transparent;
    }
    .navbar.scrolled {
      background: var(--color-bg-overlay);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom-color: var(--color-border);
      box-shadow: var(--shadow-md);
    }

    .navbar-inner {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-6);
    }

    /* ─── Logo ─── */
    .navbar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      flex-shrink: 0;
    }
    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.16), rgba(236, 72, 153, 0.12));
      border: 1.5px solid rgba(168, 85, 247, 0.35);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(139, 92, 246, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.12);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      flex-shrink: 0;
    }
    .brand-glyph {
      transition: transform 0.4s ease;
    }
    .navbar-logo:hover .logo-icon {
      transform: translateY(-1px) scale(1.04);
      border-color: rgba(236, 72, 153, 0.6);
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.2);
    }
    .navbar-logo:hover .brand-glyph {
      transform: rotate(25deg);
    }
    .logo-text {
      font-size: 21px;
      font-weight: 800;
      color: #f8fafc;
      letter-spacing: -0.025em;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .logo-accent {
      background: linear-gradient(135deg, #c084fc 0%, #ec4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* ─── Nav Links ─── */
    .navbar-links {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }
    .nav-link {
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: color var(--transition-fast), background var(--transition-fast);
    }
    .nav-link:hover, .nav-link.active {
      color: var(--color-text-primary);
      background: rgba(255, 255, 255, 0.06);
    }
    .nav-link.active {
      color: var(--color-primary-400);
    }
    .nav-link-with-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .nav-badge-pill {
      font-size: 10px;
      font-weight: var(--font-weight-bold);
      color: #fff;
      background: var(--color-accent-500);
      border-radius: var(--radius-full);
      padding: 1px 6px;
      line-height: 1.2;
      box-shadow: 0 0 8px rgba(236, 72, 153, 0.5);
    }
    .nav-link-role {
      color: var(--color-primary-300);
      font-weight: var(--font-weight-semibold);
    }
    .nav-link-role:hover {
      color: var(--color-primary-200);
      background: rgba(139, 92, 246, 0.12);
    }

    /* ─── Actions ─── */
    .navbar-actions {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-shrink: 0;
    }

    /* Icon buttons */
    .icon-btn {
      position: relative;
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      background: rgba(255, 255, 255, 0.04);
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .icon-btn:hover {
      background: var(--color-primary-light);
      border-color: var(--color-border-focus);
      color: var(--color-primary-400);
    }
    .badge-dot {
      position: absolute;
      top: 5px; right: 5px;
      min-width: 16px;
      height: 16px;
      background: var(--color-accent-500);
      border-radius: var(--radius-full);
      font-size: 9px;
      font-weight: var(--font-weight-bold);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 3px;
      border: 1.5px solid var(--color-bg-base);
    }

    /* User menu */
    .user-menu-wrap { position: relative; }
    .user-btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-1) var(--space-2) var(--space-1) var(--space-1);
      border-radius: var(--radius-full);
      border: 1px solid var(--color-border);
      background: rgba(255, 255, 255, 0.04);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .user-btn:hover { border-color: var(--color-border-focus); background: var(--color-primary-light); }
    .user-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      object-fit: cover;
      border: 1.5px solid var(--color-primary-500);
    }
    .user-name {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }
    .chevron { color: var(--color-text-muted); transition: transform var(--transition-fast); }
    .chevron.rotated { transform: rotate(180deg); }

    /* Dropdown */
    .user-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      min-width: 220px;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      z-index: var(--z-dropdown);
    }
    .dropdown-header {
      padding: var(--space-4);
      background: linear-gradient(135deg, var(--color-primary-light), var(--color-accent-light));
    }
    .dropdown-name {
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
    }
    .dropdown-role {
      font-size: var(--font-size-xs);
      color: var(--color-primary-400);
      font-weight: var(--font-weight-semibold);
      text-transform: capitalize;
      letter-spacing: var(--letter-spacing-wide);
    }
    .dropdown-divider { height: 1px; background: var(--color-border); }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      text-decoration: none;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      transition: all var(--transition-fast);
    }
    .dropdown-item:hover { background: rgba(255,255,255,0.04); color: var(--color-text-primary); }
    .dropdown-item.danger:hover { color: var(--color-error); background: var(--color-error-light); }

    /* Backdrop */
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: calc(var(--z-dropdown) - 1);
    }

    /* Hamburger */
    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      padding: var(--space-2);
      border-radius: var(--radius-sm);
      cursor: pointer;
    }
    .hamburger span {
      width: 20px; height: 2px;
      background: var(--color-text-secondary);
      border-radius: 2px;
      transition: all var(--transition-fast);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .navbar-links {
        display: none;
        position: fixed;
        top: var(--navbar-height); left: 0; right: 0;
        background: var(--color-bg-surface);
        border-bottom: 1px solid var(--color-border);
        flex-direction: column;
        padding: var(--space-4);
        gap: var(--space-1);
      }
      .navbar-links.open { display: flex; }
      .nav-link { width: 100%; padding: var(--space-3) var(--space-4); }
      .hamburger { display: flex; }
    }
  `]
})
export class NavbarComponent {
  readonly auth     = inject(AuthService);
  readonly notifSvc = inject(NotificationService);
  readonly msgSvc   = inject(MessageService);

  isScrolled   = signal(false);
  menuOpen     = signal(false);
  userMenuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll() { this.isScrolled.set(window.scrollY > 20); }

  toggleMenu()     { this.menuOpen.update(v => !v); }
  toggleUserMenu() { this.userMenuOpen.update(v => !v); }
  closeMenus()     { this.menuOpen.set(false); this.userMenuOpen.set(false); }

  getUserAvatar(): string {
    const user = this.auth.currentUser();
    if (!user) return 'https://ui-avatars.com/api/?background=8b5cf6&color=fff&name=U';
    const dedicated = this.auth.getDedicatedAvatar(user.id, user.email);
    if (dedicated) return dedicated;
    const clean = this.auth.cleanAvatar(user.avatarUrl);
    if (clean) return clean;
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName || 'User') + '&background=8b5cf6&color=fff';
  }

  getFirstName(): string {
    const name = this.auth.currentUser()?.fullName;
    return name ? name.split(' ')[0] : 'Account';
  }

  dashboardLink() {
    const role = this.auth.currentUser()?.role;
    if (role === 'ADMIN')   return '/admin/dashboard';
    if (role === 'CREATOR') return '/creator/dashboard';
    return '/client/dashboard';
  }

  logout() {
    this.closeMenus();
    this.auth.logout();
  }
}
