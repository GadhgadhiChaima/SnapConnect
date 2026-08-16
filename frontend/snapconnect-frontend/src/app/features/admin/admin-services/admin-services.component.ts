import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="admin-services-page">
      <div class="container">
        <div class="page-header flex-between">
          <div>
            <a routerLink="/admin/dashboard" class="back-link">← Back to Admin Hub</a>
            <h1>Mobile Service Packages Moderation</h1>
            <p>Review creator gig offerings, package deliverables, and pricing guidelines.</p>
          </div>
        </div>

        <div class="services-table-card card-glass">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Service Title</th>
                  <th>Creator</th>
                  <th>Category</th>
                  <th>Starting Price</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (s of services(); track s.id) {
                  <tr>
                    <td>
                      <strong>{{ s.title }}</strong>
                    </td>
                    <td>{{ s.creator }}</td>
                    <td><span class="badge badge-accent">{{ s.category }}</span></td>
                    <td><strong>\${{ s.price }}</strong></td>
                    <td>★ {{ s.rating }} ({{ s.reviews }} reviews)</td>
                    <td>
                      <button (click)="removeService(s.id)" class="btn btn-ghost btn-xs text-danger">Remove</button>
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
    .admin-services-page { padding-top: calc(var(--navbar-height) + var(--space-8)); padding-bottom: var(--space-20); }
    .back-link { font-size: var(--font-size-xs); color: var(--color-primary-400); text-decoration: none; margin-bottom: var(--space-2); display: inline-block; }
    .page-header { margin-bottom: var(--space-8); }
    .page-header h1 { font-size: var(--font-size-3xl); font-weight: var(--font-weight-black); margin: 0 0 var(--space-1); }
    .page-header p { color: var(--color-text-secondary); font-size: var(--font-size-base); }
    .services-table-card { padding: var(--space-6) var(--space-8); border-radius: var(--radius-2xl); }
    .table-responsive { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
    .admin-table th { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); color: var(--color-text-muted); font-size: 11px; text-transform: uppercase; text-align: left; }
    .admin-table td { padding: var(--space-4); border-bottom: 1px solid var(--color-border-subtle); vertical-align: middle; }
    .text-danger { color: var(--color-error); }
  `]
})
export class AdminServicesComponent {
  services = signal([
    { id: 'srv-1', title: '3 Viral UGC TikToks shot on iPhone 16 Pro with Voiceover', creator: 'Sarah Jenkins', category: 'Reels & TikTok', price: 75, rating: 5.0, reviews: 31 }
  ]);

  removeService(id: string): void {
    if (confirm('Remove this service from marketplace?')) {
      this.services.update(prev => prev.filter(s => s.id !== id));
    }
  }
}
