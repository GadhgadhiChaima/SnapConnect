import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CreatorProfile } from '../../../core/models/creator.model';
import { RatingStarsComponent } from '../rating-stars/rating-stars.component';

@Component({
  selector: 'app-creator-card',
  standalone: true,
  imports: [RouterLink, RatingStarsComponent],
  template: `
    @if (creator(); as c) {
      <div class="creator-card card-glass card-glass-interactive">
        <!-- Header / Avatar & Info -->
        <div class="card-top">
          <div class="avatar-wrap">
            <img
              [src]="c.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'"
              [alt]="c.fullName"
              class="avatar avatar-lg avatar-ring"
              onerror="this.src='https://ui-avatars.com/api/?background=8b5cf6&color=fff&name=' + c.fullName"
            />
            @if (c.isVerified) {
              <span class="verified-badge" title="Verified Mobile Creator">✓</span>
            }
            <span class="status-indicator" [class.available]="c.availabilityStatus === 'AVAILABLE'"></span>
          </div>

          <div class="creator-meta">
            <h3 class="creator-name">{{ c.fullName }}</h3>
            <p class="creator-title">{{ c.title }}</p>
            <div class="location-row">
              <span class="loc-icon">📍</span>
              <span>{{ c.location }}</span>
            </div>
          </div>
        </div>

        <!-- Rating & Stats -->
        <div class="rating-row">
          <app-rating-stars [rating]="c.rating" [reviewsCount]="c.reviewsCount"></app-rating-stars>
          <span class="completed-count">🚀 {{ c.completedProjectsCount }} completed</span>
        </div>

        <!-- Bio snippet -->
        <p class="bio-text">{{ c.bio }}</p>

        <!-- Smartphone Gear Tag -->
        @if (c.equipment?.smartphoneModel) {
          <div class="gear-badge">
            <span class="gear-icon">📱</span>
            <span class="gear-name">{{ c.equipment?.smartphoneModel }}</span>
            @if (c.equipment?.gimbal) {
              <span class="gear-sub">• {{ c.equipment?.gimbal }}</span>
            }
          </div>
        }

        <!-- Specializations -->
        <div class="tags-container">
          @for (tag of c.specializations?.slice(0, 3); track tag) {
            <span class="badge badge-primary">{{ tag }}</span>
          }
        </div>

        <!-- Card Footer (Rate & View Profile) -->
        <div class="card-footer">
          <div class="rate-info">
            <span class="rate-label">Starting at</span>
            <span class="rate-value">\${{ c.hourlyRate || 35 }}<span class="rate-unit">/hr</span></span>
          </div>
          <a [routerLink]="['/creators', c.id]" class="btn btn-outline btn-sm">View Profile</a>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; height: 100%; }

    .creator-card {
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: var(--space-4);
      background: var(--color-bg-card);
      border-radius: var(--radius-lg);
    }

    .card-top {
      display: flex;
      gap: var(--space-4);
      align-items: center;
    }

    .avatar-wrap {
      position: relative;
      flex-shrink: 0;
    }

    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--color-primary-500);
    }

    .verified-badge {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 20px;
      height: 20px;
      background: var(--color-primary-500);
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--color-bg-surface);
    }

    .status-indicator {
      position: absolute;
      top: 0;
      right: 0;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--color-text-muted);
      border: 2px solid var(--color-bg-surface);
    }

    .status-indicator.available {
      background: var(--color-success);
      box-shadow: 0 0 8px var(--color-success);
    }

    .creator-meta {
      overflow: hidden;
    }

    .creator-name {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .creator-title {
      font-size: var(--font-size-xs);
      color: var(--color-primary-400);
      font-weight: var(--font-weight-medium);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 4px;
    }

    .location-row {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .rating-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .completed-count {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .bio-text {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: var(--line-height-normal);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex-grow: 1;
    }

    .gear-badge {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      background: rgba(139, 92, 246, 0.08);
      border: 1px dashed rgba(139, 92, 246, 0.35);
      border-radius: var(--radius-md);
      font-size: var(--font-size-xs);
      color: var(--color-text-primary);
    }

    .gear-name {
      font-weight: var(--font-weight-bold);
      color: var(--color-primary-300);
    }

    .gear-sub {
      color: var(--color-text-muted);
    }

    .tags-container {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border-subtle);
      margin-top: auto;
    }

    .rate-info {
      display: flex;
      flex-direction: column;
    }

    .rate-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wider);
      color: var(--color-text-muted);
    }

    .rate-value {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-black);
      color: var(--color-text-primary);
    }

    .rate-unit {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-normal);
      color: var(--color-text-muted);
    }
  `]
})
export class CreatorCardComponent {
  creator = input<CreatorProfile | null>(null);
}
