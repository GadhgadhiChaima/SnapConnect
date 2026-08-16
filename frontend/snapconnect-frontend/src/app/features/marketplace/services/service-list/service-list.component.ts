import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { ServiceCardComponent } from '../../../../shared/components/service-card/service-card.component';
import { PLATFORM_CATEGORIES } from '../../../../core/services/category.service';
import { Service } from '../../../../core/models/service.model';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, FooterComponent, ServiceCardComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="marketplace-page">
      <div class="container">
        <!-- Page Header -->
        <div class="page-header">
          <span class="badge badge-accent">Model B — Direct Service Orders</span>
          <h1>Smartphone Photo & Video Packages</h1>
          <p>Order predefined, fixed-price mobile packages with guaranteed turnaround times.</p>
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
                placeholder="Search packages (e.g. TikTok unboxing, food menu reel)..."
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
              <select [(ngModel)]="selectedDelivery" (ngModelChange)="applyFilters()" class="form-select">
                <option value="">Any Delivery Time</option>
                <option value="1">⚡ 24 Hours</option>
                <option value="2">⚡ Up to 2 Days</option>
                <option value="3">⚡ Up to 3 Days</option>
              </select>
            </div>

            <div class="filter-select-wrap">
              <select [(ngModel)]="sortBy" (ngModelChange)="applyFilters()" class="form-select">
                <option value="rating">Top Rated ★</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Results Counter & Status -->
        <div class="results-header">
          <p class="results-count">
            Showing <strong>{{ filteredServices().length }}</strong> mobile packages
          </p>
        </div>

        <!-- Services Grid -->
        @if (filteredServices().length > 0) {
          <div class="services-grid">
            @for (service of filteredServices(); track service.id) {
              <app-service-card [service]="service"></app-service-card>
            }
          </div>
        } @else {
          <div class="empty-state card-glass">
            <div class="empty-icon">📦</div>
            <h3>No packages match your search</h3>
            <p>Try clearing your category filter or broadening your search terms.</p>
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

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
export class ServiceListComponent implements OnInit {
  private route = inject(ActivatedRoute);

  searchQuery = '';
  selectedCategory = '';
  selectedDelivery = '';
  sortBy = 'rating';

  categories = PLATFORM_CATEGORIES;

  allServices: Service[] = [
    {
      id: 'srv-1',
      creatorId: 'cr-1',
      creatorName: 'Sarah Jenkins',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      title: '3 Viral UGC TikToks shot on iPhone 16 Pro with Voiceover',
      description: 'I will write the script, shoot 4K vertical footage on iPhone 16 Pro Max, add trending captions and deliver in 48h.',
      categoryName: 'Reels & TikTok',
      rating: 5.0,
      reviewsCount: 31,
      status: 'ACTIVE',
      mediaGallery: [
        {
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
          mediaType: 'IMAGE'
        }
      ],
      packages: [
        {
          tier: 'BASIC',
          title: 'Starter UGC Reel',
          description: '1 vertical video (15-30s), hook testing, color graded',
          price: 75,
          deliveryDays: 2,
          revisionsIncluded: 2,
          deliverables: ['1x 4K Video', 'Subtitles/Captions', 'Hook variations']
        }
      ]
    },
    {
      id: 'srv-2',
      creatorId: 'cr-2',
      creatorName: 'Marc Dupont',
      creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      title: 'Restaurant Menu Refresh — 15 High-End Smartphone Photos + 2 Reels',
      description: 'Full on-site mobile photo & video session for restaurants and cafes. High-resolution food macro photography.',
      categoryName: 'Food & Restaurant',
      rating: 4.9,
      reviewsCount: 18,
      status: 'ACTIVE',
      mediaGallery: [
        {
          url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
          mediaType: 'IMAGE'
        }
      ],
      packages: [
        {
          tier: 'STANDARD',
          title: 'Full Resto Package',
          description: '15 edited photos + 2 reels with background royalty-free music',
          price: 180,
          deliveryDays: 3,
          revisionsIncluded: 3,
          deliverables: ['15 Retouched Photos', '2 Instagram Reels', 'Commercial Rights']
        }
      ]
    },
    {
      id: 'srv-3',
      creatorId: 'cr-3',
      creatorName: 'Elena Rostova',
      creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      title: 'Luxury Property Video Tour — Smooth Gimbal 4K 60fps',
      description: 'Highlight your Airbnb or real estate listing with an immersive mobile walkthrough with smooth gimbal moves.',
      categoryName: 'Real Estate',
      rating: 4.95,
      reviewsCount: 15,
      status: 'ACTIVE',
      mediaGallery: [
        {
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
          mediaType: 'IMAGE'
        }
      ],
      packages: [
        {
          tier: 'BASIC',
          title: 'Property Tour Highlight',
          description: '60s cinematic walkthrough with text callouts of room dimensions',
          price: 120,
          deliveryDays: 2,
          revisionsIncluded: 2,
          deliverables: ['1x 60s Tour Video', 'Color Grade', 'Speed Ramps']
        }
      ]
    },
    {
      id: 'srv-4',
      creatorId: 'cr-5',
      creatorName: 'Chloe Laurent',
      creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      title: 'E-commerce White Background Product Pack — 10 Clean Shots',
      description: 'Amazon & Shopify compliant pure white background product photos shot in a tabletop light tent on iPhone 15 Pro Max.',
      categoryName: 'Product Photography',
      rating: 4.98,
      reviewsCount: 42,
      status: 'ACTIVE',
      mediaGallery: [
        {
          url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
          mediaType: 'IMAGE'
        }
      ],
      packages: [
        {
          tier: 'BASIC',
          title: '10 Studio Product Photos',
          description: 'Pure white background, shadow removal, and color calibration',
          price: 90,
          deliveryDays: 1,
          revisionsIncluded: 2,
          deliverables: ['10x High-Res PNGs', 'White & Transparent Backgrounds']
        }
      ]
    },
    {
      id: 'srv-5',
      creatorId: 'cr-6',
      creatorName: 'Lucas Weber',
      creatorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
      title: 'Fast-Paced Streetwear Promo — 4K 120fps Slow Motion Edits',
      description: 'Hype video for fashion brands featuring quick cuts, bass-boosted sound design, and mobile-native color grade.',
      categoryName: 'Fashion & Lifestyle',
      rating: 4.91,
      reviewsCount: 19,
      status: 'ACTIVE',
      mediaGallery: [
        {
          url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
          mediaType: 'IMAGE'
        }
      ],
      packages: [
        {
          tier: 'STANDARD',
          title: 'Hype Streetwear Reel',
          description: '30s high-energy reel, sound design, sound FX sync',
          price: 130,
          deliveryDays: 2,
          revisionsIncluded: 2,
          deliverables: ['30s Master Video', '9:16 format', 'Audio mix']
        }
      ]
    }
  ];

  filteredServices = signal<Service[]>(this.allServices);

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
    let list = [...this.allServices];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.creatorName.toLowerCase().includes(q) ||
        s.categoryName?.toLowerCase().includes(q)
      );
    }

    if (this.selectedCategory) {
      list = list.filter(s => s.categoryName === this.selectedCategory);
    }

    if (this.selectedDelivery) {
      const maxDays = Number(this.selectedDelivery);
      list = list.filter(s => (s.packages?.[0]?.deliveryDays || 99) <= maxDays);
    }

    if (this.sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (this.sortBy === 'price-asc') {
      list.sort((a, b) => (a.packages?.[0]?.price || 0) - (b.packages?.[0]?.price || 0));
    } else if (this.sortBy === 'price-desc') {
      list.sort((a, b) => (b.packages?.[0]?.price || 0) - (a.packages?.[0]?.price || 0));
    }

    this.filteredServices.set(list);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedDelivery = '';
    this.sortBy = 'rating';
    this.applyFilters();
  }
}
