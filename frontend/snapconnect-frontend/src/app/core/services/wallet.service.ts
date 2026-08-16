import { Injectable, signal } from '@angular/core';
import { ClientWallet, CreatorWallet, WalletTransaction } from '../models/wallet.model';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  /* Client Wallet State */
  clientWallet = signal<ClientWallet>({
    userId: 'cl-1',
    balance: 420,
    fundsInEscrow: 250,
    totalSpent: 1850,
    totalRefunded: 0,
    currency: 'USD',
    transactions: [
      {
        id: 'tx-101',
        txRef: 'TX-2026-0091',
        date: '2026-08-12 14:30',
        type: 'ESCROW_HOLD',
        amount: 250,
        currency: 'USD',
        status: 'HELD',
        projectId: 'ct-1',
        projectTitle: '5 Aesthetic Unboxing Reels for Skincare Brand',
        counterpartyName: 'Sarah Jenkins',
        description: 'Payment locked in Escrow for Contract #ct-1'
      },
      {
        id: 'tx-100',
        txRef: 'TX-2026-0085',
        date: '2026-08-01 11:15',
        type: 'ESCROW_RELEASE',
        amount: 180,
        currency: 'USD',
        status: 'SUCCEEDED',
        projectId: 'ct-prev',
        projectTitle: 'Restaurant 15 Macro Photos + 2 Reels',
        counterpartyName: 'Marc Dupont',
        description: 'Funds released upon project approval'
      },
      {
        id: 'tx-99',
        txRef: 'TX-2026-0072',
        date: '2026-07-28 09:00',
        type: 'DEPOSIT',
        amount: 600,
        currency: 'USD',
        status: 'SUCCEEDED',
        description: 'Card deposit to client wallet'
      }
    ]
  });

  /* Creator Wallet State */
  creatorWallet = signal<CreatorWallet>({
    userId: 'cr-1',
    availableBalance: 850,
    pendingEscrow: 225,
    totalEarnings: 3450,
    totalWithdrawn: 2375,
    platformFeesPaid: 345,
    currency: 'USD',
    transactions: [
      {
        id: 'tx-201',
        txRef: 'TX-2026-0092',
        date: '2026-08-12 14:35',
        type: 'ESCROW_HOLD',
        amount: 225,
        currency: 'USD',
        status: 'HELD',
        projectId: 'ct-1',
        projectTitle: '3 Viral UGC TikToks for Skincare Line',
        counterpartyName: 'Bloom Cosmetics',
        platformFee: 25,
        description: 'Client payment secured in Escrow. Shoot in progress.'
      },
      {
        id: 'tx-200',
        txRef: 'TX-2026-0080',
        date: '2026-08-05 16:00',
        type: 'ESCROW_RELEASE',
        amount: 360,
        currency: 'USD',
        status: 'SUCCEEDED',
        projectId: 'ct-prev2',
        projectTitle: 'Fashion Lookbook 4K 60fps',
        counterpartyName: 'Urban Chic Studio',
        platformFee: 40,
        description: 'Deliverables approved. Earnings credited.'
      },
      {
        id: 'tx-199',
        txRef: 'TX-2026-0065',
        date: '2026-07-30 18:20',
        type: 'WITHDRAWAL',
        amount: 800,
        currency: 'USD',
        status: 'SUCCEEDED',
        description: 'Bank transfer payout to Bank Account (**** 4891)'
      }
    ]
  });

  /* Release Escrow to Creator */
  releaseEscrow(contractId: string, amount: number, platformFeeRate: number = 0.10): void {
    const fee = amount * platformFeeRate;
    const net = amount - fee;

    // Update Client Wallet
    this.clientWallet.update(w => ({
      ...w,
      fundsInEscrow: Math.max(0, w.fundsInEscrow - amount),
      totalSpent: w.totalSpent + amount,
      transactions: [
        {
          id: 'tx-' + Date.now(),
          txRef: 'TX-' + Math.floor(1000 + Math.random() * 9000),
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          type: 'ESCROW_RELEASE',
          amount: amount,
          currency: w.currency,
          status: 'RELEASED',
          projectId: contractId,
          description: `Escrow released to creator for Contract #${contractId}`
        },
        ...w.transactions
      ]
    }));

    // Update Creator Wallet
    this.creatorWallet.update(w => ({
      ...w,
      pendingEscrow: Math.max(0, w.pendingEscrow - net),
      availableBalance: w.availableBalance + net,
      totalEarnings: w.totalEarnings + amount,
      platformFeesPaid: w.platformFeesPaid + fee,
      transactions: [
        {
          id: 'tx-' + Date.now(),
          txRef: 'TX-' + Math.floor(1000 + Math.random() * 9000),
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          type: 'ESCROW_RELEASE',
          amount: net,
          platformFee: fee,
          currency: w.currency,
          status: 'SUCCEEDED',
          projectId: contractId,
          description: `Payment released. Net $${net} credited to available balance.`
        },
        ...w.transactions
      ]
    }));
  }

  /* Request Creator Withdrawal */
  requestWithdrawal(amount: number): boolean {
    if (amount <= 0 || amount > this.creatorWallet().availableBalance) return false;

    this.creatorWallet.update(w => ({
      ...w,
      availableBalance: w.availableBalance - amount,
      totalWithdrawn: w.totalWithdrawn + amount,
      transactions: [
        {
          id: 'tx-' + Date.now(),
          txRef: 'TX-WD-' + Math.floor(1000 + Math.random() * 9000),
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          type: 'WITHDRAWAL',
          amount: amount,
          currency: w.currency,
          status: 'PROCESSING',
          description: `Withdrawal request of $${amount} to bank account.`
        },
        ...w.transactions
      ]
    }));

    return true;
  }
}
