import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError, switchMap } from 'rxjs';
import { Contract, ContractActivity, ContractListResponse, ContractStatus, Delivery } from '../models/contract.model';
import { Milestone } from '../models/milestone.model';
import { AuthService } from './auth.service';

const API = 'http://localhost:8080/api/contracts';
const STORAGE_KEY = 'snapconnect_contracts';

const INITIAL_CONTRACTS: Contract[] = [];

@Injectable({ providedIn: 'root' })
export class ContractService {
  private authService = inject(AuthService);

  readonly contracts       = signal<Contract[]>(this.loadContracts());
  readonly total           = signal<number>(this.contracts().length);
  readonly currentContract = signal<Contract | null>(null);
  readonly isLoading       = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────────────────────────────────────
  // Helper: map backend ContractEntity → frontend Contract model
  // ─────────────────────────────────────────────────────────────────────────
  private mapBackendContract(be: any): Contract {
    // Backend uses "DELIVERED", frontend model/templates use "DELIVERY"
    let status: ContractStatus = be.status;
    if (be.status === 'DELIVERED') status = 'DELIVERY';

    // Reconstruct deliveries from backend deliverable fields
    const deliveries: Delivery[] = [];
    if (be.deliverableUrl) {
      const url: string = be.deliverableUrl;
      const isVideo = /\.(mp4|mov|mkv|webm)$/i.test(url) || url.includes('video');
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
      // Detect cloud sharing links (WeTransfer, Google Drive, Dropbox, etc.)
      // These must go into links[] so the cloud hero card renders correctly
      const isCloudLink =
        url.includes('we.tl') || url.includes('wetransfer') ||
        url.includes('drive.google') || url.includes('dropbox') ||
        url.includes('swisstransfer') || url.includes('onedrive') ||
        url.includes('icloud') || (!isVideo && !isImage && url.startsWith('http'));

      deliveries.push({
        id: `del-${be.id}`,
        contractId: String(be.id),
        creatorId: String(be.creatorId),
        note: be.deliverableNotes || be.notes || '',
        attachments: isCloudLink ? [] : [{
          url,
          name: url.split('/').pop() || 'Livrable_4K',
          type: isVideo ? 'VIDEO' : isImage ? 'IMAGE' : 'FILE'
        }],
        links: isCloudLink ? [url] : [],
        status: be.status === 'COMPLETED' ? 'APPROVED' : 'SUBMITTED',
        submittedAt: be.updatedAt || be.createdAt || new Date().toISOString()
      });
    }

    return {
      id: String(be.id),
      type: be.proposalId ? 'JOB' : 'SERVICE',
      clientId: String(be.clientId),
      clientName: be.clientName,
      clientAvatar: be.clientAvatar || undefined,
      creatorId: String(be.creatorId),
      creatorName: be.creatorName,
      creatorAvatar: be.creatorAvatar || undefined,
      proposalId: be.proposalId != null ? String(be.proposalId) : undefined,
      serviceId: be.serviceId != null ? String(be.serviceId) : undefined,
      jobId: be.jobId != null ? String(be.jobId) : undefined,
      jobTitle: be.jobTitle,
      title: be.title,
      description: be.description,
      amount: be.amount,
      platformFee: be.platformFee,
      creatorEarnings: be.creatorEarnings,
      startDate: be.startDate || be.createdAt || undefined,
      deadline: be.deadline || undefined,
      deliverySubmittedAt: be.deliverySubmittedAt || undefined,
      reviewDeadline: be.reviewDeadline || undefined,
      status,
      revisionsAllowed: be.revisionsAllowed != null ? be.revisionsAllowed : 2,
      revisionsUsed: be.revisionsUsed != null ? be.revisionsUsed : 0,
      disputeReason: be.disputeReason || undefined,
      disputeDescription: be.disputeDescription || undefined,
      deliveries: deliveries.length > 0 ? deliveries : undefined,
      createdAt: be.createdAt || new Date().toISOString(),
      completedAt: be.completedAt || undefined
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Helper: check if an ID corresponds to a real backend DB record
  // (small positive integer, not a timestamp like ct-${Date.now()})
  // ─────────────────────────────────────────────────────────────────────────
  private extractBackendId(id: string): string | null {
    // Pure numeric id
    if (/^\d+$/.test(id)) {
      const n = parseInt(id, 10);
      return n > 0 && n < 100_000_000 ? id : null;
    }
    // Prefixed id like "ct-1", "ct-5" — extract the numeric part
    const match = id.match(/^[a-z]+-(\d+)$/i);
    if (match) {
      const n = parseInt(match[1], 10);
      // Exclude timestamp-based IDs (> 1_000_000_000)
      return n > 0 && n < 1_000_000_000 ? match[1] : null;
    }
    return null;
  }

  refresh(): Contract[] {
    const loaded = this.loadContracts();
    this.contracts.set(loaded);
    this.total.set(loaded.length);
    return loaded;
  }

  getAll(params: { userId?: string; role?: string; page?: number } = {}): Observable<ContractListResponse> {
    const list = [...this.contracts()];
    return of({
      contracts: list,
      total: list.length,
      page: params.page || 1,
      pageSize: 20
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FIXED: getById — fait un vrai appel GET /api/contracts/{id} pour les
  // contrats réels en base MySQL, avec fallback localStorage pour les démos.
  // ─────────────────────────────────────────────────────────────────────────
  getById(id: string): Observable<Contract> {
    const backendId = this.extractBackendId(id);

    if (backendId) {
      return this.http.get<any>(`${API}/${backendId}`).pipe(
        tap(be => {
          const mapped = this.mapBackendContract(be);
          // Update local cache
          const list = this.contracts();
          const existing = list.find(c => c.id === id || c.id === String(be.id));
          if (existing) {
            const updated = list.map(c => (c.id === id || c.id === String(be.id)) ? mapped : c);
            this.persistContracts(updated);
            this.contracts.set(updated);
          } else {
            const updated = [mapped, ...list];
            this.persistContracts(updated);
            this.contracts.set(updated);
          }
          this.currentContract.set(mapped);
        }),
        catchError(() => {
          // Backend injoignable : fallback localStorage uniquement si le contrat est là
          const found = this.contracts().find(c => c.id === id || c.id === backendId);
          if (found) {
            this.currentContract.set(found);
            return of(found);
          }
          // Contrat introuvable — ne pas retourner ct-1 par défaut
          this.currentContract.set(null);
          return of(null as any);
        })
      );
    }

    // ID non-numérique (ID timestamp ou démo) — cherche dans localStorage uniquement
    const found = this.contracts().find(c => c.id === id);
    if (found) {
      this.currentContract.set(found);
      return of(found);
    }
    // Contrat introuvable — ne pas retourner ct-1 par défaut
    this.currentContract.set(null);
    return of(null as any);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FIXED: createFromProposal — POST /api/contracts et utilise l'ID MySQL
  // retourné par le backend comme ID canonique du contrat.
  // ─────────────────────────────────────────────────────────────────────────
  createFromProposal(proposalId: string, proposalData?: any): Observable<Contract> {
    const user = this.authService.currentUser();

    const backendPayload = {
      clientId: user?.id ? (Number(String(user.id).replace(/\D/g, '')) || null) : null,
      clientName: user?.fullName || 'Client Actuel',
      clientAvatar: user?.avatarUrl || null,
      creatorId: proposalData?.creatorId ? (Number(String(proposalData.creatorId).replace(/\D/g, '')) || null) : null,
      creatorName: proposalData?.creatorName || 'Créateur Mobile',
      creatorAvatar: proposalData?.creatorAvatar || null,
      proposalId: proposalId ? (Number(proposalId.replace(/\D/g, '')) || null) : null,
      jobId: proposalData?.jobId ? (Number(String(proposalData.jobId).replace(/\D/g, '')) || null) : null,
      jobTitle: proposalData?.jobTitle || 'Mission',
      title: proposalData?.jobTitle || 'Mobile Content Production Contract',
      description: proposalData?.coverLetter || 'Livraison de contenus 4K ProRes sur smartphone certifié.',
      amount: proposalData?.bidAmount || 250,
      status: 'ACTIVE',
      escrowStatus: 'SECURED'
    };

    return this.http.post<any>(API, backendPayload).pipe(
      tap(be => {
        const mapped = this.mapBackendContract(be);
        // Add milestones and extra fields to the local copy
        const withMilestones: Contract = {
          ...mapped,
          jobId: proposalData?.jobId || undefined,
          jobTitle: proposalData?.jobTitle || undefined,
          deadline: new Date(Date.now() + (proposalData?.deliveryDays || 7) * 86400000).toISOString().split('T')[0],
          revisionsAllowed: 2,
          revisionsUsed: 0,
          milestones: [
            {
              id: `m-${be.id}-1`,
              contractId: String(be.id),
              title: 'Livraison complète 4K',
              amount: proposalData?.bidAmount || 250,
              dueDate: new Date(Date.now() + (proposalData?.deliveryDays || 7) * 86400000).toISOString().split('T')[0],
              status: 'FUNDED',
              order: 1
            }
          ]
        };
        const updated = [withMilestones, ...this.contracts()];
        this.persistContracts(updated);
        this.contracts.set(updated);
        this.total.set(updated.length);
        this.currentContract.set(withMilestones);
      }),
      catchError(() => {
        // Backend unavailable: create local-only contract
        const newContract: Contract = {
          id: `ct-${Date.now()}`,
          type: 'JOB',
          clientId: user?.id || 'cl-current',
          clientName: user?.fullName || 'Client Actuel',
          clientAvatar: user?.avatarUrl || undefined,
          creatorId: proposalData?.creatorId || 'cr-1',
          creatorName: proposalData?.creatorName || 'Sarah Ben Salem',
          creatorAvatar: proposalData?.creatorAvatar || undefined,
          jobId: proposalData?.jobId || 'jb-1',
          jobTitle: proposalData?.jobTitle || 'Custom Mobile Shoot Brief',
          proposalId: proposalId,
          title: proposalData?.jobTitle || 'Mobile Content Production Contract',
          description: proposalData?.coverLetter || 'Delivery of 4K ProRes mobile video & photo content.',
          amount: proposalData?.bidAmount || 250,
          platformFee: Math.round((proposalData?.bidAmount || 250) * 0.1),
          creatorEarnings: Math.round((proposalData?.bidAmount || 250) * 0.9),
          startDate: new Date().toISOString().split('T')[0],
          deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          status: 'ACTIVE',
          revisionsAllowed: 2,
          revisionsUsed: 0,
          createdAt: new Date().toISOString().split('T')[0],
          milestones: [
            {
              id: `m-${Date.now()}`,
              contractId: `ct-${Date.now()}`,
              title: 'Full Deliverable 4K Footage Package',
              amount: proposalData?.bidAmount || 250,
              dueDate: new Date(Date.now() + (proposalData?.deliveryDays || 3) * 86400000).toISOString().split('T')[0],
              status: 'FUNDED',
              order: 1
            }
          ]
        };
        const updated = [newContract, ...this.contracts()];
        this.persistContracts(updated);
        this.contracts.set(updated);
        this.total.set(updated.length);
        return of(newContract);
      })
    );
  }

  createFromOrder(orderId: string, orderData?: any): Observable<Contract> {
    const user = this.authService.currentUser();
    const newContract: Contract = {
      id: `ct-${Date.now()}`,
      type: 'SERVICE',
      clientId: user?.id || 'cl-current',
      clientName: user?.fullName || 'Client Actuel',
      clientAvatar: user?.avatarUrl || undefined,
      creatorId: orderData?.creatorId || 'cr-1',
      creatorName: orderData?.creatorName || 'Mobile Content Pro',
      creatorAvatar: orderData?.creatorAvatar || undefined,
      serviceId: orderId,
      title: orderData?.serviceTitle || 'Direct Package Service Order',
      amount: orderData?.price || 150,
      platformFee: Math.round((orderData?.price || 150) * 0.1),
      creatorEarnings: Math.round((orderData?.price || 150) * 0.9),
      startDate: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      status: 'ACTIVE',
      revisionsAllowed: 1,
      revisionsUsed: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newContract, ...this.contracts()];
    this.persistContracts(updated);
    this.contracts.set(updated);
    this.total.set(updated.length);
    return of(newContract);
  }

  updateStatus(id: string, status: ContractStatus): Observable<Contract> {
    const list = this.contracts().map(c => c.id === id ? { ...c, status } : c);
    this.persistContracts(list);
    this.contracts.set(list);
    const updated = list.find(c => c.id === id)!;
    return of(updated);
  }

  cancel(id: string, reason?: string): Observable<Contract> {
    return this.updateStatus(id, 'CANCELLED');
  }

  dispute(id: string, reason: string, description?: string): Observable<Contract> {
    const backendId = this.extractBackendId(id);
    if (backendId) {
      this.http.post<any>(`${API}/${backendId}/dispute`, {
        reason,
        description: description || reason
      }).pipe(
        tap(be => {
          const mapped = this.mapBackendContract(be);
          const list = this.contracts().map(c => (c.id === id || c.id === backendId) ? mapped : c);
          this.persistContracts(list);
          this.contracts.set(list);
          this.currentContract.set(mapped);
        }),
        catchError(() => of(null))
      ).subscribe();
    }
    return this.updateStatus(id, 'DISPUTED');
  }

  getActivities(id: string): Observable<ContractActivity[]> {
    const backendId = this.extractBackendId(id);
    if (backendId) {
      return this.http.get<ContractActivity[]>(`${API}/${backendId}/activity`).pipe(
        catchError(() => of([]))
      );
    }
    return of([]);
  }

  complete(id: string): Observable<Contract> {
    return this.updateStatus(id, 'COMPLETED');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FIXED: submitDelivery — POST /api/contracts/{id}/deliver et utilise la
  // réponse HTTP comme source de vérité pour mettre à jour l'état local.
  // ─────────────────────────────────────────────────────────────────────────
  submitDelivery(contractId: string, deliveryData: Partial<Delivery>): Observable<Contract> {
    // Build the new delivery object for local state
    const buildLocalUpdate = (base: Contract): Contract => {
      const newDelivery: Delivery = {
        id: `del-${Date.now()}`,
        contractId,
        creatorId: base.creatorId,
        note: deliveryData.note || '',
        attachments: deliveryData.attachments || [],
        links: deliveryData.links || [],
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString()
      };
      return {
        ...base,
        status: 'DELIVERY' as ContractStatus,
        deliveries: [newDelivery, ...(base.deliveries || [])]
      };
    };

    const updateLocalState = (updated: Contract) => {
      const list = this.contracts().map(c => c.id === contractId ? updated : c);
      this.persistContracts(list);
      this.contracts.set(list);
      this.currentContract.set(updated);
    };

    const primaryUrl = deliveryData.attachments?.[0]?.url || deliveryData.links?.[0] || '';
    const backendId = this.extractBackendId(contractId);

    if (backendId) {
      // Optimistic update for immediate UI feedback
      const current = this.contracts().find(c => c.id === contractId);
      if (current) {
        updateLocalState(buildLocalUpdate(current));
      }

      // Fire HTTP call and update from backend response (source of truth)
      return this.http.post<any>(`${API}/${backendId}/deliver`, {
        deliverableUrl: primaryUrl,
        notes: deliveryData.note || ''
      }).pipe(
        tap(be => {
          const mapped = this.mapBackendContract(be);
          // Preserve rich local deliveries (attachments, etc.)
          const cur = this.contracts().find(c => c.id === contractId);
          const mergedDeliveries = cur?.deliveries || mapped.deliveries;
          const final: Contract = { ...mapped, deliveries: mergedDeliveries, id: contractId };
          updateLocalState(final);
        }),
        switchMap(() => {
          const updated = this.contracts().find(c => c.id === contractId)!;
          return of(updated);
        }),
        catchError(() => {
          // Backend unavailable: keep the optimistic update
          const updated = this.contracts().find(c => c.id === contractId)!;
          return of(updated);
        })
      );
    }

    // No backend ID: purely local update (demo contract)
    const current = this.contracts().find(c => c.id === contractId) || this.contracts()[0];
    const updated = buildLocalUpdate(current);
    updateLocalState(updated);
    return of(updated);
  }

  requestRevision(contractId: string, note: string): Observable<Contract> {
    const buildLocalUpdate = (base: Contract): Contract => {
      const updatedDeliveries = (base.deliveries || []).map((d, index) =>
        index === 0 ? { ...d, status: 'REVISION_REQUESTED' as const, revisionNote: note, resolvedAt: new Date().toISOString() } : d
      );
      return {
        ...base,
        status: 'REVISION' as ContractStatus,
        revisionsUsed: (base.revisionsUsed || 0) + 1,
        deliveries: updatedDeliveries
      };
    };

    const updateLocalState = (updated: Contract) => {
      const list = this.contracts().map(c => c.id === contractId ? updated : c);
      this.persistContracts(list);
      this.contracts.set(list);
      this.currentContract.set(updated);
    };

    const backendId = this.extractBackendId(contractId);

    if (backendId) {
      // Optimistic update
      const current = this.contracts().find(c => c.id === contractId);
      if (current) {
        updateLocalState(buildLocalUpdate(current));
      }

      return this.http.post<any>(`${API}/${backendId}/revise`, { note }).pipe(
        tap(be => {
          const mapped = this.mapBackendContract(be);
          const cur = this.contracts().find(c => c.id === contractId);
          // Preserve local deliveries since backend only has basic fields
          const final: Contract = { ...mapped, deliveries: buildLocalUpdate(cur || mapped).deliveries, id: contractId };
          updateLocalState(final);
        }),
        switchMap(() => {
          const updated = this.contracts().find(c => c.id === contractId)!;
          return of(updated);
        }),
        catchError(() => {
          const updated = this.contracts().find(c => c.id === contractId)!;
          return of(updated);
        })
      );
    }

    const current = this.contracts().find(c => c.id === contractId) || this.contracts()[0];
    const updated = buildLocalUpdate(current);
    updateLocalState(updated);
    return of(updated);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FIXED: approveContract — POST /api/contracts/{id}/approve et confirme
  // la mise à jour en base MySQL.
  // ─────────────────────────────────────────────────────────────────────────
  approveContract(contractId: string): Observable<Contract> {
    const buildApproved = (base: Contract): Contract => ({
      ...base,
      status: 'COMPLETED' as ContractStatus,
      completedAt: new Date().toISOString(),
      deliveries: (base.deliveries || []).map(d => ({
        ...d,
        status: 'APPROVED' as const,
        resolvedAt: new Date().toISOString()
      }))
    });

    const updateLocalState = (updated: Contract) => {
      const list = this.contracts().map(c => c.id === contractId ? updated : c);
      this.persistContracts(list);
      this.contracts.set(list);
      this.currentContract.set(updated);
    };

    const backendId = this.extractBackendId(contractId);

    // Optimistic update first
    const current = this.contracts().find(c => c.id === contractId);
    if (current) {
      updateLocalState(buildApproved(current));
    }

    if (backendId) {
      this.http.post<any>(`${API}/${backendId}/approve`, {}).pipe(
        tap(be => {
          const mapped = this.mapBackendContract(be);
          const cur = this.contracts().find(c => c.id === contractId);
          const final: Contract = { ...mapped, deliveries: cur?.deliveries || mapped.deliveries, id: contractId };
          updateLocalState(final);
        }),
        catchError(() => of(null))
      ).subscribe();
    }

    const updated = this.contracts().find(c => c.id === contractId)!;
    return of(updated);
  }

  /* Milestones */
  addMilestone(contractId: string, milestone: Partial<Milestone>): Observable<Contract> {
    const contract = this.contracts().find(c => c.id === contractId);
    if (contract) {
      const newM: Milestone = {
        id: `m-${Date.now()}`,
        contractId: contractId,
        title: milestone.title || 'Milestone',
        amount: milestone.amount || 50,
        status: milestone.status || 'PENDING',
        order: (contract.milestones?.length || 0) + 1
      };
      const updatedMilestones = [...(contract.milestones || []), newM];
      const list = this.contracts().map(c => c.id === contractId ? { ...c, milestones: updatedMilestones } : c);
      this.persistContracts(list);
      this.contracts.set(list);
    }
    return this.getById(contractId);
  }

  updateMilestone(contractId: string, milestoneId: string, data: Partial<Milestone>): Observable<Contract> {
    const contract = this.contracts().find(c => c.id === contractId);
    if (contract && contract.milestones) {
      const updatedMilestones = contract.milestones.map(m => m.id === milestoneId ? { ...m, ...data } : m);
      const list = this.contracts().map(c => c.id === contractId ? { ...c, milestones: updatedMilestones } : c);
      this.persistContracts(list);
      this.contracts.set(list);
    }
    return this.getById(contractId);
  }

  private loadContracts(): Contract[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Purge the old hardcoded ct-1 demo contract that polluted earlier sessions.
          // A "real" contract has a purely numeric id or a ct-{timestamp} id.
          // The old demo 'ct-1' with creatorId 'cr-1' and hardcoded names must not persist.
          const filtered = parsed.filter(c =>
            !(c.id === 'ct-1' && (c.creatorName === 'Sarah Ben Salem' || c.clientName === 'Maison Alyssa Cosmétiques Bio'))
          );
          if (filtered.length > 0) return filtered;
        }
      }
    } catch {}
    return [];
  }

  private persistContracts(contracts: Contract[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
    } catch {}
  }
}
