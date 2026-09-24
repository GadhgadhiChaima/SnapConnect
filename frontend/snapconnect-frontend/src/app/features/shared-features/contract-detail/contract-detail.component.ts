import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';

import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { EscrowStepperComponent, EscrowStep } from '../../../shared/components/escrow-stepper/escrow-stepper.component';
import { ReviewModalComponent } from '../../../shared/components/review-modal/review-modal.component';
import { AuthService } from '../../../core/services/auth.service';
import { WalletService } from '../../../core/services/wallet.service';
import { DisputeService } from '../../../core/services/dispute.service';
import { ReputationService } from '../../../core/services/reputation.service';
import { ContractService } from '../../../core/services/contract.service';
import { ReviewSubmitRequest } from '../../../core/models/reputation.model';
import { Contract, Delivery, DeliveryAttachment, ContractActivity } from '../../../core/models/contract.model';
import { Dispute, DisputeMessage } from '../../../core/models/dispute.model';
import { NotificationService } from '../../../core/services/notification.service';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-contract-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, SlicePipe, NavbarComponent, FooterComponent, EscrowStepperComponent, ReviewModalComponent],
  template: `
    <app-navbar></app-navbar>

    @if (contract(); as c) {
      <main class="contract-page">
        <div class="container">
          <!-- Top Header -->
          <div class="contract-header card-glass">
            <div class="header-left">
              <div class="status-tags">
                <span class="badge badge-primary">{{ c.type === 'JOB' ? 'Brief Sur Mesure' : 'Package Service' }}</span>
                <span class="badge" [class]="getStatusBadgeClass(c.status)">● {{ getStatusLabel(c.status) }}</span>
              </div>
              <h1>{{ c.title }}</h1>
              <p class="contract-dates">ID Contrat : #{{ c.id }} • Débuté le : {{ (c.startDate || c.createdAt) | slice:0:10 }} • Date limite : {{ c.deadline ? (c.deadline | slice:0:10) : 'Non définie' }} ({{ getDeadlineCountdown(c) }})</p>
            </div>

            <div class="header-right">
              <div class="escrow-box">
                <span class="escrow-lbl">Montant Séquestré</span>
                <span class="escrow-val">{{ c.amount }} DT</span>
                <span class="escrow-status">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 4px;">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>Séquestre Garanti SnapConnect
                </span>
              </div>
            </div>
          </div>

          <!-- Escrow Stepper "Where is my money?" -->
          <div class="stepper-wrap">
            <app-escrow-stepper
              [amount]="c.amount"
              [currency]="'DT'"
              [currentStep]="getEscrowStep(c.status)"
            ></app-escrow-stepper>
          </div>

          <!-- Toast feedback alert -->
          @if (uploadSuccessToast()) {
            <div class="toast-alert card-glass animate-slide-down">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--color-success); flex-shrink: 0;">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>{{ actionToastMessage() }}</span>
              <button class="toast-close" (click)="uploadSuccessToast.set(false)">✕</button>
            </div>
          }

          <!-- Client Action & Inspection Alert Banner -->
          @if (auth.isClient() && c.status === 'DELIVERY') {
            <div class="client-alert-banner card-glass">
              <div class="banner-icon-col">
                <div class="banner-icon pulse-glow">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
              </div>
              <div class="banner-text-col">
                <div class="banner-header-row">
                  <span class="badge badge-accent">Action requise</span>
                  <span class="badge badge-warning" style="margin-left: 8px;">Délai d'examen : {{ getReviewCountdown(c) }}</span>
                  <span class="banner-title">Livrables 4K reçus — En attente de votre examen & validation</span>
                </div>
                <p class="banner-desc">
                  Le créateur a finalisé le tournage et déposé ses livrables 4K haute résolution. Vous disposez de 24h pour examiner les fichiers. Passé ce délai ({{ getReviewCountdown(c) }}), les fonds seront automatiquement libérés au créateur. Examinez les vidéos en plein écran ci-dessous, vérifiez le son et le respect du brief. Vous pouvez soit approuver pour libérer les fonds ({{ c.amount }} DT), soit demander une révision gratuite ({{ (c.revisionsAllowed || 2) - (c.revisionsUsed || 0) }} restantes).
                </p>
                <div class="banner-actions-row">
                  <button (click)="openApproveModal.set(true)" class="btn btn-success btn-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="margin-right: 6px;">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Approuver & Libérer {{ c.amount }} DT
                  </button>
                  <button (click)="openRevisionModal.set(true)" class="btn btn-outline btn-sm" [disabled]="((c.revisionsAllowed || 2) - (c.revisionsUsed || 0)) <= 0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                    </svg>
                    Demander une révision ({{ (c.revisionsAllowed || 2) - (c.revisionsUsed || 0) }} restantes)
                  </button>
                  <a href="#deliverables-section" class="btn btn-ghost btn-sm">
                    Examiner les fichiers ci-dessous ↓
                  </a>
                </div>
              </div>
            </div>
          } @else if (auth.isCreator() && c.status === 'DELIVERY') {
            <div class="client-alert-banner card-glass info-mode">
              <div class="banner-icon-col">
                <div class="banner-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
              </div>
              <div class="banner-text-col">
                <div class="banner-header-row">
                  <span class="badge badge-accent">En cours d'examen (24h)</span>
                  <span class="banner-title">Livrables 4K transmis au client</span>
                </div>
                <p class="banner-desc">
                  Le client dispose d'un délai d'examen de 24h (Temps restant : {{ getReviewCountdown(c) }}). Sans retour ou demande de révision de sa part avant expiration de ce compte à rebours, vos fonds seront automatiquement libérés sur votre portefeuille.
                </p>
              </div>
            </div>
          } @else if (c.status === 'EXPIRED') {
            <div class="client-alert-banner card-glass danger-mode">
              <div class="banner-icon-col">
                <div class="banner-icon" style="background: rgba(239, 68, 68, 0.15); color: #ef4444;">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </div>
              </div>
              <div class="banner-text-col">
                <div class="banner-header-row">
                  <span class="badge badge-danger">Mission expirée</span>
                  <span class="banner-title">Délai contractuel de livraison dépassé</span>
                </div>
                <p class="banner-desc">
                  La date limite de réalisation fixée au {{ c.deadline ? (c.deadline | slice:0:10) : 'date limite' }} a été dépassée sans remise des livrables. Conformément aux règles de sécurité SnapConnect, la mission a été clôturée et les fonds de {{ c.amount }} DT ont été intégralement remboursés au client.
                </p>
              </div>
            </div>
          } @else if (c.status === 'DISPUTED' || currentDispute()) {
            <div class="client-alert-banner card-glass" [class]="getDisputeAlertBannerClass()">
              <div class="banner-icon-col">
                <div class="banner-icon" [class.pulse-glow]="isDisputeCritical()" style="background: rgba(239, 68, 68, 0.15); color: #ef4444;">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
              </div>
              <div class="banner-text-col">
                <div class="banner-header-row">
                  <span class="badge badge-danger">Réclamation & Litige Ouvert</span>
                  <span class="badge" [class]="getDisputeBadgeClass()" style="margin-left: 8px;">
                    {{ getDisputeCountdownLabel() }}
                  </span>
                  <span class="banner-title">Séquestre gelé — Médiation tripartite active</span>
                </div>
                <p class="banner-desc">
                  Une réclamation a été ouverte pour le motif : <strong>« {{ currentDispute()?.reason || c.disputeReason || 'Non-conformité' }} »</strong>.
                  Les fonds sous séquestre (<strong>{{ c.amount }} DT</strong>) sont immédiatement gelés.
                  @if (isDisputeExpired()) {
                    Le délai de réponse de 24h est <strong>expiré</strong>. Le dossier est transmis pour décision unilatérale de l'administration SnapConnect.
                  } @else {
                    Un compte à rebours de 24h est engagé pour permettre aux deux parties d'échanger et de fournir leurs pièces justificatives.
                  }
                </p>
                <div class="banner-actions-row">
                  <a href="#dispute-mediation-section" class="btn btn-warning btn-sm">
                    Rejoindre l'espace de discussion tripartite ↓
                  </a>
                </div>
              </div>
            </div>
          } @else if (auth.isClient() && c.status === 'REVISION') {
            <div class="client-alert-banner card-glass info-mode">
              <div class="banner-icon-col">
                <div class="banner-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                  </svg>
                </div>
              </div>
              <div class="banner-text-col">
                <div class="banner-header-row">
                  <span class="badge badge-warning">En cours d'ajustement</span>
                  <span class="banner-title">Révision demandée en cours de traitement</span>
                </div>
                <p class="banner-desc">
                  Vos remarques ont été transmises au créateur. Il prépare une version actualisée selon vos retours. Vous recevrez une nouvelle alerte dès le dépôt des fichiers modifiés.
                </p>
              </div>
            </div>
          } @else if (auth.isCreator() && c.status === 'REVISION') {
            <div class="client-alert-banner card-glass warning-mode">
              <div class="banner-icon-col">
                <div class="banner-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
              </div>
              <div class="banner-text-col">
                <div class="banner-header-row">
                  <span class="badge badge-warning">Action requise</span>
                  <span class="banner-title">Le client a demandé une révision sur les livrables</span>
                </div>
                <p class="banner-desc">
                  Remarque du client : « {{ getLatestDelivery()?.revisionNote || 'Ajustements demandés' }} ». Veuillez apporter les corrections nécessaires et déposer votre nouvelle version ({{ (c.revisionsAllowed || 2) - (c.revisionsUsed || 0) }} révision(s) restante(s)).
                </p>
                <div class="banner-actions-row">
                  <button (click)="openUploadModal.set(true)" class="btn btn-primary btn-sm">
                    + Déposer les livrables corrigés (v2)
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- Main Workspace Layout -->
          <div class="contract-layout">
            <!-- Left Column: Parties, Deliverables, Actions & Chat -->
            <div class="contract-main">
              <!-- Parties Card -->
              <div class="parties-card card-glass">
                <div class="party-col">
                  <span class="party-role">Client</span>
                  <div class="party-info">
                    @if (c.clientAvatar) {
                      <img [src]="c.clientAvatar" referrerpolicy="no-referrer" alt="Client" class="party-img" />
                    } @else {
                      <span class="party-avatar-box">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-primary-400);">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </span>
                    }
                    <div>
                      <strong>{{ c.clientName || 'Client' }}</strong>
                      <span class="sub">Client Entreprise</span>
                    </div>
                  </div>
                </div>

                <div class="party-sep">⇄</div>

                <div class="party-col">
                  <span class="party-role">Créateur Mobile</span>
                  <div class="party-info">
                    <a [routerLink]="['/creators', c.creatorId]" class="party-link" title="Voir le profil du créateur">
                      @if (c.creatorAvatar) {
                        <img [src]="c.creatorAvatar" referrerpolicy="no-referrer" alt="Créateur" class="party-img" />
                      } @else {
                        <span class="party-avatar-box">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-primary-400);">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </span>
                      }
                    </a>
                    <div>
                      <a [routerLink]="['/creators', c.creatorId]" class="party-name-link" title="Voir le profil du créateur">
                        <strong>{{ c.creatorName || 'Créateur' }}</strong>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Deliverables & Inspection Section -->
              <div id="deliverables-section" class="deliverables-card card-glass">
                <div class="section-head flex-between">
                  <div>
                    <div class="deliverables-title-row">
                      <h3>Espace de Livraison & Examen 4K</h3>
                      <span class="badge badge-primary">Qualité Smartphone Certifiée</span>
                    </div>
                    <p class="section-sub">
                      @if (getLatestDelivery()) {
                        Accédez aux fichiers sources 4K haute résolution partagés par le créateur via lien externe sécurisé.
                      } @else {
                        Les livrables seront déposés ici par le créateur sous forme de lien de téléchargement (WeTransfer, Google Drive, etc.).
                      }
                    </p>
                  </div>
                  @if (auth.isCreator() && c.status !== 'COMPLETED') {
                    <button (click)="openUploadModal.set(true)" class="btn btn-primary btn-sm">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                      </svg>
                      {{ getLatestDelivery() ? 'Mettre à jour le lien de livraison' : 'Transmettre le lien des livrables' }}
                    </button>
                  }
                </div>

                @if (getLatestDelivery(); as delivery) {
                  <!-- Creator Production Notes Card -->
                  @if (delivery.note) {
                    <div class="delivery-notes-card">
                      <div class="notes-header">
                        <div class="notes-author">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-primary-400);">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          <strong>Notes de réalisation du créateur :</strong>
                        </div>
                        <span class="delivery-timestamp">Déposé le {{ (delivery.submittedAt || c.createdAt) | slice:0:10 }}</span>
                      </div>
                      <p class="notes-content">{{ delivery.note }}</p>
                    </div>
                  }

                  <!-- Cloud Links Display (WeTransfer, Google Drive, Dropbox) -->
                  @if (delivery.links && delivery.links.length > 0) {
                    <div class="cloud-links-grid">
                      @for (link of delivery.links; track $index) {
                        <div class="cloud-delivery-hero card-glass">
                          <div class="cloud-hero-icon-box">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            </svg>
                          </div>
                          <div class="cloud-hero-details">
                            <div class="cloud-provider-badge-row">
                              <span class="badge badge-primary">{{ getCloudProviderName(link) }}</span>
                              <span class="cloud-security-hint">Qualité 4K ProRes originale non compressée</span>
                            </div>
                            <strong class="cloud-hero-title">Lien de téléchargement des fichiers 4K</strong>
                            <a [href]="link" target="_blank" rel="noopener noreferrer" class="cloud-url-link" title="Ouvrir le lien">
                              {{ link }}
                            </a>
                          </div>
                          <div class="cloud-hero-actions">
                            <a [href]="link" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-md">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                              Télécharger sur {{ getCloudProviderName(link) }} ↗
                            </a>
                          </div>
                        </div>
                      }
                    </div>
                  }

                  <!-- Client Decision Panel (Only when deliverables are present!) -->
                  @if (auth.isClient() && c.status !== 'COMPLETED') {
                    <div class="client-decision-section">
                      <div class="decision-head">
                        <h4>Décision sur les Livrables Reçus</h4>
                        <p>Vérifiez le son, le cadrage et l'étalonnage des vidéos téléchargées ci-dessus avant de valider la prestation.</p>
                      </div>

                      <div class="decision-cards-grid">
                        <!-- Choice 1: Approve -->
                        <div class="decision-card approve-card">
                          <div class="decision-card-icon success">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                              <polyline points="9 12 11 14 15 10"></polyline>
                            </svg>
                          </div>
                          <div class="decision-card-info">
                            <strong>Tout est conforme (Recommandé)</strong>
                            <p>Les vidéos répondent à votre brief. Le séquestre de <strong>{{ c.amount }} DT</strong> sera libéré immédiatement au créateur.</p>
                          </div>
                          <button (click)="openApproveModal.set(true)" class="btn btn-success btn-md">
                            Approuver & Libérer {{ c.amount }} DT
                          </button>
                        </div>

                        <!-- Choice 2: Revision -->
                        <div class="decision-card revision-card">
                          <div class="decision-card-icon warning">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                            </svg>
                          </div>
                          <div class="decision-card-info">
                            <strong>Demander une retouche</strong>
                            <p>Indiquez vos remarques précises. Il vous reste <strong>{{ (c.revisionsAllowed || 2) - (c.revisionsUsed || 0) }} révision(s) gratuite(s)</strong>.</p>
                          </div>
                          <button (click)="openRevisionModal.set(true)" class="btn btn-outline btn-md" [disabled]="((c.revisionsAllowed || 2) - (c.revisionsUsed || 0)) <= 0">
                            Demander une révision
                          </button>
                        </div>
                      </div>

                      <div class="dispute-sublink-row">
                        <span class="dispute-hint">Un problème de conformité majeur non résolu ?</span>
                        <button (click)="openDisputeModal.set(true)" class="btn btn-link text-warning">
                          Ouvrir une médiation / litige
                        </button>
                      </div>
                    </div>
                  }
                } @else {
                  <!-- State when no delivery has been submitted yet -->
                  <div class="waiting-delivery-card animate-fade-in">
                    <div class="waiting-icon-box">
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <div class="waiting-content">
                      <h4>Tournage smartphone en cours</h4>
                      <p>Le créateur réalise vos contenus en qualité smartphone certifiée. Dès la fin du tournage, il déposera ici son lien de téléchargement direct (WeTransfer, Google Drive, Dropbox) pour votre validation.</p>
                      <div class="escrow-reassurance-chip">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-success); margin-right: 6px;">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                          <polyline points="9 12 11 14 15 10"></polyline>
                        </svg>
                        <span>Garantie Séquestre Active : Vos {{ c.amount }} DT restent protégés en sécurité tant que vous n'avez pas validé les fichiers.</span>
                      </div>
                    </div>
                  </div>
                }

                @if (c.status === 'COMPLETED') {
                  <div class="completed-banner flex-between">
                    <div class="completed-info">
                      <span class="chk">✓</span>
                      <div>
                        <strong>Contrat validé avec succès & Paiement libéré !</strong>
                        <p>Le paiement sous séquestre de {{ c.amount }} DT a été libéré au créateur. Les fichiers sources restent téléchargeables en permanence.</p>
                      </div>
                    </div>
                    @if (!hasReviewed()) {
                      <button (click)="openReviewModal.set(true)" class="btn btn-warning btn-sm">
                        Laisser un avis vérifié
                      </button>
                    } @else {
                      <span class="badge badge-success">Avis publié</span>
                    }
                  </div>
                }
              </div>

              <!-- Message / Discussion Thread -->
              <div class="chat-card card-glass">
                <div class="chat-head flex-between">
                  <h3>Discussion du projet & Notes de tournage</h3>
                  <span class="chat-hint">Chiffrement de bout en bout</span>
                </div>
                <div class="chat-messages">
                  <div class="chat-msg from-creator">
                    <span class="chat-author">Sarah Ben Salem (Créatrice) :</span>
                    <p>Bonjour ! Je viens de déposer les 2 premiers reels tournés en 4K ProRes avec transitions stabilisées. Dites-moi ce que vous en pensez !</p>
                    <span class="chat-time">Aujourd'hui 11:20</span>
                  </div>

                  <div class="chat-msg from-client">
                    <span class="chat-author">Maison Alyssa Cosmétiques (Vous) :</span>
                    <p>L'éclairage sur les textures cosmétiques est superbe ! Nous validons le premier lot.</p>
                    <span class="chat-time">Aujourd'hui 11:45</span>
                  </div>
                </div>

                <div class="chat-input-row">
                  <input type="text" [(ngModel)]="newMessage" (keyup.enter)="sendMessage()" placeholder="Écrivez un message concernant ce tournage..." class="form-input" />
                  <button (click)="sendMessage()" class="btn btn-primary btn-sm">Envoyer</button>
                </div>
              </div>

              <!-- DEDICATED 3-WAY DISPUTE & MEDIATION SPACE (CLIENT + CREATOR + ADMIN) -->
              @if (c.status === 'DISPUTED' || currentDispute()) {
                <div id="dispute-mediation-section" class="chat-card card-glass dispute-mediation-box animate-fade-in">
                  <div class="chat-head mediation-head">
                    <div class="mediation-title-wrap">
                      <div class="mediation-badges-top">
                        <span class="badge badge-danger">Litige & Médiation Tripartite</span>
                        <span class="badge" [class]="getDisputeBadgeClass()">
                          {{ getDisputeCountdownLabel() }}
                        </span>
                      </div>
                      <h3>Espace d'Arbitrage Officiel (Client • Créateur • Admin)</h3>
                      <p class="chat-hint">
                        Cet espace de discussion est exclusivement réservé au traitement de la réclamation. Toutes les parties et l'administrateur SnapConnect y ont accès pour statuer sur les livrables 4K et le séquestre.
                      </p>
                    </div>
                  </div>

                  <div class="chat-messages dispute-chat-feed">
                    @for (msg of disputeMessages(); track msg.id) {
                      <div class="chat-msg" [class.msg-admin]="msg.senderRole === 'ADMIN'">
                        <div class="msg-bubble card" [class.admin-bubble]="msg.senderRole === 'ADMIN'">
                          <div class="msg-meta-row">
                            <strong class="msg-sender">{{ msg.senderName }}</strong>
                            <span class="badge badge-xs" [class]="getRoleBadgeClass(msg.senderRole)">{{ getRoleLabel(msg.senderRole) }}</span>
                            <span class="msg-time">{{ msg.createdAt | slice:11:16 }}</span>
                          </div>
                          <p class="msg-txt">{{ msg.content }}</p>
                          @if (msg.attachmentUrl) {
                            <div class="msg-attachment-pill">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: -2px;">
                                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                              </svg>
                              <a [href]="msg.attachmentUrl" target="_blank" rel="noopener noreferrer">
                                {{ msg.attachmentName || 'Preuve / Pièce justificative' }} ↗
                              </a>
                            </div>
                          }
                        </div>
                      </div>
                    } @empty {
                      <div class="empty-dispute-chat">
                        <p>Aucun message dans l'espace de réclamation pour l'instant.</p>
                      </div>
                    }
                  </div>

                  @if (currentDispute()?.status !== 'CLOSED' && currentDispute()?.status !== 'RESOLVED_CLIENT' && currentDispute()?.status !== 'RESOLVED_CREATOR' && currentDispute()?.status !== 'PARTIAL_RESOLUTION') {
                    <div class="dispute-input-form">
                      <textarea
                        [(ngModel)]="newDisputeMsgContent"
                        rows="2"
                        placeholder="Rédigez votre argumentaire ou réponse pour la médiation..."
                        class="form-textarea"
                        style="margin-bottom: 8px;"
                      ></textarea>
                      <div class="dispute-input-bottom">
                        <input
                          type="url"
                          [(ngModel)]="newDisputeAttachmentUrl"
                          placeholder="Lien pièce justificative ou preuve (Drive, WeTransfer, image...)"
                          class="form-input form-input-sm"
                        />
                        <button (click)="sendDisputeMsg()" class="btn btn-warning btn-sm" [disabled]="!newDisputeMsgContent.trim() || isSendingDisputeMsg()">
                          Envoyer au dossier
                        </button>
                      </div>
                    </div>
                  } @else {
                    <div class="dispute-closed-banner">
                      <span>Ce litige a été arbitré et clôturé par l'Administration SnapConnect.</span>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Right Sidebar: Scope, Financial Breakdown & Escrow Guarantee -->
            <aside class="contract-sidebar">
              <div class="summary-card card-glass">
                <h4>Récapitulatif Financier</h4>
                <div class="summary-list">
                  <div class="s-item">
                    <span>Type de Mission :</span>
                    <strong>{{ c.type === 'JOB' ? 'Brief Sur Mesure' : 'Package Clé en Main' }}</strong>
                  </div>
                  <div class="s-item">
                    <span>Prix Brut du Projet :</span>
                    <strong>{{ c.amount }} DT</strong>
                  </div>
                  <div class="s-item">
                    <span>Commission Plateforme :</span>
                    <span class="text-muted">10% ({{ c.amount * 0.1 }} DT)</span>
                  </div>
                  <div class="s-item">
                    <span>Gains Nets Créateur :</span>
                    <strong class="text-success">{{ c.amount * 0.9 }} DT</strong>
                  </div>
                  <div class="s-item">
                    <span>Révisions :</span>
                    <strong>{{ c.revisionsUsed || 0 }} / {{ c.revisionsAllowed || 2 }} utilisées</strong>
                  </div>
                  <div class="s-item">
                    <span>Statut du Séquestre :</span>
                    <span class="badge" [class]="c.status === 'COMPLETED' ? 'badge-success' : 'badge-accent'">
                      {{ c.status === 'COMPLETED' ? 'Fonds libérés' : (c.status === 'DISPUTED' ? 'Fonds gelés' : 'Bloqué & Sécurisé') }}
                    </span>
                  </div>
                </div>

                <div class="support-box">
                  <span class="sup-title">Garantie Séquestre SnapConnect</span>
                  <p>Les fonds restent protégés en séquestre. En cas de litige ou non-conformité, l'arbitrage SnapConnect intervient sous 24h.</p>
                  @if (c.status !== 'COMPLETED' && c.status !== 'EXPIRED' && c.status !== 'DISPUTED') {
                    <button (click)="openDisputeModal.set(true)" class="btn btn-outline btn-xs text-danger" style="margin-top: 8px; width: 100%;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: -2px;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      Signaler un problème / Réclamation
                    </button>
                  }
                </div>
              </div>

              <!-- Audit & Traceability Activity Timeline Card -->
              @if (activities().length > 0) {
                <div class="summary-card card-glass" style="margin-top: var(--space-6);">
                  <h4>Historique & Traçabilité</h4>
                  <div class="audit-timeline">
                    @for (act of activities(); track act.id) {
                      <div class="audit-item">
                        <div class="audit-bullet"></div>
                        <div class="audit-content">
                          <div class="audit-header">
                            <span class="audit-action">{{ getActionLabel(act.action) }}</span>
                            <span class="audit-time">{{ act.createdAt | slice:0:16 }}</span>
                          </div>
                          <p class="audit-desc">{{ act.description }}</p>
                          @if (act.actorName) {
                            <span class="audit-actor">Par : {{ act.actorName }} ({{ act.actorRole }})</span>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </aside>
          </div>
        </div>
      </main>

      <!-- 1. Double-Confirmation Approval Modal -->
      @if (openApproveModal()) {
        <div class="modal-backdrop" (click)="openApproveModal.set(false)">
          <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
            <button class="close-btn" (click)="openApproveModal.set(false)">✕</button>

            <h2>Confirmation d'approbation & Libération des fonds</h2>
            <p class="modal-sub">Veuillez vérifier attentivement les détails financiers avant de confirmer.</p>

            <div class="confirm-breakdown card">
              <div class="cb-row">
                <span>Contrat :</span>
                <strong>{{ c.title }}</strong>
              </div>
              <div class="cb-row">
                <span>Créateur :</span>
                <a [routerLink]="['/creators', c.creatorId || 'cr-1']" class="party-name-link" title="Voir le profil">
                  <strong>{{ c.creatorName }}</strong>
                </a>
              </div>
              <div class="cb-row">
                <span>Total Séquestre Libéré :</span>
                <strong class="text-lg">{{ c.amount }} DT</strong>
              </div>
              <div class="cb-row">
                <span>Le Créateur Reçoit :</span>
                <strong class="text-success">{{ c.amount * 0.9 }} DT (Net)</strong>
              </div>
            </div>

            <div class="warning-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -3px; margin-right: 6px; flex-shrink: 0;">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span><strong>Action irréversible :</strong> La confirmation libère instantanément les fonds du séquestre vers le portefeuille du créateur.</span>
            </div>

            <div class="modal-actions">
              <button type="button" (click)="openApproveModal.set(false)" class="btn btn-outline">Annuler</button>
              <button type="button" (click)="confirmApproval()" class="btn btn-success">
                Oui, Libérer {{ c.amount }} DT Maintenant
              </button>
            </div>
          </div>
        </div>
      }

      <!-- 2. Request Revision Modal -->
      @if (openRevisionModal()) {
        <div class="modal-backdrop" (click)="openRevisionModal.set(false)">
          <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
            <button class="close-btn" (click)="openRevisionModal.set(false)">✕</button>

            <h2>Demande de révision vidéo / photo</h2>
            <p class="modal-sub">Précisez les modifications souhaitées afin que le créateur ajuste le montage ou retourne un plan.</p>

            <form (ngSubmit)="submitRevision()" class="modal-form">
              <div class="form-group">
                <label class="form-label">Type d'ajustement</label>
                <select [(ngModel)]="revisionCategory" name="cat" class="form-select" required>
                  <option value="COLOR">Étalonnage des couleurs / LUT</option>
                  <option value="AUDIO">Niveaux audio / Musique / Voix off</option>
                  <option value="PACING">Rythme / Transitions & Coupes</option>
                  <option value="FRAMING">Cadrage / Format vertical 9:16</option>
                  <option value="OTHER">Autre ajustement spécifique</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Instructions détaillées avec minutage (Timecodes)</label>
                <textarea
                  [(ngModel)]="revisionNote"
                  name="note"
                  rows="4"
                  class="form-textarea"
                  placeholder="ex. À 0:05, accélérer la transition vers le déballage produit..."
                  required
                ></textarea>
              </div>

              <div class="modal-actions">
                <button type="button" (click)="openRevisionModal.set(false)" class="btn btn-outline">Annuler</button>
                <button type="submit" class="btn btn-primary">Envoyer la demande de révision</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- 3. Open Dispute Modal -->
      @if (openDisputeModal()) {
        <div class="modal-backdrop" (click)="openDisputeModal.set(false)">
          <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
            <button class="close-btn" (click)="openDisputeModal.set(false)">✕</button>

            <h2>Ouvrir une demande de médiation</h2>
            <p class="modal-sub">Les fonds restent bloqués en séquestre pendant que l'équipe SnapConnect examine le dossier.</p>

            <form (ngSubmit)="submitDispute()" class="modal-form">
              <div class="form-group">
                <label class="form-label">Motif du litige</label>
                <select [(ngModel)]="disputeReason" name="reason" class="form-select" required>
                  <option value="WORK_DIFFERS_FROM_BRIEF">Livrables non conformes au brief initial</option>
                  <option value="POOR_QUALITY">Qualité vidéo / audio insuffisante</option>
                  <option value="DEADLINE_EXCEEDED">Délai dépassé / Créateur injoignable</option>
                  <option value="MISSING_FILES">Fichiers livrables manquants</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Explication détaillée</label>
                <textarea
                  [(ngModel)]="disputeDescription"
                  name="desc"
                  rows="4"
                  class="form-textarea"
                  placeholder="Décrivez précisément la situation pour notre équipe de médiation..."
                  required
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Lien pièce justificative / Preuve (optionnel)</label>
                <input
                  type="url"
                  [(ngModel)]="disputeEvidenceUrl"
                  name="evidenceUrl"
                  class="form-input"
                  placeholder="https://drive.google.com/... ou lien photo/vidéo"
                />
              </div>

              <div class="modal-actions">
                <button type="button" (click)="openDisputeModal.set(false)" class="btn btn-outline">Annuler</button>
                <button type="submit" class="btn btn-warning">Transmettre le litige à la médiation</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- 4. Link Delivery Modal (WeTransfer / Google Drive / Dropbox) -->
      @if (openUploadModal()) {
        <div class="modal-backdrop" (click)="openUploadModal.set(false)">
          <div class="modal-card card-glass animate-scale-in upload-modal-card" (click)="$event.stopPropagation()">
            <button class="close-btn" (click)="openUploadModal.set(false)">✕</button>

            <h2>Transmettre les livrables 4K (Lien WeTransfer / Cloud)</h2>
            <p class="modal-sub">Partagez vos vidéos 4K ProRes smartphone via un lien WeTransfer, Google Drive ou Dropbox pour validation client.</p>

            <form (ngSubmit)="submitUpload()" class="modal-form">
              <div class="form-group">
                <label class="form-label">Lien de téléchargement (WeTransfer, Google Drive, Dropbox...) *</label>
                <div class="cloud-input-wrap">
                  <input
                    type="url"
                    [(ngModel)]="uploadUrl"
                    name="url"
                    class="form-input"
                    placeholder="https://we.tl/... ou https://drive.google.com/drive/folders/..."
                    required
                  />
                </div>
                <div class="cloud-modal-hint">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-primary-400); flex-shrink: 0;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span>Recommandé pour préserver la qualité 4K ProRes sans limite de taille ni compression. Veillez à ce que le lien soit accessible publiquement.</span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Notes de réalisation & Instructions client</label>
                <textarea
                  [(ngModel)]="uploadNote"
                  name="note"
                  class="form-textarea"
                  placeholder="ex. 3 Reels 4K 60fps montés avec sous-titres + rushs bruts. Le lien WeTransfer est valable 7 jours. Mot de passe archive : aucun."
                  rows="3"
                ></textarea>
              </div>

              <div class="modal-actions">
                <button type="button" (click)="openUploadModal.set(false)" class="btn btn-outline">Annuler</button>
                <button type="submit" class="btn btn-primary" [disabled]="!uploadUrl.trim() || isUploading()">
                  @if (isUploading()) {
                    <span>Transmission en cours...</span>
                  } @else {
                    <span>Transmettre le lien au client</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- 5. Two-Sided Review Modal -->
      @if (openReviewModal()) {
        <app-review-modal
          [contractId]="c.id"
          [reviewerId]="auth.currentUser()?.id || (auth.isClient() ? c.clientId : c.creatorId) || 'cl-1'"
          [reviewerName]="auth.currentUser()?.fullName || (auth.isClient() ? c.clientName : c.creatorName) || 'Utilisateur'"
          [revieweeId]="auth.isClient() ? (c.creatorId || 'cr-1') : (c.clientId || 'cl-1')"
          [isClientReviewingCreator]="auth.isClient()"
          (close)="openReviewModal.set(false)"
          (reviewSubmitted)="onReviewSubmitted($event)"
        ></app-review-modal>
      }

      <!-- 6. Video & Media Preview Modal -->
      @if (openMediaPreviewModal() && previewMediaItem(); as media) {
        <div class="modal-backdrop" (click)="closeMediaPreview()">
          <div class="media-lightbox-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
            <div class="lightbox-header">
              <div class="lightbox-title-box">
                <span class="badge badge-primary">{{ media.type === 'VIDEO' ? 'Vidéo 4K 60fps' : 'Image ProRAW' }}</span>
                <h3>{{ media.name }}</h3>
              </div>
              <button class="close-btn" (click)="closeMediaPreview()" aria-label="Fermer">✕</button>
            </div>

            <div class="lightbox-media-container">
              @if (media.type === 'VIDEO') {
                <video
                  [src]="media.url"
                  controls
                  autoplay
                  playsinline
                  class="lightbox-video-player">
                </video>
              } @else {
                <img
                  [src]="media.url"
                  [alt]="media.name"
                  class="lightbox-image-viewer" />
              }
            </div>

            <div class="lightbox-footer">
              <div class="lightbox-specs">
                <div class="spec-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5"/>
                    <circle cx="12" cy="18" r="1"/>
                  </svg>
                  <span>{{ media.gear || 'iPhone 16 Pro Max • ProRes 4K' }}</span>
                </div>
                <div class="spec-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                  <span>Format 9:16 Vertical • 60 images/sec</span>
                </div>
              </div>

              @if (auth.isClient() && c.status !== 'COMPLETED') {
                <div class="lightbox-actions">
                  <button (click)="closeMediaPreview(); openRevisionModal.set(true)" class="btn btn-outline btn-sm">
                    Demander une retouche
                  </button>
                  <button (click)="closeMediaPreview(); openApproveModal.set(true)" class="btn btn-success btn-sm">
                    Valider ce livrable
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      }
    } @else if (notFound()) {
      <!-- 404 — Contrat introuvable -->
      <main class="contract-page">
        <div class="container">
          <div class="not-found-card card-glass" style="text-align:center; padding: var(--space-12) var(--space-6); border-radius: var(--radius-2xl); margin-top: var(--space-8);">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" style="color: var(--color-primary-400); margin-bottom: var(--space-4);">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h2 style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); margin-bottom: var(--space-2);">Contrat introuvable</h2>
            <p style="color: var(--color-text-secondary); margin-bottom: var(--space-6);">Ce contrat n'existe pas ou vous n'êtes pas autorisé à y accéder.</p>
            <a routerLink="/creator/dashboard" class="btn btn-outline btn-sm">← Retour au tableau de bord</a>
          </div>
        </div>
      </main>
    } @else {
      <!-- Chargement -->
      <main class="contract-page">
        <div class="container" style="display:flex; justify-content:center; align-items:center; min-height:60vh;">
          <div style="text-align:center; color: var(--color-text-muted);">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite; color: var(--color-primary-400);">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <p style="margin-top: var(--space-3);">Chargement du contrat...</p>
          </div>
        </div>
      </main>
    }

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .contract-page {
      padding-top: calc(var(--navbar-height) + var(--space-6));
      padding-bottom: var(--space-20);
    }

    .contract-header {
      padding: var(--space-6) var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-6);
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .status-tags {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-2);
    }

    .contract-header h1 {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-black);
      margin: 0 0 var(--space-1);
    }

    .contract-dates {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .escrow-box {
      background: rgba(15, 23, 42, 0.6);
      padding: var(--space-4) var(--space-6);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      text-align: center;
      display: flex;
      flex-direction: column;
    }

    .escrow-lbl {
      font-size: 10px;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }

    .escrow-val {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-black);
      color: var(--color-success);
    }

    .escrow-status {
      font-size: 11px;
      color: var(--color-primary-300);
      font-weight: bold;
    }

    .stepper-wrap {
      margin-bottom: var(--space-6);
    }

    .contract-layout {
      display: grid;
      grid-template-columns: 2.2fr 1fr;
      gap: var(--space-8);
      align-items: start;
    }

    .contract-main {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .parties-card {
      padding: var(--space-5) var(--space-6);
      border-radius: var(--radius-xl);
      display: flex;
      justify-content: space-around;
      align-items: center;
    }

    .party-col {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .party-role {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wider);
      color: var(--color-text-muted);
    }

    .party-info {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .party-avatar { font-size: 2rem; }
    .party-img {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--color-primary-500);
    }

    .party-info strong { display: block; font-size: var(--font-size-sm); }
    .party-info .sub { font-size: 11px; color: var(--color-primary-400); }

    .party-link {
      display: inline-flex;
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: transform var(--transition-fast);
      flex-shrink: 0;
    }
    .party-link:hover {
      transform: scale(1.08);
    }

    .party-name-link {
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }
    .party-name-link:hover strong {
      color: var(--color-primary-300);
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .party-sep {
      font-size: 1.5rem;
      color: var(--color-border);
    }

    .deliverables-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
    }

    .deliverables-card h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      margin: 0;
    }

    .section-sub {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-top: 2px;
    }

    .files-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin: var(--space-5) 0;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4);
      border-radius: var(--radius-md);
    }

    .file-icon { font-size: 1.8rem; }
    .file-meta { flex-grow: 1; display: flex; flex-direction: column; gap: 2px; }
    .file-meta strong { font-size: var(--font-size-sm); }
    .file-meta span { font-size: 11px; color: var(--color-text-muted); }

    .client-actions-box {
      margin-top: var(--space-5);
      padding: var(--space-5);
      background: rgba(34, 197, 94, 0.08);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: var(--radius-xl);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .action-text strong { display: block; color: var(--color-success); font-size: var(--font-size-sm); }
    .action-text p { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin: 0; }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .completed-banner {
      margin-top: var(--space-4);
      padding: var(--space-4) var(--space-5);
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid var(--color-success);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .completed-banner .chk {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--color-success);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
    }

    .completed-banner strong { color: var(--color-success); font-size: var(--font-size-sm); display: block; }
    .completed-banner p { color: var(--color-text-secondary); font-size: var(--font-size-xs); margin: 0; }

    /* Chat card */
    .chat-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
    }

    .chat-head {
      margin-bottom: var(--space-4);
    }

    .chat-head h3 {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      margin: 0;
    }

    .chat-hint {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .chat-messages {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      max-height: 220px;
      overflow-y: auto;
      margin-bottom: var(--space-4);
    }

    .chat-msg {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      max-width: 80%;
    }

    .chat-msg.from-creator {
      align-self: flex-start;
      background: rgba(139, 92, 246, 0.12);
      border: 1px solid rgba(139, 92, 246, 0.3);
    }

    .chat-msg.from-client {
      align-self: flex-end;
      background: rgba(236, 72, 153, 0.12);
      border: 1px solid rgba(236, 72, 153, 0.3);
    }

    .chat-author { font-size: 11px; font-weight: bold; display: block; margin-bottom: 2px; }
    .chat-msg p { font-size: var(--font-size-sm); margin: 0 0 4px; }
    .chat-time { font-size: 10px; color: var(--color-text-muted); float: right; }

    .chat-input-row {
      display: flex;
      gap: var(--space-2);
    }

    /* Sidebar */
    .summary-card {
      padding: var(--space-6);
      border-radius: var(--radius-xl);
      position: sticky;
      top: calc(var(--navbar-height) + var(--space-6));
    }

    .summary-card h4 {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-4);
    }

    .summary-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .s-item {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .support-box {
      margin-top: var(--space-6);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border-subtle);
      font-size: var(--font-size-xs);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sup-title {
      font-weight: bold;
      color: var(--color-primary-300);
    }

    .support-box p {
      color: var(--color-text-muted);
      margin: 0;
      line-height: var(--line-height-normal);
    }

    .support-link-btn {
      background: none;
      border: none;
      padding: 0;
      color: var(--color-accent-300);
      cursor: pointer;
      font-size: var(--font-size-xs);
      text-align: left;
      text-decoration: underline;
    }

    /* Modals */
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
      max-width: 500px;
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

    .modal-card h2 { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); margin-bottom: var(--space-1); }
    .modal-sub { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-bottom: var(--space-5); }
    .modal-form { display: flex; flex-direction: column; gap: var(--space-4); }

    .confirm-breakdown {
      padding: var(--space-4);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }

    .cb-row {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-sm);
    }

    .warning-box {
      padding: var(--space-3) var(--space-4);
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: var(--radius-md);
      font-size: var(--font-size-xs);
      color: #fbbf24;
      margin-bottom: var(--space-5);
    }

    .modal-actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-4); }

    /* Toast feedback */
    .toast-alert {
      padding: var(--space-4) var(--space-6);
      border-radius: var(--radius-xl);
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-6);
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
    }
    .toast-close {
      margin-left: auto;
      background: none;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      font-size: 1.1rem;
    }

    /* Client Action & Inspection Alert Banner */
    .client-alert-banner {
      padding: var(--space-5) var(--space-6);
      border-radius: var(--radius-xl);
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.3);
      display: flex;
      gap: var(--space-5);
      align-items: flex-start;
      margin-bottom: var(--space-6);
    }
    .client-alert-banner.info-mode {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
    }
    .client-alert-banner.warning-mode {
      background: rgba(245, 158, 11, 0.1);
      border-color: rgba(245, 158, 11, 0.3);
    }
    .banner-icon-col {
      flex-shrink: 0;
    }
    .banner-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-lg);
      background: rgba(99, 102, 241, 0.2);
      color: var(--color-primary-300);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .client-alert-banner.info-mode .banner-icon {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }
    .client-alert-banner.warning-mode .banner-icon {
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
    }
    .pulse-glow {
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
    }
    .banner-text-col {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .banner-header-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }
    .banner-title {
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-base);
    }
    .banner-desc {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin: 0;
      line-height: var(--line-height-normal);
    }
    .banner-actions-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-top: var(--space-2);
      flex-wrap: wrap;
    }

    .party-avatar-box {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Deliverables Inspection Section */
    .deliverables-title-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .delivery-notes-card {
      margin-top: var(--space-5);
      padding: var(--space-4) var(--space-5);
      border-radius: var(--radius-lg);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--color-border-subtle);
    }
    .notes-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-2);
      flex-wrap: wrap;
      gap: var(--space-2);
    }
    .notes-author {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
    }
    .delivery-timestamp {
      font-size: 11px;
      color: var(--color-text-muted);
    }
    .notes-content {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      margin: 0 0 var(--space-3);
      line-height: var(--line-height-normal);
      font-style: italic;
    }
    .specs-pills-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
    .spec-pill {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--color-border-subtle);
      color: var(--color-text-secondary);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    /* Deliverables Gallery */
    .deliverables-gallery {
      margin-top: var(--space-5);
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: var(--space-4);
    }
    .deliverable-card {
      border-radius: var(--radius-lg);
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid var(--color-border);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform var(--transition-fast), border-color var(--transition-fast);
    }
    .deliverable-card:hover {
      transform: translateY(-2px);
      border-color: var(--color-primary-500);
    }
    .deliverable-preview-area {
      height: 180px;
      background: #020617;
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .video-thumb-overlay, .image-thumb-overlay {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(180deg, rgba(2, 6, 23, 0.3) 0%, rgba(2, 6, 23, 0.7) 100%);
    }
    .format-tag {
      position: absolute;
      top: 8px;
      left: 8px;
      font-size: 10px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: var(--color-primary-300);
    }
    .duration-tag {
      position: absolute;
      bottom: 8px;
      right: 8px;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
    }
    .play-btn-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.9);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.6);
      transition: transform var(--transition-fast);
    }
    .deliverable-preview-area:hover .play-btn-circle {
      transform: scale(1.15);
    }
    .play-btn-circle.zoom-mode {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #fff;
    }
    .deliverable-body {
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      flex-grow: 1;
    }
    .file-name {
      font-size: var(--font-size-sm);
      word-break: break-all;
    }
    .file-specs {
      font-size: 11px;
      color: var(--color-text-muted);
    }
    .file-actions-row {
      display: flex;
      gap: var(--space-2);
      margin-top: auto;
      padding-top: var(--space-2);
    }

    /* Cloud Delivery Hero Card */
    .cloud-links-grid {
      margin-top: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    .cloud-delivery-hero {
      display: flex;
      align-items: center;
      gap: var(--space-5);
      padding: var(--space-5) var(--space-6);
      border-radius: var(--radius-xl);
      background: rgba(19, 27, 52, 0.7);
      border: 1px solid rgba(139, 92, 246, 0.3);
      flex-wrap: wrap;
    }
    .cloud-hero-icon-box {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-lg);
      background: rgba(139, 92, 246, 0.15);
      color: var(--color-primary-400);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .cloud-hero-details {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 250px;
    }
    .cloud-provider-badge-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: 2px;
    }
    .cloud-security-hint {
      font-size: 11px;
      color: var(--color-text-muted);
    }
    .cloud-hero-title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
    }
    .cloud-url-link {
      font-size: var(--font-size-xs);
      color: var(--color-primary-300);
      text-decoration: underline;
      word-break: break-all;
    }
    .cloud-url-link:hover {
      color: #fff;
    }
    .cloud-hero-actions {
      flex-shrink: 0;
    }

    /* Waiting Delivery State Card */
    .waiting-delivery-card {
      margin-top: var(--space-4);
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
      padding: var(--space-6);
      background: rgba(15, 23, 42, 0.5);
      border: 1px dashed rgba(139, 92, 246, 0.35);
      border-radius: var(--radius-xl);
    }
    .waiting-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(139, 92, 246, 0.12);
      color: var(--color-primary-400);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .waiting-content {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .waiting-content h4 {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      margin: 0;
      color: var(--color-text-primary);
    }
    .waiting-content p {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin: 0;
      line-height: var(--line-height-normal);
    }
    .escrow-reassurance-chip {
      margin-top: var(--space-2);
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: var(--radius-full);
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.25);
      font-size: 11px;
      color: var(--color-success);
      width: fit-content;
    }

    /* Client Decision Section */
    .client-decision-section {
      margin-top: var(--space-6);
      padding-top: var(--space-5);
      border-top: 1px solid var(--color-border-subtle);
    }
    .decision-head h4 {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      margin: 0 0 2px;
    }
    .decision-head p {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin: 0 0 var(--space-4);
    }
    .decision-cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }
    .decision-card {
      padding: var(--space-5);
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-border);
      background: rgba(255, 255, 255, 0.02);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .decision-card.approve-card {
      border-color: rgba(34, 197, 94, 0.3);
      background: rgba(34, 197, 94, 0.05);
    }
    .decision-card.revision-card {
      border-color: rgba(245, 158, 11, 0.3);
      background: rgba(245, 158, 11, 0.05);
    }
    .decision-card-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .decision-card-icon.success {
      background: rgba(34, 197, 94, 0.15);
      color: var(--color-success);
    }
    .decision-card-icon.warning {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
    }
    .decision-card-info strong {
      display: block;
      font-size: var(--font-size-sm);
      margin-bottom: 2px;
    }
    .decision-card-info p {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin: 0;
      line-height: var(--line-height-normal);
    }
    .dispute-sublink-row {
      margin-top: var(--space-3);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
    }
    .dispute-hint {
      color: var(--color-text-muted);
    }

    /* Upload modal styles for Cloud delivery */
    .upload-modal-card {
      max-width: 540px;
    }
    .cloud-modal-hint {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
      margin-top: var(--space-2);
      padding: var(--space-3);
      background: rgba(139, 92, 246, 0.08);
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: var(--radius-md);
      font-size: 11px;
      color: var(--color-text-secondary);
      line-height: 1.4;
    }

    /* Media Lightbox Modal */
    .media-lightbox-card {
      max-width: 800px;
      width: 100%;
      border-radius: var(--radius-2xl);
      padding: var(--space-6);
      position: relative;
    }
    .lightbox-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-4);
    }
    .lightbox-title-box h3 {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      margin: var(--space-1) 0 0;
    }
    .lightbox-media-container {
      width: 100%;
      height: 480px;
      background: #000;
      border-radius: var(--radius-lg);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lightbox-video-player {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .lightbox-image-viewer {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .lightbox-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--space-4);
      flex-wrap: wrap;
      gap: var(--space-3);
    }
    .lightbox-specs {
      display: flex;
      gap: var(--space-4);
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }
    .lightbox-specs .spec-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .lightbox-actions {
      display: flex;
      gap: var(--space-3);
    }

    .client-alert-banner.danger-mode {
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.25);
    }
    .badge-danger {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .audit-timeline {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      margin-top: var(--space-4);
      position: relative;
      padding-left: var(--space-2);
    }
    .audit-item {
      display: flex;
      gap: var(--space-3);
      position: relative;
    }
    .audit-bullet {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--color-primary-400);
      margin-top: 5px;
      flex-shrink: 0;
      box-shadow: 0 0 8px var(--color-primary-glow);
    }
    .audit-content {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .audit-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-2);
    }
    .audit-action {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
    }
    .audit-time {
      font-size: 10px;
      color: var(--color-text-muted);
    }
    .audit-desc {
      font-size: 11px;
      color: var(--color-text-secondary);
      margin: 2px 0 0 0;
      line-height: 1.4;
    }
    .audit-actor {
      font-size: 10px;
      color: var(--color-primary-300);
      margin-top: 2px;
    }

    /* 3-Way Dispute Mediation Space Styles */
    .dispute-mediation-box {
      border: 1px solid rgba(239, 68, 68, 0.35);
      background: rgba(239, 68, 68, 0.03);
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.08);
      margin-top: var(--space-6);
    }
    .mediation-head {
      border-bottom: 1px solid rgba(239, 68, 68, 0.2);
      padding-bottom: var(--space-4);
      margin-bottom: var(--space-4);
    }
    .mediation-title-wrap {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .mediation-badges-top {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
    .dispute-chat-feed {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      max-height: 400px;
      overflow-y: auto;
      padding: var(--space-3);
      border-radius: var(--radius-lg);
      background: rgba(0, 0, 0, 0.2);
    }
    .msg-bubble {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .admin-bubble {
      background: rgba(139, 92, 246, 0.12);
      border-color: rgba(139, 92, 246, 0.4);
      box-shadow: 0 0 12px rgba(139, 92, 246, 0.15);
    }
    .msg-meta-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
    }
    .msg-sender {
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }
    .msg-time {
      margin-left: auto;
      font-size: 10px;
      color: var(--color-text-muted);
    }
    .msg-txt {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: 1.5;
      margin: 0;
      white-space: pre-wrap;
    }
    .msg-attachment-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--radius-md);
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--color-border);
      font-size: 11px;
      width: fit-content;
    }
    .msg-attachment-pill a {
      color: var(--color-primary-300);
      text-decoration: none;
    }
    .msg-attachment-pill a:hover {
      text-decoration: underline;
    }
    .empty-dispute-chat {
      text-align: center;
      padding: var(--space-6);
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
    }
    .dispute-input-form {
      margin-top: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .dispute-input-bottom {
      display: flex;
      gap: var(--space-2);
      align-items: center;
    }
    .dispute-closed-banner {
      margin-top: var(--space-4);
      padding: var(--space-3) var(--space-4);
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: var(--radius-md);
      color: var(--color-success);
      font-size: var(--font-size-xs);
      text-align: center;
    }
    .pulse-glow {
      animation: pulseAlert 2s infinite ease-in-out;
    }
    @keyframes pulseAlert {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
      70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }

    @media (max-width: 900px) {
      .contract-layout { grid-template-columns: 1fr; }
      .decision-cards-grid { grid-template-columns: 1fr; }
      .lightbox-media-container { height: 320px; }
    }
  `]
})
export class ContractDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);
  walletService = inject(WalletService);
  disputeService = inject(DisputeService);
  reputationService = inject(ReputationService);
  private contractService = inject(ContractService);
  private notifService = inject(NotificationService);
  private fileUploadService = inject(FileUploadService);

  contract = signal<Contract | null>(null);
  notFound = signal<boolean>(false);
  activities = signal<ContractActivity[]>([]);
  now = signal<Date>(new Date());
  private timerInterval: any;
  private routeSub?: Subscription;

  openApproveModal = signal(false);
  openRevisionModal = signal(false);
  openDisputeModal = signal(false);
  openUploadModal = signal(false);
  openReviewModal = signal(false);
  hasReviewed = signal(false);

  openMediaPreviewModal = signal(false);
  previewMediaItem = signal<{ name: string; url: string; type: 'VIDEO' | 'IMAGE' | 'FILE'; note?: string; gear?: string } | null>(null);

  uploadMode = signal<'FILE' | 'LINK'>('FILE');
  uploadFiles = signal<Array<{ name: string; url: string; type: 'VIDEO' | 'IMAGE'; sizeMb: string; file?: File }>>([]);
  uploadSuccessToast = signal(false);
  actionToastMessage = signal('');

  newMessage = '';
  uploadUrl = '';
  uploadNote = '';
  isUploading = signal(false);

  revisionCategory = 'COLOR';
  revisionNote = '';

  disputeReason = 'WORK_DIFFERS_FROM_BRIEF';
  disputeDescription = '';
  disputeEvidenceUrl = '';
  disputeEvidenceName = '';
  currentDispute = signal<Dispute | null>(null);
  disputeMessages = signal<DisputeMessage[]>([]);
  newDisputeMsgContent = '';
  newDisputeAttachmentUrl = '';
  isSendingDisputeMsg = signal(false);

  ngOnInit(): void {
    this.timerInterval = setInterval(() => this.now.set(new Date()), 1000);

    // Écouter les changements de paramètres de route pour recharger le contrat
    // ex: navigation de /creator/contracts/ct-1 vers /creator/contracts/ct-2
    this.routeSub = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          this.notFound.set(true);
          return [];
        }
        this.notFound.set(false);
        this.contract.set(null); // Reset pour éviter d'afficher l'ancien contrat
        this.contractService.refresh();
        return this.contractService.getById(id);
      })
    ).subscribe({
      next: (c) => {
        if (c) {
          this.contract.set(c);
          this.notFound.set(false);
          this.loadActivities(c.id);
          this.loadDisputeData(c.id);
        } else {
          this.contract.set(null);
          this.notFound.set(true);
        }
      },
      error: () => {
        // Contrat introuvable ou accès refusé — ne pas afficher de mock hardcodé
        this.contract.set(null);
        this.notFound.set(true);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.routeSub?.unsubscribe();
  }

  loadActivities(id: string): void {
    this.contractService.getActivities(id).subscribe(acts => {
      if (Array.isArray(acts)) {
        this.activities.set(acts);
      }
    });
  }

  getDeadlineCountdown(c: Contract): string {
    if (c.status === 'EXPIRED') return 'Expiré (Remboursé)';
    if (c.status === 'COMPLETED') return 'Mission terminée';
    if (c.status === 'DISPUTED') return 'Sous arbitrage';
    if (!c.deadline) return 'En cours';

    const deadlineTime = new Date(c.deadline).getTime();
    const diff = deadlineTime - this.now().getTime();
    if (diff <= 0) return 'Délai dépassé';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}j ${hours}h restants`;
    }
    return `${hours}h ${mins}m restants`;
  }

  getReviewCountdown(c: Contract): string {
    if (!c.reviewDeadline) return '24h restantes';
    const reviewTime = new Date(c.reviewDeadline).getTime();
    const diff = reviewTime - this.now().getTime();
    if (diff <= 0) return 'Délai écoulé (Validation automatique)';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  }

  getActionLabel(action: string): string {
    switch (action) {
      case 'CONTRACT_CREATED': return 'Contrat créé & Séquestre sécurisé';
      case 'DELIVERED': return 'Livrables 4K déposés';
      case 'REVISION_REQUESTED': return 'Demande de révision';
      case 'APPROVED': return 'Livrables validés & Fonds libérés';
      case 'AUTO_APPROVED_24H': return 'Validation automatique (24h)';
      case 'EXPIRED_REFUNDED': return 'Mission expirée & Remboursée';
      case 'DISPUTE_OPENED': return 'Litige ouvert';
      case 'DISPUTE_RESOLVED': return 'Litige arbitré par l\'Admin';
      default: return action;
    }
  }

  getEscrowStep(status: string): EscrowStep {
    switch (status) {
      case 'PENDING': return 'PAYMENT';
      case 'ACTIVE': return 'PRODUCTION';
      case 'DELIVERY': case 'REVISION': return 'REVIEW';
      case 'COMPLETED': return 'RELEASED';
      default: return 'REVIEW';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'badge-success';
      case 'ACTIVE': return 'badge-primary';
      case 'DELIVERY': return 'badge-accent';
      case 'DISPUTED': return 'badge-warning';
      case 'EXPIRED': return 'badge-danger';
      default: return 'badge-neutral';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'Terminé';
      case 'ACTIVE': return 'En tournage';
      case 'DELIVERY': return 'Livrables déposés';
      case 'REVISION': return 'En révision';
      case 'DISPUTED': return 'En litige';
      case 'EXPIRED': return 'Expiré (Remboursé)';
      default: return status;
    }
  }

  getCloudProviderName(url?: string): string {
    if (!url) return 'Lien Cloud';
    const u = url.toLowerCase();
    if (u.includes('we.tl') || u.includes('wetransfer')) return 'WeTransfer';
    if (u.includes('drive.google')) return 'Google Drive';
    if (u.includes('dropbox')) return 'Dropbox';
    if (u.includes('swisstransfer')) return 'SwissTransfer';
    if (u.includes('icloud')) return 'Apple iCloud';
    if (u.includes('onedrive')) return 'OneDrive';
    return 'Dossier Cloud';
  }

  getDeliveries(): Delivery[] {
    const c = this.contract();
    if (!c) return [];
    if (c.deliveries && c.deliveries.length > 0) {
      return c.deliveries.map(d => ({
        ...d,
        // Supprime les faux exemples mockés de vidéos
        attachments: (d.attachments || []).filter(a =>
          !a.name?.includes('Reel_1_Unboxing') && !a.name?.includes('Reel_2_Texture')
        )
      })).filter(d => (d.links && d.links.length > 0) || (d.attachments && d.attachments.length > 0) || (d.note && (d.status === 'SUBMITTED' || d.status === 'APPROVED')));
    }
    return [];
  }

  getLatestDelivery(): Delivery | null {
    const deliveries = this.getDeliveries();
    return deliveries.length > 0 ? deliveries[0] : null;
  }

  openMediaPreview(item: { name: string; url: string; type?: 'VIDEO' | 'IMAGE' | 'FILE'; note?: string; gear?: string }): void {
    this.previewMediaItem.set({
      name: item.name,
      url: item.url,
      type: item.type || (item.url.match(/\.(mp4|mov|webm)$/i) ? 'VIDEO' : 'IMAGE'),
      note: item.note,
      gear: item.gear || 'iPhone 16 Pro Max • 4K 60fps ProRes Log'
    });
    this.openMediaPreviewModal.set(true);
  }

  closeMediaPreview(): void {
    this.openMediaPreviewModal.set(false);
    this.previewMediaItem.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      const isVideo = file.type.startsWith('video/') || !!file.name.match(/\.(mp4|mov|mkv|webm)$/i);
      const isImage = file.type.startsWith('image/');
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' Mo';
      const url = URL.createObjectURL(file);

      this.uploadFiles.update(prev => [
        ...prev,
        {
          name: file.name,
          url,
          type: isVideo ? 'VIDEO' : 'IMAGE',
          sizeMb,
          file
        }
      ]);
    }
  }

  removeUploadFile(index: number): void {
    this.uploadFiles.update(prev => prev.filter((_, i) => i !== index));
  }

  confirmApproval(): void {
    const c = this.contract();
    if (!c) return;

    // 1. Release Escrow via WalletService
    this.walletService.releaseEscrow(c.id, c.amount);

    // 2. Approve via ContractService
    this.contractService.approveContract(c.id).subscribe(updated => {
      this.contract.set(updated);
      this.loadActivities(c.id);

      if (c.creatorId) {
        this.notifService.notify({
          userId: c.creatorId,
          type: 'ESCROW',
          title: `Livrables validés ! Paiement de ${c.amount} DT débloqué`,
          body: `Le client a validé vos livrables 4K pour "${c.title}". Les fonds sont désormais crédités sur votre portefeuille.`,
          link: '/creator/earnings'
        });
      }

      this.actionToastMessage.set(`Félicitations ! Prestation validée et ${c.amount} DT libérés au créateur.`);
      this.uploadSuccessToast.set(true);
      setTimeout(() => this.uploadSuccessToast.set(false), 5000);
    });

    this.openApproveModal.set(false);
    this.openReviewModal.set(true);
  }

  submitRevision(): void {
    if (!this.revisionNote.trim()) return;

    const c = this.contract();
    if (!c) return;

    this.contractService.requestRevision(c.id, this.revisionNote).subscribe(updated => {
      this.contract.set(updated);
      this.loadActivities(c.id);

      if (c.creatorId) {
        this.notifService.notify({
          userId: c.creatorId,
          type: 'REVISION',
          title: `Demande de révision sur le contrat #${c.id}`,
          body: `Le client a demandé une révision pour "${c.title}" : ${this.revisionNote}`,
          link: `/creator/contracts/${c.id}`
        });
      }

      this.actionToastMessage.set('Votre demande de révision a été transmise au créateur.');
      this.uploadSuccessToast.set(true);
      setTimeout(() => this.uploadSuccessToast.set(false), 5000);
    });

    this.openRevisionModal.set(false);
    this.revisionNote = '';
  }

  submitDispute(): void {
    if (!this.disputeDescription.trim()) return;

    const c = this.contract();
    if (c) {
      this.disputeService.openDispute(c.id, {
        reason: this.disputeReason,
        description: this.disputeDescription.trim(),
        evidenceUrl: this.disputeEvidenceUrl.trim() || undefined,
        evidenceName: this.disputeEvidenceUrl.trim() ? 'Pièce justificative' : undefined
      }).subscribe({
        next: () => {
          this.contract.update(prev => (prev ? { ...prev, status: 'DISPUTED' } : null));
          this.loadActivities(c.id);
          this.loadDisputeData(c.id);
          this.actionToastMessage.set('Réclamation ouverte avec succès. Délai de réponse de 24h activé.');
          this.uploadSuccessToast.set(true);
          setTimeout(() => this.uploadSuccessToast.set(false), 5000);
        },
        error: (err) => {
          const errMsg = err?.error?.message || err?.error || 'Erreur lors de l\'ouverture du litige.';
          this.actionToastMessage.set(errMsg);
          this.uploadSuccessToast.set(true);
        }
      });
    }

    this.openDisputeModal.set(false);
    this.disputeDescription = '';
    this.disputeEvidenceUrl = '';
  }

  loadDisputeData(contractId: string | number): void {
    this.disputeService.getContractDispute(contractId).subscribe(disp => {
      this.currentDispute.set(disp);
      if (disp && disp.id) {
        this.loadDisputeMessages(disp.id);
      }
    });
  }

  loadDisputeMessages(disputeId: string | number): void {
    this.disputeService.getDisputeMessages(disputeId).subscribe(msgs => {
      this.disputeMessages.set(msgs || []);
    });
  }

  sendDisputeMsg(): void {
    const disp = this.currentDispute();
    if (!disp || !disp.id || !this.newDisputeMsgContent.trim() || this.isSendingDisputeMsg()) return;

    this.isSendingDisputeMsg.set(true);
    const payload = {
      content: this.newDisputeMsgContent.trim(),
      attachmentUrl: this.newDisputeAttachmentUrl.trim() || undefined,
      attachmentName: this.newDisputeAttachmentUrl.trim() ? 'Pièce justificative' : undefined
    };

    this.disputeService.sendDisputeMessage(disp.id, payload).subscribe({
      next: (msg) => {
        if (msg) {
          this.disputeMessages.update(prev => [...prev, msg]);
        }
        this.newDisputeMsgContent = '';
        this.newDisputeAttachmentUrl = '';
        this.isSendingDisputeMsg.set(false);
        this.loadDisputeData(disp.contractId);
      },
      error: () => {
        this.isSendingDisputeMsg.set(false);
      }
    });
  }

  getDisputeRemainingDiff(): number {
    const d = this.currentDispute();
    if (!d || !d.responseDeadline) return 0;
    const deadline = new Date(d.responseDeadline).getTime();
    return deadline - this.now().getTime();
  }

  isDisputeExpired(): boolean {
    const d = this.currentDispute();
    if (!d) return false;
    if (d.isExpired) return true;
    return this.getDisputeRemainingDiff() <= 0;
  }

  isDisputeCritical(): boolean {
    if (this.isDisputeExpired()) return false;
    const diff = this.getDisputeRemainingDiff();
    return diff > 0 && diff < 3600 * 1000; // Less than 1 hour
  }

  isDisputeWarning(): boolean {
    if (this.isDisputeExpired() || this.isDisputeCritical()) return false;
    const diff = this.getDisputeRemainingDiff();
    return diff > 0 && diff < 6 * 3600 * 1000; // Less than 6 hours
  }

  getDisputeCountdownLabel(): string {
    const d = this.currentDispute();
    if (!d) return 'Litige en cours';
    if (this.isDisputeExpired()) {
      return 'Délai de réponse 24h expiré';
    }
    const diff = this.getDisputeRemainingDiff();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return `Réponse requise sous : ${hours}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  }

  getDisputeAlertBannerClass(): string {
    if (this.isDisputeExpired() || this.isDisputeCritical()) return 'danger-mode';
    return 'warning-mode';
  }

  getDisputeBadgeClass(): string {
    if (this.isDisputeExpired()) return 'badge-danger';
    if (this.isDisputeCritical()) return 'badge-danger pulse-glow';
    if (this.isDisputeWarning()) return 'badge-warning';
    return 'badge-warning';
  }

  getRoleBadgeClass(role?: string): string {
    switch (role) {
      case 'ADMIN': return 'badge-primary';
      case 'CLIENT': return 'badge-accent';
      case 'CREATOR': return 'badge-success';
      default: return 'badge-neutral';
    }
  }

  getRoleLabel(role?: string): string {
    switch (role) {
      case 'ADMIN': return 'Médiation SnapConnect';
      case 'CLIENT': return 'Client';
      case 'CREATOR': return 'Créateur';
      default: return role || '';
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;
    this.newMessage = '';
  }

  submitUpload(): void {
    const c = this.contract();
    if (!c) return;

    const link = this.uploadUrl.trim();
    if (!link) return;

    this.isUploading.set(true);

    const noteText = this.uploadNote.trim() || 'Livrables 4K tournés sur smartphone certifié en 4K 60fps ProRes.';
    const providerName = this.getCloudProviderName(link);

    this.contractService.submitDelivery(c.id, {
      note: noteText,
      attachments: [],
      links: [link]
    }).subscribe(updated => {
      this.contract.set(updated);
      this.isUploading.set(false);
      this.loadActivities(c.id);

      if (c.clientId) {
        this.notifService.notify({
          userId: c.clientId,
          type: 'DELIVERY',
          title: `Lien de livraison 4K partagé pour "${c.title}"`,
          body: `Le créateur a transmis son lien ${providerName}. Vous pouvez télécharger les vidéos et valider le paiement.`,
          link: `/client/contracts/${c.id}`
        });
      }

      this.actionToastMessage.set('Lien de livraison 4K transmis avec succès au client !');
      this.uploadSuccessToast.set(true);
      setTimeout(() => this.uploadSuccessToast.set(false), 5000);

      // Phase 2: after contract signal updates and WeTransfer card is rendered,
      // scroll smoothly to the deliverables section
      setTimeout(() => {
        document.getElementById('deliverables-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    });

    this.openUploadModal.set(false);
    this.uploadFiles.set([]);
    this.uploadUrl = '';
    this.uploadNote = '';

    // Phase 1: snap to top immediately so user never sees the footer
    // while waiting for the async contract update to arrive
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }

  onReviewSubmitted(req: ReviewSubmitRequest): void {
    this.reputationService.submitReview(req);
    this.hasReviewed.set(true);
    this.openReviewModal.set(false);

    if (req.revieweeId) {
      this.notifService.notify({
        userId: req.revieweeId,
        type: 'NEW_REVIEW',
        title: `Nouvelle évaluation reçue (${req.overallRating}/5) !`,
        body: req.comment || `Vous avez reçu un nouvel avis ${req.overallRating} étoiles pour votre prestation.`,
        link: this.auth.isCreator() ? '/creator/reviews' : '/client/reviews'
      });
    }
  }
}
