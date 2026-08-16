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
          <span class="badge badge-accent">Get in Touch</span>
          <h1>Contact SnapConnect Support</h1>
          <p>Have questions about your project, contract, or creator application? We're here to help.</p>
        </div>

        <form (ngSubmit)="send()" class="contact-card card-glass animate-scale-in">
          <div class="form-group">
            <label class="form-label">Your Name</label>
            <input type="text" [(ngModel)]="name" name="name" class="form-input" placeholder="Your name" required />
          </div>

          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" class="form-input" placeholder="you@example.com" required />
          </div>

          <div class="form-group">
            <label class="form-label">Subject</label>
            <input type="text" [(ngModel)]="subject" name="subj" class="form-input" placeholder="e.g. Question about mobile escrow / Account help" required />
          </div>

          <div class="form-group">
            <label class="form-label">Message</label>
            <textarea [(ngModel)]="message" name="msg" class="form-textarea" placeholder="How can we assist you today?" rows="5" required></textarea>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg">
            Send Message ✉️
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
    alert('Thank you for contacting SnapConnect! Our support team will reply within 2 hours.');
    this.name = '';
    this.email = '';
    this.subject = '';
    this.message = '';
  }
}
