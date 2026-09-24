import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Proposal, ProposalSubmitRequest, ProposalListResponse, ProposalStatus } from '../models/proposal.model';
import { User } from '../models/user.model';
import { JobService } from './job.service';
import { AuthService } from './auth.service';

const API = 'http://localhost:8080/api/proposals';
const STORAGE_KEY = 'snapconnect_proposals';

const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'prop-1',
    jobId: 'jb-1',
    jobTitle: 'Besoin de 10 Photos Produits Esthétiques & 3 Reels Unboxing (iPhone 15/16)',
    creatorId: 'cr-1',
    creatorName: 'Sarah Ben Salem',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    creatorRating: 4.95,
    bidAmount: 250,
    deliveryDays: 2,
    coverLetter: 'Bonjour Maison Alyssa ! Spécialiste des unboxings et contenus beauté viraux sur iPhone 16 Pro Max en 4K ProRes Log. J\'utilise des mouvements stabilisés et un éclairage boîte à lumière pour sublimer les textures cosmétiques. Livraison complète sous 48h !',
    equipmentConfirmed: 'iPhone 16 Pro Max • DJI OM 6 • Rode Wireless Pro (32-bit float)',
    status: 'SUBMITTED',
    createdAt: '2026-08-12'
  },
  {
    id: 'prop-2',
    jobId: 'jb-1',
    jobTitle: 'Besoin de 10 Photos Produits Esthétiques & 3 Reels Unboxing (iPhone 15/16)',
    creatorId: 'cr-2',
    creatorName: 'Mehdi Trabelsi',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    creatorRating: 5.0,
    bidAmount: 220,
    deliveryDays: 3,
    coverLetter: 'Bonjour ! J\'ai réalisé plus de 30 reels de soins et cosmétiques sur Galaxy S24 Ultra avec objectifs macro. Je fournis les montages avec sous-titres animés. Prêt à tourner dès ce week-end à Tunis !',
    equipmentConfirmed: 'Samsung Galaxy S24 Ultra • Zhiyun Smooth 5S • DJI Mic 2',
    status: 'SUBMITTED',
    createdAt: '2026-08-13'
  },
  {
    id: 'prop-3',
    jobId: 'jb-2',
    jobTitle: 'Vidéaste Mobile pour Service du Soir & Préparation Chef',
    creatorId: 'cr-3',
    creatorName: 'Yassine Gharbi',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    creatorRating: 4.88,
    bidAmount: 110,
    deliveryDays: 1,
    coverLetter: 'Vidéaste culinaire à Tunis avec plus de 40 reels de restaurants et salons de thé sur iPhone 16 Pro. J\'apporte mes panneaux LED bicolores pour la basse lumière du restaurant.',
    equipmentConfirmed: 'iPhone 16 Pro + Zhiyun Smooth 5 + Aputure Amaran MC',
    status: 'SUBMITTED',
    createdAt: '2026-08-14'
  }
];

@Injectable({ providedIn: 'root' })
export class ProposalService {
  private jobService = inject(JobService);
  private auth = inject(AuthService);

  readonly proposals       = signal<Proposal[]>(this.loadProposals());
  readonly total           = signal<number>(this.proposals().length);
  readonly currentProposal = signal<Proposal | null>(null);
  readonly isLoading       = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  /** Force reload proposals from storage */
  refresh(): Proposal[] {
    const list = this.loadProposals();
    this.proposals.set(list);
    this.total.set(list.length);
    return list;
  }

  getByJobId(jobId: string | number, params: { page?: number; pageSize?: number } = {}): Observable<ProposalListResponse> {
    this.isLoading.set(true);
    const jId = String(jobId || '').trim();
    const list = this.loadProposals().filter(p => String(p.jobId || '').trim() === jId);
    this.proposals.set(this.loadProposals());
    this.isLoading.set(false);
    return of({
      proposals: list,
      total: list.length,
      page: params.page || 1,
      pageSize: params.pageSize || 10
    });
  }

  getProposalsForJob(jobId: string | number): Observable<ProposalListResponse> {
    return this.getByJobId(jobId);
  }

  /**
   * Vérifie de manière robuste si le créateur a déjà postulé à une mission donnée.
   * Compare l'identifiant de la mission ainsi que l'id, le nom ou l'email du créateur.
   */
  hasCreatorApplied(jobId?: string | number | null, user?: User | null): boolean {
    if (!jobId || !user) return false;
    return !!this.getProposalForJobAndCreator(jobId, user);
  }

  /**
   * Récupère la proposition déposée par le créateur sur une mission précise.
   */
  getProposalForJobAndCreator(jobId?: string | number | null, user?: User | null): Proposal | null {
    if (!jobId || !user) return null;
    const jId = String(jobId).trim();
    const userIdStr = user.id ? String(user.id).trim() : '';
    const userEmail = (user.email || '').trim().toLowerCase();
    const userName = (user.fullName || '').trim().toLowerCase();

    const list = this.loadProposals();
    const found = list.find(p => {
      const pJobId = String(p.jobId || '').trim();
      if (pJobId !== jId) return false;

      const pCreatorId = String(p.creatorId || '').trim();
      const pCreatorName = (p.creatorName || '').trim().toLowerCase();

      const matchId = userIdStr && pCreatorId && (pCreatorId === userIdStr || pCreatorId === 'cr-current');
      const matchName = userName && pCreatorName && (pCreatorName === userName || pCreatorName.includes(userName) || userName.includes(pCreatorName));
      const matchEmail = userEmail && pCreatorName && pCreatorName.includes(userEmail);

      return matchId || matchName || matchEmail;
    });

    return found || null;
  }

  getByCreatorId(creatorId: string): Observable<ProposalListResponse> {
    const list = this.loadProposals().filter(p => String(p.creatorId) === String(creatorId) || creatorId === 'all');
    return of({
      proposals: list,
      total: list.length,
      page: 1,
      pageSize: 50
    });
  }

  getById(id: string): Observable<Proposal> {
    const currentList = this.loadProposals();
    const p = currentList.find(item => item.id === id) || currentList[0];
    this.currentProposal.set(p);
    return of(p);
  }

  submit(data: ProposalSubmitRequest): Observable<Proposal> {
    const user = this.auth.currentUser();

    // Règle métier : Un créateur ne peut soumettre qu'UNE SEULE proposition pour une même mission
    if (this.hasCreatorApplied(data.jobId, user)) {
      const existing = this.getProposalForJobAndCreator(data.jobId, user);
      if (existing) {
        return of(existing);
      }
    }

    const newProposal: Proposal = {
      id: `prop-${Date.now()}`,
      jobId: String(data.jobId),
      jobTitle: data.jobTitle || 'Custom Mobile Shoot Brief',
      creatorId: user?.id ? String(user.id) : 'cr-2',
      creatorName: user?.fullName || 'Créateur Mobile',
      creatorAvatar: (user ? this.auth.getDedicatedAvatar(user.id, user.email) : '') || this.auth.cleanAvatar(user?.avatarUrl) || '',
      creatorRating: 5.0,
      bidAmount: data.bidAmount,
      deliveryDays: data.deliveryDays || data.estimatedDays || 2,
      equipmentConfirmed: data.equipmentConfirmed || data.creatorEquipment || user?.smartphoneModel || 'iPhone 16 Pro Max (4K ProRes)',
      coverLetter: data.coverLetter,
      sampleLinks: data.sampleLinks || [],
      milestones: data.milestones,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const currentList = this.loadProposals();
    const updated = [newProposal, ...currentList.filter(p => p.id !== newProposal.id)];
    this.persistProposals(updated);
    this.proposals.set(updated);
    this.total.set(updated.length);

    // Increment proposal count on job
    this.jobService.incrementProposalCount(data.jobId);

    // Synchronisation en tâche de fond avec le backend Spring Boot si IDs numériques
    try {
      const numJobId = Number(data.jobId);
      const numCreatorId = user?.id ? Number(user.id) : null;
      if (numJobId && !isNaN(numJobId) && numCreatorId && !isNaN(numCreatorId)) {
        this.http.post<any>(API, {
          jobId: numJobId,
          creatorId: numCreatorId,
          creatorName: newProposal.creatorName,
          creatorAvatar: newProposal.creatorAvatar,
          bidAmount: newProposal.bidAmount,
          deliveryDays: newProposal.deliveryDays,
          coverLetter: newProposal.coverLetter,
          gearDetails: newProposal.equipmentConfirmed
        }).subscribe({
          next: () => {},
          error: () => {}
        });
      }
    } catch {}

    return of(newProposal);
  }

  submitProposal(data: ProposalSubmitRequest): Observable<Proposal> {
    return this.submit(data);
  }

  updateStatus(id: string, status: ProposalStatus): Observable<Proposal> {
    const list = this.proposals().map(p => p.id === id ? { ...p, status } : p);
    this.persistProposals(list);
    this.proposals.set(list);
    const updated = list.find(p => p.id === id)!;
    return of(updated);
  }

  accept(id: string): Observable<Proposal> {
    return this.updateStatus(id, 'ACCEPTED');
  }

  acceptProposal(id: string): Observable<Proposal> {
    return this.accept(id);
  }

  reject(id: string): Observable<Proposal> {
    return this.updateStatus(id, 'REJECTED');
  }

  shortlist(id: string): Observable<Proposal> {
    const list = this.proposals().map(p => p.id === id ? { ...p, isShortlisted: true } : p);
    this.persistProposals(list);
    this.proposals.set(list);
    const updated = list.find(p => p.id === id)!;
    return of(updated);
  }

  withdraw(id: string): Observable<Proposal> {
    return this.updateStatus(id, 'WITHDRAWN');
  }

  private loadProposals(): Proposal[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(p => {
            if (p.creatorName === 'You (Creator Studio)') {
              return {
                ...p,
                creatorName: 'Mehdi Trabelsi',
                creatorId: (p.creatorId === 'cr-current' || !p.creatorId) ? 'cr-2' : p.creatorId,
                creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
              };
            }
            return p;
          });
        }
      }
    } catch {}
    this.persistProposals(INITIAL_PROPOSALS);
    return INITIAL_PROPOSALS;
  }

  private persistProposals(proposals: Proposal[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
    } catch {}
  }
}
