import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Contract, ContractListResponse, ContractStatus } from '../models/contract.model';
import { Delivery } from '../models/contract.model';
import { Milestone } from '../models/milestone.model';

const API = 'http://localhost:8080/api/contracts';

@Injectable({ providedIn: 'root' })
export class ContractService {

  readonly contracts       = signal<Contract[]>([]);
  readonly total           = signal<number>(0);
  readonly currentContract = signal<Contract | null>(null);
  readonly isLoading       = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  getAll(params: { userId?: string; role?: string; page?: number } = {}): Observable<ContractListResponse> {
    this.isLoading.set(true);
    return this.http.get<ContractListResponse>(API, { params: params as any }).pipe(
      tap(res => {
        this.contracts.set(res.contracts);
        this.total.set(res.total);
        this.isLoading.set(false);
      })
    );
  }

  getById(id: string): Observable<Contract> {
    return this.http.get<Contract>(`${API}/${id}`).pipe(
      tap(c => this.currentContract.set(c))
    );
  }

  createFromProposal(proposalId: string): Observable<Contract> {
    return this.http.post<Contract>(`${API}/from-proposal`, { proposalId });
  }

  createFromOrder(orderId: string): Observable<Contract> {
    return this.http.post<Contract>(`${API}/from-order`, { orderId });
  }

  updateStatus(id: string, status: ContractStatus): Observable<Contract> {
    return this.http.patch<Contract>(`${API}/${id}/status`, { status });
  }

  cancel(id: string, reason?: string): Observable<Contract> {
    return this.http.patch<Contract>(`${API}/${id}/cancel`, { reason });
  }

  dispute(id: string, reason: string): Observable<Contract> {
    return this.http.patch<Contract>(`${API}/${id}/dispute`, { reason });
  }

  complete(id: string): Observable<Contract> {
    return this.updateStatus(id, 'COMPLETED');
  }

  /* Milestones */
  addMilestone(contractId: string, milestone: Partial<Milestone>): Observable<Contract> {
    return this.http.post<Contract>(`${API}/${contractId}/milestones`, milestone);
  }

  updateMilestone(contractId: string, milestoneId: string, data: Partial<Milestone>): Observable<Contract> {
    return this.http.patch<Contract>(`${API}/${contractId}/milestones/${milestoneId}`, data);
  }
}
