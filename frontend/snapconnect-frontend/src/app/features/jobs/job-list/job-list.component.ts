import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { JobCategory } from '../../../core/models/job.model';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="job-list-page">
      <div class="page-header">
        <h1>Explorez les <span class="gradient-title">Missions Vidéo & Photo</span> Mobile</h1>
        <p>Trouvez des missions de marques nécessitant un smartphone haut de gamme pour des Reels, photos produits et tournages.</p>
      </div>

      <!-- FILTER & SEARCH BAR -->
      <div class="filter-card card-glass">
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Rechercher une mission (ex. iPhone 16 Pro, Reels 4K, UGC, Restaurant)..."
            class="input-field search-input" />
        </div>

        <div class="category-pills">
          <button
            class="pill"
            [class.active]="selectedCategory() === 'ALL'"
            (click)="selectedCategory.set('ALL')">
            Toutes les missions
          </button>
          <button
            class="pill"
            [class.active]="selectedCategory() === 'REELS_TIKTOK'"
            (click)="selectedCategory.set('REELS_TIKTOK')">
            Reels & TikTok
          </button>
          <button
            class="pill"
            [class.active]="selectedCategory() === 'PRODUCT_PHOTO'"
            (click)="selectedCategory.set('PRODUCT_PHOTO')">
            Photos Produits
          </button>
          <button
            class="pill"
            [class.active]="selectedCategory() === 'REAL_ESTATE'"
            (click)="selectedCategory.set('REAL_ESTATE')">
            Visites Immobilières
          </button>
          <button
            class="pill"
            [class.active]="selectedCategory() === 'UGC'"
            (click)="selectedCategory.set('UGC')">
            Contenu UGC
          </button>
        </div>
      </div>

      <!-- JOB BRIEF LIST -->
      <div class="briefs-container">
        <div class="brief-card card-glass" *ngFor="let job of filteredJobs()">
          <div class="brief-top">
            <div class="client-badge">
              <img [src]="job.clientAvatar" [alt]="job.clientName" class="avatar" />
              <span>{{ job.clientName }}</span>
            </div>
            <div class="budget-tag">
              <span class="amount">{{ job.budgetAmount }} DT</span>
              <span class="type">({{ job.budgetType === 'FIXED' ? 'Prix fixe' : job.budgetType }})</span>
            </div>
          </div>

          <h2>
            <a [routerLink]="['/jobs', job.id]">{{ job.title }}</a>
          </h2>
          <p class="description">{{ job.description }}</p>

          <div class="gear-requirement" *ngIf="job.requiredGear">
            <span class="gear-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
              Matériel requis :
            </span>
            <span class="gear-text">{{ job.requiredGear }}</span>
          </div>

          <div class="deliverables-tags">
            <span class="deliv-item" *ngFor="let del of job.deliverables">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 3px;">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              {{ del }}
            </span>
          </div>

          <div class="brief-bottom">
            <div class="meta-items">
              <span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 3px;">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {{ job.location }}
              </span>
              <span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 3px;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {{ job.postedDate }}
              </span>
              <span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 3px;">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                {{ job.proposalsCount }} propositions
              </span>
            </div>

            <a [routerLink]="['/jobs', job.id]" class="btn btn-sm btn-primary">
              Voir le brief & Postuler
            </a>
          </div>
        </div>

        <div class="no-results card-glass" *ngIf="filteredJobs().length === 0">
          <h3>Aucune mission ne correspond à vos critères</h3>
          <p>Essayez d'élargir votre recherche ou de sélectionner une autre catégorie.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .job-list-page {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2rem;

      h1 { font-size: 2.2rem; font-weight: 800; }
      p { color: $text-muted; font-size: 1rem; margin-top: 0.25rem; }
    }

    .filter-card {
      margin-bottom: 2rem;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .search-box {
      position: relative;
      .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: $text-muted;
      }
      .search-input {
        padding-left: 2.75rem;
      }
    }

    .category-pills {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;

      .pill {
        padding: 0.4rem 0.9rem;
        font-size: 0.85rem;
        font-weight: 600;
        border-radius: $radius-full;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid $border-color;
        color: $text-muted;
        transition: all $transition-fast;

        &:hover, &.active {
          background: $primary;
          border-color: $primary;
          color: white;
        }
      }
    }

    .briefs-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .brief-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .brief-top {
        @include flex-between;

        .client-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: $text-muted;

          .avatar {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            object-fit: cover;
          }
        }

        .budget-tag {
          .amount { font-size: 1.3rem; font-weight: 800; color: #4ade80; }
          .type { font-size: 0.75rem; color: $text-muted; margin-left: 0.25rem; }
        }
      }

      h2 {
        font-size: 1.25rem;
        font-weight: 700;
        a { transition: color $transition-fast; &:hover { color: $primary; } }
      }

      .description {
        font-size: 0.92rem;
        color: $text-muted;
        line-height: 1.6;
      }

      .gear-requirement {
        background: rgba(139, 92, 246, 0.1);
        border: 1px dashed rgba(139, 92, 246, 0.4);
        padding: 0.5rem 0.85rem;
        border-radius: $radius-sm;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .gear-icon { font-weight: 700; color: #c084fc; }
        .gear-text { color: white; }
      }

      .deliverables-tags {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;

        .deliv-item {
          font-size: 0.75rem;
          background: rgba(255, 255, 255, 0.04);
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          color: $text-muted;
        }
      }

      .brief-bottom {
        padding-top: 0.75rem;
        border-top: 1px solid $border-color;
        @include flex-between;

        .meta-items {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
          color: $text-muted;
        }

        @include respond-to('mobile') {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
      }
    }

    .no-results {
      text-align: center;
      padding: 3rem;
      color: $text-muted;
      h3 { font-size: 1.2rem; color: white; margin-bottom: 0.5rem; }
    }
  `]
})
export class JobListComponent {
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('ALL');

  filteredJobs = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    let list = this.jobService.jobs();

    if (cat !== 'ALL') {
      list = list.filter(j => j.category === cat || j.categoryId === cat || j.categoryName === cat);
    }

    if (query) {
      list = list.filter(j =>
        j.title.toLowerCase().includes(query) ||
        j.description.toLowerCase().includes(query) ||
        (j.requiredGear && j.requiredGear.toLowerCase().includes(query))
      );
    }

    return list;
  });

  constructor(public jobService: JobService) {}

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
  }
}
