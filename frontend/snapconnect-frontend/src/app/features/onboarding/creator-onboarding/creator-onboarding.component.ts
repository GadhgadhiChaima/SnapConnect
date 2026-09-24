import {
  Component, signal, computed, inject, OnInit, OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { TunisiaLocationService, TunisianCity } from '../../../core/services/tunisia-location.service';

interface LanguageItem {
  id: string;
  name: string;
  level: string;
  selected: boolean;
}

@Component({
  selector: 'app-creator-onboarding',
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="onboarding-page">
      <div class="onboarding-glow"></div>

      <div class="onboarding-container animate-scale-in">

        <!-- ═══ EN-TÊTE UPWORK : TITRE & PROGRESSION ═══ -->
        <div class="onboarding-header text-center">
          <div class="uw-stepper-badge">
            <span class="step-pill">Étape {{ currentStep() }} sur {{ totalSteps }}</span>
            <span class="step-title-crumb">{{ getStepTitle(currentStep()) }}</span>
          </div>

          <h1 class="wizard-main-title">{{ getStepHeadline(currentStep()) }}</h1>
          <p class="wizard-subtitle">{{ getStepSubtext(currentStep()) }}</p>

          <!-- Stepper Dots & Jauge de complétion Upwork -->
          <div class="upwork-progress-card">
            <div class="stepper-track-row">
              @for (step of steps; track step.num) {
                <div
                  class="stepper-step-item"
                  [class.active]="currentStep() === step.num"
                  [class.completed]="currentStep() > step.num"
                  (click)="goToStep(step.num)"
                >
                  <div class="step-indicator">
                    @if (currentStep() > step.num) {
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    } @else {
                      <span>{{ step.num }}</span>
                    }
                  </div>
                  <span class="step-label">{{ step.label }}</span>
                </div>
              }
            </div>

            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" [style.width.%]="completionPercentage()"></div>
            </div>
            <div class="progress-meta-row">
              <span class="progress-status-text">
                {{ completionPercentage() === 100 ? 'Profil 100% complété ! Prêt pour décrocher des missions.' : 'Complétez chaque étape pour maximiser votre visibilité auprès des marques.' }}
              </span>
              <span class="progress-pct-value font-mono">{{ completionPercentage() }}%</span>
            </div>
          </div>
        </div>

        <!-- ═══ MESSAGES ALERTES ═══ -->
        @if (errorMessage()) {
          <div class="alert alert-error animate-fade-in">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ errorMessage() }}</span>
          </div>
        }
        @if (successMessage()) {
          <div class="alert alert-success animate-fade-in">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{{ successMessage() }}</span>
          </div>
        }

        <!-- ═══ FORMULAIRE WIZARD PRINCIPAL ═══ -->
        <div class="wizard-card card-glass">

          <!-- ────────────────────────────────────────────────────────── -->
          <!-- ÉTAPE 1 : TITRE PROFESSIONNEL & NIVEAU D'EXPÉRIENCE        -->
          <!-- ────────────────────────────────────────────────────────── -->
          @if (currentStep() === 1) {
            <div class="step-content animate-fade-in">
              <div class="section-intro">
                <h3>Quel est votre rôle principal en tant que créateur ?</h3>
                <p>Votre titre apparaîtra tout en haut de votre fiche créateur sur la marketplace SnapConnect.</p>
              </div>

              <!-- Champ Titre -->
              <div class="form-group mb-5">
                <label class="form-label" for="title">Titre professionnel <span class="required">*</span></label>
                <div class="input-icon-wrap">
                  <span class="input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="title"
                    [(ngModel)]="title"
                    name="title"
                    class="form-input has-icon"
                    placeholder="ex. Vidéaste Mobile 4K & Créateur UGC Spécialiste TikTok"
                    maxlength="100"
                    autofocus
                  />
                </div>

                <!-- Suggestions rapides -->
                <div class="chips-row mt-3">
                  <span class="chips-label">Suggestions populaires :</span>
                  @for (t of suggestedTitles; track t) {
                    <button
                      type="button"
                      class="chip-btn"
                      [class.active]="title === t"
                      (click)="title = t"
                    >
                      {{ t }}
                    </button>
                  }
                </div>
              </div>

              <!-- Cartes Niveau d'Expérience Upwork -->
              <div class="form-group mt-6">
                <label class="form-label mb-2">Votre niveau d'expérience en création mobile</label>
                <div class="experience-grid">
                  @for (lvl of experienceLevels; track lvl.id) {
                    <div
                      class="experience-card"
                      [class.selected]="experienceLevel === lvl.id"
                      (click)="experienceLevel = lvl.id"
                    >
                      <div class="exp-card-header">
                        <span class="exp-icon-wrap">
                          @if (lvl.id === 'ENTRY') {
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 14 14"></polyline>
                            </svg>
                          } @else if (lvl.id === 'INTERMEDIATE') {
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                            </svg>
                          } @else {
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                          }
                        </span>
                        <div class="radio-check-circle" [class.checked]="experienceLevel === lvl.id">
                          <div class="radio-inner-dot"></div>
                        </div>
                      </div>
                      <h4 class="exp-card-title">{{ lvl.title }}</h4>
                      <p class="exp-card-desc">{{ lvl.desc }}</p>
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          <!-- ────────────────────────────────────────────────────────── -->
          <!-- ÉTAPE 2 : COMPÉTENCES CLÉS SMARTPHONE (SKILLS)             -->
          <!-- ────────────────────────────────────────────────────────── -->
          @if (currentStep() === 2) {
            <div class="step-content animate-fade-in">
              <div class="section-intro">
                <h3>Quelles sont vos compétences clés en tournage et montage ?</h3>
                <p>Sélectionnez les compétences maîtrisées pour matcher précisément avec les briefs des marques (3 à 8 recommandées).</p>
              </div>

              <!-- Compteur de compétences sélectionnées -->
              <div class="skills-counter-badge">
                <span class="counter-num">{{ selectedSkills.length }}</span> compétences sélectionnées
              </div>

              <!-- Tags actuellement sélectionnés -->
              @if (selectedSkills.length > 0) {
                <div class="selected-skills-box">
                  <div class="skills-tags-cloud">
                    @for (s of selectedSkills; track s) {
                      <span class="skill-tag active-tag animate-scale-in">
                        {{ s }}
                        <button type="button" class="remove-skill-btn" (click)="toggleSkill(s)">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </span>
                    }
                  </div>
                </div>
              } @else {
                <div class="skills-empty-hint">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px; opacity: 0.7;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span>Sélectionnez vos compétences ci-dessous pour les ajouter à votre profil.</span>
                </div>
              }

              <!-- Nuage de suggestions Upwork avec (+) -->
              <div class="skills-pool-section mt-5">
                <label class="form-label mb-2">Compétences recommandées pour créateurs mobiles :</label>
                <div class="skills-tags-cloud">
                  @for (skill of availableSkills; track skill) {
                    @if (!isSkillSelected(skill)) {
                      <button
                        type="button"
                        class="skill-tag pool-tag"
                        (click)="toggleSkill(skill)"
                      >
                        <span class="tag-plus">+</span>
                        {{ skill }}
                      </button>
                    }
                  }
                </div>
              </div>

              <!-- Ajout tag personnalisé -->
              <div class="custom-skill-input-row mt-5">
                <input
                  type="text"
                  [(ngModel)]="customSkillInput"
                  name="customSkill"
                  class="form-input custom-input"
                  placeholder="Ajouter une compétence personnalisée (ex: Stop Motion, Éclairage Studio...)"
                  (keydown.enter)="$event.preventDefault(); addCustomSkill()"
                />
                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  (click)="addCustomSkill()"
                  [disabled]="!customSkillInput.trim()"
                >
                  + Ajouter
                </button>
              </div>
            </div>
          }

          <!-- ────────────────────────────────────────────────────────── -->
          <!-- ÉTAPE 3 : PRÉSENTATION / BIO & LANGUES MAÎTRISÉES         -->
          <!-- ────────────────────────────────────────────────────────── -->
          @if (currentStep() === 3) {
            <div class="step-content animate-fade-in">
              <div class="section-intro">
                <h3>Présentez-vous aux entreprises et marques clientes</h3>
                <p>Mettez en avant votre univers visuel, votre rigueur de cadrage et ce qui rend vos vidéos captivantes.</p>
              </div>

              <!-- Textarea Bio -->
              <div class="form-group mb-5">
                <div class="label-with-counter">
                  <label class="form-label" for="bio">Présentation & Démarche artistique <span class="required">*</span></label>
                  <span class="char-counter" [class.limit]="bio.length > 450">{{ bio.length }} / 500</span>
                </div>
                <textarea
                  id="bio"
                  [(ngModel)]="bio"
                  name="bio"
                  rows="4"
                  class="form-textarea"
                  placeholder="Décrivez votre style, vos formats préférés (UGC, Reels, Lookbook), vos délais et votre maîtrise du tournage mobile..."
                  maxlength="500"
                ></textarea>

                <!-- Modèles prêts à l'emploi -->
                <div class="bio-templates-row mt-2">
                  <span class="template-label">Modèles d'inspiration :</span>
                  <button type="button" class="template-btn" (click)="fillBioTemplate(1)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                    Modèle Vidéaste UGC
                  </button>
                  <button type="button" class="template-btn" (click)="fillBioTemplate(2)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                    Modèle Photographe Lifestyle
                  </button>
                </div>
              </div>

              <!-- Langues parlées Upwork -->
              <div class="form-group mt-6">
                <label class="form-label mb-2">Langues parlées & Niveaux de communication</label>
                <div class="languages-list">
                  @for (lang of languages; track lang.id) {
                    <div
                      class="language-row"
                      [class.checked]="lang.selected"
                      (click)="lang.selected = !lang.selected"
                    >
                      <div class="lang-left">
                        <div class="custom-checkbox" [class.checked]="lang.selected">
                          @if (lang.selected) {
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          }
                        </div>
                        <span class="lang-name">{{ lang.name }}</span>
                      </div>
                      <span class="lang-level-badge">{{ lang.level }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          <!-- ────────────────────────────────────────────────────────── -->
          <!-- ÉTAPE 4 : VILLE EN TUNISIE & MATÉRIEL CERTIFIÉ             -->
          <!-- ────────────────────────────────────────────────────────── -->
          @if (currentStep() === 4) {
            <div class="step-content animate-fade-in">
              <div class="section-intro">
                <h3>Où êtes-vous basé(e) et avec quel matériel tournez-vous ?</h3>
                <p>SnapConnect est spécialisé dans les tournages smartphone 4K en Tunisie.</p>
              </div>

              <!-- Autocomplétion Tunisie -->
              <div class="form-group mb-6">
                <label class="form-label" for="city">Ville & Région de tournage en Tunisie <span class="required">*</span></label>
                <div class="input-icon-wrap" style="position: relative;">
                  <span class="input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="city"
                    [(ngModel)]="city"
                    name="city"
                    class="form-input has-icon"
                    placeholder="Tapez une ville tunisienne (ex. Tunis, La Marsa, Sousse, Sfax...)"
                    (input)="onCityInput($event)"
                    (blur)="onCityBlur()"
                    autocomplete="off"
                  />
                  @if (isCityLoading()) {
                    <span class="city-spinner">
                      <svg class="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                        <path d="M12 2a10 10 0 0 1 10 10"/>
                      </svg>
                    </span>
                  }
                  @if (citySuggestions().length > 0) {
                    <ul class="city-dropdown">
                      @for (s of citySuggestions(); track s.display) {
                        <li class="city-dropdown-item" (mousedown)="selectCity(s)">
                          <div class="city-item-left">
                            <span class="city-item-pin">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                              </svg>
                            </span>
                            <div class="city-item-text">
                              <span class="city-name">{{ s.city }}</span>
                              <span class="city-gov">Gouvernorat de {{ s.governorate }}</span>
                            </div>
                          </div>
                          <span class="city-badge">{{ s.governorate }}</span>
                        </li>
                      }
                    </ul>
                  }
                </div>

                <!-- Suggestions rapides de villes tunisiennes -->
                <div class="chips-row mt-3">
                  <span class="chips-label">Villes fréquentes :</span>
                  @for (c of suggestedCities; track c) {
                    <button
                      type="button"
                      class="chip-btn"
                      [class.active]="city === c"
                      (click)="city = c; citySuggestions.set([])"
                    >
                      {{ c }}
                    </button>
                  }
                </div>
              </div>

              <!-- Smartphone principal utilisé (Choix Libre) -->
              <div class="form-group mt-6">
                <label class="form-label" for="phone">Smartphone principal de tournage <span class="required">*</span></label>
                <div class="input-icon-wrap">
                  <span class="input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                      <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="phone"
                    [(ngModel)]="selectedPhone"
                    name="phone"
                    class="form-input has-icon"
                    placeholder="Tapez le modèle exact de votre smartphone (ex: iPhone 15 Pro, Samsung S23 Ultra, Xiaomi 14...)"
                  />
                </div>

                <!-- Suggestions rapides de smartphones populaires -->
                <div class="chips-row mt-3">
                  <span class="chips-label">Suggestions rapides :</span>
                  @for (p of popularPhones; track p) {
                    <button
                      type="button"
                      class="chip-btn"
                      [class.active]="selectedPhone === p"
                      (click)="selectedPhone = p"
                    >
                      {{ p }}
                    </button>
                  }
                </div>
              </div>

              <!-- Équipements & Accessoires optionnels -->
              <div class="gear-extras-row mt-4">
                <span class="gear-label">Accessoires disponibles :</span>
                <button
                  type="button"
                  class="chip-btn"
                  [class.active]="hasGimbal"
                  (click)="hasGimbal = !hasGimbal"
                >
                  @if (hasGimbal) {
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 4px;">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  } @else {
                    <span style="margin-right: 4px; font-weight: bold;">+</span>
                  }
                  Stabilisateur Gimbal (DJI Osmo)
                </button>
                <button
                  type="button"
                  class="chip-btn"
                  [class.active]="hasWirelessMic"
                  (click)="hasWirelessMic = !hasWirelessMic"
                >
                  @if (hasWirelessMic) {
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 4px;">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  } @else {
                    <span style="margin-right: 4px; font-weight: bold;">+</span>
                  }
                  Micro HF sans fil (Rode / DJI)
                </button>
                <button
                  type="button"
                  class="chip-btn"
                  [class.active]="hasLedLight"
                  (click)="hasLedLight = !hasLedLight"
                >
                  @if (hasLedLight) {
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 4px;">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  } @else {
                    <span style="margin-right: 4px; font-weight: bold;">+</span>
                  }
                  Éclairage LED bicolore
                </button>
              </div>
            </div>
          }

          <!-- ────────────────────────────────────────────────────────── -->
          <!-- ÉTAPE 5 : PHOTO, TARIFS EN DT & LIENS RÉSEAUX              -->
          <!-- ────────────────────────────────────────────────────────── -->
          @if (currentStep() === 5) {
            <div class="step-content animate-fade-in">
              <div class="section-intro">
                <h3>Finalisez avec votre photo et vos tarifs</h3>
                <p>Définissez vos prix indicatifs en Dinars Tunisiens (DT) et ajoutez une photo professionnelle.</p>
              </div>

              <!-- Photo de profil -->
              <div class="avatar-upload-box mb-6">
                <div class="avatar-preview-wrap">
                  @if (avatarUrl) {
                    <img
                      [src]="avatarUrl"
                      alt="Photo créateur"
                      class="avatar-circle-img"
                    />
                  } @else {
                    <div class="avatar-circle-img empty-avatar-box">
                      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  }
                  <button type="button" class="avatar-camera-btn" (click)="fileInput.click()" title="Changer la photo">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                  </button>
                </div>

                <div class="avatar-controls">
                  <div class="avatar-btn-row">
                    <button type="button" class="btn btn-secondary btn-sm" (click)="fileInput.click()">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      Importer une photo
                    </button>
                    <input
                      #fileInput
                      type="file"
                      accept="image/*"
                      style="display: none"
                      (change)="onFileSelected($event)"
                    />
                  </div>
                  <p class="avatar-help-text">JPG, PNG ou WEBP. Une photo nette de votre visage renforce la confiance des clients.</p>
                </div>
              </div>

              <!-- Calculateur de Tarifs Upwork en DT -->
              <div class="rate-calculator-card mb-5">
                <h4 class="calc-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px; color: var(--color-primary-400);">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                  </svg>
                  Tarification de vos prestations (Dinars Tunisiens)
                </h4>
                
                <div class="rates-split-grid">
                  <div class="form-group">
                    <label class="form-label" for="hourly">Tarif horaire (DT / h)</label>
                    <div class="input-with-suffix">
                      <input
                        type="number"
                        id="hourly"
                        [(ngModel)]="hourlyRate"
                        name="hourlyRate"
                        class="form-input"
                        min="15"
                        max="500"
                      />
                      <span class="input-suffix">DT / h</span>
                    </div>
                    <span class="rate-hint">Net créateur après frais : {{ (hourlyRate * 0.9).toFixed(0) }} DT / h</span>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="daily">Tarif journalier (DT / jour)</label>
                    <div class="input-with-suffix">
                      <input
                        type="number"
                        id="daily"
                        [(ngModel)]="dailyRate"
                        name="dailyRate"
                        class="form-input"
                        min="50"
                        max="2500"
                      />
                      <span class="input-suffix">DT / jour</span>
                    </div>
                    <span class="rate-hint">Net créateur : {{ (dailyRate * 0.9).toFixed(0) }} DT / jour</span>
                  </div>
                </div>
              </div>

              <!-- Réseaux Sociaux Optionnels -->
              <div class="social-links-box">
                <label class="form-label mb-2">Comptes Réseaux Sociaux (Optionnel)</label>
                <div class="social-inputs-grid">
                  <div class="input-icon-wrap">
                    <span class="input-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </span>
                    <input
                      type="text"
                      [(ngModel)]="instagramHandle"
                      name="instagram"
                      class="form-input has-icon"
                      placeholder="Instagram @moncompte"
                    />
                  </div>
                  <div class="input-icon-wrap">
                    <span class="input-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                      </svg>
                    </span>
                    <input
                      type="text"
                      [(ngModel)]="tiktokHandle"
                      name="tiktok"
                      class="form-input has-icon"
                      placeholder="TikTok @moncompte"
                    />
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- ═══ FOOTER DE NAVIGATION WIZARD ═══ -->
          <div class="wizard-actions-footer">
            <div class="footer-left-actions">
              @if (currentStep() > 1) {
                <button
                  type="button"
                  class="btn btn-secondary btn-nav"
                  (click)="prevStep()"
                  [disabled]="isSaving()"
                >
                  ← Précédent
                </button>
              }
              <button
                type="button"
                class="btn btn-ghost btn-skip"
                (click)="skipForNow()"
                [disabled]="isSaving()"
              >
                Passer pour le moment
              </button>
            </div>

            <div class="footer-right-actions">
              @if (currentStep() < totalSteps) {
                <button
                  type="button"
                  class="btn btn-primary btn-nav btn-next"
                  (click)="nextStep()"
                >
                  Suivant : {{ steps[currentStep()].label }} →
                </button>
              } @else {
                <button
                  type="button"
                  class="btn btn-primary btn-nav btn-finish"
                  (click)="saveAndFinish()"
                  [disabled]="isSaving()"
                >
                  @if (isSaving()) {
                    <span class="btn-spinner"></span>
                    Enregistrement...
                  } @else {
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 6px; vertical-align: middle;">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Finaliser & Accéder au Dashboard
                  }
                </button>
              }
            </div>
          </div>

        </div>

      </div>
    </div>

    <app-footer></app-footer>
  `,
  styles: [`
    .onboarding-page {
      min-height: calc(100vh - 80px);
      background: radial-gradient(circle at top center, rgba(139, 92, 246, 0.12) 0%, #0a0d1a 70%);
      position: relative;
      overflow: hidden;
      padding: var(--space-8) var(--space-4) var(--space-16);
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .onboarding-glow {
      position: absolute;
      top: -120px;
      left: 50%;
      transform: translateX(-50%);
      width: 700px;
      height: 400px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(236, 72, 153, 0.08) 50%, transparent 70%);
      filter: blur(80px);
      pointer-events: none;
    }

    .onboarding-container {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 780px;
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    /* ── Header & Stepper Upwork ── */
    .onboarding-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
    }

    .uw-stepper-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(139, 92, 246, 0.15);
      border: 1px solid rgba(139, 92, 246, 0.35);
      padding: 4px 14px;
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      color: #c4b5fd;
      font-weight: var(--font-weight-medium);
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.2);
    }

    .step-pill {
      background: var(--color-primary-500);
      color: #fff;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 700;
    }

    .wizard-main-title {
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      font-weight: 800;
      color: var(--color-text-primary);
      margin: 4px 0 0;
      letter-spacing: -0.02em;
    }

    .wizard-subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      max-width: 580px;
      margin: 0;
    }

    /* ── Progress Box ── */
    .upwork-progress-card {
      width: 100%;
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-4) var(--space-5);
      margin-top: var(--space-3);
      backdrop-filter: blur(12px);
    }

    .stepper-track-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
      gap: 8px;
    }

    .stepper-step-item {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      opacity: 0.55;
      transition: all var(--transition-fast);
    }

    .stepper-step-item.active {
      opacity: 1;
    }

    .stepper-step-item.completed {
      opacity: 0.85;
    }

    .stepper-step-item:hover {
      opacity: 1;
    }

    .step-indicator {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid var(--color-border);
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      transition: all var(--transition-fast);
    }

    .stepper-step-item.active .step-indicator {
      background: var(--color-primary-500);
      border-color: var(--color-primary-400);
      color: #fff;
      box-shadow: 0 0 12px var(--color-primary-glow);
    }

    .stepper-step-item.completed .step-indicator {
      background: #10b981;
      border-color: #34d399;
      color: #fff;
    }

    .step-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    .stepper-step-item.active .step-label {
      color: var(--color-text-primary);
    }

    .progress-bar-wrap {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #8b5cf6, #ec4899);
      border-radius: var(--radius-full);
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 12px rgba(236, 72, 153, 0.5);
    }

    .progress-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
    }

    .progress-status-text {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .progress-pct-value {
      font-size: 12px;
      font-weight: 700;
      color: #ec4899;
    }

    /* ── Wizard Card ── */
    .wizard-card {
      padding: var(--space-8);
      border-radius: var(--radius-xl);
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(139, 92, 246, 0.25);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(16px);
    }

    .section-intro {
      margin-bottom: var(--space-6);
      padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--color-border-subtle);
    }

    .section-intro h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 6px;
    }

    .section-intro p {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      margin: 0;
    }

    /* ── Étape 1 : Cartes Expérience Upwork ── */
    .experience-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-3);
    }

    .experience-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .experience-card:hover {
      border-color: rgba(139, 92, 246, 0.5);
      background: rgba(139, 92, 246, 0.06);
      transform: translateY(-2px);
    }

    .experience-card.selected {
      border-color: var(--color-primary-400);
      background: rgba(139, 92, 246, 0.12);
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
    }

    .exp-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-2);
    }

    .exp-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: rgba(139, 92, 246, 0.12);
      border: 1px solid rgba(139, 92, 246, 0.25);
      color: #c4b5fd;
      transition: all var(--transition-fast);
    }
    .experience-card:hover .exp-icon-wrap {
      background: rgba(139, 92, 246, 0.22);
      border-color: rgba(139, 92, 246, 0.45);
      color: #fff;
    }
    .experience-card.selected .exp-icon-wrap {
      background: var(--color-primary-500);
      border-color: var(--color-primary-400);
      color: #fff;
      box-shadow: 0 0 12px var(--color-primary-glow);
    }

    .radio-check-circle {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid var(--color-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }

    .radio-check-circle.checked {
      border-color: var(--color-primary-400);
      background: var(--color-primary-500);
    }

    .radio-inner-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #fff;
    }

    .exp-card-title {
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 6px;
    }

    .exp-card-desc {
      font-size: 11px;
      color: var(--color-text-muted);
      line-height: 1.4;
      margin: 0;
    }

    /* ── Étape 2 : Skills & Tags Cloud ── */
    .skills-counter-badge {
      display: inline-block;
      font-size: 12px;
      color: var(--color-text-secondary);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--color-border);
      padding: 4px 12px;
      border-radius: var(--radius-full);
      margin-bottom: var(--space-3);
    }

    .skills-counter-badge .counter-num {
      font-weight: 700;
      color: #c4b5fd;
    }

    .selected-skills-box {
      background: rgba(139, 92, 246, 0.06);
      border: 1px dashed rgba(139, 92, 246, 0.35);
      border-radius: var(--radius-lg);
      padding: var(--space-3) var(--space-4);
      min-height: 52px;
    }

    .skills-empty-hint {
      background: rgba(255, 255, 255, 0.02);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-3) var(--space-4);
      font-size: 12px;
      color: var(--color-text-muted);
      text-align: center;
    }

    .skills-tags-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .skill-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      padding: 6px 12px;
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: all var(--transition-fast);
      font-weight: 500;
    }

    .skill-tag.active-tag {
      background: var(--color-primary-500);
      color: #fff;
      border: 1px solid var(--color-primary-400);
      box-shadow: 0 0 10px var(--color-primary-glow);
    }

    .remove-skill-btn {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      font-size: 11px;
      cursor: pointer;
      padding: 0 2px;
      line-height: 1;
    }
    .remove-skill-btn:hover { color: #fff; }

    .skill-tag.pool-tag {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
    }

    .skill-tag.pool-tag:hover {
      background: rgba(139, 92, 246, 0.15);
      border-color: var(--color-primary-400);
      color: #fff;
      transform: translateY(-1px);
    }

    .tag-plus {
      font-weight: 700;
      color: var(--color-primary-400);
    }

    .custom-skill-input-row {
      display: flex;
      gap: var(--space-2);
    }

    /* ── Étape 3 : Bio & Langues ── */
    .label-with-counter {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .char-counter { font-size: 11px; color: var(--color-text-muted); }
    .char-counter.limit { color: #f59e0b; }

    .bio-templates-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .template-label { font-size: 11px; color: var(--color-text-muted); }

    .template-btn {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      padding: 3px 10px;
      font-size: 11px;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .template-btn:hover {
      background: rgba(139, 92, 246, 0.15);
      border-color: var(--color-primary-400);
      color: #fff;
    }

    .languages-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .language-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .language-row:hover {
      background: rgba(139, 92, 246, 0.08);
      border-color: rgba(139, 92, 246, 0.4);
    }

    .language-row.checked {
      background: rgba(139, 92, 246, 0.12);
      border-color: var(--color-primary-400);
    }

    .lang-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .custom-checkbox {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      border: 1.5px solid var(--color-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      transition: all var(--transition-fast);
    }

    .custom-checkbox.checked {
      background: var(--color-primary-500);
      border-color: var(--color-primary-400);
    }

    .lang-name { font-size: var(--font-size-sm); font-weight: 600; }
    .lang-level-badge {
      font-size: 11px;
      color: var(--color-text-muted);
      background: rgba(255, 255, 255, 0.05);
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }

    /* ── Étape 4 : Téléphones & Ville Tunisie ── */
    .phones-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-3);
    }

    .phone-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      flex-direction: column;
    }

    .phone-card:hover {
      border-color: rgba(139, 92, 246, 0.5);
      background: rgba(139, 92, 246, 0.06);
    }

    .phone-card.selected {
      border-color: var(--color-primary-400);
      background: rgba(139, 92, 246, 0.12);
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
    }

    .phone-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-2);
    }

    .phone-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: rgba(139, 92, 246, 0.12);
      border: 1px solid rgba(139, 92, 246, 0.25);
      color: #c4b5fd;
      transition: all var(--transition-fast);
    }
    .phone-card:hover .phone-icon-wrap {
      background: rgba(139, 92, 246, 0.2);
      color: #fff;
    }
    .phone-card.selected .phone-icon-wrap {
      background: var(--color-primary-500);
      border-color: var(--color-primary-400);
      color: #fff;
    }
    .phone-name { font-size: 13px; color: var(--color-text-primary); margin-bottom: 4px; }
    .phone-desc { font-size: 11px; color: var(--color-text-muted); line-height: 1.35; margin: 0; }

    .gear-extras-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .gear-label { font-size: 11px; color: var(--color-text-muted); }

    /* ── Étape 5 : Avatar & Tarifs en DT ── */
    .avatar-upload-box {
      display: flex;
      align-items: center;
      gap: var(--space-5);
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
    }

    .avatar-preview-wrap {
      position: relative;
      width: 88px;
      height: 88px;
      flex-shrink: 0;
    }

    .avatar-circle-img {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--color-primary-500);
      box-shadow: 0 0 20px var(--color-primary-glow);
    }

    .avatar-camera-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--color-primary-500);
      border: 2px solid #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      cursor: pointer;
    }

    .avatar-controls {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      justify-content: center;
    }

    .avatar-btn-row { display: flex; align-items: center; gap: var(--space-2); }
    .avatar-help-text {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin: 0;
      line-height: 1.4;
    }
    .empty-avatar-box {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.04);
      border: 2px dashed rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.35);
    }

    .rate-calculator-card {
      background: rgba(139, 92, 246, 0.05);
      border: 1px solid rgba(139, 92, 246, 0.25);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
    }

    .calc-title {
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 var(--space-3);
    }

    .rates-split-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .input-with-suffix {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-with-suffix .form-input {
      padding-right: 70px;
    }

    .input-suffix {
      position: absolute;
      right: 12px;
      font-size: 12px;
      font-weight: 700;
      color: var(--color-text-muted);
      pointer-events: none;
    }

    .rate-hint {
      display: block;
      font-size: 11px;
      color: #10b981;
      margin-top: 4px;
      font-weight: 500;
    }

    .social-links-box {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
    }

    .social-inputs-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3);
    }

    /* ── Footer de Navigation Wizard ── */
    .wizard-actions-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--space-8);
      padding-top: var(--space-6);
      border-top: 1px solid var(--color-border-subtle);
    }

    .footer-left-actions { display: flex; align-items: center; gap: var(--space-3); }
    .footer-right-actions { display: flex; align-items: center; }

    .btn-nav {
      font-weight: var(--font-weight-bold);
      min-width: 140px;
    }

    .btn-finish {
      min-width: 220px;
      background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
      border: none;
      box-shadow: 0 0 25px rgba(236, 72, 153, 0.35);
    }
    .btn-finish:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 35px rgba(236, 72, 153, 0.55);
    }

    .btn-spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-right: 6px;
    }

    /* ── Autocomplétion Tunisie ── */
    .city-spinner {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-primary-400);
      display: flex;
      align-items: center;
    }
    .city-dropdown {
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
    .city-dropdown-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 12px;
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
      gap: 10px;
    }
    .city-dropdown-item:hover {
      background: rgba(139, 92, 246, 0.18);
    }
    .city-item-left {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    .city-item-pin {
      font-size: 14px;
      opacity: 0.85;
      flex-shrink: 0;
    }
    .city-item-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .city-item-text .city-name {
      font-size: 13.5px;
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      line-height: 1.25;
    }
    .city-item-text .city-gov {
      font-size: 11px;
      color: var(--color-text-muted);
      margin-top: 1px;
    }
    .city-badge {
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
    .city-dropdown-item:hover .city-badge {
      background: rgba(139, 92, 246, 0.3);
      border-color: rgba(139, 92, 246, 0.5);
      color: #fff;
    }

    /* ── Shared form styles ── */
    .input-icon-wrap { position: relative; width: 100%; }
    .input-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.1rem;
      pointer-events: none;
    }
    .form-input.has-icon { padding-left: 42px; }

    .chips-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
    .chips-label { font-size: 11px; color: var(--color-text-muted); }
    .chip-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      padding: 4px 12px;
      font-size: 12px;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .chip-btn:hover {
      background: rgba(139, 92, 246, 0.15);
      border-color: var(--color-primary-400);
      color: var(--color-text-primary);
    }
    .chip-btn.active {
      background: var(--color-primary-500);
      border-color: var(--color-primary-400);
      color: #fff;
      font-weight: var(--font-weight-semibold);
      box-shadow: 0 0 10px var(--color-primary-glow);
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin {
      animation: spin 0.8s linear infinite;
    }

    @media (max-width: 640px) {
      .wizard-card { padding: var(--space-4); }
      .experience-grid, .phones-grid, .rates-split-grid, .social-inputs-grid {
        grid-template-columns: 1fr;
      }
      .avatar-upload-box { flex-direction: column; text-align: center; }
      .wizard-actions-footer { flex-direction: column-reverse; gap: var(--space-3); }
      .footer-left-actions, .footer-right-actions { width: 100%; }
      .btn-nav, .btn-finish, .btn-skip { width: 100%; text-align: center; }
      .step-label { display: none; }
    }
  `]
})
export class CreatorOnboardingComponent implements OnInit, OnDestroy {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private tunisiaLocation = inject(TunisiaLocationService);

  errorMessage      = signal<string>('');
  successMessage    = signal<string>('');
  isSaving          = signal<boolean>(false);

  // ── Stepper Navigation ─────────────────────────────────
  currentStep = signal<number>(1);
  totalSteps = 5;

  steps = [
    { num: 1, label: 'Titre & Niveau' },
    { num: 2, label: 'Compétences' },
    { num: 3, label: 'Bio & Langues' },
    { num: 4, label: 'Ville & Matériel' },
    { num: 5, label: 'Photo & Tarifs' }
  ];

  // ── Étape 1 : Titre & Niveau ───────────────────────────
  title = '';
  experienceLevel: 'ENTRY' | 'INTERMEDIATE' | 'EXPERT' = 'INTERMEDIATE';

  suggestedTitles = [
    'Vidéaste Mobile 4K & Créateur UGC',
    'Photographe iPhone ProRes & Mode',
    'Spécialiste Reels & TikTok Viral',
    'Cadreur & Monteur Mobile Smartphone'
  ];

  experienceLevels = [
    {
      id: 'ENTRY' as const,
      title: 'Débutant',
      desc: 'Prêt pour mes premières commandes et vidéos pour des marques.'
    },
    {
      id: 'INTERMEDIATE' as const,
      title: 'Intermédiaire',
      desc: 'Plusieurs collaborations réussies et bonne maîtrise du tournage.'
    },
    {
      id: 'EXPERT' as const,
      title: 'Expert / Pro',
      desc: 'Maîtrise avancée 4K ProRes Log, étalonnage et direction artistique.'
    }
  ];

  // ── Étape 2 : Compétences (Skills) ─────────────────────
  selectedSkills: string[] = [
    'Tournage 4K 60fps',
    'Format 9:16 (Reels/TikTok)',
    'Montage CapCut Pro',
    'Création UGC'
  ];

  availableSkills = [
    'Tournage 4K 60fps',
    'Format 9:16 (Reels/TikTok)',
    'Montage CapCut Pro',
    'Création UGC',
    'Étalonnage ProRes Log',
    'Direction Artistique',
    'Micro & Son 32-bit float',
    'Stabilisation Gimbal',
    'Photographie Produit',
    'Voix-off Derja & Français',
    'Stop Motion',
    'Storytelling Mobile',
    'Lumière Studio LED',
    'Transitions Vidéo Dynamiques'
  ];

  customSkillInput = '';

  // ── Étape 3 : Bio & Langues ────────────────────────────
  bio = '';

  languages: LanguageItem[] = [
    { id: 'ar', name: 'Arabe / Derja tunisienne', level: 'Langue maternelle', selected: true },
    { id: 'fr', name: 'Français', level: 'Courant / Bilingue', selected: true },
    { id: 'en', name: 'Anglais', level: 'Professionnel', selected: false }
  ];

  // ── Étape 4 : Ville Tunisie & Smartphone ───────────────
  city = '';
  citySuggestions = signal<TunisianCity[]>([]);
  isCityLoading = signal<boolean>(false);
  private citySearch$ = new Subject<string>();
  private cityDestroy$ = new Subject<void>();

  suggestedCities = [
    'Tunis, Tunis',
    'La Marsa, Tunis',
    'Sousse, Sousse',
    'Sfax, Sfax',
    'Hammamet, Nabeul',
    'Bizerte, Bizerte'
  ];

  selectedPhone = 'iPhone 15 Pro Max (4K 60fps ProRes)';
  popularPhones = [
    'iPhone 16 Pro Max',
    'iPhone 15 Pro Max',
    'iPhone 14 Pro',
    'iPhone 13 Pro',
    'Samsung Galaxy S24 Ultra',
    'Samsung Galaxy S23 Ultra',
    'Google Pixel 9 Pro',
    'Xiaomi 14 Ultra',
    'OnePlus 12'
  ];

  hasGimbal = true;
  hasWirelessMic = true;
  hasLedLight = false;

  // ── Étape 5 : Avatar, Tarifs & Réseaux ──────────────────
  avatarUrl = '';
  hourlyRate = 50;
  dailyRate  = 350;
  instagramHandle = '';
  tiktokHandle = '';

  // ── Calcul de complétion dynamique ─────────────────────
  completionPercentage = computed(() => {
    let score = 0;
    if (this.title && this.title.trim().length >= 3) score += 20;
    if (this.selectedSkills.length >= 2) score += 20;
    if (this.bio && this.bio.trim().length >= 10) score += 20;
    if (this.city && this.city.trim().length >= 2) score += 20;
    if (this.avatarUrl && !this.avatarUrl.includes('placeholder') && this.hourlyRate > 0) score += 20;
    return score;
  });

  ngOnInit(): void {
    // Autocomplétion géographique Tunisie
    this.citySearch$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q || q.trim().length < 2) {
          this.isCityLoading.set(false);
          return of([]);
        }
        this.isCityLoading.set(true);
        return this.tunisiaLocation.search(q);
      })
    ).subscribe(results => {
      this.isCityLoading.set(false);
      this.citySuggestions.set(results);
    });

    const user = this.auth.currentUser();
    if (!user) return;

    const dedicatedAvatar = this.auth.getDedicatedAvatar(user.id, user.email);
    let cachedAvatar = '';

    if (user.title) this.title = user.title;
    if (user.bio) this.bio = user.bio;
    if (user.location) this.city = user.location;
    if (user.smartphoneModel) this.selectedPhone = user.smartphoneModel;
    if (user.dailyRate) this.dailyRate = user.dailyRate;
    if (user.hourlyRate) this.hourlyRate = user.hourlyRate;

    // Restaurer le cache spécifique à cet utilisateur
    try {
      if (user.id) {
        const saved = localStorage.getItem(`snapconnect_creator_profile_${user.id}`);
        if (saved) {
          const p = JSON.parse(saved);
          if (p.title && !this.title) this.title = p.title;
          if (p.bio && !this.bio) this.bio = p.bio;
          if (p.location && !this.city) this.city = p.location;
          if (p.smartphoneModel && !this.selectedPhone) this.selectedPhone = p.smartphoneModel;
          if (p.dailyRate && !this.dailyRate) this.dailyRate = p.dailyRate;
          if (p.hourlyRate && !this.hourlyRate) this.hourlyRate = p.hourlyRate;
          if (p.avatarUrl && !p.avatarUrl.includes('photo-1534528741775') && !p.avatarUrl.includes('photo-1535713875002')) {
            cachedAvatar = p.avatarUrl;
          }
          if (Array.isArray(p.skills) && p.skills.length > 0) this.selectedSkills = p.skills;
        }
      }
    } catch {
      /* Fallback silently */
    }

    const userPhoto = (user.avatarUrl && !user.avatarUrl.includes('photo-1534528741775') && !user.avatarUrl.includes('photo-1535713875002')) ? user.avatarUrl : '';
    this.avatarUrl = dedicatedAvatar || cachedAvatar || userPhoto || '';
    if (this.avatarUrl) {
      this.auth.saveDedicatedAvatar(this.avatarUrl, user.id, user.email);
    }
  }

  ngOnDestroy(): void {
    this.cityDestroy$.next();
    this.cityDestroy$.complete();
  }

  // ── Navigation Wizard ──────────────────────────────────
  getStepTitle(step: number): string {
    switch (step) {
      case 1: return 'Titre & Niveau';
      case 2: return 'Compétences clés';
      case 3: return 'Bio & Langues';
      case 4: return 'Ville & Matériel';
      case 5: return 'Photo & Tarifs';
      default: return 'Profil Créateur';
    }
  }

  getStepHeadline(step: number): string {
    switch (step) {
      case 1: return 'Définissez votre titre et votre niveau d’expertise';
      case 2: return 'Quelles sont vos compétences en création mobile ?';
      case 3: return 'Parlez de vous et des langues que vous pratiquez';
      case 4: return 'Votre zone de tournage et votre smartphone certifié';
      case 5: return 'Votre photo professionnelle et vos tarifs indicatifs';
      default: return 'Complétez votre profil Créateur';
    }
  }

  getStepSubtext(step: number): string {
    switch (step) {
      case 1: return 'Un bon titre permet aux marques de vous identifier en quelques secondes.';
      case 2: return 'Les clients filtrent leurs recherches par compétences techniques.';
      case 3: return 'Une bio authentique et vos langues de tournage augmentent vos chances d’embauche.';
      case 4: return 'Indiquez où vous êtes basé(e) en Tunisie pour les tournages sur place ou à distance.';
      case 5: return 'Fixez vos prix en Dinars Tunisiens (DT) et ajoutez votre photo de profil.';
      default: return 'Valorisez votre savoir-faire vidéo auprès des entreprises.';
    }
  }

  nextStep(): void {
    this.errorMessage.set('');

    // Validation par étape
    if (this.currentStep() === 1) {
      if (!this.title.trim() || this.title.trim().length < 3) {
        this.errorMessage.set('Veuillez indiquer un titre professionnel valide (min. 3 caractères).');
        return;
      }
    } else if (this.currentStep() === 2) {
      if (this.selectedSkills.length === 0) {
        this.errorMessage.set('Veuillez sélectionner au moins 1 compétence clé.');
        return;
      }
    } else if (this.currentStep() === 3) {
      if (!this.bio.trim() || this.bio.trim().length < 10) {
        this.errorMessage.set('Veuillez rédiger une courte présentation (min. 10 caractères).');
        return;
      }
    } else if (this.currentStep() === 4) {
      if (!this.city.trim()) {
        this.errorMessage.set('Veuillez indiquer votre ville ou région en Tunisie.');
        return;
      }
    }

    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep(): void {
    this.errorMessage.set('');
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToStep(stepNum: number): void {
    // Ne permet de naviguer que vers des étapes déjà visitées ou l'étape actuelle
    if (stepNum <= this.currentStep()) {
      this.errorMessage.set('');
      this.currentStep.set(stepNum);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ── Skills Methods ─────────────────────────────────────
  isSkillSelected(skill: string): boolean {
    return this.selectedSkills.includes(skill);
  }

  toggleSkill(skill: string): void {
    if (this.isSkillSelected(skill)) {
      this.selectedSkills = this.selectedSkills.filter(s => s !== skill);
    } else {
      this.selectedSkills.push(skill);
    }
  }

  addCustomSkill(): void {
    const s = this.customSkillInput.trim();
    if (s && !this.selectedSkills.includes(s)) {
      this.selectedSkills.push(s);
      this.customSkillInput = '';
    }
  }

  // ── Bio Templates ──────────────────────────────────────
  fillBioTemplate(type: number): void {
    if (type === 1) {
      this.bio = "Vidéaste mobile passionné(e) spécialisé(e) dans les formats courts UGC, TikTok et Reels. Équipé(e) d'un setup 4K ProRes avec micro HF pour des rendus nets, percutants et à fort engagement.";
    } else {
      this.bio = "Photographe et cadreur smartphone certifié. Je sublime les produits et concepts des marques à travers des visuels esthétiques, modernes et parfaitement étalonnés.";
    }
  }

  // ── City Autocomplete ──────────────────────────────────
  onCityInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    if (!val || val.trim().length < 2) {
      this.citySuggestions.set([]);
      return;
    }
    this.citySearch$.next(val);
  }

  onCityBlur(): void {
    setTimeout(() => this.citySuggestions.set([]), 250);
  }

  selectCity(s: TunisianCity): void {
    this.city = s.display;
    this.citySuggestions.set([]);
  }

  // ── Avatar & Image (Instantanément Persisté) ───────────
  onFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const rawDataUrl = e.target.result as string;
        const img = new Image();
        img.onload = () => {
          const maxDim = 280;
          let w = img.width;
          let h = img.height;
          if (w > h) {
            if (w > maxDim) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            }
          } else {
            if (h > maxDim) {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          let compressed = rawDataUrl;
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            compressed = canvas.toDataURL('image/jpeg', 0.78);
          }
          this.applyAvatarPhoto(compressed);
        };
        img.onerror = () => {
          this.applyAvatarPhoto(rawDataUrl);
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    }
  }

  private applyAvatarPhoto(photoUrl: string): void {
    if (!photoUrl) return;
    this.avatarUrl = photoUrl;
    const user = this.auth.currentUser();
    const userId = user?.id || 'creator';

    // 1. Sauvegarde immédiate dans les clés persistantes protégées
    this.auth.saveDedicatedAvatar(photoUrl, user?.id, user?.email);

    // 2. Sauvegarde immédiate dans le cache profil créateur
    try {
      const existingRaw = localStorage.getItem(`snapconnect_creator_profile_${userId}`);
      const profile = existingRaw ? JSON.parse(existingRaw) : {};
      profile.avatarUrl = photoUrl;
      localStorage.setItem(`snapconnect_creator_profile_${userId}`, JSON.stringify(profile));
    } catch {}

    // 3. Mise à jour immédiate du signal utilisateur et de la session
    if (user) {
      const updatedUser: User = { ...user, avatarUrl: photoUrl };
      this.auth.currentUser.set(updatedUser);
      try {
        localStorage.setItem('snapconnect_user', JSON.stringify(updatedUser));
      } catch {}
    }

    // 4. Synchronisation en arrière-plan avec la base de données
    this.auth.updateProfile({ avatarUrl: photoUrl }).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  // ── Sauvegarde Finale & Redirection ────────────────────
  saveAndFinish(): void {
    this.errorMessage.set('');
    this.isSaving.set(true);

    const user = this.auth.currentUser();
    const userId = user?.id || 'creator';

    if (this.avatarUrl) {
      this.applyAvatarPhoto(this.avatarUrl);
    }

    // Préparation du payload utilisateur
    const payload: Partial<User> = {
      title: this.title.trim(),
      bio: this.bio.trim(),
      location: this.city.trim(),
      avatarUrl: this.avatarUrl,
      smartphoneModel: this.selectedPhone,
      dailyRate: this.dailyRate,
      hourlyRate: this.hourlyRate,
      onboarded: true
    };

    // Sauvegarde dans le cache local scopé par userId
    const profileCache = {
      ...payload,
      id: userId,
      fullName: user?.fullName || 'Créateur Mobile',
      skills: this.selectedSkills,
      experienceLevel: this.experienceLevel,
      languages: this.languages.filter(l => l.selected).map(l => l.name),
      hasGimbal: this.hasGimbal,
      hasWirelessMic: this.hasWirelessMic,
      hasLedLight: this.hasLedLight,
      instagramHandle: this.instagramHandle,
      tiktokHandle: this.tiktokHandle
    };

    try {
      localStorage.setItem(`snapconnect_creator_profile_${userId}`, JSON.stringify(profileCache));
      if (user) {
        const updated = { ...user, ...payload };
        localStorage.setItem('snapconnect_user', JSON.stringify(updated));
        this.auth.currentUser.set(updated);
      }
    } catch {
      /* quota fallback */
    }

    // Sauvegarde en base MySQL via AuthService
    this.auth.updateProfile(payload).subscribe({
      next: () => {
        this.successMessage.set('Félicitations ! Votre profil est complet. Redirection vers votre tableau de bord...');
        setTimeout(() => {
          this.isSaving.set(false);
          this.router.navigate(['/creator/dashboard']).then(navigated => {
            if (!navigated) this.auth.redirectToDashboard();
          }).catch(() => {
            this.router.navigate(['/creator/dashboard']);
          });
        }, 350);
      },
      error: (err) => {
        console.warn('Sauvegarde backend avec fallback local:', err);
        this.successMessage.set('Profil configuré ! Redirection...');
        setTimeout(() => {
          this.isSaving.set(false);
          this.router.navigate(['/creator/dashboard']);
        }, 350);
      }
    });
  }

  skipForNow(): void {
    const payload: Partial<User> = {
      title: this.title.trim() || 'Créateur de Contenu Smartphone 4K',
      bio: this.bio.trim() || 'Vidéaste mobile spécialisé dans les formats courts et UGC.',
      location: this.city.trim() || 'Tunis, Tunisie',
      avatarUrl: this.avatarUrl,
      smartphoneModel: this.selectedPhone,
      dailyRate: this.dailyRate,
      hourlyRate: this.hourlyRate,
      onboarded: true
    };

    this.auth.updateProfile(payload).subscribe({
      next: () => this.router.navigate(['/creator/dashboard']),
      error: () => this.router.navigate(['/creator/dashboard'])
    });
  }
}
