import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Service, ServiceListResponse, ServiceStatus } from '../models/service.model';

/* Named to avoid collision with Angular's "Service" class concept */
const API = 'http://localhost:8080/api/services';

export interface ServiceSearchParams {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  deliveryDays?: number;
  minRating?: number;
  location?: string;
  isRemote?: boolean;
  creatorId?: string;
  status?: ServiceStatus;
  page?: number;
  pageSize?: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class ServiceMarketplaceService {

  readonly services    = signal<Service[]>([]);
  readonly total       = signal<number>(0);
  readonly currentService = signal<Service | null>(null);
  readonly isLoading   = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  search(params: ServiceSearchParams = {}): Observable<ServiceListResponse> {
    this.isLoading.set(true);
    let hp = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') hp = hp.set(k, String(v));
    });
    return this.http.get<ServiceListResponse>(API, { params: hp }).pipe(
      tap(res => {
        this.services.set(res.services);
        this.total.set(res.total);
        this.isLoading.set(false);
      })
    );
  }

  getById(id: string): Observable<Service> {
    return this.http.get<Service>(`${API}/${id}`).pipe(
      tap(s => this.currentService.set(s))
    );
  }

  create(data: Partial<Service>): Observable<Service> {
    return this.http.post<Service>(API, data);
  }

  update(id: string, data: Partial<Service>): Observable<Service> {
    return this.http.put<Service>(`${API}/${id}`, data);
  }

  updateStatus(id: string, status: ServiceStatus): Observable<Service> {
    return this.http.patch<Service>(`${API}/${id}/status`, { status });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }

  getByCreatorId(creatorId: string): Observable<ServiceListResponse> {
    return this.search({ creatorId });
  }
}
