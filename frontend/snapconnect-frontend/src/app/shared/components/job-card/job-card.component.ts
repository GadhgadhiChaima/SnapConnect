import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { Job } from '../../../core/models/job.model';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [RouterLink, SlicePipe],
  template: `
    @if (job(); as j) {
      <div class="job-card card-glass card-glass-interactive">
        <div class="job-header">
          <div class="category-and-posted">
            <span class="badge badge-primary">{{ j.categoryName || 'Mobile Shoot' }}</span>
            <span class="posted-time">📅 {{ j.postedDate | slice:0:10 }}</span>
          </div>
          <div class="budget-badge" [class.hourly]="j.budgetType === 'HOURLY'">
            @if (j.budgetType === 'HOURLY') {
              <span>\${{ j.budgetMin || 25 }} - \${{ j.budgetMax || 50 }}/hr</span>
            } @else {
              <span>\${{ j.budgetAmount || 200 }} Fixed</span>
            }
          </div>
        </div>

        <h3 class="job-title">
          <a [routerLink]="['/jobs', j.id]">{{ j.title }}</a>
        </h3>

        <p class="job-desc">{{ j.description }}</p>

        <!-- Requirements & Location -->
        <div class="meta-row">
          <div class="meta-item">
            <span class="meta-icon">📍</span>
            <span>{{ j.isRemote ? 'Remote / Online' : j.location }}</span>
          </div>

          @if (j.requiredGear) {
            <div class="meta-item gear-item">
              <span class="meta-icon">📱</span>
              <span>{{ j.requiredGear }}</span>
            </div>
          }
        </div>

        <!-- Skills tags -->
        <div class="skills-row">
          @for (skill of j.requiredSkills?.slice(0, 3); track skill) {
            <span class="badge badge-neutral">{{ skill }}</span>
          }
        </div>

        <!-- Card Footer (Client info & Proposals count) -->
        <div class="job-footer">
          <div class="client-mini">
            <span class="client-icon">👤</span>
            <span class="client-name">{{ j.clientName }}</span>
            @if (j.clientRating) {
              <span class="client-rating">★ {{ j.clientRating.toFixed(1) }}</span>
            }
          </div>

          <div class="footer-actions">
            <span class="proposals-count">📬 {{ j.proposalsCount || 0 }} proposals</span>
            <a [routerLink]="['/jobs', j.id]" class="btn btn-outline btn-xs">Apply</a>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; height: 100%; }

    .job-card {
      padding: var(--space-5) var(--space-6);
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: var(--space-3);
      background: var(--color-bg-card);
      border-radius: var(--radius-lg);
    }

    .job-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .category-and-posted {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .posted-time {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .budget-badge {
      padding: 4px 10px;
      border-radius: var(--radius-full);
      background: var(--color-success-light);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: var(--color-success);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-extrabold);
    }

    .budget-badge.hourly {
      background: var(--color-primary-light);
      border-color: rgba(139, 92, 246, 0.3);
      color: var(--color-primary-300);
    }

    .job-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      line-height: var(--line-height-snug);
      margin: 0;
    }

    .job-title a {
      color: var(--color-text-primary);
      text-decoration: none;
      transition: color var(--transition-fast);
    }

    .job-title a:hover {
      color: var(--color-primary-400);
    }

    .job-desc {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: var(--line-height-normal);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex-grow: 1;
    }

    .meta-row {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      flex-wrap: wrap;
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .gear-item {
      color: var(--color-accent-300);
      font-weight: var(--font-weight-semibold);
    }

    .skills-row {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .job-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border-subtle);
      margin-top: auto;
      flex-wrap: wrap;
    }

    .client-mini {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .client-rating {
      color: var(--color-gold-400);
      font-weight: var(--font-weight-bold);
    }

    .footer-actions {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .proposals-count {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }
  `]
})
export class JobCardComponent {
  job = input<Job | null>(null);
}
