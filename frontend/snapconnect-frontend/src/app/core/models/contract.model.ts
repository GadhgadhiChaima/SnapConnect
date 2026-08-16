/* Contract domain model — unified for Model A (Job) and Model B (Service) */
import { Milestone } from './milestone.model';

export type ContractType   = 'JOB' | 'SERVICE';
export type ContractStatus = 'PENDING' | 'ACTIVE' | 'DELIVERY' | 'REVISION' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

export interface DeliveryAttachment {
  url: string;
  name: string;
  type: 'IMAGE' | 'VIDEO' | 'FILE';
}

export interface Delivery {
  id: string;
  contractId: string;
  creatorId: string;
  note?: string;
  attachments?: DeliveryAttachment[];
  links?: string[];
  status: 'SUBMITTED' | 'APPROVED' | 'REVISION_REQUESTED';
  revisionNote?: string;
  submittedAt: string;
  resolvedAt?: string;
}

export interface Contract {
  id: string;
  type: ContractType;
  clientId: string;
  clientName?: string;
  clientAvatar?: string;
  creatorId: string;
  creatorName?: string;
  creatorAvatar?: string;
  /* Job contract fields */
  jobId?: string;
  jobTitle?: string;
  proposalId?: string;
  /* Service contract fields */
  serviceId?: string;
  serviceTitle?: string;
  servicePackageId?: string;
  orderId?: string;
  /* Shared */
  title: string;
  description?: string;
  amount: number;
  platformFee?: number;
  creatorEarnings?: number;
  startDate?: string;
  deadline?: string;
  status: ContractStatus;
  milestones?: Milestone[];
  deliveries?: Delivery[];
  revisionsAllowed?: number;
  revisionsUsed?: number;
  createdAt: string;
  completedAt?: string;
}

export interface ContractListResponse {
  contracts: Contract[];
  total: number;
  page: number;
  pageSize: number;
}
