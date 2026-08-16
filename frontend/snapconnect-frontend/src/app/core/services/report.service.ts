import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Report, ReportCreateRequest, ReportListResponse, ReportStatus } from '../models/report.model';

const API = 'http://localhost:8080/api/reports';

@Injectable({ providedIn: 'root' })
export class ReportService {

  constructor(private http: HttpClient) {}

  submit(data: ReportCreateRequest): Observable<Report> {
    return this.http.post<Report>(API, data);
  }

  /* Admin only */
  getAll(params: { status?: ReportStatus; page?: number; pageSize?: number } = {}): Observable<ReportListResponse> {
    return this.http.get<ReportListResponse>(API, { params: params as any });
  }

  getById(id: string): Observable<Report> {
    return this.http.get<Report>(`${API}/${id}`);
  }

  resolve(id: string, adminNote?: string): Observable<Report> {
    return this.http.patch<Report>(`${API}/${id}/resolve`, { adminNote });
  }

  dismiss(id: string, adminNote?: string): Observable<Report> {
    return this.http.patch<Report>(`${API}/${id}/dismiss`, { adminNote });
  }
}
