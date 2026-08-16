import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { Job } from '../../../../core/models/job.model';

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
            <a routerLink="/jobs">Job Board</a>
            <span>/</span>
            <span class="curr">{{ j.categoryName }}</span>
          </div>

          <div class="job-layout">
            <!-- Left: Job Details -->
            <div class="job-main">
              <div class="job-card-main card-glass">
                <div class="badge-row">
                  <span class="badge badge-primary">{{ j.categoryName }}</span>
                  <span class="badge badge-success">● Active & Accepting Proposals</span>
                </div>

                <h1 class="job-title">{{ j.title }}</h1>

                <div class="meta-strip">
                  <div class="meta-item">
                    <span class="label">Budget</span>
                    <strong class="val">
                      {{ j.budgetType === 'HOURLY' ? '\$' + j.budgetMin + ' - \$' + j.budgetMax + '/hr' : '\$' + j.budgetAmount + ' Fixed Price' }}
                    </strong>
                  </div>
                  <div class="meta-item">
                    <span class="label">Location</span>
                    <strong class="val">📍 {{ j.isRemote ? 'Remote / Online' : j.location }}</strong>
                  </div>
                  <div class="meta-item">
                    <span class="label">Proposals</span>
                    <strong class="val">📬 {{ j.proposalsCount }} Received</strong>
                  </div>
                </div>

                <div class="section-block">
                  <h3>Project Overview</h3>
                  <p class="desc-text">{{ j.description }}</p>
                </div>

                <!-- Required Smartphone Hardware -->
                <div class="section-block gear-box">
                  <h3>📱 Required Mobile Equipment</h3>
                  <p class="gear-desc">The client requires creators to use the following smartphone gear specifications:</p>
                  <div class="gear-pill">
                    <span>{{ j.requiredGear || 'iPhone 15/16 Pro Max with 4K 60fps capability' }}</span>
                  </div>
                </div>

                <!-- Required Skills -->
                <div class="section-block">
                  <h3>Required Skills & Tags</h3>
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
              <!-- Apply Card -->
              <div class="apply-card card-glass">
                <h3>Interested in this project?</h3>
                <p>Submit a mobile proposal with your gear specifications and portfolio links.</p>

                <button (click)="openProposalModal.set(true)" class="btn btn-primary btn-block btn-lg">
                  ⚡ Submit a Proposal
                </button>

                <div class="apply-footer">
                  <span>⏱️ Average review time: <strong>24 hours</strong></span>
                </div>
              </div>

              <!-- Client Info Card -->
              <div class="client-card card-glass">
                <h4>About the Client</h4>
                <div class="client-name-rating">
                  <strong>{{ j.clientName }}</strong>
                  <span class="rating">★ {{ j.clientRating || 5.0 }} (12 reviews)</span>
                </div>
                <div class="client-stat-list">
                  <div class="c-stat">📍 {{ j.location }}</div>
                  <div class="c-stat">💼 8 jobs posted</div>
                  <div class="c-stat">💳 Verified Payment Method</div>
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

            <h2>Submit Proposal for this Job</h2>
            <p class="modal-sub">Tell the client why your mobile setup and filming style are the perfect fit.</p>

            <form (ngSubmit)="submitProposal()" class="proposal-form">
              <div class="form-group">
                <label class="form-label">Your Bid / Price ($ USD)</label>
                <input type="number" [(ngModel)]="proposalBid" name="bid" class="form-input" placeholder="e.g. 250" required />
              </div>

              <div class="form-group">
                <label class="form-label">Delivery Timeline (Days)</label>
                <input type="number" [(ngModel)]="proposalDays" name="days" class="form-input" placeholder="e.g. 2" required />
              </div>

              <div class="form-group">
                <label class="form-label">Your Smartphone & Gear Setup</label>
                <input type="text" [(ngModel)]="proposalGear" name="gear" class="form-input" placeholder="e.g. iPhone 16 Pro Max + DJI OM 6 + Rode Wireless Pro" required />
              </div>

              <div class="form-group">
                <label class="form-label">Cover Letter / Pitch</label>
                <textarea [(ngModel)]="proposalCover" name="cover" class="form-textarea" placeholder="Describe your experience with similar shoots..." rows="4" required></textarea>
              </div>

              <div class="modal-actions">
                <button type="button" (click)="openProposalModal.set(false)" class="btn btn-outline">Cancel</button>
                <button type="submit" class="btn btn-primary">Send Proposal</button>
              </div>
            </form>
          </div>
        </div>
      }
    }

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

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
export class JobDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  job = signal<Job | null>(null);
  openProposalModal = signal(false);

  proposalBid = 250;
  proposalDays = 2;
  proposalGear = 'iPhone 16 Pro Max + DJI OM 6 + Rode Wireless Pro';
  proposalCover = 'Hi! I have extensive experience shooting mobile commercial content for retail brands. My setup captures 4K ProRes with stabilized gimbal tracking shots.';

  ngOnInit(): void {
    const jbId = this.route.snapshot.params['id'];
    this.job.set({
      id: jbId || 'jb-1',
      clientId: 'cl-1',
      clientName: 'Bloom Cosmetics',
      clientRating: 4.9,
      categoryName: 'Product Photography',
      title: 'Need 10 Aesthetic Product Photos & 3 Unboxing Reels (iPhone 15/16)',
      description: 'We are launching our new organic skincare line and need an experienced mobile creator to shoot aesthetic unboxing reels, texture close-ups, and natural lighting lifestyle product photos. Products will be shipped directly to your location.',
      budgetType: 'FIXED',
      budgetAmount: 250,
      location: 'Remote (Products shipped to you)',
      isRemote: true,
      requiredGear: 'iPhone 15/16 Pro or S24 Ultra + Ring Light / Softbox',
      requiredSkills: ['Skincare UGC', 'Unboxing', 'Aesthetic Lighting', 'Product Close-ups'],
      proposalsCount: 7,
      status: 'OPEN',
      postedDate: new Date().toISOString()
    });
  }

  submitProposal(): void {
    alert('Proposal submitted successfully to client!');
    this.openProposalModal.set(false);
    this.router.navigate(['/creator/proposals']);
  }
}
