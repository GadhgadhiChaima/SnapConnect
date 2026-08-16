import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { RatingStarsComponent } from '../../../../shared/components/rating-stars/rating-stars.component';
import { CreatorBadgeComponent } from '../../../../shared/components/creator-badge/creator-badge.component';
import { Proposal } from '../../../../core/models/proposal.model';

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
            <a routerLink="/client/jobs" class="back-link">← Back to My Jobs</a>
            <h1>Proposals for: 5 Aesthetic Unboxing Reels</h1>
            <p>Compare creator bids, smartphone setups, ratings, and hire with 100% Escrow Protection.</p>
          </div>
          <div class="job-pill card-glass">
            <span class="lbl">Job Budget:</span>
            <strong>$250 USD (Fixed)</strong>
          </div>
        </div>

        <!-- Proposals List -->
        <div class="proposals-list">
          @for (p of proposals(); track p.id) {
            <div class="proposal-card card-glass animate-fade-in">
              <div class="proposal-header flex-between">
                <div class="creator-info-row">
                  <img [src]="p.creatorAvatar" [alt]="p.creatorName" class="avatar avatar-lg avatar-ring" />
                  <div>
                    <div class="name-badge-row">
                      <h3>{{ p.creatorName }}</h3>
                      <app-creator-badge [type]="'VERIFIED_CREATOR'"></app-creator-badge>
                    </div>
                    <app-rating-stars [rating]="p.creatorRating || 4.9" [reviewsCount]="38"></app-rating-stars>
                  </div>
                </div>

                <div class="bid-col">
                  <span class="bid-amount">\${{ p.bidAmount }} USD</span>
                  <span class="bid-delivery">⏱️ Delivery in {{ p.deliveryDays }} days</span>
                </div>
              </div>

              <!-- Smartphone equipment highlighted -->
              <div class="gear-banner">
                <span class="gear-icon">📱</span>
                <div>
                  <span class="gear-title">Proposed Mobile Hardware:</span>
                  <strong>{{ p.equipmentConfirmed || 'iPhone 16 Pro Max • DJI Osmo Mobile 6 • Rode Wireless Pro' }}</strong>
                </div>
              </div>

              <!-- Cover letter -->
              <div class="cover-letter">
                <h4>Cover Letter:</h4>
                <p>{{ p.coverLetter }}</p>
              </div>

              <!-- Footer Actions -->
              <div class="proposal-footer flex-between">
                <a [routerLink]="['/creators', p.creatorId]" class="btn btn-outline btn-sm">
                  View Full Mobile Portfolio 🖼️
                </a>

                <div class="action-buttons">
                  <button (click)="openChat(p.creatorName || 'Creator')" class="btn btn-outline btn-sm">
                    💬 Message Creator
                  </button>
                  <button (click)="hireCreator(p)" class="btn btn-primary btn-md">
                    🔒 Hire & Lock \${{ p.bidAmount }} in Escrow
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
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
  `]
})
export class JobProposalsComponent implements OnInit {
  private route = inject(ActivatedRoute);

  proposals = signal<Proposal[]>([
    {
      id: 'prop-1',
      jobId: 'jb-1',
      creatorId: 'cr-1',
      creatorName: 'Sarah Jenkins',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      creatorRating: 4.95,
      bidAmount: 250,
      deliveryDays: 2,
      coverLetter: 'Hi Bloom Cosmetics! I specialize in viral beauty unboxings shot natively on iPhone 16 Pro Max in 4K ProRes Log. I use dynamic gimbal movements and studio softboxes to make texture macros pop. I can deliver all 5 clips within 48h!',
      equipmentConfirmed: 'iPhone 16 Pro Max • DJI OM 6 • Rode Wireless Pro (32-bit float)',
      status: 'SUBMITTED',
      createdAt: '2026-08-12'
    },
    {
      id: 'prop-2',
      jobId: 'jb-1',
      creatorId: 'cr-2',
      creatorName: 'Marc Dupont',
      creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      creatorRating: 5.0,
      bidAmount: 220,
      deliveryDays: 3,
      coverLetter: 'Hello! I have created over 30 skincare reels on Galaxy S24 Ultra with macro lenses. I provide timestamped edits and captions. Ready to shoot this weekend!',
      equipmentConfirmed: 'Samsung Galaxy S24 Ultra • Zhiyun Smooth 5S • DJI Mic 2',
      status: 'SUBMITTED',
      createdAt: '2026-08-13'
    }
  ]);

  ngOnInit(): void {}

  openChat(name: string): void {
    alert(`Opening direct conversation with ${name}!`);
  }

  hireCreator(p: Proposal): void {
    if (confirm(`Hire ${p.creatorName} for $${p.bidAmount}? This will lock $${p.bidAmount} in Escrow.`)) {
      alert(`Contract created with ${p.creatorName}! Escrow funded. Redirecting to contract room...`);
    }
  }
}
