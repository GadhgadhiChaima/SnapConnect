import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CreatorService } from '../../../core/services/creator.service';
import { CreatorProfile, PortfolioItem } from '../../../core/models/creator.model';
import { RatingStarsComponent } from '../../../shared/components/rating-stars/rating-stars.component';
import { MediaModalComponent } from '../../../shared/components/media-modal/media-modal.component';

@Component({
  selector: 'app-creator-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, RatingStarsComponent, MediaModalComponent],
  template: `
    <div class="creator-detail-page" *ngIf="creator; else notFound">
      <div class="back-link">
        <a routerLink="/creators">← Back to All Mobile Creators</a>
      </div>

      <!-- CREATOR HERO HEADER -->
      <div class="creator-hero card-glass">
        <div class="hero-left">
          <img [src]="creator.avatarUrl" [alt]="creator.fullName" class="creator-avatar" />
          <div class="creator-titles">
            <h1>
              {{ creator.fullName }}
              <span class="verified-badge" *ngIf="creator.verifiedCreator">Verified Gear ✓</span>
            </h1>
            <p class="tagline">{{ creator.title }}</p>

            <div class="stats-line">
              <app-rating-stars [rating]="creator.rating" [reviewsCount]="creator.reviewsCount"></app-rating-stars>
              <span class="sep">•</span>
              <span>📍 {{ creator.location }}</span>
              <span class="sep">•</span>
              <span>💼 {{ creator.completedJobsCount }} Shoots Completed</span>
            </div>
          </div>
        </div>

        <div class="hero-right">
          <div class="rate-card">
            <span class="price">\${{ creator.hourlyRate }}</span>
            <span class="unit">/ hour</span>
          </div>

          <a routerLink="/jobs/create" class="btn btn-primary btn-block">
            Direct Mobile Brief
          </a>
        </div>
      </div>

      <div class="profile-layout">
        <!-- LEFT COLUMN: Portfolio Gallery -->
        <main class="portfolio-section">
          <div class="section-title">
            <h2>📱 Smartphone Portfolio Showcase</h2>
            <p>Click any video or image to inspect gear details & full resolution.</p>
          </div>

          <div class="portfolio-grid">
            <div
              class="portfolio-card card-glass"
              *ngFor="let item of creator.portfolio"
              (click)="selectedMedia = item">
              <div class="thumbnail-wrapper">
                <img [src]="item.thumbnailUrl" [alt]="item.title" class="thumb-img" />
                <div class="play-overlay" *ngIf="item.mediaType === 'VIDEO'">
                  <span class="play-icon">▶</span>
                </div>
                <span class="category-badge">{{ item.category }}</span>
              </div>

              <div class="item-info">
                <h3>{{ item.title }}</h3>
                <p class="gear-used">📱 {{ item.equipmentUsed }}</p>
              </div>
            </div>
          </div>
        </main>

        <!-- RIGHT COLUMN: Equipment Breakdown & Bio -->
        <aside class="sidebar">
          <div class="info-card card-glass">
            <h3>📱 Verified Equipment Setup</h3>
            <div class="gear-list">
              <div class="gear-row">
                <span class="label">Smartphone:</span>
                <strong class="value">{{ creator.equipment.smartphoneModel }}</strong>
              </div>
              <div class="gear-row" *ngIf="creator.equipment.gimbal">
                <span class="label">Gimbal:</span>
                <span class="value">{{ creator.equipment.gimbal }}</span>
              </div>
              <div class="gear-row" *ngIf="creator.equipment.audioGear">
                <span class="label">Wireless Audio:</span>
                <span class="value">{{ creator.equipment.audioGear }}</span>
              </div>
              <div class="gear-row" *ngIf="creator.equipment.lighting">
                <span class="label">Lighting:</span>
                <span class="value">{{ creator.equipment.lighting }}</span>
              </div>
            </div>
          </div>

          <div class="info-card card-glass">
            <h3>About the Creator</h3>
            <p class="bio-text">{{ creator.bio }}</p>

            <h4 class="specs-title">Specializations</h4>
            <div class="specs-list">
              <span class="badge badge-purple" *ngFor="let spec of creator.specializations">
                {{ spec }}
              </span>
            </div>
          </div>
        </aside>
      </div>

      <!-- MEDIA LIGHTBOX MODAL -->
      <app-media-modal
        [item]="selectedMedia"
        (close)="selectedMedia = null">
      </app-media-modal>
    </div>

    <ng-template #notFound>
      <div class="not-found card-glass">
        <h2>Creator Profile Not Found</h2>
        <a routerLink="/creators" class="btn btn-primary">Return to Creator Directory</a>
      </div>
    </ng-template>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .creator-detail-page {
      max-width: 1240px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .back-link {
      margin-bottom: 1.5rem;
      a { color: $text-muted; font-size: 0.9rem; &:hover { color: $primary; } }
    }

    .creator-hero {
      padding: 2rem;
      @include flex-between;
      margin-bottom: 2rem;

      .hero-left {
        display: flex;
        gap: 1.5rem;
        align-items: center;

        .creator-avatar {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid $primary;
        }

        .creator-titles {
          h1 {
            font-size: 1.8rem;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 0.75rem;

            .verified-badge {
              font-size: 0.7rem;
              background: rgba(56, 189, 248, 0.15);
              color: #38bdf8;
              padding: 0.2rem 0.6rem;
              border-radius: $radius-full;
              border: 1px solid rgba(56, 189, 248, 0.3);
            }
          }

          .tagline { font-size: 1rem; color: $text-muted; margin-top: 0.2rem; }

          .stats-line {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            font-size: 0.85rem;
            color: $text-muted;
            margin-top: 0.6rem;

            .sep { opacity: 0.4; }
          }
        }
      }

      .hero-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.75rem;

        .rate-card {
          .price { font-size: 2rem; font-weight: 800; color: #4ade80; }
          .unit { font-size: 0.9rem; color: $text-muted; }
        }
      }

      @include respond-to('tablet') {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
        .hero-right { align-items: flex-start; width: 100%; }
      }
    }

    .profile-layout {
      display: grid;
      grid-template-columns: 2.2fr 1fr;
      gap: 2rem;

      @include respond-to('tablet') {
        grid-template-columns: 1fr;
      }
    }

    .section-title {
      margin-bottom: 1.5rem;
      h2 { font-size: 1.4rem; font-weight: 800; }
      p { font-size: 0.9rem; color: $text-muted; }
    }

    .portfolio-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.25rem;

      .portfolio-card {
        padding: 0;
        overflow: hidden;
        cursor: pointer;

        .thumbnail-wrapper {
          position: relative;
          width: 100%;
          height: 220px;
          background: black;

          .thumb-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform $transition-smooth;
          }

          .play-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.35);
            @include flex-center;

            .play-icon {
              width: 48px;
              height: 48px;
              background: rgba(139, 92, 246, 0.9);
              border-radius: 50%;
              color: white;
              @include flex-center;
              font-size: 1.2rem;
              box-shadow: 0 0 20px $primary-glow;
            }
          }

          .category-badge {
            position: absolute;
            top: 0.75rem;
            left: 0.75rem;
            font-size: 0.7rem;
            font-weight: 700;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
          }
        }

        &:hover .thumb-img {
          transform: scale(1.05);
        }

        .item-info {
          padding: 1rem;
          h3 { font-size: 0.95rem; font-weight: 700; }
          .gear-used { font-size: 0.75rem; color: $text-muted; margin-top: 0.25rem; }
        }
      }
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .info-card {
        padding: 1.5rem;
        h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; }

        .gear-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          font-size: 0.85rem;

          .gear-row {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
            padding-bottom: 0.4rem;

            .label { color: $text-muted; }
            .value { font-weight: 600; color: #c084fc; text-align: right; }
          }
        }

        .bio-text { font-size: 0.9rem; color: $text-muted; line-height: 1.6; }

        .specs-title { font-size: 0.85rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .specs-list { display: flex; gap: 0.4rem; flex-wrap: wrap; }
      }
    }

    .btn-block { width: 100%; text-align: center; }

    .not-found { text-align: center; padding: 4rem; }
  `]
})
export class CreatorDetailComponent implements OnInit {
  creator?: CreatorProfile;
  selectedMedia: PortfolioItem | null = null;

  constructor(
    private route: ActivatedRoute,
    private creatorService: CreatorService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.creator = this.creatorService.getCreatorById(id);
    }
  }
}
