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
          <span class="badge badge-primary">Notre Mission</span>
          <h1>À propos de SnapConnect</h1>
          <p>Démocratiser la création de contenu photo et vidéo professionnel grâce aux créateurs sur smartphones.</p>
        </div>

        <div class="about-content card-glass">
          <h2>La Révolution du Contenu Smartphone</h2>
          <p>
            Les smartphones d'aujourd'hui (iPhone 16 Pro Max, Samsung Galaxy S24 Ultra, Pixel 9 Pro) intègrent des capacités d'enregistrement 4K 60fps cinématiques, le profil couleur 10-bit ProRes Log et une photographie computationnelle de niveau studio.
          </p>
          <p>
            Les agences de production traditionnelles facturent des milliers de dinars pour des équipes lourdes avec des délais de livraison de plusieurs semaines. Les algorithmes actuels sur TikTok, Instagram et YouTube Shorts privilégient <strong>un contenu vertical 9:16 authentique, réactif et percutant</strong> qui engage réellement les communautés.
          </p>

          <h3>Pourquoi SnapConnect ?</h3>
          <p>
            SnapConnect a été conçue pour connecter les entreprises, marques e-commerce, restaurants et agences avec les meilleurs créateurs mobiles indépendants équipés de smartphones haute performance.
          </p>

          <div class="pillars-grid">
            <div class="pillar card">
              <span class="p-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-primary-400);">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </span>
              <h4>Rapidité</h4>
              <p>Livrables en 24h à 48h pour surfer instantanément sur les tendances sociales.</p>
            </div>
            <div class="pillar card">
              <span class="p-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-primary-400);">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </span>
              <h4>Accessibilité</h4>
              <p>Des tarifs transparents et compétitifs, sans frais d'intermédiaires superflus.</p>
            </div>
            <div class="pillar card">
              <span class="p-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-primary-400);">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <h4>Séquestre Garanti</h4>
              <p>Fonds sécurisés sur un compte séquestre et libérés uniquement après validation des fichiers 4K.</p>
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
