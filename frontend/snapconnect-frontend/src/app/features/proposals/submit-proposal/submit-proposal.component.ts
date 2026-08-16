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
          <h1>Submit Your <span class="gradient-title">Creator Bid</span></h1>
          <p>Brief: <strong>{{ job.title }}</strong> (\${{ job.budgetAmount }} {{ job.budgetType }})</p>
        </div>

        <div class="gear-reminder card-glass">
          <span>📱 Client Gear Requirement:</span>
          <strong>{{ job.requiredGear || 'Smartphone 4K Resolution' }}</strong>
        </div>

        <form (ngSubmit)="onSubmit()" class="proposal-form">
          <div class="form-group">
            <label>Confirm Your Smartphone Equipment</label>
            <input
              type="text"
              [(ngModel)]="creatorEquipment"
              name="creatorEquipment"
              required
              class="input-field"
              placeholder="e.g. iPhone 15 Pro Max + DJI Osmo Mobile 6 Gimbal" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Your Bid Amount ($)</label>
              <input
                type="number"
                [(ngModel)]="bidAmount"
                name="bidAmount"
                required
                class="input-field"
                placeholder="350" />
            </div>

            <div class="form-group">
              <label>Estimated Delivery (Days)</label>
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
            <label>Cover Letter / Pitch</label>
            <textarea
              [(ngModel)]="coverLetter"
              name="coverLetter"
              rows="6"
              required
              class="input-field textarea"
              placeholder="Explain how you will shoot this mobile brief, your phone setup, lighting techniques, and estimated delivery timeline...">
            </textarea>
          </div>

          <div class="form-actions">
            <a [routerLink]="['/jobs', job.id]" class="btn btn-outline">Cancel</a>
            <button type="submit" class="btn btn-primary" [disabled]="loading">
              {{ loading ? 'Submitting Bid...' : 'Submit Proposal' }}
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
      this.job = this.jobService.getJobById(jobId);
      if (this.job) {
        this.bidAmount = this.job.budgetAmount;
      }
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
