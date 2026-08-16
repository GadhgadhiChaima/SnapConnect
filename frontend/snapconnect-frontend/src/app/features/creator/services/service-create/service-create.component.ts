import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { PLATFORM_CATEGORIES } from '../../../../core/services/category.service';

@Component({
  selector: 'app-service-create',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="service-create-page">
      <div class="container-narrow">
        <div class="page-header">
          <span class="badge badge-accent">Model B — Mobile Package</span>
          <h1>Create a Mobile Photo/Video Service</h1>
          <p>Package your smartphone filming and editing skills into a ready-to-order gig.</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="service-form card-glass animate-scale-in">
          <!-- Step 1: Overview -->
          <div class="form-section">
            <h3>1. Gig Overview</h3>

            <div class="form-group">
              <label class="form-label">Service Title</label>
              <input
                type="text"
                [(ngModel)]="title"
                name="title"
                required
                class="form-input"
                placeholder="e.g. 3 Viral UGC TikToks shot on iPhone 16 Pro with Voiceover"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Category</label>
              <select [(ngModel)]="categoryId" name="category" class="form-select" required>
                @for (cat of categories; track cat.id) {
                  <option [value]="cat.name">{{ cat.emoji }} {{ cat.name }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Detailed Description</label>
              <textarea
                [(ngModel)]="description"
                name="desc"
                required
                class="form-textarea"
                placeholder="Explain your filming process, what phone/gimbal you use, and how you deliver..."
                rows="4"
              ></textarea>
            </div>
          </div>

          <!-- Step 2: Pricing & Deliverables -->
          <div class="form-section">
            <h3>2. Starter Package Tier</h3>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Package Price ($ USD)</label>
                <input type="number" [(ngModel)]="price" name="price" class="form-input" placeholder="75" required />
              </div>

              <div class="form-group">
                <label class="form-label">Delivery Timeline (Days)</label>
                <input type="number" [(ngModel)]="deliveryDays" name="days" class="form-input" placeholder="2" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Included Revisions</label>
              <input type="number" [(ngModel)]="revisions" name="revisions" class="form-input" placeholder="2" required />
            </div>

            <div class="form-group">
              <label class="form-label">Deliverables Summary</label>
              <input
                type="text"
                [(ngModel)]="deliverables"
                name="deliverables"
                class="form-input"
                placeholder="e.g. 1x 4K vertical video (9:16), captions, hook variations"
                required
              />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" routerLink="/creator/dashboard" class="btn btn-outline btn-lg">Cancel</button>
            <button type="submit" class="btn btn-primary btn-lg">🚀 Publish Mobile Service</button>
          </div>
        </form>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .service-create-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }

    .page-header {
      margin-bottom: var(--space-8);
      text-align: center;
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

    .service-form {
      padding: var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      padding-bottom: var(--space-6);
      border-bottom: 1px solid var(--color-border-subtle);
    }

    .form-section h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-4);
    }
  `]
})
export class ServiceCreateComponent {
  private router = inject(Router);

  title = '';
  categoryId = 'Reels & TikTok';
  description = '';
  price = 75;
  deliveryDays = 2;
  revisions = 2;
  deliverables = '1x 4K vertical video (9:16), captions, hook variations';

  categories = PLATFORM_CATEGORIES;

  onSubmit(): void {
    if (!this.title || !this.description) {
      alert('Please fill out all fields.');
      return;
    }

    alert('Service package created and published to marketplace!');
    this.router.navigate(['/services']);
  }
}
