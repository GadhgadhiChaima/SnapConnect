import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-admin-jobs',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="admin-jobs-page">
      <div class="container">
        <div class="page-header flex-between">
          <div>
            <a routerLink="/admin/dashboard" class="back-link">← Back to Admin Hub</a>
            <h1>Job Brief Moderation & Compliance</h1>
            <p>Supervise posted mobile content briefs to ensure community guidelines and fair pricing.</p>
          </div>
        </div>

        <div class="jobs-table-card card-glass">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Client</th>
                  <th>Budget</th>
                  <th>Smartphone Requirement</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (j of jobs(); track j.id) {
                  <tr>
                    <td>
                      <strong>{{ j.title }}</strong>
                      <span class="category-sub">{{ j.category }}</span>
                    </td>
                    <td>{{ j.client }}</td>
                    <td><strong>\${{ j.budget }}</strong></td>
                    <td><span class="gear-badge">📱 {{ j.gear }}</span></td>
                    <td><span class="badge badge-success">● {{ j.status }}</span></td>
                    <td>
                      <button (click)="removeJob(j.id)" class="btn btn-ghost btn-xs text-danger">Remove</button>
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
    .admin-jobs-page { padding-top: calc(var(--navbar-height) + var(--space-8)); padding-bottom: var(--space-20); }
    .back-link { font-size: var(--font-size-xs); color: var(--color-primary-400); text-decoration: none; margin-bottom: var(--space-2); display: inline-block; }
    .page-header { margin-bottom: var(--space-8); }
    .page-header h1 { font-size: var(--font-size-3xl); font-weight: var(--font-weight-black); margin: 0 0 var(--space-1); }
    .page-header p { color: var(--color-text-secondary); font-size: var(--font-size-base); }
    .jobs-table-card { padding: var(--space-6) var(--space-8); border-radius: var(--radius-2xl); }
    .table-responsive { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
    .admin-table th { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); color: var(--color-text-muted); font-size: 11px; text-transform: uppercase; text-align: left; }
    .admin-table td { padding: var(--space-4); border-bottom: 1px solid var(--color-border-subtle); vertical-align: middle; }
    .category-sub { display: block; font-size: 11px; color: var(--color-text-muted); }
    .gear-badge { font-size: var(--font-size-xs); color: var(--color-primary-300); }
    .text-danger { color: var(--color-error); }
  `]
})
export class AdminJobsComponent {
  jobs = signal([
    { id: 'jb-1', title: '5 Aesthetic Vertical Unboxing Videos for TikTok', client: 'Bloom Cosmetics', budget: 250, gear: 'iPhone 16 Pro Max', category: 'Reels & TikTok', status: 'OPEN' },
    { id: 'jb-2', title: '20 High-Res Macro Product Photos', client: 'Bloom Cosmetics', budget: 180, gear: 'Galaxy S24 Ultra', category: 'Product Photography', status: 'OPEN' }
  ]);

  removeJob(id: string): void {
    if (confirm('Remove this brief from marketplace?')) {
      this.jobs.update(prev => prev.filter(j => j.id !== id));
    }
  }
}
