import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ContractService } from '../../../core/services/contract.service';
import { AuthService } from '../../../core/services/auth.service';
import { Contract, ContractStatus } from '../../../core/models/contract.model';

@Component({
  selector: 'app-client-contracts',
  standalone: true,
  imports: [RouterLink, SlicePipe, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="contracts-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header flex-between">
          <div>
            <span class="badge badge-primary">Espace Contrats</span>
            <h1>Contrats actifs & Espace Séquestre</h1>
            <p>Suivez l'avancement de la production, inspectez les fichiers 4K livrés et libérez les paiements sous séquestre.</p>
          </div>
          <div class="header-actions">
            <a routerLink="/client/jobs/create" class="btn btn-primary btn-md">
              + Publier une mission
            </a>
            <a routerLink="/creators" class="btn btn-outline btn-md">
              Trouver un Créateur
            </a>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="filter-tabs card-glass">
          <button
            class="tab-btn"
            [class.active]="selectedTab() === 'ALL'"
            (click)="selectedTab.set('ALL')"
          >
            Tous ({{ totalCount() }})
          </button>
          <button
            class="tab-btn"
            [class.active]="selectedTab() === 'ACTIVE'"
            (click)="selectedTab.set('ACTIVE')"
          >
            En tournage ({{ activeCount() }})
          </button>
          <button
            class="tab-btn"
            [class.active]="selectedTab() === 'DELIVERY'"
            (click)="selectedTab.set('DELIVERY')"
          >
            Livrables déposés ({{ deliveryCount() }})
          </button>
          <button
            class="tab-btn"
            [class.active]="selectedTab() === 'COMPLETED'"
            (click)="selectedTab.set('COMPLETED')"
          >
            Terminés ({{ completedCount() }})
          </button>
        </div>

        <!-- Contracts List -->
        @if (filteredContracts().length > 0) {
          <div class="contracts-list">
            @for (c of filteredContracts(); track c.id) {
              <div class="contract-card card-glass animate-fade-in">
                <div class="card-top flex-between">
                  <div class="type-badge-group">
                    <span class="badge badge-primary">{{ c.type === 'JOB' ? 'Brief Sur Mesure' : 'Package Service' }}</span>
                    <span class="badge" [class]="getStatusClass(c.status)">● {{ getStatusLabel(c.status) }}</span>
                  </div>
                  <span class="escrow-amt" [class.completed]="c.status === 'COMPLETED'">
                    {{ c.amount }} DT {{ c.status === 'COMPLETED' ? 'Libérés' : 'en Séquestre' }}
                  </span>
                </div>

                <h3 class="contract-title">{{ c.title }}</h3>

                <div class="parties-strip">
                  <a [routerLink]="['/creators', c.creatorId || 'cr-1']" class="creator-avatar-link" title="Voir le profil du créateur">
                    <img
                      [src]="c.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'"
                      [alt]="c.creatorName"
                      class="avatar avatar-sm avatar-ring"
                    />
                  </a>
                  <span>Créateur : 
                    <a [routerLink]="['/creators', c.creatorId || 'cr-1']" class="creator-name-link" title="Voir le profil complet">
                      <strong>{{ c.creatorName }}</strong>
                    </a>
                  </span>
                  <span class="dot">•</span>
                  <span>Date limite : <strong>{{ c.deadline || 'Sous 7 jours' }}</strong></span>
                </div>

                <div class="card-footer flex-between">
                  <span class="contract-id">ID : #{{ c.id }} • Créé le {{ c.createdAt | slice:0:10 }}</span>
                  <a [routerLink]="['/client/contracts', c.id]" class="btn btn-primary btn-sm">
                    Accéder à l'espace contrat & fichiers →
                  </a>
                </div>
              </div>
            }
          </div>
        } @else {
          <!-- Empty State -->
          <div class="empty-state card-glass animate-scale-in">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-primary-400);">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3>Aucun contrat dans cette catégorie</h3>
            <p>Embauchez un créateur smartphone à partir de vos propositions ou commandez un package clé en main.</p>
            <div class="empty-actions">
              <a routerLink="/client/jobs" class="btn btn-primary btn-sm">
                Consulter mes briefs & propositions
              </a>
              <a routerLink="/creators" class="btn btn-outline btn-sm">
                Trouver un créateur
              </a>
            </div>
          </div>
        }
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .contracts-page {
      padding-top: calc(var(--navbar-height) + var(--space-8));
      padding-bottom: var(--space-20);
    }

    .page-header {
      margin-bottom: var(--space-6);
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

    .header-actions {
      display: flex;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    /* Filter Tabs */
    .filter-tabs {
      display: flex;
      gap: var(--space-2);
      padding: var(--space-2);
      border-radius: var(--radius-xl);
      margin-bottom: var(--space-6);
      overflow-x: auto;
    }

    .tab-btn {
      background: transparent;
      border: none;
      color: var(--color-text-secondary);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-lg);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
    }

    .tab-btn:hover {
      color: var(--color-text-primary);
      background: rgba(255, 255, 255, 0.05);
    }

    .tab-btn.active {
      background: var(--color-primary-light);
      color: var(--color-primary-300);
      font-weight: var(--font-weight-bold);
      border: 1px solid rgba(139, 92, 246, 0.3);
    }

    .contracts-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .contract-card {
      padding: var(--space-6) var(--space-8);
      border-radius: var(--radius-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .type-badge-group {
      display: flex;
      gap: var(--space-2);
    }

    .escrow-amt {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-black);
      color: var(--color-success);
    }

    .escrow-amt.completed {
      color: var(--color-text-secondary);
    }

    .contract-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      margin: 0;
    }

    .parties-strip {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      flex-wrap: wrap;
    }

    .parties-strip strong {
      color: var(--color-text-primary);
    }

    .creator-avatar-link {
      display: inline-flex;
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: transform var(--transition-fast);
    }

    .creator-avatar-link:hover {
      transform: scale(1.08);
    }

    .creator-name-link {
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }

    .creator-name-link:hover strong {
      color: var(--color-primary-300);
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .dot {
      color: var(--color-text-muted);
    }

    .card-footer {
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border-subtle);
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .contract-id {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .empty-state {
      text-align: center;
      padding: var(--space-12) var(--space-6);
      border-radius: var(--radius-2xl);
    }

    .empty-icon {
      margin-bottom: var(--space-4);
    }

    .empty-state h3 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-2);
    }

    .empty-state p {
      color: var(--color-text-secondary);
      margin-bottom: var(--space-6);
    }

    .empty-actions {
      display: flex;
      gap: var(--space-3);
      justify-content: center;
      flex-wrap: wrap;
    }
  `]
})
export class ClientContractsComponent implements OnInit {
  private contractService = inject(ContractService);
  private auth = inject(AuthService);

  selectedTab = signal<'ALL' | 'ACTIVE' | 'DELIVERY' | 'COMPLETED'>('ALL');

  ngOnInit(): void {
    this.contractService.refresh();
  }

  // Filtered by current client
  clientContracts = computed(() => {
    const user = this.auth.currentUser();
    const all = this.contractService.contracts();
    if (!user) return all;
    const isDemoClient = String(user.id) === '1' || user.id === 'cl-1' || user.email?.toLowerCase().includes('client');

    return all.filter(c =>
      c.clientId === user.id ||
      c.clientName === user.fullName ||
      c.clientId === 'cl-current' ||
      (isDemoClient && (c.clientId === 'cl-1' || c.clientName?.includes('Maison Alyssa') || c.clientId === '1')) ||
      !c.clientId
    );
  });

  totalCount = computed(() => this.clientContracts().length);
  activeCount = computed(() => this.clientContracts().filter(c => c.status === 'ACTIVE').length);
  deliveryCount = computed(() => this.clientContracts().filter(c => c.status === 'DELIVERY' || c.status === 'REVISION').length);
  completedCount = computed(() => this.clientContracts().filter(c => c.status === 'COMPLETED').length);

  filteredContracts = computed(() => {
    const tab = this.selectedTab();
    const list = this.clientContracts();
    if (tab === 'ALL') return list;
    if (tab === 'ACTIVE') return list.filter(c => c.status === 'ACTIVE');
    if (tab === 'DELIVERY') return list.filter(c => c.status === 'DELIVERY' || c.status === 'REVISION');
    if (tab === 'COMPLETED') return list.filter(c => c.status === 'COMPLETED');
    return list;
  });

  getStatusClass(status: ContractStatus | string): string {
    switch (status) {
      case 'COMPLETED': return 'badge-success';
      case 'ACTIVE': return 'badge-primary';
      case 'DELIVERY': return 'badge-accent';
      case 'REVISION': return 'badge-warning';
      case 'DISPUTED': return 'badge-danger';
      default: return 'badge-neutral';
    }
  }

  getStatusLabel(status: ContractStatus | string): string {
    switch (status) {
      case 'COMPLETED': return 'Terminé';
      case 'ACTIVE': return 'En tournage';
      case 'DELIVERY': return 'Livrables déposés';
      case 'REVISION': return 'En révision';
      case 'DISPUTED': return 'En litige';
      default: return status;
    }
  }
}

