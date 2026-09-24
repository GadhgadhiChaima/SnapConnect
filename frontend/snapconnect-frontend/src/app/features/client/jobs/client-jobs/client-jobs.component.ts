import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { JobService } from '../../../../core/services/job.service';
import { ProposalService } from '../../../../core/services/proposal.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Job, JobStatus } from '../../../../core/models/job.model';

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
            <span class="badge badge-primary">Espace Client</span>
            <h1>Mes briefs de contenu mobile</h1>
            <p>Suivez vos briefs publiés, examinez les propositions des créateurs et recrutez les meilleurs talents smartphone.</p>
          </div>
          <div class="header-actions">
            <a routerLink="/client/jobs/create" class="btn btn-primary btn-md">
              + Publier une mission
            </a>
            <a routerLink="/creators" class="btn btn-outline btn-md">
              Trouver un Créateur
            </a>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="filter-tabs card-glass">
          <button
            class="tab-btn"
            [class.active]="selectedTab() === 'ALL'"
            (click)="selectedTab.set('ALL')"
          >
            Tous ({{ totalCount() }})
          </button>
          <button
            class="tab-btn"
            [class.active]="selectedTab() === 'OPEN'"
            (click)="selectedTab.set('OPEN')"
          >
            Ouverts aux candidatures ({{ openCount() }})
          </button>
          <button
            class="tab-btn"
            [class.active]="selectedTab() === 'CLOSED'"
            (click)="selectedTab.set('CLOSED')"
          >
            Clôturés ({{ closedCount() }})
          </button>
        </div>

        <!-- Jobs List -->
        @if (filteredJobs().length > 0) {
          <div class="jobs-list">
            @for (job of filteredJobs(); track job.id) {
              <div class="job-item card-glass animate-fade-in">
                <div class="job-main">
                  <div class="job-top flex-between">
                    <div class="badge-row">
                      <span class="badge badge-primary">{{ job.categoryName || job.categoryId }}</span>
                      <span class="badge" [class.status-open]="job.status === 'OPEN'" [class.status-closed]="job.status !== 'OPEN'">
                        ● {{ job.status === 'OPEN' ? 'Ouvert aux propositions' : 'Brief clôturé' }}
                      </span>
                    </div>
                    <span class="job-budget">
                      {{ job.budgetType === 'FIXED' ? (job.budgetAmount || job.budgetMin || 250) + ' DT Fixe' : (job.budgetMin || 40) + '-' + (job.budgetMax || 80) + ' DT/h' }}
                    </span>
                  </div>

                  <h3 class="job-title">{{ job.title }}</h3>
                  <p class="job-desc">{{ job.description }}</p>

                  <div class="job-meta">
                    <span class="meta-tag">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                        <line x1="12" y1="18" x2="12.01" y2="18"></line>
                      </svg>
                      Requis : <strong>{{ job.requiredGear }}</strong>
                    </span>
                    <span class="meta-tag">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {{ job.location }}
                    </span>
                    <span class="meta-tag">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      Publié le : {{ job.postedDate }}
                    </span>
                  </div>
                </div>

                <div class="job-actions-col">
                  <div class="proposals-count-box">
                    <span class="p-num">{{ getProposalCount(job.id) }}</span>
                    <span class="p-lbl">Propositions reçues</span>
                  </div>

                  <a [routerLink]="['/client/jobs', job.id, 'proposals']" class="btn btn-primary btn-sm btn-full">
                    Examiner les propositions ({{ getProposalCount(job.id) }}) →
                  </a>

                  <div class="sub-actions flex-between">
                    <a [routerLink]="['/jobs', job.id]" class="btn btn-outline btn-xs">
                      Voir en ligne ↗
                    </a>

                    @if (job.status === 'OPEN') {
                      <button (click)="toggleJobStatus(job)" class="btn btn-ghost btn-xs text-muted" title="Ne plus recevoir de propositions">
                        Clôturer
                      </button>
                    } @else {
                      <button (click)="toggleJobStatus(job)" class="btn btn-outline btn-xs text-success" title="Rouvrir aux candidatures">
                        Rouvrir
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <!-- Empty State -->
          <div class="empty-state card-glass animate-scale-in">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-primary-400);">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <h3>Aucun brief trouvé dans cette catégorie</h3>
            <p>Publiez un nouveau brief mobile pour recevoir des propositions de créateurs smartphone vérifiés sous 24h.</p>
            <div class="empty-actions">
              <a routerLink="/client/jobs/create" class="btn btn-primary btn-md">
                + Publier mon premier brief
              </a>
              <a routerLink="/creators" class="btn btn-outline btn-md">
                Explorer les créateurs
              </a>
            </div>
          </div>
        }
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
      margin-bottom: var(--space-6);
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

    .header-actions {
      display: flex;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    /* Filter Tabs */
    .filter-tabs {
      display: flex;
      gap: var(--space-2);
      padding: var(--space-2);
      border-radius: var(--radius-xl);
      margin-bottom: var(--space-6);
      overflow-x: auto;
    }

    .tab-btn {
      background: transparent;
      border: none;
      color: var(--color-text-secondary);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-lg);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
    }

    .tab-btn:hover {
      color: var(--color-text-primary);
      background: rgba(255, 255, 255, 0.05);
    }

    .tab-btn.active {
      background: var(--color-primary-light);
      color: var(--color-primary-300);
      font-weight: var(--font-weight-bold);
      border: 1px solid rgba(139, 92, 246, 0.3);
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

    .status-closed {
      color: var(--color-text-muted);
      background: rgba(255, 255, 255, 0.06);
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
      align-items: stretch;
      gap: var(--space-3);
      min-width: 200px;
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

    .btn-full {
      width: 100%;
      text-align: center;
      justify-content: center;
    }

    .sub-actions {
      display: flex;
      gap: var(--space-2);
      width: 100%;
    }

    .empty-state {
      text-align: center;
      padding: var(--space-12) var(--space-6);
      border-radius: var(--radius-2xl);
    }

    .empty-icon {
      margin-bottom: var(--space-4);
    }

    .empty-state h3 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-2);
    }

    .empty-state p {
      color: var(--color-text-secondary);
      margin-bottom: var(--space-6);
    }

    .empty-actions {
      display: flex;
      gap: var(--space-3);
      justify-content: center;
      flex-wrap: wrap;
    }
  `]
})
export class ClientJobsComponent implements OnInit {
  private jobService = inject(JobService);
  private proposalService = inject(ProposalService);
  private auth = inject(AuthService);

  selectedTab = signal<'ALL' | 'OPEN' | 'CLOSED'>('ALL');

  ngOnInit(): void {
    this.jobService.refresh();
    this.proposalService.refresh();
  }

  // Jobs belonging to current client
  clientJobs = computed(() => {
    const user = this.auth.currentUser();
    const all = this.jobService.jobs();
    if (!user) return all;
    const isDemoClient = String(user.id) === '1' || user.id === 'cl-1' || user.email?.toLowerCase().includes('client');

    return all.filter(j =>
      j.clientId === user.id ||
      j.clientName === user.fullName ||
      (isDemoClient && (j.clientId === 'cl-1' || !j.clientId || j.clientName?.includes('Maison Alyssa') || j.clientId === '1')) ||
      !j.clientId
    );
  });

  totalCount = computed(() => this.clientJobs().length);
  openCount = computed(() => this.clientJobs().filter(j => j.status === 'OPEN').length);
  closedCount = computed(() => this.clientJobs().filter(j => j.status !== 'OPEN').length);

  filteredJobs = computed(() => {
    const tab = this.selectedTab();
    const list = this.clientJobs();
    if (tab === 'ALL') return list;
    if (tab === 'OPEN') return list.filter(j => j.status === 'OPEN');
    if (tab === 'CLOSED') return list.filter(j => j.status !== 'OPEN');
    return list;
  });

  getProposalCount(jobId: string): number {
    const matched = this.proposalService.proposals().filter(p => p.jobId === jobId);
    if (matched.length > 0) return matched.length;
    const job = this.clientJobs().find(j => j.id === jobId);
    return job?.proposalsCount || 0;
  }

  toggleJobStatus(job: Job): void {
    const newStatus: JobStatus = job.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    this.jobService.updateStatus(job.id, newStatus).subscribe(() => {
      this.jobService.refresh();
    });
  }
}

