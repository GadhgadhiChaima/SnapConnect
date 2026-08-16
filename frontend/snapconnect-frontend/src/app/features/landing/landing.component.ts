import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CreatorService } from '../../core/services/creator.service';
import { JobService } from '../../core/services/job.service';
import { RatingStarsComponent } from '../../shared/components/rating-stars/rating-stars.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, RatingStarsComponent],
  template: `
    <div class="landing-page">
      <!-- HERO SECTION -->
      <section class="hero-section">
        <div class="hero-badge">
          <span>⚡ The Upwork for Mobile Content Creators</span>
        </div>
        <h1 class="hero-title">
          Hire Top <span class="gradient-title">Mobile Photographers</span> & Videographers
        </h1>
        <p class="hero-subtitle">
          Connect with smartphone content creators who produce viral Instagram Reels, 4K TikToks, macro product photos, and high-impact mobile content for your brand.
        </p>

        <div class="hero-actions">
          <a routerLink="/creators" class="btn btn-primary btn-lg">
            🔍 Browse Mobile Creators
          </a>
          <a routerLink="/jobs/create" class="btn btn-outline btn-lg">
            ⚡ Post a Mobile Brief ($0 Platform Fee)
          </a>
        </div>

        <div class="stats-row card-glass">
          <div class="stat-item">
            <span class="stat-num">4K 60fps</span>
            <span class="stat-lbl">Resolution Quality</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">1,200+</span>
            <span class="stat-lbl">Verified Smartphone Creators</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">48h</span>
            <span class="stat-lbl">Avg. Turnaround Time</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">99.4%</span>
            <span class="stat-lbl">Client Satisfaction Rate</span>
          </div>
        </div>
      </section>

      <!-- CATEGORIES SECTION -->
      <section class="section categories-section">
        <div class="section-header">
          <h2>Specialized Mobile Categories</h2>
          <p>Find specialized talent equipped with the latest iPhone & Android flagship gear.</p>
        </div>

        <div class="categories-grid">
          <div class="cat-card card-glass" *ngFor="let c of categories">
            <div class="cat-icon">{{ c.icon }}</div>
            <h3>{{ c.title }}</h3>
            <p>{{ c.desc }}</p>
            <span class="cat-tag">{{ c.gear }}</span>
          </div>
        </div>
      </section>

      <!-- FEATURED CREATORS SECTION -->
      <section class="section creators-section">
        <div class="section-header">
          <h2>Top Mobile Creators</h2>
          <p>Hand-picked creators with verified gear and outstanding client reviews.</p>
        </div>

        <div class="creators-grid">
          <div class="creator-card card-glass" *ngFor="let creator of creatorService.creators()">
            <div class="card-header">
              <img [src]="creator.avatarUrl" [alt]="creator.fullName" class="creator-avatar" />
              <div class="creator-meta">
                <h3>{{ creator.fullName }} <span class="verified" *ngIf="creator.verifiedCreator">✓</span></h3>
                <p class="title">{{ creator.title }}</p>
                <app-rating-stars [rating]="creator.rating" [reviewsCount]="creator.reviewsCount"></app-rating-stars>
              </div>
            </div>

            <div class="gear-box">
              <span class="gear-icon">📱</span>
              <span class="gear-text">{{ creator.equipment.smartphoneModel }}</span>
            </div>

            <p class="bio-snippet">{{ creator.bio | slice:0:110 }}...</p>

            <div class="card-footer">
              <div class="rate">
                <span class="amount">\${{ creator.hourlyRate }}</span>
                <span class="unit">/ hr</span>
              </div>
              <a [routerLink]="['/creators', creator.id]" class="btn btn-sm btn-outline">
                View Portfolio
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- RECENT JOBS SECTION -->
      <section class="section jobs-section">
        <div class="section-header">
          <h2>Latest Mobile Briefs</h2>
          <p>Recent opportunities posted by small businesses and brands.</p>
        </div>

        <div class="jobs-list">
          <div class="job-card card-glass" *ngFor="let job of jobService.jobs()">
            <div class="job-main">
              <div class="job-badge">
                <span class="badge badge-purple">{{ job.category }}</span>
                <span class="badge badge-gold">\${{ job.budgetAmount }} {{ job.budgetType }}</span>
              </div>
              <h3><a [routerLink]="['/jobs', job.id]">{{ job.title }}</a></h3>
              <p class="job-desc">{{ job.description | slice:0:130 }}...</p>
              <div class="job-meta">
                <span>📍 {{ job.location }}</span>
                <span>📱 Required: {{ job.requiredGear }}</span>
                <span>⏱️ {{ job.postedDate }}</span>
              </div>
            </div>

            <div class="job-action">
              <a [routerLink]="['/jobs', job.id]" class="btn btn-sm btn-primary">
                Apply Now ({{ job.proposalsCount }} Bids)
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS SECTION -->
      <section class="section works-section card-glass">
        <div class="section-header">
          <h2>How SnapConnect Works</h2>
          <p>Streamlined workflow designed specifically for mobile content creation.</p>
        </div>

        <div class="steps-grid">
          <div class="step-card">
            <div class="step-num">01</div>
            <h3>Post Your Mobile Brief</h3>
            <p>Specify phone requirements (e.g. 4K 60fps, 0.5x Ultra-Wide, Gimbal), style, and budget.</p>
          </div>
          <div class="step-card">
            <div class="step-num">02</div>
            <h3>Compare Creator Bids</h3>
            <p>Review creator portfolios, smartphone gear specs, and past client ratings.</p>
          </div>
          <div class="step-card">
            <div class="step-num">03</div>
            <h3>Receive High-Res Content</h3>
            <p>Get formatted Instagram Reels, TikToks, or e-commerce photos delivered with milestone protection.</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .landing-page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }

    .hero-section {
      text-align: center;
      padding: 4rem 1rem 3rem;
      max-width: 850px;
      margin: 0 auto;

      .hero-badge {
        display: inline-block;
        background: rgba(139, 92, 246, 0.15);
        border: 1px solid rgba(139, 92, 246, 0.3);
        color: #c084fc;
        padding: 0.35rem 1rem;
        border-radius: $radius-full;
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
      }

      .hero-title {
        font-size: 3.2rem;
        font-weight: 800;
        line-height: 1.15;
        margin-bottom: 1.25rem;

        @include respond-to('mobile') {
          font-size: 2.2rem;
        }
      }

      .hero-subtitle {
        font-size: 1.15rem;
        color: $text-muted;
        margin-bottom: 2.25rem;
        line-height: 1.6;
      }

      .hero-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-bottom: 3.5rem;

        @include respond-to('mobile') {
          flex-direction: column;
        }
      }
    }

    .btn-lg {
      padding: 0.85rem 1.8rem;
      font-size: 1.05rem;
      border-radius: $radius-md;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      padding: 1.5rem;

      .stat-item {
        display: flex;
        flex-direction: column;

        .stat-num {
          font-size: 1.6rem;
          font-weight: 800;
          color: $primary;
        }

        .stat-lbl {
          font-size: 0.8rem;
          color: $text-muted;
        }
      }

      @include respond-to('mobile') {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .section {
      margin-top: 5rem;
    }

    .section-header {
      margin-bottom: 2.5rem;
      text-align: center;

      h2 {
        font-size: 2rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
      }

      p {
        color: $text-muted;
        font-size: 1rem;
      }
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;

      .cat-card {
        .cat-icon { font-size: 2.2rem; margin-bottom: 1rem; }
        h3 { font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem; }
        p { font-size: 0.85rem; color: $text-muted; margin-bottom: 1rem; }
        .cat-tag {
          font-size: 0.75rem;
          color: $secondary;
          font-weight: 600;
        }
      }
    }

    .creators-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;

      .creator-card {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .card-header {
          display: flex;
          gap: 1rem;

          .creator-avatar {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            object-fit: cover;
          }

          .creator-meta {
            h3 { font-size: 1.1rem; font-weight: 700; }
            .verified { color: #38bdf8; margin-left: 0.25rem; }
            .title { font-size: 0.8rem; color: $text-muted; margin-bottom: 0.25rem; }
          }
        }

        .gear-box {
          background: rgba(0, 0, 0, 0.25);
          padding: 0.4rem 0.75rem;
          border-radius: $radius-sm;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #a78bfa;
        }

        .bio-snippet {
          font-size: 0.85rem;
          color: $text-muted;
          line-height: 1.5;
        }

        .card-footer {
          margin-top: auto;
          @include flex-between;
          padding-top: 0.75rem;
          border-top: 1px solid $border-color;

          .rate {
            .amount { font-size: 1.2rem; font-weight: 800; color: white; }
            .unit { font-size: 0.8rem; color: $text-muted; }
          }
        }
      }
    }

    .jobs-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .job-card {
        @include flex-between;

        .job-badge {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 0.4rem;
          a:hover { color: $primary; }
        }

        .job-desc {
          font-size: 0.9rem;
          color: $text-muted;
          margin-bottom: 0.75rem;
        }

        .job-meta {
          display: flex;
          gap: 1.25rem;
          font-size: 0.8rem;
          color: $text-muted;
        }

        @include respond-to('tablet') {
          flex-direction: column;
          gap: 1rem;
          align-items: flex-start;
        }
      }
    }

    .works-section {
      padding: 3rem 2rem;

      .steps-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;

        @include respond-to('tablet') {
          grid-template-columns: 1fr;
        }

        .step-card {
          .step-num {
            font-size: 2.2rem;
            font-weight: 800;
            color: $secondary;
            opacity: 0.8;
            margin-bottom: 0.5rem;
          }

          h3 { font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem; }
          p { font-size: 0.9rem; color: $text-muted; }
        }
      }
    }
  `]
})
export class LandingComponent {
  categories = [
    { icon: '📱', title: 'Reels & TikTok Clips', desc: '15-60s fast-paced vertical video clips formatted for social algorithms.', gear: '4K 60fps / Log Video' },
    { icon: '📦', title: 'Macro Product Shoots', desc: 'Aesthetic product photography using smartphone macro lens & light setup.', gear: 'Smartphone Macro Mode' },
    { icon: '🏰', title: 'Real Estate Mobile Tours', desc: 'Smooth ultra-wide walkthrough videos for property listings.', gear: '0.5x Lens + Gimbal' },
    { icon: '🤳', title: 'UGC Ads & Unboxing', desc: 'Authentic face-to-camera mobile product reviews and hooks.', gear: 'Wireless Lapel Mic' }
  ];

  constructor(
    public creatorService: CreatorService,
    public jobService: JobService
  ) {}
}
