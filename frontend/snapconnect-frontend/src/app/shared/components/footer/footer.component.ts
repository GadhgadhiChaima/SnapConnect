import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer-container">
      <div class="footer-inner container">
        <div class="footer-brand">
          <a routerLink="/" class="logo">
            <span class="logo-icon">📸</span> Snap<span class="logo-accent">Connect</span>
          </a>
          <p class="tagline">The premiere marketplace exclusively connecting clients with top mobile smartphone photographers and videographers.</p>
          <div class="badges">
            <span class="badge badge-primary">iPhone 4K / ProRes</span>
            <span class="badge badge-accent">TikTok & Reels</span>
            <span class="badge badge-gold">UGC & Ads</span>
            <span class="badge badge-cyan">Real Estate & Food</span>
          </div>
        </div>

        <div class="footer-cols">
          <div class="col">
            <h4>For Clients</h4>
            <a routerLink="/client/jobs/create">Post a Mobile Job</a>
            <a routerLink="/creators">Browse Mobile Creators</a>
            <a routerLink="/services">Explore Mobile Packages</a>
            <a routerLink="/how-it-works">How Payment Protection Works</a>
          </div>

          <div class="col">
            <h4>For Creators</h4>
            <a routerLink="/jobs">Find Mobile Gigs</a>
            <a routerLink="/creator/services/create">Offer Mobile Services</a>
            <a routerLink="/auth/register">Join as Creator</a>
            <a routerLink="/help">Gear Requirements</a>
          </div>

          <div class="col">
            <h4>Platform</h4>
            <a routerLink="/categories">All Categories</a>
            <a routerLink="/about">About SnapConnect</a>
            <a routerLink="/help">Help & FAQ</a>
            <a routerLink="/contact">Contact Support</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom container">
        <p>© 2026 SnapConnect. Built with Angular 19 & Spring Boot for PFE. Specialized Mobile Marketplace.</p>
        <div class="legal-links">
          <a routerLink="/terms">Terms of Service</a>
          <span>•</span>
          <a routerLink="/privacy">Privacy Policy</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host { display: block; }

    .footer-container {
      background: #090d16;
      border-top: 1px solid var(--color-border);
      margin-top: var(--space-20);
      padding: var(--space-16) var(--space-6) var(--space-8);
    }

    .footer-inner {
      display: grid;
      grid-template-columns: 1.4fr 2fr;
      gap: var(--space-12);
      align-items: start;
    }

    .footer-brand .logo {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-black);
      color: var(--color-text-primary);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }

    .logo-accent {
      background: linear-gradient(135deg, var(--color-primary-400), var(--color-accent-500));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .tagline {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      line-height: var(--line-height-relaxed);
      margin-bottom: var(--space-5);
      max-width: 380px;
    }

    .badges {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .footer-cols {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-8);
    }

    .col h4 {
      color: var(--color-text-primary);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-4);
      letter-spacing: var(--letter-spacing-wide);
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
      transform: translateX(4px);
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

    .legal-links {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .legal-links a {
      color: var(--color-text-muted);
      text-decoration: none;
      transition: color var(--transition-fast);
    }

    .legal-links a:hover {
      color: var(--color-text-primary);
    }

    @media (max-width: 900px) {
      .footer-inner {
        grid-template-columns: 1fr;
        gap: var(--space-8);
      }
      .footer-cols {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .footer-cols {
        grid-template-columns: 1fr;
      }
      .footer-bottom {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {}
