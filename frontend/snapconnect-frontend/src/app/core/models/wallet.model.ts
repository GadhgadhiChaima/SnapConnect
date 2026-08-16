/* Wallet & Transaction Ledger domain model */

export type TransactionType =
  | 'DEPOSIT'             // Client deposits money
  | 'PAYMENT'             // Order payment initiated
  | 'ESCROW_HOLD'         // Funds locked in Escrow
  | 'ESCROW_RELEASE'      // Escrow released to creator
  | 'REFUND'              // Full refund to client
  | 'PARTIAL_REFUND'      // Partial refund split
  | 'PLATFORM_FEE'        // SnapConnect commission deduction
  | 'WITHDRAWAL'          // Creator payout withdrawal
  | 'CANCELLATION'        // Cancellation settlement
  | 'DISPUTE_ADJUSTMENT'; // Dispute arbitration settlement

export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'HELD' | 'RELEASED' | 'REFUNDED';

export interface WalletTransaction {
  id: string;
  txRef: string;
  date: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  projectId?: string;
  projectTitle?: string;
  counterpartyId?: string;
  counterpartyName?: string;
  platformFee?: number;
  paymentMethod?: string;
  description: string;
}

export interface ClientWallet {
  userId: string;
  balance: number;           // Available balance ready to spend
  fundsInEscrow: number;     // Currently locked in active contracts
  totalSpent: number;        // Lifetime investment
  totalRefunded: number;     // Lifetime refunds
  currency: string;
  transactions: WalletTransaction[];
}

export interface CreatorWallet {
  userId: string;
  availableBalance: number;  // Ready to withdraw to bank
  pendingEscrow: number;     // Locked in active shoots pending approval
  totalEarnings: number;     // Lifetime gross earnings
  totalWithdrawn: number;    // Lifetime withdrawn to bank
  platformFeesPaid: number;  // Lifetime fees
  currency: string;
  transactions: WalletTransaction[];
}
