import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError, map } from 'rxjs';
import { Dispute, DisputeResolution, DisputeMessage, UserSanction } from '../models/dispute.model';

const ADMIN_DISPUTES_API = 'http://localhost:8080/api/admin/disputes';
const ADMIN_SANCTIONS_API = 'http://localhost:8080/api/admin/sanctions';
const DISPUTES_API = 'http://localhost:8080/api/disputes';
const CONTRACTS_API = 'http://localhost:8080/api/contracts';

@Injectable({
  providedIn: 'root'
})
export class DisputeService {
  private http = inject(HttpClient);

  readonly disputes = signal<Dispute[]>([]);
  readonly isLoading = signal<boolean>(false);

  constructor() {
    this.loadDisputes();
  }

  loadDisputes(): void {
    this.isLoading.set(true);
    this.http.get<any[]>(ADMIN_DISPUTES_API).pipe(
      tap(backendList => {
        if (Array.isArray(backendList) && backendList.length > 0) {
          const mapped: Dispute[] = backendList.map(b => this.mapBackendDispute(b));
          this.disputes.set(mapped);
        } else {
          this.disputes.set([]);
        }
        this.isLoading.set(false);
      }),
      catchError(() => {
        this.isLoading.set(false);
        return of([]);
      })
    ).subscribe();
  }

  mapBackendDispute(b: any): Dispute {
    return {
      id: String(b.id),
      contractId: String(b.contractId),
      contractTitle: b.contractTitle || 'Mission #' + b.contractId,
      openedByUserId: String(b.openedByUserId),
      openedByName: b.openedByName || 'Demandeur',
      openedByRole: b.openedByRole || 'CLIENT',
      respondentId: String(b.respondentId),
      respondentName: b.respondentName || 'Partie Adverse',
      amountDisputed: b.amountDisputed != null ? b.amountDisputed : 250,
      currency: b.currency || 'DT',
      reason: b.reason || 'Réclamation',
      description: b.description || '',
      status: b.status || 'OPEN',
      responseDeadline: b.responseDeadline,
      lastResponseAt: b.lastResponseAt,
      lastResponseByRole: b.lastResponseByRole,
      sanctionApplied: b.sanctionApplied,
      remainingSeconds: b.remainingSeconds,
      isExpired: b.isExpired,
      alertLevel: b.alertLevel || (b.isExpired ? 'EXPIRED' : 'NORMAL'),
      evidence: b.evidenceUrl ? [{
        id: `ev-${b.id}`,
        uploaderId: String(b.openedByUserId),
        uploaderName: b.openedByName || '',
        uploaderRole: b.openedByRole || 'CLIENT',
        fileUrl: b.evidenceUrl,
        fileName: b.evidenceName || 'Preuve_Livrable',
        fileType: 'IMAGE',
        note: b.evidenceNote || '',
        uploadedAt: b.createdAt || new Date().toISOString()
      }] : [],
      timeline: [
        {
          id: `tl-${b.id}-1`,
          timestamp: b.createdAt ? b.createdAt.replace('T', ' ').slice(0, 16) : new Date().toISOString().slice(0, 16),
          actor: b.openedByRole || 'CLIENT',
          actorName: b.openedByName || 'Demandeur',
          title: 'Réclamation ouverte',
          description: (b.reason || '') + ' : ' + (b.description || '')
        }
      ],
      resolution: b.decision ? {
        decision: b.decision,
        clientRefundAmount: b.clientRefundAmount || 0,
        creatorPayoutAmount: b.creatorPayoutAmount || 0,
        platformFeeAmount: 0,
        adminNotes: b.adminNotes || '',
        resolvedAt: b.resolvedAt ? b.resolvedAt.replace('T', ' ').slice(0, 16) : '',
        resolvedBy: b.resolvedBy || 'Admin'
      } : undefined,
      createdAt: b.createdAt ? b.createdAt.replace('T', ' ').slice(0, 16) : new Date().toISOString().slice(0, 16),
      updatedAt: b.updatedAt ? b.updatedAt.replace('T', ' ').slice(0, 16) : new Date().toISOString().slice(0, 16)
    };
  }

  getDispute(id: string | number): Observable<Dispute | null> {
    const numId = String(id).replace(/\D/g, '');
    return this.http.get<any>(`${DISPUTES_API}/${numId}`).pipe(
      map(b => this.mapBackendDispute(b)),
      catchError(() => of(null))
    );
  }

  getContractDispute(contractId: string | number): Observable<Dispute | null> {
    const numId = String(contractId).replace(/\D/g, '');
    return this.http.get<any>(`${DISPUTES_API}/contract/${numId}`).pipe(
      map(b => b ? this.mapBackendDispute(b) : null),
      catchError(() => of(null))
    );
  }

  getMyDisputes(): Observable<Dispute[]> {
    return this.http.get<any[]>(`${DISPUTES_API}/my`).pipe(
      map(list => (list || []).map(b => this.mapBackendDispute(b))),
      catchError(() => of([]))
    );
  }

  getDisputeMessages(disputeId: string | number): Observable<DisputeMessage[]> {
    const numId = String(disputeId).replace(/\D/g, '');
    return this.http.get<DisputeMessage[]>(`${DISPUTES_API}/${numId}/messages`).pipe(
      catchError(() => of([]))
    );
  }

  sendDisputeMessage(
    disputeId: string | number,
    payload: { content: string; attachmentUrl?: string; attachmentName?: string; attachmentType?: string }
  ): Observable<DisputeMessage | null> {
    const numId = String(disputeId).replace(/\D/g, '');
    return this.http.post<DisputeMessage>(`${DISPUTES_API}/${numId}/messages`, payload).pipe(
      catchError(() => of(null))
    );
  }

  openDispute(
    contractId: string | number,
    data: { reason: string; description: string; evidenceUrl?: string; evidenceName?: string; evidenceNote?: string }
  ): Observable<any> {
    const numId = String(contractId).replace(/\D/g, '');
    return this.http.post<any>(`${CONTRACTS_API}/${numId}/dispute`, data).pipe(
      tap(() => this.loadDisputes())
    );
  }

  resolveDispute(disputeId: string | number, resolution: DisputeResolution): Observable<any> {
    const numId = String(disputeId).replace(/\D/g, '');
    return this.http.post<any>(`${ADMIN_DISPUTES_API}/${numId}/resolve`, {
      decision: resolution.decision,
      adminNotes: resolution.adminNotes,
      clientRefundAmount: resolution.clientRefundAmount,
      creatorPayoutAmount: resolution.creatorPayoutAmount
    }).pipe(
      tap(() => this.loadDisputes()),
      catchError(() => of(null))
    );
  }

  applySanction(
    disputeId: string | number,
    sanction: { userId: number; sanctionType: string; reason: string }
  ): Observable<UserSanction | null> {
    const numId = String(disputeId).replace(/\D/g, '');
    return this.http.post<UserSanction>(`${ADMIN_DISPUTES_API}/${numId}/sanction`, sanction).pipe(
      tap(() => this.loadDisputes()),
      catchError(() => of(null))
    );
  }

  getSanctions(): Observable<UserSanction[]> {
    return this.http.get<UserSanction[]>(ADMIN_SANCTIONS_API).pipe(
      catchError(() => of([]))
    );
  }

  revokeSanction(sanctionId: number): Observable<any> {
    return this.http.post<any>(`${ADMIN_SANCTIONS_API}/${sanctionId}/revoke`, {}).pipe(
      catchError(() => of(null))
    );
  }
}
