import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { ProposalService } from '../../../core/services/proposal.service';
import { AuthService } from '../../../core/services/auth.service';
import { Job } from '../../../core/models/job.model';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="job-detail-page" *ngIf="job; else notFound">
      <div class="back-link">
        <a routerLink="/jobs">← Back to All Mobile Briefs</a>
      </div>

      <div class="detail-layout">
        <!-- MAIN CONTENT -->
        <main class="main-content">
          <div class="brief-header card-glass">
            <div class="header-top">
              <span class="badge badge-purple">{{ job.category }}</span>
              <span class="posted">Posted {{ job.postedDate }}</span>
            </div>

            <h1>{{ job.title }}</h1>

            <div class="brief-metrics">
              <div class="metric">
                <span class="lbl">Budget</span>
                <span class="val">\${{ job.budgetAmount }} ({{ job.budgetType }})</span>
              </div>
              <div class="metric">
                <span class="lbl">Location</span>
                <span class="val">📍 {{ job.location }}</span>
              </div>
              <div class="metric">
                <span class="lbl">Proposals Submitted</span>
                <span class="val">📩 {{ proposalsCount }} Bids</span>
              </div>
            </div>
          </div>

          <div class="brief-section card-glass">
            <h2>Detailed Project Description</h2>
            <p class="description-text">{{ job.description }}</p>
          </div>

          <div class="brief-section card-glass">
            <h2>📱 Smartphone Equipment Requirements</h2>
            <div class="gear-callout">
              <div class="icon">📱</div>
              <div>
                <strong>Gear Specification:</strong>
                <p>{{ job.requiredGear }}</p>
              </div>
            </div>
          </div>

          <div class="brief-section card-glass">
            <h2>Required Deliverables</h2>
            <ul class="deliverables-list">
              <li *ngFor="let del of job.deliverables">
                <span class="check">✓</span> {{ del }}
              </li>
            </ul>
          </div>
        </main>

        <!-- SIDEBAR -->
        <aside class="sidebar">
          <div class="action-card card-glass">
            <h3>Apply for this Job Brief</h3>
            <p class="sub">Do you own the required smartphone gear and expertise?</p>

            <ng-container *ngIf="authService.isCreator(); else clientNotice">
              <a [routerLink]="['/proposals/submit', job.id]" class="btn btn-primary btn-block">
                Submit Proposal
              </a>
            </ng-container>
            <ng-template #clientNotice>
              <div class="client-alert card-glass">
                <p>💡 You are currently in <strong>Client</strong> mode or logged out.</p>
                <a routerLink="/proposals/job", class="btn btn-outline btn-block" *ngIf="authService.isClient()">
                  View Received Proposals
                </a>
              </div>
            </ng-template>
          </div>

          <div class="client-card card-glass">
            <h3>About the Client</h3>
            <div class="client-profile">
              <img [src]="job.clientAvatar" [alt]="job.clientName" class="avatar" />
              <div>
                <h4>{{ job.clientName }}</h4>
                <p class="location">📍 {{ job.location }}</p>
                <p class="verified">Payment Verified ✓</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <ng-template #notFound>
      <div class="not-found card-glass">
        <h2>Job Brief Not Found</h2>
        <a routerLink="/jobs" class="btn btn-primary">Return to Job Marketplace</a>
      </div>
    </ng-template>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .job-detail-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .back-link {
      margin-bottom: 1.5rem;
      a { color: $text-muted; font-size: 0.9rem; &:hover { color: $primary; } }
    }

    .detail-layout {
      display: grid;
      grid-template-columns: 2.2fr 1fr;
      gap: 1.5rem;

      @include respond-to('tablet') {
        grid-template-columns: 1fr;
      }
    }

    .main-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .brief-header {
      padding: 2rem;

      .header-top {
        @include flex-between;
        margin-bottom: 1rem;
        .posted { font-size: 0.8rem; color: $text-muted; }
      }

      h1 {
        font-size: 1.8rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
      }

      .brief-metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        padding-top: 1rem;
        border-top: 1px solid $border-color;

        .metric {
          display: flex;
          flex-direction: column;
          .lbl { font-size: 0.75rem; color: $text-muted; }
          .val { font-size: 1rem; font-weight: 700; color: white; }
        }
      }
    }

    .brief-section {
      padding: 1.75rem;

      h2 { font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem; color: white; }

      .description-text {
        font-size: 0.95rem;
        color: $text-muted;
        line-height: 1.7;
      }

      .gear-callout {
        display: flex;
        gap: 1rem;
        background: rgba(139, 92, 246, 0.1);
        border: 1px solid rgba(139, 92, 246, 0.3);
        padding: 1rem;
        border-radius: $radius-md;

        .icon { font-size: 1.5rem; }
        strong { color: #c084fc; font-size: 0.9rem; }
        p { color: white; font-size: 0.95rem; margin-top: 0.2rem; }
      }

      .deliverables-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;

        li {
          font-size: 0.9rem;
          color: $text-muted;
          .check { color: #4ade80; font-weight: bold; margin-right: 0.5rem; }
        }
      }
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .action-card {
        padding: 1.5rem;
        h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .sub { font-size: 0.85rem; color: $text-muted; margin-bottom: 1.25rem; }
      }

      .client-card {
        padding: 1.5rem;
        h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; }
        .client-profile {
          display: flex;
          gap: 0.85rem;
          align-items: center;

          .avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
          h4 { font-size: 0.95rem; font-weight: 700; }
          .location { font-size: 0.8rem; color: $text-muted; }
          .verified { font-size: 0.75rem; color: #4ade80; }
        }
      }
    }

    .btn-block { width: 100%; text-align: center; }

    .not-found {
      text-align: center;
      padding: 4rem;
    }
  `]
})
export class JobDetailComponent implements OnInit {
  job?: Job;
  proposalsCount = 0;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private proposalService: ProposalService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.job = this.jobService.getJobById(id);
      if (this.job) {
        this.proposalsCount = this.proposalService.getProposalsForJob(this.job.id).length || this.job.proposalsCount;
      }
    }
  }
}
