/* Milestone domain model */
export type MilestoneStatus = 'PENDING' | 'ACTIVE' | 'FUNDED' | 'COMPLETED' | 'PAID';

export interface Milestone {
  id?: string;
  contractId?: string;
  title: string;
  description?: string;
  amount: number;
  dueDate?: string;
  status: MilestoneStatus;
  order?: number;
  completedAt?: string;
  paidAt?: string;
}
