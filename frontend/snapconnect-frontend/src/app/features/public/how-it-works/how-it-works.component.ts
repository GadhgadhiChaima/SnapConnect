import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="how-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header text-center">
          <span class="badge badge-primary">Process Guide</span>
          <h1>How SnapConnect Works</h1>
          <p>Two flexible ways to get high-converting smartphone photos & videos made for your brand.</p>
        </div>

        <!-- 2 Models side by side -->
        <div class="models-grid">
          <!-- Model A: Job Brief Flow -->
          <div class="model-box card-glass">
            <div class="model-badge">Model A</div>
            <h2>Post a Job Brief</h2>
            <p class="model-desc">Ideal for custom shoots, on-site filming, or specialized multi-deliverable briefs.</p>

            <div class="steps-list">
              <div class="step-item">
                <span class="step-num">1</span>
                <div>
                  <strong>Post your Mobile Brief</strong>
                  <p>Describe your project, required smartphone specs (e.g. 4K ProRes), location, and budget.</p>
                </div>
              </div>

              <div class="step-item">
                <span class="step-num">2</span>
                <div>
                  <strong>Receive Mobile Creator Proposals</strong>
                  <p>Creators submit pitches detailing their smartphone gear, previous reel links, and timelines.</p>
                </div>
              </div>

              <div class="step-item">
                <span class="step-num">3</span>
                <div>
                  <strong>Fund Escrow & Shoot</strong>
                  <p>Your deposit is held securely in escrow while the creator films and edits your content.</p>
                </div>
              </div>

              <div class="step-item">
                <span class="step-num">4</span>
                <div>
                  <strong>Approve & Release Payment</strong>
                  <p>Review the 4K vertical footage, request revisions if needed, and release funds upon approval.</p>
                </div>
              </div>
            </div>

            <a routerLink="/client/jobs/create" class="btn btn-primary btn-block">Post a Job Brief →</a>
          </div>

          <!-- Model B: Direct Service Packages -->
          <div class="model-box card-glass">
            <div class="model-badge">Model B</div>
            <h2>Order Direct Packages</h2>
            <p class="model-desc">Ideal for fast turnaround UGC, standardized TikTok reels, and e-commerce packs.</p>

            <div class="steps-list">
              <div class="step-item">
                <span class="step-num">1</span>
                <div>
                  <strong>Browse Verified Mobile Services</strong>
                  <p>Explore fixed-price packages categorized by style (UGC, Food, Real Estate, Fashion).</p>
                </div>
              </div>

              <div class="step-item">
                <span class="step-num">2</span>
                <div>
                  <strong>Select Package Tier</strong>
                  <p>Pick Basic, Standard, or Premium based on video count and delivery speed (24h - 48h).</p>
                </div>
              </div>

              <div class="step-item">
                <span class="step-num">3</span>
                <div>
                  <strong>Provide Shoot Instructions</strong>
                  <p>Submit your script, ship your physical products, or provide reference mood boards.</p>
                </div>
              </div>

              <div class="step-item">
                <span class="step-num">4</span>
                <div>
                  <strong>Download Ready-to-Post Files</strong>
                  <p>Receive color-graded, captioned vertical videos ready for TikTok, Instagram Reels, or Ads.</p>
                </div>
              </div>
            </div>

            <a routerLink="/services" class="btn btn-accent btn-block">Browse Services →</a>
          </div>
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .how-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }

    .text-center { text-align: center; }

    .page-header {
      margin-bottom: var(--space-12);
    }

    .page-header h1 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      margin: var(--space-2) 0;
    }

    .page-header p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
      max-width: 600px;
      margin: 0 auto;
    }

    .models-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-8);
      max-width: 1080px;
      margin: 0 auto;
    }

    .model-box {
      padding: var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      flex-direction: column;
    }

    .model-badge {
      display: inline-block;
      padding: 3px 12px;
      border-radius: var(--radius-full);
      background: var(--color-primary-light);
      border: 1px solid rgba(139, 92, 246, 0.4);
      color: var(--color-primary-300);
      font-size: 11px;
      font-weight: 800;
      width: fit-content;
      margin-bottom: var(--space-3);
    }

    .model-box h2 {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-2);
    }

    .model-desc {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-6);
      line-height: var(--line-height-relaxed);
    }

    .steps-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      margin-bottom: var(--space-8);
      flex-grow: 1;
    }

    .step-item {
      display: flex;
      gap: var(--space-4);
      align-items: flex-start;
    }

    .step-num {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--color-bg-surface);
      border: 2px solid var(--color-primary-500);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: var(--font-size-sm);
      color: var(--color-primary-400);
      flex-shrink: 0;
    }

    .step-item strong {
      display: block;
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      margin-bottom: 2px;
    }

    .step-item p {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      line-height: var(--line-height-normal);
      margin: 0;
    }

    @media (max-width: 800px) {
      .models-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HowItWorksComponent {}
