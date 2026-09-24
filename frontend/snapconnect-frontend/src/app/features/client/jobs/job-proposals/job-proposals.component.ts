import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { RatingStarsComponent } from '../../../../shared/components/rating-stars/rating-stars.component';
import { CreatorBadgeComponent } from '../../../../shared/components/creator-badge/creator-badge.component';
import { ProposalService } from '../../../../core/services/proposal.service';
import { ContractService } from '../../../../core/services/contract.service';
import { JobService } from '../../../../core/services/job.service';
import { Proposal } from '../../../../core/models/proposal.model';
import { Job } from '../../../../core/models/job.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-job-proposals',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent, RatingStarsComponent, CreatorBadgeComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="proposals-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header flex-between">
          <div>
            <a routerLink="/client/jobs" class="back-link">← Retour à mes briefs</a>
            <h1>Propositions pour : {{ job()?.title || 'Brief Tournage Mobile' }}</h1>
            <p>Comparez les offres des créateurs, leurs équipements smartphone, leurs avis et recrutez avec une protection par séquestre à 100%.</p>
          </div>
          <div class="job-pill card-glass">
            <span class="lbl">Budget du Brief :</span>
            <strong>{{ job()?.budgetAmount || job()?.budgetMin || 250 }} DT ({{ job()?.budgetType === 'HOURLY' ? 'Horaire' : 'Fixe' }})</strong>
          </div>
        </div>

        <!-- Proposals List -->
        @if (proposals().length > 0) {
          <div class="proposals-list">
            @for (p of proposals(); track p.id) {
              <div class="proposal-card card-glass animate-fade-in">
                <div class="proposal-header flex-between">
                  <div class="creator-info-row">
                    <a [routerLink]="['/creators', getCreatorProfileId(p.creatorId, p.creatorName)]" class="avatar-link" title="Voir le profil du créateur">
                      <img [src]="getCreatorAvatar(p)" [alt]="p.creatorName" class="avatar avatar-lg avatar-ring" referrerpolicy="no-referrer" />
                    </a>
                    <div>
                      <div class="name-badge-row">
                        <a [routerLink]="['/creators', getCreatorProfileId(p.creatorId, p.creatorName)]" class="creator-name-link" title="Voir le profil du créateur">
                          <h3>{{ p.creatorName }}</h3>
                        </a>
                        <app-creator-badge [type]="'VERIFIED_CREATOR'"></app-creator-badge>
                      </div>
                      <app-rating-stars [rating]="p.creatorRating || 4.9" [reviewsCount]="38"></app-rating-stars>
                    </div>
                  </div>

                  <div class="bid-col">
                    <span class="bid-amount">{{ p.bidAmount }} DT</span>
                    <span class="bid-delivery">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 3px;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      Livraison en {{ p.deliveryDays }} jours
                    </span>
                  </div>
                </div>

                <!-- Smartphone equipment highlighted -->
                <div class="gear-banner">
                  <span class="gear-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-primary-400);">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                      <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    </svg>
                  </span>
                  <div>
                    <span class="gear-title">Smartphone & Accessoires proposés :</span>
                    <strong>{{ p.equipmentConfirmed || 'iPhone 16 Pro Max • DJI Osmo Mobile 6 • Rode Wireless Pro' }}</strong>
                  </div>
                </div>

                <!-- Cover letter -->
                <div class="cover-letter">
                  <h4>Lettre de motivation & Démarche créative :</h4>
                  <p>{{ p.coverLetter }}</p>
                </div>

                <!-- Footer Actions -->
                <div class="proposal-footer flex-between">
                  <a [routerLink]="['/creators', getCreatorProfileId(p.creatorId, p.creatorName)]" class="btn btn-outline btn-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    Voir le portfolio complet
                  </a>

                  <div class="action-buttons">
                    <button (click)="openChat(p)" class="btn btn-outline btn-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      Contacter le créateur
                    </button>
                    @if (p.status === 'ACCEPTED') {
                      <button (click)="viewActiveContract(p)" class="btn btn-success btn-md contract-btn" title="Accéder au contrat et suivre le tournage">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 6px;">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Voir le contrat actif →
                      </button>
                    } @else if (p.status === 'REJECTED') {
                      <span class="badge badge-neutral declined-badge">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 5px;">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        Proposition déclinée
                      </span>
                    } @else {
                      <button (click)="openDeclineModal(p)" class="btn btn-outline btn-sm btn-decline" title="Refuser cette candidature">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 5px;">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Refuser
                      </button>

                      <button (click)="hireCreator(p)" class="btn btn-primary btn-md btn-block hire-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Embaucher & Séquestrer {{ p.bidAmount }} DT
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state card-glass animate-scale-in">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-primary-400);">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <h3>Aucune proposition reçue pour le moment</h3>
            <p>Les créateurs smartphone consultent actuellement votre brief. Revenez d'ici peu !</p>
            <a routerLink="/client/jobs" class="btn btn-outline btn-sm">Retour à mes briefs</a>
          </div>
        }
      </div>

      <!-- Modale de Confirmation de Refus Upwork-like -->
      @if (showDeclineModal() && selectedProposalForDecline(); as prop) {
        <div class="modal-backdrop" (click)="closeDeclineModal()">
          <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
            <button class="close-btn" (click)="closeDeclineModal()">✕</button>

            <div class="modal-header-icon decline-icon-box">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>

            <h2>Refuser cette proposition</h2>
            <p class="modal-sub">
              Êtes-vous sûr de vouloir décliner l'offre de <strong>{{ prop.creatorName }}</strong> ({{ prop.bidAmount }} DT) pour la mission <em>« {{ job()?.title || prop.jobTitle }} »</em> ?
            </p>

            <div class="decline-info-banner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0; color: #f59e0b;">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>Le créateur recevra une notification courtoise l'informant que sa candidature n'a pas été retenue.</span>
            </div>

            <div class="modal-actions">
              <button type="button" (click)="closeDeclineModal()" class="btn btn-outline">Annuler</button>
              <button type="button" (click)="confirmDecline()" class="btn btn-danger">
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      }
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .proposals-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }

    .back-link {
      font-size: var(--font-size-xs);
      color: var(--color-primary-400);
      text-decoration: none;
      margin-bottom: var(--space-2);
      display: inline-block;
    }

    .page-header {
      margin-bottom: var(--space-8);
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .page-header h1 {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-black);
      margin: 0 0 var(--space-1);
    }

    .page-header p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    .job-pill {
      padding: var(--space-3) var(--space-5);
      border-radius: var(--radius-xl);
      display: flex;
      flex-direction: column;
      text-align: right;
    }

    .job-pill .lbl {
      font-size: 10px;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }

    .job-pill strong {
      font-size: var(--font-size-lg);
      color: var(--color-primary-300);
    }

    .proposals-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .proposal-card {
      padding: var(--space-6) var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .creator-info-row {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .avatar-link {
      display: inline-block;
      cursor: pointer;
      transition: transform var(--transition-fast);
      border-radius: var(--radius-full);
    }

    .avatar-link:hover {
      transform: scale(1.06);
    }

    .creator-name-link {
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }

    .creator-name-link:hover h3 {
      color: var(--color-primary-300);
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .name-badge-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: 2px;
    }

    .name-badge-row h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      margin: 0;
    }

    .bid-col {
      text-align: right;
      display: flex;
      flex-direction: column;
    }

    .bid-amount {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-black);
      color: var(--color-success);
    }

    .bid-delivery {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .gear-banner {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: rgba(139, 92, 246, 0.08);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: var(--radius-lg);
      font-size: var(--font-size-xs);
    }

    .gear-icon { font-size: 1.4rem; }
    .gear-title { color: var(--color-text-muted); margin-right: var(--space-2); }
    .gear-banner strong { color: var(--color-primary-300); }

    .cover-letter h4 {
      font-size: var(--font-size-xs);
      text-transform: uppercase;
      color: var(--color-text-muted);
      margin-bottom: var(--space-2);
    }

    .cover-letter p {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: var(--line-height-relaxed);
      margin: 0;
    }

    .proposal-footer {
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border-subtle);
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .action-buttons {
      display: flex;
      gap: var(--space-3);
    }

    .empty-state {
      text-align: center;
      padding: var(--space-12) var(--space-6);
      border-radius: var(--radius-2xl);
    }
    .empty-icon { font-size: 3rem; margin-bottom: var(--space-3); }
    .empty-state h3 { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); margin-bottom: var(--space-2); }
    .empty-state p { color: var(--color-text-secondary); margin-bottom: var(--space-6); }

    /* ── Creator Profile Links ── */
    .creator-name-link {
      text-decoration: none;
      color: inherit;
      transition: color var(--transition-fast);
      cursor: pointer;
    }
    .creator-name-link:hover h3 {
      color: var(--color-primary-400);
      text-decoration: underline;
    }

    .avatar-link {
      display: inline-block;
      cursor: pointer;
      transition: transform var(--transition-fast);
    }
    .avatar-link:hover {
      transform: scale(1.05);
    }

    /* ── Actions & Decline Buttons ── */
    .btn-decline {
      color: #f87171;
      border-color: rgba(239, 68, 68, 0.4);
      transition: all var(--transition-fast);
    }
    .btn-decline:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: #ef4444;
      color: #fff;
    }

    .declined-badge {
      display: inline-flex;
      align-items: center;
      padding: 8px 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: var(--color-text-muted);
      border-radius: var(--radius-md);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
    }

    .contract-btn {
      cursor: pointer;
      transition: all var(--transition-fast);
      background: #10b981;
      border: 1px solid #059669;
    }
    .contract-btn:hover {
      background: #059669;
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
    }

    /* ── Decline Modal Styles ── */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
    }

    .modal-card {
      position: relative;
      max-width: 480px;
      width: 100%;
      padding: var(--space-8);
      border-radius: var(--radius-2xl);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
      background: #131b34;
      border: 1px solid rgba(139, 92, 246, 0.35);
    }

    .modal-header-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-4);
    }

    .decline-icon-box {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .modal-card h2 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      margin: 0 0 var(--space-2);
      color: var(--color-text-primary);
    }

    .modal-sub {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: 0 0 var(--space-5);
      line-height: 1.5;
    }

    .decline-info-banner {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: var(--radius-md);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-6);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
    }

    .close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      background: transparent;
      border: none;
      color: var(--color-text-muted);
      font-size: 1.1rem;
      cursor: pointer;
    }
    .close-btn:hover { color: var(--color-text-primary); }

    .btn-danger {
      background: #ef4444;
      color: #fff;
      border: none;
      padding: 8px 18px;
      border-radius: var(--radius-md);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .btn-danger:hover {
      background: #dc2626;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
    }
  `]
})
export class JobProposalsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private proposalService = inject(ProposalService);
  private contractService = inject(ContractService);
  private jobService = inject(JobService);
  private notifService = inject(NotificationService);
  readonly auth = inject(AuthService);

  jobId: string = '';
  job = signal<Job | null>(null);
  proposals = signal<Proposal[]>([]);

  getCreatorAvatar(p: Proposal): string {
    const dedicated = this.auth.getDedicatedAvatar(p.creatorId);
    if (dedicated) return dedicated;
    const clean = this.auth.cleanAvatar(p.creatorAvatar);
    if (clean) return clean;
    return 'https://ui-avatars.com/api/?background=8b5cf6&color=fff&name=' + encodeURIComponent(p.creatorName || 'User');
  }

  getCreatorProfileId(creatorId?: string | number | null, creatorName?: string): string {
    if (creatorName) {
      const n = creatorName.toLowerCase().trim();
      if (n.includes('sondes')) return 'sondes';
      if (n.includes('sarah')) return 'cr-1';
      if (n.includes('mehdi')) return 'cr-2';
      if (n.includes('yassine')) return 'cr-3';
      if (n.includes('khalil')) return 'cr-4';
      if (n.includes('mariem')) return 'cr-5';
      if (n.includes('aziz')) return 'cr-6';
    }
    if (creatorId && String(creatorId).trim() !== '' && String(creatorId) !== 'null' && String(creatorId) !== 'undefined') {
      const cid = String(creatorId).toLowerCase().trim();
      if (cid.includes('sondes')) return 'sondes';
      return String(creatorId);
    }
    return 'sondes';
  }

  ngOnInit(): void {
    this.jobId = this.route.snapshot.params['id'] || 'jb-1';
    
    // Load job details
    this.jobService.getJobById(this.jobId).subscribe({
      next: (j) => this.job.set(j),
      error: () => {}
    });

    // Load proposals for this job
    this.loadProposals();
  }

  loadProposals(): void {
    this.proposalService.refresh();
    this.proposalService.getByJobId(this.jobId).subscribe({
      next: (res) => {
        if (res?.proposals?.length) {
          this.proposals.set(res.proposals);
        } else {
          // Fallback if newly created with no proposals yet, or default to general proposals
          this.proposals.set(this.proposalService.proposals().filter(p => p.jobId === this.jobId));
        }
      },
      error: () => {}
    });
  }

  showDeclineModal = signal<boolean>(false);
  selectedProposalForDecline = signal<Proposal | null>(null);

  openDeclineModal(p: Proposal): void {
    this.selectedProposalForDecline.set(p);
    this.showDeclineModal.set(true);
  }

  closeDeclineModal(): void {
    this.showDeclineModal.set(false);
    this.selectedProposalForDecline.set(null);
  }

  confirmDecline(): void {
    const p = this.selectedProposalForDecline();
    if (!p) return;

    this.proposalService.reject(p.id).subscribe(() => {
      this.proposals.update(list =>
        list.map(item => item.id === p.id ? { ...item, status: 'REJECTED' } : item)
      );

      if (p.creatorId) {
        this.notifService.notify({
          userId: p.creatorId,
          type: 'PROPOSAL_REJECTED',
          title: `Candidature non retenue pour "${this.job()?.title || p.jobTitle}"`,
          body: `Le client a décliné votre proposition. Merci pour votre candidature et à très bientôt sur SnapConnect !`,
          link: '/creator/proposals'
        });
      }

      this.closeDeclineModal();
    });
  }

  viewActiveContract(p: Proposal): void {
    const allContracts = this.contractService.refresh();
    const found = allContracts.find(c =>
      (c.jobId && c.jobId === this.jobId) ||
      (c.creatorId && p.creatorId && String(c.creatorId) === String(p.creatorId)) ||
      (c.creatorName && p.creatorName && c.creatorName.toLowerCase().trim() === p.creatorName.toLowerCase().trim())
    );
    if (found) {
      this.router.navigate(['/client/contracts', found.id]);
    } else {
      this.router.navigate(['/client/contracts']);
    }
  }

  openChat(p: Proposal): void {
    this.router.navigate(['/client/messages'], {
      queryParams: {
        creatorId: p.creatorId || null,
        creatorName: p.creatorName,
        creatorAvatar: p.creatorAvatar,
        contextType: 'JOB',
        contextId: this.jobId,
        contextTitle: this.job()?.title || p.jobTitle
      }
    });
  }

  hireCreator(p: Proposal): void {
    this.proposalService.accept(p.id).subscribe(() => {
      this.contractService.createFromProposal(p.id, {
        ...p,
        jobId: this.jobId,
        jobTitle: this.job()?.title || p.jobTitle
      }).subscribe({
        next: (contract) => {
          if (p.creatorId) {
            this.notifService.notify({
              userId: p.creatorId,
              type: 'PROPOSAL_ACCEPTED',
              title: `Candidature acceptée ! Embauché sur "${this.job()?.title || p.jobTitle}"`,
              body: `Félicitations ! Le client a accepté votre offre de ${p.bidAmount} DT. Le contrat est actif avec garantie séquestre.`,
              link: '/creator/contracts'
            });
          }
          this.router.navigate(['/client/contracts', contract.id]);
        },
        error: () => {
          this.router.navigate(['/client/contracts']);
        }
      });
    });
  }
}
