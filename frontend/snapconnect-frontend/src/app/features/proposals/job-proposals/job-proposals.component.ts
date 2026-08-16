import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProposalService } from '../../../core/services/proposal.service';
import { Proposal } from '../../../core/models/proposal.model';
import { RatingStarsComponent } from '../../../shared/components/rating-stars/rating-stars.component';

@Component({
  selector: 'app-job-proposals',
  standalone: true,
  imports: [CommonModule, RatingStarsComponent],
  template: `
    <div class="proposals-page">
      <div class="header">
        <h1>Received <span class="gradient-title">Creator Proposals</span></h1>
        <p>Compare bids, smartphone equipment specs, and cover letters from applicants.</p>
      </div>

      <div class="proposals-list">
        <div class="proposal-card card-glass" *ngFor="let prop of proposals">
          <div class="prop-top">
            <div class="creator-info">
              <img [src]="prop.creatorAvatar" [alt]="prop.creatorName" class="avatar" />
              <div>
                <h3>{{ prop.creatorName }}</h3>
                <app-rating-stars [rating]="prop.creatorRating"></app-rating-stars>
              </div>
            </div>

            <div class="bid-badge">
              <span class="price">\${{ prop.bidAmount }}</span>
              <span class="days">in {{ prop.estimatedDays }} days</span>
            </div>
          </div>

          <div class="gear-box">
            <span class="lbl">📱 Smartphone Setup:</span>
            <strong class="val">{{ prop.creatorEquipment }}</strong>
          </div>

          <p class="cover-letter">{{ prop.coverLetter }}</p>

          <div class="prop-actions">
            <span class="status-badge" [class.accepted]="prop.status === 'ACCEPTED'">
              Status: {{ prop.status }}
            </span>

            <div class="btn-group" *ngIf="prop.status === 'PENDING'">
              <button class="btn btn-sm btn-primary" (click)="accept(prop.id)">
                ✓ Hire Creator & Accept Bid
              </button>
            </div>
          </div>
        </div>

        <div class="empty card-glass" *ngIf="proposals.length === 0">
          <h3>No proposals received yet</h3>
          <p>Creators are currently reviewing your job brief specifications.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .proposals-page {
      max-width: 950px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
      h1 { font-size: 2rem; font-weight: 800; }
      p { font-size: 0.95rem; color: $text-muted; margin-top: 0.25rem; }
    }

    .proposals-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .proposal-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .prop-top {
        @include flex-between;

        .creator-info {
          display: flex;
          gap: 1rem;
          align-items: center;

          .avatar { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; }
          h3 { font-size: 1.1rem; font-weight: 700; }
        }

        .bid-badge {
          text-align: right;
          .price { font-size: 1.5rem; font-weight: 800; color: #4ade80; display: block; }
          .days { font-size: 0.8rem; color: $text-muted; }
        }
      }

      .gear-box {
        background: rgba(139, 92, 246, 0.08);
        border: 1px solid rgba(139, 92, 246, 0.2);
        padding: 0.5rem 0.85rem;
        border-radius: $radius-sm;
        font-size: 0.85rem;

        .lbl { color: $text-muted; margin-right: 0.5rem; }
        .val { color: #c084fc; }
      }

      .cover-letter {
        font-size: 0.9rem;
        color: $text-muted;
        line-height: 1.6;
      }

      .prop-actions {
        padding-top: 0.75rem;
        border-top: 1px solid $border-color;
        @include flex-between;

        .status-badge {
          font-size: 0.8rem;
          font-weight: 700;
          color: $text-muted;
          &.accepted { color: #4ade80; }
        }
      }
    }

    .empty {
      text-align: center;
      padding: 3rem;
      color: $text-muted;
      h3 { font-size: 1.2rem; color: white; margin-bottom: 0.5rem; }
    }
  `]
})
export class JobProposalsComponent implements OnInit {
  proposals: Proposal[] = [];

  constructor(private proposalService: ProposalService) {}

  ngOnInit(): void {
    this.proposals = this.proposalService.proposals();
  }

  accept(id: string): void {
    this.proposalService.acceptProposal(id);
    this.proposals = [...this.proposalService.proposals()];
  }
}
