import { Component } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="legal-page">
      <div class="container-narrow">
        <div class="page-header text-center">
          <span class="badge badge-neutral">Mentions Légales</span>
          <h1>Conditions Générales d'Utilisation</h1>
          <p>Dernière mise à jour : Août 2026</p>
        </div>

        <div class="legal-content card-glass">
          <h3>1. Objet de la plateforme</h3>
          <p>SnapConnect est une plateforme spécialisée connectant les clients (marques, entreprises, commerces) recherchant des prestations photo et vidéo mobiles avec des créateurs indépendants équipés de smartphones haute performance.</p>

          <h3>2. Séquestre & Paiements</h3>
          <p>Toutes les transactions sur SnapConnect sont régies par notre dispositif de séquestre sécurisé. Les fonds sont bloqués avant le début du tournage et ne sont libérés au créateur qu'après validation explicite des livrables par le client.</p>

          <h3>3. Propriété intellectuelle & Droits d'exploitation</h3>
          <p>Dès la libération définitive des fonds, l'intégralité des droits d'exploitation commerciale des fichiers photos et vidéos 4K est cédée au client, sauf disposition contraire convenue dans le contrat de mission.</p>
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
export class TermsComponent {}
