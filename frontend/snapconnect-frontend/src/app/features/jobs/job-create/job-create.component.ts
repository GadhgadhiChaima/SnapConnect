import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { JobCategory, BudgetType } from '../../../core/models/job.model';

@Component({
  selector: 'app-job-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="job-create-page">
      <div class="create-card card-glass">
        <div class="header">
          <h1>Post a <span class="gradient-title">Mobile Content Brief</span></h1>
          <p>Hire a smartphone content creator with verified gear for your project.</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="create-form">
          <div class="form-group">
            <label>Project Title</label>
            <input
              type="text"
              [(ngModel)]="title"
              name="title"
              required
              class="input-field"
              placeholder="e.g. 5 Vertical Instagram Reels for Artisan Cafe" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Content Category</label>
              <select [(ngModel)]="category" name="category" class="input-field">
                <option value="REELS_TIKTOK">📱 Reels & TikTok Videos</option>
                <option value="PRODUCT_PHOTO">📦 Mobile Product Shoot</option>
                <option value="REAL_ESTATE">🏰 Real Estate Mobile Tour</option>
                <option value="EVENT_CLIPS">🎥 Event Mobile Clips</option>
                <option value="UGC">🤳 UGC Review Video</option>
              </select>
            </div>

            <div class="form-group">
              <label>Budget Type & Amount</label>
              <div class="budget-input-group">
                <select [(ngModel)]="budgetType" name="budgetType" class="input-field select-type">
                  <option value="FIXED">Fixed ($)</option>
                  <option value="HOURLY">Hourly ($/hr)</option>
                </select>
                <input
                  type="number"
                  [(ngModel)]="budgetAmount"
                  name="budgetAmount"
                  required
                  class="input-field"
                  placeholder="300" />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>📱 Smartphone Gear & Technical Requirements</label>
            <input
              type="text"
              [(ngModel)]="requiredGear"
              name="requiredGear"
              class="input-field"
              placeholder="e.g. iPhone 15 Pro, 4K 60fps, Handheld Gimbal required" />
          </div>

          <div class="form-group">
            <label>Location / Execution Type</label>
            <input
              type="text"
              [(ngModel)]="location"
              name="location"
              class="input-field"
              placeholder="e.g. New York, NY (On-site) OR Remote (Ship product)" />
          </div>

          <div class="form-group">
            <label>Brief Description</label>
            <textarea
              [(ngModel)]="description"
              name="description"
              rows="5"
              required
              class="input-field textarea"
              placeholder="Describe the aesthetic, key shots, lighting style, and music vibe you expect...">
            </textarea>
          </div>

          <div class="form-group">
            <label>Deliverables (comma separated)</label>
            <input
              type="text"
              [(ngModel)]="deliverablesRaw"
              name="deliverablesRaw"
              class="input-field"
              placeholder="e.g. 5 Edited Reels (1080x1920), Raw 4K clips, Background music sync" />
          </div>

          <div class="form-actions">
            <a routerLink="/jobs" class="btn btn-outline">Cancel</a>
            <button type="submit" class="btn btn-primary" [disabled]="loading">
              {{ loading ? 'Publishing...' : 'Publish Mobile Brief' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .job-create-page {
      max-width: 800px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }

    .create-card {
      padding: 2.5rem;
    }

    .header {
      margin-bottom: 2rem;
      h1 { font-size: 1.8rem; font-weight: 800; }
      p { font-size: 0.9rem; color: $text-muted; margin-top: 0.25rem; }
    }

    .create-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        label { font-size: 0.85rem; font-weight: 600; color: $text-muted; }
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;

        @include respond-to('mobile') {
          grid-template-columns: 1fr;
        }
      }

      .budget-input-group {
        display: flex;
        gap: 0.5rem;
        .select-type { width: 130px; }
      }

      .textarea {
        resize: vertical;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1rem;
      }
    }
  `]
})
export class JobCreateComponent {
  title = '';
  category: JobCategory = 'REELS_TIKTOK';
  budgetType: BudgetType = 'FIXED';
  budgetAmount = 350;
  requiredGear = 'iPhone 14 Pro / 15 Pro, 4K video resolution';
  location = 'New York, NY';
  description = '';
  deliverablesRaw = '5 Edited Reels, Raw video footage';
  loading = false;

  constructor(private jobService: JobService, private router: Router) {}

  onSubmit(): void {
    if (!this.title || !this.description) return;
    this.loading = true;

    const deliverables = this.deliverablesRaw
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    this.jobService.createJob({
      title: this.title,
      category: this.category,
      budgetType: this.budgetType,
      budgetAmount: this.budgetAmount,
      requiredGear: this.requiredGear,
      location: this.location,
      description: this.description,
      deliverables: deliverables.length > 0 ? deliverables : ['Mobile Content Delivery']
    }).subscribe({
      next: (job) => {
        this.loading = false;
        this.router.navigate(['/jobs', job.id]);
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
