import { Component, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { Job } from '../../../core/models/job.model';
import { AuthService } from '../../../core/services/auth.service';
import { ProposalService } from '../../../core/services/proposal.service';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [RouterLink, SlicePipe],
  template: `
    @if (job(); as j) {
      <div class="job-card card-glass card-glass-interactive">
        <div class="job-header">
          <div class="category-and-posted">
            <span class="badge badge-primary">{{ j.categoryName || 'Tournage Mobile' }}</span>
            <span class="posted-time">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 3px;">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {{ j.postedDate | slice:0:10 }}
            </span>
          </div>
          <div class="budget-badge" [class.hourly]="j.budgetType === 'HOURLY'">
            @if (j.budgetType === 'HOURLY') {
              <span>{{ j.budgetMin || 25 }} - {{ j.budgetMax || 50 }} DT/h</span>
            } @else {
              <span>{{ j.budgetAmount || 200 }} DT Fixe</span>
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
            <svg class="meta-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>{{ j.isRemote ? 'À distance / En ligne' : j.location }}</span>
          </div>

          @if (j.requiredGear) {
            <div class="meta-item gear-item">
              <svg class="meta-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
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
            <svg class="client-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span class="client-name">{{ j.clientName }}</span>
            @if (j.clientRating) {
              <span class="client-rating">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="1" style="vertical-align: -1px; margin-right: 2px;">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                {{ j.clientRating.toFixed(1) }}
              </span>
            }
          </div>

          <div class="footer-actions">
            <span class="proposals-count">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 3px;">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              {{ j.proposalsCount || 0 }} proposition(s)
            </span>
            @if (hasApplied(j.id)) {
              <a [routerLink]="['/jobs', j.id]" class="btn btn-applied btn-xs" title="Consulter votre proposition">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 3px;">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Proposition envoyée
              </a>
            } @else {
              <a [routerLink]="['/jobs', j.id]" class="btn btn-outline btn-xs">Postuler</a>
            }
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

    .btn-applied {
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.4);
      color: #4ade80;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: var(--radius-md);
      text-decoration: none;
      transition: all var(--transition-fast);
    }
    .btn-applied:hover {
      background: rgba(34, 197, 94, 0.22);
      border-color: #22c55e;
      color: #fff;
      transform: translateY(-1px);
    }
  `]
})
export class JobCardComponent {
  job = input<Job | null>(null);
  public auth = inject(AuthService);
  private proposalService = inject(ProposalService);

  hasApplied(jobId?: string | number): boolean {
    if (!jobId || !this.auth.isCreator()) return false;
    return this.proposalService.hasCreatorApplied(jobId, this.auth.currentUser());
  }
}
