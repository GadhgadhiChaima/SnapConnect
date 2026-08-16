import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { CreatorCardComponent } from '../../../../shared/components/creator-card/creator-card.component';
import { CategoryService, PLATFORM_CATEGORIES } from '../../../../core/services/category.service';
import { CreatorProfile } from '../../../../core/models/creator.model';

@Component({
  selector: 'app-creator-list',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, FooterComponent, CreatorCardComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="marketplace-page">
      <div class="container">
        <!-- Page Header -->
        <div class="page-header">
          <span class="badge badge-primary">Mobile Creators Marketplace</span>
          <h1>Find Smartphone Photographers & Videographers</h1>
          <p>Discover verified creators equipped with modern 4K/HDR smartphones and gimbal rigs.</p>
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
                placeholder="Search creator name, skills, smartphone model (e.g. iPhone 16 Pro)..."
                class="form-input"
              />
            </div>

            <div class="filter-select-wrap">
              <select [(ngModel)]="selectedCategory" (ngModelChange)="applyFilters()" class="form-select">
                <option value="">All Categories</option>
                @for (cat of categories; track cat.id) {
                  <option [value]="cat.id">{{ cat.emoji }} {{ cat.name }}</option>
                }
              </select>
            </div>

            <div class="filter-select-wrap">
              <select [(ngModel)]="selectedGear" (ngModelChange)="applyFilters()" class="form-select">
                <option value="">Any Smartphone</option>
                <option value="iPhone 16 Pro">iPhone 16 Pro / Max</option>
                <option value="iPhone 15 Pro">iPhone 15 Pro / Max</option>
                <option value="Samsung Galaxy S24 Ultra">Galaxy S24 Ultra</option>
                <option value="Google Pixel 9 Pro">Google Pixel 9 Pro</option>
              </select>
            </div>

            <div class="filter-select-wrap">
              <select [(ngModel)]="sortBy" (ngModelChange)="applyFilters()" class="form-select">
                <option value="rating">Top Rated ★</option>
                <option value="projects">Most Completed</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <!-- Quick category chips -->
          <div class="quick-chips">
            <button
              class="chip"
              [class.active]="selectedCategory === ''"
              (click)="selectCategory('')">
              All
            </button>
            @for (cat of categories.slice(0, 6); track cat.id) {
              <button
                class="chip"
                [class.active]="selectedCategory === cat.id"
                (click)="selectCategory(cat.id)">
                {{ cat.emoji }} {{ cat.name }}
              </button>
            }
          </div>
        </div>

        <!-- Results Counter & Status -->
        <div class="results-header">
          <p class="results-count">
            Showing <strong>{{ filteredCreators().length }}</strong> mobile creators
          </p>
        </div>

        <!-- Creators Grid -->
        @if (filteredCreators().length > 0) {
          <div class="creators-grid">
            @for (creator of filteredCreators(); track creator.id) {
              <app-creator-card [creator]="creator"></app-creator-card>
            }
          </div>
        } @else {
          <div class="empty-state card-glass">
            <div class="empty-icon">📱</div>
            <h3>No creators match your criteria</h3>
            <p>Try adjusting your search query, smartphone model filter, or category selection.</p>
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
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
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

    .quick-chips {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
      padding-top: var(--space-2);
      border-top: 1px solid var(--color-border-subtle);
    }

    .chip {
      padding: 5px 14px;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .chip:hover, .chip.active {
      background: var(--color-primary-light);
      border-color: var(--color-primary-500);
      color: #fff;
    }

    .chip.active {
      background: var(--color-primary-500);
      box-shadow: 0 2px 10px var(--color-primary-glow);
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

    .creators-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
export class CreatorListComponent implements OnInit {
  private route = inject(ActivatedRoute);

  searchQuery = '';
  selectedCategory = '';
  selectedGear = '';
  sortBy = 'rating';

  categories = PLATFORM_CATEGORIES;

  allCreators: CreatorProfile[] = [
    {
      id: 'cr-1',
      userId: 'u-1',
      fullName: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      title: 'TikTok & Reels Viral Specialist',
      bio: 'Mobile videographer with 400K+ views on client TikToks. Specializing in fast-paced cuts, trendy transitions, and hook psychology.',
      location: 'Paris, France',
      hourlyRate: 45,
      rating: 4.95,
      reviewsCount: 38,
      completedProjectsCount: 47,
      availabilityStatus: 'AVAILABLE',
      isVerified: true,
      specializations: ['Reels & TikTok', 'UGC Content', 'Fashion'],
      equipment: {
        smartphoneModel: 'iPhone 16 Pro Max',
        gimbal: 'DJI Osmo Mobile 6',
        audioGear: 'Rode Wireless Pro'
      }
    },
    {
      id: 'cr-2',
      userId: 'u-2',
      fullName: 'Marc Dupont',
      email: 'marc.d@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      title: 'Food & Restaurant Mobile Storyteller',
      bio: 'Creating mouthwatering 4K 60fps reels for upscale bistros and cafes. Shot on Samsung Galaxy S24 Ultra with macro lenses.',
      location: 'Lyon, France',
      hourlyRate: 50,
      rating: 5.0,
      reviewsCount: 29,
      completedProjectsCount: 34,
      availabilityStatus: 'AVAILABLE',
      isVerified: true,
      specializations: ['Food & Restaurant', 'Product Photo', 'Promo Video'],
      equipment: {
        smartphoneModel: 'Samsung Galaxy S24 Ultra',
        gimbal: 'Zhiyun Smooth 5S',
        audioGear: 'DJI Mic 2'
      }
    },
    {
      id: 'cr-3',
      userId: 'u-3',
      fullName: 'Elena Rostova',
      email: 'elena.r@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      title: 'Real Estate & Interior Mobile Tours',
      bio: 'Ultra-wide smooth architectural walk-throughs using gimbal stabilization and HDR bracketed smartphone capture.',
      location: 'Nice, France',
      hourlyRate: 60,
      rating: 4.88,
      reviewsCount: 22,
      completedProjectsCount: 28,
      availabilityStatus: 'AVAILABLE',
      isVerified: true,
      specializations: ['Real Estate', 'Commercials', 'Events'],
      equipment: {
        smartphoneModel: 'iPhone 15 Pro Max',
        gimbal: 'Insta360 Flow',
        audioGear: 'Hollyland Lark M2'
      }
    },
    {
      id: 'cr-4',
      userId: 'u-4',
      fullName: 'Thomas Mercier',
      email: 'thomas.m@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      title: 'Event & Festival Dynamic Reels',
      bio: 'Capturing live energy and concerts with low-light optimized mobile rigs. Instant delivery for daily social coverage.',
      location: 'Marseille, France',
      hourlyRate: 40,
      rating: 4.85,
      reviewsCount: 16,
      completedProjectsCount: 20,
      availabilityStatus: 'AVAILABLE',
      isVerified: true,
      specializations: ['Events & Moments', 'Reels & TikTok'],
      equipment: {
        smartphoneModel: 'iPhone 16 Pro',
        gimbal: 'DJI OM 5',
        audioGear: 'Shure MV88+'
      }
    },
    {
      id: 'cr-5',
      userId: 'u-5',
      fullName: 'Chloe Laurent',
      email: 'chloe.l@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      title: 'E-commerce Product Stylist & UGC Creator',
      bio: 'Clean tabletop studio setups tailored for Amazon, Shopify and TikTok Shop. Crisp macro details on jewelry and cosmetics.',
      location: 'Bordeaux, France',
      hourlyRate: 55,
      rating: 4.98,
      reviewsCount: 45,
      completedProjectsCount: 52,
      availabilityStatus: 'AVAILABLE',
      isVerified: true,
      specializations: ['Product Photography', 'UGC Content', 'Fashion'],
      equipment: {
        smartphoneModel: 'iPhone 15 Pro Max',
        lighting: 'Neewer 660 LED Panel Kit',
        audioGear: 'Rode Wireless ME'
      }
    },
    {
      id: 'cr-6',
      userId: 'u-6',
      fullName: 'Lucas Weber',
      email: 'lucas.w@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
      title: 'Automotive & Streetwear Mobile Cinematographer',
      bio: 'Rolling car shots, cinematic motion blur, and urban aesthetics. Shooting 4K 120fps slow-motion sequences.',
      location: 'Strasbourg, France',
      hourlyRate: 65,
      rating: 4.92,
      reviewsCount: 27,
      completedProjectsCount: 31,
      availabilityStatus: 'AVAILABLE',
      isVerified: true,
      specializations: ['Promo Video', 'Fashion', 'Events'],
      equipment: {
        smartphoneModel: 'Google Pixel 9 Pro',
        gimbal: 'DJI Osmo Mobile 6',
        audioGear: 'DJI Mic 2'
      }
    }
  ];

  filteredCreators = signal<CreatorProfile[]>(this.allCreators);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['query']) this.searchQuery = params['query'];
      if (params['categoryId']) this.selectedCategory = params['categoryId'];
      this.applyFilters();
    });
  }

  selectCategory(catId: string): void {
    this.selectedCategory = catId;
    this.applyFilters();
  }

  applyFilters(): void {
    let list = [...this.allCreators];

    // Query filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c =>
        c.fullName.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.equipment?.smartphoneModel.toLowerCase().includes(q) ||
        c.specializations?.some(s => s.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (this.selectedCategory) {
      const catObj = this.categories.find(c => c.id === this.selectedCategory);
      if (catObj) {
        list = list.filter(c => c.specializations?.some(s => s.toLowerCase().includes(catObj.name.toLowerCase()) || catObj.name.toLowerCase().includes(s.toLowerCase())));
      }
    }

    // Gear filter
    if (this.selectedGear) {
      list = list.filter(c => c.equipment?.smartphoneModel.toLowerCase().includes(this.selectedGear.toLowerCase()));
    }

    // Sort
    if (this.sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (this.sortBy === 'projects') {
      list.sort((a, b) => b.completedProjectsCount - a.completedProjectsCount);
    } else if (this.sortBy === 'price-asc') {
      list.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
    } else if (this.sortBy === 'price-desc') {
      list.sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0));
    }

    this.filteredCreators.set(list);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedGear = '';
    this.sortBy = 'rating';
    this.applyFilters();
  }
}
