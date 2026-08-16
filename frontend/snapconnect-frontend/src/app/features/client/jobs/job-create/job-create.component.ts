import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { PLATFORM_CATEGORIES } from '../../../../core/services/category.service';
import { JobService } from '../../../../core/services/job.service';

@Component({
  selector: 'app-job-create',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="job-create-page">
      <div class="container-narrow">
        <div class="page-header">
          <span class="badge badge-primary">Model A — Mobile Brief</span>
          <h1>Post a Mobile Photo & Video Job</h1>
          <p>Describe your shoot requirements to receive proposals from verified mobile creators.</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="job-form card-glass animate-scale-in">
          <!-- Step 1: Title & Category -->
          <div class="form-section">
            <h3>1. Project Details</h3>

            <div class="form-group">
              <label class="form-label" for="title">Job Title</label>
              <input
                type="text"
                id="title"
                [(ngModel)]="title"
                name="title"
                required
                class="form-input"
                placeholder="e.g. 5 Aesthetic Unboxing Reels for Skincare Brand (iPhone 16 Pro)"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="category">Content Category</label>
              <select id="category" [(ngModel)]="categoryId" name="category" class="form-select" required>
                <option value="" disabled selected>Select category...</option>
                @for (cat of categories; track cat.id) {
                  <option [value]="cat.id">{{ cat.emoji }} {{ cat.name }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="desc">Project Description & Creative Brief</label>
              <textarea
                id="desc"
                [(ngModel)]="description"
                name="desc"
                required
                class="form-textarea"
                placeholder="Describe your vision, required deliverable count, aspect ratio (e.g. 9:16 vertical), tone, references..."
                rows="5"
              ></textarea>
            </div>
          </div>

          <!-- Step 2: Smartphone Hardware Requirements -->
          <div class="form-section gear-section">
            <h3>2. 📱 Mobile Equipment & Gear Requirements</h3>
            <p class="section-hint">Specify the minimum smartphone camera and accessories needed for your project.</p>

            <div class="form-group">
              <label class="form-label">Required Smartphone Model / Specs</label>
              <input
                type="text"
                [(ngModel)]="requiredGear"
                name="gear"
                class="form-input"
                placeholder="e.g. iPhone 15/16 Pro (4K ProRes) or Samsung S24 Ultra"
              />
            </div>
          </div>

          <!-- Step 3: Location & Logistics -->
          <div class="form-section">
            <h3>3. Location & Delivery</h3>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="isRemote" name="isRemote" />
                <span>Remote Shoot (Products shipped to creator / Creator films anywhere)</span>
              </label>
            </div>

            @if (!isRemote) {
              <div class="form-group animate-fade-in">
                <label class="form-label" for="loc">On-Site Filming Location (City & Address)</label>
                <input
                  type="text"
                  id="loc"
                  [(ngModel)]="location"
                  name="loc"
                  class="form-input"
                  placeholder="e.g. Paris 11e, Le Marais bistro"
                />
              </div>
            }
          </div>

          <!-- Step 4: Budget & Timeline -->
          <div class="form-section">
            <h3>4. Budget & Escrow</h3>

            <div class="budget-type-row">
              <button
                type="button"
                class="budget-btn"
                [class.active]="budgetType === 'FIXED'"
                (click)="budgetType = 'FIXED'">
                💰 Fixed Project Price
              </button>
              <button
                type="button"
                class="budget-btn"
                [class.active]="budgetType === 'HOURLY'"
                (click)="budgetType = 'HOURLY'">
                ⏱️ Hourly Rate
              </button>
            </div>

            @if (budgetType === 'FIXED') {
              <div class="form-group animate-fade-in">
                <label class="form-label">Fixed Project Budget ($ USD)</label>
                <input
                  type="number"
                  [(ngModel)]="budgetAmount"
                  name="budgetFixed"
                  class="form-input"
                  placeholder="e.g. 250"
                  required
                />
              </div>
            } @else {
              <div class="form-row-2 animate-fade-in">
                <div class="form-group">
                  <label class="form-label">Min Rate ($/hr)</label>
                  <input type="number" [(ngModel)]="budgetMin" name="budgetMin" class="form-input" placeholder="e.g. 35" />
                </div>
                <div class="form-group">
                  <label class="form-label">Max Rate ($/hr)</label>
                  <input type="number" [(ngModel)]="budgetMax" name="budgetMax" class="form-input" placeholder="e.g. 60" />
                </div>
              </div>
            }
          </div>

          <div class="form-actions">
            <button type="button" routerLink="/client/dashboard" class="btn btn-outline btn-lg">Cancel</button>
            <button type="submit" [disabled]="isLoading()" class="btn btn-primary btn-lg submit-btn">
              @if (isLoading()) {
                <span class="animate-spin">🌀</span> Publishing...
              } @else {
                🚀 Publish Mobile Job Brief
              }
            </button>
          </div>
        </form>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .job-create-page {
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

    .job-form {
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
      color: var(--color-text-primary);
    }

    .section-hint {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-top: -8px;
    }

    .gear-section {
      background: rgba(139, 92, 246, 0.06);
      padding: var(--space-5);
      border-radius: var(--radius-lg);
      border: 1px dashed rgba(139, 92, 246, 0.3);
    }

    .checkbox-group {
      margin-top: var(--space-2);
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--color-primary-500);
      cursor: pointer;
    }

    .budget-type-row {
      display: flex;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }

    .budget-btn {
      flex: 1;
      padding: var(--space-3);
      border-radius: var(--radius-md);
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .budget-btn.active {
      background: var(--color-primary-light);
      border-color: var(--color-primary-500);
      color: #fff;
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
      padding-top: var(--space-4);
    }

    .submit-btn {
      min-width: 240px;
    }
  `]
})
export class JobCreateComponent {
  private jobService = inject(JobService);
  private router = inject(Router);

  title = '';
  categoryId = 'reels-tiktok';
  description = '';
  requiredGear = 'iPhone 15/16 Pro (4K ProRes) or Samsung S24 Ultra';
  isRemote = true;
  location = 'Paris, France';
  budgetType: 'FIXED' | 'HOURLY' = 'FIXED';
  budgetAmount = 250;
  budgetMin = 35;
  budgetMax = 60;
  isLoading = signal(false);

  categories = PLATFORM_CATEGORIES;

  onSubmit(): void {
    if (!this.title || !this.description) {
      alert('Please fill out the title and description.');
      return;
    }

    this.isLoading.set(true);

    setTimeout(() => {
      this.isLoading.set(false);
      alert('Job posted successfully! Mobile creators are being notified.');
      this.router.navigate(['/jobs']);
    }, 600);
  }
}
