import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { JobService } from '../../../core/services/job.service';
import { Job } from '../../../core/models/job.model';

@Component({
  selector: 'app-admin-jobs',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="admin-jobs-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-primary">Modération des Briefs</span>
            <h1>Modération & Conformité des Missions</h1>
            <p>Supervisez les annonces de tournage publiées par les clients, assurez la conformité smartphone et la transparence budgétaire.</p>
          </div>
          <a routerLink="/admin/dashboard" class="btn btn-outline btn-sm">
            ← Hub Admin
          </a>
        </div>

        <!-- Controls: Search & Filter -->
        <div class="controls-bar card-glass">
          <div class="search-wrap">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Rechercher par titre, client, matériel exigé..."
              [(ngModel)]="searchQuery"
              class="search-input"
            />
          </div>

          <div class="filter-tabs">
            <button
              type="button"
              class="filter-chip"
              [class.active]="selectedStatus() === 'ALL'"
              (click)="selectedStatus.set('ALL')"
            >
              Tous ({{ allJobs().length }})
            </button>
            <button
              type="button"
              class="filter-chip"
              [class.active]="selectedStatus() === 'OPEN'"
              (click)="selectedStatus.set('OPEN')"
            >
              Ouverts ({{ countOpen() }})
            </button>
            <button
              type="button"
              class="filter-chip"
              [class.active]="selectedStatus() === 'CLOSED'"
              (click)="selectedStatus.set('CLOSED')"
            >
              Clôturés / En cours ({{ countClosed() }})
            </button>
          </div>
        </div>

        <!-- Jobs Table Card -->
        <div class="jobs-table-card card-glass animate-fade-in">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Réf. Brief</th>
                  <th>Titre & Catégorie</th>
                  <th>Client Donneur d'Ordre</th>
                  <th>Budget</th>
                  <th>Smartphone Certifié Requis</th>
                  <th>Candidatures</th>
                  <th>Statut</th>
                  <th>Actions de Modération</th>
                </tr>
              </thead>
              <tbody>
                @for (j of filteredJobs(); track j.id) {
                  <tr>
                    <td>
                      <span class="mono-id">#{{ j.id }}</span>
                    </td>
                    <td>
                      <div class="job-meta-cell">
                        <strong class="job-title">{{ j.title }}</strong>
                        <span class="cat-tag">{{ j.categoryName || j.categoryId }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="client-cell">
                        <img [src]="j.clientAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'" class="c-avatar" alt="Avatar" />
                        <div>
                          <strong>{{ j.clientName }}</strong>
                          <span class="c-loc">{{ j.location || 'Tunisie' }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong class="budget-amt">{{ j.budgetAmount || j.budgetMin }} DT</strong>
                      <span class="budget-type-sub">{{ j.budgetType === 'HOURLY' ? '/heure' : 'Forfait' }}</span>
                    </td>
                    <td>
                      <span class="gear-pill">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 4px;">
                          <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5"/>
                          <circle cx="12" cy="18" r="1"/>
                        </svg>
                        {{ j.requiredGear || 'Smartphone 4K' }}
                      </span>
                    </td>
                    <td>
                      <span class="proposals-badge">{{ j.proposalsCount || 0 }} reçue(s)</span>
                    </td>
                    <td>
                      <span class="badge" [class]="j.status === 'OPEN' ? 'badge-success' : 'badge-neutral'">
                        ● {{ j.status === 'OPEN' ? 'Ouvert' : 'Clôturé' }}
                      </span>
                    </td>
                    <td>
                      <div class="action-btns">
                        <a [routerLink]="['/jobs', j.id]" class="btn btn-outline btn-xs" title="Consulter l'annonce publique">
                          Voir ↗
                        </a>
                        <button
                          type="button"
                          class="btn btn-outline btn-xs text-danger"
                          (click)="deleteJob(j.id, j.title)"
                          title="Retirer ce brief de la plateforme"
                        >
                          Masquer
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="text-center py-6">
                      <p class="text-muted">Aucune mission ne correspond aux critères de recherche.</p>
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
    .admin-jobs-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }
    .page-header {
      margin-bottom: var(--space-8);
      gap: var(--space-4);
      flex-wrap: wrap;
    }
    .page-header h1 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      margin: var(--space-2) 0 var(--space-1);
    }
    .page-header p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
    }

    /* Controls Bar */
    .controls-bar {
      padding: var(--space-4) var(--space-5);
      border-radius: var(--radius-xl);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .search-wrap {
      position: relative;
      flex: 1;
      min-width: 260px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-muted);
    }

    .search-input {
      width: 100%;
      padding: var(--space-2) var(--space-4) var(--space-2) 36px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
    }
    .search-input:focus {
      outline: none;
      border-color: var(--color-primary-400);
    }

    .filter-tabs {
      display: flex;
      gap: var(--space-2);
    }

    .filter-chip {
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-full);
      background: transparent;
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      font-size: var(--font-size-xs);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .filter-chip:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--color-text-primary);
    }
    .filter-chip.active {
      background: var(--color-primary-500);
      color: white;
      border-color: var(--color-primary-500);
      font-weight: var(--font-weight-semibold);
    }

    /* Table */
    .jobs-table-card {
      padding: var(--space-6);
      border-radius: var(--radius-2xl);
    }

    .table-responsive {
      overflow-x: auto;
    }

    .admin-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--font-size-sm);
      text-align: left;
    }

    .admin-table th {
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--color-border);
      color: var(--color-text-muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .admin-table td {
      padding: var(--space-4);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      vertical-align: middle;
    }

    .mono-id {
      font-family: monospace;
      color: var(--color-text-muted);
      font-size: 11px;
    }

    .job-meta-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-width: 280px;
    }

    .job-title {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      line-height: 1.3;
    }

    .cat-tag {
      font-size: 10px;
      color: var(--color-primary-300);
    }

    .client-cell {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .c-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .c-loc {
      display: block;
      font-size: 10px;
      color: var(--color-text-muted);
    }

    .budget-amt {
      color: #fbbf24;
      font-size: 13px;
    }

    .budget-type-sub {
      display: block;
      font-size: 10px;
      color: var(--color-text-muted);
    }

    .gear-pill {
      font-size: 11px;
      color: var(--color-primary-300);
      background: rgba(124, 58, 237, 0.1);
      padding: 3px 8px;
      border-radius: var(--radius-full);
      display: inline-flex;
      align-items: center;
    }

    .proposals-badge {
      font-size: 11px;
      color: var(--color-text-secondary);
      background: rgba(255, 255, 255, 0.05);
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }

    .action-btns {
      display: flex;
      gap: 6px;
    }
  `]
})
export class AdminJobsComponent {
  private jobService = inject(JobService);

  searchQuery = '';
  selectedStatus = signal<'ALL' | 'OPEN' | 'CLOSED'>('ALL');

  allJobs = this.jobService.jobs;

  countOpen = computed(() => this.allJobs().filter(j => j.status === 'OPEN').length);
  countClosed = computed(() => this.allJobs().filter(j => j.status !== 'OPEN').length);

  filteredJobs = computed(() => {
    let list = this.allJobs();
    const q = this.searchQuery.toLowerCase().trim();
    const st = this.selectedStatus();

    if (st === 'OPEN') {
      list = list.filter(j => j.status === 'OPEN');
    } else if (st === 'CLOSED') {
      list = list.filter(j => j.status !== 'OPEN');
    }

    if (q) {
      list = list.filter(j =>
        j.title.toLowerCase().includes(q) ||
        (j.clientName && j.clientName.toLowerCase().includes(q)) ||
        (j.requiredGear && j.requiredGear.toLowerCase().includes(q)) ||
        (j.categoryName && j.categoryName.toLowerCase().includes(q))
      );
    }

    return list;
  });

  deleteJob(id: string, title: string): void {
    if (confirm(`Voulez-vous retirer le brief "${title}" de la marketplace ?`)) {
      this.jobService.delete(id).subscribe({
        next: () => {
          // Trigger refresh
          this.jobService.refresh();
        }
      });
    }
  }
}
