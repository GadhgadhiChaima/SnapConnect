import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { PLATFORM_CATEGORIES } from '../../../../core/services/category.service';
import { JobService } from '../../../../core/services/job.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TunisiaLocationService, TunisianCity } from '../../../../core/services/tunisia-location.service';

@Component({
  selector: 'app-job-create',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="job-create-page">
      <div class="container-narrow">
        <div class="page-header">
          <span class="badge badge-primary">Nouveau Brief Mobile</span>
          <h1>Publier une mission photo & vidéo mobile</h1>
          <p>Décrivez vos besoins de tournage pour recevoir des propositions de créateurs smartphone vérifiés.</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="job-form card-glass animate-scale-in">
          @if (directCreatorName()) {
            <div class="direct-hire-banner animate-fade-in">
              <div class="direct-hire-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <polyline points="17 11 19 13 23 9"/>
                </svg>
                <span>Offre directe</span>
              </div>
              <div class="direct-hire-info">
                <h4>Offre d'embauche dédiée à <strong>{{ directCreatorName() }}</strong></h4>
                <p>Cette mission sera proposée en priorité à ce créateur. Dès validation de son côté, un contrat avec séquestre sera automatiquement créé.</p>
              </div>
            </div>
          }

          <!-- Step 1: Title & Category -->
          <div class="form-section">
            <h3>1. Détails du projet</h3>

            <div class="form-group">
              <label class="form-label" for="title">Titre de la mission</label>
              <input
                type="text"
                id="title"
                [(ngModel)]="title"
                name="title"
                required
                class="form-input"
                placeholder="ex. 5 Reels esthétiques d'unboxing pour marque cosmétique (iPhone 16 Pro)"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="category">Catégorie de contenu</label>
              <select id="category" [(ngModel)]="categoryId" name="category" class="form-select" required>
                <option value="" disabled selected>Sélectionnez une catégorie...</option>
                @for (cat of categories; track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="desc">Description & Brief créatif</label>
              <textarea
                id="desc"
                [(ngModel)]="description"
                name="desc"
                required
                class="form-textarea"
                placeholder="Décrivez votre vision, le nombre de livrables attendus, le format (ex. vertical 9:16), le ton et vos références..."
                rows="5"
              ></textarea>
            </div>
          </div>

          <!-- Step 2: Smartphone Hardware Requirements -->
          <div class="form-section gear-section">
            <h3>2. Matériel & Équipement mobile requis</h3>
            <p class="section-hint">Précisez le smartphone et les accessoires recommandés pour ce projet.</p>

            <div class="form-group">
              <label class="form-label">Modèle de smartphone / Caractéristiques requises</label>
              <input
                type="text"
                [(ngModel)]="requiredGear"
                name="gear"
                class="form-input"
                placeholder="ex. iPhone 15/16 Pro (4K ProRes) ou Samsung S24 Ultra"
              />
            </div>
          </div>

          <!-- Step 3: Location & Logistics -->
          <div class="form-section">
            <h3>3. Lieu & Modalités de tournage</h3>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="isRemote" name="isRemote" />
                <span>Tournage à distance (Produits expédiés au créateur / Créateur autonome)</span>
              </label>
            </div>

            @if (!isRemote) {
              <div class="form-group animate-fade-in">
                <label class="form-label" for="loc">Lieu de tournage sur place (Ville & Adresse)</label>
                <div class="location-autocomplete-container">
                  <input
                    type="text"
                    id="loc"
                    [(ngModel)]="location"
                    name="loc"
                    class="form-input"
                    placeholder="Tapez une ville tunisienne (ex. Jendouba, Tunis, Sousse...)"
                    (input)="onLocationInput($event)"
                    (focus)="onLocationFocus()"
                    (blur)="onLocationBlur()"
                    autocomplete="off"
                  />
                  @if (isLocationLoading()) {
                    <span class="location-spinner">
                      <svg class="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                        <path d="M12 2a10 10 0 0 1 10 10"/>
                      </svg>
                    </span>
                  }
                  @if (locationSuggestions().length > 0) {
                    <ul class="location-dropdown">
                      @for (s of locationSuggestions(); track s.display) {
                        <li class="location-dropdown-item" (mousedown)="selectLocation(s)">
                          <div class="loc-item-left">
                            <span class="loc-item-pin">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                              </svg>
                            </span>
                            <div class="loc-item-text">
                              <span class="loc-name">{{ s.display }}</span>
                              @if (s.governorate && !s.display.includes(s.governorate)) {
                                <span class="loc-gov">Gouvernorat de {{ s.governorate }}</span>
                              }
                            </div>
                          </div>
                          <span class="loc-badge">{{ s.governorate }}</span>
                        </li>
                      }
                    </ul>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Step 4: Budget & Timeline -->
          <div class="form-section">
            <h3>4. Budget & Séquestre</h3>

            <div class="budget-type-row">
              <button
                type="button"
                class="budget-btn"
                [class.active]="budgetType === 'FIXED'"
                (click)="budgetType = 'FIXED'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
                  <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
                Budget fixe par projet
              </button>
              <button
                type="button"
                class="budget-btn"
                [class.active]="budgetType === 'HOURLY'"
                (click)="budgetType = 'HOURLY'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Taux horaire
              </button>
            </div>

            @if (budgetType === 'FIXED') {
              <div class="form-group animate-fade-in">
                <label class="form-label">Budget fixe du projet (DT)</label>
                <input
                  type="number"
                  [(ngModel)]="budgetAmount"
                  name="budgetFixed"
                  class="form-input"
                  placeholder="ex. 250"
                  required
                />
              </div>
            } @else {
              <div class="form-row-2 animate-fade-in">
                <div class="form-group">
                  <label class="form-label">Tarif Min (DT/h)</label>
                  <input type="number" [(ngModel)]="budgetMin" name="budgetMin" class="form-input" placeholder="ex. 35" />
                </div>
                <div class="form-group">
                  <label class="form-label">Tarif Max (DT/h)</label>
                  <input type="number" [(ngModel)]="budgetMax" name="budgetMax" class="form-input" placeholder="ex. 60" />
                </div>
              </div>
            }
          </div>

          <div class="form-actions">
            <button type="button" routerLink="/client/dashboard" class="btn btn-outline btn-lg">Annuler</button>
            <button type="submit" [disabled]="isLoading()" class="btn btn-primary btn-lg submit-btn">
              @if (isLoading()) {
                Publication en cours...
              } @else {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                Publier le brief de mission
              }
            </button>
          </div>
        </form>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .job-create-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }

    .page-header {
      margin-bottom: var(--space-8);
      text-align: center;
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

    .job-form {
      padding: var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      padding-bottom: var(--space-6);
      border-bottom: 1px solid var(--color-border-subtle);
    }

    .form-section h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
    }

    .section-hint {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-top: -8px;
    }

    .gear-section {
      background: rgba(139, 92, 246, 0.06);
      padding: var(--space-5);
      border-radius: var(--radius-lg);
      border: 1px dashed rgba(139, 92, 246, 0.3);
    }

    .checkbox-group {
      margin-top: var(--space-2);
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--color-primary-500);
      cursor: pointer;
    }

    .budget-type-row {
      display: flex;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }

    .budget-btn {
      flex: 1;
      padding: var(--space-3);
      border-radius: var(--radius-md);
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .budget-btn.active {
      background: var(--color-primary-light);
      border-color: var(--color-primary-500);
      color: #fff;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-4);
      padding-top: var(--space-4);
    }

    .submit-btn {
      min-width: 240px;
    }

    .direct-hire-banner {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(139, 92, 246, 0.08));
      border: 1px solid rgba(16, 185, 129, 0.35);
      border-radius: var(--radius-xl);
      padding: var(--space-4) var(--space-5);
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.1);
      margin-bottom: var(--space-2);
    }

    .direct-hire-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-1);
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-lg);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      white-space: nowrap;
    }

    .direct-hire-info h4 {
      margin: 0 0 4px 0;
      font-size: var(--font-size-base);
      color: var(--color-text-primary);
    }

    .direct-hire-info strong {
      color: #34d399;
    }

    .direct-hire-info p {
      margin: 0;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      line-height: 1.4;
    }

    /* ── Autocomplétion Géographique Tunisie ── */
    .location-autocomplete-container {
      position: relative;
      width: 100%;
    }

    .location-spinner {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-primary-400);
      display: flex;
      align-items: center;
      pointer-events: none;
    }

    .location-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      z-index: 999;
      background: #131b34;
      border: 1px solid rgba(139, 92, 246, 0.4);
      border-radius: var(--radius-lg);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(139, 92, 246, 0.15);
      backdrop-filter: blur(16px);
      list-style: none;
      margin: 0;
      padding: 6px;
      max-height: 280px;
      overflow-y: auto;
    }

    .location-dropdown-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
      gap: 12px;
    }

    .location-dropdown-item:hover {
      background: rgba(139, 92, 246, 0.18);
    }

    .loc-item-left {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .loc-item-pin {
      color: var(--color-primary-400);
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .loc-item-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .loc-name {
      font-size: 13.5px;
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      line-height: 1.25;
    }

    .loc-gov {
      font-size: 11px;
      color: var(--color-text-muted);
      margin-top: 1px;
    }

    .loc-badge {
      font-size: 10.5px;
      padding: 2px 8px;
      background: rgba(139, 92, 246, 0.15);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: var(--radius-full);
      color: #c4b5fd;
      font-weight: 500;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .location-dropdown-item:hover .loc-badge {
      background: rgba(139, 92, 246, 0.3);
      border-color: rgba(139, 92, 246, 0.5);
      color: #fff;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin {
      animation: spin 0.8s linear infinite;
    }
  `]
})
export class JobCreateComponent implements OnInit, OnDestroy {
  private jobService = inject(JobService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notifService = inject(NotificationService);
  private tunisiaLocation = inject(TunisiaLocationService);

  directCreatorId = signal<string | null>(null);
  directCreatorName = signal<string | null>(null);

  title = '';
  categoryId = 'reels-tiktok';
  description = '';
  requiredGear = 'iPhone 15/16 Pro (4K ProRes) or Samsung S24 Ultra';
  isRemote = true;
  location = 'Tunis, Tunisie';
  budgetType: 'FIXED' | 'HOURLY' = 'FIXED';
  budgetAmount = 250;
  budgetMin = 35;
  budgetMax = 60;
  isLoading = signal(false);
  categories = PLATFORM_CATEGORIES;

  // Autocomplétion géographique Tunisie
  locationSuggestions = signal<TunisianCity[]>([]);
  isLocationLoading = signal<boolean>(false);
  private locationSearch$ = new Subject<string>();
  private locationDestroy$ = new Subject<void>();

  ngOnInit(): void {
    // Pipeline d'autocomplétion avec API géographique réelle Tunisie
    this.locationSearch$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q || q.trim().length < 2) {
          this.isLocationLoading.set(false);
          return of([]);
        }
        this.isLocationLoading.set(true);
        return this.tunisiaLocation.search(q);
      }),
      takeUntil(this.locationDestroy$)
    ).subscribe(results => {
      this.isLocationLoading.set(false);
      this.locationSuggestions.set(results);
    });

    this.route.queryParams.subscribe(params => {
      const creatorId = params['creatorId'] || params['directOfferTo'];
      const creatorName = params['creatorName'];
      if (creatorName) {
        this.directCreatorName.set(creatorName);
        this.title = `Tournage smartphone dédié avec ${creatorName}`;
        this.description = `Bonjour ${creatorName},\n\nNous avons admiré votre portfolio et souhaitons vous confier la réalisation d'un projet vidéo/photo smartphone.\n\nObjectif :\nLivrables : 3 à 5 Reels verticaux 9:16 en 4K.\nDélais souhaités : 7 jours.`;
      } else if (creatorId) {
        this.directCreatorName.set('le créateur sélectionné');
      }
      if (creatorId) {
        this.directCreatorId.set(creatorId);
      }
    });
  }

  ngOnDestroy(): void {
    this.locationDestroy$.next();
    this.locationDestroy$.complete();
  }

  onLocationInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.location = val;
    if (!val || val.trim().length < 2) {
      this.locationSuggestions.set([]);
      return;
    }
    this.locationSearch$.next(val);
  }

  onLocationFocus(): void {
    if (this.location && this.location.trim().length >= 2) {
      this.locationSearch$.next(this.location);
    }
  }

  onLocationBlur(): void {
    setTimeout(() => this.locationSuggestions.set([]), 250);
  }

  selectLocation(suggestion: TunisianCity): void {
    this.location = suggestion.display;
    this.locationSuggestions.set([]);
  }

  onSubmit(): void {
    if (!this.title.trim() || !this.description.trim()) {
      alert('Veuillez renseigner le titre et la description du brief.');
      return;
    }

    this.isLoading.set(true);

    const categoryObj = this.categories.find(c => c.id === this.categoryId);
    const categoryName = categoryObj ? categoryObj.name : 'Reels & TikTok';

    this.jobService.createJob({
      title: this.title.trim(),
      categoryId: this.categoryId,
      category: categoryName,
      description: this.description.trim(),
      requiredGear: this.requiredGear.trim(),
      isRemote: this.isRemote,
      location: this.isRemote ? 'À distance (Produits expédiés au créateur)' : this.location,
      budgetType: this.budgetType,
      budgetAmount: this.budgetType === 'FIXED' ? this.budgetAmount : undefined,
      budgetMin: this.budgetType === 'HOURLY' ? this.budgetMin : this.budgetAmount,
      budgetMax: this.budgetType === 'HOURLY' ? this.budgetMax : this.budgetAmount,
      deliverables: ['Montage final 4K', 'Rushes bruts smartphone']
    }).subscribe({
      next: (job) => {
        this.isLoading.set(false);

        if (this.directCreatorId()) {
          this.notifService.notify({
            userId: this.directCreatorId()!,
            type: 'NEW_JOB',
            title: 'Nouvelle proposition de mission directe',
            body: `Un client vous propose directement le projet "${job.title}".`,
            link: `/jobs/${job.id}`
          });
        }

        this.router.navigate(['/jobs', job.id]);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
