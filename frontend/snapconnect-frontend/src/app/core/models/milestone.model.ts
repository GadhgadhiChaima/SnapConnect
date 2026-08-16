/* Milestone domain model */
export type MilestoneStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'PAID';

export interface Milestone {
  id?: string;
  contractId?: string;
  title: string;
  description?: string;
  amount: number;
  dueDate?: string;
  status: MilestoneStatus;
  completedAt?: string;
  paidAt?: string;
}
