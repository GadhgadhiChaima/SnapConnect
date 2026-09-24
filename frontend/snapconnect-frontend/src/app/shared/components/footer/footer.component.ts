import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer-container">
      <div class="footer-inner container">
        <!-- Brand Summary Column -->
        <div class="footer-brand">
          <a routerLink="/" class="logo">
            <div class="logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="brand-glyph">
                <defs>
                  <linearGradient id="scFooterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#c084fc"/>
                    <stop offset="50%" stop-color="#8b5cf6"/>
                    <stop offset="100%" stop-color="#ec4899"/>
                  </linearGradient>
                  <linearGradient id="scFooterGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#f472b6"/>
                    <stop offset="100%" stop-color="#8b5cf6"/>
                  </linearGradient>
                </defs>
                <!-- Outer Precision Shutter Ring -->
                <circle cx="12" cy="12" r="9" stroke="url(#scFooterGrad)" stroke-width="1.8"/>
                <!-- Dynamic Aperture Blades -->
                <path d="M12 3C15 6 17 9 17 12" stroke="url(#scFooterGrad)" stroke-width="1.6" stroke-linecap="round"/>
                <path d="M21 12C18 15 15 17 12 17" stroke="url(#scFooterGrad)" stroke-width="1.6" stroke-linecap="round"/>
                <path d="M12 21C9 18 7 15 7 12" stroke="url(#scFooterGrad)" stroke-width="1.6" stroke-linecap="round"/>
                <path d="M3 12C6 9 9 7 12 7" stroke="url(#scFooterGrad)" stroke-width="1.6" stroke-linecap="round"/>
                <!-- Central Optical Lens Sensor -->
                <circle cx="12" cy="12" r="2.8" fill="url(#scFooterGrad2)"/>
                <!-- Micro Flare Sparkle -->
                <circle cx="15.5" cy="8.5" r="0.9" fill="#ffffff" opacity="0.95"/>
              </svg>
            </div>
            <span class="logo-text">Snap<span class="logo-accent">Connect</span></span>
          </a>
          <p class="tagline">
            La 1ère marketplace en Tunisie dédiée exclusivement aux créateurs de contenu sur smartphone (iPhone 4K/ProRes, Galaxy Ultra).
          </p>
          <div class="badges">
            <span class="footer-badge">
              <svg class="badge-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
              100% Smartphone
            </span>
            <span class="footer-badge">
              <svg class="badge-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Séquestre Garanti
            </span>
            <span class="footer-badge">
              <svg class="badge-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Made in Tunisia
            </span>
          </div>
        </div>

        <!-- Links Columns -->
        <div class="footer-cols">
          <div class="col">
            <h4>Pour les Clients</h4>
            <a routerLink="/client/jobs/create">Publier un brief</a>
            <a routerLink="/creators">Trouver des créateurs</a>
            <a routerLink="/services">Catalogue de packages</a>
            <a routerLink="/how-it-works">Garantie séquestre</a>
            <a routerLink="/categories">Spécialités par secteur</a>
          </div>

          <div class="col">
            <h4>Pour les Créateurs</h4>
            <a routerLink="/jobs">Missions & Opportunités</a>
            <a routerLink="/creator/services">Vendre mes packages</a>
            <a routerLink="/auth/register" [queryParams]="{ role: 'CREATOR' }">Postuler comme créateur</a>
            <a routerLink="/how-it-works">Fonctionnement des paiements</a>
            <a routerLink="/help">Smartphones recommandés</a>
          </div>

          <div class="col">
            <h4>Ressources</h4>
            <a routerLink="/categories">Toutes les catégories</a>
            <a routerLink="/how-it-works">Comment ça marche</a>
            <a routerLink="/help">Centre d'aide & FAQ</a>
            <a routerLink="/contact">Support & Contact</a>
          </div>

          <div class="col">
            <h4>Société & Légal</h4>
            <a routerLink="/about">À propos de SnapConnect</a>
            <a routerLink="/terms">Conditions Générales</a>
            <a routerLink="/privacy">Politique de Confidentialité</a>
            <a routerLink="/contact">Partenariats B2B</a>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom container">
        <div class="social-row">
          <span class="social-label">Suivez-nous :</span>
          <div class="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener" class="social-link" title="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener" class="social-link" title="TikTok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener" class="social-link" title="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener" class="social-link" title="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
          </div>
        </div>

        <div class="bottom-copy">
          <p>© 2026 SnapConnect Tunisia. Plateforme dédiée aux créateurs de contenu sur smartphone.</p>
        </div>

        <div class="legal-links">
          <a routerLink="/terms">Conditions Générales</a>
          <span class="sep">•</span>
          <a routerLink="/privacy">Confidentialité</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host { display: block; }

    .footer-container {
      background: #080c14;
      border-top: 1px solid var(--color-border);
      margin-top: var(--space-20);
      padding: var(--space-16) var(--space-6) var(--space-8);
      position: relative;
      z-index: 1;
    }

    .footer-inner {
      display: grid;
      grid-template-columns: 1.2fr 2.4fr;
      gap: var(--space-12);
      align-items: start;
    }

    .footer-brand .logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      margin-bottom: var(--space-4);
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

    .footer-brand .logo:hover .logo-icon {
      transform: translateY(-1px) scale(1.04);
      border-color: rgba(236, 72, 153, 0.6);
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.2);
    }

    .footer-brand .logo:hover .brand-glyph {
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

    .tagline {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      line-height: var(--line-height-relaxed);
      margin-bottom: var(--space-5);
      max-width: 360px;
    }

    .badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .footer-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: 11.5px;
      font-weight: 500;
      padding: 5px 12px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-full);
      color: var(--color-text-secondary);
      letter-spacing: 0.01em;
      transition: all var(--transition-fast);
    }

    .footer-badge:hover {
      background: rgba(139, 92, 246, 0.1);
      border-color: rgba(139, 92, 246, 0.35);
      color: var(--color-text-primary);
      transform: translateY(-1px);
    }

    .footer-badge .badge-icon {
      color: var(--color-primary-400);
      flex-shrink: 0;
    }

    .footer-cols {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-6);
    }

    .col h4 {
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-4);
      letter-spacing: 0.02em;
    }

    .col a {
      display: block;
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      margin-bottom: var(--space-3);
      text-decoration: none;
      transition: color var(--transition-fast), transform var(--transition-fast);
    }

    .col a:hover {
      color: var(--color-primary-400);
      transform: translateX(3px);
    }

    .footer-bottom {
      margin-top: var(--space-12);
      padding-top: var(--space-6);
      border-top: 1px solid var(--color-border-subtle);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-4);
      color: var(--color-text-muted);
      font-size: var(--font-size-xs);
    }

    .social-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .social-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .social-icons {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .social-link {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--color-border);
      transition: all var(--transition-fast);
      text-decoration: none;
    }

    .social-link:hover {
      color: var(--color-primary-400);
      border-color: var(--color-primary-400);
      background: var(--color-primary-light);
      transform: translateY(-2px);
    }

    .bottom-copy p {
      margin: 0;
      color: var(--color-text-muted);
    }

    .legal-links {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .legal-links a {
      color: var(--color-text-muted);
      text-decoration: none;
      transition: color var(--transition-fast);
    }

    .legal-links a:hover {
      color: var(--color-text-primary);
    }

    .sep {
      color: var(--color-border);
    }

    @media (max-width: 1024px) {
      .footer-inner {
        grid-template-columns: 1fr;
        gap: var(--space-8);
      }
      .footer-cols {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-8);
      }
    }

    @media (max-width: 600px) {
      .footer-cols {
        grid-template-columns: 1fr;
      }
      .footer-bottom {
        flex-direction: column;
        text-align: center;
        gap: var(--space-3);
      }
    }
  `]
})
export class FooterComponent {}
