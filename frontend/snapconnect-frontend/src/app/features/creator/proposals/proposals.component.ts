import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { Proposal } from '../../../core/models/proposal.model';

@Component({
  selector: 'app-creator-proposals',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="proposals-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-primary">Creator Studio</span>
            <h1>My Submitted Proposals</h1>
            <p>Track your custom bids on client briefs, acceptance status, and invited discussions.</p>
          </div>
          <a routerLink="/jobs" class="btn btn-primary btn-md">
            + Find New Client Briefs
          </a>
        </div>

        <!-- Proposals List -->
        <div class="proposals-list">
          @for (p of proposals(); track p.id) {
            <div class="proposal-card card-glass animate-fade-in">
              <div class="card-head flex-between">
                <div>
                  <span class="badge" [class]="getStatusClass(p.status)">● {{ p.status }}</span>
                  <h3 class="job-title">{{ p.jobTitle }}</h3>
                </div>
                <div class="bid-pill">
                  <span class="lbl">Your Bid:</span>
                  <strong>\${{ p.bidAmount }} USD</strong>
                </div>
              </div>

              <div class="gear-strip">
                <span class="gear-icon">📱</span>
                <span>Confirmed Rig: <strong>{{ p.equipmentConfirmed }}</strong></span>
                <span class="dot">•</span>
                <span>Turnaround: <strong>{{ p.deliveryDays }} Days</strong></span>
              </div>

              <p class="cover-letter-preview">
                "{{ p.coverLetter }}"
              </p>

              <div class="card-footer flex-between">
                <span class="date">Submitted: {{ p.createdAt }}</span>
                <div class="footer-actions">
                  <a [routerLink]="['/jobs', p.jobId]" class="btn btn-outline btn-xs">
                    View Brief 👁️
                  </a>
                  @if (p.status === 'ACCEPTED') {
                    <a routerLink="/creator/contracts/ct-1" class="btn btn-primary btn-xs">
                      Open Contract Room 🚀
                    </a>
                  }
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

    .page-header {
      margin-bottom: var(--space-8);
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .page-header h1 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      margin: var(--space-2) 0;
    }

    .page-header p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
    }

    .proposals-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .proposal-card {
      padding: var(--space-6) var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .job-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      margin: var(--space-1) 0 0;
    }

    .bid-pill {
      text-align: right;
    }

    .bid-pill .lbl {
      font-size: 10px;
      text-transform: uppercase;
      color: var(--color-text-muted);
      display: block;
    }

    .bid-pill strong {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-black);
      color: var(--color-success);
    }

    .gear-strip {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      flex-wrap: wrap;
    }

    .gear-strip strong { color: var(--color-primary-300); }
    .dot { color: var(--color-text-muted); }

    .cover-letter-preview {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: var(--line-height-relaxed);
      margin: 0;
      font-style: italic;
    }

    .card-footer {
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border-subtle);
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .date {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .footer-actions {
      display: flex;
      gap: var(--space-2);
    }
  `]
})
export class CreatorProposalsComponent {
  proposals = signal<Proposal[]>([
    {
      id: 'prop-1',
      jobId: 'jb-1',
      jobTitle: '5 Aesthetic Vertical Unboxing Videos for TikTok / Reels',
      creatorId: 'cr-1',
      bidAmount: 250,
      deliveryDays: 2,
      coverLetter: 'I specialize in viral beauty unboxings shot natively on iPhone 16 Pro Max in 4K ProRes Log. I use dynamic gimbal movements and studio softboxes.',
      equipmentConfirmed: 'iPhone 16 Pro Max (4K 60fps ProRes Log) • DJI OM 6',
      status: 'ACCEPTED',
      createdAt: '2026-08-12'
    },
    {
      id: 'prop-2',
      jobId: 'jb-2',
      jobTitle: '20 High-Res Macro Product Photos on Smartphone',
      creatorId: 'cr-1',
      bidAmount: 180,
      deliveryDays: 2,
      coverLetter: 'I will shoot all 20 macro shots with studio lighting and 5x telephoto optical zoom for zero distortion.',
      equipmentConfirmed: 'iPhone 16 Pro Max 5x Telephoto • Aputure Amaran MC',
      status: 'SUBMITTED',
      createdAt: '2026-08-14'
    }
  ]);

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACCEPTED': return 'badge-success';
      case 'SUBMITTED': return 'badge-primary';
      case 'REJECTED': return 'badge-danger';
      default: return 'badge-neutral';
    }
  }
}
