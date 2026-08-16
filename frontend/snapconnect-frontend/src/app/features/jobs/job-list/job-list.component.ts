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
        <h1>Explore <span class="gradient-title">Mobile Photography & Video</span> Briefs</h1>
        <p>Find client briefs requiring iPhone or Android flagship gear for Reels, product shoots & tours.</p>
      </div>

      <!-- FILTER & SEARCH BAR -->
      <div class="filter-card card-glass">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search briefs by keyword (e.g. iPhone 15, Barista, 4K Reels, UGC)..."
            class="input-field search-input" />
        </div>

        <div class="category-pills">
          <button
            class="pill"
            [class.active]="selectedCategory() === 'ALL'"
            (click)="selectedCategory.set('ALL')">
            All Briefs
          </button>
          <button
            class="pill"
            [class.active]="selectedCategory() === 'REELS_TIKTOK'"
            (click)="selectedCategory.set('REELS_TIKTOK')">
            📱 Reels & TikToks
          </button>
          <button
            class="pill"
            [class.active]="selectedCategory() === 'PRODUCT_PHOTO'"
            (click)="selectedCategory.set('PRODUCT_PHOTO')">
            📦 Product Shoots
          </button>
          <button
            class="pill"
            [class.active]="selectedCategory() === 'REAL_ESTATE'"
            (click)="selectedCategory.set('REAL_ESTATE')">
            🏰 Real Estate Tours
          </button>
          <button
            class="pill"
            [class.active]="selectedCategory() === 'UGC'"
            (click)="selectedCategory.set('UGC')">
            🤳 UGC Content
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
              <span class="amount">\${{ job.budgetAmount }}</span>
              <span class="type">({{ job.budgetType }})</span>
            </div>
          </div>

          <h2>
            <a [routerLink]="['/jobs', job.id]">{{ job.title }}</a>
          </h2>
          <p class="description">{{ job.description }}</p>

          <div class="gear-requirement" *ngIf="job.requiredGear">
            <span class="gear-icon">📱 Required Gear:</span>
            <span class="gear-text">{{ job.requiredGear }}</span>
          </div>

          <div class="deliverables-tags">
            <span class="deliv-item" *ngFor="let del of job.deliverables">
              ✓ {{ del }}
            </span>
          </div>

          <div class="brief-bottom">
            <div class="meta-items">
              <span>📍 {{ job.location }}</span>
              <span>⏱️ {{ job.postedDate }}</span>
              <span>📩 {{ job.proposalsCount }} Proposals</span>
            </div>

            <a [routerLink]="['/jobs', job.id]" class="btn btn-sm btn-primary">
              View Brief & Submit Bid
            </a>
          </div>
        </div>

        <div class="no-results card-glass" *ngIf="filteredJobs().length === 0">
          <h3>No mobile briefs match your criteria</h3>
          <p>Try clearing your search query or selecting a different category tab.</p>
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
      list = list.filter(j => j.category === cat);
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
