import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="settings-page">
      <div class="container-narrow">
        <div class="page-header">
          <span class="badge badge-primary">Compte</span>
          <h1>Profil & Préférences</h1>
          <p>Modifiez vos informations personnelles, notifications et configuration de tournage mobile.</p>
        </div>

        <form (ngSubmit)="save()" class="settings-card card-glass animate-scale-in">
          <div class="section-part">
            <h3>Informations personnelles</h3>
            <div class="form-group">
              <label class="form-label">Nom complet</label>
              <input type="text" [(ngModel)]="fullName" name="name" class="form-input" required />
            </div>

            <div class="form-group">
              <label class="form-label">Adresse email</label>
              <input type="email" [(ngModel)]="email" name="email" class="form-input" disabled />
            </div>
          </div>

          @if (auth.isCreator()) {
            <div class="section-part">
              <h3>Équipement smartphone & tournage</h3>
              <div class="form-group">
                <label class="form-label">Smartphone principal</label>
                <input type="text" [(ngModel)]="phoneModel" name="phone" class="form-input" placeholder="ex. iPhone 16 Pro Max" />
              </div>

              <div class="form-group">
                <label class="form-label">Stabilisateur / Gimbal</label>
                <input type="text" [(ngModel)]="gimbal" name="gimbal" class="form-input" placeholder="ex. DJI Osmo Mobile 6" />
              </div>

              <div class="form-group">
                <label class="form-label">Système audio & micros</label>
                <input type="text" [(ngModel)]="audio" name="audio" class="form-input" placeholder="ex. Rode Wireless Pro" />
              </div>
            </div>
          }

          <div class="actions">
            <button type="submit" class="btn btn-primary btn-md">Enregistrer les paramètres</button>
          </div>
        </form>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }
    .settings-page { padding-top: calc(var(--navbar-height) + var(--space-8)); padding-bottom: var(--space-20); }
    .page-header { margin-bottom: var(--space-8); }
    .page-header h1 { font-size: var(--font-size-3xl); font-weight: var(--font-weight-black); margin: var(--space-2) 0; }
    .page-header p { color: var(--color-text-secondary); font-size: var(--font-size-base); }
    .settings-card { padding: var(--space-8); border-radius: var(--radius-2xl); display: flex; flex-direction: column; gap: var(--space-6); }
    .section-part { display: flex; flex-direction: column; gap: var(--space-4); padding-bottom: var(--space-6); border-bottom: 1px solid var(--color-border-subtle); }
    .section-part h3 { font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); }
    .actions { display: flex; justify-content: flex-end; }
  `]
})
export class SettingsComponent {
  auth = inject(AuthService);

  fullName = this.auth.currentUser()?.fullName || 'Sarah Ben Salem';
  email = this.auth.currentUser()?.email || 'sarah.bensalem@snapconnect.tn';
  phoneModel = 'iPhone 16 Pro Max';
  gimbal = 'DJI Osmo Mobile 6';
  audio = 'Rode Wireless Pro';

  save(): void {
    alert('Paramètres enregistrés avec succès !');
  }
}
