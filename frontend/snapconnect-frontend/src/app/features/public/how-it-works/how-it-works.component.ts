import { Component, signal } from '@angular/core';
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

        <!-- Page Header -->
        <div class="page-header text-center">
          <span class="badge badge-primary">Guide & Fonctionnement</span>
          <h1>Comment fonctionne SnapConnect</h1>
          <p>
            La première plateforme de référence, transparente et 100% sécurisée pour connecter clients et créateurs de contenu smartphone en Tunisie.
          </p>

          <!-- Perspective Switcher Tabs (Client / Creator) -->
          <div class="role-tabs">
            <button
              type="button"
              class="role-tab-btn"
              [class.active]="activeTab() === 'CLIENT'"
              (click)="activeTab.set('CLIENT')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              Pour les Clients & Marques
            </button>
            <button
              type="button"
              class="role-tab-btn"
              [class.active]="activeTab() === 'CREATOR'"
              (click)="activeTab.set('CREATOR')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5"/>
                <circle cx="12" cy="18" r="1"/>
              </svg>
              Pour les Créateurs Smartphone
            </button>
          </div>
        </div>

        <!-- 4-Step Process Section -->
        @if (activeTab() === 'CLIENT') {
          <div class="steps-container animate-fade-in">
            <div class="steps-grid">

              <!-- Step 1 -->
              <div class="step-card card-glass">
                <div class="step-badge">Étape 01</div>
                <div class="step-icon-wrap">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
                <h3>Publiez votre brief en 2 min</h3>
                <p>
                  Décrivez votre projet (Reels TikTok, photos produits, visites de lieux), précisez le smartphone requis (iPhone 16 Pro 4K, Galaxy Ultra), votre ville et votre budget en DT.
                </p>
                <span class="step-highlight">Gratuit & sans engagement</span>
              </div>

              <!-- Step 2 -->
              <div class="step-card card-glass">
                <div class="step-badge">Étape 02</div>
                <div class="step-icon-wrap">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3>Recevez des propositions sur-mesure</h3>
                <p>
                  Des créateurs vérifiés postulent avec leurs portfolios réels, leurs équipements smartphone et leurs devis. Échangez par messagerie directe pour affiner les détails.
                </p>
                <span class="step-highlight">Vidéastes vérifiés partout en Tunisie</span>
              </div>

              <!-- Step 3 -->
              <div class="step-card card-glass">
                <div class="step-badge">Étape 03</div>
                <div class="step-icon-wrap">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h3>Bloquez les fonds en séquestre</h3>
                <p>
                  Votre paiement est consigné en toute sécurité sous séquestre bancaire par SnapConnect. Le créateur n'est rémunéré qu'après votre validation des vidéos 4K.
                </p>
                <span class="step-highlight">100% Garanti & protégé</span>
              </div>

              <!-- Step 4 -->
              <div class="step-card card-glass">
                <div class="step-badge">Étape 04</div>
                <div class="step-icon-wrap">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h3>Validez les livrables 4K & libérez</h3>
                <p>
                  Recevez vos rushs et vidéos montées au format 9:16 vertical sous 48h. Validez le travail pour libérer les fonds ou demandez des révisions en 1 clic.
                </p>
                <span class="step-highlight">Livraison 48h prête pour les réseaux</span>
              </div>

            </div>

            <!-- Action CTA for Clients -->
            <div class="steps-cta text-center">
              <a routerLink="/client/jobs/create" class="btn btn-primary btn-lg">
                Publier un brief maintenant →
              </a>
              <a routerLink="/creators" class="btn btn-outline btn-lg">
                Explorer les créateurs
              </a>
            </div>
          </div>
        } @else {
          <div class="steps-container animate-fade-in">
            <div class="steps-grid">

              <!-- Step 1 -->
              <div class="step-card card-glass">
                <div class="step-badge">Étape 01</div>
                <div class="step-icon-wrap">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5"/>
                    <circle cx="12" cy="18" r="1"/>
                  </svg>
                </div>
                <h3>Créez votre profil créateur smartphone</h3>
                <p>
                  Renseignez votre smartphone (iPhone 4K ProRes, Samsung Galaxy Ultra), votre matériel (gimbal DJI, micros sans fil), vos spécialités et vos tarifs.
                </p>
                <span class="step-highlight">Inscription gratuite en 2 minutes</span>
              </div>

              <!-- Step 2 -->
              <div class="step-card card-glass">
                <div class="step-badge">Étape 02</div>
                <div class="step-icon-wrap">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <h3>Postulez aux briefs des marques</h3>
                <p>
                  Consultez les missions publiées par des restaurants, boutiques de mode et marques e-commerce en Tunisie. Envoyez vos devis et propositions personnalisées.
                </p>
                <span class="step-highlight">Des dizaines de briefs ouverts</span>
              </div>

              <!-- Step 3 -->
              <div class="step-card card-glass">
                <div class="step-badge">Étape 03</div>
                <div class="step-icon-wrap">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                </div>
                <h3>Tournez en toute sérénité</h3>
                <p>
                  Ne commencez le tournage qu'une fois le budget sécurisé sous séquestre par le client. Vous êtes assuré d'être payé dès lors que le brief est respecté.
                </p>
                <span class="step-highlight">Paiement garanti à 100%</span>
              </div>

              <!-- Step 4 -->
              <div class="step-card card-glass">
                <div class="step-badge">Étape 04</div>
                <div class="step-icon-wrap">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <h3>Encaissez vos gains directement</h3>
                <p>
                  Dès validation du livrable par le client, les fonds sont instantanément crédités sur votre wallet SnapConnect. Retirez vos revenus directement par virement.
                </p>
                <span class="step-highlight">Virements directs sans délai</span>
              </div>

            </div>

            <!-- Action CTA for Creators -->
            <div class="steps-cta text-center">
              <a routerLink="/auth/register" [queryParams]="{ role: 'CREATOR' }" class="btn btn-primary btn-lg">
                Postuler comme Créateur Mobile →
              </a>
              <a routerLink="/jobs" class="btn btn-outline btn-lg">
                Voir les briefs ouverts
              </a>
            </div>
          </div>
        }

        <!-- Escrow Protection Banner -->
        <section class="escrow-banner card-glass">
          <div class="escrow-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Séquestre Bancaire Garanti SnapConnect</span>
          </div>
          <h2>Votre argent et votre travail sont protégés à 100%</h2>
          <p class="escrow-desc">
            Grâce au séquestre de paiement SnapConnect Escrow, la plateforme agit en tiers de confiance neutre entre entreprises et créateurs.
          </p>

          <div class="escrow-pillars">
            <div class="pillar-card">
              <div class="pillar-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h4>Fonds Déposés Avant Tournage</h4>
              <p>Le créateur sait que le client a déjà payé, et l'entreprise sait que l'argent n'est débloqué qu'après validation.</p>
            </div>

            <div class="pillar-card">
              <div class="pillar-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
              </div>
              <h4>Révisions Incluses</h4>
              <p>Chaque brief prévoit des révisions de montage pour s'assurer que le contenu correspond parfaitement aux attentes.</p>
            </div>

            <div class="pillar-card">
              <div class="pillar-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h4>Médiation & Arbitrage</h4>
              <p>En cas de désaccord, notre équipe d'experts analyse le brief et les vidéos pour rendre un arbitrage équitable.</p>
            </div>
          </div>
        </section>

        <!-- FAQ Section -->
        <section class="faq-section">
          <div class="text-center section-head">
            <span class="badge badge-primary">Questions Fréquentes</span>
            <h2>Tout ce que vous devez savoir</h2>
          </div>

          <div class="faq-grid">
            <div class="faq-item card-glass">
              <h4>Pourquoi des créateurs smartphone plutôt qu'une agence classique ?</h4>
              <p>
                Les smartphones récents (iPhone 16 Pro Max 4K ProRes, Samsung S24 Ultra) offrent une qualité d'image exceptionnelle avec une réactivité incomparable. Les vidéos sont pensées nativement au format 9:16 pour TikTok et Instagram Reels, à des tarifs 3x à 5x plus abordables qu'une équipe de tournage lourde.
              </p>
            </div>

            <div class="faq-item card-glass">
              <h4>Comment se déroule le paiement ?</h4>
              <p>
                Lorsqu'un client accepte la proposition d'un créateur, le montant est consigné sous séquestre sécurisé. Le créateur réalise le tournage et livre les vidéos. Le client valide les livrables, ce qui déclenche le paiement direct sur le wallet du créateur.
              </p>
            </div>

            <div class="faq-item card-glass">
              <h4>Quels smartphones sont acceptés sur la marketplace ?</h4>
              <p>
                Nous acceptons les créateurs équipés de smartphones récents capables de filmer en 4K 60fps : séries iPhone 14/15/16 Pro avec ProRes/Log, Samsung Galaxy S23/S24 Ultra, et Google Pixel 8/9 Pro, idéalement accompagnés de stabilisateurs gimbal (DJI) et micros sans fil (Rode/DJI).
              </p>
            </div>

            <div class="faq-item card-glass">
              <h4>Combien de temps prend une livraison ?</h4>
              <p>
                La majorité des missions de tournage et montage mobile sont livrées en 48h à 72h après le tournage, permettant aux marques de publier du contenu tendance sans attendre des semaines.
              </p>
            </div>
          </div>
        </section>

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
      margin-bottom: var(--space-10);
      max-width: 820px;
      margin-left: auto;
      margin-right: auto;
    }

    .page-header h1 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      margin: var(--space-3) 0 var(--space-2);
      letter-spacing: -0.025em;
    }

    .page-header p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
      line-height: var(--line-height-relaxed);
      margin-bottom: var(--space-6);
    }

    /* Role Tabs Switcher */
    .role-tabs {
      display: inline-flex;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-full);
      padding: 5px;
      gap: 6px;
    }

    .role-tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 22px;
      border-radius: var(--radius-full);
      background: transparent;
      border: none;
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .role-tab-btn:hover {
      color: var(--color-text-primary);
    }

    .role-tab-btn.active {
      background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-500));
      color: #fff;
      box-shadow: 0 4px 14px var(--color-primary-glow);
    }

    /* Steps Grid */
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-6);
      margin-bottom: var(--space-10);
    }

    .step-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
      display: flex;
      flex-direction: column;
      position: relative;
      transition: transform var(--transition-fast), border-color var(--transition-fast);
    }

    .step-card:hover {
      transform: translateY(-3px);
      border-color: rgba(139, 92, 246, 0.4);
    }

    .step-badge {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--color-primary-400);
      margin-bottom: var(--space-3);
      text-transform: uppercase;
    }

    .step-icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: rgba(139, 92, 246, 0.12);
      border: 1px solid rgba(139, 92, 246, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-primary-400);
      margin-bottom: var(--space-4);
    }

    .step-card h3 {
      font-size: var(--font-size-md);
      font-weight: 700;
      margin-bottom: var(--space-2);
      color: var(--color-text-primary);
    }

    .step-card p {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      line-height: var(--line-height-relaxed);
      margin-bottom: var(--space-4);
      flex-grow: 1;
    }

    .step-highlight {
      font-size: 11px;
      font-weight: 600;
      color: var(--color-primary-300);
      background: rgba(139, 92, 246, 0.08);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      width: fit-content;
    }

    .steps-cta {
      display: flex;
      gap: var(--space-4);
      justify-content: center;
      margin-bottom: var(--space-16);
    }

    /* Escrow Banner */
    .escrow-banner {
      padding: var(--space-10) var(--space-8);
      border-radius: var(--radius-2xl);
      text-align: center;
      margin-bottom: var(--space-16);
      background: linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, rgba(15, 13, 27, 0.6) 100%);
      border: 1px solid rgba(139, 92, 246, 0.25);
    }

    .escrow-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: 12px;
      font-weight: 600;
      padding: 5px 14px;
      border-radius: var(--radius-full);
      background: rgba(139, 92, 246, 0.15);
      border: 1px solid rgba(139, 92, 246, 0.35);
      color: var(--color-primary-300);
      margin-bottom: var(--space-4);
    }

    .escrow-banner h2 {
      font-size: var(--font-size-2xl);
      font-weight: 800;
      margin-bottom: var(--space-2);
    }

    .escrow-desc {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
      max-width: 650px;
      margin: 0 auto var(--space-8);
    }

    .escrow-pillars {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-6);
      text-align: left;
    }

    .pillar-card {
      background: rgba(255, 255, 255, 0.025);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
    }

    .pillar-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(139, 92, 246, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-primary-400);
      margin-bottom: var(--space-3);
    }

    .pillar-card h4 {
      font-size: var(--font-size-sm);
      font-weight: 700;
      margin-bottom: var(--space-2);
      color: var(--color-text-primary);
    }

    .pillar-card p {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      line-height: var(--line-height-normal);
      margin: 0;
    }

    /* FAQ Section */
    .section-head {
      margin-bottom: var(--space-8);
    }

    .section-head h2 {
      font-size: var(--font-size-2xl);
      font-weight: 800;
      margin-top: var(--space-2);
    }

    .faq-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-6);
      max-width: 980px;
      margin: 0 auto;
    }

    .faq-item {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
    }

    .faq-item h4 {
      font-size: var(--font-size-base);
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: var(--space-2);
    }

    .faq-item p {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: var(--line-height-relaxed);
      margin: 0;
    }

    @media (max-width: 1024px) {
      .steps-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .escrow-pillars {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 680px) {
      .steps-grid {
        grid-template-columns: 1fr;
      }
      .faq-grid {
        grid-template-columns: 1fr;
      }
      .role-tabs {
        flex-direction: column;
        width: 100%;
      }
      .role-tab-btn {
        width: 100%;
        justify-content: center;
      }
      .steps-cta {
        flex-direction: column;
      }
    }
  `]
})
export class HowItWorksComponent {
  activeTab = signal<'CLIENT' | 'CREATOR'>('CLIENT');
}
