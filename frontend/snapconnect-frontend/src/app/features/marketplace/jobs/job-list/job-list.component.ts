import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { JobCardComponent } from '../../../../shared/components/job-card/job-card.component';
import { PLATFORM_CATEGORIES } from '../../../../core/services/category.service';
import { JobService } from '../../../../core/services/job.service';
import { Job } from '../../../../core/models/job.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, FooterComponent, JobCardComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="marketplace-page">
      <div class="container">
        <!-- Page Header -->
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-gold">Missions & Briefs Clients</span>
            <h1>Missions & Tournages Mobiles</h1>
            <p>Postulez aux briefs ouverts avec les spécifications de votre équipement smartphone.</p>
          </div>
          @if (!auth.isCreator()) {
            <a routerLink="/client/jobs/create" class="btn btn-primary btn-md">
              + Publier une mission
            </a>
          }
        </div>

        <!-- Search & Filter Bar -->
        <div class="search-filter-card card-glass">
          <div class="search-inputs">
            <div class="search-input-wrap">
              <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="applyFilters()"
                placeholder="Rechercher par titre, compétences, équipement (ex. restaurant, mode, produit)..."
                class="form-input"
              />
            </div>

            <div class="filter-select-wrap">
              <select [(ngModel)]="selectedCategory" (ngModelChange)="applyFilters()" class="form-select">
                <option value="">Toutes les catégories</option>
                @for (cat of categories; track cat.id) {
                  <option [value]="cat.name">{{ cat.name }}</option>
                }
              </select>
            </div>

            <div class="filter-select-wrap">
              <select [(ngModel)]="selectedBudgetType" (ngModelChange)="applyFilters()" class="form-select">
                <option value="">Tous les types de budget</option>
                <option value="FIXED">Prix fixe</option>
                <option value="HOURLY">Taux horaire</option>
              </select>
            </div>

            <div class="filter-select-wrap">
              <select [(ngModel)]="selectedLocation" (ngModelChange)="applyFilters()" class="form-select">
                <option value="">Toutes les villes</option>
                <option value="remote">À distance / En ligne</option>
                <option value="Tunis">Tunis</option>
                <option value="Sousse">Sousse</option>
                <option value="Sfax">Sfax</option>
                <option value="Hammamet">Hammamet</option>
                <option value="Djerba">Djerba</option>
                <option value="Bizerte">Bizerte</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Results Counter & Status -->
        <div class="results-header">
          <p class="results-count">
            <strong>{{ filteredJobs().length }}</strong> briefs mobiles disponibles
          </p>
        </div>

        <!-- Jobs Grid -->
        @if (filteredJobs().length > 0) {
          <div class="jobs-grid">
            @for (job of filteredJobs(); track job.id) {
              <app-job-card [job]="job"></app-job-card>
            }
          </div>
        } @else {
          <div class="empty-state card-glass">
            <div class="empty-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <h3>Aucune mission ne correspond à votre recherche</h3>
            <p>Essayez de réinitialiser vos filtres ou revenez plus tard pour de nouveaux briefs.</p>
            <button (click)="resetFilters()" class="btn btn-outline btn-sm">Réinitialiser les filtres</button>
          </div>
        }
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .marketplace-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }

    .page-header {
      margin-bottom: var(--space-8);
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .page-header h1 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-extrabold);
      margin: var(--space-2) 0;
    }

    .page-header p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
    }

    .search-filter-card {
      padding: var(--space-5);
      border-radius: var(--radius-xl);
      margin-bottom: var(--space-8);
    }

    .search-inputs {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: var(--space-3);
    }

    .search-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-input-wrap .search-icon {
      position: absolute;
      left: var(--space-3);
      color: var(--color-text-muted);
      pointer-events: none;
    }

    .search-input-wrap .form-input {
      padding-left: 2.6rem;
    }

    .empty-state .empty-icon {
      color: var(--color-primary-400);
      margin-bottom: var(--space-3);
    }

    .results-header {
      margin-bottom: var(--space-6);
    }

    .results-count {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    .results-count strong {
      color: var(--color-text-primary);
    }

    .jobs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: var(--space-6);
    }

    @media (max-width: 900px) {
      .search-inputs {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 600px) {
      .search-inputs {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class JobListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private jobService = inject(JobService);
  readonly auth = inject(AuthService);

  searchQuery = '';
  selectedCategory = '';
  selectedBudgetType = '';
  selectedLocation = '';

  categories = PLATFORM_CATEGORIES;

  filteredJobs = signal<Job[]>(this.jobService.jobs());

  ngOnInit(): void {
    this.jobService.refresh();
    this.route.queryParams.subscribe(params => {
      if (params['query']) this.searchQuery = params['query'];
      if (params['categoryId']) {
        const c = this.categories.find(cat => cat.id === params['categoryId']);
        if (c) this.selectedCategory = c.name;
      }
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let list = [...this.jobService.jobs()];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        (j.clientName && j.clientName.toLowerCase().includes(q)) ||
        (j.categoryName && j.categoryName.toLowerCase().includes(q)) ||
        (j.requiredGear && j.requiredGear.toLowerCase().includes(q)) ||
        (j.requiredSkills && j.requiredSkills.some(s => s.toLowerCase().includes(q)))
      );
    }

    if (this.selectedCategory) {
      list = list.filter(j => j.categoryName === this.selectedCategory || j.categoryId === this.selectedCategory);
    }

    if (this.selectedBudgetType) {
      list = list.filter(j => j.budgetType === this.selectedBudgetType);
    }

    if (this.selectedLocation) {
      if (this.selectedLocation === 'remote') {
        list = list.filter(j => j.isRemote);
      } else {
        list = list.filter(j => j.location.toLowerCase().includes(this.selectedLocation.toLowerCase()));
      }
    }

    this.filteredJobs.set(list);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedBudgetType = '';
    this.selectedLocation = '';
    this.applyFilters();
  }
}
