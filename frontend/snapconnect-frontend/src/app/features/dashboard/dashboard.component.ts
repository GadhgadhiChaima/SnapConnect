import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { JobService } from '../../core/services/job.service';
import { ProposalService } from '../../core/services/proposal.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-page" *ngIf="authService.currentUser() as user">
      <!-- HEADER -->
      <div class="dash-header card-glass">
        <div class="user-greeting">
          <img [src]="user.avatarUrl" [alt]="user.fullName" class="avatar" referrerpolicy="no-referrer" />
          <div>
            <h1>Bienvenue, {{ user.fullName }} !</h1>
            <p class="role-badge">Rôle actif : <strong>{{ user.role === 'CLIENT' ? 'Client' : 'Créateur' }}</strong></p>
          </div>
        </div>

        <div class="dash-actions">
          <a routerLink="/client/jobs/create" class="btn btn-primary" *ngIf="authService.isClient()">
            + Publier un brief
          </a>
          <a routerLink="/jobs" class="btn btn-primary" *ngIf="authService.isCreator()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Explorer les missions
          </a>
        </div>
      </div>

      <!-- CLIENT DASHBOARD VIEW -->
      <div class="dashboard-body" *ngIf="authService.isClient()">
        <div class="metrics-grid">
          <div class="metric-card card-glass">
            <span class="num">3</span>
            <span class="label">Briefs actifs publiés</span>
          </div>
          <div class="metric-card card-glass">
            <span class="num">12</span>
            <span class="label">Propositions reçues</span>
          </div>
          <div class="metric-card card-glass">
            <span class="num">1 250 DT</span>
            <span class="label">Total investi en tournages</span>
          </div>
        </div>

        <div class="dash-section card-glass">
          <h2>Vos briefs actifs</h2>
          <div class="listings-table">
            <div class="row header-row">
              <span>Titre de la mission</span>
              <span>Catégorie</span>
              <span>Budget</span>
              <span>Offres</span>
              <span>Action</span>
            </div>
            <div class="row" *ngFor="let job of jobService.jobs() | slice:0:3">
              <span class="title">{{ job.title }}</span>
              <span><span class="badge badge-purple">{{ job.category }}</span></span>
              <span class="budget">{{ job.budgetAmount }} DT</span>
              <span>{{ job.proposalsCount }} offres</span>
              <span>
                <a routerLink="/proposals/job" class="btn btn-sm btn-outline">Examiner les offres</a>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- CREATOR DASHBOARD VIEW -->
      <div class="dashboard-body" *ngIf="authService.isCreator()">
        <div class="metrics-grid">
          <div class="metric-card card-glass">
            <span class="num">2 480 DT</span>
            <span class="label">Gains totaux de tournage</span>
          </div>
          <div class="metric-card card-glass">
            <span class="num">14</span>
            <span class="label">Projets mobiles terminés</span>
          </div>
          <div class="metric-card card-glass">
            <span class="num">
              4.9 
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="1" style="vertical-align: -1px;">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </span>
            <span class="label">Note moyenne clients</span>
          </div>
        </div>

        <div class="dash-section card-glass">
          <h2>Vos propositions envoyées</h2>
          <div class="listings-table">
            <div class="row header-row">
              <span>Titre du brief</span>
              <span>Votre offre</span>
              <span>Délai estimé</span>
              <span>Statut</span>
            </div>
            <div class="row" *ngFor="let prop of proposalService.proposals()">
              <span class="title">{{ prop.jobTitle }}</span>
              <span class="budget">{{ prop.bidAmount }} DT</span>
              <span>{{ prop.estimatedDays }} jours</span>
              <span><span class="badge badge-pink">{{ prop.status === 'ACCEPTED' ? 'Acceptée' : prop.status === 'PENDING' ? 'En attente' : prop.status }}</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .dashboard-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
    }

    .dash-header {
      padding: 2rem;
      @include flex-between;
      margin-bottom: 2rem;

      .user-greeting {
        display: flex;
        align-items: center;
        gap: 1.25rem;

        .avatar { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; }
        h1 { font-size: 1.6rem; font-weight: 800; }
        .role-badge { font-size: 0.85rem; color: $text-muted; margin-top: 0.2rem; strong { color: $primary; } }
      }

      @include respond-to('mobile') {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;

      .metric-card {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        .num { font-size: 2rem; font-weight: 800; color: #4ade80; }
        .label { font-size: 0.85rem; color: $text-muted; margin-top: 0.25rem; }
      }

      @include respond-to('mobile') {
        grid-template-columns: 1fr;
      }
    }

    .dash-section {
      padding: 2rem;
      h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 1.25rem; }

      .listings-table {
        display: flex;
        flex-direction: column;

        .row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          align-items: center;
          padding: 0.85rem 0;
          border-bottom: 1px solid $border-color;
          font-size: 0.9rem;

          &.header-row {
            font-weight: 700;
            color: $text-muted;
            text-transform: uppercase;
            font-size: 0.75rem;
          }

          .title { font-weight: 600; color: white; }
          .budget { color: #4ade80; font-weight: 700; }
        }

        @include respond-to('tablet') {
          overflow-x: auto;
          .row { min-width: 600px; }
        }
      }
    }
  `]
})
export class DashboardComponent {
  constructor(
    public authService: AuthService,
    public jobService: JobService,
    public proposalService: ProposalService
  ) {}
}
