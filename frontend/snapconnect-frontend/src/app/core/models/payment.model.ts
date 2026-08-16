/* Payment domain model */
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  contractId: string;
  contractTitle?: string;
  payerId: string;
  payerName?: string;
  payeeId: string;
  payeeName?: string;
  amount: number;
  platformFee?: number;
  creatorEarnings?: number;
  currency: string;
  status: PaymentStatus;
  method?: string;
  transactionRef?: string;
  createdAt: string;
  settledAt?: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  pendingPayout: number;
  thisMonthEarnings: number;
  completedProjectsCount: number;
  currency: string;
}

export interface PaymentListResponse {
  payments: Payment[];
  total: number;
  page: number;
  pageSize: number;
}
