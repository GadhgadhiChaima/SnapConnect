import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="contact-page">
      <div class="container-narrow">
        <div class="page-header text-center">
          <span class="badge badge-accent">Contact</span>
          <h1>Contacter le Support SnapConnect</h1>
          <p>Une question sur votre mission, contrat ou profil de créateur ? Notre équipe est à votre écoute.</p>
        </div>

        <form (ngSubmit)="send()" class="contact-card card-glass animate-scale-in">
          <div class="form-group">
            <label class="form-label">Votre nom</label>
            <input type="text" [(ngModel)]="name" name="name" class="form-input" placeholder="Votre nom complet" required />
          </div>

          <div class="form-group">
            <label class="form-label">Adresse email</label>
            <input type="email" [(ngModel)]="email" name="email" class="form-input" placeholder="votre.email@exemple.tn" required />
          </div>

          <div class="form-group">
            <label class="form-label">Sujet</label>
            <input type="text" [(ngModel)]="subject" name="subj" class="form-input" placeholder="ex. Question sur le séquestre / Assistance compte" required />
          </div>

          <div class="form-group">
            <label class="form-label">Message</label>
            <textarea [(ngModel)]="message" name="msg" class="form-textarea" placeholder="Comment pouvons-nous vous aider ?" rows="5" required></textarea>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg">
            Envoyer le message
          </button>
        </form>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .contact-page {
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

    .contact-card {
      padding: var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }
  `]
})
export class ContactComponent {
  name = '';
  email = '';
  subject = '';
  message = '';

  send(): void {
    if (!this.name || !this.email || !this.message) return;
    alert("Merci de nous avoir contactés ! L'équipe support SnapConnect vous répondra dans les 2 heures.");
    this.name = '';
    this.email = '';
    this.subject = '';
    this.message = '';
  }
}
