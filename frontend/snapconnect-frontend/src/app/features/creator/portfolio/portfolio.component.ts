import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MediaModalComponent } from '../../../shared/components/media-modal/media-modal.component';
import { PortfolioItem } from '../../../core/models/portfolio.model';

@Component({
  selector: 'app-portfolio-manage',
  standalone: true,
  imports: [FormsModule, SlicePipe, NavbarComponent, FooterComponent, MediaModalComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="portfolio-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-primary">Creator Studio</span>
            <h1>Manage Your Mobile Portfolio</h1>
            <p>Upload your best smartphone photos, 4K Reels, and TikToks to attract clients.</p>
          </div>
          <button (click)="openAddModal.set(true)" class="btn btn-primary btn-md">
            + Upload New Media
          </button>
        </div>

        <!-- Portfolio Items Grid -->
        <div class="portfolio-grid">
          @for (item of items(); track item.id) {
            <div class="portfolio-card card-glass">
              <div class="media-wrap" (click)="selectedMedia.set(item)">
                <img [src]="item.thumbnailUrl || item.mediaUrl" [alt]="item.title" class="port-img" />
                <div class="type-pill">
                  {{ item.mediaType === 'VIDEO' ? '▶ 4K Video' : '📷 Photo' }}
                </div>
              </div>

              <div class="card-body">
                <h3>{{ item.title }}</h3>
                <span class="gear-tag">📱 {{ item.equipmentUsed }}</span>
                <div class="card-actions flex-between">
                  <span class="date">{{ item.createdAt | slice:0:10 }}</span>
                  <button (click)="deleteItem(item.id)" class="btn btn-ghost btn-xs text-danger">Delete</button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </main>

    <!-- Upload Modal -->
    @if (openAddModal()) {
      <div class="modal-backdrop" (click)="openAddModal.set(false)">
        <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="openAddModal.set(false)">✕</button>

          <h2>Add New Mobile Showcase Piece</h2>
          <p class="modal-sub">Share a smartphone shot photo or vertical video.</p>

          <form (ngSubmit)="saveItem()" class="upload-form">
            <div class="form-group">
              <label class="form-label">Title / Caption</label>
              <input type="text" [(ngModel)]="newTitle" name="title" class="form-input" placeholder="e.g. Neon Fashion Walkway 4K 60fps" required />
            </div>

            <div class="form-group">
              <label class="form-label">Image or Video URL</label>
              <input type="url" [(ngModel)]="newUrl" name="url" class="form-input" placeholder="https://..." required />
            </div>

            <div class="form-group">
              <label class="form-label">Smartphone & Equipment Used</label>
              <input type="text" [(ngModel)]="newGear" name="gear" class="form-input" placeholder="e.g. iPhone 16 Pro Max • DJI OM 6" required />
            </div>

            <div class="form-group">
              <label class="form-label">Media Type</label>
              <select [(ngModel)]="newType" name="type" class="form-select">
                <option value="IMAGE">📷 High-Res Smartphone Photo</option>
                <option value="VIDEO">▶ 4K Vertical Video / Reel</option>
              </select>
            </div>

            <div class="modal-actions">
              <button type="button" (click)="openAddModal.set(false)" class="btn btn-outline">Cancel</button>
              <button type="submit" class="btn btn-primary">Save to Portfolio</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Lightbox Preview -->
    @if (selectedMedia()) {
      <app-media-modal [item]="selectedMedia()" (close)="selectedMedia.set(null)"></app-media-modal>
    }

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .portfolio-page {
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

    .portfolio-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-6);
    }

    .portfolio-card {
      border-radius: var(--radius-xl);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .media-wrap {
      position: relative;
      height: 260px;
      background: #000;
      cursor: pointer;
    }

    .port-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-slow);
    }

    .media-wrap:hover .port-img {
      transform: scale(1.05);
    }

    .type-pill {
      position: absolute;
      top: var(--space-3);
      right: var(--space-3);
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      color: #fff;
      font-size: 11px;
      font-weight: bold;
    }

    .card-body {
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .card-body h3 {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .gear-tag {
      font-size: var(--font-size-xs);
      color: var(--color-primary-300);
    }

    .card-actions {
      padding-top: var(--space-2);
      border-top: 1px solid var(--color-border-subtle);
      margin-top: var(--space-2);
    }

    .date {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .text-danger {
      color: var(--color-error);
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
      max-width: 500px;
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

    .modal-card h2 { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); margin-bottom: var(--space-1); }
    .modal-sub { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-bottom: var(--space-5); }
    .upload-form { display: flex; flex-direction: column; gap: var(--space-4); }
    .modal-actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-4); }
  `]
})
export class PortfolioManageComponent {
  openAddModal = signal(false);
  selectedMedia = signal<PortfolioItem | null>(null);

  items = signal<PortfolioItem[]>([
    {
      id: 'p-1',
      creatorId: 'cr-1',
      title: 'Neon Streetwear 4K 60fps',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      equipmentUsed: 'iPhone 16 Pro Max • DJI OM 6',
      createdAt: '2026-08-01'
    },
    {
      id: 'p-2',
      creatorId: 'cr-1',
      title: 'Cosmetics Texture Macro',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      equipmentUsed: 'iPhone 16 Pro 5x Telephoto',
      createdAt: '2026-08-05'
    },
    {
      id: 'p-3',
      creatorId: 'cr-1',
      title: 'Coffee Latte Art Pour',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      equipmentUsed: 'iPhone 16 Pro 4K 120fps',
      createdAt: '2026-08-10'
    },
    {
      id: 'p-4',
      creatorId: 'cr-1',
      title: 'Sunset Roof Lookbook',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
      equipmentUsed: 'iPhone 16 Pro ProRes Log',
      createdAt: '2026-08-12'
    }
  ]);

  newTitle = '';
  newUrl = '';
  newGear = 'iPhone 16 Pro Max';
  newType: 'IMAGE' | 'VIDEO' = 'IMAGE';

  saveItem(): void {
    if (!this.newTitle || !this.newUrl) return;

    this.items.update(prev => [
      {
        id: 'p-' + Date.now(),
        creatorId: 'cr-1',
        title: this.newTitle,
        mediaType: this.newType,
        mediaUrl: this.newUrl,
        equipmentUsed: this.newGear,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);

    this.newTitle = '';
    this.newUrl = '';
    this.openAddModal.set(false);
  }

  deleteItem(id: string): void {
    if (confirm('Delete this showcase item from your portfolio?')) {
      this.items.update(prev => prev.filter(i => i.id !== id));
    }
  }
}
