/* Proposal domain model */
export type ProposalStatus = 'DRAFT' | 'SUBMITTED' | 'VIEWED' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'EXPIRED';

export interface ProposalMilestone {
  title: string;
  description?: string;
  amount: number;
  dueDate?: string;
}

export interface Proposal {
  id: string;
  jobId: string;
  jobTitle?: string;
  creatorId: string;
  creatorName?: string;
  creatorAvatar?: string;
  creatorRating?: number;
  coverLetter: string;
  bidAmount: number;
  deliveryDays: number;
  equipmentConfirmed?: string;
  sampleLinks?: string[];
  milestones?: ProposalMilestone[];
  status: ProposalStatus;
  isShortlisted?: boolean;
  viewedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProposalSubmitRequest {
  jobId: string;
  coverLetter: string;
  bidAmount: number;
  deliveryDays: number;
  equipmentConfirmed?: string;
  sampleLinks?: string[];
  milestones?: ProposalMilestone[];
}

export interface ProposalListResponse {
  proposals: Proposal[];
  total: number;
  page: number;
  pageSize: number;
}
