import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { CreatorCardComponent } from '../../../../shared/components/creator-card/creator-card.component';
import { CategoryService, PLATFORM_CATEGORIES } from '../../../../core/services/category.service';
import { CreatorProfile } from '../../../../core/models/creator.model';
import { CreatorService } from '../../../../core/services/creator.service';
import { AuthService } from '../../../../core/services/auth.service';

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
          <span class="badge badge-primary">Créateurs Smartphones Vérifiés</span>
          <h1>Trouvez des Photographes & Vidéastes Mobiles</h1>
          <p>Découvrez des créateurs certifiés équipés de smartphones 4K/HDR et stabilisateurs professionnels.</p>
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
                placeholder="Rechercher par nom, compétence, smartphone (ex. iPhone 16 Pro)..."
                class="form-input"
              />
            </div>

            <div class="filter-select-wrap">
              <select [(ngModel)]="selectedCategory" (ngModelChange)="applyFilters()" class="form-select">
                <option value="">Toutes les catégories</option>
                @for (cat of categories; track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>

            <div class="filter-select-wrap">
              <select [(ngModel)]="selectedGear" (ngModelChange)="applyFilters()" class="form-select">
                <option value="">Tous les smartphones</option>
                <option value="iPhone 16 Pro">iPhone 16 Pro / Max</option>
                <option value="iPhone 15 Pro">iPhone 15 Pro / Max</option>
                <option value="Samsung Galaxy S24 Ultra">Galaxy S24 Ultra</option>
                <option value="Google Pixel 9 Pro">Google Pixel 9 Pro</option>
              </select>
            </div>

            <div class="filter-select-wrap">
              <select [(ngModel)]="sortBy" (ngModelChange)="applyFilters()" class="form-select">
                <option value="rating">Mieux notés</option>
                <option value="projects">Missions complétées</option>
                <option value="price-asc">Tarif : Croissant</option>
                <option value="price-desc">Tarif : Décroissant</option>
              </select>
            </div>
          </div>

          <!-- Quick category chips -->
          <div class="quick-chips">
            <button
              class="chip"
              [class.active]="selectedCategory === ''"
              (click)="selectCategory('')">
              <svg class="chip-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Tous</span>
            </button>
            @for (cat of categories.slice(0, 6); track cat.id) {
              <button
                class="chip"
                [class.active]="selectedCategory === cat.id"
                (click)="selectCategory(cat.id)">
                @switch (cat.id) {
                  @case ('reels-tiktok') {
                    <svg class="chip-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="5" y="2" width="14" height="20" rx="3" ry="3"/>
                      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" fill-opacity="0.3"/>
                    </svg>
                  }
                  @case ('product-photo') {
                    <svg class="chip-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                      <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                  }
                  @case ('real-estate') {
                    <svg class="chip-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  }
                  @case ('events') {
                    <svg class="chip-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  }
                  @case ('ugc') {
                    <svg class="chip-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    </svg>
                  }
                  @case ('food-resto') {
                    <svg class="chip-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                    </svg>
                  }
                  @default {
                    <svg class="chip-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                  }
                }
                <span>{{ cat.name }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Results Counter & Status -->
        <div class="results-header">
          <p class="results-count">
            <strong>{{ filteredCreators().length }}</strong> créateurs mobiles disponibles
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
            <div class="empty-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5"></rect>
                <circle cx="12" cy="18" r="0.9"></circle>
                <line x1="9" y1="5" x2="15" y2="5"></line>
              </svg>
            </div>
            <h3>Aucun créateur ne correspond à vos critères</h3>
            <p>Essayez d'ajuster votre recherche, vos filtres de smartphone ou la catégorie sélectionnée.</p>
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

    .search-input-wrap .search-icon {
      position: absolute;
      left: var(--space-3);
      color: var(--color-text-muted);
      pointer-events: none;
    }

    .search-input-wrap .form-input {
      padding-left: 2.6rem;
    }

    .quick-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border-subtle);
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--color-text-secondary);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      letter-spacing: 0.01em;
    }

    .chip:hover {
      background: rgba(139, 92, 246, 0.1);
      border-color: rgba(139, 92, 246, 0.35);
      color: var(--color-text-primary);
      transform: translateY(-1px);
    }

    .chip.active {
      background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-500));
      border-color: var(--color-primary-400);
      color: #fff;
      box-shadow: 0 2px 10px var(--color-primary-glow);
    }

    .chip .chip-svg {
      color: inherit;
      opacity: 0.85;
      flex-shrink: 0;
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
  private creatorService = inject(CreatorService);
  private auth = inject(AuthService);

  searchQuery = '';
  selectedCategory = '';
  selectedGear = '';
  sortBy = 'rating';

  categories = PLATFORM_CATEGORIES;

  readonly seedCreators: CreatorProfile[] = [
    {
      id: 'cr-1',
      userId: 'u-1',
      fullName: 'Sarah Ben Salem',
      email: 'sarah.bensalem@snapconnect.tn',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      title: 'Spécialiste TikTok & Reels UGC Viral',
      bio: 'Vidéaste mobile basée à Tunis avec plus de 500K vues cumulées. Spécialisée dans les montages dynamiques, transitions tendances et le storytelling pour marques tunisiennes.',
      location: 'Tunis (La Marsa), Tunisie',
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
      fullName: 'Mehdi Trabelsi',
      email: 'mehdi.trabelsi@snapconnect.tn',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      title: 'Storyteller Mobile Food & Gastronomie',
      bio: 'Création de Reels 4K 60fps alléchants pour restaurants gastronomiques, salons de thé et hôtels de charme en Tunisie. Tournage sur Galaxy S24 Ultra avec objectifs macro.',
      location: 'Sousse, Tunisie',
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
      fullName: 'Yassine Gharbi',
      email: 'yassine.gharbi@snapconnect.tn',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      title: 'Visites Immobilières & Architecture Mobile 4K',
      bio: 'Prises de vue ultra-stabilisées au stabilisateur pour villas haut standing, maisons d\'hôtes et appartements à Tunis, Gammarth et Hammamet.',
      location: 'Hammamet / Tunis, Tunisie',
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
      fullName: 'Khalil Jaziri',
      email: 'khalil.jaziri@snapconnect.tn',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
      title: 'Reels Événementiels & Soirées en Direct',
      bio: 'Couverture dynamique d\'événements, mariages modernes, concerts et festivals en Tunisie. Prises de vue en basse lumière avec livraison express en 24h.',
      location: 'Sfax, Tunisie',
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
      fullName: 'Mariem Mansour',
      email: 'mariem.mansour@snapconnect.tn',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      title: 'Styliste Produit E-commerce & Créatrice UGC',
      bio: 'Mise en scène studio et packshots macro pour cosmétiques bio, bijoux artisanaux tunisiens et marques D2C locales. Haute conversion e-commerce garantie.',
      location: 'Ariana (Ennasr), Tunisie',
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
      fullName: 'Aziz Khemir',
      email: 'aziz.khemir@snapconnect.tn',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      title: 'Vidéaste Mobile Automobile & Streetwear',
      bio: 'Plans dynamiques de véhicules, mode urbaine et séquences cinématographiques 4K 120fps au smartphone pour marques de mode et concessionnaires en Tunisie.',
      location: 'Bizerte / Tunis, Tunisie',
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

  allCreators: CreatorProfile[] = [];
  filteredCreators = signal<CreatorProfile[]>([]);

  ngOnInit(): void {
    this.loadAllCreators();

    this.route.queryParams.subscribe(params => {
      if (params['query']) this.searchQuery = params['query'];
      if (params['categoryId']) this.selectedCategory = params['categoryId'];
      this.applyFilters();
    });
  }

  loadAllCreators(): void {
    const combined: CreatorProfile[] = [];
    const seenIds = new Set<string>();
    const seenEmails = new Set<string>();

    const addCreatorIfUnique = (c: CreatorProfile, prioritize = false) => {
      if (!c) return;
      const idKey = String(c.id || c.userId || '').toLowerCase();
      const emailKey = (c.email || '').toLowerCase().trim();
      if ((idKey && seenIds.has(idKey)) || (emailKey && seenEmails.has(emailKey))) {
        return;
      }
      if (idKey) seenIds.add(idKey);
      if (emailKey) seenEmails.add(emailKey);

      if (prioritize) {
        combined.unshift(c);
      } else {
        combined.push(c);
      }
    };

    // 1. If currently authenticated user is a creator, display them in first position!
    const currentUser = this.auth.currentUser();
    if (currentUser && (currentUser.role === 'CREATOR' || currentUser.email?.includes('creator'))) {
      const currentProfile = this.creatorService.mapUserToCreatorProfile(currentUser);
      addCreatorIfUnique(currentProfile, true);
    }

    // 2. Add local storage registered creators (session persistence)
    const localCreators = this.creatorService.getLocalCreators();
    for (const lc of localCreators) {
      addCreatorIfUnique(lc, true);
    }

    // 3. Add seed creators
    for (const sc of this.seedCreators) {
      addCreatorIfUnique(sc, false);
    }

    this.allCreators = [...combined];
    this.applyFilters();

    // 4. Fetch live from MySQL backend (/api/creators)
    this.creatorService.getRegisteredCreators().subscribe({
      next: (dbCreators) => {
        if (dbCreators && dbCreators.length > 0) {
          for (const dbc of dbCreators) {
            addCreatorIfUnique(dbc, true);
          }
          this.allCreators = [...combined];
          this.applyFilters();
        }
      },
      error: () => {}
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
