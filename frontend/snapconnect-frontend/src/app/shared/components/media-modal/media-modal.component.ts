import { Component, input, output } from '@angular/core';
import { PortfolioItem } from '../../../core/models/portfolio.model';

@Component({
  selector: 'app-media-modal',
  standalone: true,
  template: `
    @if (item(); as media) {
      <div class="modal-backdrop" (click)="close.emit()">
        <div class="modal-card animate-scale-in" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="close.emit()" aria-label="Close modal">✕</button>

          <div class="media-container">
            @if (media.mediaType === 'VIDEO') {
              <video
                [src]="media.mediaUrl"
                controls
                autoplay
                playsinline
                class="media-content">
              </video>
            } @else {
              <img
                [src]="media.mediaUrl"
                [alt]="media.title"
                class="media-content" />
            }
          </div>

          <div class="modal-footer">
            <div class="item-info">
              <h3>{{ media.title }}</h3>
              @if (media.description) {
                <p class="description">{{ media.description }}</p>
              }
              <div class="tags-row">
                @if (media.categoryName) {
                  <span class="badge badge-primary">{{ media.categoryName }}</span>
                }
                @for (tag of media.tags; track tag) {
                  <span class="badge badge-neutral">#{{ tag }}</span>
                }
              </div>
            </div>

            @if (media.equipmentUsed) {
              <div class="gear-tag">
                <span>📱 Shot with:</span>
                <strong>{{ media.equipmentUsed }}</strong>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

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
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      max-width: 840px;
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: var(--shadow-xl), var(--shadow-glow);
    }

    .close-btn {
      position: absolute;
      top: var(--space-3);
      right: var(--space-3);
      z-index: 20;
      background: rgba(0, 0, 0, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background var(--transition-fast), transform var(--transition-fast);
    }

    .close-btn:hover {
      background: var(--color-accent-500);
      transform: scale(1.08);
    }

    .media-container {
      width: 100%;
      max-height: 60vh;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .media-content {
      max-width: 100%;
      max-height: 60vh;
      object-fit: contain;
    }

    .modal-footer {
      padding: var(--space-5) var(--space-6);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      flex-wrap: wrap;
      border-top: 1px solid var(--color-border);
      background: var(--color-bg-surface);
    }

    .item-info h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      margin-bottom: var(--space-1);
    }

    .description {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-2);
    }

    .tags-row {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
      margin-top: var(--space-2);
    }

    .gear-tag {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      background: var(--color-primary-light);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: var(--radius-md);
    }

    .gear-tag strong {
      color: var(--color-primary-300);
    }
  `]
})
export class MediaModalComponent {
  item = input<PortfolioItem | null>(null);
  close = output<void>();
}
