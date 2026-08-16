/* Job domain model — Model A */
export type BudgetType   = 'FIXED' | 'HOURLY';
export type JobStatus    = 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'DELIVERY_REVIEW' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

export interface Job {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  clientRating?: number;
  categoryId?: string;
  categoryName?: string;
  title: string;
  description: string;
  budgetType: BudgetType;
  budgetMin?: number;
  budgetMax?: number;
  budgetAmount?: number;
  deadline?: string;
  location: string;
  isRemote: boolean;
  requiredGear?: string;
  requiredSkills?: string[];
  deliverables?: string[];
  references?: string[];
  status: JobStatus;
  proposalsCount: number;
  viewsCount?: number;
  postedDate: string;
  expiresAt?: string;
}

export interface JobCreateRequest {
  categoryId?: string;
  title: string;
  description: string;
  budgetType: BudgetType;
  budgetMin?: number;
  budgetMax?: number;
  budgetAmount?: number;
  deadline?: string;
  location: string;
  isRemote: boolean;
  requiredGear?: string;
  requiredSkills?: string[];
  deliverables?: string[];
}

export interface JobListResponse {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
}
