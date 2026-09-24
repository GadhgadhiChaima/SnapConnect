import { Component } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="legal-page">
      <div class="container-narrow">
        <div class="page-header text-center">
          <span class="badge badge-neutral">Confidentialité & Données</span>
          <h1>Politique de Confidentialité</h1>
          <p>Dernière mise à jour : Août 2026</p>
        </div>

        <div class="legal-content card-glass">
          <h3>1. Protection des données personnelles</h3>
          <p>SnapConnect s'engage à protéger vos données personnelles conformément aux normes de protection de la vie privée. Nous collectons uniquement les informations nécessaires au fonctionnement de la marketplace, à la sécurisation des paiements par séquestre et à la messagerie entre clients et créateurs.</p>

          <h3>2. Médias téléversés & Hébergement</h3>
          <p>Les fichiers photos et vidéos 4K téléversés dans les espaces de contrat sont chiffrés en transit et hébergés de manière sécurisée. Vous conservez le contrôle total de vos contenus.</p>
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }
    .legal-page { padding-top: calc(var(--navbar-height) + var(--space-8)); padding-bottom: var(--space-20); }
    .text-center { text-align: center; }
    .page-header { margin-bottom: var(--space-8); }
    .page-header h1 { font-size: var(--font-size-3xl); font-weight: var(--font-weight-black); margin: var(--space-2) 0; }
    .page-header p { color: var(--color-text-muted); font-size: var(--font-size-sm); }
    .legal-content { padding: var(--space-8); border-radius: var(--radius-2xl); display: flex; flex-direction: column; gap: var(--space-4); }
    .legal-content h3 { font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); }
    .legal-content p { color: var(--color-text-secondary); line-height: var(--line-height-relaxed); font-size: var(--font-size-sm); }
  `]
})
export class PrivacyComponent {}
