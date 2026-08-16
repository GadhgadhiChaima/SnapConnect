import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CreatorProfile, CreatorListResponse, Equipment } from '../models/creator.model';

const API = 'http://localhost:8080/api/creators';

export interface CreatorSearchParams {
  query?: string;
  categoryId?: string;
  location?: string;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  availableOnly?: boolean;
  smartphoneModel?: string;
  verified?: boolean;
  page?: number;
  pageSize?: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class CreatorService {

  readonly creators  = signal<CreatorProfile[]>([]);
  readonly total     = signal<number>(0);
  readonly profile   = signal<CreatorProfile | null>(null);
  readonly isLoading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  search(params: CreatorSearchParams = {}): Observable<CreatorListResponse> {
    this.isLoading.set(true);
    let hp = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') hp = hp.set(k, String(v));
    });
    return this.http.get<CreatorListResponse>(API, { params: hp }).pipe(
      tap(res => {
        this.creators.set(res.creators);
        this.total.set(res.total);
        this.isLoading.set(false);
      })
    );
  }

  getById(id: string): Observable<CreatorProfile> {
    return this.http.get<CreatorProfile>(`${API}/${id}`).pipe(
      tap(c => this.profile.set(c))
    );
  }

  updateProfile(id: string, data: Partial<CreatorProfile>): Observable<CreatorProfile> {
    return this.http.patch<CreatorProfile>(`${API}/${id}`, data).pipe(
      tap(c => this.profile.set(c))
    );
  }

  updateEquipment(creatorId: string, equipment: Partial<Equipment>): Observable<Equipment> {
    return this.http.put<Equipment>(`${API}/${creatorId}/equipment`, equipment);
  }

  updateAvailability(creatorId: string, status: string): Observable<CreatorProfile> {
    return this.http.patch<CreatorProfile>(`${API}/${creatorId}/availability`, { status });
  }
}
