import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Proposal, ProposalSubmitRequest, ProposalListResponse, ProposalStatus } from '../models/proposal.model';

const API = 'http://localhost:8080/api/proposals';

@Injectable({ providedIn: 'root' })
export class ProposalService {

  readonly proposals    = signal<Proposal[]>([]);
  readonly total        = signal<number>(0);
  readonly currentProposal = signal<Proposal | null>(null);
  readonly isLoading    = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  getByJobId(jobId: string, params: { page?: number; pageSize?: number } = {}): Observable<ProposalListResponse> {
    this.isLoading.set(true);
    let hp = new HttpParams().set('jobId', jobId);
    if (params.page)     hp = hp.set('page', String(params.page));
    if (params.pageSize) hp = hp.set('pageSize', String(params.pageSize));
    return this.http.get<ProposalListResponse>(API, { params: hp }).pipe(
      tap(res => {
        this.proposals.set(res.proposals);
        this.total.set(res.total);
        this.isLoading.set(false);
      })
    );
  }

  getByCreatorId(creatorId: string): Observable<ProposalListResponse> {
    const hp = new HttpParams().set('creatorId', creatorId);
    return this.http.get<ProposalListResponse>(API, { params: hp }).pipe(
      tap(res => {
        this.proposals.set(res.proposals);
        this.total.set(res.total);
      })
    );
  }

  getById(id: string): Observable<Proposal> {
    return this.http.get<Proposal>(`${API}/${id}`).pipe(
      tap(p => this.currentProposal.set(p))
    );
  }

  submit(data: ProposalSubmitRequest): Observable<Proposal> {
    return this.http.post<Proposal>(API, data);
  }

  updateStatus(id: string, status: ProposalStatus): Observable<Proposal> {
    return this.http.patch<Proposal>(`${API}/${id}/status`, { status });
  }

  accept(id: string): Observable<Proposal> {
    return this.updateStatus(id, 'ACCEPTED');
  }

  reject(id: string): Observable<Proposal> {
    return this.updateStatus(id, 'REJECTED');
  }

  shortlist(id: string): Observable<Proposal> {
    return this.http.patch<Proposal>(`${API}/${id}/shortlist`, {});
  }

  withdraw(id: string): Observable<Proposal> {
    return this.updateStatus(id, 'WITHDRAWN');
  }
}
