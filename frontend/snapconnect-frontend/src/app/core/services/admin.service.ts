import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080/api/admin';

export interface PlatformStats {
  totalUsers: number;
  totalCreators: number;
  totalClients: number;
  totalJobs: number;
  totalServices: number;
  totalContracts: number;
  totalRevenue: number;
  activeContracts: number;
  pendingReports: number;
  newUsersThisMonth: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {

  constructor(private http: HttpClient) {}

  getStats(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(`${API}/stats`);
  }

  /* User management */
  banUser(userId: string, reason: string): Observable<void> {
    return this.http.patch<void>(`${API}/users/${userId}/ban`, { reason });
  }

  unbanUser(userId: string): Observable<void> {
    return this.http.patch<void>(`${API}/users/${userId}/unban`, {});
  }

  verifyCreator(creatorId: string): Observable<void> {
    return this.http.patch<void>(`${API}/creators/${creatorId}/verify`, {});
  }

  /* Content moderation */
  takedownJob(jobId: string, reason: string): Observable<void> {
    return this.http.patch<void>(`${API}/jobs/${jobId}/takedown`, { reason });
  }

  takedownService(serviceId: string, reason: string): Observable<void> {
    return this.http.patch<void>(`${API}/services/${serviceId}/takedown`, { reason });
  }

  deleteReview(reviewId: string): Observable<void> {
    return this.http.delete<void>(`${API}/reviews/${reviewId}`);
  }
}
