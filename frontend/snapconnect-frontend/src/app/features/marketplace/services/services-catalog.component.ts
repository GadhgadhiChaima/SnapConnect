import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { GigServiceService } from '../../../core/services/gig-service.service';
import { GigService, GigPackage } from '../../../core/models/gig-service.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-services-catalog',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="catalog-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header text-center">
          <span class="badge badge-primary">Project Catalog</span>
          <h1>Catalogue de Packages Clés en Main</h1>
          <p>Commandez directement des packs Reels 4K, séances photos produits et vidéos smartphone livrés en 48-72h avec séquestre garanti.</p>

          @if (auth.isCreator()) {
            <div class="creator-cta-banner card-glass">
              <span>Vous êtes créateur ? Proposez vos propres offres packagées prêtes à l'achat.</span>
              <a routerLink="/creator/services" class="btn btn-primary btn-sm">
                + Gérer mes offres & packages
              </a>
            </div>
          }
        </div>

        <!-- Search and filters -->
        <div class="filter-bar card-glass">
          <div class="search-input-wrap">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="applyFilters()"
              placeholder="Rechercher par service, smartphone (ex. iPhone 16 Pro), style..."
              class="form-input"
            />
          </div>

          <div class="filter-select-wrap">
            <select [(ngModel)]="selectedCategory" (ngModelChange)="applyFilters()" class="form-select">
              <option value="">Toutes les catégories</option>
              <option value="Reels & TikTok">Reels & TikTok</option>
              <option value="Photos Produits">Photos Produits</option>
              <option value="Resto & Café">Resto & Café</option>
              <option value="Mode & Beauté">Mode & Beauté</option>
              <option value="UGC & Témoignages">UGC & Témoignages</option>
            </select>
          </div>

          <div class="filter-select-wrap">
            <select [(ngModel)]="selectedGear" (ngModelChange)="applyFilters()" class="form-select">
              <option value="">Tous les smartphones</option>
              <option value="iPhone 16 Pro">iPhone 16 Pro / Max</option>
              <option value="iPhone 15 Pro">iPhone 15 Pro</option>
              <option value="Samsung Galaxy S24 Ultra">Galaxy S24 Ultra</option>
              <option value="Google Pixel 9 Pro">Pixel 9 Pro</option>
            </select>
          </div>
        </div>

        <!-- Services Grid -->
        <div class="services-grid">
          @for (service of filteredServices(); track service.id) {
            <div class="catalog-card">

              <!-- Thumbnail (Upwork style - image en haut) -->
              <div class="card-thumbnail">
                <div class="thumbnail-bg">
                  <div class="thumb-overlay"></div>
                  <div class="thumb-icon-wrap">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7"></polygon>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                  </div>
                  <div class="thumb-gear-badge">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                    {{ service.deviceUsed }}
                  </div>
                </div>
              </div>

              <!-- Creator Row (sous l'image, style Upwork) -->
              <div class="card-body">
                <a [routerLink]="['/creators', service.creatorId || 'cr-1']" class="creator-row">
                  <img [src]="service.creatorAvatar" [alt]="service.creatorName" class="creator-avatar" />
                  <div class="creator-meta">
                    <strong class="creator-name">{{ service.creatorName }}</strong>
                    <span class="creator-location">Tunis, Tunisie</span>
                  </div>
                  <span class="cat-badge">{{ service.categoryName }}</span>
                </a>

                <!-- Titre du service -->
                <h3 class="service-title">{{ service.title }}</h3>

                <!-- Séparateur -->
                <div class="card-divider"></div>

                <!-- Tiers Upwork style : boutons pilule simples -->
                <div class="tier-row">
                  @for (pkg of service.packages; track pkg.tier) {
                    <button
                      class="tier-pill"
                      [class.active]="selectedTier(service.id) === pkg.tier"
                      (click)="setTier(service.id, pkg.tier)"
                    >
                      {{ pkg.tier }}
                    </button>
                  }
                </div>

                <!-- Prix + CTA (style Upwork "À partir de") -->
                @if (getActivePackage(service); as activePkg) {
                  <div class="card-footer-row">
                    <div class="price-block">
                      <span class="price-label">À partir de</span>
                      <span class="price-amount">{{ activePkg.price }} DT</span>
                      <span class="price-delivery">· {{ activePkg.deliveryDays }}j</span>
                    </div>
                    <button (click)="orderPackage(service, activePkg)" class="order-cta">
                      Commander
                    </button>
                  </div>
                }
              </div>

            </div>
          }
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .catalog-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }

    .text-center { text-align: center; }

    .page-header {
      margin-bottom: var(--space-8);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .page-header h1 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      margin: var(--space-2) 0;
    }

    .page-header p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
      max-width: 620px;
    }

    .creator-cta-banner {
      display: inline-flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-3) var(--space-6);
      border-radius: var(--radius-full);
      margin-top: var(--space-4);
      font-size: var(--font-size-xs);
      border-color: rgba(139, 92, 246, 0.4);
    }

    .filter-bar {
      display: flex;
      gap: var(--space-3);
      padding: var(--space-4);
      border-radius: var(--radius-xl);
      margin-bottom: var(--space-8);
      flex-wrap: wrap;
    }

    .search-input-wrap {
      flex: 2;
      min-width: 250px;
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: var(--space-3);
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-muted);
      pointer-events: none;
    }

    .search-input-wrap input {
      padding-left: calc(var(--space-3) + 24px);
    }

    .filter-select-wrap {
      flex: 1;
      min-width: 170px;
    }

    /* ── Card Layout (Upwork Project Catalog style) ── */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-6);
    }

    .catalog-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }

    .catalog-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.2);
      border-color: rgba(139, 92, 246, 0.3);
    }

    /* Thumbnail */
    .card-thumbnail {
      width: 100%;
      aspect-ratio: 16 / 9;
      overflow: hidden;
      flex-shrink: 0;
    }

    .thumbnail-bg {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(109, 40, 217, 0.5) 0%, rgba(15, 23, 42, 0.9) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .thumb-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.5) 100%);
    }

    .thumb-icon-wrap {
      z-index: 1;
      opacity: 0.7;
    }

    .thumb-gear-badge {
      position: absolute;
      bottom: 10px;
      left: 12px;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.12);
      color: rgba(255, 255, 255, 0.85);
      font-size: 10px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 100px;
      display: flex;
      align-items: center;
      gap: 4px;
      z-index: 2;
      white-space: nowrap;
      overflow: hidden;
      max-width: calc(100% - 24px);
      text-overflow: ellipsis;
    }

    /* Card Body */
    .card-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
    }

    /* Creator Row */
    .creator-row {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: inherit;
    }

    .creator-row:hover .creator-name {
      color: var(--color-primary-300);
    }

    .creator-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(139, 92, 246, 0.5);
      flex-shrink: 0;
    }

    .creator-meta {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .creator-name {
      font-size: 13px;
      font-weight: 700;
      transition: color 0.2s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .creator-location {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .cat-badge {
      font-size: 10px;
      font-weight: 700;
      color: var(--color-primary-300);
      background: rgba(139, 92, 246, 0.12);
      border: 1px solid rgba(139, 92, 246, 0.25);
      border-radius: 100px;
      padding: 2px 8px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* Service Title */
    .service-title {
      font-size: 14px;
      font-weight: 700;
      line-height: 1.4;
      color: var(--color-text-primary);
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.06);
    }

    /* Tiers — Upwork style pilules simples */
    .tier-row {
      display: flex;
      gap: 6px;
    }

    .tier-pill {
      flex: 1;
      padding: 6px 4px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.04);
      color: var(--color-text-muted);
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.18s ease;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-family: 'Outfit', sans-serif;
    }

    .tier-pill:hover {
      border-color: rgba(139, 92, 246, 0.5);
      color: white;
      background: rgba(139, 92, 246, 0.1);
    }

    .tier-pill.active {
      background: rgba(139, 92, 246, 0.2);
      border-color: var(--color-primary-500);
      color: var(--color-primary-200);
      box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.3) inset;
    }

    /* Footer : Prix + CTA */
    .card-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-top: auto;
    }

    .price-block {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .price-label {
      font-size: 10px;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 600;
    }

    .price-amount {
      font-size: 20px;
      font-weight: 800;
      color: white;
      line-height: 1;
    }

    .price-delivery {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .order-cta {
      background: linear-gradient(135deg, var(--color-primary-600), var(--color-secondary, #ec4899));
      color: white;
      border: none;
      border-radius: 10px;
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.2s ease, transform 0.15s ease;
      font-family: 'Outfit', sans-serif;
      white-space: nowrap;
    }

    .order-cta:hover {
      opacity: 0.88;
      transform: scale(1.03);
    }

    @media (max-width: 600px) {
      .filter-bar { flex-direction: column; }
      .services-grid { grid-template-columns: 1fr; }
      .creator-cta-banner { flex-direction: column; text-align: center; }
    }
  `]
})
export class ServicesCatalogComponent implements OnInit {
  gigService = inject(GigServiceService);
  auth = inject(AuthService);

  searchQuery = '';
  selectedCategory = '';
  selectedGear = '';

  activeTiers = signal<Record<string | number, 'BASIC' | 'STANDARD' | 'PREMIUM'>>({});

  allServices: GigService[] = [];
  filteredServices = signal<GigService[]>([]);

  ngOnInit(): void {
    this.gigService.loadServices();
    // Watch services
    setTimeout(() => {
      this.allServices = this.gigService.services();
      this.applyFilters();
    }, 50);
  }

  selectedTier(serviceId: string | number): 'BASIC' | 'STANDARD' | 'PREMIUM' {
    return this.activeTiers()[serviceId] || 'STANDARD';
  }

  setTier(serviceId: string | number, tier: 'BASIC' | 'STANDARD' | 'PREMIUM'): void {
    this.activeTiers.update(prev => ({
      ...prev,
      [serviceId]: tier
    }));
  }

  getActivePackage(service: GigService): GigPackage | undefined {
    const tier = this.selectedTier(service.id);
    return service.packages.find(p => p.tier === tier) || service.packages[0];
  }

  applyFilters(): void {
    const list = this.gigService.services().length > 0 ? this.gigService.services() : this.allServices;
    let res = [...list].filter(s => s.status === 'ACTIVE');

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      res = res.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.creatorName && s.creatorName.toLowerCase().includes(q)) ||
        s.deviceUsed.toLowerCase().includes(q)
      );
    }

    if (this.selectedCategory) {
      res = res.filter(s => s.categoryName === this.selectedCategory);
    }

    if (this.selectedGear) {
      res = res.filter(s => s.deviceUsed.toLowerCase().includes(this.selectedGear.toLowerCase()));
    }

    this.filteredServices.set(res);
  }

  orderPackage(service: GigService, pkg: GigPackage): void {
    alert(`Commande de "${pkg.title}" (${pkg.price} DT) auprès de ${service.creatorName}.\n\nSéquestre garanti SnapConnect de ${pkg.price} DT activé ! Redirection vers la commande...`);
  }
}
