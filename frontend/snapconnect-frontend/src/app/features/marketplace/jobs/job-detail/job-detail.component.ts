import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { JobService } from '../../../../core/services/job.service';
import { ProposalService } from '../../../../core/services/proposal.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Job } from '../../../../core/models/job.model';
import { Proposal } from '../../../../core/models/proposal.model';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    @if (job(); as j) {
      <main class="job-detail-page">
        <div class="container">
          <div class="breadcrumb">
            <a routerLink="/jobs">Missions & Briefs</a>
            <span>/</span>
            <span class="curr">{{ j.categoryName }}</span>
          </div>

          <div class="job-layout">
            <!-- Left: Job Details -->
            <div class="job-main">
              <div class="job-card-main card-glass">
                <div class="badge-row">
                  <span class="badge badge-primary">{{ j.categoryName }}</span>
                  <span class="badge badge-success">● Active & Ouverte aux propositions</span>
                </div>

                <h1 class="job-title">{{ j.title }}</h1>

                <div class="meta-strip">
                  <div class="meta-item">
                    <span class="label">Budget</span>
                    <strong class="val">
                      {{ j.budgetType === 'HOURLY' ? j.budgetMin + ' - ' + j.budgetMax + ' DT/h' : j.budgetAmount + ' DT Prix Fixe' }}
                    </strong>
                  </div>
                  <div class="meta-item">
                    <span class="label">Localisation</span>
                    <strong class="val">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 3px;">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {{ j.isRemote ? 'À distance / En ligne' : j.location }}
                    </strong>
                  </div>
                  <div class="meta-item">
                    <span class="label">Propositions</span>
                    <strong class="val">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 3px;">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      {{ j.proposalsCount }} reçue(s)
                    </strong>
                  </div>
                </div>

                <div class="section-block">
                  <h3>Description du projet</h3>
                  <p class="desc-text">{{ j.description }}</p>
                </div>

                <!-- Required Smartphone Hardware -->
                <div class="section-block gear-box">
                  <h3>Équipement mobile requis</h3>
                  <p class="gear-desc">Le client exige que les créateurs utilisent l'équipement smartphone suivant :</p>
                  <div class="gear-pill">
                    <span>{{ j.requiredGear || 'iPhone 15/16 Pro Max avec capacité 4K 60fps' }}</span>
                  </div>
                </div>

                <!-- Required Skills -->
                <div class="section-block">
                  <h3>Compétences & Mots-clés</h3>
                  <div class="skills-list">
                    @for (skill of j.requiredSkills; track skill) {
                      <span class="badge badge-neutral">{{ skill }}</span>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Client Card & Apply Action -->
            <aside class="job-sidebar">
              @if (isJobOwner()) {
                <!-- Client Owner Management Card -->
                <div class="apply-card card-glass client-owner-card">
                  <div class="owner-status-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>Votre brief est en ligne</span>
                  </div>

                  <h3>Gérer ce brief</h3>
                  <p>Votre mission est active et consultable par les créateurs smartphone de SnapConnect.</p>

                  <a [routerLink]="['/client/jobs', j.id, 'proposals']" class="btn btn-primary btn-block btn-lg" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span>Consulter les propositions ({{ j.proposalsCount || 0 }})</span>
                  </a>

                  <a routerLink="/client/jobs" class="btn btn-outline btn-block" style="margin-top: 10px; display: block; text-align: center;">
                    Voir tous mes briefs
                  </a>

                  <div class="apply-footer">
                    <span>Statut : <strong style="color: #4ade80;">Ouvert aux candidatures</strong></span>
                  </div>
                </div>
              } @else if (auth.isClient()) {
                <!-- Other Client viewing this brief -->
                <div class="apply-card card-glass">
                  <h3>Mission d'entreprise</h3>
                  <p>Ce brief est publié par une entreprise partenaire. Vous cherchez également un créateur smartphone ?</p>
                  <a routerLink="/client/jobs/create" class="btn btn-primary btn-block">
                    + Publier votre mission
                  </a>
                  <a routerLink="/creators" class="btn btn-outline btn-block" style="margin-top: 10px; display: block; text-align: center;">
                    Explorer les créateurs
                  </a>
                </div>
              } @else if (existingProposal()) {
                <!-- Creator already submitted a proposal -->
                <div class="apply-card card-glass applied-card">
                  <div class="applied-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Proposition envoyée</span>
                  </div>

                  <h3>Candidature soumise</h3>
                  <p>Vous avez déjà déposé une proposition pour cette mission. Votre offre a été transmise au client.</p>

                  <div class="applied-summary">
                    <div class="summary-item">
                      <span class="lbl">Votre offre</span>
                      <strong class="val">{{ existingProposal()?.bidAmount }} DT</strong>
                    </div>
                    <div class="summary-item">
                      <span class="lbl">Délai</span>
                      <strong class="val">{{ existingProposal()?.deliveryDays }} j</strong>
                    </div>
                    <div class="summary-item">
                      <span class="lbl">Statut</span>
                      <strong class="val status-val">
                        {{ existingProposal()?.status === 'ACCEPTED' ? 'Acceptée' : existingProposal()?.status === 'REJECTED' ? 'Déclinée' : 'En attente' }}
                      </strong>
                    </div>
                  </div>

                  <a routerLink="/creator/proposals" class="btn btn-outline btn-block" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                    <span>Consulter mes propositions</span>
                  </a>

                  <div class="apply-footer">
                    <span>Soumise le <strong>{{ existingProposal()?.createdAt }}</strong></span>
                  </div>
                </div>
              } @else {
                <!-- Creator / Visitor Apply Card -->
                <div class="apply-card card-glass">
                  <h3>Intéressé par ce projet ?</h3>
                  <p>Déposez une proposition avec vos spécifications matérielles et vos liens de portfolio.</p>

                  <button (click)="openProposalModal.set(true)" class="btn btn-primary btn-block btn-lg">
                    Soumettre une proposition
                  </button>

                  <div class="apply-footer">
                    <span>Délai moyen de réponse : <strong>24 heures</strong></span>
                  </div>
                </div>
              }

              <!-- Client Info Card -->
              <div class="client-card card-glass">
                <h4>À propos du client</h4>
                <div class="client-name-rating">
                  <strong>{{ j.clientName }}</strong>
                  <span class="rating">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="1" style="vertical-align: -1px; margin-right: 2px;">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    {{ j.clientRating || 5.0 }} (12 avis)
                  </span>
                </div>
                <div class="client-stat-list">
                  <div class="c-stat">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px;">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {{ j.location }}
                  </div>
                  <div class="c-stat">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px;">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    8 missions publiées
                  </div>
                  <div class="c-stat">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px;">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Moyen de paiement vérifié
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <!-- Proposal Submission Modal -->
      @if (openProposalModal()) {
        <div class="modal-backdrop" (click)="openProposalModal.set(false)">
          <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
            <button class="close-btn" (click)="openProposalModal.set(false)">✕</button>

            <h2>Soumettre une proposition pour ce projet</h2>
            <p class="modal-sub">Expliquez au client pourquoi votre équipement mobile et votre style sont idéaux pour cette mission.</p>

            <form (ngSubmit)="submitProposal()" class="proposal-form">
              <div class="form-group">
                <label class="form-label">Votre Devis / Tarif (DT)</label>
                <input type="number" [(ngModel)]="proposalBid" name="bid" class="form-input" placeholder="ex. 250" required />
              </div>

              <div class="form-group">
                <label class="form-label">Délai de livraison (Jours)</label>
                <input type="number" [(ngModel)]="proposalDays" name="days" class="form-input" placeholder="ex. 2" required />
              </div>

              <div class="form-group">
                <label class="form-label">Votre smartphone & équipement de tournage</label>
                <input type="text" [(ngModel)]="proposalGear" name="gear" class="form-input" placeholder="ex. iPhone 16 Pro Max + DJI OM 6 + Rode Wireless Pro" required />
              </div>

              <div class="form-group">
                <label class="form-label">Lettre de motivation / Présentation</label>
                <textarea [(ngModel)]="proposalCover" name="cover" class="form-textarea" placeholder="Décrivez votre expérience avec des tournages similaires..." rows="4" required></textarea>
              </div>

              <div class="modal-actions">
                <button type="button" (click)="openProposalModal.set(false)" class="btn btn-outline">Annuler</button>
                <button type="submit" class="btn btn-primary" [disabled]="proposalSubmitting()">
                  {{ proposalSubmitting() ? 'Envoi en cours...' : 'Envoyer la proposition' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    }

    <app-footer></app-footer>

    <!-- Toast notification -->
    @if (proposalSuccess()) {
      <div class="toast toast-success">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>Proposition envoyée avec succès ! Redirection en cours...</span>
      </div>
    }
    @if (proposalError()) {
      <div class="toast toast-error">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>Erreur lors de la soumission. Veuillez réessayer.</span>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 1rem 1.4rem;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 8px 32px rgba(0,0,0,0.35);
      animation: slideInToast 0.35s cubic-bezier(.21,1.02,.73,1) forwards;
    }
    .toast-success {
      background: linear-gradient(135deg, rgba(34,197,94,0.18), rgba(16,185,129,0.12));
      border: 1px solid rgba(34,197,94,0.5);
      color: #4ade80;
    }
    .toast-error {
      background: linear-gradient(135deg, rgba(239,68,68,0.18), rgba(220,38,38,0.12));
      border: 1px solid rgba(239,68,68,0.5);
      color: #f87171;
    }
    @keyframes slideInToast {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0)   scale(1);    }
    }

    .job-detail-page {
      padding-top: calc(var(--navbar-height) + var(--space-6));
      padding-bottom: var(--space-20);
    }

    .breadcrumb {
      display: flex;
      gap: var(--space-2);
      align-items: center;
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-bottom: var(--space-4);
    }

    .breadcrumb a {
      color: var(--color-text-secondary);
      text-decoration: none;
    }

    .breadcrumb .curr {
      color: var(--color-primary-400);
    }

    .job-layout {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--space-8);
      align-items: start;
    }

    .job-card-main {
      padding: var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .badge-row {
      display: flex;
      gap: var(--space-2);
    }

    .job-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-extrabold);
      line-height: var(--line-height-tight);
      margin: 0;
    }

    .meta-strip {
      display: flex;
      gap: var(--space-8);
      padding: var(--space-4);
      background: rgba(15, 23, 42, 0.6);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .meta-item .label {
      font-size: 11px;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
    }

    .meta-item .val {
      font-size: var(--font-size-base);
      color: var(--color-text-primary);
    }

    .section-block h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-3);
    }

    .desc-text {
      color: var(--color-text-secondary);
      line-height: var(--line-height-relaxed);
      font-size: var(--font-size-base);
    }

    .gear-box {
      padding: var(--space-5);
      background: rgba(139, 92, 246, 0.08);
      border: 1px dashed rgba(139, 92, 246, 0.4);
      border-radius: var(--radius-lg);
    }

    .gear-desc {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-bottom: var(--space-3);
    }

    .gear-pill {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
      color: var(--color-accent-300);
    }

    .skills-list {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    /* Sidebar */
    .job-sidebar {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      position: sticky;
      top: calc(var(--navbar-height) + var(--space-6));
    }

    .owner-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.35);
      border-radius: var(--radius-full);
      color: #4ade80;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      margin-bottom: var(--space-4);
    }

    .client-owner-card {
      border: 1px solid rgba(34, 197, 94, 0.25);
      box-shadow: 0 0 24px rgba(34, 197, 94, 0.08);
    }

    .applied-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.35);
      border-radius: var(--radius-full);
      color: #4ade80;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      margin-bottom: var(--space-4);
    }

    .applied-card {
      border: 1px solid rgba(34, 197, 94, 0.3);
      box-shadow: 0 0 24px rgba(34, 197, 94, 0.08);
    }

    .applied-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-2);
      padding: var(--space-3);
      border-radius: var(--radius-lg);
      background: rgba(15, 23, 42, 0.6);
      margin-bottom: var(--space-4);
      border: 1px solid var(--color-border);
      text-align: center;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .summary-item .lbl {
      font-size: 10px;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
    }

    .summary-item .val {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      font-weight: var(--font-weight-bold);
    }

    .summary-item .status-val {
      color: #4ade80;
    }

    .apply-card, .client-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
    }

    .apply-card h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-2);
    }

    .apply-card p {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-5);
    }

    .apply-footer {
      margin-top: var(--space-4);
      text-align: center;
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .client-card h4 {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-3);
    }

    .client-name-rating {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);
    }

    .client-name-rating .rating {
      font-size: var(--font-size-xs);
      color: var(--color-gold-400);
      font-weight: var(--font-weight-bold);
    }

    .client-stat-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: var(--z-modal);
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
    }

    .modal-card {
      position: relative;
      max-width: 520px;
      width: 100%;
      padding: var(--space-8);
      border-radius: var(--radius-2xl);
    }

    .close-btn {
      position: absolute;
      top: var(--space-4);
      right: var(--space-4);
      background: none;
      border: none;
      color: var(--color-text-muted);
      font-size: 1.2rem;
      cursor: pointer;
    }

    .modal-card h2 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-1);
    }

    .modal-sub {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-5);
    }

    .proposal-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      margin-top: var(--space-4);
    }

    @media (max-width: 900px) {
      .job-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class JobDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jobService = inject(JobService);
  private proposalService = inject(ProposalService);
  private notifService = inject(NotificationService);
  public auth = inject(AuthService);

  job = signal<Job | null>(null);
  existingProposal = signal<Proposal | null>(null);
  openProposalModal = signal(false);
  proposalSubmitting = signal(false);
  proposalSuccess = signal(false);
  proposalError = signal(false);

  private redirectTimeout: any = null;

  proposalBid = 250;
  proposalDays = 2;
  proposalGear = 'iPhone 16 Pro Max + DJI OM 6 + Rode Wireless Pro';
  proposalCover = 'Bonjour ! Je suis spécialisé dans les tournages mobiles professionnels 4K ProRes sur iPhone 16 Pro Max. Je peux livrer tous les médias et montages sous 48 heures !';

  isJobOwner(): boolean {
    const user = this.auth.currentUser();
    const currentJob = this.job();
    if (!user || !currentJob) return false;
    if (!this.auth.isClient()) return false;
    return (
      currentJob.clientId === String(user.id) ||
      currentJob.clientName === user.fullName ||
      currentJob.clientId === 'cl-current'
    );
  }

  ngOnInit(): void {
    const jbId = this.route.snapshot.params['id'];
    if (jbId) {
      this.jobService.getJobById(jbId).subscribe({
        next: (j) => {
          this.job.set(j);
          if (j?.budgetAmount) {
            this.proposalBid = j.budgetAmount;
          } else if (j?.budgetMin) {
            this.proposalBid = j.budgetMin;
          }
          if (j) {
            this.checkExistingProposal(j.id);
          }
        },
        error: () => {}
      });
    }
  }

  ngOnDestroy(): void {
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }
  }

  checkExistingProposal(jobId: string | number): void {
    const user = this.auth.currentUser();
    if (!user) {
      this.existingProposal.set(null);
      return;
    }

    const found = this.proposalService.getProposalForJobAndCreator(jobId, user);
    if (found) {
      this.existingProposal.set(found);
      return;
    }

    // Actualisation depuis le stockage pour garantir la persistance après refresh
    this.proposalService.refresh();
    const fresh = this.proposalService.getProposalForJobAndCreator(jobId, user);
    this.existingProposal.set(fresh || null);
  }

  submitProposal(): void {
    if (this.auth.isClient()) return;
    const currentJob = this.job();
    if (!currentJob) return;
    if (this.proposalSubmitting()) return;

    // Garde-fou strict anti-doublon : Si le créateur a déjà postulé, interdire toute nouvelle soumission
    const user = this.auth.currentUser();
    if (this.existingProposal() || this.proposalService.hasCreatorApplied(currentJob.id, user)) {
      this.openProposalModal.set(false);
      this.proposalError.set(true);
      setTimeout(() => this.proposalError.set(false), 4000);
      return;
    }

    this.proposalSubmitting.set(true);
    this.proposalError.set(false);

    this.proposalService.submitProposal({
      jobId: currentJob.id,
      jobTitle: currentJob.title,
      bidAmount: this.proposalBid,
      deliveryDays: this.proposalDays,
      equipmentConfirmed: this.proposalGear,
      creatorEquipment: this.proposalGear,
      coverLetter: this.proposalCover
    }).subscribe({
      next: (newProp) => {
        this.proposalSubmitting.set(false);
        this.existingProposal.set(newProp);

        // 1. Fermer la modal proprement
        this.openProposalModal.set(false);

        // 2. Afficher le toast de succès
        this.proposalSuccess.set(true);

        // 3. Mettre à jour le compteur local de propositions sur la mission
        const cur = this.job();
        if (cur) {
          this.job.set({ ...cur, proposalsCount: (cur.proposalsCount || 0) + 1 });
        }

        // 4. Envoyer les notifications
        const currentUser = this.auth.currentUser();
        if (currentUser?.id) {
          this.notifService.notify({
            userId: currentUser.id,
            type: 'NEW_PROPOSAL',
            title: `Proposition envoyée pour "${currentJob.title}"`,
            body: `Votre offre de ${this.proposalBid} DT pour un délai de ${this.proposalDays} jours a été transmise.`,
            link: '/creator/proposals'
          });
        }
        if (currentJob.clientId) {
          this.notifService.notify({
            userId: currentJob.clientId,
            type: 'NEW_PROPOSAL',
            title: `Nouvelle proposition reçue pour "${currentJob.title}"`,
            body: `Un créateur smartphone a postulé avec une offre de ${this.proposalBid} DT.`,
            link: `/client/jobs/${currentJob.id}/proposals`
          });
        }

        // 5. Naviguer après 2 secondes pour laisser le toast s'afficher
        this.redirectTimeout = setTimeout(() => {
          this.proposalSuccess.set(false);
          this.router.navigate(['/creator/proposals']);
        }, 2000);
      },
      error: () => {
        this.proposalSubmitting.set(false);
        this.proposalError.set(true);
        // Masquer le toast d'erreur après 4 secondes
        setTimeout(() => this.proposalError.set(false), 4000);
      }
    });
  }
}
