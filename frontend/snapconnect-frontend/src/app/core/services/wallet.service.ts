import { Injectable, signal } from '@angular/core';
import { ClientWallet, CreatorWallet, WalletTransaction } from '../models/wallet.model';

const CLIENT_WALLET_KEY = 'snapconnect_client_wallet';
const CREATOR_WALLET_KEY = 'snapconnect_creator_wallet';

const INITIAL_CLIENT_WALLET: ClientWallet = {
  userId: 'cl-1',
  balance: 420,
  fundsInEscrow: 280,
  totalSpent: 1850,
  totalRefunded: 0,
  currency: 'DT',
  transactions: [
    {
      id: 'tx-101',
      txRef: 'TX-2026-0091',
      date: '2026-08-16 14:30',
      type: 'ESCROW_HOLD',
      amount: 280,
      currency: 'DT',
      status: 'HELD',
      projectId: 'ct-1',
      projectTitle: '4K Reels Verticaux Soins Bio (iPhone 16 Pro Max)',
      counterpartyName: 'Sarah Ben Salem',
      description: 'Paiement bloqué en Séquestre pour Contrat #ct-1'
    },
    {
      id: 'tx-100',
      txRef: 'TX-2026-0085',
      date: '2026-08-01 11:15',
      type: 'ESCROW_RELEASE',
      amount: 180,
      currency: 'DT',
      status: 'SUCCEEDED',
      projectId: 'ct-prev',
      projectTitle: 'Restaurant 15 Photos Macro + 2 Reels',
      counterpartyName: 'Mehdi Trabelsi',
      description: 'Fonds libérés après validation finale'
    },
    {
      id: 'tx-99',
      txRef: 'TX-2026-0072',
      date: '2026-07-28 09:00',
      type: 'DEPOSIT',
      amount: 600,
      currency: 'DT',
      status: 'SUCCEEDED',
      description: 'Dépôt par carte bancaire sur le wallet'
    }
  ]
};

const INITIAL_CREATOR_WALLET: CreatorWallet = {
  userId: 'cr-1',
  availableBalance: 850,
  pendingEscrow: 252,
  totalEarnings: 3450,
  totalWithdrawn: 2375,
  platformFeesPaid: 345,
  currency: 'DT',
  transactions: [
    {
      id: 'tx-201',
      txRef: 'TX-2026-0092',
      date: '2026-08-16 14:35',
      type: 'ESCROW_HOLD',
      amount: 252,
      currency: 'DT',
      status: 'HELD',
      projectId: 'ct-1',
      projectTitle: '4K Reels Verticaux Soins Bio (iPhone 16 Pro Max)',
      counterpartyName: 'Maison Alyssa Cosmétiques Bio',
      platformFee: 28,
      description: 'Paiement client sécurisé en Séquestre. Tournage en cours.'
    },
    {
      id: 'tx-200',
      txRef: 'TX-2026-0080',
      date: '2026-08-05 16:00',
      type: 'ESCROW_RELEASE',
      amount: 360,
      currency: 'DT',
      status: 'SUCCEEDED',
      projectId: 'ct-prev2',
      projectTitle: 'Lookbook Mode Streetwear 4K 60fps',
      counterpartyName: 'L\'Atelier Tunisien Couture',
      platformFee: 40,
      description: 'Livrables validés. Gains crédités.'
    },
    {
      id: 'tx-199',
      txRef: 'TX-2026-0065',
      date: '2026-07-30 18:20',
      type: 'WITHDRAWAL',
      amount: 800,
      currency: 'DT',
      status: 'SUCCEEDED',
      description: 'Virement bancaire vers compte BIAT (RIB: **** 8920)'
    }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  /* Client Wallet State */
  clientWallet = signal<ClientWallet>(this.loadClientWallet());

  /* Creator Wallet State */
  creatorWallet = signal<CreatorWallet>(this.loadCreatorWallet());

  /* Release Escrow to Creator */
  releaseEscrow(contractId: string, amount: number, platformFeeRate: number = 0.10): void {
    const fee = Math.round(amount * platformFeeRate);
    const net = amount - fee;

    // Update Client Wallet
    const updatedClient: ClientWallet = {
      ...this.clientWallet(),
      fundsInEscrow: Math.max(0, this.clientWallet().fundsInEscrow - amount),
      totalSpent: this.clientWallet().totalSpent + amount,
      transactions: [
        {
          id: 'tx-' + Date.now(),
          txRef: 'TX-' + Math.floor(1000 + Math.random() * 9000),
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          type: 'ESCROW_RELEASE',
          amount: amount,
          currency: this.clientWallet().currency,
          status: 'RELEASED',
          projectId: contractId,
          description: `Séquestre libéré au créateur pour Contrat #${contractId}`
        },
        ...this.clientWallet().transactions
      ]
    };
    this.persistClientWallet(updatedClient);
    this.clientWallet.set(updatedClient);

    // Update Creator Wallet
    const updatedCreator: CreatorWallet = {
      ...this.creatorWallet(),
      pendingEscrow: Math.max(0, this.creatorWallet().pendingEscrow - net),
      availableBalance: this.creatorWallet().availableBalance + net,
      totalEarnings: this.creatorWallet().totalEarnings + amount,
      platformFeesPaid: this.creatorWallet().platformFeesPaid + fee,
      transactions: [
        {
          id: 'tx-' + Date.now(),
          txRef: 'TX-' + Math.floor(1000 + Math.random() * 9000),
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          type: 'ESCROW_RELEASE',
          amount: net,
          platformFee: fee,
          currency: this.creatorWallet().currency,
          status: 'SUCCEEDED',
          projectId: contractId,
          description: `Paiement libéré. Net ${net} DT crédités sur le solde disponible.`
        },
        ...this.creatorWallet().transactions
      ]
    };
    this.persistCreatorWallet(updatedCreator);
    this.creatorWallet.set(updatedCreator);
  }

  /* Request Creator Withdrawal */
  requestWithdrawal(amount: number): boolean {
    if (amount <= 0 || amount > this.creatorWallet().availableBalance) return false;

    const updated: CreatorWallet = {
      ...this.creatorWallet(),
      availableBalance: this.creatorWallet().availableBalance - amount,
      totalWithdrawn: this.creatorWallet().totalWithdrawn + amount,
      transactions: [
        {
          id: 'tx-' + Date.now(),
          txRef: 'TX-WD-' + Math.floor(1000 + Math.random() * 9000),
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          type: 'WITHDRAWAL',
          amount: amount,
          currency: this.creatorWallet().currency,
          status: 'PROCESSING',
          description: `Demande de retrait bancaire de ${amount} DT.`
        },
        ...this.creatorWallet().transactions
      ]
    };
    this.persistCreatorWallet(updated);
    this.creatorWallet.set(updated);

    return true;
  }

  private loadClientWallet(): ClientWallet {
    try {
      const raw = localStorage.getItem(CLIENT_WALLET_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.balance === 'number') {
          parsed.currency = 'DT';
          if (parsed.transactions) {
            parsed.transactions.forEach((t: any) => t.currency = 'DT');
          }
          return parsed;
        }
      }
    } catch {}
    this.persistClientWallet(INITIAL_CLIENT_WALLET);
    return INITIAL_CLIENT_WALLET;
  }

  private persistClientWallet(wallet: ClientWallet): void {
    try {
      localStorage.setItem(CLIENT_WALLET_KEY, JSON.stringify(wallet));
    } catch {}
  }

  private loadCreatorWallet(): CreatorWallet {
    try {
      const raw = localStorage.getItem(CREATOR_WALLET_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.availableBalance === 'number') {
          parsed.currency = 'DT';
          if (parsed.transactions) {
            parsed.transactions.forEach((t: any) => t.currency = 'DT');
          }
          return parsed;
        }
      }
    } catch {}
    this.persistCreatorWallet(INITIAL_CREATOR_WALLET);
    return INITIAL_CREATOR_WALLET;
  }

  private persistCreatorWallet(wallet: CreatorWallet): void {
    try {
      localStorage.setItem(CREATOR_WALLET_KEY, JSON.stringify(wallet));
    } catch {}
  }
}
