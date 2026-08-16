import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Job, JobCreateRequest, JobListResponse, JobStatus } from '../models/job.model';

const API = 'http://localhost:8080/api/jobs';

export interface JobSearchParams {
  query?: string;
  categoryId?: string;
  budgetType?: string;
  budgetMin?: number;
  budgetMax?: number;
  location?: string;
  isRemote?: boolean;
  status?: JobStatus;
  clientId?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class JobService {

  readonly jobs      = signal<Job[]>([]);
  readonly total     = signal<number>(0);
  readonly currentJob = signal<Job | null>(null);
  readonly isLoading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  search(params: JobSearchParams = {}): Observable<JobListResponse> {
    this.isLoading.set(true);
    let hp = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') hp = hp.set(k, String(v));
    });
    return this.http.get<JobListResponse>(API, { params: hp }).pipe(
      tap(res => {
        this.jobs.set(res.jobs);
        this.total.set(res.total);
        this.isLoading.set(false);
      })
    );
  }

  getById(id: string): Observable<Job> {
    return this.http.get<Job>(`${API}/${id}`).pipe(
      tap(j => this.currentJob.set(j))
    );
  }

  create(data: JobCreateRequest): Observable<Job> {
    return this.http.post<Job>(API, data);
  }

  update(id: string, data: Partial<JobCreateRequest>): Observable<Job> {
    return this.http.put<Job>(`${API}/${id}`, data);
  }

  updateStatus(id: string, status: JobStatus): Observable<Job> {
    return this.http.patch<Job>(`${API}/${id}/status`, { status });
  }

  close(id: string): Observable<void> {
    return this.http.patch<void>(`${API}/${id}/close`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }

  getByClientId(clientId: string): Observable<JobListResponse> {
    return this.search({ clientId });
  }
}
