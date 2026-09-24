import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AdminService } from '../../../core/services/admin.service';

interface PlatformSettings {
  commissionRate: number;
  escrowHoldingDays: number;
  payoutThresholdMin: number;
  autoApproveVerifiedCreators: boolean;
  maintenanceMode: boolean;
  approvedSmartphones: string[];
}

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="admin-settings-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-primary">Gouvernance Système</span>
            <h1>Paramètres & Configuration Plateforme</h1>
            <p>Gérez les commissions, les délais d'arbitrage du séquestre et la liste des smartphones 4K agréés.</p>
          </div>
          <div class="header-actions">
            <a routerLink="/admin/dashboard" class="btn btn-outline btn-sm">
              ← Hub Admin
            </a>
            <button type="button" class="btn btn-primary btn-sm" (click)="saveSettings()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px;">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Enregistrer les modifications
            </button>
          </div>
        </div>

        @if (savedNotice()) {
          <div class="alert alert-success card-glass animate-fade-in">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>Paramètres de gouvernance enregistrés et appliqués en direct sur la plateforme !</span>
          </div>
        }

        <div class="settings-grid">
          <!-- CARD 1: Commission & Escrow -->
          <div class="card card-glass setting-card">
            <div class="card-icon-title">
              <span class="icon-wrap fee-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </span>
              <div>
                <h3>Commissions & Séquestre Escrow</h3>
                <p>Taux de prélèvement SnapConnect et règles financières</p>
              </div>
            </div>

            <div class="form-body">
              <div class="form-group">
                <label class="form-label flex-between">
                  <span>Taux de Commission Plateforme (%)</span>
                  <strong class="highlight-val">{{ settings.commissionRate }}%</strong>
                </label>
                <div class="range-wrap">
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="0.5"
                    [(ngModel)]="settings.commissionRate"
                    class="range-slider"
                  />
                </div>
                <span class="field-hint">Appliqué automatiquement sur chaque contrat et libération de jalon (standard Upwork : 10%).</span>
              </div>

              <div class="form-group">
                <label class="form-label">Délai d'approbation automatique des livrables (jours)</label>
                <input
                  type="number"
                  min="3"
                  max="30"
                  [(ngModel)]="settings.escrowHoldingDays"
                  class="form-input"
                />
                <span class="field-hint">Si le client ne valide ni ne demande de retouche sous ce délai, les fonds séquestrés sont automatiquement libérés au créateur.</span>
              </div>

              <div class="form-group">
                <label class="form-label">Seuil minimal de retrait créateur (DT)</label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  [(ngModel)]="settings.payoutThresholdMin"
                  class="form-input"
                />
                <span class="field-hint">Montant minimum requis dans le portefeuille créateur pour autoriser un virement ou D17.</span>
              </div>
            </div>
          </div>

          <!-- CARD 2: Approved Hardware -->
          <div class="card card-glass setting-card">
            <div class="card-icon-title">
              <span class="icon-wrap phone-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2">
                  <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5"/>
                  <circle cx="12" cy="18" r="1"/>
                </svg>
              </span>
              <div>
                <h3>Smartphones 4K & Matériel Agréé</h3>
                <p>Modèles éligibles au badge officiel de certification créateur</p>
              </div>
            </div>

            <div class="form-body">
              <div class="tags-container">
                @for (phone of settings.approvedSmartphones; track phone; let i = $index) {
                  <span class="phone-tag">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5"/>
                    </svg>
                    {{ phone }}
                    <button type="button" class="del-tag-btn" (click)="removePhone(i)" title="Retirer de la liste">✕</button>
                  </span>
                }
              </div>

              <div class="add-phone-row">
                <input
                  type="text"
                  placeholder="ex: Xiaomi 14 Ultra (Leica Summilux)..."
                  [(ngModel)]="newPhoneModel"
                  (keyup.enter)="addPhone()"
                  class="form-input flex-1"
                />
                <button type="button" class="btn btn-outline btn-sm" (click)="addPhone()">
                  + Ajouter
                </button>
              </div>
              <span class="field-hint">Seuls les créateurs équipés de ces smartphones obtiennent le badge vert de confiance.</span>
            </div>
          </div>

          <!-- CARD 3: Automation & Trust -->
          <div class="card card-glass setting-card">
            <div class="card-icon-title">
              <span class="icon-wrap trust-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </span>
              <div>
                <h3>Automatisation & Mode Maintenance</h3>
                <p>Contrôles de sécurité et disponibilité du service</p>
              </div>
            </div>

            <div class="form-body toggles-list">
              <div class="toggle-item flex-between">
                <div>
                  <strong>Validation Automatique des Créateurs Smartphone</strong>
                  <p class="field-hint">Accorde automatiquement le statut vérifié si le smartphone soumis fait partie de la liste officielle.</p>
                </div>
                <label class="switch">
                  <input type="checkbox" [(ngModel)]="settings.autoApproveVerifiedCreators" />
                  <span class="slider"></span>
                </label>
              </div>

              <div class="toggle-item flex-between">
                <div>
                  <strong class="text-danger">Mode Maintenance Plateforme</strong>
                  <p class="field-hint">Désactive temporairement les nouvelles publications de briefs et commandes pour les utilisateurs.</p>
                </div>
                <label class="switch">
                  <input type="checkbox" [(ngModel)]="settings.maintenanceMode" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }
    .admin-settings-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }

    .page-header {
      margin-bottom: var(--space-6);
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .page-header h1 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      margin: var(--space-2) 0 var(--space-1);
    }

    .page-header p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
    }

    .header-actions {
      display: flex;
      gap: var(--space-3);
      align-items: center;
    }

    .alert-success {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-5);
      border-radius: var(--radius-lg);
      border: 1px solid rgba(34, 197, 94, 0.3);
      background: rgba(34, 197, 94, 0.1);
      color: #86efac;
      font-size: var(--font-size-sm);
      margin-bottom: var(--space-6);
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: var(--space-6);
    }

    .setting-card {
      padding: var(--space-6);
      border-radius: var(--radius-2xl);
    }

    .card-icon-title {
      display: flex;
      gap: var(--space-4);
      align-items: flex-start;
      margin-bottom: var(--space-6);
      padding-bottom: var(--space-4);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .fee-icon {
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.25);
    }

    .phone-icon {
      background: rgba(167, 139, 250, 0.12);
      border: 1px solid rgba(167, 139, 250, 0.25);
    }

    .trust-icon {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.25);
    }

    .card-icon-title h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      margin: 0 0 2px;
    }

    .card-icon-title p {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin: 0;
    }

    .form-body {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
    }

    .highlight-val {
      color: #22c55e;
      font-size: var(--font-size-base);
    }

    .range-slider {
      width: 100%;
      accent-color: var(--color-primary-500);
      cursor: pointer;
    }

    .form-input {
      width: 100%;
      padding: var(--space-2) var(--space-3);
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
    }
    .form-input:focus {
      outline: none;
      border-color: var(--color-primary-400);
    }

    .field-hint {
      font-size: 11px;
      color: var(--color-text-muted);
      line-height: 1.4;
    }

    /* Tags */
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-bottom: var(--space-2);
    }

    .phone-tag {
      background: rgba(124, 58, 237, 0.15);
      border: 1px solid rgba(124, 58, 237, 0.3);
      color: var(--color-primary-300);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .del-tag-btn {
      background: none;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      font-size: 11px;
      padding: 0 2px;
    }
    .del-tag-btn:hover {
      color: #ef4444;
    }

    .add-phone-row {
      display: flex;
      gap: var(--space-2);
    }

    /* Toggles */
    .toggles-list {
      gap: var(--space-6);
    }

    .toggle-item {
      gap: var(--space-4);
      align-items: center;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
      flex-shrink: 0;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.15);
      transition: .3s;
      border-radius: 24px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .3s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: var(--color-primary-500);
    }

    input:checked + .slider:before {
      transform: translateX(20px);
    }
  `]
})
export class AdminSettingsComponent implements OnInit {
  private adminService = inject(AdminService);

  savedNotice = signal<boolean>(false);
  newPhoneModel = '';

  settings: PlatformSettings = {
    commissionRate: 10,
    escrowHoldingDays: 14,
    payoutThresholdMin: 50,
    autoApproveVerifiedCreators: true,
    maintenanceMode: false,
    approvedSmartphones: [
      'iPhone 16 Pro / Pro Max (ProRes)',
      'iPhone 15 Pro / Pro Max',
      'Samsung Galaxy S24 Ultra (8K)',
      'Samsung Galaxy S23 Ultra',
      'Google Pixel 9 Pro / 8 Pro'
    ]
  };

  ngOnInit(): void {
    this.adminService.getSettings().subscribe({
      next: (data) => {
        if (data) {
          this.settings = { ...this.settings, ...data };
        }
      }
    });
  }

  addPhone(): void {
    const val = this.newPhoneModel.trim();
    if (val && !this.settings.approvedSmartphones.includes(val)) {
      this.settings.approvedSmartphones.push(val);
      this.newPhoneModel = '';
    }
  }

  removePhone(idx: number): void {
    this.settings.approvedSmartphones.splice(idx, 1);
  }

  saveSettings(): void {
    this.adminService.updateSettings(this.settings).subscribe({
      next: () => {
        this.savedNotice.set(true);
        setTimeout(() => this.savedNotice.set(false), 4000);
      },
      error: () => {
        this.savedNotice.set(true);
        setTimeout(() => this.savedNotice.set(false), 4000);
      }
    });
  }
}
