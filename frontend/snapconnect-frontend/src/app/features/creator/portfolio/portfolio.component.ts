import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MediaModalComponent } from '../../../shared/components/media-modal/media-modal.component';
import { PortfolioItem } from '../../../core/models/portfolio.model';
import { AuthService } from '../../../core/services/auth.service';
import { FileUploadService } from '../../../core/services/file-upload.service';

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
            <span class="badge badge-primary">Studio Créateur</span>
            <h1>Gérer mon portfolio mobile</h1>
            <p>Publiez vos meilleures photos smartphone, Reels 4K et TikToks pour séduire les clients.</p>
          </div>
          <button (click)="openModal()" class="btn btn-primary btn-md add-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Ajouter une réalisation
          </button>
        </div>

        <!-- Portfolio Items Grid -->
        <div class="portfolio-grid">
          @for (item of items(); track item.id) {
            <div class="portfolio-card card-glass">
              <div class="media-wrap" (click)="selectedMedia.set(item)">
                @if (isVideoItem(item)) {
                  <video [src]="item.mediaUrl" class="port-img" playsinline muted preload="metadata"></video>
                  <div class="video-play-badge">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                } @else {
                  <img [src]="item.thumbnailUrl || item.mediaUrl" [alt]="item.title" class="port-img" />
                }
                <div class="type-pill">
                  {{ isVideoItem(item) ? 'Vidéo 4K' : 'Photo HD' }}
                </div>
              </div>

              <div class="card-body">
                <h3>{{ item.title }}</h3>
                <span class="gear-tag">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                  </svg>
                  {{ item.equipmentUsed }}
                </span>
                <div class="card-actions flex-between">
                  <span class="date">{{ item.createdAt | slice:0:10 }}</span>
                  <button (click)="deleteItem(item.id)" class="btn btn-ghost btn-xs text-danger">Supprimer</button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </main>

    <!-- Upwork-Inspired Upload Modal -->
    @if (openAddModal()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="closeModal()" aria-label="Fermer">✕</button>

          <div class="modal-header">
            <h2>Ajouter une réalisation au portfolio</h2>
            <p class="modal-sub">Importez directement une photo haute résolution ou une vidéo tournée sur smartphone.</p>
          </div>

          <!-- Tabs Switcher : Importer un fichier VS Lien externe -->
          <div class="upload-mode-tabs">
            <button
              type="button"
              class="mode-tab-btn"
              [class.active]="uploadMode === 'FILE'"
              (click)="setUploadMode('FILE')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>Importer un fichier</span>
            </button>
            <button
              type="button"
              class="mode-tab-btn"
              [class.active]="uploadMode === 'URL'"
              (click)="setUploadMode('URL')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              <span>Ajouter un lien</span>
            </button>
          </div>

          <form (ngSubmit)="saveItem()" class="upload-form">
            <!-- Mode 1 : File Upload Dropzone + Preview -->
            @if (uploadMode === 'FILE') {
              <input
                #filePicker
                type="file"
                accept="image/*,video/*"
                (change)="onFileChange($event)"
                style="display: none;"
              />

              @if (!newMediaUrl) {
                <!-- Drag & Drop Zone -->
                <div
                  class="dropzone-box"
                  [class.dragging]="isDragging"
                  (dragover)="onDragOver($event)"
                  (dragleave)="isDragging = false"
                  (drop)="onFileDrop($event)"
                  (click)="filePicker.click()"
                >
                  <div class="dropzone-icon-circle">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>
                  <div class="dropzone-text">
                    <strong>Glissez-déposez votre photo ou vidéo ici</strong>
                    <span>ou <span class="browse-link">parcourez vos fichiers</span> depuis votre PC ou smartphone</span>
                  </div>
                  <div class="dropzone-meta-pills">
                    <span class="meta-pill">JPG, PNG, WEBP</span>
                    <span class="meta-pill">MP4, MOV, WEBM</span>
                    <span class="meta-pill">Photos & Vidéos 4K</span>
                  </div>
                </div>
              } @else {
                <!-- Live Media Preview Box -->
                <div class="preview-box">
                  <div class="preview-media-wrapper">
                    @if (newType === 'VIDEO') {
                      <video [src]="newMediaUrl" controls playsinline class="preview-media-player"></video>
                    } @else {
                      <img [src]="newMediaUrl" alt="Aperçu du média" class="preview-media-img" />
                    }
                    <div class="preview-badge">
                      {{ newType === 'VIDEO' ? 'Vidéo 4K' : 'Photo Haute Résolution' }}
                    </div>
                  </div>

                  <div class="preview-info-bar flex-between">
                    <div class="preview-file-meta">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        @if (newType === 'VIDEO') {
                          <polygon points="23 7 16 12 23 17 23 7"></polygon>
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        } @else {
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        }
                      </svg>
                      <span class="file-name">{{ fileName || 'Média importé avec succès' }}</span>
                      @if (fileSize) {
                        <span class="file-size font-mono">({{ fileSize }})</span>
                      }
                    </div>
                    <div class="preview-actions">
                      <button type="button" (click)="filePicker.click()" class="btn btn-outline btn-xs">
                        Remplacer
                      </button>
                      <button type="button" (click)="clearMedia()" class="btn btn-ghost btn-xs text-danger">
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              }
            }

            <!-- Mode 2 : External URL Input + Live Preview -->
            @if (uploadMode === 'URL') {
              <div class="form-group">
                <label class="form-label" for="mediaUrl">URL de l'image ou de la vidéo</label>
                <div class="input-icon-wrap">
                  <span class="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                  </span>
                  <input
                    type="url"
                    id="mediaUrl"
                    [(ngModel)]="newUrlInput"
                    (ngModelChange)="onUrlInputChange($event)"
                    name="url"
                    class="form-input has-icon"
                    placeholder="https://images.unsplash.com/... ou https://.../video.mp4"
                  />
                </div>
              </div>

              @if (newMediaUrl) {
                <div class="preview-box">
                  <div class="preview-media-wrapper">
                    @if (newType === 'VIDEO') {
                      <video [src]="newMediaUrl" controls playsinline class="preview-media-player"></video>
                    } @else {
                      <img [src]="newMediaUrl" alt="Aperçu" class="preview-media-img" />
                    }
                    <div class="preview-badge">
                      {{ newType === 'VIDEO' ? 'Vidéo Externe' : 'Image Externe' }}
                    </div>
                  </div>
                </div>
              }
            }

            <!-- Titre / Légende -->
            <div class="form-group">
              <label class="form-label" for="itemTitle">
                Titre / Légende <span class="required">*</span>
              </label>
              <input
                type="text"
                id="itemTitle"
                [(ngModel)]="newTitle"
                name="title"
                class="form-input"
                placeholder="ex. Défilé mode urbain 4K 60fps"
                required
              />
            </div>

            <!-- Smartphone & Matériel utilisé -->
            <div class="form-group">
              <label class="form-label" for="itemGear">
                Smartphone & Matériel utilisé <span class="required">*</span>
              </label>
              <input
                type="text"
                id="itemGear"
                [(ngModel)]="newGear"
                name="gear"
                class="form-input"
                placeholder="ex. iPhone 16 Pro Max • DJI OM 6"
                required
              />
              <div class="gear-chips-row">
                <span class="chips-hint">Suggestions :</span>
                @for (gear of gearPresets; track gear) {
                  <button
                    type="button"
                    class="chip-tag-btn"
                    [class.active]="newGear === gear"
                    (click)="newGear = gear"
                  >
                    {{ gear }}
                  </button>
                }
              </div>
            </div>

            <!-- Type de média (Boutons clairs et distincts Photo vs Vidéo) -->
            <div class="form-group">
              <label class="form-label">
                Type de média <span class="required">*</span>
              </label>
              <div class="media-type-selector">
                <button
                  type="button"
                  class="type-toggle-card"
                  [class.active]="newType === 'IMAGE'"
                  (click)="setMediaType('IMAGE')"
                >
                  <div class="type-icon-box">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                  <div class="type-text-box">
                    <strong>Photo HD</strong>
                    <span>Photo smartphone haute résolution</span>
                  </div>
                  <div class="type-check-indicator">
                    @if (newType === 'IMAGE') {
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    }
                  </div>
                </button>

                <button
                  type="button"
                  class="type-toggle-card"
                  [class.active]="newType === 'VIDEO'"
                  (click)="setMediaType('VIDEO')"
                >
                  <div class="type-icon-box">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7"></polygon>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                  </div>
                  <div class="type-text-box">
                    <strong>Vidéo 4K</strong>
                    <span>Vidéo verticale 4K / Reel / TikTok</span>
                  </div>
                  <div class="type-check-indicator">
                    @if (newType === 'VIDEO') {
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    }
                  </div>
                </button>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" (click)="closeModal()" class="btn btn-outline">
                Annuler
              </button>
              <button
                type="submit"
                [disabled]="!newTitle.trim() || !newMediaUrl || isSaving()"
                class="btn btn-primary submit-btn"
              >
                @if (isSaving()) {
                  <span>Enregistrement...</span>
                } @else {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Enregistrer dans le portfolio
                }
              </button>
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

    .add-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: var(--font-weight-bold);
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
      transition: transform var(--transition-base), box-shadow var(--transition-base);
    }

    .portfolio-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4), 0 0 24px var(--color-primary-glow);
    }

    .media-wrap {
      position: relative;
      height: 260px;
      background: #000;
      cursor: pointer;
      overflow: hidden;
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

    .video-play-badge {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.35);
      color: #fff;
      pointer-events: none;
      transition: background var(--transition-fast);
    }

    .video-play-badge svg {
      width: 48px;
      height: 48px;
      padding: 13px;
      border-radius: 50%;
      background: rgba(139, 92, 246, 0.9);
      backdrop-filter: blur(8px);
      box-shadow: 0 0 20px var(--color-primary-glow);
      transition: transform var(--transition-fast);
    }

    .media-wrap:hover .video-play-badge svg {
      transform: scale(1.15);
      background: var(--color-primary-500);
    }

    .type-pill {
      position: absolute;
      top: var(--space-3);
      right: var(--space-3);
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      color: #fff;
      font-size: 11px;
      font-weight: var(--font-weight-bold);
      border: 1px solid rgba(255, 255, 255, 0.15);
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
      display: inline-flex;
      align-items: center;
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
      max-width: 580px;
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
      transition: all var(--transition-fast);
    }

    .close-btn:hover {
      color: #fff;
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.4);
    }

    .modal-header h2 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-extrabold);
      margin-bottom: var(--space-1);
      letter-spacing: -0.02em;
    }
    .modal-sub {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-4);
      line-height: 1.5;
    }

    /* Tabs Switcher */
    .upload-mode-tabs {
      display: flex;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 4px;
      gap: 4px;
      margin-bottom: var(--space-5);
    }

    .mode-tab-btn {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .mode-tab-btn.active {
      background: var(--color-primary-500);
      color: #fff;
      box-shadow: 0 4px 12px var(--color-primary-glow);
    }

    .mode-tab-btn:hover:not(.active) {
      color: var(--color-text-primary);
      background: rgba(255, 255, 255, 0.05);
    }

    .upload-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    /* Dropzone Styling */
    .dropzone-box {
      border: 2px dashed rgba(139, 92, 246, 0.4);
      border-radius: var(--radius-xl);
      padding: var(--space-6) var(--space-4);
      text-align: center;
      cursor: pointer;
      background: rgba(139, 92, 246, 0.04);
      transition: all var(--transition-fast);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
    }

    .dropzone-box:hover, .dropzone-box.dragging {
      border-color: var(--color-primary-400);
      background: rgba(139, 92, 246, 0.12);
      transform: translateY(-2px);
    }

    .dropzone-icon-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(139, 92, 246, 0.15);
      border: 1px solid rgba(139, 92, 246, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-primary-300);
    }

    .dropzone-text strong {
      display: block;
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      margin-bottom: 2px;
    }

    .dropzone-text span {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .browse-link {
      color: var(--color-primary-400);
      text-decoration: underline;
      font-weight: var(--font-weight-semibold);
    }

    .dropzone-meta-pills {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: var(--space-1);
    }

    .meta-pill {
      font-size: 10px;
      padding: 2px 8px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-full);
      color: var(--color-text-muted);
    }

    /* Live Media Preview Box */
    .preview-box {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      overflow: hidden;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px);
    }

    .preview-media-wrapper {
      position: relative;
      max-height: 220px;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .preview-media-img, .preview-media-player {
      max-width: 100%;
      max-height: 220px;
      object-fit: contain;
    }

    .preview-badge {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(6px);
      color: var(--color-primary-300);
      font-size: 11px;
      font-weight: var(--font-weight-bold);
      padding: 3px 10px;
      border-radius: var(--radius-full);
      border: 1px solid rgba(139, 92, 246, 0.3);
    }

    .preview-info-bar {
      padding: var(--space-3) var(--space-4);
      background: rgba(15, 23, 42, 0.85);
      border-top: 1px solid var(--color-border-subtle);
      align-items: center;
      gap: var(--space-3);
    }

    .preview-file-meta {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    .file-name {
      color: var(--color-text-primary);
      font-weight: var(--font-weight-medium);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-size {
      color: var(--color-text-muted);
      font-size: 11px;
    }

    .preview-actions {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    /* Gear chips */
    .gear-chips-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin-top: var(--space-2);
    }

    .chips-hint {
      font-size: 11px;
      color: var(--color-text-muted);
      margin-right: 2px;
    }

    .chip-tag-btn {
      font-size: 11px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: var(--radius-full);
      padding: 3px 10px;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .chip-tag-btn:hover {
      color: var(--color-primary-300);
      border-color: rgba(139, 92, 246, 0.4);
      background: rgba(139, 92, 246, 0.1);
    }

    .chip-tag-btn.active {
      color: #fff;
      border-color: var(--color-primary-500);
      background: rgba(139, 92, 246, 0.25);
    }

    /* Media Type Selector */
    .media-type-selector {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3);
      margin-top: var(--space-2);
    }

    @media (max-width: 600px) {
      .media-type-selector {
        grid-template-columns: 1fr;
      }
    }

    .type-toggle-card {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: rgba(255, 255, 255, 0.03);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-lg);
      cursor: pointer;
      text-align: left;
      transition: all var(--transition-fast);
      position: relative;
    }

    .type-toggle-card:hover {
      background: rgba(139, 92, 246, 0.08);
      border-color: rgba(139, 92, 246, 0.4);
      transform: translateY(-1px);
    }

    .type-toggle-card.active {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.15));
      border-color: var(--color-primary-400);
      box-shadow: 0 0 16px rgba(139, 92, 246, 0.25);
    }

    .type-icon-box {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: rgba(139, 92, 246, 0.15);
      border: 1px solid rgba(139, 92, 246, 0.3);
      color: var(--color-primary-300);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all var(--transition-fast);
    }

    .type-toggle-card.active .type-icon-box {
      background: var(--color-primary-500);
      color: #fff;
      border-color: var(--color-primary-400);
    }

    .type-text-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .type-text-box strong {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      font-weight: var(--font-weight-semibold);
    }

    .type-text-box span {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      line-height: 1.3;
    }

    .type-toggle-card.active .type-text-box strong {
      color: #fff;
    }

    .type-check-indicator {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 1.5px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
      transition: all var(--transition-fast);
    }

    .type-toggle-card.active .type-check-indicator {
      background: var(--color-primary-500);
      border-color: var(--color-primary-400);
    }

    /* Form Actions */
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      margin-top: var(--space-4);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border-subtle);
    }

    .submit-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: var(--font-weight-bold);
    }

    @media (max-width: 640px) {
      .modal-card { padding: var(--space-5); }
      .upload-mode-tabs { flex-direction: column; }
      .dropzone-box { padding: var(--space-4); }
      .preview-info-bar { flex-direction: column; align-items: flex-start; gap: var(--space-2); }
      .preview-actions { width: 100%; justify-content: flex-end; }
      .modal-actions { flex-direction: column-reverse; gap: var(--space-2); }
      .modal-actions button { width: 100%; text-align: center; justify-content: center; }
    }
  `]
})
export class PortfolioManageComponent implements OnInit {
  private auth = inject(AuthService);
  private fileUploadService = inject(FileUploadService);

  openAddModal = signal(false);
  selectedMedia = signal<PortfolioItem | null>(null);
  isSaving = signal(false);

  defaultItems: PortfolioItem[] = [
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
  ];

  items = signal<PortfolioItem[]>(this.defaultItems);

  // Form states
  uploadMode: 'FILE' | 'URL' = 'FILE';
  newTitle = '';
  newMediaUrl = '';
  newUrlInput = '';
  newGear = 'iPhone 16 Pro Max • ProRes Log';
  newType: 'IMAGE' | 'VIDEO' = 'IMAGE';
  fileName = '';
  fileSize = '';
  isDragging = false;
  selectedFile: File | null = null;

  gearPresets = [
    'iPhone 16 Pro Max • ProRes Log',
    'iPhone 15 Pro • 4K 60fps',
    'Samsung Galaxy S24 Ultra • 8K',
    'Google Pixel 9 Pro • Video Boost',
    'DJI Osmo Mobile 6 • Stabilisateur',
    'Rode Wireless Pro • Audio 32-bit'
  ];

  ngOnInit(): void {
    this.loadPersistedItems();
  }

  private getStorageKey(): string {
    const user = this.auth.currentUser();
    return user?.id ? `snapconnect_creator_portfolio_${user.id}` : 'snapconnect_creator_portfolio';
  }

  private loadPersistedItems(): void {
    try {
      const saved = localStorage.getItem(this.getStorageKey());
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed.map((item: PortfolioItem) => {
            const url = (item.mediaUrl || '').toLowerCase();
            if (/\.(mp4|mov|webm|mkv|avi|m4v)(\?.*)?$/i.test(url)) {
              return { ...item, mediaType: 'VIDEO' as const };
            }
            return item;
          });
          this.items.set(normalized);
        }
      }
    } catch {
      /* Fallback silently */
    }
  }

  private persistItems(): void {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.items()));
    } catch (e) {
      console.warn('LocalStorage error while saving portfolio items:', e);
    }
  }

  setUploadMode(mode: 'FILE' | 'URL'): void {
    this.uploadMode = mode;
  }

  onFileChange(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.processFile(file);
    }
  }

  setMediaType(type: 'IMAGE' | 'VIDEO'): void {
    this.newType = type;
  }

  isVideoItem(item: PortfolioItem): boolean {
    if (item.mediaType === 'VIDEO') return true;
    const url = (item.mediaUrl || '').toLowerCase();
    return /\.(mp4|mov|webm|mkv|avi|m4v)(\?.*)?$/i.test(url);
  }

  processFile(file: File): void {
    this.selectedFile = file;
    this.fileName = file.name;
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    this.fileSize = `${sizeInMb} Mo`;

    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(file.name);

    if (isVideo) {
      this.newType = 'VIDEO';
      this.newMediaUrl = URL.createObjectURL(file);
    } else {
      this.newType = 'IMAGE';
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const rawData = e.target.result as string;
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            this.newMediaUrl = canvas.toDataURL('image/jpeg', 0.85);
          } else {
            this.newMediaUrl = rawData;
          }
        };
        img.onerror = () => {
          this.newMediaUrl = rawData;
        };
        img.src = rawData;
      };
      reader.readAsDataURL(file);
    }
  }

  clearMedia(): void {
    this.newMediaUrl = '';
    this.newUrlInput = '';
    this.fileName = '';
    this.fileSize = '';
    this.selectedFile = null;
  }

  onUrlInputChange(url: string): void {
    this.newMediaUrl = (url || '').trim();
    if (url.toLowerCase().match(/\.(mp4|mov|webm|mkv)(\?.*)?$/i) || url.toLowerCase().includes('video')) {
      this.newType = 'VIDEO';
    } else {
      this.newType = 'IMAGE';
    }
  }

  openModal(): void {
    this.resetForm();
    this.openAddModal.set(true);
  }

  closeModal(): void {
    this.resetForm();
    this.openAddModal.set(false);
  }

  resetForm(): void {
    this.uploadMode = 'FILE';
    this.newTitle = '';
    this.newMediaUrl = '';
    this.newUrlInput = '';
    this.fileName = '';
    this.fileSize = '';
    this.newGear = 'iPhone 16 Pro Max • ProRes Log';
    this.newType = 'IMAGE';
    this.isDragging = false;
    this.selectedFile = null;
  }

  saveItem(): void {
    if (!this.newTitle.trim() || (!this.newMediaUrl && !this.selectedFile)) return;

    this.isSaving.set(true);

    const user = this.auth.currentUser();
    const saveToStore = (url: string) => {
      const isVideo = this.newType === 'VIDEO' ||
                      (this.selectedFile && (this.selectedFile.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(this.selectedFile.name))) ||
                      /\.(mp4|mov|webm|mkv|avi|m4v)(\?.*)?$/i.test(url);
      const actualType = isVideo ? 'VIDEO' : 'IMAGE';

      const newItem: PortfolioItem = {
        id: 'p-' + Date.now(),
        creatorId: user?.id || 'cr-1',
        title: this.newTitle.trim(),
        mediaType: actualType,
        mediaUrl: url,
        thumbnailUrl: url,
        equipmentUsed: this.newGear.trim(),
        createdAt: new Date().toISOString()
      };
      this.items.update(prev => [newItem, ...prev]);
      this.persistItems();
      this.isSaving.set(false);
      this.closeModal();
    };

    if (this.uploadMode === 'FILE' && this.selectedFile) {
      this.fileUploadService.uploadPortfolio(this.selectedFile).subscribe({
        next: (url) => saveToStore(url),
        error: (err) => {
          console.warn('[Portfolio] Upload serveur en échec, bascule sur la prévisualisation locale HD:', err);
          if (this.newMediaUrl) {
            saveToStore(this.newMediaUrl);
          } else {
            this.isSaving.set(false);
            alert("Erreur lors de l'enregistrement du fichier. Veuillez vérifier votre connexion.");
          }
        }
      });
    } else {
      saveToStore(this.newMediaUrl);
    }
  }

  deleteItem(id: string): void {
    if (confirm('Voulez-vous vraiment supprimer cette réalisation de votre portfolio ?')) {
      this.items.update(prev => prev.filter(i => i.id !== id));
      this.persistItems();
    }
  }
}
