import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-creator-profile-edit',
  standalone: true,
  imports: [FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="creator-profile-edit-page">
      <div class="container-narrow">
        <!-- Header -->
        <div class="page-header text-center">
          <span class="badge badge-success">Creator Studio</span>
          <h1>Edit Mobile Creator Profile & Rig Setup</h1>
          <p>Highlight your verified smartphone hardware, stabilization gear, audio setup, and rates.</p>
        </div>

        <form (ngSubmit)="saveProfile()" class="profile-form card-glass animate-scale-in">
          <!-- Bio & Title -->
          <div class="form-section">
            <h3>👤 Public Profile</h3>

            <div class="form-group">
              <label class="form-label">Professional Title</label>
              <input type="text" [(ngModel)]="title" name="title" class="form-input" placeholder="e.g. TikTok & Reels Viral Specialist (4K 60fps)" required />
            </div>

            <div class="form-group">
              <label class="form-label">Bio & Filming Philosophy</label>
              <textarea [(ngModel)]="bio" name="bio" rows="4" class="form-textarea" placeholder="Explain your hook psychology, color grading, and mobile storytelling..." required></textarea>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Location / City</label>
                <input type="text" [(ngModel)]="location" name="location" class="form-input" placeholder="Paris, France" />
              </div>

              <div class="form-group">
                <label class="form-label">Hourly Rate ($ USD / hr)</label>
                <input type="number" [(ngModel)]="hourlyRate" name="rate" class="form-input" placeholder="45" required />
              </div>
            </div>
          </div>

          <!-- Smartphone & Equipment Specs -->
          <div class="form-section">
            <h3>📱 Verified Mobile Studio Hardware</h3>

            <div class="form-group">
              <label class="form-label">Primary Flagship Smartphone</label>
              <input type="text" [(ngModel)]="smartphoneModel" name="phone" class="form-input" placeholder="iPhone 16 Pro Max (4K 60fps ProRes Log)" required />
            </div>

            <div class="form-group">
              <label class="form-label">Gimbal & Stabilization Rig</label>
              <input type="text" [(ngModel)]="gimbal" name="gimbal" class="form-input" placeholder="DJI Osmo Mobile 6 / Zhiyun Smooth 5S" />
            </div>

            <div class="form-group">
              <label class="form-label">Microphones & Audio Setup</label>
              <input type="text" [(ngModel)]="audioGear" name="audio" class="form-input" placeholder="Rode Wireless Pro 32-bit float / DJI Mic 2" />
            </div>

            <div class="form-group">
              <label class="form-label">Portable Lighting Gear</label>
              <input type="text" [(ngModel)]="lighting" name="lighting" class="form-input" placeholder="Aputure Amaran MC RGB / Bi-color LED softbox" />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-lg">
              Save Creator Profile Changes 💾
            </button>
          </div>
        </form>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .creator-profile-edit-page {
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

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
    }

    @media (max-width: 640px) {
      .form-row-2 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CreatorProfileEditComponent {
  auth = inject(AuthService);

  title = 'TikTok & Reels Viral Specialist (4K 60fps)';
  bio = 'Professional mobile videographer with 400K+ views on client TikToks. Specializing in fast-paced cuts, trendy transitions, and hook psychology. All content shot natively in 4K 60fps ProRes Log.';
  location = 'Paris, France';
  hourlyRate = 45;

  smartphoneModel = 'iPhone 16 Pro Max (4K 60fps ProRes Log)';
  gimbal = 'DJI Osmo Mobile 6';
  audioGear = 'Rode Wireless Pro (32-bit float)';
  lighting = 'Aputure Amaran MC RGB';

  saveProfile(): void {
    alert('Creator profile and smartphone rig specifications saved successfully!');
  }
}
