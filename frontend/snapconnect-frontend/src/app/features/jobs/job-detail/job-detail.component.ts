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
        <a routerLink="/jobs">← Retour aux missions mobile</a>
      </div>

      <div class="detail-layout">
        <!-- MAIN CONTENT -->
        <main class="main-content">
          <div class="brief-header card-glass">
            <div class="header-top">
              <span class="badge badge-purple">{{ job.category }}</span>
              <span class="posted">Publié le {{ job.postedDate }}</span>
            </div>

            <h1>{{ job.title }}</h1>

            <div class="brief-metrics">
              <div class="metric">
                <span class="lbl">Budget</span>
                <span class="val">{{ job.budgetAmount }} DT ({{ job.budgetType === 'FIXED' ? 'Prix fixe' : job.budgetType }})</span>
              </div>
              <div class="metric">
                <span class="lbl">Localisation</span>
                <span class="val">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 3px;">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {{ job.location }}
                </span>
              </div>
              <div class="metric">
                <span class="lbl">Propositions reçues</span>
                <span class="val">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 3px;">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  {{ proposalsCount }} offres
                </span>
              </div>
            </div>
          </div>

          <div class="brief-section card-glass">
            <h2>Description détaillée de la mission</h2>
            <p class="description-text">{{ job.description }}</p>
          </div>

          <div class="brief-section card-glass">
            <h2>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -3px; margin-right: 6px;">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
              Matériel smartphone requis
            </h2>
            <div class="gear-callout">
              <div class="icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
              </div>
              <div>
                <strong>Spécification du matériel :</strong>
                <p>{{ job.requiredGear }}</p>
              </div>
            </div>
          </div>

          <div class="brief-section card-glass">
            <h2>Livrables attendus</h2>
            <ul class="deliverables-list">
              <li *ngFor="let del of job.deliverables">
                <span class="check">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                {{ del }}
              </li>
            </ul>
          </div>
        </main>

        <!-- SIDEBAR -->
        <aside class="sidebar">
          <div class="action-card card-glass">
            <h3>Postuler à cette mission</h3>
            <p class="sub">Possédez-vous l'équipement smartphone et les compétences demandées ?</p>

            <ng-container *ngIf="authService.isCreator(); else clientNotice">
              <a [routerLink]="['/proposals/submit', job.id]" class="btn btn-primary btn-block">
                Envoyer une proposition
              </a>
            </ng-container>
            <ng-template #clientNotice>
              <div class="client-alert card-glass">
                <p>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  Vous êtes actuellement connecté en tant que <strong>Client</strong> ou déconnecté.
                </p>
                <a routerLink="/proposals/job" class="btn btn-outline btn-block" *ngIf="authService.isClient()">
                  Voir les propositions reçues
                </a>
              </div>
            </ng-template>
          </div>

          <div class="client-card card-glass">
            <h3>À propos du client</h3>
            <div class="client-profile">
              <img [src]="job.clientAvatar" [alt]="job.clientName" class="avatar" />
              <div>
                <h4>{{ job.clientName }}</h4>
                <p class="location">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 2px;">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {{ job.location }}
                </p>
                <p class="verified">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 3px;">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Paiement garanti en séquestre
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <ng-template #notFound>
      <div class="not-found card-glass">
        <h2>Mission introuvable</h2>
        <a routerLink="/jobs" class="btn btn-primary">Retourner aux missions</a>
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
      this.jobService.getJobById(id).subscribe({
        next: (j) => {
          this.job = j;
          if (this.job) {
            this.proposalsCount = this.job.proposalsCount || 0;
            this.proposalService.getProposalsForJob(this.job.id).subscribe({
              next: (res) => {
                if (res?.proposals?.length) {
                  this.proposalsCount = res.proposals.length;
                }
              },
              error: () => {}
            });
          }
        },
        error: () => {}
      });
    }
  }
}
