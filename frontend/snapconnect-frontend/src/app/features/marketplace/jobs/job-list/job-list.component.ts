import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { JobCardComponent } from '../../../../shared/components/job-card/job-card.component';
import { PLATFORM_CATEGORIES } from '../../../../core/services/category.service';
import { Job } from '../../../../core/models/job.model';

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
            <span class="badge badge-gold">Model A — Client Job Briefs</span>
            <h1>Mobile Shoots & Content Job Board</h1>
            <p>Apply to open client jobs with your mobile phone gear specifications.</p>
          </div>
          <a routerLink="/client/jobs/create" class="btn btn-primary btn-md">
            + Post a Mobile Job
          </a>
        </div>

        <!-- Search & Filter Bar -->
        <div class="search-filter-card card-glass">
          <div class="search-inputs">
            <div class="search-input-wrap">
              <span class="icon">🔍</span>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="applyFilters()"
                placeholder="Search job title, requirements, skills (e.g. restaurant, gym, product)..."
                class="form-input"
              />
            </div>

            <div class="filter-select-wrap">
              <select [(ngModel)]="selectedCategory" (ngModelChange)="applyFilters()" class="form-select">
                <option value="">All Categories</option>
                @for (cat of categories; track cat.id) {
                  <option [value]="cat.name">{{ cat.emoji }} {{ cat.name }}</option>
                }
              </select>
            </div>

            <div class="filter-select-wrap">
              <select [(ngModel)]="selectedBudgetType" (ngModelChange)="applyFilters()" class="form-select">
                <option value="">Any Budget Type</option>
                <option value="FIXED">Fixed Price</option>
                <option value="HOURLY">Hourly Rate</option>
              </select>
            </div>

            <div class="filter-select-wrap">
              <select [(ngModel)]="selectedLocation" (ngModelChange)="applyFilters()" class="form-select">
                <option value="">All Locations</option>
                <option value="remote">Remote / Online Only</option>
                <option value="Paris">Paris</option>
                <option value="Lyon">Lyon</option>
                <option value="Marseille">Marseille</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Results Counter & Status -->
        <div class="results-header">
          <p class="results-count">
            Showing <strong>{{ filteredJobs().length }}</strong> open mobile briefs
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
            <div class="empty-icon">💼</div>
            <h3>No open briefs match your search</h3>
            <p>Try clearing filters or check back later for new client postings.</p>
            <button (click)="resetFilters()" class="btn btn-outline btn-sm">Reset Filters</button>
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

    .search-input-wrap .icon {
      position: absolute;
      left: var(--space-3);
      opacity: 0.6;
    }

    .search-input-wrap .form-input {
      padding-left: 2.4rem;
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

  searchQuery = '';
  selectedCategory = '';
  selectedBudgetType = '';
  selectedLocation = '';

  categories = PLATFORM_CATEGORIES;

  allJobs: Job[] = [
    {
      id: 'jb-1',
      clientId: 'cl-1',
      clientName: 'Bloom Cosmetics',
      clientRating: 4.9,
      categoryName: 'Product Photography',
      title: 'Need 10 Aesthetic Product Photos & 3 Unboxing Reels (iPhone 15/16)',
      description: 'Looking for a female mobile creator to shoot aesthetic unboxing and texture application shots for our new skincare line.',
      budgetType: 'FIXED',
      budgetAmount: 250,
      location: 'Remote (Products shipped to you)',
      isRemote: true,
      requiredGear: 'iPhone 15/16 Pro with Ring Light',
      requiredSkills: ['Skincare UGC', 'Unboxing', 'Aesthetic Lighting'],
      proposalsCount: 7,
      status: 'OPEN',
      postedDate: new Date().toISOString()
    },
    {
      id: 'jb-2',
      clientId: 'cl-2',
      clientName: 'Le Bistro Gourmet',
      clientRating: 5.0,
      categoryName: 'Food & Restaurant',
      title: 'Evening Dinner Service & Chef Prep Mobile Videographer',
      description: 'Need a creator on-site for 2 hours on Friday evening to capture sizzling dishes, cocktail pours, and ambient restaurant vibes.',
      budgetType: 'HOURLY',
      budgetMin: 40,
      budgetMax: 65,
      location: 'Paris (11e Arrondissement)',
      isRemote: false,
      requiredGear: 'Gimbal + Smartphone 4K 60fps',
      requiredSkills: ['Food Videography', 'Low Light Mobile', 'Speed Ramping'],
      proposalsCount: 4,
      status: 'OPEN',
      postedDate: new Date().toISOString()
    },
    {
      id: 'jb-3',
      clientId: 'cl-3',
      clientName: 'Urban Sneaker Vault',
      clientRating: 4.8,
      categoryName: 'Reels & TikTok',
      title: 'Streetwear Sneaker Drop Content — 5 Quick Hit TikToks',
      description: 'Looking for a mobile shooter with sneaker culture knowledge to create dynamic on-foot reels and transition videos.',
      budgetType: 'FIXED',
      budgetAmount: 300,
      location: 'Lyon, France',
      isRemote: false,
      requiredGear: 'iPhone / Galaxy Ultra with Wide Angle',
      requiredSkills: ['Sneaker Transitions', 'Fast Motion', 'Trending Audio'],
      proposalsCount: 9,
      status: 'OPEN',
      postedDate: new Date().toISOString()
    },
    {
      id: 'jb-4',
      clientId: 'cl-4',
      clientName: 'FitPulse Gym & Wellness',
      clientRating: 4.95,
      categoryName: 'Fashion & Lifestyle',
      title: 'Crossfit Gym Workout Highlights — Mobile Dynamic Reels',
      description: 'Capture high-intensity athletes training, equipment showcases, and trainer tips. Fast turnaround for daily IG stories.',
      budgetType: 'FIXED',
      budgetAmount: 180,
      location: 'Marseille, France',
      isRemote: false,
      requiredGear: 'Smartphone with Action Mode / Gimbal',
      requiredSkills: ['Fitness Content', 'Action Tracking', 'Audio Sync'],
      proposalsCount: 5,
      status: 'OPEN',
      postedDate: new Date().toISOString()
    }
  ];

  filteredJobs = signal<Job[]>(this.allJobs);

  ngOnInit(): void {
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
    let list = [...this.allJobs];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.clientName.toLowerCase().includes(q) ||
        j.categoryName?.toLowerCase().includes(q) ||
        j.requiredGear?.toLowerCase().includes(q) ||
        j.requiredSkills?.some(s => s.toLowerCase().includes(q))
      );
    }

    if (this.selectedCategory) {
      list = list.filter(j => j.categoryName === this.selectedCategory);
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
