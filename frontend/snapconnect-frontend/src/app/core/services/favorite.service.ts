import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Favorite, FavoriteEntityType, FavoriteListResponse } from '../models/favorite.model';

const API = 'http://localhost:8080/api/favorites';

@Injectable({ providedIn: 'root' })
export class FavoriteService {

  readonly favorites = signal<Favorite[]>([]);

  constructor(private http: HttpClient) {}

  getAll(): Observable<FavoriteListResponse> {
    return this.http.get<FavoriteListResponse>(API).pipe(
      tap(res => this.favorites.set(res.favorites))
    );
  }

  isFavorited(entityType: FavoriteEntityType, entityId: string): boolean {
    return this.favorites().some(f => f.entityType === entityType && f.entityId === entityId);
  }

  toggle(entityType: FavoriteEntityType, entityId: string): Observable<Favorite | void> {
    if (this.isFavorited(entityType, entityId)) {
      return this.remove(entityType, entityId);
    }
    return this.add(entityType, entityId);
  }

  add(entityType: FavoriteEntityType, entityId: string): Observable<Favorite> {
    return this.http.post<Favorite>(API, { entityType, entityId }).pipe(
      tap(fav => this.favorites.update(prev => [...prev, fav]))
    );
  }

  remove(entityType: FavoriteEntityType, entityId: string): Observable<void> {
    return this.http.delete<void>(`${API}/${entityType}/${entityId}`).pipe(
      tap(() => this.favorites.update(prev =>
        prev.filter(f => !(f.entityType === entityType && f.entityId === entityId))
      ))
    );
  }

  getByType(type: FavoriteEntityType): Favorite[] {
    return this.favorites().filter(f => f.entityType === type);
  }
}
