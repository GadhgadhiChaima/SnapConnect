import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="about-page">
      <div class="container-narrow">
        <div class="page-header text-center">
          <span class="badge badge-primary">Our Mission</span>
          <h1>About SnapConnect</h1>
          <p>Democratizing professional photo and video content through mobile smartphone creators.</p>
        </div>

        <div class="about-content card-glass">
          <h2>The Smartphone Content Revolution</h2>
          <p>
            Today's flagship smartphones (iPhone 16 Pro, Samsung S24 Ultra, Google Pixel 9 Pro) feature cinematic 4K 60fps recording, 10-bit ProRes Log color grading, and studio-grade computational photography.
          </p>
          <p>
            Traditional video production agencies charge thousands of dollars for heavy camera crews and deliver slow turnarounds. Social media algorithms on TikTok, Instagram, and YouTube Shorts prioritize <strong>authentic, fast-paced vertical 9:16 content</strong> that resonates with modern audiences.
          </p>

          <h3>Why We Built SnapConnect</h3>
          <p>
            SnapConnect was created to bridge small businesses, e-commerce stores, restaurants, and real estate professionals with skilled mobile creators who shoot exclusively on smartphones.
          </p>

          <div class="pillars-grid">
            <div class="pillar card">
              <span class="p-icon">⚡</span>
              <h4>Speed</h4>
              <p>Turnarounds in 24h to 48h to ride trending social media audio.</p>
            </div>
            <div class="pillar card">
              <span class="p-icon">💰</span>
              <h4>Affordability</h4>
              <p>Up to 70% cheaper than traditional video agency rates.</p>
            </div>
            <div class="pillar card">
              <span class="p-icon">🔒</span>
              <h4>Escrow Security</h4>
              <p>Payments are protected and only released upon deliverable approval.</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .about-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }

    .text-center { text-align: center; }

    .page-header {
      margin-bottom: var(--space-10);
    }

    .page-header h1 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      margin: var(--space-2) 0;
    }

    .page-header p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
    }

    .about-content {
      padding: var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .about-content h2 {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
    }

    .about-content h3 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      margin-top: var(--space-4);
    }

    .about-content p {
      color: var(--color-text-secondary);
      line-height: var(--line-height-relaxed);
      font-size: var(--font-size-base);
    }

    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--space-4);
      margin-top: var(--space-4);
    }

    .pillar {
      padding: var(--space-5);
      border-radius: var(--radius-lg);
      text-align: center;
    }

    .p-icon {
      font-size: 2rem;
      margin-bottom: var(--space-2);
      display: inline-block;
    }

    .pillar h4 {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-2);
    }

    .pillar p {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      line-height: var(--line-height-normal);
      margin: 0;
    }
  `]
})
export class AboutComponent {}
