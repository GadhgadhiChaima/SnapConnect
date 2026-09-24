import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080/api/admin';

export interface PlatformStats {
  totalUsers: number;
  totalCreators: number;
  totalClients: number;
  totalJobs: number;
  totalContracts: number;
  activeContracts: number;
  activeJobs: number;
  verifiedCreators: number;
  escrowInTransit: number;
  platformRevenue: number;
  totalPaymentsVolume: number;
  activeDisputes: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
  role?: string;
  badgeClass: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {

  constructor(private http: HttpClient) {}

  getStats(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(`${API}/stats`);
  }

  getRecentActivities(): Observable<RecentActivity[]> {
    return this.http.get<RecentActivity[]>(`${API}/recent-activities`);
  }

  /* User management */
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${API}/users`);
  }

  toggleUserStatus(userId: string): Observable<any> {
    return this.http.patch<any>(`${API}/users/${userId}/toggle-status`, {});
  }

  verifyHardware(userId: string, smartphoneModel?: string): Observable<any> {
    return this.http.patch<any>(`${API}/users/${userId}/verify-hardware`, { smartphoneModel });
  }

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

  /* Payouts (Retraits créateurs) */
  getPayouts(): Observable<any[]> {
    return this.http.get<any[]>(`${API}/payouts`);
  }

  approvePayout(id: string): Observable<any> {
    return this.http.patch<any>(`${API}/payouts/${id}/approve`, {});
  }

  rejectPayout(id: string, reason?: string): Observable<any> {
    return this.http.patch<any>(`${API}/payouts/${id}/reject`, { reason });
  }

  /* Platform Governance Settings */
  getSettings(): Observable<any> {
    return this.http.get<any>(`${API}/settings`);
  }

  updateSettings(settings: any): Observable<any> {
    return this.http.put<any>(`${API}/settings`, settings);
  }

  /* Reports & Trust */
  getReports(): Observable<any[]> {
    return this.http.get<any[]>(`${API}/reports`);
  }

  resolveReport(id: string, action: string, note?: string): Observable<any> {
    return this.http.patch<any>(`${API}/reports/${id}/resolve`, { action, note });
  }
}
