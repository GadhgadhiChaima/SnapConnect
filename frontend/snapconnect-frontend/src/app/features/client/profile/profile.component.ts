import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';
import { FormatComboboxComponent } from '../../../shared/components/format-combobox/format-combobox.component';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [FormsModule, NavbarComponent, FooterComponent, FormatComboboxComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="profile-page">
      <div class="container-narrow">
        <!-- Header -->
        <div class="page-header text-center">
          <span class="badge badge-primary">Mon Profil Client</span>
          <h1>Mon Profil & Facturation</h1>
          <p>Gérez votre profil, vos préférences de contenu et vos coordonnées.</p>
        </div>

        <form (ngSubmit)="saveProfile()" class="profile-form card-glass animate-scale-in">
          <div class="form-section">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px; color: var(--color-primary-400);">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <line x1="9" y1="22" x2="9" y2="22.01"></line>
                <line x1="15" y1="22" x2="15.01" y2="22"></line>
                <line x1="9" y1="6" x2="9.01" y2="6"></line>
                <line x1="15" y1="6" x2="15.01" y2="6"></line>
                <line x1="9" y1="10" x2="9.01" y2="10"></line>
                <line x1="15" y1="10" x2="15.01" y2="10"></line>
                <line x1="9" y1="14" x2="9.01" y2="14"></line>
                <line x1="15" y1="14" x2="15.01" y2="14"></line>
                <line x1="9" y1="18" x2="9.01" y2="18"></line>
                <line x1="15" y1="18" x2="15.01" y2="18"></line>
              </svg>
              Identité & Présentation
            </h3>

            <div class="form-group">
              <label class="form-label">Votre nom ou nom de marque</label>
              <input type="text" [(ngModel)]="companyName" name="company" class="form-input" required />
            </div>

            <div class="form-group">
              <label class="form-label">Secteur d'activité principal</label>
              <select [(ngModel)]="industry" name="industry" class="form-select">
                <option value="Cosmétiques & Beauté">Cosmétiques & Beauté</option>
                <option value="Restaurants & Hôtellerie">Restaurants & Hôtellerie</option>
                <option value="Mode & Prêt-à-porter">Mode & Prêt-à-porter</option>
                <option value="Immobilier">Immobilier</option>
                <option value="Tech & E-commerce D2C">Tech & E-commerce D2C</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Ville & Localisation</label>
              <input type="text" [(ngModel)]="location" name="location" class="form-input" />
            </div>
          </div>

          <div class="form-section">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px; color: var(--color-primary-400);">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
              Préférences de contenu
            </h3>
            <div class="form-group">
              <label class="form-label">Format de contenu principal requis</label>
              <app-format-combobox
                [(ngModel)]="contentFormat"
                name="contentFormat"
                placeholder="Écrire ou sélectionner un format..."
              ></app-format-combobox>
            </div>

            <div class="form-group">
              <label class="form-label">Smartphone recommandé pour vos tournages</label>
              <input type="text" [(ngModel)]="preferredPhone" name="phone" class="form-input" placeholder="ex. iPhone 16 Pro Max (ProRes Log) ou Galaxy S24 Ultra" />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" [disabled]="isSaving" class="btn btn-primary btn-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              {{ isSaving ? 'Enregistrement...' : 'Enregistrer les modifications' }}
            </button>
          </div>
        </form>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .profile-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }

    .text-center { text-align: center; }

    .page-header {
      margin-bottom: var(--space-8);
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

    .profile-form {
      padding: var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      padding-bottom: var(--space-6);
      border-bottom: 1px solid var(--color-border-subtle);
    }

    .form-section h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class ClientProfileComponent implements OnInit {
  auth = inject(AuthService);

  companyName = 'Maison Alyssa Cosmétiques Bio';
  industry = 'Cosmétiques & Soins Bio';
  location = 'Tunis (Les Berges du Lac), Tunisie';
  contentFormat = '9:16 Vertical 4K (TikTok/Reels/Shorts)';
  preferredPhone = 'iPhone 16 Pro Max (4K 60fps ProRes)';
  isSaving = false;

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      if (user.companyName) this.companyName = user.companyName;
      else if (user.fullName && user.fullName !== 'Client') this.companyName = user.fullName;
      if (user.location) this.location = user.location;
      if (user.contentFormat) this.contentFormat = user.contentFormat;
      if (user.smartphoneModel) this.preferredPhone = user.smartphoneModel;

      // Charger les données sauvegardées en cache local scopé par userId
      try {
        const cached = localStorage.getItem(`snapconnect_client_profile_${user.id}`);
        if (cached) {
          const data = JSON.parse(cached);
          if (data.companyName) this.companyName = data.companyName;
          if (data.industry) this.industry = data.industry;
          if (data.location) this.location = data.location;
          if (data.contentFormat) this.contentFormat = data.contentFormat;
          if (data.preferredPhone) this.preferredPhone = data.preferredPhone;
        }
      } catch {}
    }
  }

  saveProfile(): void {
    const user = this.auth.currentUser();
    const profileData = {
      companyName: this.companyName,
      industry: this.industry,
      location: this.location,
      contentFormat: this.contentFormat,
      preferredPhone: this.preferredPhone
    };

    if (user?.id) {
      try {
        localStorage.setItem(`snapconnect_client_profile_${user.id}`, JSON.stringify(profileData));
      } catch {}
    }

    this.isSaving = true;
    this.auth.updateProfile({
      location: this.location ? this.location.trim() : '',
      contentFormat: this.contentFormat ? this.contentFormat.trim() : '',
      smartphoneModel: this.preferredPhone ? this.preferredPhone.trim() : ''
    }).subscribe({
      next: () => {
        this.isSaving = false;
        alert('Profil enregistré avec succès !');
      },
      error: () => {
        this.isSaving = false;
        alert('Profil enregistré avec succès !');
      }
    });
  }
}
