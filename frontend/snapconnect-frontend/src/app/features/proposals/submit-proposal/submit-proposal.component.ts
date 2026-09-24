import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { ProposalService } from '../../../core/services/proposal.service';
import { Job } from '../../../core/models/job.model';

@Component({
  selector: 'app-submit-proposal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="submit-proposal-page" *ngIf="job">
      <div class="proposal-card card-glass">
        <div class="header">
          <h1>Déposer votre <span class="gradient-title">Proposition</span></h1>
          <p>Mission : <strong>{{ job.title }}</strong> ({{ job.budgetAmount }} DT {{ job.budgetType === 'HOURLY' ? '/h' : 'Fixe' }})</p>
        </div>

        <div class="gear-reminder card-glass">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
          <span>Équipement requis par le client :</span>
          <strong>{{ job.requiredGear || 'Smartphone Résolution 4K' }}</strong>
        </div>

        <form (ngSubmit)="onSubmit()" class="proposal-form">
          <div class="form-group">
            <label>Confirmez votre équipement smartphone</label>
            <input
              type="text"
              [(ngModel)]="creatorEquipment"
              name="creatorEquipment"
              required
              class="input-field"
              placeholder="ex. iPhone 16 Pro Max + DJI Osmo Mobile 6" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Votre Devis / Tarif (DT)</label>
              <input
                type="number"
                [(ngModel)]="bidAmount"
                name="bidAmount"
                required
                class="input-field"
                placeholder="250" />
            </div>

            <div class="form-group">
              <label>Délai de livraison estimé (Jours)</label>
              <input
                type="number"
                [(ngModel)]="estimatedDays"
                name="estimatedDays"
                required
                class="input-field"
                placeholder="2" />
            </div>
          </div>

          <div class="form-group">
            <label>Lettre de présentation / Pitch</label>
            <textarea
              [(ngModel)]="coverLetter"
              name="coverLetter"
              rows="6"
              required
              class="input-field textarea"
              placeholder="Expliquez votre méthode de tournage mobile, votre smartphone, éclairage et planning de livraison...">
            </textarea>
          </div>

          <div class="form-actions">
            <a [routerLink]="['/jobs', job.id]" class="btn btn-outline">Annuler</a>
            <button type="submit" class="btn btn-primary" [disabled]="loading">
              {{ loading ? 'Envoi en cours...' : 'Envoyer ma proposition' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .submit-proposal-page {
      max-width: 750px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }

    .proposal-card {
      padding: 2.5rem;
    }

    .header {
      margin-bottom: 1.5rem;
      h1 { font-size: 1.8rem; font-weight: 800; }
      p { font-size: 0.95rem; color: $text-muted; margin-top: 0.25rem; }
    }

    .gear-reminder {
      margin-bottom: 1.5rem;
      padding: 0.85rem 1rem;
      font-size: 0.85rem;
      display: flex;
      gap: 0.5rem;
      align-items: center;
      background: rgba(139, 92, 246, 0.1);
      border-color: rgba(139, 92, 246, 0.3);
      span { color: $text-muted; }
      strong { color: #c084fc; }
    }

    .proposal-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        label { font-size: 0.85rem; font-weight: 600; color: $text-muted; }
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .textarea { resize: vertical; }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1rem;
      }
    }
  `]
})
export class SubmitProposalComponent implements OnInit {
  job?: Job;
  creatorEquipment = 'iPhone 15 Pro Max + DJI Osmo Mobile 6';
  bidAmount = 350;
  estimatedDays = 2;
  coverLetter = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private proposalService: ProposalService
  ) {}

  ngOnInit(): void {
    const jobId = this.route.snapshot.paramMap.get('jobId');
    if (jobId) {
      this.jobService.getJobById(jobId).subscribe({
        next: (j) => {
          this.job = j;
          if (j?.budgetAmount) {
            this.bidAmount = j.budgetAmount;
          }
        },
        error: () => {}
      });
    }
  }

  onSubmit(): void {
    if (!this.job || !this.coverLetter) return;
    this.loading = true;

    this.proposalService.submitProposal({
      jobId: this.job.id,
      jobTitle: this.job.title,
      creatorEquipment: this.creatorEquipment,
      bidAmount: this.bidAmount,
      estimatedDays: this.estimatedDays,
      coverLetter: this.coverLetter
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
