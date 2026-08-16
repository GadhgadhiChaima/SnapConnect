import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { Job } from '../../../../core/models/job.model';

@Component({
  selector: 'app-client-jobs',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="client-jobs-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-primary">Client Workspace</span>
            <h1>My Mobile Content Briefs</h1>
            <p>Track your posted photo/video jobs, review creator proposals, and hire top smartphone talent.</p>
          </div>
          <a routerLink="/client/jobs/create" class="btn btn-primary btn-md">
            + Post a New Brief
          </a>
        </div>

        <!-- Jobs List -->
        <div class="jobs-list">
          @for (job of jobs(); track job.id) {
            <div class="job-item card-glass">
              <div class="job-main">
                <div class="job-top flex-between">
                  <div class="badge-row">
                    <span class="badge badge-primary">{{ job.categoryName }}</span>
                    <span class="badge status-open">● {{ job.status }}</span>
                  </div>
                  <span class="job-budget">
                    {{ job.budgetType === 'FIXED' ? '$' + job.budgetMin + ' Fixed' : '$' + job.budgetMin + '-$' + job.budgetMax + '/hr' }}
                  </span>
                </div>

                <h3 class="job-title">{{ job.title }}</h3>
                <p class="job-desc">{{ job.description }}</p>

                <div class="job-meta">
                  <span class="meta-tag">📱 Required: <strong>{{ job.requiredGear }}</strong></span>
                  <span class="meta-tag">📍 {{ job.location }}</span>
                  <span class="meta-tag">⏱️ Deadline: {{ job.deadline }}</span>
                </div>
              </div>

              <div class="job-actions-col">
                <div class="proposals-count-box">
                  <span class="p-num">{{ job.proposalsCount }}</span>
                  <span class="p-lbl">Proposals</span>
                </div>
                <a [routerLink]="['/client/jobs', job.id, 'proposals']" class="btn btn-primary btn-sm">
                  View Proposals ({{ job.proposalsCount }}) →
                </a>
              </div>
            </div>
          }
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .client-jobs-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }

    .page-header {
      margin-bottom: var(--space-8);
      flex-wrap: wrap;
      gap: var(--space-4);
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

    .jobs-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .job-item {
      padding: var(--space-6) var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-6);
      flex-wrap: wrap;
    }

    .job-main {
      flex: 1;
      min-width: 300px;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .badge-row {
      display: flex;
      gap: var(--space-2);
    }

    .status-open {
      color: var(--color-success);
      background: var(--color-success-light);
    }

    .job-budget {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-black);
      color: var(--color-text-primary);
    }

    .job-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      margin: 0;
    }

    .job-desc {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: var(--line-height-normal);
      margin: 0;
    }

    .job-meta {
      display: flex;
      gap: var(--space-4);
      flex-wrap: wrap;
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .meta-tag strong {
      color: var(--color-primary-300);
    }

    .job-actions-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      min-width: 180px;
    }

    .proposals-count-box {
      text-align: center;
      padding: var(--space-2) var(--space-4);
      background: rgba(15, 23, 42, 0.6);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      width: 100%;
    }

    .p-num {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-black);
      color: var(--color-primary-300);
      display: block;
    }

    .p-lbl {
      font-size: 11px;
      color: var(--color-text-muted);
      text-transform: uppercase;
    }
  `]
})
export class ClientJobsComponent {
  jobs = signal<Job[]>([
    {
      id: 'jb-1',
      clientId: 'cl-1',
      clientName: 'Bloom Cosmetics',
      title: '5 Aesthetic Vertical Unboxing Videos for TikTok / Reels',
      description: 'Looking for a skilled mobile videographer to film 5 vertical clips highlighting our new organic skincare line with natural daylight and macro textures.',
      categoryName: 'Reels & TikTok',
      budgetType: 'FIXED',
      budgetMin: 250,
      budgetMax: 250,
      deadline: '2026-08-20',
      location: 'Remote',
      isRemote: true,
      status: 'OPEN',
      proposalsCount: 6,
      requiredGear: 'iPhone 15 Pro / 16 Pro (4K 60fps ProRes)',
      postedDate: '2026-08-12'
    },
    {
      id: 'jb-2',
      clientId: 'cl-1',
      clientName: 'Bloom Cosmetics',
      title: '20 High-Res Macro Product Photos on Smartphone',
      description: 'Need product photos of serums and creams on minimalist textured backgrounds. Must use 5x telephoto or macro mode on a flagship smartphone.',
      categoryName: 'Product Photography',
      budgetType: 'FIXED',
      budgetMin: 180,
      budgetMax: 180,
      deadline: '2026-08-25',
      location: 'Remote',
      isRemote: true,
      status: 'OPEN',
      proposalsCount: 4,
      requiredGear: 'iPhone 16 Pro / Galaxy S24 Ultra',
      postedDate: '2026-08-14'
    }
  ]);
}
