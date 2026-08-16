/* Report domain model */
export type ReportEntityType = 'USER' | 'JOB' | 'SERVICE' | 'REVIEW' | 'MESSAGE';
export type ReportStatus     = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

export interface Report {
  id: string;
  reporterId: string;
  reporterName?: string;
  entityType: ReportEntityType;
  entityId: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  adminNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ReportCreateRequest {
  entityType: ReportEntityType;
  entityId: string;
  reason: string;
  description?: string;
}

export interface ReportListResponse {
  reports: Report[];
  total: number;
  page: number;
  pageSize: number;
}
