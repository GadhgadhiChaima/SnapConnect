import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: 'CLIENT' | 'CREATOR' | 'ADMIN';
  verifiedHardware?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  rating: number;
  completedCount: number;
  joinedDate: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="admin-users-page">
      <div class="container">
        <div class="page-header flex-between">
          <div>
            <a routerLink="/admin/dashboard" class="back-link">← Back to Admin Hub</a>
            <h1>User & Hardware Verification Management</h1>
            <p>Verify creator smartphone rigs, grant Verified badges, and manage account statuses.</p>
          </div>
        </div>

        <div class="users-table-card card-glass">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Verified Mobile Hardware</th>
                  <th>Standing</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (u of users(); track u.id) {
                  <tr>
                    <td>
                      <div class="u-info">
                        <strong>{{ u.fullName }}</strong>
                        <span class="u-email">{{ u.email }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge" [class]="u.role === 'CREATOR' ? 'badge-primary' : 'badge-neutral'">
                        {{ u.role }}
                      </span>
                    </td>
                    <td>
                      @if (u.verifiedHardware) {
                        <span class="gear-badge">📱 {{ u.verifiedHardware }}</span>
                      } @else {
                        <span class="text-muted">—</span>
                      }
                    </td>
                    <td>
                      <span class="status-pill" [class.st-act]="u.status === 'ACTIVE'" [class.st-pend]="u.status === 'PENDING_VERIFICATION'">
                        ● {{ u.status }}
                      </span>
                    </td>
                    <td class="text-muted">{{ u.joinedDate }}</td>
                    <td>
                      <div class="action-btns">
                        @if (u.status === 'PENDING_VERIFICATION') {
                          <button (click)="verifyCreator(u.id)" class="btn btn-success btn-xs">Verify Badge ✓</button>
                        }
                        <button (click)="toggleSuspend(u.id)" class="btn btn-outline btn-xs">
                          {{ u.status === 'SUSPENDED' ? 'Unsuspend' : 'Suspend' }}
                        </button>
                      </div>
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

    .admin-users-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }

    .back-link {
      font-size: var(--font-size-xs);
      color: var(--color-primary-400);
      text-decoration: none;
      margin-bottom: var(--space-2);
      display: inline-block;
    }

    .page-header {
      margin-bottom: var(--space-8);
    }

    .page-header h1 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      margin: 0 0 var(--space-1);
    }

    .page-header p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
    }

    .users-table-card {
      padding: var(--space-6) var(--space-8);
      border-radius: var(--radius-2xl);
    }

    .table-responsive { overflow-x: auto; }

    .admin-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--font-size-sm);
    }

    .admin-table th {
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--color-border);
      color: var(--color-text-muted);
      font-size: 11px;
      text-transform: uppercase;
      text-align: left;
    }

    .admin-table td {
      padding: var(--space-4);
      border-bottom: 1px solid var(--color-border-subtle);
      vertical-align: middle;
    }

    .u-info strong { display: block; font-size: var(--font-size-sm); }
    .u-email { font-size: 11px; color: var(--color-text-muted); }

    .gear-badge {
      font-size: var(--font-size-xs);
      color: var(--color-primary-300);
    }

    .status-pill { font-size: 11px; font-weight: bold; }
    .st-act { color: var(--color-success); }
    .st-pend { color: #fbbf24; }

    .action-btns { display: flex; gap: var(--space-2); }
  `]
})
export class AdminUsersComponent {
  users = signal<AdminUser[]>([
    {
      id: 'u-1',
      fullName: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      role: 'CREATOR',
      verifiedHardware: 'iPhone 16 Pro Max (4K ProRes) • DJI OM 6',
      status: 'ACTIVE',
      rating: 4.95,
      completedCount: 47,
      joinedDate: '2026-06-01'
    },
    {
      id: 'u-2',
      fullName: 'Marc Dupont',
      email: 'marc.d@example.com',
      role: 'CREATOR',
      verifiedHardware: 'Galaxy S24 Ultra • Zhiyun Smooth 5S',
      status: 'ACTIVE',
      rating: 5.0,
      completedCount: 34,
      joinedDate: '2026-06-15'
    },
    {
      id: 'u-3',
      fullName: 'Bloom Cosmetics',
      email: 'contact@bloom.com',
      role: 'CLIENT',
      status: 'ACTIVE',
      rating: 4.9,
      completedCount: 12,
      joinedDate: '2026-07-01'
    }
  ]);

  verifyCreator(id: string): void {
    this.users.update(prev =>
      prev.map(u => (u.id === id ? { ...u, status: 'ACTIVE' } : u))
    );
    alert('Creator smartphone hardware verified!');
  }

  toggleSuspend(id: string): void {
    this.users.update(prev =>
      prev.map(u =>
        u.id === id
          ? { ...u, status: u.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED' }
          : u
      )
    );
  }
}
