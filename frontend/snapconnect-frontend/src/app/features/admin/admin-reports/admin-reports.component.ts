import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="admin-reports-page">
      <div class="container">
        <div class="page-header flex-between">
          <div>
            <a routerLink="/admin/dashboard" class="back-link">← Back to Admin Hub</a>
            <h1>Trust & Safety Reports</h1>
            <p>User-submitted flags regarding off-platform payment attempts, spam, or terms violations.</p>
          </div>
        </div>

        <div class="reports-table-card card-glass">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Reported Item / User</th>
                  <th>Reason</th>
                  <th>Reported By</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (r of reports(); track r.id) {
                  <tr>
                    <td><strong>#{{ r.id }}</strong></td>
                    <td><strong>{{ r.target }}</strong> ({{ r.type }})</td>
                    <td><span class="badge badge-warning">{{ r.reason }}</span></td>
                    <td class="text-muted">{{ r.reporter }}</td>
                    <td><span class="badge badge-neutral">● {{ r.status }}</span></td>
                    <td>
                      <button (click)="dismiss(r.id)" class="btn btn-outline btn-xs">Dismiss</button>
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
    .admin-reports-page { padding-top: calc(var(--navbar-height) + var(--space-8)); padding-bottom: var(--space-20); }
    .back-link { font-size: var(--font-size-xs); color: var(--color-primary-400); text-decoration: none; margin-bottom: var(--space-2); display: inline-block; }
    .page-header { margin-bottom: var(--space-8); }
    .page-header h1 { font-size: var(--font-size-3xl); font-weight: var(--font-weight-black); margin: 0 0 var(--space-1); }
    .page-header p { color: var(--color-text-secondary); font-size: var(--font-size-base); }
    .reports-table-card { padding: var(--space-6) var(--space-8); border-radius: var(--radius-2xl); }
    .table-responsive { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
    .admin-table th { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); color: var(--color-text-muted); font-size: 11px; text-transform: uppercase; text-align: left; }
    .admin-table td { padding: var(--space-4); border-bottom: 1px solid var(--color-border-subtle); vertical-align: middle; }
  `]
})
export class AdminReportsComponent {
  reports = signal([
    { id: 'rep-1', target: 'User #998', type: 'USER', reason: 'Attempted Off-Platform Wire Payment', reporter: 'Bloom Cosmetics', status: 'PENDING' }
  ]);

  dismiss(id: string): void {
    this.reports.update(prev => prev.filter(r => r.id !== id));
    alert('Report dismissed.');
  }
}
