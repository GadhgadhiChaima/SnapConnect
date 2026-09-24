import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AdminService } from '../../../core/services/admin.service';

interface UserReport {
  id: string;
  reporterName: string;
  reporterRole: string;
  targetName: string;
  targetType: string;
  reason: string;
  description: string;
  status: string;
  reportedAt: string;
}

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="admin-reports-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-warning">Trust & Safety</span>
            <h1>Signalements & Modération des Conduites</h1>
            <p>Traitement des infractions : contournement du séquestre, comportements abusifs et non-respect de la charte de qualité 4K.</p>
          </div>
          <a routerLink="/admin/dashboard" class="btn btn-outline btn-sm">
            ← Hub Admin
          </a>
        </div>

        <!-- Trust & Safety Banner -->
        <div class="trust-banner card-glass">
          <div class="t-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div class="t-text">
            <strong>Politique Tolérance Zéro — Paiements Hors-Plateforme</strong>
            <p>Tout accord passé en dehors du séquestre SnapConnect annule les garanties de livraison 4K et entraîne la suspension immédiate du compte incriminé.</p>
          </div>
        </div>

        <!-- Reports List Card -->
        <div class="reports-container">
          @for (r of reports(); track r.id) {
            <div class="report-card card-glass animate-fade-in">
              <div class="report-top flex-between">
                <div>
                  <span class="badge badge-warning">SIGNALEMENT #{{ r.id }}</span>
                  <span class="reason-pill">{{ getReasonLabel(r.reason) }}</span>
                </div>
                <span class="report-date">{{ r.reportedAt }}</span>
              </div>

              <!-- Parties Involved -->
              <div class="parties-involved">
                <div class="party-col">
                  <span class="role-sub">Signalé par</span>
                  <strong class="party-name">{{ r.reporterName }}</strong>
                  <span class="badge badge-neutral text-xs">{{ r.reporterRole === 'CLIENT' ? 'Client' : 'Créateur' }}</span>
                </div>
                <div class="party-arrow">➔ accuse</div>
                <div class="party-col">
                  <span class="role-sub">Utilisateur mis en cause</span>
                  <strong class="party-name text-danger">{{ r.targetName }}</strong>
                  <span class="badge badge-neutral text-xs">{{ r.targetType === 'CREATOR' ? 'Créateur' : 'Client' }}</span>
                </div>
              </div>

              <!-- Description -->
              <div class="report-body">
                <span class="lbl">Détail des faits rapportés :</span>
                <p class="body-text">« {{ r.description }} »</p>
              </div>

              <!-- Actions -->
              <div class="report-actions flex-between">
                <span class="status-indicator">
                  Statut : <strong>{{ r.status === 'PENDING' ? '⏳ En attente d\'examen' : '✓ Traité' }}</strong>
                </span>

                @if (r.status === 'PENDING') {
                  <div class="btns-group">
                    <button
                      type="button"
                      class="btn btn-outline btn-xs text-warning"
                      (click)="handleAction(r.id, 'WARN', r.targetName)"
                    >
                      ⚠️ Envoyer un Avertissement
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline btn-xs text-danger"
                      (click)="handleAction(r.id, 'SUSPEND', r.targetName)"
                    >
                      🚫 Suspendre l'utilisateur
                    </button>
                    <button
                      type="button"
                      class="btn btn-ghost btn-xs"
                      (click)="handleAction(r.id, 'DISMISS', r.targetName)"
                    >
                      Classer sans suite
                    </button>
                  </div>
                }
              </div>
            </div>
          } @empty {
            <div class="empty-card card-glass text-center py-10">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-muted mx-auto mb-3">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              <h3>Aucun signalement en attente</h3>
              <p class="text-muted text-sm">Tous les litiges et conduites signalées ont été examinés par l'équipe de sécurité.</p>
            </div>
          }
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }
    .admin-reports-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }
    .page-header {
      margin-bottom: var(--space-8);
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

    .trust-banner {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4) var(--space-6);
      border-radius: var(--radius-xl);
      margin-bottom: var(--space-8);
      border-left: 3px solid #fbbf24;
      background: rgba(245, 158, 11, 0.05);
    }

    .t-icon {
      flex-shrink: 0;
    }

    .t-text strong {
      display: block;
      color: #fbbf24;
      font-size: var(--font-size-sm);
      margin-bottom: 2px;
    }

    .t-text p {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin: 0;
    }

    .reports-container {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .report-card {
      padding: var(--space-6);
      border-radius: var(--radius-2xl);
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .report-top {
      align-items: center;
    }

    .reason-pill {
      margin-left: var(--space-2);
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      font-weight: 600;
    }

    .report-date {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .parties-involved {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      background: rgba(15, 23, 42, 0.5);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      flex-wrap: wrap;
    }

    .party-col {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .role-sub {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .party-name {
      font-size: var(--font-size-sm);
    }

    .party-arrow {
      color: var(--color-text-muted);
      font-size: 12px;
    }

    .report-body {
      background: rgba(0, 0, 0, 0.2);
      padding: var(--space-4);
      border-radius: var(--radius-lg);
    }

    .lbl {
      display: block;
      font-size: 11px;
      color: var(--color-text-muted);
      margin-bottom: 4px;
      text-transform: uppercase;
    }

    .body-text {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      margin: 0;
      line-height: 1.5;
    }

    .report-actions {
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-3);
      padding-top: var(--space-2);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .status-indicator {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .btns-group {
      display: flex;
      gap: var(--space-2);
    }

    .empty-card {
      padding: var(--space-12);
      border-radius: var(--radius-2xl);
    }
  `]
})
export class AdminReportsComponent implements OnInit {
  private adminService = inject(AdminService);

  reports = signal<UserReport[]>([]);

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.adminService.getReports().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.reports.set(data);
        } else {
          this.reports.set([
            {
              id: 'rep-1',
              reporterName: 'Maison Alyssa Cosmétiques Bio',
              reporterRole: 'CLIENT',
              targetName: 'Slim MobileShooter',
              targetType: 'CREATOR',
              reason: 'TENTATIVE_PAIEMENT_HORS_PLATEFORME',
              description: 'A demandé à être réglé en espèces en direct sans passer par le séquestre SnapConnect.',
              status: 'PENDING',
              reportedAt: '2026-08-16 11:30'
            },
            {
              id: 'rep-2',
              reporterName: 'Sarah Ben Salem',
              reporterRole: 'CREATOR',
              targetName: 'TechStore Tunisia',
              targetType: 'CLIENT',
              reason: 'EXIGENCES_HORS_BRIEF',
              description: 'Le client a exigé 10 retouches supplémentaires non prévues dans le brief initial sans compensation financière.',
              status: 'PENDING',
              reportedAt: '2026-08-17 09:15'
            }
          ]);
        }
      },
      error: () => {
        // Fallback
        this.reports.set([
          {
            id: 'rep-1',
            reporterName: 'Maison Alyssa Cosmétiques Bio',
            reporterRole: 'CLIENT',
            targetName: 'Slim MobileShooter',
            targetType: 'CREATOR',
            reason: 'TENTATIVE_PAIEMENT_HORS_PLATEFORME',
            description: 'A demandé à être réglé en espèces en direct sans passer par le séquestre SnapConnect.',
            status: 'PENDING',
            reportedAt: '2026-08-16 11:30'
          },
          {
            id: 'rep-2',
            reporterName: 'Sarah Ben Salem',
            reporterRole: 'CREATOR',
            targetName: 'TechStore Tunisia',
            targetType: 'CLIENT',
            reason: 'EXIGENCES_HORS_BRIEF',
            description: 'Le client a exigé 10 retouches supplémentaires non prévues dans le brief initial sans compensation financière.',
            status: 'PENDING',
            reportedAt: '2026-08-17 09:15'
          }
        ]);
      }
    });
  }

  getReasonLabel(reason: string): string {
    switch (reason) {
      case 'TENTATIVE_PAIEMENT_HORS_PLATEFORME': return 'Tentative Paiement Hors-Plateforme';
      case 'EXIGENCES_HORS_BRIEF': return 'Exigences Abusives Hors-Brief';
      case 'QUALITE_NON_CONFORME': return 'Qualité Vidéo Non Conforme';
      case 'SPAM': return 'Spam / Sollicitation Indésirable';
      default: return reason;
    }
  }

  handleAction(id: string, action: 'WARN' | 'SUSPEND' | 'DISMISS', targetName: string): void {
    let confirmMsg = '';
    if (action === 'WARN') confirmMsg = `Envoyer un avertissement officiel à ${targetName} ?`;
    else if (action === 'SUSPEND') confirmMsg = `Confirmez-vous la suspension immédiate du compte de ${targetName} ?`;
    else confirmMsg = `Classer le signalement #${id} sans suite ?`;

    if (confirm(confirmMsg)) {
      this.adminService.resolveReport(id, action).subscribe({
        next: () => {
          this.reports.update(prev => prev.map(r => r.id === id ? { ...r, status: 'RESOLVED' } : r));
        },
        error: () => {
          this.reports.update(prev => prev.map(r => r.id === id ? { ...r, status: 'RESOLVED' } : r));
        }
      });
    }
  }
}
