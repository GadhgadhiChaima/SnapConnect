import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { GigServiceService } from '../../../core/services/gig-service.service';
import { GigService, GigPackage } from '../../../core/models/gig-service.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-creator-services',
  standalone: true,
  imports: [FormsModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="services-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-primary">Project Catalog & Packages</span>
            <h1>Mes Services & Packages Clés en Main</h1>
            <p>Proposez des offres packagées prêtes à l'achat pour vos tournages smartphone 4K, reels et photos.</p>
          </div>
          <button (click)="openCreateModal()" class="btn btn-primary btn-md add-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Créer un nouveau package
          </button>
        </div>

        <!-- Services List -->
        @if (gigService.services().length > 0) {
          <div class="services-grid">
            @for (item of gigService.services(); track item.id) {
              <div class="service-card card-glass animate-fade-in" [class.paused]="item.status === 'PAUSED'">
                <div class="card-head flex-between">
                  <div class="badge-group">
                    <span class="badge badge-primary">{{ item.categoryName }}</span>
                    <span class="badge" [class.badge-success]="item.status === 'ACTIVE'" [class.badge-neutral]="item.status === 'PAUSED'">
                      ● {{ item.status === 'ACTIVE' ? 'En ligne' : 'En pause' }}
                    </span>
                  </div>
                  <div class="status-toggle-wrap">
                    <button
                      (click)="toggleStatus(item.id)"
                      class="btn btn-outline btn-xs"
                      [title]="item.status === 'ACTIVE' ? 'Mettre en pause' : 'Activer le service'"
                    >
                      {{ item.status === 'ACTIVE' ? 'Mettre en pause' : 'Activer' }}
                    </button>
                    <button
                      (click)="deleteService(item.id)"
                      class="btn btn-ghost btn-xs text-danger"
                      title="Supprimer ce service"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                <h3 class="service-title">{{ item.title }}</h3>
                <p class="service-desc">{{ item.description }}</p>

                <!-- Smartphone & Gear badge -->
                <div class="gear-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                  </svg>
                  <span>Matériel utilisé : <strong>{{ item.deviceUsed }}</strong></span>
                </div>

                <!-- 3 Packages Tier Comparison -->
                <div class="packages-strip">
                  @for (pkg of item.packages; track pkg.tier) {
                    <div class="pkg-pill" [class.recommended]="pkg.tier === 'STANDARD'">
                      <div class="pkg-tier-label">{{ pkg.tier }}</div>
                      <div class="pkg-price">{{ pkg.price }} DT</div>
                      <div class="pkg-time">Livraison en {{ pkg.deliveryDays }} j</div>
                      <div class="pkg-feat">{{ pkg.title }}</div>
                    </div>
                  }
                </div>

                <div class="card-footer flex-between">
                  <span class="date">Créé le : {{ item.createdAt || 'Récemment' }}</span>
                  <span class="orders-count">⭐️ {{ item.rating || 5.0 }} ({{ item.reviewsCount || 0 }} avis)</span>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state card-glass animate-scale-in">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-primary-400);">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <h3>Vous n'avez pas encore de packages de services</h3>
            <p>Créez votre première offre (ex. 3 Reels TikTok 4K, 10 Packshots Produits) pour permettre aux marques de commander directement sans attendre.</p>
            <button (click)="openCreateModal()" class="btn btn-primary btn-md">
              + Créer mon premier package
            </button>
          </div>
        }
      </div>
    </main>

    <!-- Modal : Créer un Service -->
    @if (showModal()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="closeModal()" aria-label="Fermer">✕</button>

          <div class="modal-header">
            <h2>Créer une nouvelle offre packagée</h2>
            <p class="modal-sub">Définissez vos tarifs et délais pour vos tournages smartphone professionnels.</p>
          </div>

          <form (ngSubmit)="saveService()" class="service-form">
            <!-- Titre -->
            <div class="form-group">
              <label class="form-label" for="serviceTitle">Titre de l'offre <span class="required">*</span></label>
              <input
                type="text"
                id="serviceTitle"
                [(ngModel)]="formTitle"
                name="title"
                class="form-input"
                placeholder="ex. 3 TikToks UGC Viraux pour Cosmétiques & Mode"
                required
              />
            </div>

            <!-- Catégorie & Smartphone -->
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="serviceCategory">Catégorie</label>
                <select id="serviceCategory" [(ngModel)]="formCategory" name="category" class="form-select">
                  <option value="Reels & TikTok">Reels & TikTok</option>
                  <option value="Photos Produits">Photos Produits</option>
                  <option value="Resto & Café">Resto & Café</option>
                  <option value="Mode & Beauté">Mode & Beauté</option>
                  <option value="UGC & Témoignages">UGC & Témoignages</option>
                  <option value="Immobilier">Immobilier</option>
                  <option value="Événements">Événements</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="serviceGear">Smartphone utilisé <span class="required">*</span></label>
                <input
                  type="text"
                  id="serviceGear"
                  [(ngModel)]="formDevice"
                  name="device"
                  class="form-input"
                  placeholder="ex. iPhone 16 Pro Max • DJI OM 6"
                  required
                />
              </div>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label class="form-label" for="serviceDesc">Description du service <span class="required">*</span></label>
              <textarea
                id="serviceDesc"
                [(ngModel)]="formDescription"
                name="description"
                class="form-textarea"
                rows="3"
                placeholder="Détaillez le déroulement, votre style de prise de vue, l'éclairage et la livraison des fichiers..."
                required
              ></textarea>
            </div>

            <!-- Configuration des 3 Paliers (Basic, Standard, Premium) -->
            <div class="tiers-section">
              <h4>Paliers de Tarifs & Délais</h4>

              <div class="tiers-inputs-grid">
                <!-- Palier Starter -->
                <div class="tier-input-card card">
                  <span class="tier-badge">BASIC (Starter)</span>
                  <div class="form-group">
                    <label class="form-label-xs">Nom du palier</label>
                    <input type="text" [(ngModel)]="tierBasicTitle" name="bTitle" class="form-input input-xs" placeholder="Pack 1 Reel" />
                  </div>
                  <div class="form-group">
                    <label class="form-label-xs">Prix (DT)</label>
                    <input type="number" [(ngModel)]="tierBasicPrice" name="bPrice" class="form-input input-xs" placeholder="100" />
                  </div>
                  <div class="form-group">
                    <label class="form-label-xs">Délai (jours)</label>
                    <input type="number" [(ngModel)]="tierBasicDays" name="bDays" class="form-input input-xs" placeholder="2" />
                  </div>
                </div>

                <!-- Palier Standard -->
                <div class="tier-input-card card popular-tier">
                  <span class="tier-badge badge-primary">STANDARD (Recommandé)</span>
                  <div class="form-group">
                    <label class="form-label-xs">Nom du palier</label>
                    <input type="text" [(ngModel)]="tierStdTitle" name="sTitle" class="form-input input-xs" placeholder="Pack 3 Reels" />
                  </div>
                  <div class="form-group">
                    <label class="form-label-xs">Prix (DT)</label>
                    <input type="number" [(ngModel)]="tierStdPrice" name="sPrice" class="form-input input-xs" placeholder="250" />
                  </div>
                  <div class="form-group">
                    <label class="form-label-xs">Délai (jours)</label>
                    <input type="number" [(ngModel)]="tierStdDays" name="sDays" class="form-input input-xs" placeholder="3" />
                  </div>
                </div>

                <!-- Palier Premium -->
                <div class="tier-input-card card">
                  <span class="tier-badge">PREMIUM (Booster)</span>
                  <div class="form-group">
                    <label class="form-label-xs">Nom du palier</label>
                    <input type="text" [(ngModel)]="tierPremTitle" name="pTitle" class="form-input input-xs" placeholder="Pack 5 Reels + Ads" />
                  </div>
                  <div class="form-group">
                    <label class="form-label-xs">Prix (DT)</label>
                    <input type="number" [(ngModel)]="tierPremPrice" name="pPrice" class="form-input input-xs" placeholder="400" />
                  </div>
                  <div class="form-group">
                    <label class="form-label-xs">Délai (jours)</label>
                    <input type="number" [(ngModel)]="tierPremDays" name="pDays" class="form-input input-xs" placeholder="5" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions Modal -->
            <div class="modal-actions">
              <button type="button" (click)="closeModal()" class="btn btn-outline">
                Annuler
              </button>
              <button
                type="submit"
                [disabled]="!formTitle.trim() || !formDescription.trim()"
                class="btn btn-primary submit-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Publier le package
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .services-page {
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
      font-weight: var(--font-weight-black);
      margin: var(--space-2) 0;
    }

    .page-header p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
    }

    .add-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: var(--font-weight-bold);
    }

    .services-grid {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .service-card {
      padding: var(--space-6) var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      transition: all var(--transition-base);
    }

    .service-card.paused {
      opacity: 0.65;
      filter: grayscale(0.2);
    }

    .card-head {
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .badge-group {
      display: flex;
      gap: var(--space-2);
      align-items: center;
    }

    .status-toggle-wrap {
      display: flex;
      gap: var(--space-2);
    }

    .service-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      margin: 0;
      color: var(--color-text-primary);
    }

    .service-desc {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: var(--line-height-relaxed);
      margin: 0;
    }

    .gear-badge {
      font-size: var(--font-size-xs);
      color: var(--color-primary-300);
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.25);
      border-radius: var(--radius-full);
      padding: 4px 12px;
      display: inline-flex;
      align-items: center;
      width: fit-content;
    }

    /* Packages comparison strip */
    .packages-strip {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-3);
      margin: var(--space-2) 0;
    }

    .pkg-pill {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-3) var(--space-4);
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .pkg-pill.recommended {
      border-color: var(--color-primary-500);
      background: rgba(139, 92, 246, 0.08);
    }

    .pkg-tier-label {
      font-size: 10px;
      font-weight: var(--font-weight-bold);
      text-transform: uppercase;
      color: var(--color-primary-400);
      letter-spacing: 0.05em;
    }

    .pkg-price {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-black);
      color: var(--color-success);
    }

    .pkg-time {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .pkg-feat {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-top: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-footer {
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border-subtle);
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .text-danger { color: var(--color-error); }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: var(--space-12) var(--space-6);
      border-radius: var(--radius-2xl);
    }
    .empty-icon { font-size: 3rem; margin-bottom: var(--space-3); }
    .empty-state h3 { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); margin-bottom: var(--space-2); }
    .empty-state p { color: var(--color-text-secondary); margin-bottom: var(--space-6); max-width: 500px; margin-left: auto; margin-right: auto; }

    /* Modal Backdrop & Card */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: var(--z-modal);
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
    }

    .modal-card {
      position: relative;
      max-width: 650px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      padding: var(--space-8);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-xl), 0 0 30px rgba(139, 92, 246, 0.2);
    }

    .close-btn {
      position: absolute;
      top: var(--space-4);
      right: var(--space-4);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--color-text-muted);
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      cursor: pointer;
    }
    .close-btn:hover { color: #fff; background: rgba(239, 68, 68, 0.2); }

    .modal-header h2 { font-size: var(--font-size-xl); font-weight: var(--font-weight-extrabold); margin-bottom: 2px; }
    .modal-sub { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-bottom: var(--space-4); }

    .service-form { display: flex; flex-direction: column; gap: var(--space-4); }
    .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }

    /* Tiers section in modal */
    .tiers-section {
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-4);
    }
    .tiers-section h4 { font-size: var(--font-size-sm); margin-bottom: var(--space-3); color: var(--color-primary-300); }

    .tiers-inputs-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-3);
    }

    .tier-input-card {
      padding: var(--space-3);
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      background: rgba(0, 0, 0, 0.3);
    }
    .tier-input-card.popular-tier {
      border-color: var(--color-primary-500);
      background: rgba(139, 92, 246, 0.05);
    }

    .tier-badge { font-size: 9px; font-weight: bold; text-transform: uppercase; }
    .form-label-xs { font-size: 10px; color: var(--color-text-muted); margin-bottom: 2px; display: block; }
    .input-xs { font-size: 12px; padding: 4px 8px; height: 32px; }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      margin-top: var(--space-3);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border-subtle);
    }

    @media (max-width: 680px) {
      .packages-strip { grid-template-columns: 1fr; }
      .tiers-inputs-grid { grid-template-columns: 1fr; }
      .form-row-2 { grid-template-columns: 1fr; }
      .modal-card { padding: var(--space-5); }
    }
  `]
})
export class CreatorServicesComponent implements OnInit {
  gigService = inject(GigServiceService);
  auth = inject(AuthService);

  showModal = signal(false);

  // Form states
  formTitle = '';
  formCategory = 'Reels & TikTok';
  formDevice = 'iPhone 16 Pro Max • DJI OM 6';
  formDescription = '';

  tierBasicTitle = 'Pack Starter (1 Reel 4K)';
  tierBasicPrice = 120;
  tierBasicDays = 2;

  tierStdTitle = 'Pack Standard (3 Reels 4K)';
  tierStdPrice = 280;
  tierStdDays = 3;

  tierPremTitle = 'Pack Booster Viral (5 Reels)';
  tierPremPrice = 450;
  tierPremDays = 5;

  ngOnInit(): void {
    this.gigService.loadServices();
  }

  openCreateModal(): void {
    const user = this.auth.currentUser();
    if (user?.smartphoneModel) {
      this.formDevice = user.smartphoneModel;
    }
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveService(): void {
    if (!this.formTitle.trim() || !this.formDescription.trim()) return;

    const packages: GigPackage[] = [
      {
        tier: 'BASIC',
        title: this.tierBasicTitle || 'Pack Starter',
        price: this.tierBasicPrice || 100,
        deliveryDays: this.tierBasicDays || 2,
        revisionsIncluded: 0,
        deliverables: '1 format HD/4K'
      },
      {
        tier: 'STANDARD',
        title: this.tierStdTitle || 'Pack Standard',
        price: this.tierStdPrice || 250,
        deliveryDays: this.tierStdDays || 3,
        revisionsIncluded: 1,
        deliverables: 'Format 4K + retouches incluses'
      },
      {
        tier: 'PREMIUM',
        title: this.tierPremTitle || 'Pack Booster',
        price: this.tierPremPrice || 400,
        deliveryDays: this.tierPremDays || 5,
        revisionsIncluded: 2,
        deliverables: 'Pack complet 4K + déclinaisons réseaux'
      }
    ];

    const user = this.auth.currentUser();
    this.gigService.createService({
      creatorId: user?.id || 'cr-1',
      title: this.formTitle.trim(),
      categoryName: this.formCategory,
      deviceUsed: this.formDevice.trim(),
      description: this.formDescription.trim(),
      status: 'ACTIVE',
      packages: packages
    }).subscribe(() => {
      this.closeModal();
    });
  }

  toggleStatus(id: number | string): void {
    this.gigService.toggleStatus(id);
  }

  deleteService(id: number | string): void {
    if (confirm('Voulez-vous vraiment supprimer cette offre de vos services ?')) {
      this.gigService.deleteService(id);
    }
  }
}
