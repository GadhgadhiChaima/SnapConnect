import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ReputationService } from '../../../core/services/reputation.service';
import { TwoSidedReview } from '../../../core/models/reputation.model';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="admin-reviews-page">
      <div class="container">
        <div class="page-header flex-between">
          <div>
            <a routerLink="/admin/dashboard" class="back-link">← Back to Admin Hub</a>
            <h1>Two-Sided Ratings & Reputation Moderation</h1>
            <p>Monitor multi-criteria ratings, audit algorithmic reputation scores, and moderate reported reviews.</p>
          </div>
        </div>

        <div class="reviews-table-card card-glass">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Reviewer</th>
                  <th>Reviewee</th>
                  <th>Overall</th>
                  <th>Criteria Breakdown</th>
                  <th>Feedback Comment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (r of reviews(); track r.id) {
                  <tr>
                    <td>
                      <strong>{{ r.reviewerName }}</strong>
                      <span class="role-sub">({{ r.reviewerRole }})</span>
                    </td>
                    <td>
                      <strong>{{ r.revieweeName }}</strong>
                      <span class="role-sub">({{ r.revieweeRole }})</span>
                    </td>
                    <td>
                      <strong class="stars-val">★ {{ r.overallRating }}</strong>
                    </td>
                    <td>
                      <div class="crit-breakdown">
                        <span>Quality: <strong>{{ r.qualityRating }}/5</strong></span>
                        <span>Comms: <strong>{{ r.communicationRating }}/5</strong></span>
                        <span>Deadlines: <strong>{{ r.deadlinesRating }}/5</strong></span>
                      </div>
                    </td>
                    <td>
                      <p class="review-text">"{{ r.comment }}"</p>
                    </td>
                    <td>
                      <span class="badge badge-success">● {{ r.status }}</span>
                    </td>
                    <td>
                      <button (click)="removeReview(r.id)" class="btn btn-ghost btn-xs text-danger">Remove</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }
    .admin-reviews-page { padding-top: calc(var(--navbar-height) + var(--space-8)); padding-bottom: var(--space-20); }
    .back-link { font-size: var(--font-size-xs); color: var(--color-primary-400); text-decoration: none; margin-bottom: var(--space-2); display: inline-block; }
    .page-header { margin-bottom: var(--space-8); }
    .page-header h1 { font-size: var(--font-size-3xl); font-weight: var(--font-weight-black); margin: 0 0 var(--space-1); }
    .page-header p { color: var(--color-text-secondary); font-size: var(--font-size-base); }
    .reviews-table-card { padding: var(--space-6) var(--space-8); border-radius: var(--radius-2xl); }
    .table-responsive { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
    .admin-table th { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); color: var(--color-text-muted); font-size: 11px; text-transform: uppercase; text-align: left; }
    .admin-table td { padding: var(--space-4); border-bottom: 1px solid var(--color-border-subtle); vertical-align: middle; }
    .role-sub { display: block; font-size: 11px; color: var(--color-text-muted); }
    .stars-val { color: #fbbf24; font-size: var(--font-size-base); }
    .crit-breakdown { display: flex; flex-direction: column; font-size: 11px; color: var(--color-text-secondary); gap: 1px; }
    .crit-breakdown strong { color: var(--color-text-primary); }
    .review-text { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin: 0; max-width: 250px; font-style: italic; }
    .text-danger { color: var(--color-error); }
  `]
})
export class AdminReviewsComponent {
  reputationService = inject(ReputationService);
  reviews = this.reputationService.reviews;

  removeReview(id: string): void {
    if (confirm('Remove this review from the marketplace?')) {
      alert('Review removed.');
    }
  }
}
