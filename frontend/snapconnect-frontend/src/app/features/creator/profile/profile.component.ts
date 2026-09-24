import { Component, computed, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MediaModalComponent } from '../../../shared/components/media-modal/media-modal.component';
import { AuthService } from '../../../core/services/auth.service';
import { PortfolioItem } from '../../../core/models/portfolio.model';

@Component({
  selector: 'app-creator-profile-edit',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    SlicePipe,
    NavbarComponent,
    FooterComponent,
    MediaModalComponent
  ],
  template: `
    <app-navbar></app-navbar>

    <main class="upwork-dashboard-page">
      <div class="uw-app-shell">

        <!-- ═══ LEFT NAV SIDEBAR (Upwork vertical nav) ═══ -->
        <nav class="uw-left-nav">
          <!-- User Mini Profile -->
          <div class="uw-nav-user-mini" routerLink="/creator/profile" title="Voir mon profil">
            @if (avatarUrl() && !avatarUrl().includes('photo-1534528741775')) {
              <img
                [src]="avatarUrl()"
                [alt]="displayName()"
                class="uw-nav-avatar"
                referrerpolicy="no-referrer"
              />
            } @else {
              <div class="uw-nav-avatar empty-avatar-placeholder">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            }
            <div class="uw-nav-user-info">
              <span class="uw-nav-name">{{ displayName() }}</span>
              <span class="uw-nav-role">Créateur Vidéo Mobile</span>
            </div>
            <svg class="uw-nav-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>

          <ul class="uw-nav-list">
            <li class="uw-nav-item">
              <a routerLink="/jobs" class="uw-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <span>Rechercher</span>
              </a>
            </li>
            <li class="uw-nav-item">
              <a routerLink="/creator/dashboard" class="uw-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span>Accueil</span>
              </a>
            </li>
            <li class="uw-nav-item">
              <a routerLink="/creator/notifications" class="uw-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <span>Notifications</span>
                <span class="uw-nav-badge">8</span>
              </a>
            </li>

            <li class="uw-nav-group-label">Opportunités</li>
            <li class="uw-nav-item">
              <a routerLink="/jobs" class="uw-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                <span>Trouver missions</span>
                <svg class="uw-nav-sub-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
            </li>
            <li class="uw-nav-item">
              <a routerLink="/creator/proposals" class="uw-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <span>Propositions</span>
              </a>
            </li>

            <li class="uw-nav-group-label">Activité</li>
            <li class="uw-nav-item">
              <a routerLink="/creator/contracts" class="uw-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                <span>Contrats</span>
                <svg class="uw-nav-sub-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
            </li>
            <li class="uw-nav-item">
              <a routerLink="/creator/earnings" class="uw-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                <span>Finances</span>
                <svg class="uw-nav-sub-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
            </li>
            <li class="uw-nav-item">
              <a routerLink="/messages" class="uw-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span>Messages</span>
              </a>
            </li>
            <li class="uw-nav-item active">
              <a routerLink="/creator/profile" class="uw-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                <span>Mon profil</span>
              </a>
            </li>
          </ul>

          <div class="uw-nav-help" (click)="triggerHelpToast()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span>Aide</span>
          </div>
        </nav>

        <!-- ═══ MAIN WORKSPACE (UPWORK PROFILE MASTER CARD + 2 COLUMNS) ═══ -->
        <div class="uw-profile-workspace">
          <div class="upwork-profile-container">

            <!-- Top Profile Master Card (Upwork Profile Header) -->
            <div class="upwork-card profile-master-card">
              <div class="profile-header-wrap">
                <div class="profile-header-left">
                  <!-- Avatar Circle with Status Dot & Edit Pencil -->
                  <div class="avatar-box">
                    @if (avatarUrl() && !avatarUrl().includes('photo-1534528741775')) {
                      <img
                        [src]="avatarUrl()"
                        [alt]="displayName()"
                        class="profile-avatar-img"
                        referrerpolicy="no-referrer"
                        (error)="onAvatarError($event)"
                      />
                    } @else {
                      <div class="profile-avatar-img empty-avatar-placeholder">
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                    }
                    <span class="avatar-online-dot" title="En ligne & disponible"></span>
                    <button
                      type="button"
                      class="avatar-edit-btn"
                      (click)="avatarFileInput.click()"
                      title="Changer ma photo de profil"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                    </button>
                    <input
                      #avatarFileInput
                      type="file"
                      accept="image/*"
                      (change)="onAvatarFileSelected($event)"
                      style="display: none;"
                    />
                  </div>

                  <!-- Identity & Location Meta -->
                  <div class="profile-identity">
                    <div class="identity-name-row">
                      <h1 class="creator-name">{{ displayName() }}</h1>
                    </div>

                    <div class="location-time-row">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pin-icon">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{{ location() }} – {{ formattedLocalTime() }}</span>
                      <button
                        type="button"
                        class="location-edit-btn"
                        (click)="openLocationModal()"
                        title="Modifier la localisation"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Top Right Action Controls (Upwork Buttons) -->
                <div class="profile-header-right">
                  <div class="header-action-buttons">
                    <a
                      [routerLink]="['/creators', currentUserId()]"
                      class="upwork-btn upwork-btn-outline"
                      title="Voir mon profil public tel que les clients le voient"
                    >
                      See public view
                    </a>
                    <button
                      type="button"
                      class="upwork-btn upwork-btn-solid"
                      (click)="openTitleRateModal()"
                      title="Paramètres du profil"
                    >
                      Profile settings
                    </button>
                  </div>

                  <button
                    type="button"
                    class="share-link-btn"
                    (click)="copyProfileShareLink()"
                    title="Partager mon profil"
                  >
                    <span>Share</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                      <polyline points="16 6 12 2 8 6"></polyline>
                      <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Upwork Notice Banner (Identical to Screenshot 1) -->
              @if (noticeVisible) {
                <div class="upwork-notice-banner">
                  <p class="notice-text">
                    You'll need to verify your identity to apply for jobs, appear in client search results, and more.
                  </p>
                  <button type="button" class="notice-close-btn" (click)="noticeVisible = false">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              }

              <!-- ════ TWO-COLUMN UPWORK PROFILE LAYOUT ════ -->
              <div class="upwork-layout-columns">

                <!-- ── LEFT SIDEBAR (Upwork Controls) ── -->
                <aside class="upwork-sidebar">

                  <!-- Card 1: Promote with ads -->
                  <div class="sidebar-box promote-box">
                    <h4 class="sidebar-box-title">Promote with ads</h4>

                    <div class="promote-toggle-row flex-between">
                      <div class="toggle-info">
                        <span class="toggle-label">Open for work</span>
                        <span class="toggle-status" [class.status-on]="isOpenForWork">{{ isOpenForWork ? 'Disponible' : 'Off' }}</span>
                      </div>
                      <button type="button" class="icon-action-btn" (click)="openAvailabilityModal()" aria-label="Modifier Open for work">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                    </div>

                    <div class="promote-toggle-row flex-between mt-2">
                      <div class="toggle-info">
                        <span class="toggle-label">Boost your profile</span>
                        <span class="toggle-status" [class.status-on]="isBoosted">{{ isBoosted ? 'Activé' : 'Off' }}</span>
                      </div>
                      <button type="button" class="icon-action-btn" (click)="toggleProfileBoost()" aria-label="Modifier Boost">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>



                  <!-- Card 3: Hours per week -->
                  <div class="sidebar-box">
                    <div class="sidebar-sub-header flex-between">
                      <h4>Hours per week</h4>
                      <button type="button" class="icon-action-btn" (click)="openHoursModal()" aria-label="Modifier les heures">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                    </div>
                    <p class="sidebar-detail-text">{{ hoursPerWeek }}</p>
                    <p class="sidebar-sub-text">No contract-to-hire preference set</p>
                  </div>

                  <!-- Card 4: Languages -->
                  <div class="sidebar-box">
                    <div class="sidebar-sub-header flex-between">
                      <h4>Languages</h4>
                      <div style="display: flex; gap: 4px;">
                        <button type="button" class="icon-action-btn" (click)="openLanguagesModal()" aria-label="Ajouter langue">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                        <button type="button" class="icon-action-btn" (click)="openLanguagesModal()" aria-label="Modifier langues">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <ul class="sidebar-lang-list">
                      @for (lang of userLanguages(); track lang.name) {
                        <li><strong>{{ lang.name }}:</strong> <span>{{ lang.level }}</span></li>
                      }
                    </ul>
                  </div>

                  <!-- Card 5: Certified 4K Gear -->
                  <div class="sidebar-box gear-box">
                    <div class="sidebar-sub-header flex-between">
                      <h4>Équipement certifié 4K</h4>
                      <button type="button" class="icon-action-btn" (click)="openGearModal()">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                    </div>
                    <div class="gear-items-list">
                      <div class="gear-spec-row">
                        <div class="gear-svg-icon icon-violet">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="5" y="2" width="14" height="20" rx="3.5"></rect>
                            <path d="M10 5.5h4"></path>
                            <line x1="10" y1="19" x2="14" y2="19"></line>
                          </svg>
                        </div>
                        <div class="gear-spec-info">
                          <span class="gear-type">SMARTPHONE</span>
                          <strong>{{ smartphoneModel }}</strong>
                        </div>
                      </div>

                      <div class="gear-spec-row">
                        <div class="gear-svg-icon icon-emerald">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="6" y="3" width="12" height="7" rx="2"></rect>
                            <path d="M12 10v3"></path>
                            <circle cx="12" cy="15" r="2"></circle>
                            <path d="M12 17v4"></path>
                            <path d="M10 21h4"></path>
                          </svg>
                        </div>
                        <div class="gear-spec-info">
                          <span class="gear-type">STABILISATEUR</span>
                          <strong>{{ gimbalModel }}</strong>
                        </div>
                      </div>

                      <div class="gear-spec-row">
                        <div class="gear-svg-icon icon-blue">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="7" y="2" width="10" height="12" rx="3"></rect>
                            <line x1="12" y1="6" x2="12" y2="8"></line>
                            <path d="M5 10a7 7 0 0 0 14 0"></path>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                            <line x1="9" y1="21" x2="15" y2="21"></line>
                          </svg>
                        </div>
                        <div class="gear-spec-info">
                          <span class="gear-type">AUDIO PRO</span>
                          <strong>{{ audioModel }}</strong>
                        </div>
                      </div>
                    </div>
                  </div>



                </aside>

                <!-- ── RIGHT MAIN COLUMN (Upwork Body) ── -->
                <section class="upwork-main-column">

                  <!-- Title & Rate Row (Matching Screenshot 1) -->
                  <div class="main-title-rate-row flex-between">
                    <div class="title-with-edit">
                      <h2 class="professional-title">{{ title() }}</h2>
                      <button
                        type="button"
                        class="green-circle-btn"
                        (click)="openTitleRateModal()"
                        title="Modifier le titre professionnel"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                    </div>

                    <div class="rate-with-edit">
                      <span class="hourly-rate-val">{{ hourlyRate() }} DT/hr</span>
                      <button
                        type="button"
                        class="green-circle-btn"
                        (click)="openTitleRateModal()"
                        title="Modifier le tarif horaire"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                      <button
                        type="button"
                        class="link-share-icon-btn"
                        (click)="copyProfileShareLink()"
                        title="Partager le lien direct de ce profil"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Bio / Overview Paragraph with Edit Pencil -->
                  <div class="bio-overview-box">
                    <div class="bio-content-wrap">
                      <p class="bio-text" [class.clamped]="!bioExpanded && bio().length > 280">
                        {{ bio() }}
                      </p>
                      @if (bio().length > 280) {
                        <button
                          type="button"
                          class="bio-toggle-btn"
                          (click)="bioExpanded = !bioExpanded"
                        >
                          {{ bioExpanded ? 'less' : 'more' }}
                        </button>
                      }
                    </div>

                    <button
                      type="button"
                      class="green-circle-btn bio-edit-btn"
                      (click)="openBioModal()"
                      title="Modifier la présentation"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                    </button>
                  </div>

                  <div class="section-divider"></div>

                  <!-- ════ PORTFOLIO SECTION (Upwork Style - Screenshot 1) ════ -->
                  <div class="portfolio-upwork-section">
                    <div class="portfolio-header-row flex-between">
                      <h3 class="section-heading">Portfolio</h3>
                      <button
                        type="button"
                        class="green-plus-circle-btn"
                        (click)="openAddPortfolioModal()"
                        title="Ajouter une réalisation au portfolio"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    </div>

                    <!-- Published / Drafts Tabs -->
                    <div class="portfolio-tabs-row">
                      <button
                        type="button"
                        class="port-tab-btn"
                        [class.active]="activePortfolioTab === 'published'"
                        (click)="activePortfolioTab = 'published'"
                      >
                        Published
                      </button>
                      <button
                        type="button"
                        class="port-tab-btn"
                        [class.active]="activePortfolioTab === 'drafts'"
                        (click)="activePortfolioTab = 'drafts'"
                      >
                        Drafts
                      </button>
                    </div>

                    <!-- Portfolio Content -->
                    @if (activePortfolioTab === 'published') {
                      @if (publishedItems().length > 0) {
                        <div class="upwork-portfolio-grid">
                          @for (item of publishedItems(); track item.id) {
                            <div class="upwork-port-card" (click)="selectedMedia.set(item)">
                              <div class="port-thumbnail-wrap">
                                @if (item.mediaType === 'VIDEO') {
                                  <video [src]="item.mediaUrl" class="port-media" playsinline muted preload="metadata"></video>
                                  <div class="port-play-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                  </div>
                                } @else {
                                  <img [src]="item.thumbnailUrl || item.mediaUrl" [alt]="item.title" class="port-media" />
                                }
                                <span class="media-type-tag">
                                  {{ item.mediaType === 'VIDEO' ? 'Vidéo 4K' : 'Photo HD' }}
                                </span>
                              </div>

                              <div class="port-card-details">
                                <h4 class="port-item-title">{{ item.title }}</h4>
                                <span class="port-gear-tag">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="5" y="2" width="14" height="20" rx="2"></rect>
                                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                                  </svg>
                                  {{ item.equipmentUsed || 'iPhone 16 Pro' }}
                                </span>
                              </div>
                            </div>
                          }
                        </div>
                      } @else {
                        <!-- Authentic Upwork Briefcase Empty State (Screenshot 1) -->
                        <div class="portfolio-upwork-empty-state">
                          <div class="upwork-briefcase-svg-wrap">
                            <svg width="90" height="70" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="15" y="22" width="70" height="50" rx="6" fill="#8d3a1b" stroke="#712e15" stroke-width="2"/>
                              <path d="M38 22V14C38 11.8 39.8 10 42 10H58C60.2 10 62 11.8 62 14V22" stroke="#d97706" stroke-width="3" stroke-linecap="round"/>
                              <path d="M15 38H85" stroke="#712e15" stroke-width="2"/>
                              <rect x="44" y="33" width="12" height="10" rx="2" fill="#fbbf24"/>
                              <circle cx="50" cy="38" r="1.5" fill="#712e15"/>
                              <line x1="50" y1="2" x2="50" y2="5" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
                              <line x1="32" y1="6" x2="35" y2="8" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
                              <line x1="68" y1="6" x2="65" y2="8" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                          </div>
                          <p class="upwork-portfolio-pitch">
                            <button type="button" class="upwork-green-link" (click)="openAddPortfolioModal()">Add a project.</button>
                            Talent are hired 9x more often if they've published a portfolio.
                          </p>
                        </div>
                      }
                    } @else {
                      <!-- Drafts Empty State -->
                      <div class="portfolio-upwork-empty-state">
                        <p class="upwork-portfolio-pitch">
                          Aucun brouillon de projet.
                          <button type="button" class="upwork-green-link" (click)="openAddPortfolioModal()">Créer un projet</button>
                        </p>
                      </div>
                    }
                  </div>

                  <div class="section-divider"></div>

                  <!-- ════ WORK HISTORY (Screenshot 1) ════ -->
                  <div class="work-history-section">
                    <div class="history-header flex-between">
                      <h3 class="section-heading">Work history</h3>
                    </div>
                    <div class="work-history-empty-note">
                      <p>No items</p>
                    </div>
                  </div>

                  <div class="section-divider"></div>

                  <!-- ════ SKILLS (Screenshot 1) ════ -->
                  <div class="skills-upwork-section">
                    <div class="skills-header-row flex-between">
                      <h3 class="section-heading">Skills</h3>
                      <button type="button" class="green-circle-btn" (click)="openAddSkillModal()" title="Ajouter / modifier compétences">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                    </div>

                    <div class="skills-tags-cloud">
                      @for (skill of skillsList; track skill) {
                        <span class="skill-pill">
                          {{ skill }}
                          <button type="button" class="remove-skill-btn" (click)="removeSkill(skill)" title="Retirer">×</button>
                        </span>
                      }
                    </div>
                  </div>

                </section>
              </div>

            </div><!-- /.profile-master-card -->
          </div><!-- /.upwork-profile-container -->
        </div><!-- /.uw-profile-workspace -->

      </div><!-- /.uw-app-shell -->
    </main>

    <!-- ═══ MODALS & DIALOGS ═══ -->

    <!-- Modal : Modifier Localisation -->
    @if (locationModalOpen) {
      <div class="upwork-modal-backdrop" (click)="locationModalOpen = false">
        <div class="upwork-modal-card" (click)="$event.stopPropagation()">
          <button class="modal-close-x" (click)="locationModalOpen = false"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>

          <h3 class="modal-title">Modifier la localisation</h3>
          <p class="modal-sub">Indiquez votre ville ou gouvernorat en Tunisie pour permettre aux clients de vous situer.</p>

          <form (ngSubmit)="saveLocation()" class="modal-form">
            <div class="form-group">
              <label class="modal-label">Ville / Gouvernorat (Tunisie)</label>
              <input
                type="text"
                [(ngModel)]="tempLocation"
                name="location"
                class="modal-input"
                placeholder="Ex: Tunis, Tunisia"
                required
              />

              <div class="popular-locations-chips">
                <span class="chips-label">Suggestions rapides :</span>
                <div class="chips-list">
                  @for (city of popularCities; track city) {
                    <button
                      type="button"
                      class="city-chip"
                      [class.active]="tempLocation === city"
                      (click)="selectCity(city)"
                    >
                      {{ city }}
                    </button>
                  }
                </div>
              </div>
            </div>

            <div class="modal-actions-row flex-between">
              <button type="button" class="upwork-btn upwork-btn-outline" (click)="locationModalOpen = false">
                Annuler
              </button>
              <button type="submit" class="upwork-btn upwork-btn-solid">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    }



    <!-- 1. Modal : Modifier Titre & Tarif Horaire -->
    @if (titleRateModalOpen) {
      <div class="upwork-modal-backdrop" (click)="titleRateModalOpen = false">
        <div class="upwork-modal-card" (click)="$event.stopPropagation()">
          <button class="modal-close-x" (click)="titleRateModalOpen = false"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          
          <h3 class="modal-title">Modifier le titre & tarif horaire</h3>
          <p class="modal-sub">Définissez votre spécialité smartphone et votre taux horaire en Dinars Tunisiens.</p>

          <form (ngSubmit)="saveTitleRate()" class="modal-form">
            <div class="form-group">
              <label class="modal-label">Titre professionnel</label>
              <input
                type="text"
                [(ngModel)]="tempTitle"
                name="title"
                class="modal-input"
                placeholder="Ex: Vidéaste Smartphone & Créateur UGC"
                required
              />
            </div>

            <div class="form-group">
              <label class="modal-label">Tarif horaire (DT/h)</label>
              <div class="input-with-suffix">
                <input
                  type="number"
                  [(ngModel)]="tempHourlyRate"
                  name="hourlyRate"
                  class="modal-input"
                  min="5"
                  max="500"
                  required
                />
                <span class="input-suffix">DT / heure</span>
              </div>
            </div>

            <div class="modal-actions-row flex-between">
              <button type="button" class="upwork-btn upwork-btn-outline" (click)="titleRateModalOpen = false">
                Annuler
              </button>
              <button type="submit" class="upwork-btn upwork-btn-solid">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- 2. Modal : Modifier Présentation & Bio -->
    @if (bioModalOpen) {
      <div class="upwork-modal-backdrop" (click)="bioModalOpen = false">
        <div class="upwork-modal-card" (click)="$event.stopPropagation()">
          <button class="modal-close-x" (click)="bioModalOpen = false"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>

          <h3 class="modal-title">Modifier la présentation (Bio)</h3>
          <p class="modal-sub">Présentez votre style vidéo, votre expertise mobile et votre matériel aux marques.</p>

          <form (ngSubmit)="saveBio()" class="modal-form">
            <div class="form-group">
              <textarea
                [(ngModel)]="tempBio"
                name="bio"
                class="modal-textarea"
                rows="7"
                maxlength="1500"
                placeholder="Parlez de votre passion pour la vidéo smartphone..."
                required
              ></textarea>
              <span class="char-count">{{ tempBio.length }}/1500 caractères</span>
            </div>

            <div class="modal-actions-row flex-between">
              <button type="button" class="upwork-btn upwork-btn-outline" (click)="bioModalOpen = false">
                Annuler
              </button>
              <button type="submit" class="upwork-btn upwork-btn-solid">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- 3. Modal : Modifier Heures par semaine -->
    @if (hoursModalOpen) {
      <div class="upwork-modal-backdrop" (click)="hoursModalOpen = false">
        <div class="upwork-modal-card" (click)="$event.stopPropagation()">
          <button class="modal-close-x" (click)="hoursModalOpen = false"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>

          <h3 class="modal-title">Disponibilité hebdomadaire</h3>
          <p class="modal-sub">Combien d'heures par semaine pouvez-vous consacrer aux missions clients ?</p>

          <form (ngSubmit)="saveHours()" class="modal-form">
            <div class="radio-options-list">
              <label class="radio-option-item" [class.selected]="tempHoursPerWeek === 'More than 30 hrs/week'">
                <input type="radio" name="hours" [(ngModel)]="tempHoursPerWeek" value="More than 30 hrs/week" />
                <div>
                  <strong>Plus de 30 hrs / semaine</strong>
                  <span>Plein temps (Full-time disponible)</span>
                </div>
              </label>

              <label class="radio-option-item" [class.selected]="tempHoursPerWeek === 'Less than 30 hrs/week'">
                <input type="radio" name="hours" [(ngModel)]="tempHoursPerWeek" value="Less than 30 hrs/week" />
                <div>
                  <strong>Moins de 30 hrs / semaine</strong>
                  <span>Temps partiel (Soirs et week-ends)</span>
                </div>
              </label>

              <label class="radio-option-item" [class.selected]="tempHoursPerWeek === 'As needed - open to offers'">
                <input type="radio" name="hours" [(ngModel)]="tempHoursPerWeek" value="As needed - open to offers" />
                <div>
                  <strong>Selon le besoin</strong>
                  <span>Disponible ponctuellement pour des projets clés</span>
                </div>
              </label>
            </div>

            <div class="modal-actions-row flex-between mt-4">
              <button type="button" class="upwork-btn upwork-btn-outline" (click)="hoursModalOpen = false">
                Annuler
              </button>
              <button type="submit" class="upwork-btn upwork-btn-solid">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- 4. Modal : Modifier Matériel Certifié 4K -->
    @if (gearModalOpen) {
      <div class="upwork-modal-backdrop" (click)="gearModalOpen = false">
        <div class="upwork-modal-card" (click)="$event.stopPropagation()">
          <button class="modal-close-x" (click)="gearModalOpen = false"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>

          <h3 class="modal-title">Équipement Smartphone Certifié 4K</h3>
          <p class="modal-sub">Les marques choisissent les créateurs équipés pour un rendu professionnel.</p>

          <form (ngSubmit)="saveGear()" class="modal-form">
            <div class="form-group">
              <label class="modal-label">Modèle de Smartphone</label>
              <input
                type="text"
                [(ngModel)]="tempSmartphone"
                name="smartphone"
                class="modal-input"
                placeholder="Ex: iPhone 16 Pro Max • 4K ProRes Log"
                required
              />
            </div>

            <div class="form-group">
              <label class="modal-label">Stabilisateur / Gimbal</label>
              <input
                type="text"
                [(ngModel)]="tempGimbal"
                name="gimbal"
                class="modal-input"
                placeholder="Ex: DJI Osmo Mobile 6"
              />
            </div>

            <div class="form-group">
              <label class="modal-label">Configuration Audio</label>
              <input
                type="text"
                [(ngModel)]="tempAudio"
                name="audio"
                class="modal-input"
                placeholder="Ex: Rode Wireless Pro 32-bit float"
              />
            </div>

            <div class="modal-actions-row flex-between mt-4">
              <button type="button" class="upwork-btn upwork-btn-outline" (click)="gearModalOpen = false">
                Annuler
              </button>
              <button type="submit" class="upwork-btn upwork-btn-solid">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- 5. Modal : Modifier Langues -->
    @if (languagesModalOpen) {
      <div class="upwork-modal-backdrop" (click)="languagesModalOpen = false">
        <div class="upwork-modal-card" (click)="$event.stopPropagation()">
          <button class="modal-close-x" (click)="languagesModalOpen = false"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>

          <h3 class="modal-title">Langues maîtrisées</h3>
          <p class="modal-sub">Indiquez les langues dans lesquelles vous pouvez communiquer et créer du contenu.</p>

          <form (ngSubmit)="saveLanguages()" class="modal-form">
            <div class="languages-list-form">
              @for (lang of tempLanguages; track $index) {
                <div class="lang-edit-row">
                  <input
                    type="text"
                    [(ngModel)]="lang.name"
                    [name]="'lang_name_' + $index"
                    class="modal-input lang-name-input"
                    placeholder="Langue (ex: Anglais)"
                    required
                  />
                  <select
                    [(ngModel)]="lang.level"
                    [name]="'lang_lvl_' + $index"
                    class="modal-select lang-lvl-select"
                  >
                    <option value="Native or Bilingual">Langue maternelle / Bilingue</option>
                    <option value="Fluent">Courant</option>
                    <option value="Conversational">Intermédiaire</option>
                    <option value="Basic">Basique</option>
                  </select>
                  <button type="button" class="lang-del-btn" (click)="removeLanguage($index)" title="Supprimer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                </div>
              }
            </div>

            <button type="button" class="add-lang-text-btn" (click)="addLanguage()">
              + Ajouter une langue
            </button>

            <div class="modal-actions-row flex-between mt-4">
              <button type="button" class="upwork-btn upwork-btn-outline" (click)="languagesModalOpen = false">
                Annuler
              </button>
              <button type="submit" class="upwork-btn upwork-btn-solid">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- 6. Modal : Ajouter un projet au Portfolio -->
    @if (addPortfolioModalOpen) {
      <div class="upwork-modal-backdrop" (click)="closePortfolioModal()">
        <div class="upwork-modal-card wide-card" (click)="$event.stopPropagation()">
          <button class="modal-close-x" (click)="closePortfolioModal()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>

          <h3 class="modal-title">Ajouter une réalisation au portfolio</h3>
          <p class="modal-sub">Importez vos photos ou vidéos smartphone 4K ou ajoutez un lien externe.</p>

          <form (ngSubmit)="savePortfolioItem()" class="modal-form">
            <div class="form-group">
              <label class="modal-label">Titre de la vidéo / réalisation</label>
              <input
                type="text"
                [(ngModel)]="newPortTitle"
                name="title"
                class="modal-input"
                placeholder="Ex: Reel UGC Soin du Visage Bio"
                required
              />
            </div>

            <div class="form-group">
              <label class="modal-label">Fichier photo ou vidéo smartphone</label>
              <div class="modal-file-dropzone" (click)="portFileInput.click()">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Glissez un fichier ou cliquez pour importer</span>
              </div>
              <input #portFileInput type="file" accept="image/*,video/*" (change)="onPortFileSelected($event)" style="display: none;" />
              @if (newPortMediaUrl) {
                <span class="preview-url-tag">Média sélectionné avec succès</span>
              }
            </div>

            <div class="form-group">
              <label class="modal-label">Matériel utilisé</label>
              <input
                type="text"
                [(ngModel)]="newPortEquipment"
                name="equip"
                class="modal-input"
                placeholder="Ex: iPhone 16 Pro Max • 4K 60fps"
              />
            </div>

            <div class="modal-actions-row flex-between">
              <button type="button" class="upwork-btn upwork-btn-outline" (click)="closePortfolioModal()">
                Annuler
              </button>
              <button type="submit" class="upwork-btn upwork-btn-solid">
                Enregistrer dans le portfolio
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- 7. Lightbox Preview Modal -->
    @if (selectedMedia()) {
      <app-media-modal [item]="selectedMedia()" (close)="selectedMedia.set(null)"></app-media-modal>
    }

    <!-- Toast Notification -->
    @if (toastMessage) {
      <div class="upwork-toast animate-scale-in">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#108a00" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .upwork-dashboard-page {
      background: #0b0e14;
      color: #e2e8f0;
      min-height: 100vh;
      font-family: var(--font-family-sans, 'Outfit', sans-serif);
      padding-top: var(--navbar-height, 70px);
    }

    .flex-between {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* ════ APP SHELL ════ */
    .uw-app-shell {
      display: grid;
      grid-template-columns: 240px 1fr;
      min-height: calc(100vh - var(--navbar-height, 70px));
    }

    /* LEFT NAV */
    .uw-left-nav {
      position: sticky;
      top: var(--navbar-height, 70px);
      height: calc(100vh - var(--navbar-height, 70px));
      overflow-y: auto;
      background: #0f141c;
      border-right: 1px solid rgba(255,255,255,0.06);
      display: flex;
      flex-direction: column;
      padding: 1.25rem 0;
    }

    .uw-nav-user-mini {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 1rem;
      margin: 0 0.5rem 0.75rem;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.02);
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .uw-nav-user-mini:hover {
      background: rgba(255,255,255,0.05);
      border-color: rgba(255,255,255,0.12);
    }
    .uw-nav-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #108a00;
      flex-shrink: 0;
    }
    .uw-nav-user-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      flex: 1;
    }
    .uw-nav-name {
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .uw-nav-role {
      font-size: 11px;
      color: rgba(255,255,255,0.45);
    }
    .uw-nav-arrow {
      color: rgba(255,255,255,0.3);
      flex-shrink: 0;
    }

    .uw-nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
      flex: 1;
    }
    .uw-nav-group-label {
      font-size: 11px;
      font-weight: 700;
      color: rgba(255,255,255,0.3);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 1rem 1.25rem 0.4rem;
    }
    .uw-nav-item {
      list-style: none;
    }
    .uw-nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 1.25rem;
      font-size: 13px;
      font-weight: 500;
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      transition: all 0.18s;
      position: relative;
    }
    .uw-nav-link:hover {
      color: #fff;
      background: rgba(255,255,255,0.04);
    }
    .uw-nav-item.active .uw-nav-link {
      color: #fff;
      background: rgba(255,255,255,0.08);
      font-weight: 600;
    }
    .uw-nav-item.active .uw-nav-link::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #108a00;
      border-radius: 0 4px 4px 0;
    }
    .uw-nav-sub-arrow {
      margin-left: auto;
      color: rgba(255,255,255,0.3);
    }
    .uw-nav-badge {
      margin-left: auto;
      background: #ec4899;
      color: white;
      font-size: 10px;
      font-weight: 700;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .uw-nav-help {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.8rem 1.25rem;
      color: rgba(255,255,255,0.4);
      font-size: 13px;
      cursor: pointer;
      border-top: 1px solid rgba(255,255,255,0.06);
      margin-top: auto;
      transition: color 0.2s;
    }
    .uw-nav-help:hover {
      color: #fff;
    }

    /* ════ PROFILE WORKSPACE ════ */
    .uw-profile-workspace {
      overflow-y: auto;
      padding: 2rem 2.5rem 5rem;
      max-width: 1320px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }
    .upwork-profile-container {
      width: 100%;
    }

    /* PROFILE MASTER CARD */
    .profile-master-card {
      background: #141a24;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 18px;
      padding: 2rem;
      box-shadow: 0 4px 24px rgba(0,0,0,0.25);
    }

    .profile-header-wrap {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.5rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }

    .profile-header-left {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .avatar-box {
      position: relative;
      width: 90px;
      height: 90px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .profile-avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #108a00;
    }
    .empty-avatar-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #1e293b;
      color: #64748b;
    }
    .avatar-online-dot {
      position: absolute;
      top: 4px;
      left: 4px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #108a00;
      border: 2px solid #141a24;
    }
    .avatar-edit-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #108a00;
      color: #ffffff;
      border: 2px solid #141a24;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.15s;
    }
    .avatar-edit-btn:hover {
      transform: scale(1.1);
    }

    .profile-identity {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .identity-name-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .creator-name {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }
    .verify-identity-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 13px;
      font-weight: 600;
      color: #108a00;
      cursor: pointer;
    }
    .verify-identity-badge:hover {
      text-decoration: underline;
    }
    .location-time-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 13px;
      color: #94a3b8;
    }
    .location-edit-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #108a00;
      cursor: pointer;
      margin-left: 0.35rem;
      transition: all 0.2s;
    }
    .location-edit-btn:hover {
      background: rgba(16, 138, 0, 0.15);
      border-color: #108a00;
      transform: scale(1.08);
    }
    .popular-locations-chips {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-top: 0.6rem;
    }
    .chips-label {
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .chips-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }
    .city-chip {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .city-chip:hover {
      background: rgba(16, 138, 0, 0.12);
      border-color: #108a00;
      color: #fff;
    }
    .city-chip.active {
      background: #108a00;
      border-color: #108a00;
      color: #fff;
      font-weight: 600;
    }

    .profile-header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .header-action-buttons {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .upwork-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.55rem 1.25rem;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .upwork-btn-outline {
      background: transparent;
      border: 1px solid #108a00;
      color: #108a00;
    }
    .upwork-btn-outline:hover {
      background: rgba(16,138,0,0.1);
    }
    .upwork-btn-solid {
      background: #108a00;
      border: 1px solid #108a00;
      color: #ffffff;
    }
    .upwork-btn-solid:hover {
      background: #14a800;
    }

    .share-link-btn {
      background: transparent;
      border: none;
      color: #108a00;
      font-size: 14px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      cursor: pointer;
      font-family: inherit;
    }
    .share-link-btn:hover {
      text-decoration: underline;
    }

    /* NOTICE BANNER (Upwork alert in Screenshot 1) */
    .upwork-notice-banner {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 0.75rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .notice-text {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
    }
    .notice-close-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    .notice-close-btn:hover {
      color: #fff;
    }

    /* ════ 2 COLUMNS UPWORK LAYOUT ════ */
    .upwork-layout-columns {
      display: grid;
      grid-template-columns: 310px 1fr;
      gap: 2.5rem;
      border-top: 1px solid rgba(255,255,255,0.08);
      padding-top: 2rem;
    }

    /* LEFT SIDEBAR */
    .upwork-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      border-right: 1px solid rgba(255,255,255,0.08);
      padding-right: 2rem;
    }

    .sidebar-box {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .promote-box {
      background: #101726;
      border: 1px solid rgba(56,189,248,0.2);
      border-radius: 12px;
      padding: 1rem;
    }
    .sidebar-box-title {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.5rem;
    }
    .promote-toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .toggle-info {
      display: flex;
      flex-direction: column;
    }
    .toggle-label {
      font-size: 12px;
      color: #94a3b8;
    }
    .toggle-status {
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
    }
    .toggle-status.status-on {
      color: #108a00;
    }
    .icon-action-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s;
    }
    .icon-action-btn:hover {
      color: #108a00;
    }

    .sidebar-sub-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .sidebar-sub-header h4 {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }
    .sidebar-detail-text {
      font-size: 13px;
      color: #e2e8f0;
      margin: 0;
    }
    .sidebar-sub-text {
      font-size: 11px;
      color: #64748b;
      margin: 0;
    }



    .sidebar-lang-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      font-size: 13px;
    }
    .sidebar-lang-list strong {
      color: #ffffff;
    }
    .sidebar-lang-list span {
      color: #94a3b8;
    }

    .gear-items-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .gear-spec-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 8px;
      padding: 0.6rem;
    }
    .gear-svg-icon {
      width: 30px;
      height: 30px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-violet { background: rgba(168,85,247,0.15); color: #a855f7; }
    .icon-emerald { background: rgba(16,185,129,0.15); color: #10b981; }
    .icon-blue { background: rgba(56,189,248,0.15); color: #38bdf8; }

    .gear-spec-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .gear-type {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #94a3b8;
    }
    .gear-spec-info strong {
      font-size: 12px;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* RIGHT MAIN COLUMN */
    .upwork-main-column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      min-width: 0;
    }

    .main-title-rate-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .title-with-edit {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .professional-title {
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }
    .rate-with-edit {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .hourly-rate-val {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
    }
    .green-circle-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1.5px solid #108a00;
      background: transparent;
      color: #108a00;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s;
    }
    .green-circle-btn:hover {
      background: #108a00;
      color: #fff;
    }
    .link-share-icon-btn {
      background: transparent;
      border: none;
      color: #108a00;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
    }

    .bio-overview-box {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
    }
    .bio-content-wrap {
      flex: 1;
    }
    .bio-text {
      font-size: 14px;
      color: #cbd5e1;
      line-height: 1.6;
      margin: 0;
    }
    .bio-text.clamped {
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .bio-toggle-btn {
      background: transparent;
      border: none;
      color: #108a00;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 0;
      text-decoration: underline;
    }

    .section-divider {
      height: 1px;
      background: rgba(255,255,255,0.08);
      margin: 0.5rem 0;
    }

    /* PORTFOLIO SECTION */
    .portfolio-upwork-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .section-heading {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }
    .green-plus-circle-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1.5px solid #108a00;
      background: transparent;
      color: #108a00;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s;
    }
    .green-plus-circle-btn:hover {
      background: #108a00;
      color: #fff;
    }

    .portfolio-tabs-row {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 0.5rem;
    }
    .port-tab-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 14px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      padding-bottom: 0.4rem;
      position: relative;
    }
    .port-tab-btn.active {
      color: #fff;
    }
    .port-tab-btn.active::after {
      content: '';
      position: absolute;
      bottom: -0.5rem;
      left: 0;
      right: 0;
      height: 2px;
      background: #108a00;
    }

    /* Briefcase empty state (Identical to Screenshot 1) */
    .portfolio-upwork-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1rem;
      text-align: center;
      gap: 1rem;
    }
    .upwork-briefcase-svg-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .upwork-portfolio-pitch {
      font-size: 14px;
      color: #94a3b8;
      max-width: 480px;
      line-height: 1.5;
      margin: 0;
    }
    .upwork-green-link {
      background: transparent;
      border: none;
      color: #108a00;
      font-weight: 700;
      font-size: inherit;
      cursor: pointer;
      text-decoration: underline;
      padding: 0;
    }
    .upwork-green-link:hover {
      color: #14a800;
    }

    .upwork-portfolio-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
    }
    .upwork-port-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s, border-color 0.2s;
    }
    .upwork-port-card:hover {
      transform: translateY(-2px);
      border-color: #108a00;
    }
    .port-thumbnail-wrap {
      position: relative;
      height: 140px;
      background: #000;
    }
    .port-media {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .port-play-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(0,0,0,0.6);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .media-type-tag {
      position: absolute;
      bottom: 8px;
      left: 8px;
      background: rgba(0,0,0,0.7);
      color: #fff;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .port-card-details {
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }
    .port-item-title {
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .port-gear-tag {
      font-size: 11px;
      color: #94a3b8;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }

    /* WORK HISTORY */
    .work-history-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .work-history-empty-note p {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }

    /* SKILLS */
    .skills-upwork-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .skills-tags-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .skill-pill {
      background: rgba(255,255,255,0.06);
      color: #e2e8f0;
      border-radius: 9999px;
      padding: 5px 14px;
      font-size: 13px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .remove-skill-btn {
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.4);
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      padding: 0;
    }
    .remove-skill-btn:hover {
      color: #ef4444;
    }

    /* MODALS */
    .upwork-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .upwork-modal-card {
      background: #141a24;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 2rem;
      max-width: 500px;
      width: 100%;
      position: relative;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .upwork-modal-card.wide-card {
      max-width: 620px;
    }
    .modal-close-x {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 16px;
      cursor: pointer;
    }
    .modal-close-x:hover {
      color: #fff;
    }
    .modal-title {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.4rem;
    }
    .modal-sub {
      font-size: 13px;
      color: #94a3b8;
      margin: 0 0 1.5rem;
    }
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .modal-label {
      font-size: 13px;
      font-weight: 600;
      color: #e2e8f0;
    }
    .modal-input {
      background: #0f141c;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px;
      padding: 0.65rem 1rem;
      color: #ffffff;
      font-size: 14px;
      font-family: inherit;
      outline: none;
    }
    .modal-input:focus {
      border-color: #108a00;
    }
    .input-with-suffix {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-with-suffix .modal-input {
      width: 100%;
      padding-right: 90px;
    }
    .input-suffix {
      position: absolute;
      right: 12px;
      font-size: 13px;
      color: #94a3b8;
    }
    .modal-textarea {
      background: #0f141c;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      color: #ffffff;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      resize: vertical;
    }
    .modal-textarea:focus {
      border-color: #108a00;
    }
    .char-count {
      font-size: 11px;
      color: #64748b;
      text-align: right;
    }
    .modal-actions-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .radio-options-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .radio-option-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 0.8rem 1rem;
      cursor: pointer;
    }
    .radio-option-item.selected {
      border-color: #108a00;
      background: rgba(16,138,0,0.06);
    }
    .radio-option-item strong {
      display: block;
      color: #ffffff;
      font-size: 14px;
    }
    .radio-option-item span {
      display: block;
      color: #94a3b8;
      font-size: 12px;
    }

    .languages-list-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .lang-edit-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .lang-name-input {
      flex: 1;
    }
    .modal-select {
      background: #0f141c;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px;
      padding: 0.65rem 0.75rem;
      color: #ffffff;
      font-size: 13px;
      font-family: inherit;
    }
    .lang-del-btn {
      background: transparent;
      border: none;
      color: #ef4444;
      cursor: pointer;
      font-size: 16px;
    }
    .add-lang-text-btn {
      background: transparent;
      border: none;
      color: #108a00;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-align: left;
      padding: 0;
    }

    .modal-file-dropzone {
      border: 2px dashed rgba(255,255,255,0.15);
      border-radius: 10px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      color: #94a3b8;
    }
    .modal-file-dropzone:hover {
      border-color: #108a00;
      color: #ffffff;
    }

    /* TOAST */
    .upwork-toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #141a24;
      border: 1px solid #108a00;
      border-radius: 9999px;
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      z-index: 10000;
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }

    /* RESPONSIVE */
    @media (max-width: 1000px) {
      .upwork-layout-columns {
        grid-template-columns: 1fr;
      }
      .upwork-sidebar {
        border-right: none;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        padding-right: 0;
        padding-bottom: 2rem;
      }
    }
    @media (max-width: 768px) {
      .uw-app-shell {
        grid-template-columns: 1fr;
      }
      .uw-left-nav {
        display: none;
      }
      .uw-profile-workspace {
        padding: 1rem;
      }
      .profile-header-wrap {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class CreatorProfileEditComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private router = inject(Router);

  // Time ticker
  private timeInterval: any;
  formattedLocalTime = signal<string>('16:30 heure locale');

  // Dismissible notice
  noticeVisible = true;

  // Profile data signals
  displayName = computed(() => {
    const user = this.auth.currentUser();
    return user?.fullName || (user?.email ? user.email.split('@')[0] : 'Chayma G.');
  });

  currentUserId = computed(() => {
    return this.auth.currentUser()?.id || 'me';
  });

  isVerified = computed(() => {
    return !!this.auth.currentUser()?.isVerified;
  });

  avatarUrl = signal<string>('');
  location = signal<string>('Fernana, Tunisia');
  title = signal<string>('software engineering');
  hourlyRate = signal<number>(10);
  bio = signal<string>(
    "Hello, I'm a passionate computer engineering student hailing from Tunisia, with a keen interest in freelance opportunities. At 25 years old, I bring a blend of youthfulness and dedication to every project I undertake. Being proficient in three languages—Arabic, English, and French—allows me to communicate effectively with clients from diverse backgrounds, ensuring clarity and smooth collaboration. My academic background in computer engineering equips me with the technical skills necessary to tackle a wide array of projects, ranging from smartphone video production to web design. With ample time dedicated to freelance work, I'm committed to delivering top quality results."
  );

  bioExpanded = false;

  // Sidebar Settings
  isOpenForWork = false;
  isBoosted = false;
  hoursPerWeek = 'More than 30 hrs/week';

  smartphoneModel = 'iPhone 16 Pro Max • 4K ProRes Log';
  gimbalModel = 'DJI Osmo Mobile 6';
  audioModel = 'Rode Wireless Pro 32-bit float';

  // Portfolio items & tabs
  activePortfolioTab: 'published' | 'drafts' = 'published';
  defaultPortfolioItems: PortfolioItem[] = [
    {
      id: 'p-1',
      creatorId: 'cr-1',
      title: 'Reel UGC Soin du Visage Bio',
      mediaType: 'VIDEO',
      mediaUrl: '/videos/intro-sample.mp4',
      thumbnailUrl: '',
      equipmentUsed: 'iPhone 16 Pro Max 4K 60fps',
      createdAt: '2026-08-15'
    },
    {
      id: 'p-2',
      creatorId: 'cr-1',
      title: 'Textures Crème & Macro Cosmétique',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      equipmentUsed: 'iPhone 16 Pro Telephoto Macro',
      createdAt: '2026-08-20'
    }
  ];
  portfolioItems = signal<PortfolioItem[]>([]);

  publishedItems = computed(() => this.portfolioItems());
  draftItems = computed(() => []);

  selectedMedia = signal<PortfolioItem | null>(null);

  // Languages
  userLanguages = signal<{ name: string; level: string }[]>([
    { name: 'English', level: 'Fluent' },
    { name: 'Arabic', level: 'Native or Bilingual' },
    { name: 'French', level: 'Conversational' }
  ]);

  // Skills
  skillsList = [
    'Video Game Localization',
    'Arabic',
    'CapCut Pro',
    'iPhone 16 Pro',
    'Format 9:16',
    'Étalonnage ProRes',
    'UGC Création'
  ];

  // Modals state
  locationModalOpen = false;
  tempLocation = '';
  popularCities: string[] = [
    'Tunis, Tunisia',
    'Sousse, Tunisia',
    'Sfax, Tunisia',
    'Fernana, Tunisia',
    'Jendouba, Tunisia',
    'Ariana, Tunisia',
    'La Marsa, Tunisia',
    'Nabeul, Tunisia',
    'Bizerte, Tunisia',
    'Monastir, Tunisia'
  ];

  titleRateModalOpen = false;
  tempTitle = '';
  tempHourlyRate = 10;

  bioModalOpen = false;
  tempBio = '';



  hoursModalOpen = false;
  tempHoursPerWeek = 'More than 30 hrs/week';

  gearModalOpen = false;
  tempSmartphone = '';
  tempGimbal = '';
  tempAudio = '';

  languagesModalOpen = false;
  tempLanguages: { name: string; level: string }[] = [];

  addPortfolioModalOpen = false;
  newPortTitle = '';
  newPortMediaUrl = '';
  newPortEquipment = '';

  toastMessage = '';
  private toastTimeout: any;

  ngOnInit(): void {
    this.updateClock();
    this.timeInterval = setInterval(() => this.updateClock(), 60000);
    this.loadProfileData();
  }

  ngOnDestroy(): void {
    if (this.timeInterval) clearInterval(this.timeInterval);
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }

  private updateClock(): void {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    this.formattedLocalTime.set(`${hours}:${mins} heure locale`);
  }

  private loadProfileData(): void {
    const user = this.auth.currentUser();
    if (!user) return;

    if (user.avatarUrl && !user.avatarUrl.includes('photo-1534528741775')) {
      this.avatarUrl.set(user.avatarUrl);
    }

    if (user.title) this.title.set(user.title);
    if (user.bio) this.bio.set(user.bio);
    if (user.location) this.location.set(user.location);
    if (user.hourlyRate) this.hourlyRate.set(user.hourlyRate);
    if (user.smartphoneModel) this.smartphoneModel = user.smartphoneModel;

    try {
      const savedExtra = localStorage.getItem(`snapconnect_creator_profile_extra_${user.id}`);
      if (savedExtra) {
        const extra = JSON.parse(savedExtra);
        if (extra.introVideoUrl || extra.introVideoCaption) {
          delete extra.introVideoUrl;
          delete extra.introVideoCaption;
          try {
            localStorage.setItem(`snapconnect_creator_profile_extra_${user.id}`, JSON.stringify(extra));
          } catch {}
        }
        if (extra.location) this.location.set(extra.location);

        if (extra.title) this.title.set(extra.title);
        if (extra.hourlyRate) this.hourlyRate.set(extra.hourlyRate);
        if (extra.bio) this.bio.set(extra.bio);
        if (extra.smartphoneModel) this.smartphoneModel = extra.smartphoneModel;
        if (extra.gimbalModel) this.gimbalModel = extra.gimbalModel;
        if (extra.audioModel) this.audioModel = extra.audioModel;
        if (extra.hoursPerWeek) this.hoursPerWeek = extra.hoursPerWeek;
        if (extra.languages) this.userLanguages.set(extra.languages);
        if (extra.skills) this.skillsList = extra.skills;
        if (extra.isOpenForWork !== undefined) this.isOpenForWork = extra.isOpenForWork;
        if (extra.isBoosted !== undefined) this.isBoosted = extra.isBoosted;
      }
    } catch {}

    // Load portfolio
    try {
      const portRaw = localStorage.getItem(`snapconnect_creator_portfolio_${user.id}`);
      if (portRaw) {
        this.portfolioItems.set(JSON.parse(portRaw));
      } else {
        this.portfolioItems.set(this.defaultPortfolioItems);
      }
    } catch {
      this.portfolioItems.set(this.defaultPortfolioItems);
    }
  }

  private persistExtra(): void {
    const user = this.auth.currentUser();
    if (!user) return;
    const payload = {

      location: this.location(),
      title: this.title(),
      hourlyRate: this.hourlyRate(),
      bio: this.bio(),
      smartphoneModel: this.smartphoneModel,
      gimbalModel: this.gimbalModel,
      audioModel: this.audioModel,
      hoursPerWeek: this.hoursPerWeek,
      languages: this.userLanguages(),
      skills: this.skillsList,
      isOpenForWork: this.isOpenForWork,
      isBoosted: this.isBoosted
    };
    try {
      localStorage.setItem(`snapconnect_creator_profile_extra_${user.id}`, JSON.stringify(payload));
    } catch {}
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = '';
    }, 3500);
  }

  onAvatarError(event: any): void {
    this.avatarUrl.set('');
  }

  onAvatarFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const url = e.target.result as string;
        this.avatarUrl.set(url);
        const user = this.auth.currentUser();
        if (user) {
          const updated = { ...user, avatarUrl: url };
          this.auth.currentUser.set(updated);
          try {
            localStorage.setItem('snapconnect_user', JSON.stringify(updated));
          } catch {}
        }
        this.auth.updateProfile({ avatarUrl: url }).subscribe();
        this.showToast('Photo de profil mise à jour avec succès !');
      };
      reader.readAsDataURL(file);
    }
  }

  openLocationModal(): void {
    this.tempLocation = this.location();
    this.locationModalOpen = true;
  }

  selectCity(city: string): void {
    this.tempLocation = city;
  }

  saveLocation(): void {
    const trimmed = this.tempLocation.trim();
    if (!trimmed) return;
    this.location.set(trimmed);
    this.locationModalOpen = false;

    const user = this.auth.currentUser();
    if (user) {
      const updated = { ...user, location: trimmed };
      this.auth.currentUser.set(updated);
      try {
        localStorage.setItem('snapconnect_user', JSON.stringify(updated));
      } catch {}
    }

    this.persistExtra();
    this.auth.updateProfile({ location: trimmed }).subscribe({
      next: () => {
        this.showToast('Localisation mise à jour avec succès !');
      },
      error: () => {
        this.showToast('Localisation enregistrée en local');
      }
    });
  }

  openTitleRateModal(): void {
    this.tempTitle = this.title();
    this.tempHourlyRate = this.hourlyRate();
    this.titleRateModalOpen = true;
  }

  saveTitleRate(): void {
    if (!this.tempTitle.trim()) return;
    this.title.set(this.tempTitle.trim());
    this.hourlyRate.set(this.tempHourlyRate);
    this.titleRateModalOpen = false;
    this.persistExtra();
    this.auth.updateProfile({ title: this.title(), hourlyRate: this.hourlyRate() }).subscribe();
    this.showToast('Titre et tarif horaire enregistrés !');
  }

  openBioModal(): void {
    this.tempBio = this.bio();
    this.bioModalOpen = true;
  }

  saveBio(): void {
    if (!this.tempBio.trim()) return;
    this.bio.set(this.tempBio.trim());
    this.bioModalOpen = false;
    this.persistExtra();
    this.auth.updateProfile({ bio: this.bio() }).subscribe();
    this.showToast('Présentation mise à jour avec succès !');
  }

  openAvailabilityModal(): void {
    this.isOpenForWork = !this.isOpenForWork;
    this.persistExtra();
    this.showToast(this.isOpenForWork ? 'Statut : Open for work (Disponible)' : 'Statut : Off');
  }

  toggleProfileBoost(): void {
    this.isBoosted = !this.isBoosted;
    this.persistExtra();
    this.showToast(this.isBoosted ? 'Boost profil activé (+3x visibilité) !' : 'Boost désactivé.');
  }



  openHoursModal(): void {
    this.tempHoursPerWeek = this.hoursPerWeek;
    this.hoursModalOpen = true;
  }

  saveHours(): void {
    this.hoursPerWeek = this.tempHoursPerWeek;
    this.hoursModalOpen = false;
    this.persistExtra();
    this.showToast('Disponibilité hebdomadaire mise à jour !');
  }

  openGearModal(): void {
    this.tempSmartphone = this.smartphoneModel;
    this.tempGimbal = this.gimbalModel;
    this.tempAudio = this.audioModel;
    this.gearModalOpen = true;
  }

  saveGear(): void {
    this.smartphoneModel = this.tempSmartphone.trim() || 'iPhone 16 Pro Max • 4K ProRes Log';
    this.gimbalModel = this.tempGimbal.trim() || 'DJI Osmo Mobile 6';
    this.audioModel = this.tempAudio.trim() || 'Rode Wireless Pro 32-bit float';
    this.gearModalOpen = false;
    this.persistExtra();
    this.auth.updateProfile({ smartphoneModel: this.smartphoneModel }).subscribe();
    this.showToast('Matériel certifié 4K enregistré !');
  }

  openLanguagesModal(): void {
    this.tempLanguages = this.userLanguages().map(l => ({ ...l }));
    this.languagesModalOpen = true;
  }

  addLanguage(): void {
    this.tempLanguages.push({ name: '', level: 'Conversational' });
  }

  removeLanguage(index: number): void {
    this.tempLanguages.splice(index, 1);
  }

  saveLanguages(): void {
    const valid = this.tempLanguages.filter(l => l.name.trim().length > 0);
    if (valid.length > 0) {
      this.userLanguages.set(valid);
      this.persistExtra();
    }
    this.languagesModalOpen = false;
    this.showToast('Langues enregistrées !');
  }

  openAddPortfolioModal(): void {
    this.newPortTitle = '';
    this.newPortMediaUrl = '';
    this.newPortEquipment = this.smartphoneModel;
    this.addPortfolioModalOpen = true;
  }

  closePortfolioModal(): void {
    this.addPortfolioModalOpen = false;
  }

  onPortFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newPortMediaUrl = e.target.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  savePortfolioItem(): void {
    if (!this.newPortTitle.trim()) return;
    const newItem: PortfolioItem = {
      id: 'port-' + Date.now(),
      creatorId: this.currentUserId(),
      title: this.newPortTitle.trim(),
      mediaType: this.newPortMediaUrl.startsWith('data:video') ? 'VIDEO' : 'IMAGE',
      mediaUrl: this.newPortMediaUrl || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      equipmentUsed: this.newPortEquipment.trim() || 'iPhone 16 Pro Max 4K',
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newItem, ...this.portfolioItems()];
    this.portfolioItems.set(updated);
    try {
      const user = this.auth.currentUser();
      if (user) {
        localStorage.setItem(`snapconnect_creator_portfolio_${user.id}`, JSON.stringify(updated));
      }
    } catch {}
    this.closePortfolioModal();
    this.showToast('Projet ajouté avec succès au portfolio !');
  }

  openAddSkillModal(): void {
    const newSkill = prompt('Ajouter une compétence smartphone (ex: 4K 60fps, CapCut, UGC, Étalonnage):');
    if (newSkill && newSkill.trim()) {
      if (!this.skillsList.includes(newSkill.trim())) {
        this.skillsList.push(newSkill.trim());
        this.persistExtra();
        this.showToast('Compétence ajoutée avec succès !');
      }
    }
  }

  removeSkill(skill: string): void {
    this.skillsList = this.skillsList.filter(s => s !== skill);
    this.persistExtra();
    this.showToast('Compétence retirée.');
  }

  copyProfileShareLink(): void {
    const url = window.location.origin + '/creators/' + this.currentUserId();
    navigator.clipboard?.writeText(url).then(() => {
      this.showToast('Lien du profil copié dans le presse-papier !');
    }).catch(() => {
      this.showToast('Lien du profil : ' + url);
    });
  }

  triggerVerifyToast(): void {
    this.showToast('Vérification d\'identité en cours d\'examen par SnapConnect.');
  }

  triggerHelpToast(): void {
    this.showToast('Centre d\'aide créateur SnapConnect disponible 24/7.');
  }
}
