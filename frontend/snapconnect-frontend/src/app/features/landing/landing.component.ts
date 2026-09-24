import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-page">

      <!-- HERO SECTION -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            <span>La #1 Marketplace Createurs Smartphone en Tunisie</span>
          </div>

          <h1 class="hero-title">
            Comment souhaitez-vous<br/>
            <span class="gradient-text">travailler ?</span>
          </h1>

          <p class="hero-subtitle">
            Des createurs mobiles verifies iPhone 4K, Samsung Ultra, Pixel Pro prets a produire des Reels, TikToks et photos produits pour votre marque.
          </p>

          <div class="search-bar-wrapper">
            <div class="search-bar">
              <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" placeholder="Trouvez un createur, un service ou une competence..." class="search-input" />
              <a routerLink="/creators" class="search-btn">Rechercher</a>
            </div>
            <div class="search-suggestions">
              <span class="suggestions-label">Populaire :</span>
              <a routerLink="/creators" class="suggestion-chip">Reels TikTok</a>
              <a routerLink="/creators" class="suggestion-chip">Video Produit 4K</a>
              <a routerLink="/creators" class="suggestion-chip">Cafe & Resto</a>
              <a routerLink="/creators" class="suggestion-chip">UGC Content</a>
              <a routerLink="/creators" class="suggestion-chip">Immobilier</a>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="phone-mockup">
            <div class="phone-screen">
              <div class="screen-top-bar">
                <div class="screen-dot red"></div>
                <div class="screen-dot yellow"></div>
                <div class="screen-dot green"></div>
              </div>
              <div class="screen-content">
                <div class="video-thumb">
                  <div class="play-ring">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  </div>
                  <div class="video-label">Reel 4K ProRes</div>
                </div>
                <div class="creator-chip">
                  <div class="chip-avatar">M</div>
                  <div class="chip-info">
                    <span class="chip-name">Marie D.</span>
                    <span class="chip-stars">5.0 / 5</span>
                  </div>
                  <span class="chip-badge">TOP</span>
                </div>
                <div class="earnings-pill">
                  <span>Gagne jusqu'a 3 200 DT/mois</span>
                </div>
              </div>
            </div>
          </div>
          <div class="float-badge badge-top-right">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Livraison securisee</span>
          </div>
          <div class="float-badge badge-bottom-left">
            <span class="pulse-dot"></span>
            <span>1 200+ createurs actifs</span>
          </div>
        </div>
      </section>

      <!-- TRUST SECTION -->
      <section class="trust-section">
        <p class="trust-label">Marques tunisiennes qui nous font confiance</p>
        <div class="trust-logos">
          <div class="trust-logo">Gourmandise</div>
          <div class="trust-logo">Alyssa Bio</div>
          <div class="trust-logo">Carthage Concept</div>
          <div class="trust-logo">Cafe Journal</div>
          <div class="trust-logo">Medina Craft</div>
          <div class="trust-logo">Baya Fashion</div>
        </div>
      </section>

      <!-- CATEGORIES -->
      <section class="section categories-section">
        <div class="section-header">
          <h2>Explorez nos categories</h2>
          <p>Des talents specialises pour chaque besoin de contenu mobile.</p>
        </div>
        <div class="categories-grid">
          <a routerLink="/creators" class="cat-card" *ngFor="let cat of categories">
            <div class="cat-emoji">{{ cat.emoji }}</div>
            <div class="cat-body">
              <h3>{{ cat.title }}</h3>
              <p>{{ cat.desc }}</p>
            </div>
            <div class="cat-meta">
              <span class="cat-count">{{ cat.count }} createurs</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
          </a>
        </div>
      </section>

      <!-- HOW IT WORKS -->
      <section class="section hiw-section">
        <div class="section-header">
          <h2>Comment ca fonctionne ?</h2>
          <p>Simple, rapide et securise pour les deux parties.</p>
        </div>
        <div class="hiw-tabs">
          <button class="hiw-tab" [class.active]="activeTab() === 'client'" (click)="setTab('client')">
            Je suis une Marque
          </button>
          <button class="hiw-tab" [class.active]="activeTab() === 'creator'" (click)="setTab('creator')">
            Je suis Createur
          </button>
        </div>
        <div class="hiw-steps" *ngIf="activeTab() === 'client'">
          <div class="hiw-step" *ngFor="let step of clientSteps; let i = index">
            <div class="step-index">0{{ i + 1 }}</div>
            <div class="step-icon-circle">{{ step.icon }}</div>
            <div class="step-body">
              <h3>{{ step.title }}</h3>
              <p>{{ step.desc }}</p>
            </div>
          </div>
        </div>
        <div class="hiw-steps" *ngIf="activeTab() === 'creator'">
          <div class="hiw-step" *ngFor="let step of creatorSteps; let i = index">
            <div class="step-index">0{{ i + 1 }}</div>
            <div class="step-icon-circle">{{ step.icon }}</div>
            <div class="step-body">
              <h3>{{ step.title }}</h3>
              <p>{{ step.desc }}</p>
            </div>
          </div>
        </div>
        <div class="hiw-cta">
          <a routerLink="/auth/register" class="btn btn-primary btn-lg" *ngIf="activeTab() === 'client'">
            Publier ma premiere mission
          </a>
          <a routerLink="/auth/register" class="btn btn-creator btn-lg" *ngIf="activeTab() === 'creator'">
            Creer mon profil createur
          </a>
        </div>
      </section>

      <!-- WHY SNAPCONNECT -->
      <section class="section why-section">
        <div class="section-header">
          <h2>Pourquoi choisir SnapConnect ?</h2>
          <p>Une plateforme construite exclusivement pour le contenu mobile haut de gamme.</p>
        </div>
        <div class="why-grid">
          <div class="why-card" *ngFor="let feat of features">
            <div class="why-icon">{{ feat.icon }}</div>
            <h3>{{ feat.title }}</h3>
            <p>{{ feat.desc }}</p>
          </div>
        </div>
      </section>

      <!-- STATS -->
      <section class="stats-section">
        <div class="stats-grid">
          <div class="stat-item" *ngFor="let s of stats">
            <span class="stat-num">{{ s.num }}</span>
            <span class="stat-lbl">{{ s.label }}</span>
          </div>
        </div>
      </section>

      <!-- TESTIMONIALS -->
      <section class="section testimonials-section">
        <div class="section-header">
          <h2>Ce que disent nos utilisateurs</h2>
          <p>Des milliers de missions realisees avec succes en Tunisie et au Maghreb.</p>
        </div>
        <div class="testimonials-grid">
          <div class="testi-card" *ngFor="let t of testimonials">
            <div class="testi-stars">5 etoiles</div>
            <p class="testi-text">{{ t.text }}</p>
            <div class="testi-author">
              <div class="testi-avatar">{{ t.initials }}</div>
              <div class="testi-info">
                <span class="testi-name">{{ t.name }}</span>
                <span class="testi-role">{{ t.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FINAL CTA -->
      <section class="cta-final-section">
        <div class="cta-card">
          <div class="cta-glow"></div>
          <h2 class="cta-title">Pret a creer du contenu<br/><span class="gradient-text">qui convertit ?</span></h2>
          <p class="cta-sub">Rejoignez plus de 1 200 createurs et 350 marques sur la marketplace #1 en Tunisie.</p>
          <div class="cta-actions">
            <a routerLink="/auth/register" class="btn btn-primary btn-xl">Commencer gratuitement</a>
            <a routerLink="/creators" class="btn btn-ghost btn-xl">Explorer les createurs</a>
          </div>
          <p class="cta-note">Inscription gratuite - Paiement securise Escrow - Sans abonnement</p>
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
      padding: 0 1.5rem 5rem;
    }

    /* HERO */
    .hero-section {
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: 4rem;
      align-items: center;
      padding: 5rem 0 3rem;
      min-height: 88vh;
    }

    .hero-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(139, 92, 246, 0.12);
      border: 1px solid rgba(139, 92, 246, 0.3);
      color: #c084fc;
      padding: 0.4rem 1rem;
      border-radius: 100px;
      font-size: 0.82rem;
      font-weight: 600;
      width: fit-content;
    }

    .badge-dot {
      width: 7px;
      height: 7px;
      background: #22c55e;
      border-radius: 50%;
      box-shadow: 0 0 8px #22c55e;
      animation: pulse-dot 2s infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.85); }
    }

    .hero-title {
      font-size: 3.8rem;
      font-weight: 800;
      line-height: 1.1;
      margin: 0;
    }

    .gradient-text {
      background: linear-gradient(135deg, #a855f7 0%, #ec4899 60%, #f59e0b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.12rem;
      color: \-muted;
      line-height: 1.65;
      max-width: 560px;
      margin: 0;
    }

    .search-bar-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      max-width: 600px;
    }

    .search-bar {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.06);
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      padding: 0.4rem 0.4rem 0.4rem 1rem;
      gap: 0.75rem;
      transition: border-color 0.2s;
    }

    .search-bar:focus-within {
      border-color: rgba(139, 92, 246, 0.6);
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
    }

    .search-icon { color: \-muted; flex-shrink: 0; }

    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: white;
      font-size: 0.95rem;
      font-family: 'Outfit', sans-serif;
    }

    .search-input::placeholder { color: \-muted; }

    .search-btn {
      background: linear-gradient(135deg, \, \);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 0.7rem 1.4rem;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      white-space: nowrap;
      transition: opacity 0.2s;
    }

    .search-btn:hover { opacity: 0.85; }

    .search-suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }

    .suggestions-label {
      font-size: 0.8rem;
      color: \-muted;
      font-weight: 500;
    }

    .suggestion-chip {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: \-muted;
      border-radius: 100px;
      padding: 0.28rem 0.75rem;
      font-size: 0.8rem;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
    }

    .suggestion-chip:hover {
      border-color: rgba(139, 92, 246, 0.5);
      color: white;
      background: rgba(139, 92, 246, 0.1);
    }

    /* PHONE MOCKUP */
    .hero-visual {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .phone-mockup {
      width: 280px;
      height: 520px;
      background: rgba(255,255,255,0.04);
      border: 1.5px solid rgba(255,255,255,0.12);
      border-radius: 36px;
      padding: 1.25rem 1rem;
      backdrop-filter: blur(20px);
      box-shadow: 0 40px 80px rgba(0,0,0,0.4);
      position: relative;
      z-index: 1;
    }

    .phone-screen {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .screen-top-bar {
      display: flex;
      gap: 0.35rem;
    }

    .screen-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .screen-dot.red { background: #ff5f57; }
    .screen-dot.yellow { background: #ffbd2e; }
    .screen-dot.green { background: #28ca41; }

    .screen-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      flex: 1;
    }

    .video-thumb {
      flex: 1;
      background: linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.2));
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      border: 1px solid rgba(139,92,246,0.2);
      position: relative;
      overflow: hidden;
    }

    .play-ring {
      width: 52px;
      height: 52px;
      background: rgba(255,255,255,0.15);
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      z-index: 1;
    }

    .video-label {
      font-size: 0.72rem;
      color: rgba(255,255,255,0.8);
      font-weight: 600;
      z-index: 1;
      background: rgba(0,0,0,0.4);
      padding: 0.2rem 0.6rem;
      border-radius: 100px;
    }

    .creator-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 0.5rem 0.75rem;
    }

    .chip-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: linear-gradient(135deg, \, \);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .chip-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .chip-name { font-size: 0.8rem; font-weight: 700; }
    .chip-stars { font-size: 0.65rem; color: #fbbf24; }

    .chip-badge {
      font-size: 0.6rem;
      font-weight: 700;
      color: #fbbf24;
      background: rgba(251,191,36,0.15);
      border: 1px solid rgba(251,191,36,0.3);
      border-radius: 4px;
      padding: 0.1rem 0.4rem;
    }

    .earnings-pill {
      background: rgba(34,197,94,0.12);
      border: 1px solid rgba(34,197,94,0.25);
      border-radius: 10px;
      padding: 0.4rem 0.6rem;
      font-size: 0.72rem;
      color: #86efac;
      font-weight: 600;
      text-align: center;
    }

    .float-badge {
      position: absolute;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(15, 12, 30, 0.85);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      padding: 0.5rem 0.85rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: white;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      white-space: nowrap;
      z-index: 2;
    }

    .badge-top-right { top: 10%; right: -8%; }
    .badge-bottom-left { bottom: 12%; left: -10%; }

    .pulse-dot {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      box-shadow: 0 0 10px #22c55e;
      animation: pulse-dot 1.8s infinite;
    }

    /* TRUST */
    .trust-section {
      text-align: center;
      padding: 2rem 0;
      border-top: 1px solid rgba(255,255,255,0.06);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .trust-label {
      font-size: 0.82rem;
      color: \-muted;
      font-weight: 500;
      margin-bottom: 1.5rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .trust-logos {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem 2.5rem;
    }

    .trust-logo {
      font-size: 0.9rem;
      font-weight: 700;
      color: rgba(255,255,255,0.25);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      transition: color 0.2s;
    }

    .trust-logo:hover { color: rgba(255,255,255,0.5); }

    /* SECTIONS */
    .section { margin-top: 6rem; }

    .section-header {
      margin-bottom: 2.75rem;
      text-align: center;
    }

    .section-header h2 { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.5rem; }
    .section-header p { color: \-muted; font-size: 1rem; }

    /* CATEGORIES */
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    .cat-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1.5rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
      transition: all 0.25s;
      position: relative;
      overflow: hidden;
    }

    .cat-card:hover {
      border-color: rgba(139,92,246,0.4);
      transform: translateY(-3px);
      box-shadow: 0 16px 40px rgba(139,92,246,0.12);
    }

    .cat-emoji { font-size: 2rem; line-height: 1; }

    .cat-body { flex: 1; }
    .cat-body h3 { font-size: 1rem; font-weight: 700; margin-bottom: 0.3rem; }
    .cat-body p { font-size: 0.82rem; color: \-muted; line-height: 1.45; }

    .cat-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .cat-count { font-size: 0.8rem; color: #a78bfa; font-weight: 600; }

    /* HOW IT WORKS */
    .hiw-section {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 24px;
      padding: 3.5rem 3rem;
    }

    .hiw-tabs {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      margin-bottom: 3rem;
      background: rgba(0,0,0,0.25);
      border-radius: 12px;
      padding: 0.35rem;
      width: fit-content;
      margin-left: auto;
      margin-right: auto;
    }

    .hiw-tab {
      padding: 0.65rem 1.5rem;
      border-radius: 9px;
      border: none;
      background: transparent;
      color: \-muted;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: 'Outfit', sans-serif;
    }

    .hiw-tab.active {
      background: linear-gradient(135deg, \, \);
      color: white;
      box-shadow: 0 4px 16px rgba(139,92,246,0.3);
    }

    .hiw-steps {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .hiw-step {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .step-index {
      font-size: 0.72rem;
      font-weight: 700;
      color: #a78bfa;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .step-icon-circle {
      width: 52px;
      height: 52px;
      background: rgba(139,92,246,0.12);
      border: 1.5px solid rgba(139,92,246,0.25);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .step-body h3 { font-size: 1.05rem; font-weight: 700; margin-bottom: 0.35rem; }
    .step-body p { font-size: 0.85rem; color: \-muted; line-height: 1.55; }

    .hiw-cta {
      text-align: center;
      margin-top: 2.5rem;
    }

    .btn-creator {
      background: linear-gradient(135deg, #ec4899, #f59e0b);
      color: white;
      border: none;
      text-decoration: none;
      display: inline-block;
      font-weight: 700;
      border-radius: 11px;
      padding: 0.85rem 1.75rem;
      font-size: 1rem;
    }

    .btn-creator:hover { opacity: 0.85; }

    /* WHY */
    .why-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .why-card {
      padding: 1.75rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      transition: all 0.25s;
    }

    .why-card:hover {
      border-color: rgba(139,92,246,0.3);
      background: rgba(139,92,246,0.05);
      transform: translateY(-2px);
    }

    .why-icon { font-size: 2rem; margin-bottom: 1rem; display: block; }
    .why-card h3 { font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem; }
    .why-card p { font-size: 0.87rem; color: \-muted; line-height: 1.55; }

    /* STATS */
    .stats-section {
      margin-top: 5rem;
      background: linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.06));
      border: 1px solid rgba(139,92,246,0.15);
      border-radius: 20px;
      padding: 2.5rem 3rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
      text-align: center;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .stat-num {
      font-size: 2.4rem;
      font-weight: 800;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-lbl { font-size: 0.85rem; color: \-muted; }

    /* TESTIMONIALS */
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .testi-card {
      padding: 1.75rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: all 0.25s;
    }

    .testi-card:hover {
      border-color: rgba(139,92,246,0.25);
      transform: translateY(-2px);
    }

    .testi-stars { color: #fbbf24; font-size: 0.9rem; letter-spacing: 0.1em; }

    .testi-text {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.75);
      line-height: 1.65;
      font-style: italic;
      flex: 1;
    }

    .testi-author {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .testi-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, \, \);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
    }

    .testi-info { display: flex; flex-direction: column; }
    .testi-name { font-size: 0.9rem; font-weight: 700; }
    .testi-role { font-size: 0.75rem; color: \-muted; }

    /* FINAL CTA */
    .cta-final-section { margin-top: 6rem; }

    .cta-card {
      position: relative;
      background: rgba(15, 12, 30, 0.8);
      border: 1px solid rgba(139,92,246,0.2);
      border-radius: 28px;
      padding: 5rem 3rem;
      text-align: center;
      overflow: hidden;
    }

    .cta-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      height: 300px;
      background: radial-gradient(ellipse, rgba(139,92,246,0.15), transparent 70%);
      pointer-events: none;
    }

    .cta-title {
      font-size: 2.8rem;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 1rem;
      position: relative;
    }

    .cta-sub {
      font-size: 1.05rem;
      color: \-muted;
      margin-bottom: 2.5rem;
      position: relative;
    }

    .cta-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      position: relative;
      margin-bottom: 1.75rem;
    }

    .btn-xl {
      padding: 1rem 2rem;
      font-size: 1.05rem;
      border-radius: 12px;
    }

    .btn-ghost {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      color: white;
      text-decoration: none;
      border-radius: 12px;
      padding: 1rem 2rem;
      font-size: 1.05rem;
      font-weight: 600;
      transition: all 0.2s;
      display: inline-block;
    }

    .btn-ghost:hover { background: rgba(255,255,255,0.1); }

    .cta-note {
      font-size: 0.82rem;
      color: \-muted;
      position: relative;
    }

    .btn-lg {
      padding: 0.85rem 1.75rem;
      font-size: 1rem;
      border-radius: 11px;
    }
  `]
})
export class LandingComponent {
  activeTab = signal<'client' | 'creator'>('client');

  setTab(tab: 'client' | 'creator') {
    this.activeTab.set(tab);
  }

  categories = [
    { emoji: '🎬', title: 'Reels & TikTok', desc: 'Videos courtes virales 15-60s, format 9:16 optimise algorithmes.', count: 245 },
    { emoji: '📸', title: 'Photos Produits', desc: 'Macro smartphone, packshot e-commerce, flat lay lifestyle.', count: 189 },
    { emoji: '☕', title: 'Cafe & Restauration', desc: 'Tournages ambiance, plats, menus et experience client.', count: 134 },
    { emoji: '👗', title: 'Mode & Beaute', desc: 'Lookbooks, unboxing, routines skincare et haul mode.', count: 167 },
    { emoji: '🏡', title: 'Immobilier', desc: 'Visites virtuelles ultra grand-angle et drone smartphone.', count: 88 },
    { emoji: '📱', title: 'UGC Authentique', desc: 'Temoignages clients face camera, deballage produit naturel.', count: 312 },
    { emoji: '🎤', title: 'Evenements Live', desc: 'Couverture evenementielle, conferences et lancements.', count: 72 },
    { emoji: '🏋', title: 'Sport & Fitness', desc: 'Sessions entrainement, coaching, produits sports et nutrition.', count: 95 },
  ];

  clientSteps = [
    { icon: '📝', title: 'Publiez votre brief', desc: 'Decrivez votre projet, smartphone requis (4K, ProRes), budget et delai.' },
    { icon: '👀', title: 'Recevez des offres', desc: 'Des createurs verifies postulent avec leur portfolio et tarif.' },
    { icon: '✅', title: 'Choisissez et Securisez', desc: 'Selectionnez le profil ideal et securisez le paiement en escrow.' },
    { icon: '🎬', title: 'Recevez le contenu', desc: 'Validez les livrables 4K et liberez le paiement en 1 clic.' },
  ];

  creatorSteps = [
    { icon: '🙋', title: 'Creez votre profil', desc: 'Ajoutez votre portfolio, votre smartphone et vos competences.' },
    { icon: '🔍', title: 'Trouvez des missions', desc: 'Parcourez les briefs des marques tunisiennes et etrangeres.' },
    { icon: '💬', title: 'Envoyez une offre', desc: 'Proposez votre tarif et discutez du projet directement.' },
    { icon: '💰', title: 'Soyez paye', desc: 'Livrez votre contenu et recevez votre paiement sur votre wallet.' },
  ];

  features = [
    { icon: '🔒', title: 'Paiement Escrow Securise', desc: 'Les fonds sont bloques jusqu\'a validation des livrables. Zero risque pour les deux parties.' },
    { icon: '📱', title: 'Createurs Smartphone Verifies', desc: 'Chaque createur est audite sur son materiel (iPhone, Samsung, Pixel) et son portfolio.' },
    { icon: '⚡', title: 'Livrables en 48h', desc: 'Delais rapides grace a notre systeme de jalons et suivi en temps reel.' },
    { icon: '💬', title: 'Messagerie Integree', desc: 'Communiquez directement avec vos createurs sans quitter la plateforme.' },
    { icon: '⭐', title: 'Avis et Notation Transparents', desc: 'Systeme d\'avis double-sens pour garantir la qualite et la confiance.' },
    { icon: '🌍', title: 'Marche Local et International', desc: 'Createurs en Tunisie, Maroc, Algerie et France pour vos campagnes.' },
  ];

  stats = [
    { num: '1 200+', label: 'Createurs smartphone verifies' },
    { num: '3 800+', label: 'Missions completees avec succes' },
    { num: '99.4%', label: 'Taux de satisfaction client' },
    { num: '48h', label: 'Delai moyen de livraison' },
  ];

  testimonials = [
    {
      text: 'SnapConnect a transforme notre strategie contenu. Les Reels produits ont double notre engagement Instagram.',
      name: 'Sana Ben Ali',
      role: 'Directrice Marketing - Alyssa Bio Skincare',
      initials: 'S'
    },
    {
      text: 'J\'ai trouve mes 3 premieres missions la semaine de mon inscription. Le systeme escrow me rassure vraiment.',
      name: 'Mehdi Trabelsi',
      role: 'Videastes Mobile - iPhone 16 Pro Max',
      initials: 'M'
    },
    {
      text: 'Pour nos campagnes UGC, c\'est la reference en Tunisie. La qualite ProRes rivalise avec des productions studio.',
      name: 'Karim Jebali',
      role: 'Fondateur - Carthage Concept Agency',
      initials: 'K'
    }
  ];
}