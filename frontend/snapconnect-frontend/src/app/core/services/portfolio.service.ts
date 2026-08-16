import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { PortfolioItem, PortfolioItemCreateRequest, PortfolioListResponse } from '../models/portfolio.model';

const API = 'http://localhost:8080/api/portfolio';

@Injectable({ providedIn: 'root' })
export class PortfolioService {

  readonly items     = signal<PortfolioItem[]>([]);
  readonly total     = signal<number>(0);
  readonly isLoading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  getByCreatorId(creatorId: string): Observable<PortfolioListResponse> {
    this.isLoading.set(true);
    return this.http.get<PortfolioListResponse>(`${API}?creatorId=${creatorId}`).pipe(
      tap(res => {
        this.items.set(res.items);
        this.total.set(res.total);
        this.isLoading.set(false);
      })
    );
  }

  create(data: PortfolioItemCreateRequest): Observable<PortfolioItem> {
    return this.http.post<PortfolioItem>(API, data).pipe(
      tap(item => this.items.update(prev => [item, ...prev]))
    );
  }

  update(id: string, data: Partial<PortfolioItemCreateRequest>): Observable<PortfolioItem> {
    return this.http.put<PortfolioItem>(`${API}/${id}`, data).pipe(
      tap(updated => this.items.update(prev => prev.map(i => i.id === id ? updated : i)))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`).pipe(
      tap(() => this.items.update(prev => prev.filter(i => i.id !== id)))
    );
  }

  reorder(ids: string[]): Observable<void> {
    return this.http.patch<void>(`${API}/reorder`, { ids });
  }

  toggleFeatured(id: string): Observable<PortfolioItem> {
    return this.http.patch<PortfolioItem>(`${API}/${id}/feature`, {}).pipe(
      tap(updated => this.items.update(prev => prev.map(i => i.id === id ? updated : i)))
    );
  }
}
