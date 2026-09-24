import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CategoryService } from '../../../core/services/category.service';

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  specs: string;
  iconType: string;
  count: number;
  isActive: boolean;
}

const STORAGE_KEY = 'snapconnect_admin_categories';

const DEFAULT_CATEGORIES: AdminCategory[] = [
  { id: 'cat-1', name: 'Reels & TikTok', slug: 'reels-tiktok', specs: '9:16 Vertical • 4K 60fps • Éclairage studio', iconType: 'video', count: 18, isActive: true },
  { id: 'cat-2', name: 'Contenu UGC & Témoignages', slug: 'ugc-content', specs: 'Caméra smartphone selfie • Ton authentique • 4K', iconType: 'ugc', count: 24, isActive: true },
  { id: 'cat-3', name: 'Photographie Produits', slug: 'product-photography', specs: 'Objectif Macro • Téléobjectif 5x optique • Fond neutre', iconType: 'product', count: 14, isActive: true },
  { id: 'cat-4', name: 'Restauration & Cafés', slug: 'food-restaurants', specs: '4K Cinématique 24fps • Speed ramping • Étalonnage chaud', iconType: 'food', count: 12, isActive: true },
  { id: 'cat-5', name: 'Visites Immobilières & Airbnb', slug: 'real-estate', specs: 'Ultra grand-angle 0.5x • Gimbal 3 axes • 4K 60fps', iconType: 'real-estate', count: 9, isActive: true },
  { id: 'cat-6', name: 'Mode, Lookbooks & Événements', slug: 'fashion-apparel', specs: 'Mode Portrait • Éclairage naturel • ProRes Log', iconType: 'fashion', count: 15, isActive: true },
  { id: 'cat-7', name: 'Beauté & Skincare', slug: 'beauty-cosmetics', specs: 'Macro texture • Haute colorimétrie • Ring light', iconType: 'beauty', count: 11, isActive: true },
  { id: 'cat-8', name: 'Fitness & Sport', slug: 'fitness-sport', specs: 'Action cam mobile • Ralenti 120fps • Stabilisation active', iconType: 'sport', count: 7, isActive: true }
];

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="admin-categories-page">
      <div class="container">
        <!-- Page Header -->
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-primary">Gestion du Catalogue</span>
            <h1>Spécialités & Catégories Smartphone</h1>
            <p>Configurez, ajoutez et personnalisez les niches de tournage 4K disponibles sur SnapConnect.</p>
          </div>
          <div class="header-actions">
            <a routerLink="/admin/dashboard" class="btn btn-outline btn-sm">
              ← Hub Admin
            </a>
            <button type="button" class="btn btn-primary btn-sm" (click)="openAddModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: -2px; margin-right: 4px;">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              + Nouvelle Catégorie
            </button>
          </div>
        </div>

        <!-- Success Toast Notification -->
        @if (toastMessage()) {
          <div class="alert alert-success card-glass animate-fade-in">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>{{ toastMessage() }}</span>
          </div>
        }

        <!-- Search & Metrics Controls -->
        <div class="controls-bar card-glass">
          <div class="search-wrap">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Filtrer par nom ou exigence technique..."
              [(ngModel)]="searchQuery"
              class="search-input"
            />
          </div>

          <div class="stats-pills">
            <span class="pill-stat">
              <strong>{{ categories().length }}</strong> Catégories au total
            </span>
            <span class="pill-stat active-stat">
              <strong>{{ activeCount() }}</strong> Actives sur la Marketplace
            </span>
          </div>
        </div>

        <!-- Categories Table Card -->
        <div class="categories-table-card card-glass animate-fade-in">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Icône</th>
                  <th>Nom de la catégorie</th>
                  <th>Slug URL</th>
                  <th>Spécifications 4K requises</th>
                  <th>Offres Actives</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (c of filteredCategories(); track c.id) {
                  <tr [class.row-inactive]="!c.isActive">
                    <td class="cat-icon-col">
                      <div class="cat-icon-wrap" [class.icon-inactive]="!c.isActive">
                        @switch (c.iconType) {
                          @case ('video') {
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
                          }
                          @case ('ugc') {
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2.5"/><circle cx="12" cy="18" r="1"/></svg>
                          }
                          @case ('product') {
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                          }
                          @case ('food') {
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                          }
                          @case ('real-estate') {
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                          }
                          @case ('fashion') {
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                          }
                          @case ('beauty') {
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          }
                          @case ('sport') {
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                          }
                          @default {
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                          }
                        }
                      </div>
                    </td>
                    <td>
                      <div class="name-cell">
                        <strong class="cat-name">{{ c.name }}</strong>
                        <span class="cat-id-sub">ID: {{ c.id }}</span>
                      </div>
                    </td>
                    <td>
                      <code class="slug-code">/category/{{ c.slug }}</code>
                    </td>
                    <td>
                      <span class="specs-pill">{{ c.specs }}</span>
                    </td>
                    <td>
                      <strong class="count-val">{{ c.count }} offres</strong>
                    </td>
                    <td>
                      <button
                        type="button"
                        class="status-toggle-btn"
                        [class.active-btn]="c.isActive"
                        (click)="toggleCategoryStatus(c)"
                        title="Activer / Désactiver la catégorie"
                      >
                        {{ c.isActive ? '● En ligne' : '○ Masquée' }}
                      </button>
                    </td>
                    <td>
                      <div class="actions-group">
                        <button
                          type="button"
                          class="btn btn-outline btn-xs"
                          (click)="openEditModal(c)"
                          title="Modifier les détails de la catégorie"
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          type="button"
                          class="btn btn-outline btn-xs text-danger"
                          (click)="deleteCategory(c)"
                          title="Supprimer cette catégorie"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="text-center py-8">
                      <p class="text-muted">Aucune catégorie ne correspond à votre recherche.</p>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Form: Add or Edit Category -->
    @if (modalOpen()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="closeModal()">✕</button>

          <div class="modal-header">
            <h2>{{ isEditing() ? 'Modifier la catégorie' : 'Créer une nouvelle catégorie' }}</h2>
            <p class="modal-sub">Définissez les prérequis techniques 4K et les identifiants de référencement de cette niche.</p>
          </div>

          <form (ngSubmit)="saveCategory()" class="modal-form">
            <div class="form-group">
              <label class="form-label">Nom de la catégorie *</label>
              <input
                type="text"
                [(ngModel)]="formData.name"
                name="name"
                (input)="onNameChange()"
                class="form-input"
                placeholder="ex: Beauté & Skincare, Drone & FPV..."
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Identifiant URL (Slug) *</label>
              <input
                type="text"
                [(ngModel)]="formData.slug"
                name="slug"
                class="form-input"
                placeholder="ex: beaute-skincare"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Type d'icône</label>
              <select [(ngModel)]="formData.iconType" name="iconType" class="form-select">
                <option value="video">Vidéo / Reels (Clap)</option>
                <option value="ugc">UGC (Smartphone)</option>
                <option value="product">Produits & Macro (Boîte)</option>
                <option value="food">Food & Restos (Café)</option>
                <option value="real-estate">Immobilier & Visites (Maison)</option>
                <option value="fashion">Mode & Lookbook (Étiquette)</option>
                <option value="beauty">Beauté & Cosmétiques (Étoile)</option>
                <option value="sport">Sport & Fitness (Activité)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Spécifications techniques 4K requises *</label>
              <textarea
                [(ngModel)]="formData.specs"
                name="specs"
                rows="2"
                class="form-textarea"
                placeholder="ex: 4K 60fps • Format 9:16 Vertical • Éclairage Ring Light • Audio micro cravate"
                required
              ></textarea>
              <span class="form-hint">Ces critères sont affichés aux créateurs lors du dépôt de leurs propositions.</span>
            </div>

            <div class="form-group-checkbox">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="formData.isActive" name="isActive" />
                <span>Rendre cette catégorie immédiatement active et visible sur SnapConnect</span>
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-outline" (click)="closeModal()">Annuler</button>
              <button type="submit" class="btn btn-primary">
                {{ isEditing() ? 'Enregistrer les modifications' : 'Créer la catégorie' }}
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
    .admin-categories-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }
    .page-header {
      margin-bottom: var(--space-6);
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

    .header-actions {
      display: flex;
      gap: var(--space-3);
      align-items: center;
    }

    /* Toast Alert */
    .alert-success {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-5);
      border-radius: var(--radius-lg);
      border: 1px solid rgba(34, 197, 94, 0.3);
      background: rgba(34, 197, 94, 0.12);
      color: #86efac;
      font-size: var(--font-size-sm);
      margin-bottom: var(--space-6);
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

    .stats-pills {
      display: flex;
      gap: var(--space-3);
    }

    .pill-stat {
      font-size: 12px;
      color: var(--color-text-secondary);
      background: rgba(255, 255, 255, 0.05);
      padding: 4px 12px;
      border-radius: var(--radius-full);
      border: 1px solid var(--color-border);
    }
    .pill-stat strong {
      color: var(--color-text-primary);
    }

    .active-stat {
      border-color: rgba(34, 197, 94, 0.3);
      background: rgba(34, 197, 94, 0.08);
    }
    .active-stat strong {
      color: #22c55e;
    }

    /* Table */
    .categories-table-card {
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

    .row-inactive {
      opacity: 0.6;
    }

    .cat-icon-col {
      width: 50px;
    }

    .cat-icon-wrap {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(139, 92, 246, 0.15);
      border: 1px solid rgba(139, 92, 246, 0.3);
      color: var(--color-primary-300);
    }

    .icon-inactive {
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--color-border);
      color: var(--color-text-muted);
    }

    .name-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cat-name {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
    }

    .cat-id-sub {
      font-size: 10px;
      color: var(--color-text-muted);
      font-family: monospace;
    }

    .slug-code {
      font-family: monospace;
      font-size: 12px;
      color: var(--color-primary-300);
      background: rgba(124, 58, 237, 0.08);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .specs-pill {
      font-size: 11px;
      color: var(--color-text-secondary);
      background: rgba(255, 255, 255, 0.04);
      padding: 3px 8px;
      border-radius: var(--radius-md);
      display: inline-block;
      max-width: 260px;
      line-height: 1.3;
    }

    .count-val {
      font-size: 12px;
      color: var(--color-text-secondary);
    }

    .status-toggle-btn {
      padding: 3px 10px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 600;
      border: 1px solid var(--color-border);
      background: rgba(255, 255, 255, 0.05);
      color: var(--color-text-muted);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .status-toggle-btn.active-btn {
      background: rgba(34, 197, 94, 0.15);
      border-color: rgba(34, 197, 94, 0.4);
      color: #4ade80;
    }

    .actions-group {
      display: flex;
      gap: 6px;
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: var(--z-modal);
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
    }

    .modal-card {
      position: relative;
      max-width: 520px;
      width: 100%;
      padding: var(--space-8);
      border-radius: var(--radius-2xl);
    }

    .close-btn {
      position: absolute;
      top: var(--space-4);
      right: var(--space-4);
      background: none;
      border: none;
      color: var(--color-text-muted);
      font-size: 1.2rem;
      cursor: pointer;
    }
    .close-btn:hover {
      color: var(--color-text-primary);
    }

    .modal-header h2 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      margin: 0 0 4px;
    }
    .modal-sub {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-5);
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: var(--space-2) var(--space-3);
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none;
      border-color: var(--color-primary-400);
    }

    .form-hint {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .form-group-checkbox {
      padding: var(--space-2) 0;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      cursor: pointer;
    }
    .checkbox-label input {
      accent-color: var(--color-primary-500);
      width: 16px;
      height: 16px;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      margin-top: var(--space-3);
    }
  `]
})
export class AdminCategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);

  categories = signal<AdminCategory[]>([]);
  searchQuery = '';
  modalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  toastMessage = signal<string | null>(null);

  formData: AdminCategory = {
    id: '',
    name: '',
    slug: '',
    specs: '',
    iconType: 'video',
    count: 0,
    isActive: true
  };

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.categories.set(parsed);
          return;
        }
      }
    } catch {}
    this.categories.set(DEFAULT_CATEGORIES);
    this.persist(DEFAULT_CATEGORIES);
  }

  persist(cats: AdminCategory[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
    } catch {}
  }

  activeCount = computed(() => this.categories().filter(c => c.isActive).length);

  filteredCategories = computed(() => {
    const list = this.categories();
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      c.specs.toLowerCase().includes(q)
    );
  });

  openAddModal(): void {
    this.isEditing.set(false);
    this.formData = {
      id: `cat-${Date.now()}`,
      name: '',
      slug: '',
      specs: '4K 60fps • Format 9:16 Vertical • Étalonnage pro',
      iconType: 'video',
      count: 0,
      isActive: true
    };
    this.modalOpen.set(true);
  }

  openEditModal(c: AdminCategory): void {
    this.isEditing.set(true);
    this.formData = { ...c };
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  onNameChange(): void {
    if (!this.isEditing()) {
      this.formData.slug = this.formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
  }

  saveCategory(): void {
    if (!this.formData.name.trim() || !this.formData.slug.trim()) return;

    let updatedList: AdminCategory[];
    if (this.isEditing()) {
      updatedList = this.categories().map(c => c.id === this.formData.id ? { ...this.formData } : c);
      this.showToast(`La catégorie "${this.formData.name}" a été mise à jour avec succès.`);
    } else {
      updatedList = [{ ...this.formData }, ...this.categories()];
      this.showToast(`Nouvelle catégorie "${this.formData.name}" créée et ajoutée à la plateforme !`);
    }

    this.categories.set(updatedList);
    this.persist(updatedList);
    this.closeModal();
  }

  toggleCategoryStatus(c: AdminCategory): void {
    const nextStatus = !c.isActive;
    const updated = this.categories().map(item => item.id === c.id ? { ...item, isActive: nextStatus } : item);
    this.categories.set(updated);
    this.persist(updated);
    this.showToast(`Catégorie "${c.name}" ${nextStatus ? 'activée en ligne' : 'masquée'}.`);
  }

  deleteCategory(c: AdminCategory): void {
    if (confirm(`Confirmez-vous la suppression définitive de la catégorie "${c.name}" ?`)) {
      const updated = this.categories().filter(item => item.id !== c.id);
      this.categories.set(updated);
      this.persist(updated);
      this.showToast(`Catégorie "${c.name}" supprimée.`);
    }
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
