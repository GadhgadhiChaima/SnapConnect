import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';

const API = 'http://localhost:8080/api/users';

@Injectable({ providedIn: 'root' })
export class UserService {

  readonly profile = signal<User | null>(null);

  constructor(private http: HttpClient) {}

  getProfile(userId: string): Observable<User> {
    return this.http.get<User>(`${API}/${userId}`).pipe(
      tap(u => this.profile.set(u))
    );
  }

  updateProfile(userId: string, data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${API}/${userId}`, data).pipe(
      tap(u => this.profile.set(u))
    );
  }

  uploadAvatar(userId: string, file: File): Observable<{ avatarUrl: string }> {
    const form = new FormData();
    form.append('avatar', file);
    return this.http.post<{ avatarUrl: string }>(`${API}/${userId}/avatar`, form);
  }
}
