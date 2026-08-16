import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ClientProfile } from '../models/client.model';

const API = 'http://localhost:8080/api/clients';

@Injectable({ providedIn: 'root' })
export class ClientService {

  readonly profile = signal<ClientProfile | null>(null);

  constructor(private http: HttpClient) {}

  getProfile(userId: string): Observable<ClientProfile> {
    return this.http.get<ClientProfile>(`${API}/${userId}`).pipe(
      tap(c => this.profile.set(c))
    );
  }

  updateProfile(userId: string, data: Partial<ClientProfile>): Observable<ClientProfile> {
    return this.http.patch<ClientProfile>(`${API}/${userId}`, data).pipe(
      tap(c => this.profile.set(c))
    );
  }
}
