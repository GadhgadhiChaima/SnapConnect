import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { DisputeService } from '../../../core/services/dispute.service';
import { WalletService } from '../../../core/services/wallet.service';
import { ContractService } from '../../../core/services/contract.service';
import { Dispute, DisputeResolution, DisputeMessage, UserSanction } from '../../../core/models/dispute.model';

@Component({
  selector: 'app-admin-contracts',
  standalone: true,
  imports: [RouterLink, FormsModule, SlicePipe, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="arbitration-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-warning">Médiation & Arbitrage</span>
            <h1>Arbitrage des Litiges & Console de Contrats</h1>
            <p>Examinez les contrats sous séquestre contestés, inspectez les preuves et exécutez les résolutions financières.</p>
          </div>
          <a routerLink="/admin/dashboard" class="btn btn-outline btn-sm">
            ← Retour au Hub Admin
          </a>
        </div>

        <!-- Mode Switcher Tabs -->
        <div class="contracts-tabs-bar">
          <button
            type="button"
            class="c-tab-btn"
            [class.active]="activeTab() === 'DISPUTES'"
            (click)="activeTab.set('DISPUTES')"
          >
            Litiges en Arbitrage ({{ disputes().length }})
          </button>
          <button
            type="button"
            class="c-tab-btn"
            [class.active]="activeTab() === 'CONTRACTS'"
            (click)="activeTab.set('CONTRACTS')"
          >
            Tous les Contrats sous Séquestre ({{ contractService.contracts().length }})
          </button>
          <button
            type="button"
            class="c-tab-btn"
            [class.active]="activeTab() === 'SANCTIONS'"
            (click)="activeTab.set('SANCTIONS'); loadSanctions()"
          >
            Sanctions & Suspensions ({{ allSanctions().length }})
          </button>
        </div>

        @if (activeTab() === 'DISPUTES') {
          <!-- Active Disputes List -->
          <div class="disputes-list">
            @for (d of disputes(); track d.id) {
            <div class="dispute-card card-glass animate-fade-in">
              <div class="dispute-top flex-between">
                <div>
                  <div class="dispute-badges-row">
                    <span class="badge badge-warning">LITIGE #{{ d.id }}</span>
                    <span class="badge" [class]="getStatusClass(d.status)">● {{ getStatusLabel(d.status) }}</span>
                    <span class="badge" [class]="getDisputeBadgeClass(d)">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 4px;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {{ getCountdownLabel(d) }}
                    </span>
                    @if (d.sanctionApplied) {
                      <span class="badge badge-danger">Sanction active</span>
                    }
                  </div>
                  <h3 class="dispute-title">{{ d.contractTitle }}</h3>
                </div>

                <div class="disputed-amount-box">
                  <span class="lbl">Bloqué en litige :</span>
                  <strong class="amt">{{ d.amountDisputed }} {{ d.currency }}</strong>
                </div>
              </div>

              <!-- Parties Involved -->
              <div class="parties-involved card">
                <div class="p-party">
                  <span class="p-role">Demandeur (Initié par)</span>
                  <strong>{{ d.openedByName }} ({{ d.openedByRole === 'CLIENT' ? 'Client' : 'Créateur' }})</strong>
                </div>
                <div class="p-sep">CONTRE</div>
                <div class="p-party">
                  <span class="p-role">Défendeur</span>
                  <strong>{{ d.respondentName }}</strong>
                </div>
              </div>

              <!-- Dispute Reason & Claim Description -->
              <div class="claim-details">
                <div class="reason-tag">
                  <span>Motif du litige :</span>
                  <strong>{{ d.reason }}</strong>
                </div>
                <p class="claim-text">"{{ d.description }}"</p>
              </div>

              <!-- Evidence Files -->
              @if (d.evidence.length > 0) {
                <div class="evidence-section">
                  <h4>Pièces justificatives déposées ({{ d.evidence.length }}) :</h4>
                  <div class="evidence-grid">
                    @for (ev of d.evidence; track ev.id) {
                      <div class="evidence-item card">
                        <span class="ev-icon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                          </svg>
                        </span>
                        <div class="ev-meta">
                          <strong>{{ ev.fileName }}</strong>
                          <span>{{ ev.note }} (par {{ ev.uploaderName }})</span>
                        </div>
                        <button (click)="inspectEvidence(ev.fileName)" class="btn btn-outline btn-xs">Inspecter</button>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Chronological Timeline -->
              <div class="timeline-section">
                <h4>Chronologie & Journal d'Audit :</h4>
                <div class="timeline-track">
                  @for (t of d.timeline; track t.id) {
                    <div class="tl-item">
                      <div class="tl-dot"></div>
                      <div class="tl-content">
                        <span class="tl-time">{{ t.timestamp }} • {{ t.actorName }}</span>
                        <strong>{{ t.title }}</strong>
                        <p>{{ t.description }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Dedicated 3-Way Dispute Chat Section -->
              <div class="dispute-chat-section card">
                <div class="chat-section-header flex-between">
                  <div>
                    <strong style="font-size: var(--font-size-sm); color: var(--color-text-primary);">
                      Espace de Médiation Tripartite (Client • Créateur • Admin)
                    </strong>
                    <p class="text-xs text-muted" style="margin: 2px 0 0;">Discussion et échanges contradictoires réservés à ce litige.</p>
                  </div>
                  <button (click)="toggleChat(d)" class="btn btn-outline btn-xs">
                    {{ activeChatDisputeId() === d.id ? 'Masquer la discussion' : 'Ouvrir la discussion' }}
                  </button>
                </div>

                @if (activeChatDisputeId() === d.id) {
                  <div class="admin-dispute-chat-feed">
                    @for (msg of disputeMessages(); track msg.id) {
                      <div class="chat-msg" [class.msg-admin]="msg.senderRole === 'ADMIN'">
                        <div class="msg-bubble" [class.admin-bubble]="msg.senderRole === 'ADMIN'">
                          <div class="msg-meta-row">
                            <strong class="msg-sender">{{ msg.senderName }}</strong>
                            <span class="badge badge-xs" [class]="getRoleBadgeClass(msg.senderRole)">{{ getRoleLabel(msg.senderRole) }}</span>
                            <span class="msg-time">{{ msg.createdAt | slice:11:16 }}</span>
                          </div>
                          <p class="msg-txt">{{ msg.content }}</p>
                          @if (msg.attachmentUrl) {
                            <div class="msg-attachment-pill">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: -2px;">
                                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                              </svg>
                              <a [href]="msg.attachmentUrl" target="_blank" rel="noopener noreferrer">
                                {{ msg.attachmentName || 'Pièce justificative' }} ↗
                              </a>
                            </div>
                          }
                        </div>
                      </div>
                    } @empty {
                      <div class="empty-chat-hint">
                        <span>Aucun message échangé pour l'instant dans ce litige.</span>
                      </div>
                    }

                    <div class="admin-chat-reply-form">
                      <textarea
                        [(ngModel)]="adminMsgContent"
                        rows="2"
                        class="form-textarea"
                        placeholder="Intervenir en tant que médiateur SnapConnect (instructions, demande de compléments, avertissement)..."
                      ></textarea>
                      <div class="reply-bottom-row">
                        <input
                          type="url"
                          [(ngModel)]="adminAttachmentUrl"
                          class="form-input form-input-sm"
                          placeholder="Lien pièce complémentaire (optionnel)"
                        />
                        <button
                          (click)="sendAdminMessage(d)"
                          class="btn btn-primary btn-sm"
                          [disabled]="!adminMsgContent.trim() || isSendingAdminMsg()"
                        >
                          Publier l'intervention officielle
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Arbitration Decision Actions (if not closed) -->
              @if (d.status !== 'CLOSED' && d.status !== 'RESOLVED_CLIENT' && d.status !== 'RESOLVED_CREATOR' && d.status !== 'PARTIAL_RESOLUTION') {
                <div class="arbitration-panel">
                  <div class="arb-text">
                    <strong>Exécuter la décision arbitrale :</strong>
                    <p>Sélectionnez le règlement financier. Les fonds seront transférés immédiatement et le litige sera clôturé.</p>
                  </div>

                  <div class="arb-actions">
                    <button (click)="openDecisionModal(d, 'FULL_REFUND_CLIENT')" class="btn btn-outline btn-sm text-warning">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <polyline points="9 14 4 9 9 4"/>
                        <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
                      </svg>
                      Remboursement 100% Client ({{ d.amountDisputed }} DT)
                    </button>
                    <button (click)="openDecisionModal(d, 'FULL_PAYMENT_CREATOR')" class="btn btn-outline btn-sm text-success">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                      Paiement 100% Créateur ({{ d.amountDisputed * 0.9 }} DT)
                    </button>
                    <button (click)="openDecisionModal(d, 'PARTIAL_SPLIT')" class="btn btn-primary btn-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                        <path d="M7 21h10"/>
                        <path d="M12 3v18"/>
                      </svg>
                      Répartition partielle
                    </button>
                    <button (click)="openSanctionModal(d)" class="btn btn-outline btn-sm text-danger">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                      </svg>
                      Sanctionner un utilisateur
                    </button>
                  </div>
                </div>
              } @else {
                <div class="resolution-summary card">
                  <span class="res-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </span>
                  <div>
                    <strong>Arbitrage clôturé et réglé : {{ getDecisionLabel(d.resolution?.decision) }}</strong>
                    <p>{{ d.resolution?.adminNotes }}</p>
                    <span class="res-date">Réglo le {{ d.resolution?.resolvedAt }} par {{ d.resolution?.resolvedBy }}</span>
                  </div>
                </div>
              }
            </div>
            }
          </div>
        } @else if (activeTab() === 'CONTRACTS') {
          <!-- All Contracts & Escrow Oversight Table -->
          <div class="card card-glass contracts-table-card animate-fade-in">
            <div class="card-header flex-between">
              <div>
                <h3>Registres des Contrats & Séquestre Escrow ({{ contractService.contracts().length }})</h3>
                <p class="u-sub">Supervision de tous les contrats actifs, jalons sécurisés et fonds en transit</p>
              </div>
            </div>

            <div class="table-responsive">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Réf. Contrat</th>
                    <th>Titre & Type</th>
                    <th>Client (Donneur d'ordre)</th>
                    <th>Créateur Smartphone</th>
                    <th>Montant Séquestre</th>
                    <th>Com. Plateforme (10%)</th>
                    <th>Statut Séquestre</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of contractService.contracts(); track c.id) {
                    <tr>
                      <td>
                        <span class="mono-id">#{{ c.id }}</span>
                      </td>
                      <td>
                        <div class="c-title-cell">
                          <strong>{{ c.title }}</strong>
                          <span class="c-type-pill">{{ c.type === 'JOB' ? 'Brief Mission' : 'Package Clé en main' }}</span>
                        </div>
                      </td>
                      <td>
                        <div class="user-meta-cell">
                          <span class="user-name">{{ c.clientName || 'Client anonyme' }}</span>
                          <span class="user-role-sub">Client</span>
                        </div>
                      </td>
                      <td>
                        <div class="user-meta-cell">
                          <span class="user-name">{{ c.creatorName || 'Créateur' }}</span>
                          <span class="user-role-sub">Vidéaste Mobile</span>
                        </div>
                      </td>
                      <td>
                        <span class="escrow-badge">{{ c.amount }} DT</span>
                      </td>
                      <td>
                        <span class="fee-badge">+{{ (c.platformFee || c.amount * 0.1).toFixed(0) }} DT</span>
                      </td>
                      <td>
                        <span class="badge" [class]="getContractStatusClass(c.status)">
                          {{ getContractStatusLabel(c.status) }}
                        </span>
                      </td>
                      <td>
                        <div class="actions-cell">
                          <a [routerLink]="['/contracts', c.id]" class="btn btn-outline btn-xs" title="Consulter le contrat">
                            Inspecter ↗
                          </a>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="8" class="text-center py-6">
                        <p class="text-muted">Aucun contrat sous séquestre pour le moment.</p>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        } @else if (activeTab() === 'SANCTIONS') {
          <!-- Sanctions & Suspensions Table -->
          <div class="card card-glass contracts-table-card animate-fade-in">
            <div class="card-header flex-between">
              <div>
                <h3>Registre des Sanctions & Suspensions de Compte ({{ allSanctions().length }})</h3>
                <p class="u-sub">Historique et traçabilité des mesures disciplinaires et blocages temporaires appliqués</p>
              </div>
              <button (click)="loadSanctions()" class="btn btn-outline btn-xs">Actualiser</button>
            </div>

            <div class="table-responsive">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Réf.</th>
                    <th>Utilisateur sanctionné</th>
                    <th>Rôle</th>
                    <th>Type de sanction</th>
                    <th>Motif</th>
                    <th>Période de suspension</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (s of allSanctions(); track s.id) {
                    <tr>
                      <td><span class="mono-id">#{{ s.id }}</span></td>
                      <td>
                        <div class="user-meta-cell">
                          <span class="user-name">{{ s.userName }}</span>
                          <span class="user-role-sub">{{ s.userEmail }}</span>
                        </div>
                      </td>
                      <td><span class="badge badge-neutral text-xs">{{ s.userRole }}</span></td>
                      <td><span class="badge badge-warning">{{ getSanctionTypeLabel(s.sanctionType) }}</span></td>
                      <td><span class="text-xs" style="color: var(--color-text-secondary);">{{ s.reason }}</span></td>
                      <td>
                        <span class="text-xs">
                          Du {{ s.suspensionStart | slice:0:10 }}
                          @if (s.suspensionEnd) {
                            au {{ s.suspensionEnd | slice:0:10 }}
                          } @else {
                            (Définitif)
                          }
                        </span>
                      </td>
                      <td>
                        <span class="badge" [class]="s.active ? 'badge-danger' : 'badge-success'">
                          {{ s.active ? 'Active' : 'Révoquée / Expirée' }}
                        </span>
                      </td>
                      <td>
                        @if (s.active && s.sanctionType !== 'WARNING') {
                          <button (click)="revokeSanction(s.id)" class="btn btn-outline btn-xs text-success" title="Lever la suspension du compte">
                            Révoquer
                          </button>
                        } @else {
                          <span class="text-xs text-muted">—</span>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="8" class="text-center py-6">
                        <p class="text-muted">Aucune sanction enregistrée pour l'instant.</p>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </main>

    <!-- Arbitration Ruling Modal -->
    @if (selectedDispute() && rulingType()) {
      <div class="modal-backdrop" (click)="selectedDispute.set(null)">
        <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="selectedDispute.set(null)">✕</button>

          <h2>Confirmer la décision d'arbitrage</h2>
          <p class="modal-sub">Litige #{{ selectedDispute()?.id }} — {{ selectedDispute()?.contractTitle }}</p>

          <form (ngSubmit)="executeRuling()" class="modal-form">
            @if (rulingType() === 'PARTIAL_SPLIT') {
              <div class="split-inputs">
                <div class="form-group">
                  <label class="form-label">Montant Remboursé Client (DT)</label>
                  <input type="number" [(ngModel)]="splitClient" name="clientAmt" class="form-input" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Montant Versé Créateur (DT)</label>
                  <input type="number" [(ngModel)]="splitCreator" name="creatorAmt" class="form-input" required />
                </div>
              </div>
            }

            <div class="form-group">
              <label class="form-label">Justification arbitrale / Notes de décision</label>
              <textarea
                [(ngModel)]="rulingNotes"
                name="notes"
                rows="4"
                class="form-textarea"
                placeholder="Indiquez vos conclusions basées sur les échanges, l'inspection des médias 4K et les termes du contrat..."
                required
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" (click)="selectedDispute.set(null)" class="btn btn-outline">Annuler</button>
              <button type="submit" class="btn btn-warning">Appliquer le règlement arbitral</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Sanction Modal -->
    @if (sanctionDispute()) {
      <div class="modal-backdrop" (click)="sanctionDispute.set(null)">
        <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="sanctionDispute.set(null)">✕</button>

          <h2>Sanctionner un utilisateur pour manquement</h2>
          <p class="modal-sub">Dossier de litige #{{ sanctionDispute()?.id }} — {{ sanctionDispute()?.contractTitle }}</p>

          <form (ngSubmit)="executeSanction()" class="modal-form">
            <div class="form-group">
              <label class="form-label">Utilisateur à sanctionner</label>
              <select [(ngModel)]="sanctionTargetUserId" name="targetUser" class="form-select" required>
                <option [value]="sanctionDispute()?.openedByUserId">{{ sanctionDispute()?.openedByName }} (Demandeur / {{ sanctionDispute()?.openedByRole === 'CLIENT' ? 'Client' : 'Créateur' }})</option>
                <option [value]="sanctionDispute()?.respondentId">{{ sanctionDispute()?.respondentName }} (Défendeur)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Type de sanction applicable</label>
              <select [(ngModel)]="sanctionType" name="sType" class="form-select" required>
                <option value="WARNING">Avertissement formel (sans blocage)</option>
                <option value="BLOCK_3_DAYS">Suspension temporaire de compte (3 jours)</option>
                <option value="BLOCK_15_DAYS">Suspension temporaire de compte (15 jours)</option>
                <option value="BLOCK_30_DAYS">Suspension temporaire de compte (30 jours)</option>
                <option value="BLOCK_1_YEAR">Suspension longue durée (1 an)</option>
                <option value="PERMANENT_BLOCK">Bannissement définitif (Permanent)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Motif et justification de la sanction</label>
              <textarea
                [(ngModel)]="sanctionReason"
                name="sReason"
                rows="3"
                class="form-textarea"
                placeholder="Indiquez le manquement contractuel ou comportemental justifiant cette sanction..."
                required
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" (click)="sanctionDispute.set(null)" class="btn btn-outline">Annuler</button>
              <button type="submit" class="btn btn-danger" [disabled]="!sanctionReason.trim() || isSanctioning()">
                Appliquer la sanction
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .arbitration-page {
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

    .disputes-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
    }

    .dispute-card {
      padding: var(--space-6) var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .dispute-top {
      align-items: flex-start;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .dispute-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      margin: var(--space-2) 0 0;
    }

    .disputed-amount-box {
      text-align: right;
      padding: var(--space-3) var(--space-5);
      background: rgba(15, 23, 42, 0.6);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    }

    .disputed-amount-box .lbl {
      font-size: 10px;
      text-transform: uppercase;
      color: var(--color-text-muted);
      display: block;
    }

    .disputed-amount-box .amt {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-black);
      color: #fbbf24;
    }

    .parties-involved {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: var(--space-4);
      border-radius: var(--radius-lg);
      background: rgba(15, 23, 42, 0.4);
    }

    .p-party {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .p-role {
      font-size: 10px;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }

    .p-sep {
      font-size: 1.2rem;
      font-weight: bold;
      color: var(--color-border);
    }

    .claim-details {
      padding: var(--space-4);
      background: rgba(245, 158, 11, 0.05);
      border-left: 3px solid #fbbf24;
      border-radius: 0 var(--radius-md) var(--radius-md) 0;
    }

    .reason-tag {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-bottom: var(--space-1);
    }

    .reason-tag strong {
      color: #fbbf24;
      margin-left: 4px;
    }

    .claim-text {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      font-style: italic;
      margin: 0;
    }

    .evidence-section h4, .timeline-section h4 {
      font-size: var(--font-size-xs);
      text-transform: uppercase;
      color: var(--color-text-muted);
      margin-bottom: var(--space-3);
    }

    .evidence-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-3);
    }

    .evidence-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      border-radius: var(--radius-md);
    }

    .ev-meta {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ev-meta strong { font-size: var(--font-size-xs); }
    .ev-meta span { font-size: 10px; color: var(--color-text-muted); }

    /* Timeline */
    .timeline-track {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      padding-left: var(--space-4);
      border-left: 2px solid var(--color-border);
    }

    .tl-item {
      position: relative;
    }

    .tl-dot {
      position: absolute;
      left: calc(-1 * var(--space-4) - 5px);
      top: 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-primary-400);
    }

    .tl-time {
      font-size: 10px;
      color: var(--color-text-muted);
      display: block;
    }

    .tl-content strong {
      font-size: var(--font-size-xs);
    }

    .tl-content p {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin: 2px 0 0;
    }

    /* Arbitration Panel */
    .arbitration-panel {
      padding: var(--space-5);
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .arb-text strong { font-size: var(--font-size-sm); color: #fbbf24; display: block; }
    .arb-text p { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin: 0; }

    .arb-actions {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .resolution-summary {
      padding: var(--space-4) var(--space-5);
      background: rgba(34, 197, 94, 0.08);
      border: 1px solid var(--color-success);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .res-icon { font-size: 1.8rem; }
    .resolution-summary strong { color: var(--color-success); font-size: var(--font-size-sm); display: block; }
    .resolution-summary p { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin: 2px 0; }
    .res-date { font-size: 10px; color: var(--color-text-muted); }

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
      max-width: 540px;
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

    .split-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .modal-actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-4); }
    /* Contracts Tab & Table Styles */
    .contracts-tabs-bar {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-6);
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--space-3);
    }

    .c-tab-btn {
      padding: var(--space-2) var(--space-4);
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--radius-full);
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .c-tab-btn:hover {
      color: var(--color-text-primary);
      background: rgba(255, 255, 255, 0.05);
    }

    .c-tab-btn.active {
      background: var(--color-primary-500);
      color: white;
      font-weight: var(--font-weight-bold);
      box-shadow: 0 0 12px rgba(124, 58, 237, 0.4);
    }

    .contracts-table-card {
      padding: var(--space-6);
    }

    .u-sub {
      color: var(--color-text-muted);
      font-size: var(--font-size-xs);
      margin-top: 2px;
    }

    .table-responsive {
      overflow-x: auto;
      margin-top: var(--space-4);
    }

    .admin-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--font-size-sm);
      text-align: left;
    }

    .admin-table th {
      padding: var(--space-3) var(--space-4);
      color: var(--color-text-muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--color-border);
    }

    .admin-table td {
      padding: var(--space-4);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      vertical-align: middle;
    }

    .mono-id {
      font-family: monospace;
      color: var(--color-text-muted);
      font-size: 11px;
    }

    .c-title-cell {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .c-title-cell strong {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
    }

    .c-type-pill {
      font-size: 10px;
      color: var(--color-primary-400);
    }

    .user-meta-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .user-name {
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
    }

    .user-role-sub {
      font-size: 10px;
      color: var(--color-text-muted);
    }

    .escrow-badge {
      font-weight: var(--font-weight-bold);
      color: #fbbf24;
      background: rgba(245, 158, 11, 0.1);
      padding: 2px 8px;
      border-radius: var(--radius-full);
      font-size: 12px;
    }

    .fee-badge {
      font-weight: var(--font-weight-semibold);
      color: #22c55e;
      font-size: 12px;
    }

    .actions-cell {
      display: flex;
      gap: 6px;
    }

    .dispute-badges-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
    .dispute-chat-section {
      padding: var(--space-4) var(--space-5);
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      margin-top: var(--space-2);
    }
    .chat-section-header {
      align-items: center;
    }
    .admin-dispute-chat-feed {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      max-height: 360px;
      overflow-y: auto;
      padding: var(--space-3);
      border-radius: var(--radius-lg);
      background: rgba(0, 0, 0, 0.25);
      margin-top: var(--space-3);
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
    .empty-chat-hint {
      text-align: center;
      padding: var(--space-4);
      color: var(--color-text-muted);
      font-size: var(--font-size-xs);
    }
    .admin-chat-reply-form {
      margin-top: var(--space-3);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .reply-bottom-row {
      display: flex;
      gap: var(--space-2);
      align-items: center;
    }
    .pulse-glow {
      animation: pulseAlert 2s infinite ease-in-out;
    }
    @keyframes pulseAlert {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
      70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
  `]
})
export class AdminContractsComponent implements OnInit, OnDestroy {
  disputeService = inject(DisputeService);
  walletService = inject(WalletService);
  contractService = inject(ContractService);

  now = signal<Date>(new Date());
  private timerInterval: any;

  activeTab = signal<'DISPUTES' | 'CONTRACTS' | 'SANCTIONS'>('DISPUTES');
  disputes = this.disputeService.disputes;
  selectedDispute = signal<Dispute | null>(null);
  rulingType = signal<DisputeResolution['decision'] | null>(null);

  rulingNotes = '';
  splitClient = 150;
  splitCreator = 150;

  activeChatDisputeId = signal<string | null>(null);
  disputeMessages = signal<DisputeMessage[]>([]);
  adminMsgContent = '';
  adminAttachmentUrl = '';
  isSendingAdminMsg = signal(false);

  sanctionDispute = signal<Dispute | null>(null);
  sanctionTargetUserId: any = null;
  sanctionType = 'WARNING';
  sanctionReason = '';
  allSanctions = signal<UserSanction[]>([]);
  isSanctioning = signal(false);

  ngOnInit(): void {
    this.timerInterval = setInterval(() => this.now.set(new Date()), 1000);
    this.loadSanctions();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  toggleChat(d: Dispute): void {
    if (this.activeChatDisputeId() === d.id) {
      this.activeChatDisputeId.set(null);
    } else {
      this.activeChatDisputeId.set(d.id);
      this.disputeService.getDisputeMessages(d.id).subscribe(msgs => {
        this.disputeMessages.set(msgs || []);
      });
    }
  }

  sendAdminMessage(d: Dispute): void {
    if (!this.adminMsgContent.trim() || this.isSendingAdminMsg()) return;
    this.isSendingAdminMsg.set(true);

    const payload = {
      content: this.adminMsgContent.trim(),
      attachmentUrl: this.adminAttachmentUrl.trim() || undefined,
      attachmentName: this.adminAttachmentUrl.trim() ? 'Document officiel SnapConnect' : undefined
    };

    this.disputeService.sendDisputeMessage(d.id, payload).subscribe({
      next: (msg) => {
        if (msg) {
          this.disputeMessages.update(prev => [...prev, msg]);
        }
        this.adminMsgContent = '';
        this.adminAttachmentUrl = '';
        this.isSendingAdminMsg.set(false);
      },
      error: () => {
        this.isSendingAdminMsg.set(false);
      }
    });
  }

  openSanctionModal(d: Dispute): void {
    this.sanctionDispute.set(d);
    this.sanctionTargetUserId = d.respondentId ? Number(d.respondentId) : Number(d.openedByUserId);
    this.sanctionType = 'WARNING';
    this.sanctionReason = '';
  }

  executeSanction(): void {
    const d = this.sanctionDispute();
    if (!d || !this.sanctionTargetUserId || !this.sanctionReason.trim() || this.isSanctioning()) return;

    this.isSanctioning.set(true);
    this.disputeService.applySanction(d.id, {
      userId: Number(this.sanctionTargetUserId),
      sanctionType: this.sanctionType,
      reason: this.sanctionReason.trim()
    }).subscribe({
      next: () => {
        this.isSanctioning.set(false);
        this.sanctionDispute.set(null);
        this.sanctionReason = '';
        this.loadSanctions();
        alert('Sanction appliquée avec succès.');
      },
      error: () => {
        this.isSanctioning.set(false);
        this.sanctionDispute.set(null);
      }
    });
  }

  loadSanctions(): void {
    this.disputeService.getSanctions().subscribe(s => {
      this.allSanctions.set(s || []);
    });
  }

  revokeSanction(sanctionId: number): void {
    if (confirm('Voulez-vous vraiment lever la suspension de cet utilisateur ?')) {
      this.disputeService.revokeSanction(sanctionId).subscribe(() => {
        this.loadSanctions();
      });
    }
  }

  getDisputeRemainingDiff(d: Dispute): number {
    if (!d.responseDeadline) return 0;
    const deadline = new Date(d.responseDeadline).getTime();
    return deadline - this.now().getTime();
  }

  isDisputeExpired(d: Dispute): boolean {
    if (d.isExpired) return true;
    return this.getDisputeRemainingDiff(d) <= 0;
  }

  isDisputeCritical(d: Dispute): boolean {
    if (this.isDisputeExpired(d)) return false;
    const diff = this.getDisputeRemainingDiff(d);
    return diff > 0 && diff < 3600 * 1000;
  }

  isDisputeWarning(d: Dispute): boolean {
    if (this.isDisputeExpired(d) || this.isDisputeCritical(d)) return false;
    const diff = this.getDisputeRemainingDiff(d);
    return diff > 0 && diff < 6 * 3600 * 1000;
  }

  getCountdownLabel(d: Dispute): string {
    if (this.isDisputeExpired(d)) {
      return 'Délai 24h expiré';
    }
    const diff = this.getDisputeRemainingDiff(d);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return `24h restant : ${hours}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  }

  getDisputeBadgeClass(d: Dispute): string {
    if (this.isDisputeExpired(d)) return 'badge-danger';
    if (this.isDisputeCritical(d)) return 'badge-danger pulse-glow';
    if (this.isDisputeWarning(d)) return 'badge-warning';
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
      case 'ADMIN': return 'Admin SnapConnect';
      case 'CLIENT': return 'Client';
      case 'CREATOR': return 'Créateur';
      default: return role || '';
    }
  }

  getSanctionTypeLabel(type: string): string {
    switch (type) {
      case 'WARNING': return 'Avertissement formel';
      case 'BLOCK_3_DAYS': return 'Suspension 3 jours';
      case 'BLOCK_15_DAYS': return 'Suspension 15 jours';
      case 'BLOCK_30_DAYS': return 'Suspension 30 jours';
      case 'BLOCK_1_YEAR': return 'Suspension 1 an';
      case 'PERMANENT_BLOCK': return 'Blocage permanent';
      default: return type;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'UNDER_REVIEW': return 'badge-warning';
      case 'OPEN': return 'badge-primary';
      case 'RESOLVED_CLIENT': case 'RESOLVED_CREATOR': case 'PARTIAL_RESOLUTION': case 'CLOSED': return 'badge-success';
      default: return 'badge-neutral';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'UNDER_REVIEW': return 'En cours d\'examen';
      case 'OPEN': return 'Ouvert';
      case 'RESOLVED_CLIENT': return 'Résolu (Client)';
      case 'RESOLVED_CREATOR': return 'Résolu (Créateur)';
      case 'PARTIAL_RESOLUTION': return 'Résolution partielle';
      case 'CLOSED': return 'Clôturé';
      default: return status;
    }
  }

  getContractStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'badge-primary';
      case 'DELIVERY': return 'badge-warning';
      case 'REVISION': return 'badge-warning';
      case 'COMPLETED': return 'badge-success';
      case 'DISPUTED': return 'badge-danger';
      case 'CANCELLED': return 'badge-neutral';
      default: return 'badge-neutral';
    }
  }

  getContractStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Séquestre Actif (En cours)';
      case 'DELIVERY': return 'Livrables 4K soumis';
      case 'REVISION': return 'Révision demandée';
      case 'COMPLETED': return 'Séquestre Libéré (Terminé)';
      case 'DISPUTED': return 'Sous Arbitrage';
      case 'CANCELLED': return 'Annulé / Remboursé';
      default: return status;
    }
  }

  getDecisionLabel(decision?: string): string {
    switch (decision) {
      case 'FULL_REFUND_CLIENT': return 'Remboursement 100% Client';
      case 'FULL_PAYMENT_CREATOR': return 'Paiement 100% Créateur';
      case 'PARTIAL_SPLIT': return 'Répartition Partielle';
      default: return decision || 'Résolu';
    }
  }

  inspectEvidence(fileName: string): void {
    alert(`Opening evidentiary file viewer for: ${fileName}`);
  }

  openDecisionModal(d: Dispute, decision: DisputeResolution['decision']): void {
    this.selectedDispute.set(d);
    this.rulingType.set(decision);
    this.rulingNotes = `Arbitration finding: Ruling based on review of project brief requirements, verified timestamps, and submitted 4K ProRes deliverables.`;

    if (decision === 'PARTIAL_SPLIT') {
      this.splitClient = Math.round(d.amountDisputed * 0.5);
      this.splitCreator = Math.round(d.amountDisputed * 0.4);
    }
  }

  executeRuling(): void {
    const d = this.selectedDispute();
    const decision = this.rulingType();
    if (!d || !decision) return;

    let clientAmt = 0;
    let creatorAmt = 0;
    let feeAmt = 0;

    if (decision === 'FULL_REFUND_CLIENT') {
      clientAmt = d.amountDisputed;
    } else if (decision === 'FULL_PAYMENT_CREATOR') {
      creatorAmt = d.amountDisputed * 0.9;
      feeAmt = d.amountDisputed * 0.1;
    } else if (decision === 'PARTIAL_SPLIT') {
      clientAmt = this.splitClient;
      creatorAmt = this.splitCreator;
      feeAmt = d.amountDisputed - (clientAmt + creatorAmt);
    }

    const resolution: DisputeResolution = {
      decision,
      clientRefundAmount: clientAmt,
      creatorPayoutAmount: creatorAmt,
      platformFeeAmount: feeAmt,
      adminNotes: this.rulingNotes,
      resolvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      resolvedBy: 'Admin (Mediation Lead)'
    };

    this.disputeService.resolveDispute(d.id, resolution).subscribe({
      next: () => {
        this.selectedDispute.set(null);
        this.rulingType.set(null);
        alert(`Arbitrage exécuté ! Le litige #${d.id} a été clôturé et les transferts financiers appliqués.`);
      },
      error: () => {
        this.selectedDispute.set(null);
        this.rulingType.set(null);
        alert(`Arbitrage exécuté en mode local.`);
      }
    });
  }
}
