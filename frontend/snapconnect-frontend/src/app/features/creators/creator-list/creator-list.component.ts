import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CreatorService } from '../../../core/services/creator.service';
import { RatingStarsComponent } from '../../../shared/components/rating-stars/rating-stars.component';

@Component({
  selector: 'app-creator-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RatingStarsComponent],
  template: `
    <div class="creator-list-page">
      <div class="page-header">
        <h1>Discover <span class="gradient-title">Verified Mobile Creators</span></h1>
        <p>Hire skilled mobile photographers & videographers with top smartphone camera gear.</p>
      </div>

      <!-- SEARCH & GEAR FILTER BAR -->
      <div class="filter-card card-glass">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="searchQuerySignal.set($event)"
            placeholder="Search by creator name, gear (e.g. iPhone 15 Pro, S24 Ultra, Osmo), or location..."
            class="input-field search-input" />
        </div>

        <div class="filter-pills">
          <button
            class="pill"
            [class.active]="gearFilter() === 'ALL'"
            (click)="gearFilter.set('ALL')">
            All Devices
          </button>
          <button
            class="pill"
            [class.active]="gearFilter() === 'IPHONE'"
            (click)="gearFilter.set('IPHONE')">
            📱 iPhone Flagship
          </button>
          <button
            class="pill"
            [class.active]="gearFilter() === 'SAMSUNG'"
            (click)="gearFilter.set('SAMSUNG')">
            📱 Samsung Ultra
          </button>
          <button
            class="pill"
            [class.active]="gearFilter() === 'VERIFIED'"
            (click)="gearFilter.set('VERIFIED')">
            ✓ Verified Only
          </button>
        </div>
      </div>

      <!-- CREATORS GRID -->
      <div class="creators-grid">
        <div class="creator-card card-glass" *ngFor="let creator of filteredCreators()">
          <div class="card-header">
            <img [src]="creator.avatarUrl" [alt]="creator.fullName" class="avatar" />
            <div class="header-info">
              <h3>
                {{ creator.fullName }}
                <span class="verified" *ngIf="creator.verifiedCreator" title="Verified Mobile Gear">✓</span>
              </h3>
              <p class="title">{{ creator.title }}</p>
              <app-rating-stars [rating]="creator.rating" [reviewsCount]="creator.reviewsCount"></app-rating-stars>
            </div>
          </div>

          <div class="gear-spec-box">
            <div class="gear-item">
              <span class="lbl">Primary Phone:</span>
              <strong class="val">{{ creator.equipment.smartphoneModel }}</strong>
            </div>
            <div class="gear-item" *ngIf="creator.equipment.gimbal">
              <span class="lbl">Stabilizer:</span>
              <span class="val">{{ creator.equipment.gimbal }}</span>
            </div>
          </div>

          <p class="bio">{{ creator.bio | slice:0:120 }}...</p>

          <div class="specializations">
            <span class="spec-tag" *ngFor="let s of creator.specializations">#{{ s }}</span>
          </div>

          <div class="card-footer">
            <div class="rate">
              <span class="price">\${{ creator.hourlyRate }}</span>
              <span class="unit">/ hr</span>
            </div>
            <a [routerLink]="['/creators', creator.id]" class="btn btn-sm btn-primary">
              View Gear & Portfolio
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .creator-list-page {
      max-width: 1200px;
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
      margin-bottom: 2.5rem;
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
      .search-input { padding-left: 2.75rem; }
    }

    .filter-pills {
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

    .creators-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;

      @include respond-to('mobile') {
        grid-template-columns: 1fr;
      }
    }

    .creator-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .card-header {
        display: flex;
        gap: 1rem;

        .avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }

        .header-info {
          h3 {
            font-size: 1.15rem;
            font-weight: 700;
            .verified { color: #38bdf8; margin-left: 0.25rem; }
          }

          .title {
            font-size: 0.8rem;
            color: $text-muted;
            margin-bottom: 0.3rem;
          }
        }
      }

      .gear-spec-box {
        background: rgba(139, 92, 246, 0.08);
        border: 1px solid rgba(139, 92, 246, 0.2);
        border-radius: $radius-md;
        padding: 0.65rem 0.85rem;
        font-size: 0.8rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .gear-item {
          display: flex;
          gap: 0.5rem;
          .lbl { color: $text-muted; }
          .val { color: #c084fc; font-weight: 600; }
        }
      }

      .bio {
        font-size: 0.85rem;
        color: $text-muted;
        line-height: 1.5;
      }

      .specializations {
        display: flex;
        gap: 0.4rem;
        flex-wrap: wrap;

        .spec-tag {
          font-size: 0.75rem;
          color: $secondary;
          background: rgba(236, 72, 153, 0.1);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
        }
      }

      .card-footer {
        margin-top: auto;
        padding-top: 0.85rem;
        border-top: 1px solid $border-color;
        @include flex-between;

        .rate {
          .price { font-size: 1.3rem; font-weight: 800; color: white; }
          .unit { font-size: 0.8rem; color: $text-muted; }
        }
      }
    }
  `]
})
export class CreatorListComponent {
  searchQuery = '';
  searchQuerySignal = signal<string>('');
  gearFilter = signal<string>('ALL');

  filteredCreators = computed(() => {
    const query = this.searchQuerySignal().toLowerCase().trim();
    const filter = this.gearFilter();
    let list = this.creatorService.creators();

    if (filter === 'IPHONE') {
      list = list.filter(c => c.equipment.smartphoneModel.toLowerCase().includes('iphone'));
    } else if (filter === 'SAMSUNG') {
      list = list.filter(c => c.equipment.smartphoneModel.toLowerCase().includes('samsung'));
    } else if (filter === 'VERIFIED') {
      list = list.filter(c => c.verifiedCreator);
    }

    if (query) {
      list = list.filter(c =>
        c.fullName.toLowerCase().includes(query) ||
        c.title.toLowerCase().includes(query) ||
        c.equipment.smartphoneModel.toLowerCase().includes(query) ||
        c.location.toLowerCase().includes(query)
      );
    }

    return list;
  });

  constructor(public creatorService: CreatorService) {}
}
