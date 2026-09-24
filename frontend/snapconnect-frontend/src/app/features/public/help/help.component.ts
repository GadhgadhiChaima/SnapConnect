import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="help-page">
      <div class="container-narrow">
        <div class="page-header text-center">
          <span class="badge badge-primary">Support & FAQ</span>
          <h1>Centre d'Aide & FAQ</h1>
          <p>Tout ce que vous devez savoir pour collaborer avec des créateurs mobiles et commander du contenu smartphone.</p>
        </div>

        <div class="faq-list">
          <div class="faq-card card-glass">
            <h3>Comment fonctionne la Protection Séquestre ?</h3>
            <p>
              Lorsqu'un client accepte une proposition, les fonds sont bloqués sur le compte séquestre sécurisé de SnapConnect. Le créateur tourne, monte et dépose ses livrables 4K. Le client inspecte les fichiers et les fonds ne sont versés au créateur qu'après son approbation explicite.
            </p>
          </div>

          <div class="faq-card card-glass">
            <h3>Quel matériel est requis pour être Créateur Mobile ?</h3>
            <p>
              Les créateurs doivent obligatoirement tourner avec des smartphones récents capables d'enregistrer au minimum en 4K 30/60fps (iPhone 13 Pro ou supérieur, Samsung Galaxy S22 Ultra ou supérieur, Google Pixel 7 Pro ou supérieur). L'usage de stabilisateurs mobiles (gimbals DJI OM) et micros sans fil est vivement recommandé.
            </p>
          </div>

          <div class="faq-card card-glass">
            <h3>Comment se déroulent les révisions ?</h3>
            <p>
              Chaque mission inclut un nombre défini de révisions (généralement 2 à 3). Les clients peuvent annoter les vidéos et soumettre leurs remarques directement dans l'espace de contrat.
            </p>
          </div>

          <div class="faq-card card-glass">
            <h3>Comment fonctionne la marketplace SnapConnect ?</h3>
            <p>
              SnapConnect fonctionne sur un modèle direct, fluide et 100% sécurisé : le client publie son besoin ou consulte les profils vérifiés, sélectionne un créateur smartphone certifié, bloque le budget en séquestre sécurisé, et libère le paiement uniquement après validation des fichiers vidéos et photos 4K livrés.
            </p>
          </div>
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .help-page {
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

    .faq-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .faq-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
    }

    .faq-card h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-3);
      color: var(--color-text-primary);
    }

    .faq-card p {
      color: var(--color-text-secondary);
      line-height: var(--line-height-relaxed);
      font-size: var(--font-size-sm);
    }
  `]
})
export class HelpComponent {}
