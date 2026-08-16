import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="profile-page">
      <div class="container-narrow">
        <!-- Header -->
        <div class="page-header text-center">
          <span class="badge badge-primary">Client Profile</span>
          <h1>Company & Billing Profile</h1>
          <p>Manage your business identity, content preferences, and invoicing details.</p>
        </div>

        <form (ngSubmit)="saveProfile()" class="profile-form card-glass animate-scale-in">
          <div class="form-section">
            <h3>🏢 Business Identity</h3>

            <div class="form-group">
              <label class="form-label">Brand / Business Name</label>
              <input type="text" [(ngModel)]="companyName" name="company" class="form-input" required />
            </div>

            <div class="form-group">
              <label class="form-label">Primary Industry</label>
              <select [(ngModel)]="industry" name="industry" class="form-select">
                <option value="Cosmetics & Skincare">Cosmetics & Skincare</option>
                <option value="Restaurants & Hospitality">Restaurants & Hospitality</option>
                <option value="Fashion & Apparel">Fashion & Apparel</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Tech & D2C Brands">Tech & D2C Brands</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Location / City</label>
              <input type="text" [(ngModel)]="location" name="location" class="form-input" />
            </div>
          </div>

          <div class="form-section">
            <h3>📱 Content Preferences</h3>
            <div class="form-group">
              <label class="form-label">Default Format Needed</label>
              <select [(ngModel)]="contentFormat" name="format" class="form-select">
                <option value="9:16 Vertical 4K (TikTok/Reels/Shorts)">9:16 Vertical 4K (TikTok / Reels / Shorts)</option>
                <option value="4:5 Instagram Feed Portrait">4:5 Instagram Feed Portrait</option>
                <option value="1:1 Square Product Photo">1:1 Square Product Photo</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Preferred Smartphone Flagship</label>
              <input type="text" [(ngModel)]="preferredPhone" name="phone" class="form-input" placeholder="e.g. iPhone 15/16 Pro (ProRes Log)" />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-lg">
              Save Profile Changes 💾
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
export class ClientProfileComponent {
  auth = inject(AuthService);

  companyName = 'Bloom Cosmetics';
  industry = 'Cosmetics & Skincare';
  location = 'Paris, France';
  contentFormat = '9:16 Vertical 4K (TikTok/Reels/Shorts)';
  preferredPhone = 'iPhone 16 Pro Max (4K 60fps ProRes)';

  saveProfile(): void {
    alert('Company profile and content preferences updated successfully!');
  }
}
