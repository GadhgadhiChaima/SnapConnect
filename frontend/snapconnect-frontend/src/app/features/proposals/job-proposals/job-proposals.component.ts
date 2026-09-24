import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProposalService } from '../../../core/services/proposal.service';
import { Proposal } from '../../../core/models/proposal.model';
import { RatingStarsComponent } from '../../../shared/components/rating-stars/rating-stars.component';

@Component({
  selector: 'app-job-proposals',
  standalone: true,
  imports: [CommonModule, RouterLink, RatingStarsComponent],
  template: `
    <div class="proposals-page">
      <div class="header">
        <h1>Propositions reçues des <span class="gradient-title">Créateurs</span></h1>
        <p>Comparez les offres, spécifications d'équipements smartphone et lettres de motivation des candidats.</p>
      </div>

      <div class="proposals-list">
        <div class="proposal-card card-glass" *ngFor="let prop of proposals">
          <div class="prop-top">
            <div class="creator-info">
              <a [routerLink]="['/creators', prop.creatorId || 'cr-1']" class="avatar-link" title="Voir le profil du créateur">
                <img [src]="prop.creatorAvatar" [alt]="prop.creatorName" class="avatar" />
              </a>
              <div>
                <a [routerLink]="['/creators', prop.creatorId || 'cr-1']" class="creator-name-link" title="Voir le profil du créateur">
                  <h3>{{ prop.creatorName }}</h3>
                </a>
                <app-rating-stars [rating]="prop.creatorRating"></app-rating-stars>
              </div>
            </div>

            <div class="bid-badge">
              <span class="price">{{ prop.bidAmount }} DT</span>
              <span class="days">en {{ prop.estimatedDays }} jours</span>
            </div>
          </div>

          <div class="gear-box">
            <span class="lbl">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
              Équipement smartphone :
            </span>
            <strong class="val">{{ prop.creatorEquipment }}</strong>
          </div>

          <p class="cover-letter">{{ prop.coverLetter }}</p>

          <div class="prop-actions">
            <span class="status-badge" [class.accepted]="prop.status === 'ACCEPTED'">
              Statut : {{ prop.status === 'ACCEPTED' ? 'Acceptée' : prop.status === 'PENDING' ? 'En attente' : prop.status }}
            </span>

            <div class="btn-group" *ngIf="prop.status === 'PENDING'">
              <button class="btn btn-sm btn-primary" (click)="accept(prop.id)">
                Recruter ce créateur & Valider l'offre
              </button>
            </div>
          </div>
        </div>

        <div class="empty card-glass" *ngIf="proposals.length === 0">
          <h3>Aucune proposition reçue pour le moment</h3>
          <p>Les créateurs examinent actuellement votre cahier des charges.</p>
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

          .avatar-link { display: inline-block; text-decoration: none; cursor: pointer; transition: transform 0.2s ease; }
          .avatar-link:hover { transform: scale(1.08); }
          .avatar { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #8b5cf6; }
          .creator-name-link { text-decoration: none; color: inherit; cursor: pointer; }
          .creator-name-link:hover h3 { color: #c084fc; text-decoration: underline; text-underline-offset: 3px; }
          h3 { font-size: 1.1rem; font-weight: 700; margin: 0; }
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
    this.proposalService.acceptProposal(id).subscribe({
      next: () => {
        this.proposals = [...this.proposalService.proposals()];
      },
      error: () => {}
    });
  }
}
