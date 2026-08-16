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
          <img [src]="user.avatarUrl" [alt]="user.fullName" class="avatar" />
          <div>
            <h1>Welcome back, {{ user.fullName }}! 👋</h1>
            <p class="role-badge">Active Mode: <strong>{{ user.role }}</strong></p>
          </div>
        </div>

        <div class="dash-actions">
          <a routerLink="/jobs/create" class="btn btn-primary" *ngIf="authService.isClient()">
            + Post New Brief
          </a>
          <a routerLink="/jobs" class="btn btn-primary" *ngIf="authService.isCreator()">
            🔍 Explore Mobile Jobs
          </a>
        </div>
      </div>

      <!-- CLIENT DASHBOARD VIEW -->
      <div class="dashboard-body" *ngIf="authService.isClient()">
        <div class="metrics-grid">
          <div class="metric-card card-glass">
            <span class="num">3</span>
            <span class="label">Active Posted Briefs</span>
          </div>
          <div class="metric-card card-glass">
            <span class="num">12</span>
            <span class="label">Proposals Received</span>
          </div>
          <div class="metric-card card-glass">
            <span class="num">$1,250</span>
            <span class="label">Total Spent on Shoots</span>
          </div>
        </div>

        <div class="dash-section card-glass">
          <h2>Your Active Job Listings</h2>
          <div class="listings-table">
            <div class="row header-row">
              <span>Job Title</span>
              <span>Category</span>
              <span>Budget</span>
              <span>Proposals</span>
              <span>Action</span>
            </div>
            <div class="row" *ngFor="let job of jobService.jobs() | slice:0:3">
              <span class="title">{{ job.title }}</span>
              <span><span class="badge badge-purple">{{ job.category }}</span></span>
              <span class="budget">\${{ job.budgetAmount }}</span>
              <span>{{ job.proposalsCount }} bids</span>
              <span>
                <a routerLink="/proposals/job" class="btn btn-sm btn-outline">Review Bids</a>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- CREATOR DASHBOARD VIEW -->
      <div class="dashboard-body" *ngIf="authService.isCreator()">
        <div class="metrics-grid">
          <div class="metric-card card-glass">
            <span class="num">$2,480</span>
            <span class="label">Total Mobile Shoot Earnings</span>
          </div>
          <div class="metric-card card-glass">
            <span class="num">14</span>
            <span class="label">Completed Mobile Projects</span>
          </div>
          <div class="metric-card card-glass">
            <span class="num">4.9 ★</span>
            <span class="label">Client Portfolio Rating</span>
          </div>
        </div>

        <div class="dash-section card-glass">
          <h2>Your Submitted Proposals</h2>
          <div class="listings-table">
            <div class="row header-row">
              <span>Job Title</span>
              <span>Your Bid</span>
              <span>Est. Delivery</span>
              <span>Status</span>
            </div>
            <div class="row" *ngFor="let prop of proposalService.proposals()">
              <span class="title">{{ prop.jobTitle }}</span>
              <span class="budget">\${{ prop.bidAmount }}</span>
              <span>{{ prop.estimatedDays }} Days</span>
              <span><span class="badge badge-pink">{{ prop.status }}</span></span>
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
