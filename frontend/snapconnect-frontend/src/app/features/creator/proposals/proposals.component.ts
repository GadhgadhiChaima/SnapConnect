import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ProposalService } from '../../../core/services/proposal.service';
import { ContractService } from '../../../core/services/contract.service';
import { Proposal } from '../../../core/models/proposal.model';

@Component({
  selector: 'app-creator-proposals',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="proposals-page">
      <div class="container">
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-primary">Studio Createur</span>
            <h1>Mes propositions envoyees</h1>
            <p>Suivez vos propositions sur les briefs clients, leur statut d acceptation et vos echanges.</p>
          </div>
          <a routerLink="/jobs" class="btn btn-primary btn-md">+ Trouver des missions clients</a>
        </div>
        @if (proposals().length > 0) {
          <div class="proposals-list">
            @for (p of proposals(); track p.id) {
              <div class="proposal-card card-glass animate-fade-in">
                <div class="card-head flex-between">
                  <div>
                    <span class="badge" [class]="getStatusClass(p.status)">{{ getStatusLabel(p.status) }}</span>
                    <h3 class="job-title">{{ p.jobTitle || "Brief Tournage Mobile" }}</h3>
                  </div>
                  <div class="bid-pill">
                    <span class="lbl">Votre Proposition :</span>
                    <strong>{{ p.bidAmount }} DT</strong>
                  </div>
                </div>
                <div class="gear-strip">
                  <span>Materiel : <strong>{{ p.equipmentConfirmed }}</strong></span>
                  <span class="dot">*</span>
                  <span>Delai : <strong>{{ p.deliveryDays }} jours</strong></span>
                </div>
                <p class="cover-letter-preview">"{{ p.coverLetter }}"</p>
                <div class="card-footer flex-between">
                  <span class="date">Envoyee le : {{ p.createdAt }}</span>
                  <div class="footer-actions">
                    <a [routerLink]="['/jobs', p.jobId]" class="btn btn-outline btn-xs">Voir le brief</a>
                    @if (p.status === "ACCEPTED") {
                      <button (click)="goToContract(p)" class="btn btn-primary btn-xs">
                        Acceder au contrat
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state card-glass animate-scale-in">
            <h3>Aucune proposition envoyee pour le moment</h3>
            <p>Explorez les missions ouvertes et deposez votre premiere proposition !</p>
            <a routerLink="/jobs" class="btn btn-primary btn-sm">Explorer les missions</a>
          </div>
        }
      </div>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }
    .proposals-page { padding-top: calc(var(--navbar-height) + var(--space-8)); padding-bottom: var(--space-20); }
    .page-header { margin-bottom: var(--space-8); flex-wrap: wrap; gap: var(--space-4); }
    .page-header h1 { font-size: var(--font-size-3xl); font-weight: var(--font-weight-black); margin: var(--space-2) 0; }
    .page-header p { color: var(--color-text-secondary); font-size: var(--font-size-base); }
    .proposals-list { display: flex; flex-direction: column; gap: var(--space-5); }
    .proposal-card { padding: var(--space-6) var(--space-8); border-radius: var(--radius-2xl); display: flex; flex-direction: column; gap: var(--space-4); }
    .job-title { font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); margin: var(--space-1) 0 0; }
    .bid-pill { text-align: right; }
    .bid-pill .lbl { font-size: 10px; text-transform: uppercase; color: var(--color-text-muted); display: block; }
    .bid-pill strong { font-size: var(--font-size-xl); font-weight: var(--font-weight-black); color: var(--color-success); }
    .gear-strip { display: flex; align-items: center; gap: var(--space-3); font-size: var(--font-size-xs); color: var(--color-text-secondary); flex-wrap: wrap; }
    .gear-strip strong { color: var(--color-primary-300); }
    .dot { color: var(--color-text-muted); }
    .cover-letter-preview { font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: var(--line-height-relaxed); margin: 0; font-style: italic; }
    .card-footer { padding-top: var(--space-3); border-top: 1px solid var(--color-border-subtle); flex-wrap: wrap; gap: var(--space-2); }
    .date { font-size: 11px; color: var(--color-text-muted); }
    .footer-actions { display: flex; gap: var(--space-2); }
    .empty-state { text-align: center; padding: var(--space-12) var(--space-6); border-radius: var(--radius-2xl); }
    .empty-state h3 { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); margin-bottom: var(--space-2); }
    .empty-state p { color: var(--color-text-secondary); margin-bottom: var(--space-6); }
  `]
})
export class CreatorProposalsComponent {
  private proposalService = inject(ProposalService);
  private contractService = inject(ContractService);
  private router = inject(Router);

  proposals = this.proposalService.proposals;

  findContractId(p: Proposal): string | null {
    const contracts = this.contractService.refresh();

    // 1. Par proposalId exact
    let found = contracts.find(c => c.proposalId && String(c.proposalId) === String(p.id));
    if (found) return found.id;

    // 2. Par jobId
    if (p.jobId) {
      found = contracts.find(c => c.jobId && String(c.jobId).trim() === String(p.jobId).trim());
      if (found) return found.id;
    }

    // 3. Par creatorId + montant
    if (p.creatorId) {
      found = contracts.find(c =>
        String(c.creatorId).trim() === String(p.creatorId).trim() && c.amount === p.bidAmount
      );
      if (found) return found.id;
    }

    // 4. Par creatorId seul
    if (p.creatorId) {
      found = contracts.find(c => String(c.creatorId).trim() === String(p.creatorId).trim());
      if (found) return found.id;
    }

    return null;
  }

  goToContract(p: Proposal): void {
    const contractId = this.findContractId(p);
    if (contractId) {
      this.router.navigate(['/creator/contracts', contractId]);
      return;
    }
    // Contrat pas en cache local, rediriger vers la liste
    this.router.navigate(['/creator/contracts']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACCEPTED': return 'badge-success';
      case 'SUBMITTED': return 'badge-primary';
      case 'REJECTED': return 'badge-danger';
      default: return 'badge-neutral';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACCEPTED': return 'Acceptee';
      case 'SUBMITTED': return 'En attente';
      case 'REJECTED': return 'Refusee';
      default: return status;
    }
  }
}
